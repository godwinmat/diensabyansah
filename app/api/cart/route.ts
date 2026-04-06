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

export async function GET(request: NextRequest) {
    const cartToken = request.cookies.get(WC_CART_TOKEN_COOKIE)?.value;
    const nonce = request.cookies.get(WC_STORE_NONCE_COOKIE)?.value;
    const cookieHeader = getForwardableWooCookieHeader(
        request.headers.get("cookie"),
    );

    const cartResult = await wooStoreRequest({
        path: "/cart",
        method: "GET",
        cartToken,
        nonce,
        cookieHeader,
    });

    const response = NextResponse.json(
        cartResult.ok
            ? {
                  success: true,
                  cart: cartResult.data,
              }
            : {
                  success: false,
                  message: extractErrorMessage(
                      cartResult.data,
                      "Failed to fetch cart",
                  ),
                  cart: null,
              },
        { status: cartResult.ok ? 200 : cartResult.status || 500 },
    );

    attachCartSessionCookies(
        response,
        cartResult.cartToken,
        cartResult.nonce,
        cartResult.setCookieHeaders,
    );

    return response;
}
