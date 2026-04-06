import { cookies } from "next/headers";
import { NextResponse } from "next/server";

type JwtPayload = {
    exp?: number;
    email?: string;
    user_email?: string;
    username?: string;
    user_login?: string;
    name?: string;
    display_name?: string;
};

type SessionUser = {
    name: string;
    email: string;
};

function getJwtPayload(token: string): JwtPayload | null {
    try {
        const parts = token.split(".");
        if (parts.length < 2) {
            return null;
        }

        const payloadBase64 = parts[1]
            .replace(/-/g, "+")
            .replace(/_/g, "/")
            .padEnd(Math.ceil(parts[1].length / 4) * 4, "=");

        const payloadString = Buffer.from(payloadBase64, "base64").toString(
            "utf8",
        );

        return JSON.parse(payloadString) as JwtPayload;
    } catch {
        return null;
    }
}

function getSessionUser(payload: JwtPayload | null): SessionUser {
    const email =
        payload?.email?.trim() ||
        payload?.user_email?.trim() ||
        "No email available";
    const name =
        payload?.display_name?.trim() ||
        payload?.name?.trim() ||
        payload?.username?.trim() ||
        payload?.user_login?.trim() ||
        email;

    return {
        name,
        email,
    };
}

export async function GET() {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value ?? "";

    if (!token) {
        return NextResponse.json({ authenticated: false }, { status: 200 });
    }

    const payload = getJwtPayload(token);
    const exp = payload?.exp;

    if (typeof exp === "number" && exp <= Math.floor(Date.now() / 1000)) {
        const response = NextResponse.json(
            { authenticated: false },
            { status: 200 },
        );
        response.cookies.set("auth_token", "", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 0,
        });
        return response;
    }

    return NextResponse.json(
        {
            authenticated: true,
            user: getSessionUser(payload),
        },
        { status: 200 },
    );
}
