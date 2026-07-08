import { getAdminCookieName, verifyAdminSessionToken } from "@/lib/admin-auth";
import {
    getSupabaseAdminClient,
    getSupabaseStorageBucket,
} from "@/lib/supabase-admin";
import crypto from "crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

type UploadEntity = "products" | "collections" | "posts";

const ALLOWED_ENTITIES = new Set<UploadEntity>([
    "products",
    "collections",
    "posts",
]);

const MAX_UPLOAD_SIZE_BYTES = 10 * 1024 * 1024;

function isAllowedPath(path: string) {
    const trimmed = path.trim();
    if (!trimmed) {
        return false;
    }

    for (const entity of ALLOWED_ENTITIES) {
        if (trimmed.startsWith(`${entity}/`)) {
            return true;
        }
    }

    return false;
}

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

async function isAdminAuthenticated() {
    const cookieStore = await cookies();
    const token = cookieStore.get(getAdminCookieName())?.value ?? "";
    return Boolean(verifyAdminSessionToken(token));
}

async function ensureBucketExists() {
    const supabase = getSupabaseAdminClient();
    const bucket = getSupabaseStorageBucket();

    if (!supabase) {
        return {
            ok: false,
            message: "Supabase storage is not configured.",
            status: 500,
            bucket,
        } as const;
    }

    const { data: existingBucket, error: getBucketError } =
        await supabase.storage.getBucket(bucket);

    if (!getBucketError && existingBucket) {
        if (!existingBucket.public) {
            const { error: updateBucketError } =
                await supabase.storage.updateBucket(bucket, {
                    public: true,
                });

            if (updateBucketError) {
                return {
                    ok: false,
                    message: `Storage bucket '${bucket}' exists but could not be updated to public access.`,
                    status: 500,
                    bucket,
                } as const;
            }
        }

        return { ok: true, supabase, bucket } as const;
    }

    const bucketStatusCode = Number(getBucketError?.statusCode ?? 0);
    const isMissingBucket =
        (getBucketError?.message ?? "")
            .toLowerCase()
            .includes("bucket not found") || bucketStatusCode === 404;

    if (!isMissingBucket) {
        return {
            ok: false,
            message: "Unable to access storage bucket.",
            status: 500,
            bucket,
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
            bucket,
        } as const;
    }

    return { ok: true, supabase, bucket } as const;
}

export async function POST(request: Request) {
    if (!(await isAdminAuthenticated())) {
        return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }

    const bucketState = await ensureBucketExists();
    if (!bucketState.ok) {
        return NextResponse.json(
            { message: bucketState.message },
            { status: bucketState.status },
        );
    }

    const { supabase, bucket } = bucketState;

    const formData = await request.formData().catch(() => null);
    if (!formData) {
        return NextResponse.json(
            { message: "Invalid upload payload." },
            { status: 400 },
        );
    }

    const entity = String(formData.get("entity") ?? "") as UploadEntity;
    const fileValue = formData.get("file");

    if (!ALLOWED_ENTITIES.has(entity)) {
        return NextResponse.json(
            { message: "Invalid upload entity." },
            { status: 400 },
        );
    }

    if (!(fileValue instanceof File)) {
        return NextResponse.json(
            { message: "Image file is required." },
            { status: 400 },
        );
    }

    if (!fileValue.type.startsWith("image/")) {
        return NextResponse.json(
            { message: "Only image files are allowed." },
            { status: 400 },
        );
    }

    if (fileValue.size === 0 || fileValue.size > MAX_UPLOAD_SIZE_BYTES) {
        return NextResponse.json(
            { message: "Image size must be between 1 byte and 10 MB." },
            { status: 400 },
        );
    }

    const arrayBuffer = await fileValue.arrayBuffer();
    const fileBuffer = Buffer.from(arrayBuffer);

    const fileName = sanitizeFileName(fileValue.name || "upload");
    const filePath = `${entity}/${Date.now()}-${crypto.randomUUID()}-${fileName}`;

    const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, fileBuffer, {
            contentType: fileValue.type,
            upsert: false,
            cacheControl: "3600",
        });

    if (uploadError) {
        return NextResponse.json(
            { message: "Failed to upload image." },
            { status: 500 },
        );
    }

    const { data: publicData } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

    if (!publicData?.publicUrl) {
        return NextResponse.json(
            { message: "Failed to generate image URL." },
            { status: 500 },
        );
    }

    return NextResponse.json(
        {
            message: "Image uploaded successfully.",
            url: publicData.publicUrl,
            path: filePath,
        },
        { status: 201 },
    );
}

export async function DELETE(request: Request) {
    if (!(await isAdminAuthenticated())) {
        return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }

    const bucketState = await ensureBucketExists();
    if (!bucketState.ok) {
        return NextResponse.json(
            { message: bucketState.message },
            { status: bucketState.status },
        );
    }

    const { supabase, bucket } = bucketState;

    const body = (await request.json().catch(() => null)) as {
        path?: string;
    } | null;

    const path = body?.path?.trim() ?? "";

    if (!isAllowedPath(path)) {
        return NextResponse.json(
            { message: "Invalid storage path." },
            { status: 400 },
        );
    }

    const { error } = await supabase.storage.from(bucket).remove([path]);

    if (error) {
        return NextResponse.json(
            { message: "Failed to delete uploaded image." },
            { status: 500 },
        );
    }

    return NextResponse.json({ message: "Uploaded image deleted." });
}
