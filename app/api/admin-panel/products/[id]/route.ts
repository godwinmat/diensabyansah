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

    const productData: {
        name?: string;
        slug?: string;
        price?: string;
        imageUrl?: string;
        note?: string;
        description?: string;
        origin?: string;
        material?: string;
        permalink?: string | null;
        sizes?: string[];
    } = {};

    if (typeof body.name === "string" && body.name.trim())
        productData.name = body.name.trim();
    if (typeof body.slug === "string" && body.slug.trim())
        productData.slug = body.slug.trim();
    if (typeof body.price === "string" && body.price.trim())
        productData.price = body.price.trim();
    if (typeof body.imageUrl === "string" && body.imageUrl.trim())
        productData.imageUrl = body.imageUrl.trim();
    if (typeof body.note === "string" && body.note.trim())
        productData.note = body.note.trim();
    if (typeof body.description === "string" && body.description.trim())
        productData.description = body.description.trim();
    if (typeof body.origin === "string" && body.origin.trim())
        productData.origin = body.origin.trim();
    if (typeof body.material === "string" && body.material.trim())
        productData.material = body.material.trim();
    if ("permalink" in body) {
        productData.permalink =
            typeof body.permalink === "string" && body.permalink.trim()
                ? body.permalink.trim()
                : null;
    }
    if (Array.isArray(body.sizes)) {
        productData.sizes = body.sizes
            .map((s) => String(s).trim())
            .filter(Boolean);
    }

    const newCollectionSlugs = Array.isArray(body.collectionSlugs)
        ? body.collectionSlugs.map((s) => String(s).trim()).filter(Boolean)
        : undefined;

    const hasProductChanges = Object.keys(productData).length > 0;
    const hasCollectionChanges = newCollectionSlugs !== undefined;

    if (!hasProductChanges && !hasCollectionChanges) {
        return NextResponse.json(
            { message: "No fields to update." },
            { status: 400 },
        );
    }

    try {
        await prisma.$transaction(async (tx) => {
            if (hasCollectionChanges && newCollectionSlugs) {
                const current = await tx.productCollection.findMany({
                    where: { productId: id },
                    include: {
                        collection: { select: { id: true, slug: true } },
                    },
                });

                const currentSlugs = current.map((c) => c.collection.slug);
                const toAdd = newCollectionSlugs.filter(
                    (s) => !currentSlugs.includes(s),
                );
                const toRemove = current.filter(
                    (c) => !newCollectionSlugs.includes(c.collection.slug),
                );

                if (toRemove.length > 0) {
                    const removeCollectionIds = toRemove.map(
                        (c) => c.collectionId,
                    );
                    await tx.productCollection.deleteMany({
                        where: {
                            productId: id,
                            collectionId: { in: removeCollectionIds },
                        },
                    });
                    await tx.collection.updateMany({
                        where: { id: { in: removeCollectionIds } },
                        data: { productCount: { decrement: 1 } },
                    });
                }

                if (toAdd.length > 0) {
                    const addCollections = await tx.collection.findMany({
                        where: { slug: { in: toAdd } },
                        select: { id: true },
                    });
                    await tx.productCollection.createMany({
                        data: addCollections.map((c) => ({
                            productId: id,
                            collectionId: c.id,
                        })),
                    });
                    await tx.collection.updateMany({
                        where: { id: { in: addCollections.map((c) => c.id) } },
                        data: { productCount: { increment: 1 } },
                    });
                }
            }

            if (hasProductChanges) {
                await tx.product.update({ where: { id }, data: productData });
            }
        });

        return NextResponse.json({ message: "Product updated." });
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
        let imageUrlToDelete: string | null = null;

        await prisma.$transaction(async (tx) => {
            const product = await tx.product.findUnique({
                where: { id },
                include: {
                    collections: { select: { collectionId: true } },
                },
            });

            imageUrlToDelete = product?.imageUrl ?? null;

            if (product?.collections && product.collections.length > 0) {
                const collectionIds = product.collections.map(
                    (c) => c.collectionId,
                );
                await tx.collection.updateMany({
                    where: { id: { in: collectionIds } },
                    data: { productCount: { decrement: 1 } },
                });
            }

            await tx.product.delete({ where: { id } });
        });

        await deleteImageFromSupabaseStorage(imageUrlToDelete).catch(
            () => null,
        );

        return NextResponse.json({ message: "Product deleted." });
    } catch {
        return NextResponse.json(
            { message: "Delete failed." },
            { status: 500 },
        );
    }
}
