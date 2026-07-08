import {
    getAdminCookieName,
    verifyAdminSessionToken,
} from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

type CreateProductBody = {
    name?: string;
    slug?: string;
    price?: string;
    imageUrl?: string;
    note?: string;
    description?: string;
    origin?: string;
    material?: string;
    permalink?: string;
    externalId?: string;
    sizes?: string[];
    collectionSlugs?: string[];
};

async function isAdminAuthenticated() {
    const cookieStore = await cookies();
    const token = cookieStore.get(getAdminCookieName())?.value ?? "";
    return Boolean(verifyAdminSessionToken(token));
}

async function getNextProductExternalId() {
    const latest = await prisma.product.findFirst({
        orderBy: {
            externalId: "desc",
        },
        select: {
            externalId: true,
        },
    });

    return (latest?.externalId ?? 0) + 1;
}

export async function POST(request: Request) {
    if (!(await isAdminAuthenticated())) {
        return NextResponse.json(
            {
                message: "Unauthorized.",
            },
            {
                status: 401,
            },
        );
    }

    const body = (await request.json().catch(() => null)) as
        | CreateProductBody
        | null;

    const name = body?.name?.trim() ?? "";
    const slug = body?.slug?.trim() ?? "";
    const price = body?.price?.trim() ?? "";
    const imageUrl = body?.imageUrl?.trim() ?? "";
    const note = body?.note?.trim() ?? "";
    const description = body?.description?.trim() ?? "";
    const origin = body?.origin?.trim() ?? "";
    const material = body?.material?.trim() ?? "";
    const permalink = body?.permalink?.trim() ?? "";

    if (
        !name ||
        !slug ||
        !price ||
        !imageUrl ||
        !note ||
        !description ||
        !origin ||
        !material
    ) {
        return NextResponse.json(
            {
                message:
                    "Name, slug, price, image URL, note, description, origin, and material are required.",
            },
            {
                status: 400,
            },
        );
    }

    const sizes = Array.from(
        new Set(
            (body?.sizes ?? [])
                .map((size) => size.trim())
                .filter((size) => size.length > 0),
        ),
    );

    const collectionSlugs = Array.from(
        new Set(
            (body?.collectionSlugs ?? [])
                .map((slugValue) => slugValue.trim())
                .filter((slugValue) => slugValue.length > 0),
        ),
    );

    const externalId = body?.externalId?.trim()
        ? Number(body.externalId)
        : await getNextProductExternalId();

    if (!Number.isFinite(externalId)) {
        return NextResponse.json(
            {
                message: "External ID must be a number if provided.",
            },
            {
                status: 400,
            },
        );
    }

    const collections = await prisma.collection.findMany({
        where: {
            slug: {
                in: collectionSlugs,
            },
        },
        select: {
            id: true,
            slug: true,
        },
    });

    const foundCollectionSlugs = new Set(collections.map((item) => item.slug));
    const missingCollectionSlugs = collectionSlugs.filter(
        (slugValue) => !foundCollectionSlugs.has(slugValue),
    );

    if (missingCollectionSlugs.length > 0) {
        return NextResponse.json(
            {
                message: `Unknown collection slugs: ${missingCollectionSlugs.join(", ")}`,
            },
            {
                status: 400,
            },
        );
    }

    try {
        const created = await prisma.$transaction(async (tx) => {
            const record = await tx.product.create({
                data: {
                    externalId,
                    name,
                    slug,
                    price,
                    imageUrl,
                    note,
                    description,
                    origin,
                    material,
                    permalink: permalink || null,
                    sizes,
                    collections: {
                        create: collections.map((collection) => ({
                            collection: {
                                connect: {
                                    id: collection.id,
                                },
                            },
                        })),
                    },
                },
                select: {
                    id: true,
                    name: true,
                    slug: true,
                },
            });

            if (collections.length > 0) {
                await tx.collection.updateMany({
                    where: {
                        id: {
                            in: collections.map((collection) => collection.id),
                        },
                    },
                    data: {
                        productCount: {
                            increment: 1,
                        },
                    },
                });
            }

            return record;
        });

        return NextResponse.json(
            {
                message: "Product created successfully.",
                product: created,
            },
            {
                status: 201,
            },
        );
    } catch {
        return NextResponse.json(
            {
                message:
                    "Unable to create product. Confirm slug/external ID uniqueness and try again.",
            },
            {
                status: 500,
            },
        );
    }
}
