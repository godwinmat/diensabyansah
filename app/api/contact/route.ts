import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

type ContactBody = {
    firstName?: string;
    lastName?: string;
    email?: string;
    message?: string;
};

export const runtime = "nodejs";

export async function POST(request: Request) {
    const body = (await request.json().catch(() => null)) as ContactBody | null;

    const firstName = body?.firstName?.trim() ?? "";
    const lastName = body?.lastName?.trim() ?? "";
    const email = body?.email?.trim().toLowerCase() ?? "";
    const message = body?.message?.trim() ?? "";

    if (!firstName || !lastName || !email || !message) {
        return NextResponse.json(
            {
                message:
                    "First name, last name, email and message are required.",
            },
            { status: 400 },
        );
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
        return NextResponse.json(
            { message: "Please provide a valid email address." },
            { status: 400 },
        );
    }

    const smtpHost = process.env.SMTP_HOST?.trim() ?? "";
    const smtpPort = Number(process.env.SMTP_PORT ?? "0");
    const smtpUser = process.env.SMTP_USER?.trim() ?? "";
    const smtpPass = process.env.SMTP_PASS?.trim() ?? "";
    const smtpFrom = process.env.SMTP_FROM?.trim() ?? smtpUser;
    const contactToEmail =
        process.env.CONTACT_TO_EMAIL?.trim() ?? "info@diensabyansah.com";
    const smtpSecure = String(process.env.SMTP_SECURE ?? "false") === "true";

    if (!smtpHost || !smtpPort || !smtpUser || !smtpPass || !smtpFrom) {
        return NextResponse.json(
            {
                message:
                    "Email is not configured. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, and SMTP_FROM.",
            },
            { status: 500 },
        );
    }

    const senderName = `${firstName} ${lastName}`.trim();

    try {
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
            to: contactToEmail,
            replyTo: email,
            subject: `New contact inquiry from ${senderName}`,
            text: [
                `Name: ${senderName}`,
                `Email: ${email}`,
                "",
                "Message:",
                message,
            ].join("\n"),
            html: `
                <p><strong>Name:</strong> ${senderName}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Message:</strong></p>
                <p>${message.replace(/\n/g, "<br />")}</p>
            `,
        });
    } catch {
        return NextResponse.json(
            { message: "Failed to send email. Check SMTP credentials." },
            { status: 502 },
        );
    }

    return NextResponse.json({
        message: "Thanks for reaching out. Your message has been sent.",
    });
}
