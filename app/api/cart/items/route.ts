import {
    getSnapshotFromWooCart,
    saveUserCartSnapshotFromAuthToken,
} from "@/lib/woocommerce-customer-cart-sync";
import {
    extractErrorMessage,
    getForwardableWooCookieHeader,
    WC_CART_TOKEN_COOKIE,
    WC_STORE_NONCE_COOKIE,
    wooStoreRequest,
} from "@/lib/woocommerce-store-cart";
import { NextRequest, NextResponse } from "next/server";

function attachCartSessionCookies(
    response: NextResponse,
    cartToken: string | null,
    nonce: string | null,
    setCookieHeaders: string[] = [],
) {
    for (const cookieHeader of setCookieHeaders) {
        response.headers.append("set-cookie", cookieHeader);
    }

    if (cartToken) {
        response.cookies.set(WC_CART_TOKEN_COOKIE, cartToken, {
            httpOnly: true,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production",
            path: "/",
            maxAge: 60 * 60 * 24 * 2,
        });
    }

    if (nonce) {
        response.cookies.set(WC_STORE_NONCE_COOKIE, nonce, {
            httpOnly: true,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production",
            path: "/",
            maxAge: 60 * 60 * 24 * 2,
        });
    }
}

async function loadSession(request: NextRequest) {
    let cartToken = request.cookies.get(WC_CART_TOKEN_COOKIE)?.value;
    let nonce = request.cookies.get(WC_STORE_NONCE_COOKIE)?.value;
    const authToken = request.cookies.get("auth_token")?.value;
    const cookieHeader = getForwardableWooCookieHeader(
        request.headers.get("cookie"),
    );

    if (!cartToken || !nonce) {
        const bootstrap = await wooStoreRequest({
            path: "/cart",
            method: "GET",
            cookieHeader,
            authToken,
        });

        cartToken = bootstrap.cartToken ?? cartToken;
        nonce = bootstrap.nonce ?? nonce;
    }

    return { cartToken, nonce, cookieHeader, authToken };
}

async function executeAction(
    path: string,
    body: Record<string, unknown>,
    request: NextRequest,
) {
    const session = await loadSession(request);

    let result = await wooStoreRequest({
        path,
        method: "POST",
        body,
        cartToken: session.cartToken,
        nonce: session.nonce,
        cookieHeader: session.cookieHeader,
        authToken: session.authToken,
    });

    if (!result.ok && (result.status === 401 || result.status === 403)) {
        const refreshedSession = await wooStoreRequest({
            path: "/cart",
            method: "GET",
            cartToken: result.cartToken ?? session.cartToken,
            cookieHeader: session.cookieHeader,
            authToken: session.authToken,
        });

        result = await wooStoreRequest({
            path,
            method: "POST",
            body,
            cartToken: refreshedSession.cartToken ?? session.cartToken,
            nonce: refreshedSession.nonce ?? session.nonce,
            cookieHeader: session.cookieHeader,
            authToken: session.authToken,
        });
    }

    const response = NextResponse.json(
        result.ok
            ? { success: true, cart: result.data }
            : {
                  success: false,
                  message: extractErrorMessage(
                      result.data,
                      "Cart action failed",
                  ),
                  cart: null,
              },
        { status: result.ok ? 200 : result.status || 500 },
    );

    attachCartSessionCookies(
        response,
        result.cartToken,
        result.nonce,
        result.setCookieHeaders,
    );

    if (result.ok && session.authToken) {
        await saveUserCartSnapshotFromAuthToken({
            authToken: session.authToken,
            snapshot: getSnapshotFromWooCart(result.data),
        });
    }

    return response;
}

export async function POST(request: NextRequest) {
    const body = (await request.json().catch(() => null)) as {
        productId?: number;
        quantity?: number;
        size?: string;
    } | null;

    const productId = Number(body?.productId);
    const quantity = Math.max(1, Number(body?.quantity ?? 1));
    const size = body?.size?.trim() ?? "";

    if (!Number.isFinite(productId) || productId <= 0) {
        return NextResponse.json(
            { success: false, message: "A valid productId is required" },
            { status: 400 },
        );
    }

    if (!size) {
        return executeAction(
            "/cart/add-item",
            {
                id: productId,
                quantity,
            },
            request,
        );
    }

    const withSlugAttribute = await executeAction(
        "/cart/add-item",
        {
            id: productId,
            quantity,
            variation: [{ attribute: "pa_size", value: size }],
        },
        request,
    );

    if (withSlugAttribute.status === 200) {
        return withSlugAttribute;
    }

    return executeAction(
        "/cart/add-item",
        {
            id: productId,
            quantity,
            variation: [{ attribute: "Size", value: size }],
        },
        request,
    );
}

export async function PATCH(request: NextRequest) {
    const body = (await request.json().catch(() => null)) as {
        key?: string;
        quantity?: number;
    } | null;

    const key = body?.key?.trim();
    const quantity = Math.max(0, Number(body?.quantity ?? 0));

    if (!key) {
        return NextResponse.json(
            { success: false, message: "Item key is required" },
            { status: 400 },
        );
    }

    if (quantity <= 0) {
        return executeAction("/cart/remove-item", { key }, request);
    }

    return executeAction(
        "/cart/update-item",
        {
            key,
            quantity,
        },
        request,
    );
}

export async function DELETE(request: NextRequest) {
    const body = (await request.json().catch(() => null)) as {
        key?: string;
    } | null;

    const key = body?.key?.trim();

    if (!key) {
        return NextResponse.json(
            { success: false, message: "Item key is required" },
            { status: 400 },
        );
    }

    return executeAction("/cart/remove-item", { key }, request);
}
