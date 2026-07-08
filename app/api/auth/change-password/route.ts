import { hashPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const { email, code, newPassword } = await request.json();
        const normalizedEmail = String(email ?? "").trim().toLowerCase();
        const normalizedCode = String(code ?? "").trim();
        const normalizedPassword = String(newPassword ?? "");

        if (!normalizedEmail || !normalizedCode || !normalizedPassword) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Email, code, and new password are required",
                },
                { status: 400 },
            );
        }

        if (normalizedPassword.length < 6) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Password must be at least 6 characters",
                },
                { status: 400 },
            );
        }

        const user = await prisma.user.findUnique({
            where: {
                email: normalizedEmail,
            },
            select: {
                id: true,
                resetCode: true,
                resetCodeExpiresAt: true,
            },
        });

        if (!user || !user.resetCode || !user.resetCodeExpiresAt) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid or expired reset code",
                },
                { status: 400 },
            );
        }

        if (
            user.resetCode !== normalizedCode ||
            user.resetCodeExpiresAt.getTime() <= Date.now()
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid or expired reset code",
                },
                { status: 400 },
            );
        }

        await prisma.user.update({
            where: {
                id: user.id,
            },
            data: {
                passwordHash: hashPassword(normalizedPassword),
                resetCode: null,
                resetCodeExpiresAt: null,
            },
        });

        return NextResponse.json({
            success: true,
            message: "Password reset successfully",
        });
    } catch (error) {
        console.error("Change password error:", error);
        return NextResponse.json(
            { success: false, message: "Internal server error" },
            { status: 500 },
        );
    }
}
