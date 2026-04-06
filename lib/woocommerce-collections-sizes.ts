/**
 * WooCommerce Collections & Sizes Helper
 * Collections = Product Categories
 * Sizes = Product Attributes
 */

const WORDPRESS_API_URL =
    process.env.WORDPRESS_API_URL?.replace(/\/$/, "") ?? "";

// ===== COLLECTIONS (Product Categories) =====

export type Collection = {
    id: number;
    name: string;
    slug: string;
    description: string;
    image?: {
        src: string;
        name: string;
    };
    count: number;
};

export async function getCollections(limit = 100): Promise<Collection[]> {
    if (!WORDPRESS_API_URL) return [];

    try {
        const url = new URL(`${WORDPRESS_API_URL}/wp/v2/products/categories`);
        url.searchParams.set("per_page", String(limit));
        url.searchParams.set("orderby", "name");

        const response = await fetch(url, { cache: "no-store" });

        if (!response.ok) return [];

        const data = (await response.json()) as unknown;

        if (!Array.isArray(data)) return [];

        return data
            .map((item: unknown) => {
                const cat = item as Record<string, unknown>;
                return {
                    id: Number(cat.id ?? 0),
                    name: String(cat.name ?? ""),
                    slug: String(cat.slug ?? ""),
                    description: String(cat.description ?? ""),
                    image:
                        cat.image && typeof cat.image === "object"
                            ? {
                                  src: String(
                                      (cat.image as Record<string, unknown>)
                                          .src ?? "",
                                  ),
                                  name: String(
                                      (cat.image as Record<string, unknown>)
                                          .name ?? "",
                                  ),
                              }
                            : undefined,
                    count: Number(cat.count ?? 0),
                };
            })
            .filter((cat) => cat.name.length > 0 && cat.id > 0);
    } catch (error) {
        console.error("Error fetching collections:", error);
        return [];
    }
}

export async function getCollectionBySlug(
    slug: string,
): Promise<Collection | null> {
    if (!WORDPRESS_API_URL || !slug) return null;

    try {
        const url = new URL(`${WORDPRESS_API_URL}/wp/v2/products/categories`);
        url.searchParams.set("slug", slug);

        const response = await fetch(url, { cache: "no-store" });

        if (!response.ok) return null;

        const data = (await response.json()) as unknown;

        if (!Array.isArray(data) || data.length === 0) return null;

        const cat = data[0] as Record<string, unknown>;

        return {
            id: Number(cat.id ?? 0),
            name: String(cat.name ?? ""),
            slug: String(cat.slug ?? ""),
            description: String(cat.description ?? ""),
            image:
                cat.image && typeof cat.image === "object"
                    ? {
                          src: String(
                              (cat.image as Record<string, unknown>).src ?? "",
                          ),
                          name: String(
                              (cat.image as Record<string, unknown>).name ?? "",
                          ),
                      }
                    : undefined,
            count: Number(cat.count ?? 0),
        };
    } catch (error) {
        console.error("Error fetching collection:", error);
        return null;
    }
}

export async function getProductsByCollection(
    collectionSlug: string,
    limit = 50,
): Promise<number[]> {
    if (!WORDPRESS_API_URL || !collectionSlug) return [];

    try {
        const url = new URL(`${WORDPRESS_API_URL}/wp/v2/products`);
        url.searchParams.set("category", collectionSlug);
        url.searchParams.set("per_page", String(limit));

        const response = await fetch(url, { cache: "no-store" });

        if (!response.ok) return [];

        const data = (await response.json()) as unknown;

        if (!Array.isArray(data)) return [];

        return data
            .map((item: unknown) =>
                Number((item as Record<string, unknown>).id ?? 0),
            )
            .filter((id) => id > 0);
    } catch (error) {
        console.error("Error fetching products by collection:", error);
        return [];
    }
}

// ===== SIZES (Product Attributes) =====

export type Size = {
    id: number;
    name: string;
    slug: string;
    type: string;
    orderby: string;
    has_archives: boolean;
};

export type SizeOption = {
    id: number;
    name: string;
    slug: string;
};

export async function getSizes(): Promise<Size[]> {
    if (!WORDPRESS_API_URL) return [];

    try {
        const url = new URL(`${WORDPRESS_API_URL}/wp/v2/products/attributes`);

        const response = await fetch(url, { cache: "no-store" });

        if (!response.ok) return [];

        const data = (await response.json()) as unknown;

        if (!Array.isArray(data)) return [];

        return data
            .map((item: unknown) => {
                const attr = item as Record<string, unknown>;
                return {
                    id: Number(attr.id ?? 0),
                    name: String(attr.name ?? ""),
                    slug: String(attr.slug ?? ""),
                    type: String(attr.type ?? "select"),
                    orderby: String(attr.orderby ?? "name"),
                    has_archives: Boolean(attr.has_archives ?? false),
                };
            })
            .filter((size) => size.name.length > 0 && size.id > 0);
    } catch (error) {
        console.error("Error fetching sizes:", error);
        return [];
    }
}

export async function getSizeById(id: number): Promise<Size | null> {
    if (!WORDPRESS_API_URL || !id) return null;

    try {
        const url = new URL(
            `${WORDPRESS_API_URL}/wp/v2/products/attributes/${id}`,
        );

        const response = await fetch(url, { cache: "no-store" });

        if (!response.ok) return null;

        const attr = (await response.json()) as Record<string, unknown>;

        return {
            id: Number(attr.id ?? 0),
            name: String(attr.name ?? ""),
            slug: String(attr.slug ?? ""),
            type: String(attr.type ?? "select"),
            orderby: String(attr.orderby ?? "name"),
            has_archives: Boolean(attr.has_archives ?? false),
        };
    } catch (error) {
        console.error("Error fetching size:", error);
        return null;
    }
}

export async function getSizeOptions(sizeId: number): Promise<SizeOption[]> {
    if (!WORDPRESS_API_URL || !sizeId) return [];

    try {
        const url = new URL(
            `${WORDPRESS_API_URL}/wp/v2/products/attributes/${sizeId}/terms`,
        );

        const response = await fetch(url, { cache: "no-store" });

        if (!response.ok) return [];

        const data = (await response.json()) as unknown;

        if (!Array.isArray(data)) return [];

        return data
            .map((item: unknown) => {
                const term = item as Record<string, unknown>;
                return {
                    id: Number(term.id ?? 0),
                    name: String(term.name ?? ""),
                    slug: String(term.slug ?? ""),
                };
            })
            .filter((opt) => opt.name.length > 0 && opt.id > 0);
    } catch (error) {
        console.error("Error fetching size options:", error);
        return [];
    }
}

export async function getProductSizes(
    productId: number,
): Promise<Record<string, string[]>> {
    if (!WORDPRESS_API_URL || !productId) return {};

    try {
        const url = new URL(`${WORDPRESS_API_URL}/wp/v2/products/${productId}`);

        const response = await fetch(url, { cache: "no-store" });

        if (!response.ok) return {};

        const product = (await response.json()) as Record<string, unknown>;
        const attributes = product.attributes as unknown;

        if (!Array.isArray(attributes)) return {};

        const sizeMap: Record<string, string[]> = {};

        for (const attr of attributes) {
            const attrObj = attr as Record<string, unknown>;
            const name = String(attrObj.name ?? "");
            const options = attrObj.options as unknown;

            if (Array.isArray(options)) {
                sizeMap[name] = options
                    .map((opt) => String(opt ?? ""))
                    .filter((opt) => opt.length > 0);
            }
        }

        return sizeMap;
    } catch (error) {
        console.error("Error fetching product sizes:", error);
        return {};
    }
}
