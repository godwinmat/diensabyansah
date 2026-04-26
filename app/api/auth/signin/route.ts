import { ensureWooCustomerRecord } from "@/lib/woocommerce-customer-cart-sync";
import {
    WC_CART_TOKEN_COOKIE,
    WC_CUSTOMER_ID_COOKIE,
    WC_STORE_NONCE_COOKIE,
} from "@/lib/woocommerce-store-cart";
import { NextResponse } from "next/server";

type SigninBody = {
    email?: string;
    password?: string;
};

export async function POST(request: Request) {
    const body = (await request.json().catch(() => null)) as SigninBody | null;

    const email = body?.email?.trim().toLowerCase() ?? "";
    const password = body?.password ?? "";
    const wpApiUrl = process.env.WORDPRESS_API_URL?.trim() ?? "";
    const jwtSigninPath = process.env.WORDPRESS_JWT_TOKEN_PATH?.trim() ?? "";

    if (!email || !password) {
        return Response.json(
            { message: "Email and password are required." },
            { status: 400 },
        );
    }

    if (!wpApiUrl || !jwtSigninPath) {
        return Response.json(
            {
                message:
                    "WORDPRESS_API_URL and WORDPRESS_JWT_TOKEN_PATH must be configured for sign in.",
            },
            { status: 500 },
        );
    }

    let jwtResponse: Response;

    try {
        jwtResponse = await fetch(`${wpApiUrl}${jwtSigninPath}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email,
                password,
            }),
        });
    } catch {
        return Response.json(
            {
                message:
                    "Unable to reach WordPress while signing in. Please try again later.",
            },
            { status: 502 },
        );
    }

    const jwtData = (await jwtResponse.json().catch(() => null)) as {
        success?: boolean;
        data?: {
            jwt?: string;
            message?: string;
        };
        message?: string;
        msg?: string;
    } | null;

    const jwtToken = jwtData?.data?.jwt ?? "";

    if (!jwtResponse.ok || !jwtData?.success || !jwtToken) {
        return Response.json(
            {
                message:
                    jwtData?.message ??
                    jwtData?.msg ??
                    jwtData?.data?.message ??
                    "Sign in failed from Simple JWT Login endpoint.",
            },
            { status: jwtResponse.status || 401 },
        );
    }

    const wooCustomer = await ensureWooCustomerRecord({
        email,
        name: email,
    }).catch(() => null);

    const response = NextResponse.json({
        message: "Signed in successfully.",
        token: jwtToken,
        user: {
            id: email,
            name: email,
            email,
        },
    });

    response.cookies.set("auth_token", jwtToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
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

    if (wooCustomer?.id) {
        response.cookies.set(WC_CUSTOMER_ID_COOKIE, String(wooCustomer.id), {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 60 * 60 * 24 * 7,
        });
    }

    return response;
}
