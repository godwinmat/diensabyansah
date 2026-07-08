import {
    createSessionToken,
    getAuthCookieName,
    hashPassword,
    verifyPassword,
    verifySessionToken,
} from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

function normalizeString(value: unknown) {
    return typeof value === "string" ? value.trim() : "";
}

export async function PATCH(request: NextRequest) {
    const token = request.cookies.get(getAuthCookieName())?.value ?? "";
    const session = verifySessionToken(token);

    if (!session) {
        return NextResponse.json(
            { success: false, message: "Authentication is required" },
            { status: 401 },
        );
    }

    const body = (await request.json().catch(() => null)) as {
        name?: string;
        email?: string;
        currentPassword?: string;
        newPassword?: string;
    } | null;

    const nextName = normalizeString(body?.name);
    const nextEmail = normalizeString(body?.email).toLowerCase();
    const currentPassword = normalizeString(body?.currentPassword);
    const newPassword = normalizeString(body?.newPassword);

    if (!nextName || !nextEmail || !currentPassword) {
        return NextResponse.json(
            {
                success: false,
                message: "Name, email, and current password are required.",
            },
            { status: 400 },
        );
    }

    if (newPassword && newPassword.length < 6) {
        return NextResponse.json(
            {
                success: false,
                message: "New password must be at least 6 characters.",
            },
            { status: 400 },
        );
    }

    const user = await prisma.user.findUnique({
        where: { id: session.sub },
        select: {
            id: true,
            name: true,
            email: true,
            passwordHash: true,
        },
    });

    if (!user) {
        return NextResponse.json(
            { success: false, message: "User not found." },
            { status: 404 },
        );
    }

    if (!verifyPassword(currentPassword, user.passwordHash)) {
        return NextResponse.json(
            { success: false, message: "Current password is incorrect." },
            { status: 400 },
        );
    }

    const emailChanged = nextEmail !== user.email;

    if (emailChanged) {
        const existing = await prisma.user.findUnique({
            where: { email: nextEmail },
            select: { id: true },
        });

        if (existing) {
            return NextResponse.json(
                { success: false, message: "That email is already in use." },
                { status: 409 },
            );
        }
    }

    const updated = await prisma.$transaction(async (tx) => {
        const savedUser = await tx.user.update({
            where: { id: user.id },
            data: {
                name: nextName,
                email: nextEmail,
                ...(newPassword
                    ? { passwordHash: hashPassword(newPassword) }
                    : {}),
            },
            select: {
                id: true,
                name: true,
                email: true,
            },
        });

        if (emailChanged) {
            await tx.cart.updateMany({
                where: { userEmail: user.email },
                data: { userEmail: nextEmail },
            });
        }

        return savedUser;
    });

    const response = NextResponse.json({
        success: true,
        message: "Profile updated successfully.",
        user: updated,
    });

    response.cookies.set(
        getAuthCookieName(),
        createSessionToken({
            userId: updated.id,
            email: updated.email,
            name: updated.name,
        }),
        {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 60 * 60 * 24 * 7,
        },
    );

    return response;
}
