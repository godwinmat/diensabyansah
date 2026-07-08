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
        name?: string;
        slug?: string;
        description?: string;
        imageUrl?: string;
        featured?: boolean;
    } = {};

    if (typeof body.name === "string" && body.name.trim())
        data.name = body.name.trim();
    if (typeof body.slug === "string" && body.slug.trim())
        data.slug = body.slug.trim();
    if (typeof body.description === "string" && body.description.trim())
        data.description = body.description.trim();
    if (typeof body.imageUrl === "string" && body.imageUrl.trim())
        data.imageUrl = body.imageUrl.trim();
    if (typeof body.featured === "boolean") data.featured = body.featured;

    if (Object.keys(data).length === 0) {
        return NextResponse.json(
            { message: "No fields to update." },
            { status: 400 },
        );
    }

    try {
        const updated = await prisma.collection.update({
            where: { id },
            data,
            select: { id: true, name: true, slug: true },
        });
        return NextResponse.json({
            message: "Collection updated.",
            collection: updated,
        });
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
        const record = await prisma.collection.findUnique({
            where: { id },
            select: { imageUrl: true },
        });

        // ProductCollection entries cascade-delete automatically
        await prisma.collection.delete({ where: { id } });

        await deleteImageFromSupabaseStorage(record?.imageUrl).catch(
            () => null,
        );

        return NextResponse.json({ message: "Collection deleted." });
    } catch {
        return NextResponse.json(
            { message: "Delete failed." },
            { status: 500 },
        );
    }
}
