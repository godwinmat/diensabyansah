import { getAuthCookieName, verifySessionToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
    getSupabaseAdminClient,
    getSupabaseStorageBucket,
} from "@/lib/supabase-admin";
import { TestimonialType } from "@prisma/client";
import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";

const MAX_VIDEO_SIZE_BYTES = 10 * 1024 * 1024;
const ALLOWED_VIDEO_TYPES = new Set([
    "video/mp4",
    "video/quicktime",
    "video/webm",
]);

function sanitizeFileName(name: string) {
    const trimmed = name.trim();
    if (!trimmed) {
        return "upload";
    }

    return trimmed
        .toLowerCase()
        .replace(/[^a-z0-9._-]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

async function ensureBucketExists() {
    const supabase = getSupabaseAdminClient();
    const bucket = getSupabaseStorageBucket();

    if (!supabase) {
        return {
            ok: false,
            message: "Supabase storage is not configured.",
            status: 500,
        } as const;
    }

    const { data: existingBucket, error: getBucketError } =
        await supabase.storage.getBucket(bucket);

    if (!getBucketError && existingBucket) {
        if (!existingBucket.public) {
            const { error: updateBucketError } =
                await supabase.storage.updateBucket(bucket, { public: true });

            if (updateBucketError) {
                return {
                    ok: false,
                    message: `Storage bucket '${bucket}' exists but could not be updated to public access.`,
                    status: 500,
                } as const;
            }
        }

        return { ok: true, supabase, bucket } as const;
    }

    const isMissingBucket =
        (getBucketError?.message ?? "")
            .toLowerCase()
            .includes("bucket not found") || getBucketError?.statusCode === 404;

    if (!isMissingBucket) {
        return {
            ok: false,
            message: "Unable to access storage bucket.",
            status: 500,
        } as const;
    }

    const { error: createBucketError } = await supabase.storage.createBucket(
        bucket,
        {
            public: true,
        },
    );

    if (createBucketError) {
        return {
            ok: false,
            message: `Storage bucket '${bucket}' was not found and could not be created automatically.`,
            status: 500,
        } as const;
    }

    return { ok: true, supabase, bucket } as const;
}

export async function POST(request: NextRequest) {
    const token = request.cookies.get(getAuthCookieName())?.value ?? "";
    const session = verifySessionToken(token);

    if (!session) {
        return NextResponse.json(
            { message: "Authentication is required." },
            { status: 401 },
        );
    }

    const formData = await request.formData().catch(() => null);
    if (!formData) {
        return NextResponse.json(
            { message: "Invalid submission payload." },
            { status: 400 },
        );
    }

    const typeValue = String(formData.get("type") ?? "")
        .trim()
        .toUpperCase();
    const type =
        typeValue === "VIDEO" ? TestimonialType.VIDEO : TestimonialType.TEXT;

    if (type === TestimonialType.TEXT) {
        const text = String(formData.get("text") ?? "").trim();

        if (!text) {
            return NextResponse.json(
                { message: "Text testimony is required." },
                { status: 400 },
            );
        }

        await prisma.testimonial.create({
            data: {
                userId: session.sub,
                type: TestimonialType.TEXT,
                text,
            },
        });

        return NextResponse.json(
            { message: "Text testimony submitted successfully." },
            { status: 201 },
        );
    }

    const fileValue = formData.get("file");
    if (!(fileValue instanceof File)) {
        return NextResponse.json(
            { message: "Video file is required." },
            { status: 400 },
        );
    }

    if (!ALLOWED_VIDEO_TYPES.has(fileValue.type)) {
        return NextResponse.json(
            { message: "Only MP4, MOV, and WEBM video files are allowed." },
            { status: 400 },
        );
    }

    if (fileValue.size === 0 || fileValue.size > MAX_VIDEO_SIZE_BYTES) {
        return NextResponse.json(
            { message: "Video size must be between 1 byte and 10 MB." },
            { status: 400 },
        );
    }

    const bucketState = await ensureBucketExists();
    if (!bucketState.ok) {
        return NextResponse.json(
            { message: bucketState.message },
            { status: bucketState.status },
        );
    }

    const { supabase, bucket } = bucketState;
    const arrayBuffer = await fileValue.arrayBuffer();
    const fileBuffer = Buffer.from(arrayBuffer);
    const fileName = sanitizeFileName(fileValue.name || "video");
    const filePath = `testimonials/${session.sub}/${Date.now()}-${crypto.randomUUID()}-${fileName}`;

    const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, fileBuffer, {
            contentType: fileValue.type,
            upsert: false,
            cacheControl: "3600",
        });

    if (uploadError) {
        return NextResponse.json(
            { message: "Failed to upload video." },
            { status: 500 },
        );
    }

    const { data: publicData } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);
    if (!publicData?.publicUrl) {
        await supabase.storage.from(bucket).remove([filePath]);
        return NextResponse.json(
            { message: "Failed to generate video URL." },
            { status: 500 },
        );
    }

    try {
        await prisma.testimonial.create({
            data: {
                userId: session.sub,
                type: TestimonialType.VIDEO,
                videoUrl: publicData.publicUrl,
                videoPath: filePath,
            },
        });
    } catch {
        await supabase.storage.from(bucket).remove([filePath]);
        return NextResponse.json(
            { message: "Failed to save video testimony." },
            { status: 500 },
        );
    }

    return NextResponse.json(
        { message: "Video testimony submitted successfully." },
        { status: 201 },
    );
}
