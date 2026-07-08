import { getAdminCookieName, verifyAdminSessionToken } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { deleteImageFromSupabaseStorage } from "@/lib/storage-image-cleanup";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

type RouteContext = { params: Promise<{ id: string }> };

async function requireAdmin() {
    const cookieStore = await cookies();
    const token = cookieStore.get(getAdminCookieName())?.value ?? "";
    return Boolean(verifyAdminSessionToken(token));
}

export async function PATCH(request: Request, { params }: RouteContext) {
    if (!(await requireAdmin())) {
        return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }

    const { id } = await params;
    const body = (await request.json().catch(() => null)) as Record<
        string,
        unknown
    > | null;

    if (!body || !id) {
        return NextResponse.json(
            { message: "Invalid request." },
            { status: 400 },
        );
    }

    const data: {
        title?: string;
        slug?: string;
        excerpt?: string;
        content?: string;
        imageUrl?: string;
        categories?: string[];
        publishedAt?: Date | null;
    } = {};

    if (typeof body.title === "string" && body.title.trim())
        data.title = body.title.trim();
    if (typeof body.slug === "string" && body.slug.trim())
        data.slug = body.slug.trim();
    if (typeof body.excerpt === "string" && body.excerpt.trim())
        data.excerpt = body.excerpt.trim();
    if (typeof body.content === "string" && body.content.trim())
        data.content = body.content.trim();
    if (typeof body.imageUrl === "string" && body.imageUrl.trim())
        data.imageUrl = body.imageUrl.trim();
    if (Array.isArray(body.categories)) {
        data.categories = body.categories
            .map((c) => String(c).trim())
            .filter(Boolean);
    }
    if ("publishedAt" in body) {
        data.publishedAt = body.publishedAt
            ? new Date(String(body.publishedAt))
            : null;
    }

    if (Object.keys(data).length === 0) {
        return NextResponse.json(
            { message: "No fields to update." },
            { status: 400 },
        );
    }

    try {
        const updated = await prisma.blogPost.update({
            where: { id },
            data,
            select: { id: true, title: true, slug: true },
        });
        return NextResponse.json({ message: "Post updated.", post: updated });
    } catch {
        return NextResponse.json(
            {
                message: "Update failed. The slug may already be in use.",
            },
            { status: 500 },
        );
    }
}

export async function DELETE(_request: Request, { params }: RouteContext) {
    if (!(await requireAdmin())) {
        return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }

    const { id } = await params;

    try {
        const record = await prisma.blogPost.findUnique({
            where: { id },
            select: { imageUrl: true },
        });

        await prisma.blogPost.delete({ where: { id } });

        await deleteImageFromSupabaseStorage(record?.imageUrl).catch(
            () => null,
        );

        return NextResponse.json({ message: "Post deleted." });
    } catch {
        return NextResponse.json(
            { message: "Delete failed." },
            { status: 500 },
        );
    }
}
