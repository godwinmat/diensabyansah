import { validateAdminLoginCredentials } from "@/lib/admin-account";
import {
    createAdminSessionToken,
    getAdminCookieName,
    getAdminSessionTtlSeconds,
} from "@/lib/admin-auth";
import { NextResponse } from "next/server";

type AdminLoginBody = {
    email?: string;
    password?: string;
};

export async function POST(request: Request) {
    const body = (await request
        .json()
        .catch(() => null)) as AdminLoginBody | null;

    const email = body?.email?.trim().toLowerCase() ?? "";
    const password = body?.password?.trim() ?? "";

    if (!email || !password) {
        return NextResponse.json(
            {
                message: "Email and password are required.",
            },
            {
                status: 400,
            },
        );
    }

    const validation = await validateAdminLoginCredentials(email, password);

    if (!validation.ok) {
        return NextResponse.json(
            {
                message: validation.message,
            },
            {
                status: 401,
            },
        );
    }

    const token = createAdminSessionToken(validation.email ?? email);

    const response = NextResponse.json(
        {
            authenticated: true,
        },
        {
            status: 200,
        },
    );

    response.cookies.set(getAdminCookieName(), token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: getAdminSessionTtlSeconds(),
    });

    return response;
}
