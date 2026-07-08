import { getAdminCookieName } from "@/lib/admin-auth";
import { NextResponse } from "next/server";

export async function POST() {
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
