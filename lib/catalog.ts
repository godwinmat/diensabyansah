import { formatDisplayPrice } from "@/lib/cart";
import { getCompanyProfile } from "@/lib/company-profile";
import { prisma } from "@/lib/prisma";

type ProductDelegate = {
    findMany: (...args: unknown[]) => Promise<unknown[]>;
    findFirst: (...args: unknown[]) => Promise<unknown | null>;
};

type CollectionDelegate = {
    findMany: (...args: unknown[]) => Promise<unknown[]>;
};

function getPrismaModelDelegate(name: "product"): ProductDelegate | null;
function getPrismaModelDelegate(name: "collection"): CollectionDelegate | null;
function getPrismaModelDelegate(name: "product" | "collection") {
    const delegate = (
        prisma as unknown as {
            product?: ProductDelegate;
            collection?: CollectionDelegate;
        }
    )[name];

    if (!delegate) {
        console.error(
            `[catalog] Prisma client is missing the '${name}' model delegate. Run \`npx prisma generate\` and restart the dev server.`,
        );
        return null;
    }

    return delegate;
}

export type CatalogProduct = {
    id: string;
    productId: number;
    name: string;
    price: string;
    image: string;
    galleryImages: string[];
    note: string;
    description: string;
    origin: string;
    material: string;
    collections: string[];
    sizes: string[];
    permalink?: string;
};

export type CatalogCollection = {
    id: number;
    name: string;
    slug: string;
    description: string;
    image: string;
    productCount: number;
    featured: boolean;
};

type GetCatalogProductsOptions = {
    limit?: number;
};

const DEFAULT_IMAGE =
    "https://images.unsplash.com/photo-1615212814093-4f4c0ca0d7f5?auto=format&fit=crop&w=900&q=80";

function mapCollectionNames(
    relations: Array<{
        collection: {
            name: string;
        };
    }>,
) {
    return Array.from(
        new Set(
            relations
                .map((entry) => entry.collection.name.trim())
                .filter((name) => name.length > 0),
        ),
    );
}

function mapProduct(
    record: {
    slug: string;
    externalId: number;
    name: string;
    price: string;
    imageUrl: string;
    galleryImageUrls: string[];
    note: string;
    description: string;
    origin: string;
    material: string;
    permalink: string | null;
    sizes: string[];
    collections: Array<{
        collection: {
            name: string;
        };
    }>;
},
    currencySymbol: string,
): CatalogProduct {
    const galleryImages = Array.from(
        new Set(
            record.galleryImageUrls
                .map((image) => image.trim())
                .filter((image) => image.length > 0),
        ),
    );

    return {
        id: record.slug,
        productId: record.externalId,
        name: record.name,
        price: formatDisplayPrice(record.price, currencySymbol),
        image: record.imageUrl || DEFAULT_IMAGE,
        galleryImages,
        note: record.note,
        description: record.description,
        origin: record.origin,
        material: record.material,
        collections: mapCollectionNames(record.collections),
        sizes: Array.from(
            new Set(
                record.sizes
                    .map((size) => size.trim())
                    .filter((size) => size.length > 0),
            ),
        ),
        permalink: record.permalink ?? undefined,
    };
}

function mapCollection(record: {
    externalId: number | null;
    name: string;
    slug: string;
    description: string;
    imageUrl: string;
    productCount: number;
    featured: boolean;
}): CatalogCollection {
    return {
        id: record.externalId ?? 0,
        name: record.name,
        slug: record.slug,
        description: record.description,
        image: record.imageUrl || DEFAULT_IMAGE,
        productCount: record.productCount,
        featured: record.featured,
    };
}

export async function getCatalogProducts(options?: GetCatalogProductsOptions) {
    const productDelegate = getPrismaModelDelegate("product");

    if (!productDelegate) {
        return [];
    }

    const take =
        typeof options?.limit === "number" && options.limit > 0
            ? Math.floor(options.limit)
            : undefined;

    const [records, profile] = await Promise.all([
        productDelegate.findMany({
        include: {
            collections: {
                include: {
                    collection: {
                        select: {
                            name: true,
                        },
                    },
                },
            },
        },
        orderBy: {
            externalId: "desc",
        },
        ...(take ? { take } : {}),
    }),
        getCompanyProfile(),
    ]);

    const typedRecords = records as Array<{
        slug: string;
        externalId: number;
        name: string;
        price: string;
        imageUrl: string;
        galleryImageUrls: string[];
        note: string;
        description: string;
        origin: string;
        material: string;
        permalink: string | null;
        sizes: string[];
        collections: Array<{
            collection: {
                name: string;
            };
        }>;
    }>;

    return typedRecords.map((record) =>
        mapProduct(record, profile.currencySymbol),
    );
}

export async function getCatalogCollections() {
    const collectionDelegate = getPrismaModelDelegate("collection");

    if (!collectionDelegate) {
        return [];
    }

    const records = (await collectionDelegate.findMany({
        orderBy: [
            {
                featured: "desc",
            },
            {
                productCount: "desc",
            },
            {
                name: "asc",
            },
        ],
    })) as Array<{
        externalId: number | null;
        name: string;
        slug: string;
        description: string;
        imageUrl: string;
        productCount: number;
        featured: boolean;
    }>;

    return records.map(mapCollection);
}

export async function getCatalogProductById(id: string) {
    const productDelegate = getPrismaModelDelegate("product");

    if (!productDelegate) {
        return undefined;
    }

    const normalizedId = id.trim();

    if (!normalizedId) {
        return undefined;
    }

    const externalId = Number(normalizedId);

    const [record, profile] = await Promise.all([
        productDelegate.findFirst({
        where: {
            OR: [
                {
                    slug: normalizedId,
                },
                ...(Number.isFinite(externalId)
                    ? [
                          {
                              externalId,
                          },
                      ]
                    : []),
            ],
        },
        include: {
            collections: {
                include: {
                    collection: {
                        select: {
                            name: true,
                        },
                    },
                },
            },
        },
    }),
        getCompanyProfile(),
    ]);

    const typedRecord = record as {
        slug: string;
        externalId: number;
        name: string;
        price: string;
        imageUrl: string;
        galleryImageUrls: string[];
        note: string;
        description: string;
        origin: string;
        material: string;
        permalink: string | null;
        sizes: string[];
        collections: Array<{
            collection: {
                name: string;
            };
        }>;
    } | null;

    return typedRecord
        ? mapProduct(typedRecord, profile.currencySymbol)
        : undefined;
}
