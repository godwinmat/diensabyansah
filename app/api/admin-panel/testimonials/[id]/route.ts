import { getAdminCookieName, verifyAdminSessionToken } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { deleteImageFromSupabaseStorage } from "@/lib/storage-image-cleanup";
import {
    getSupabaseAdminClient,
    getSupabaseStorageBucket,
} from "@/lib/supabase-admin";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

type RouteContext = { params: Promise<{ id: string }> };

async function requireAdmin() {
    const cookieStore = await cookies();
    const token = cookieStore.get(getAdminCookieName())?.value ?? "";
    return Boolean(verifyAdminSessionToken(token));
}

async function deleteVideoFromStorage(
    path?: string | null,
    url?: string | null,
) {
    const trimmedPath = path?.trim();

    if (trimmedPath) {
        const supabase = getSupabaseAdminClient();
        if (!supabase) {
            return;
        }

        await supabase.storage
            .from(getSupabaseStorageBucket())
            .remove([trimmedPath]);
        return;
    }

    await deleteImageFromSupabaseStorage(url).catch(() => null);
}

export async function DELETE(_request: Request, { params }: RouteContext) {
    if (!(await requireAdmin())) {
        return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }

    const { id } = await params;

    try {
        const record = await prisma.testimonial.findUnique({
            where: { id },
            select: {
                videoPath: true,
                videoUrl: true,
            },
        });

        await prisma.testimonial.delete({ where: { id } });
        await deleteVideoFromStorage(record?.videoPath, record?.videoUrl).catch(
            () => null,
        );

        return NextResponse.json({ message: "Testimony deleted." });
    } catch {
        return NextResponse.json(
            { message: "Delete failed." },
            { status: 500 },
        );
    }
}
