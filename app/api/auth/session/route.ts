import { getAuthCookieName, verifySessionToken } from "@/lib/auth";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

type SessionUser = {
    name: string;
    email: string;
};
function getSessionUser(payload: {
    name?: string;
    email?: string;
} | null): SessionUser {
    const email = payload?.email?.trim() || "No email available";
    const name = payload?.name?.trim() || email;

    return {
        name,
        email,
    };
}

export async function GET() {
    const cookieStore = await cookies();
    const token = cookieStore.get(getAuthCookieName())?.value ?? "";

    if (!token) {
        return NextResponse.json({ authenticated: false }, { status: 200 });
    }

    const payload = verifySessionToken(token);

    if (!payload) {
        const response = NextResponse.json(
            { authenticated: false },
            { status: 200 },
        );
        response.cookies.set(getAuthCookieName(), "", {
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
