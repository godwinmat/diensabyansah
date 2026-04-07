import { wooStoreRequest } from "@/lib/woocommerce-store-cart";

const CART_SNAPSHOT_META_KEY = "diensa_cart_snapshot_v1";

type JwtPayload = {
    email?: string;
    user_email?: string;
};

type CustomerMeta = {
    id?: number;
    key?: string;
    value?: unknown;
};

type WooCustomerRecord = {
    id?: number;
    email?: string;
    meta_data?: CustomerMeta[];
};

export type CartSnapshotItem = {
    productId: number;
    quantity: number;
    size?: string;
};

type WooCartData = {
    items?: Array<{
        id?: number;
        quantity?: number;
        variation?: Array<{ attribute?: string; value?: string }>;
        item_data?: Array<{ key?: string; value?: string }>;
    }>;
};

function getWordPressApiUrl() {
    return process.env.WORDPRESS_API_URL?.replace(/\/$/, "") ?? "";
}

function getWooAuthorizationHeader() {
    const consumerKey = process.env.WOOCOMMERCE_CONSUMER_KEY?.trim();
    const consumerSecret = process.env.WOOCOMMERCE_CONSUMER_SECRET?.trim();

    if (!consumerKey || !consumerSecret) {
        return "";
    }

    return `Basic ${Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64")}`;
}

function decodeJwtPayload(token: string): JwtPayload | null {
    try {
        const payloadSegment = token.split(".")[1];

        if (!payloadSegment) {
            return null;
        }

        const payloadBase64 = payloadSegment
            .replace(/-/g, "+")
            .replace(/_/g, "/")
            .padEnd(Math.ceil(payloadSegment.length / 4) * 4, "=");

        const payloadString = Buffer.from(payloadBase64, "base64").toString(
            "utf8",
        );

        return JSON.parse(payloadString) as JwtPayload;
    } catch {
        return null;
    }
}

function getEmailFromAuthToken(authToken?: string) {
    const token = authToken?.trim() ?? "";

    if (!token) {
        return "";
    }

    const payload = decodeJwtPayload(token);

    return payload?.email?.trim() || payload?.user_email?.trim() || "";
}

function stripHtml(value?: string) {
    return (value ?? "")
        .replace(/<[^>]*>/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

function extractSize(item: {
    variation?: Array<{ attribute?: string; value?: string }>;
    item_data?: Array<{ key?: string; value?: string }>;
}) {
    const variationMatch = (item.variation ?? []).find((entry) => {
        const attribute = String(entry.attribute ?? "").toLowerCase();
        return attribute.includes("size") || attribute.includes("pa_size");
    });

    if (variationMatch?.value?.trim()) {
        return variationMatch.value.trim();
    }

    const itemDataMatch = (item.item_data ?? []).find((entry) =>
        String(entry.key ?? "")
            .toLowerCase()
            .includes("size"),
    );

    return stripHtml(itemDataMatch?.value).trim();
}

export function getSnapshotFromWooCart(cart: unknown): CartSnapshotItem[] {
    const cartData = (cart ?? {}) as WooCartData;

    return (cartData.items ?? [])
        .map((item) => {
            const productId = Number(item.id ?? 0);
            const quantity = Math.max(1, Number(item.quantity ?? 1));
            const size = extractSize(item);

            return {
                productId,
                quantity,
                size: size || undefined,
            };
        })
        .filter(
            (item) => Number.isFinite(item.productId) && item.productId > 0,
        );
}

async function findCustomerByEmail(
    email: string,
): Promise<WooCustomerRecord | null> {
    const wordpressApiUrl = getWordPressApiUrl();
    const authorization = getWooAuthorizationHeader();

    if (!wordpressApiUrl || !authorization || !email) {
        return null;
    }

    const exactUrl = new URL(`${wordpressApiUrl}/wc/v3/customers`);
    exactUrl.searchParams.set("email", email);

    const exactResponse = await fetch(exactUrl, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Authorization: authorization,
        },
        cache: "no-store",
    });

    const exactPayload = (await exactResponse
        .json()
        .catch(() => [])) as unknown;

    if (Array.isArray(exactPayload) && exactPayload.length > 0) {
        return exactPayload[0] as WooCustomerRecord;
    }

    const fallbackUrl = new URL(`${wordpressApiUrl}/wc/v3/customers`);
    fallbackUrl.searchParams.set("search", email);

    const fallbackResponse = await fetch(fallbackUrl, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Authorization: authorization,
        },
        cache: "no-store",
    });

    const fallbackPayload = (await fallbackResponse
        .json()
        .catch(() => [])) as unknown;

    if (!Array.isArray(fallbackPayload)) {
        return null;
    }

    const exactMatch = fallbackPayload.find((record) => {
        const candidateEmail = String(
            (record as WooCustomerRecord).email ?? "",
        ).toLowerCase();
        return candidateEmail === email.toLowerCase();
    });

    return (
        (exactMatch as WooCustomerRecord | undefined) ??
        (fallbackPayload[0] as WooCustomerRecord | undefined) ??
        null
    );
}

export async function loadUserCartSnapshotFromAuthToken(authToken?: string) {
    const email = getEmailFromAuthToken(authToken);

    if (!email) {
        return [] as CartSnapshotItem[];
    }

    const customer = await findCustomerByEmail(email);

    if (!customer) {
        return [];
    }

    const snapshotMeta = (customer.meta_data ?? []).find(
        (meta) => meta.key === CART_SNAPSHOT_META_KEY,
    );

    if (!snapshotMeta) {
        return [];
    }

    const value = snapshotMeta.value;

    if (Array.isArray(value)) {
        return value
            .map((entry) => ({
                productId: Number((entry as { productId?: unknown }).productId),
                quantity: Math.max(
                    1,
                    Number((entry as { quantity?: unknown }).quantity ?? 1),
                ),
                size:
                    typeof (entry as { size?: unknown }).size === "string"
                        ? ((entry as { size?: string }).size ?? "").trim() ||
                          undefined
                        : undefined,
            }))
            .filter(
                (entry) =>
                    Number.isFinite(entry.productId) && entry.productId > 0,
            );
    }

    if (typeof value === "string") {
        try {
            const parsed = JSON.parse(value) as unknown;
            if (Array.isArray(parsed)) {
                return parsed
                    .map((entry) => ({
                        productId: Number(
                            (entry as { productId?: unknown }).productId,
                        ),
                        quantity: Math.max(
                            1,
                            Number(
                                (entry as { quantity?: unknown }).quantity ?? 1,
                            ),
                        ),
                        size:
                            typeof (entry as { size?: unknown }).size ===
                            "string"
                                ? (
                                      (entry as { size?: string }).size ?? ""
                                  ).trim() || undefined
                                : undefined,
                    }))
                    .filter(
                        (entry) =>
                            Number.isFinite(entry.productId) &&
                            entry.productId > 0,
                    );
            }
        } catch {
            return [];
        }
    }

    return [];
}

export async function saveUserCartSnapshotFromAuthToken(options: {
    authToken?: string;
    snapshot: CartSnapshotItem[];
}) {
    const email = getEmailFromAuthToken(options.authToken);
    const wordpressApiUrl = getWordPressApiUrl();
    const authorization = getWooAuthorizationHeader();

    if (!email || !wordpressApiUrl || !authorization) {
        return;
    }

    const customer = await findCustomerByEmail(email);

    if (!customer?.id) {
        return;
    }

    const existingMeta = (customer.meta_data ?? []).find(
        (meta) => meta.key === CART_SNAPSHOT_META_KEY,
    );

    const updatePayload: {
        meta_data: Array<{
            key: string;
            value: CartSnapshotItem[];
            id?: number;
        }>;
    } = {
        meta_data: [
            {
                ...(existingMeta?.id ? { id: existingMeta.id } : {}),
                key: CART_SNAPSHOT_META_KEY,
                value: options.snapshot,
            },
        ],
    };

    await fetch(`${wordpressApiUrl}/wc/v3/customers/${customer.id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: authorization,
        },
        body: JSON.stringify(updatePayload),
        cache: "no-store",
    }).catch(() => null);
}

export async function hydrateWooSessionCartFromSnapshot(options: {
    snapshot: CartSnapshotItem[];
    cartToken?: string | null;
    nonce?: string | null;
    cookieHeader?: string;
    authToken?: string;
}) {
    let cartToken = options.cartToken ?? null;
    let nonce = options.nonce ?? null;

    for (const entry of options.snapshot) {
        if (!Number.isFinite(entry.productId) || entry.productId <= 0) {
            continue;
        }

        let result = await wooStoreRequest({
            path: "/cart/add-item",
            method: "POST",
            body: entry.size
                ? {
                      id: entry.productId,
                      quantity: entry.quantity,
                      variation: [{ attribute: "pa_size", value: entry.size }],
                  }
                : {
                      id: entry.productId,
                      quantity: entry.quantity,
                  },
            cartToken: cartToken ?? undefined,
            nonce: nonce ?? undefined,
            cookieHeader: options.cookieHeader,
            authToken: options.authToken,
        });

        if (!result.ok && entry.size) {
            result = await wooStoreRequest({
                path: "/cart/add-item",
                method: "POST",
                body: {
                    id: entry.productId,
                    quantity: entry.quantity,
                    variation: [{ attribute: "Size", value: entry.size }],
                },
                cartToken: cartToken ?? undefined,
                nonce: nonce ?? undefined,
                cookieHeader: options.cookieHeader,
                authToken: options.authToken,
            });
        }

        if (result.cartToken) {
            cartToken = result.cartToken;
        }

        if (result.nonce) {
            nonce = result.nonce;
        }
    }

    return { cartToken, nonce };
}
