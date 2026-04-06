import { NextResponse } from "next/server";

type SigninBody = {
    email?: string;
    password?: string;
};

export async function POST(request: Request) {
    const body = (await request.json().catch(() => null)) as SigninBody | null;

    const email = body?.email?.trim().toLowerCase() ?? "";
    const password = body?.password ?? "";
    const wpApiUrl = process.env.WORDPRESS_API_URL;
    const jwtSigninPath = process.env.WORDPRESS_JWT_TOKEN_PATH;

    if (!email || !password) {
        return Response.json(
            { message: "Email and password are required." },
            { status: 400 },
        );
    }

    const jwtResponse = await fetch(`${wpApiUrl}${jwtSigninPath}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            email,
            password,
        }),
    });

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

    return response;
}
