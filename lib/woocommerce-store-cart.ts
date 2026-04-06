export const WC_CART_TOKEN_COOKIE = "wc_cart_token";
export const WC_STORE_NONCE_COOKIE = "wc_store_nonce";

export type WooStoreResult = {
    ok: boolean;
    status: number;
    data: unknown;
    cartToken: string | null;
    nonce: string | null;
    setCookieHeaders: string[];
};

function getWordPressApiUrl() {
    return process.env.WORDPRESS_API_URL?.replace(/\/$/, "") ?? "";
}

export async function wooStoreRequest(options: {
    path: string;
    method?: "GET" | "POST";
    body?: Record<string, unknown>;
    cartToken?: string;
    nonce?: string;
    cookieHeader?: string;
}): Promise<WooStoreResult> {
    const wordpressApiUrl = getWordPressApiUrl();

    if (!wordpressApiUrl) {
        return {
            ok: false,
            status: 500,
            data: { message: "WORDPRESS_API_URL is not configured" },
            cartToken: null,
            nonce: null,
            setCookieHeaders: [],
        };
    }

    const headers: HeadersInit = {
        "Content-Type": "application/json",
    };

    if (options.cartToken) {
        headers["Cart-Token"] = options.cartToken;
    }

    if (options.nonce) {
        headers.Nonce = options.nonce;
    }

    if (options.cookieHeader) {
        headers.Cookie = options.cookieHeader;
    }

    const response = await fetch(
        `${wordpressApiUrl}/wc/store/v1${options.path}`,
        {
            method: options.method ?? "GET",
            cache: "no-store",
            headers,
            body: options.body ? JSON.stringify(options.body) : undefined,
        },
    );

    const data = (await response.json().catch(() => null)) as unknown;

    const getSetCookie = (
        response.headers as Headers & {
            getSetCookie?: () => string[];
        }
    ).getSetCookie;
    const setCookieHeaders =
        typeof getSetCookie === "function"
            ? getSetCookie.call(response.headers)
            : [];

    return {
        ok: response.ok,
        status: response.status,
        data,
        cartToken: response.headers.get("cart-token"),
        nonce: response.headers.get("nonce"),
        setCookieHeaders,
    };
}

export function getForwardableWooCookieHeader(cookieHeader?: string | null) {
    if (!cookieHeader) {
        return "";
    }

    const allowedPrefixes = [
        "woocommerce_",
        "wp_woocommerce_session_",
        "wordpress_logged_in_",
        WC_CART_TOKEN_COOKIE,
        WC_STORE_NONCE_COOKIE,
    ];

    return cookieHeader
        .split(";")
        .map((entry) => entry.trim())
        .filter((entry) => {
            const key = entry.split("=")[0] ?? "";
            return allowedPrefixes.some(
                (prefix) => key === prefix || key.startsWith(prefix),
            );
        })
        .join("; ");
}

export function extractErrorMessage(payload: unknown, fallback: string) {
    if (!payload || typeof payload !== "object") {
        return fallback;
    }

    const maybeMessage = (payload as { message?: unknown }).message;
    return typeof maybeMessage === "string" && maybeMessage.length > 0
        ? maybeMessage
        : fallback;
}
