export type WooCommerceProduct = {
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

export type WooCommerceCollection = {
    id: number;
    name: string;
    slug: string;
    description: string;
    image: string;
    productCount: number;
    featured: boolean;
};

type WooCommerceRecord = Record<string, unknown> & {
    id?: number | string;
    slug?: string;
    name?: string;
    permalink?: string;
    description?: string;
    short_description?: string;
    price?: string;
    regular_price?: string;
    sale_price?: string;
    images?: Array<Record<string, unknown>>;
    categories?: Array<Record<string, unknown>>;
    attributes?: Array<Record<string, unknown>>;
    prices?: {
        price?: string | number;
        currency_code?: string;
        currency_symbol?: string;
        currency_minor_unit?: number;
    };
};

type WooCommerceCategoryRecord = Record<string, unknown> & {
    id?: number | string;
    name?: string;
    slug?: string;
    description?: string;
    count?: number;
    image?: Record<string, unknown> | null;
};

const DEFAULT_IMAGE =
    "https://images.unsplash.com/photo-1615212814093-4f4c0ca0d7f5?auto=format&fit=crop&w=900&q=80";

function stripHtml(value?: string) {
    return (
        value
            ?.replace(/<[^>]*>/g, " ")
            .replace(/\s+/g, " ")
            .trim() ?? ""
    );
}

function normalizePrice(record: WooCommerceRecord) {
    if (record.prices?.price !== undefined) {
        const numericPrice = Number(record.prices.price);
        const divisor = 10 ** (record.prices.currency_minor_unit ?? 2);
        const amount = numericPrice / divisor;

        if (Number.isFinite(amount)) {
            try {
                return new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: record.prices.currency_code || "USD",
                }).format(amount);
            } catch {
                return `$${amount.toFixed(amount % 1 === 0 ? 0 : 2)}`;
            }
        }
    }

    const rawPrice = record.price ?? record.sale_price ?? record.regular_price;
    const numericPrice = Number(rawPrice);

    if (Number.isFinite(numericPrice)) {
        return `$${numericPrice.toFixed(numericPrice % 1 === 0 ? 0 : 2)}`;
    }

    return "Price on request";
}

function getPrimaryImage(record: WooCommerceRecord) {
    const image = record.images?.[0];
    const imageSource = image?.src || image?.url || image?.thumbnail;

    return typeof imageSource === "string" && imageSource.length > 0
        ? imageSource
        : DEFAULT_IMAGE;
}

function getGalleryImages(record: WooCommerceRecord) {
    if (!Array.isArray(record.images)) {
        return [] as string[];
    }

    return Array.from(
        new Set(
            record.images
                .map((image) => image?.src || image?.url || image?.thumbnail)
                .map((source) =>
                    typeof source === "string" ? source.trim() : "",
                )
                .filter((source) => source.length > 0),
        ),
    );
}

function getMaterial(record: WooCommerceRecord) {
    const materialAttribute = record.attributes?.find((attribute) => {
        const name = String(attribute?.name ?? "").toLowerCase();
        return name.includes("material");
    });

    const materialOptions = materialAttribute?.options as unknown[] | undefined;
    const materialValue =
        materialOptions?.[0] ?? materialAttribute?.value ?? "";

    return typeof materialValue === "string" && materialValue.trim().length > 0
        ? materialValue
        : "Curated Product";
}

function getCollections(record: WooCommerceRecord) {
    if (!Array.isArray(record.categories)) {
        return [] as string[];
    }

    return record.categories
        .map((category) => String(category?.name ?? "").trim())
        .filter((name) => name.length > 0);
}

function getSizes(record: WooCommerceRecord) {
    if (!Array.isArray(record.attributes)) {
        return [] as string[];
    }

    const sizeAttribute = record.attributes.find((attribute) => {
        const name = String(attribute?.name ?? "")
            .trim()
            .toLowerCase();
        const slug = String(attribute?.slug ?? "")
            .trim()
            .toLowerCase();
        return name === "size" || slug === "pa_size" || slug.endsWith("_size");
    });

    if (!sizeAttribute) {
        return [];
    }

    const options = sizeAttribute.options as unknown;
    const terms = sizeAttribute.terms as unknown;
    const value = sizeAttribute.value as unknown;

    if (Array.isArray(options)) {
        return options
            .map((option) => String(option ?? "").trim())
            .filter((option) => option.length > 0);
    }

    if (Array.isArray(terms)) {
        return terms
            .map((term) => {
                if (term && typeof term === "object") {
                    return String(
                        (term as Record<string, unknown>).name ?? "",
                    ).trim();
                }

                return String(term ?? "").trim();
            })
            .filter((term) => term.length > 0);
    }

    if (typeof value === "string") {
        return value
            .split("|")
            .flatMap((part) => part.split(","))
            .map((part) => part.trim())
            .filter((part) => part.length > 0);
    }

    return [];
}

function mapProduct(record: WooCommerceRecord): WooCommerceProduct {
    const productId = Number(record.id);
    const galleryImages = getGalleryImages(record);
    const description = stripHtml(
        (record.description as string | undefined) ??
            (record.short_description as string | undefined),
    );
    const note =
        stripHtml(record.short_description as string | undefined) ||
        description.split(".")[0] ||
        "Available in our collection";
    const originCategory = record.categories?.[0]?.name;

    return {
        id: String(record.slug ?? productId ?? "product"),
        productId: Number.isFinite(productId) ? productId : 0,
        name: String(record.name ?? "Untitled Product"),
        price: normalizePrice(record),
        image: galleryImages[0] ?? getPrimaryImage(record),
        galleryImages,
        note,
        description: description || note,
        origin:
            typeof originCategory === "string" &&
            originCategory.trim().length > 0
                ? originCategory
                : "Made in Cameroon",
        material: getMaterial(record),
        collections: getCollections(record),
        sizes: getSizes(record),
        permalink:
            typeof record.permalink === "string" ? record.permalink : undefined,
    };
}

function mapCollection(
    record: WooCommerceCategoryRecord,
): WooCommerceCollection {
    const rawDescription = String(record.description ?? "");
    const imageSource =
        (record.image?.src as string | undefined) ||
        (record.image?.url as string | undefined) ||
        DEFAULT_IMAGE;

    return {
        id: Number(record.id ?? 0),
        name: String(record.name ?? "Uncategorized"),
        slug: String(record.slug ?? "uncategorized"),
        description: stripHtml(rawDescription),
        image: imageSource,
        productCount: Number(record.count ?? 0),
        featured: /\[featured\]|#featured|featured\s*:\s*true/i.test(
            rawDescription,
        ),
    };
}

async function fetchPaginatedProducts(
    path: string,
    init?: RequestInit,
): Promise<WooCommerceProduct[]> {
    const wordpressUrl = process.env.WORDPRESS_API_URL?.replace(/\/$/, "");

    if (!wordpressUrl) {
        return [];
    }

    const products: WooCommerceProduct[] = [];
    const pageSize = 100;

    for (let page = 1; page <= 20; page += 1) {
        const requestUrl = new URL(`${wordpressUrl}${path}`);
        requestUrl.searchParams.set("per_page", String(pageSize));
        requestUrl.searchParams.set("page", String(page));

        const response = await fetch(requestUrl, {
            cache: "no-store",
            ...init,
            headers: {
                "Content-Type": "application/json",
                ...(init?.headers ?? {}),
            },
        });

        if (!response.ok) {
            throw new Error(
                `WooCommerce request failed with status ${response.status}`,
            );
        }

        const payload = (await response.json().catch(() => [])) as unknown;

        if (!Array.isArray(payload) || payload.length === 0) {
            break;
        }

        products.push(
            ...payload.map((record) => mapProduct(record as WooCommerceRecord)),
        );

        if (payload.length < pageSize) {
            break;
        }
    }

    return products;
}

async function fetchAuthenticatedProducts() {
    const consumerKey = process.env.WOOCOMMERCE_CONSUMER_KEY?.trim();
    const consumerSecret = process.env.WOOCOMMERCE_CONSUMER_SECRET?.trim();

    if (!consumerKey || !consumerSecret) {
        return [];
    }

    const authorization = `Basic ${Buffer.from(
        `${consumerKey}:${consumerSecret}`,
    ).toString("base64")}`;

    return fetchPaginatedProducts("/wc/v3/products", {
        headers: {
            Authorization: authorization,
        },
    }).catch(() => []);
}

async function fetchStoreProducts() {
    return fetchPaginatedProducts("/wc/store/v1/products").catch(() => []);
}

async function fetchCollections(path: string, init?: RequestInit) {
    const wordpressUrl = process.env.WORDPRESS_API_URL?.replace(/\/$/, "");

    if (!wordpressUrl) {
        return [] as WooCommerceCollection[];
    }

    const requestUrl = new URL(`${wordpressUrl}${path}`);
    requestUrl.searchParams.set("per_page", "100");

    const response = await fetch(requestUrl, {
        cache: "no-store",
        ...init,
        headers: {
            "Content-Type": "application/json",
            ...(init?.headers ?? {}),
        },
    });

    if (!response.ok) {
        throw new Error(
            `WooCommerce category request failed with status ${response.status}`,
        );
    }

    const payload = (await response.json().catch(() => [])) as unknown;

    if (!Array.isArray(payload)) {
        return [];
    }

    return payload.map((record) =>
        mapCollection(record as WooCommerceCategoryRecord),
    );
}

async function fetchAuthenticatedCollections() {
    const consumerKey = process.env.WOOCOMMERCE_CONSUMER_KEY?.trim();
    const consumerSecret = process.env.WOOCOMMERCE_CONSUMER_SECRET?.trim();

    if (!consumerKey || !consumerSecret) {
        return [];
    }

    const authorization = `Basic ${Buffer.from(
        `${consumerKey}:${consumerSecret}`,
    ).toString("base64")}`;

    return fetchCollections("/wc/v3/products/categories", {
        headers: {
            Authorization: authorization,
        },
    }).catch(() => []);
}

async function fetchStoreCollections() {
    return fetchCollections("/wc/store/v1/products/categories").catch(() => []);
}

export async function getWooCommerceProducts() {
    const authenticatedProducts = await fetchAuthenticatedProducts();

    if (authenticatedProducts.length > 0) {
        return authenticatedProducts;
    }

    return fetchStoreProducts();
}

export async function getWooCommerceCollections() {
    const authenticatedCollections = await fetchAuthenticatedCollections();

    if (authenticatedCollections.length > 0) {
        return authenticatedCollections;
    }

    return fetchStoreCollections();
}

export async function getWooCommerceProductById(id: string) {
    const products = await getWooCommerceProducts();

    return products.find(
        (product) => product.id === id || String(product.productId) === id,
    );
}
