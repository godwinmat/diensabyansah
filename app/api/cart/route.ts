import {
    getSnapshotFromWooCart,
    hydrateWooSessionCartFromSnapshot,
    loadUserCartSnapshotFromAuthToken,
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

export async function GET(request: NextRequest) {
    const cartToken = request.cookies.get(WC_CART_TOKEN_COOKIE)?.value;
    const nonce = request.cookies.get(WC_STORE_NONCE_COOKIE)?.value;
    const authToken = request.cookies.get("auth_token")?.value;
    const cookieHeader = getForwardableWooCookieHeader(
        request.headers.get("cookie"),
    );

    const cartResult = await wooStoreRequest({
        path: "/cart",
        method: "GET",
        cartToken,
        nonce,
        cookieHeader,
        authToken,
    });

    let finalCartResult = cartResult;

    if (authToken && cartResult.ok) {
        const currentSnapshot = getSnapshotFromWooCart(cartResult.data);

        if (currentSnapshot.length === 0) {
            const storedSnapshot =
                await loadUserCartSnapshotFromAuthToken(authToken);

            if (storedSnapshot.length > 0) {
                const hydratedSession = await hydrateWooSessionCartFromSnapshot(
                    {
                        snapshot: storedSnapshot,
                        cartToken: cartResult.cartToken,
                        nonce: cartResult.nonce,
                        cookieHeader,
                        authToken,
                    },
                );

                finalCartResult = await wooStoreRequest({
                    path: "/cart",
                    method: "GET",
                    cartToken:
                        hydratedSession.cartToken ??
                        cartResult.cartToken ??
                        undefined,
                    nonce:
                        hydratedSession.nonce ?? cartResult.nonce ?? undefined,
                    cookieHeader,
                    authToken,
                });
            }
        } else {
            await saveUserCartSnapshotFromAuthToken({
                authToken,
                snapshot: currentSnapshot,
            });
        }
    }

    const response = NextResponse.json(
        finalCartResult.ok
            ? {
                  success: true,
                  cart: finalCartResult.data,
              }
            : {
                  success: false,
                  message: extractErrorMessage(
                      finalCartResult.data,
                      "Failed to fetch cart",
                  ),
                  cart: null,
              },
        {
            status: finalCartResult.ok ? 200 : finalCartResult.status || 500,
        },
    );

    attachCartSessionCookies(
        response,
        finalCartResult.cartToken,
        finalCartResult.nonce,
        finalCartResult.setCookieHeaders,
    );

    return response;
}
