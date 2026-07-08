import { createPasswordResetCode } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(request: Request) {
    try {
        const { email } = await request.json();
        const normalizedEmail = String(email ?? "").trim().toLowerCase();

        if (!normalizedEmail) {
            return NextResponse.json(
                { success: false, message: "Email is required" },
                { status: 400 },
            );
        }

        const user = await prisma.user.findUnique({
            where: {
                email: normalizedEmail,
            },
            select: {
                id: true,
                email: true,
                name: true,
            },
        });

        if (!user) {
            return NextResponse.json({
                success: true,
                message: "If an account exists, a reset code has been sent.",
            });
        }

        const resetCode = createPasswordResetCode();
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

        await prisma.user.update({
            where: {
                id: user.id,
            },
            data: {
                resetCode,
                resetCodeExpiresAt: expiresAt,
            },
        });

        const smtpHost = process.env.SMTP_HOST?.trim() ?? "";
        const smtpPort = Number(process.env.SMTP_PORT ?? "0");
        const smtpUser = process.env.SMTP_USER?.trim() ?? "";
        const smtpPass = process.env.SMTP_PASS?.trim() ?? "";
        const smtpFrom = process.env.SMTP_FROM?.trim() ?? smtpUser;
        const smtpSecure = String(process.env.SMTP_SECURE ?? "false") === "true";

        if (!smtpHost || !smtpPort || !smtpUser || !smtpPass || !smtpFrom) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Email is not configured. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, and SMTP_FROM.",
                },
                { status: 500 },
            );
        }

        const transporter = nodemailer.createTransport({
            host: smtpHost,
            port: smtpPort,
            secure: smtpSecure,
            auth: {
                user: smtpUser,
                pass: smtpPass,
            },
        });

        await transporter.sendMail({
            from: smtpFrom,
            to: user.email,
            subject: "Your password reset code",
            text: [
                `Hello ${user.name},`,
                "",
                `Your Diensa password reset code is: ${resetCode}`,
                "This code expires in 15 minutes.",
                "",
                "If you did not request this, you can ignore this email.",
            ].join("\n"),
        });

        return NextResponse.json({
            success: true,
            message: "Reset code sent to your email",
        });
    } catch (error) {
        console.error("Reset code error:", error);
        return NextResponse.json(
            { success: false, message: "Internal server error" },
            { status: 500 },
        );
    }
}
