import {
    createSessionToken,
    getAuthCookieName,
    getSessionTtlSeconds,
    hashPassword,
} from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

type SignupBody = {
    name?: string;
    email?: string;
    password?: string;
};

export async function POST(request: Request) {
    const body = (await request.json().catch(() => null)) as SignupBody | null;

    const name = body?.name?.trim() ?? "";
    const email = body?.email?.trim().toLowerCase() ?? "";
    const password = body?.password ?? "";

    if (!name || !email || !password) {
        return Response.json(
            { message: "Name, email and password are required." },
            { status: 400 },
        );
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
        return Response.json(
            { message: "Please provide a valid email." },
            { status: 400 },
        );
    }

    if (password.length < 6) {
        return Response.json(
            { message: "Password must be at least 6 characters." },
            { status: 400 },
        );
    }

    try {
        const existingUser = await prisma.user.findUnique({
            where: {
                email,
            },
            select: {
                id: true,
            },
        });

        if (existingUser) {
            return Response.json(
                {
                    message: "An account with this email already exists.",
                },
                { status: 409 },
            );
        }

        const createdUser = await prisma.user.create({
            data: {
                name,
                email,
                passwordHash: hashPassword(password),
            },
            select: {
                id: true,
                name: true,
                email: true,
            },
        });

        const token = createSessionToken({
            userId: createdUser.id,
            email: createdUser.email,
            name: createdUser.name,
        });

        const response = NextResponse.json({
            message: "Account created successfully.",
            user: createdUser,
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
                message: "Unable to create account right now.",
            },
            { status: 500 },
        );
    }
}
