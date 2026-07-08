import { getAuthCookieName } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST() {
    const response = NextResponse.json(
        { message: "Signed out successfully." },
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
