import {
    createSessionToken,
    getAuthCookieName,
    getSessionTtlSeconds,
    verifyPassword,
} from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

type SigninBody = {
    email?: string;
    password?: string;
};

export async function POST(request: Request) {
    const body = (await request.json().catch(() => null)) as SigninBody | null;

    const email = body?.email?.trim().toLowerCase() ?? "";
    const password = body?.password ?? "";
    if (!email || !password) {
        return Response.json(
            { message: "Email and password are required." },
            { status: 400 },
        );
    }

    try {
        const user = await prisma.user.findUnique({
            where: {
                email,
            },
            select: {
                id: true,
                name: true,
                email: true,
                passwordHash: true,
            },
        });

        if (!user || !verifyPassword(password, user.passwordHash)) {
            return Response.json(
                { message: "Invalid email or password." },
                { status: 401 },
            );
        }

        const token = createSessionToken({
            userId: user.id,
            email: user.email,
            name: user.name,
        });

        const response = NextResponse.json({
            message: "Signed in successfully.",
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
            },
        });

        response.cookies.set(getAuthCookieName(), token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: getSessionTtlSeconds(),
        });

        return response;
    } catch {
        return Response.json(
            {
                message: "Unable to sign in right now. Please try again later.",
            },
            { status: 500 },
        );
    }
}
