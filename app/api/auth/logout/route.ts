import {
    WC_CART_TOKEN_COOKIE,
    WC_CUSTOMER_ID_COOKIE,
    WC_STORE_NONCE_COOKIE,
} from "@/lib/woocommerce-store-cart";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value ?? "";

    const wpApiUrl =
        process.env.WORDPRESS_API_URL ?? "https://diensabyansah.com/wp-json";
    const revokePath =
        process.env.WORDPRESS_JWT_REVOKE_PATH ??
        "/simple-jwt-login/v1/auth/revoke";
    const authCode = process.env.WORDPRESS_JWT_AUTH_CODE;

    if (token) {
        try {
            await fetch(`${wpApiUrl}${revokePath}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    JWT: token,
                    ...(authCode ? { AUTH_CODE: authCode } : {}),
                }),
            });
        } catch {
            // Ignore revoke errors and always clear local session cookie.
        }
    }

    const response = NextResponse.json(
        { message: "Signed out successfully." },
        { status: 200 },
    );

    response.cookies.set("auth_token", "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 0,
    });

    response.cookies.set(WC_CART_TOKEN_COOKIE, "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 0,
    });

    response.cookies.set(WC_STORE_NONCE_COOKIE, "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 0,
    });

    response.cookies.set(WC_CUSTOMER_ID_COOKIE, "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 0,
    });

    return response;
}
