import { getAuthEmailFromToken } from "@/lib/auth-token";
import { parsePrice } from "@/lib/cart";
import { prisma } from "@/lib/prisma";
import {
    getWooCommerceProducts,
    type WooCommerceProduct,
} from "@/lib/woocommerce";

export type PersistedCartItem = {
    productId: number;
    quantity: number;
    size?: string;
};

type CartRecord = {
    userEmail: string;
    items: unknown;
};

type CartApiItem = {
    key: string;
    id: number;
    quantity: number;
    name: string;
    short_description?: string;
    description?: string;
    permalink?: string;
    images?: Array<{ src?: string; alt?: string }>;
    item_data?: Array<{ key?: string; value?: string }>;
    prices?: {
        price?: string;
        currency_code?: string;
        currency_minor_unit?: number;
        currency_symbol?: string;
    };
    totals?: {
        line_total?: string;
        currency_code?: string;
        currency_minor_unit?: number;
        currency_symbol?: string;
    };
};

type CartApiResponse = {
    items: CartApiItem[];
    totals: {
        total_items?: string;
        total_shipping?: string | null;
        total_price?: string;
        currency_code?: string;
        currency_minor_unit?: number;
        currency_symbol?: string;
        currency_prefix?: string;
        currency_suffix?: string;
    };
    shipping_rates: Array<unknown>;
};

function normalizeItems(value: unknown): PersistedCartItem[] {
    if (!Array.isArray(value)) {
        return [];
    }

    return value
        .map((entry) => {
            const record = entry as Partial<PersistedCartItem>;

            return {
                productId: Number(record.productId ?? 0),
                quantity: Math.max(1, Number(record.quantity ?? 1)),
                size: record.size?.trim() || undefined,
            } satisfies PersistedCartItem;
        })
        .filter(
            (item) => Number.isFinite(item.productId) && item.productId > 0,
        );
}

function buildKey(productId: number, size?: string) {
    return size ? `${productId}::${encodeURIComponent(size)}` : `${productId}`;
}

function parseKey(key: string) {
    const [idPart, sizePart] = key.split("::");

    return {
        productId: Number(idPart ?? 0),
        size: sizePart ? decodeURIComponent(sizePart) : "",
    };
}

async function getCartRecord(userEmail: string) {
    const record = (await prisma.cart.findUnique({
        where: { userEmail },
    })) as CartRecord | null;

    return {
        userEmail,
        items: normalizeItems(record?.items),
    };
}

export async function getPersistedCartForUser(userEmail: string) {
    return getCartRecord(userEmail);
}

export async function upsertPersistedCartForUser(
    userEmail: string,
    items: PersistedCartItem[],
) {
    await prisma.cart.upsert({
        where: { userEmail },
        create: {
            userEmail,
            items,
        },
        update: {
            items,
        },
    });
}

export async function addPersistedCartItemForUser(
    userEmail: string,
    item: PersistedCartItem,
) {
    const cart = await getCartRecord(userEmail);
    const existing = cart.items.find(
        (entry) =>
            entry.productId === item.productId && entry.size === item.size,
    );

    if (existing) {
        existing.quantity += item.quantity;
    } else {
        cart.items.push(item);
    }

    await upsertPersistedCartForUser(userEmail, cart.items);
    return cart.items;
}

export async function updatePersistedCartItemForUser(
    userEmail: string,
    key: string,
    quantity: number,
) {
    const cart = await getCartRecord(userEmail);
    const { productId, size } = parseKey(key);

    const nextItems = cart.items
        .map((entry) => {
            if (entry.productId !== productId || (entry.size ?? "") !== size) {
                return entry;
            }

            return {
                ...entry,
                quantity: Math.max(1, quantity),
            };
        })
        .filter(Boolean);

    await upsertPersistedCartForUser(userEmail, nextItems);
    return nextItems;
}

export async function removePersistedCartItemForUser(
    userEmail: string,
    key: string,
) {
    const cart = await getCartRecord(userEmail);
    const { productId, size } = parseKey(key);

    const nextItems = cart.items.filter(
        (entry) => entry.productId !== productId || (entry.size ?? "") !== size,
    );

    await upsertPersistedCartForUser(userEmail, nextItems);
    return nextItems;
}

function getProductPriceMinorUnits(product?: WooCommerceProduct) {
    const price = parsePrice(product?.price ?? "");

    return Math.max(0, Math.round(price * 100));
}

function findProduct(products: WooCommerceProduct[], productId: number) {
    return products.find((product) => product.productId === productId) ?? null;
}

export async function buildCartApiResponseForUser(userEmail: string) {
    const [cart, products] = await Promise.all([
        getCartRecord(userEmail),
        getWooCommerceProducts(),
    ]);

    const items = cart.items.map((entry) => {
        const product = findProduct(products, entry.productId);
        const unitPriceMinor = getProductPriceMinorUnits(product ?? undefined);
        const lineTotalMinor = unitPriceMinor * entry.quantity;
        const sizeLabel = entry.size?.trim() ?? "";

        return {
            key: buildKey(entry.productId, entry.size),
            id: entry.productId,
            quantity: entry.quantity,
            name: product?.name ?? `Product ${entry.productId}`,
            short_description: product?.note ?? product?.description ?? "",
            description: product?.description ?? product?.note ?? "",
            permalink: product?.permalink ?? `/products/${entry.productId}`,
            images: [
                {
                    src: product?.image,
                    alt: product?.name,
                },
            ],
            item_data: sizeLabel
                ? [
                      {
                          key: "Size",
                          value: sizeLabel,
                      },
                  ]
                : [],
            prices: {
                price: String(unitPriceMinor),
                currency_code: "USD",
                currency_minor_unit: 2,
                currency_symbol: "$",
            },
            totals: {
                line_total: String(lineTotalMinor),
                currency_code: "USD",
                currency_minor_unit: 2,
                currency_symbol: "$",
            },
        };
    });

    const subtotalMinor = items.reduce((sum, item) => {
        const amount = Number(item.totals?.line_total ?? 0);
        return sum + (Number.isFinite(amount) ? amount : 0);
    }, 0);

    const response: CartApiResponse = {
        items,
        totals: {
            total_items: String(subtotalMinor),
            total_shipping: "0",
            total_price: String(subtotalMinor),
            currency_code: "USD",
            currency_minor_unit: 2,
            currency_symbol: "$",
            currency_prefix: "$",
            currency_suffix: "",
        },
        shipping_rates: [],
    };

    return response;
}

export function getCartUserEmailFromToken(authToken?: string) {
    return getAuthEmailFromToken(authToken);
}

export function getCartItemKey(productId: number, size?: string) {
    return buildKey(productId, size);
}

export function parseCartItemKey(key: string) {
    return parseKey(key);
}
