import {
    getAdminCookieName,
    verifyAdminSessionToken,
} from "@/lib/admin-auth";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
    const cookieStore = await cookies();
    const token = cookieStore.get(getAdminCookieName())?.value ?? "";
    const payload = verifyAdminSessionToken(token);

    if (!payload) {
        const response = NextResponse.json(
            {
                authenticated: false,
            },
            {
                status: 200,
            },
        );

        response.cookies.set(getAdminCookieName(), "", {
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
            email: payload.email,
        },
        {
            status: 200,
        },
    );
}
