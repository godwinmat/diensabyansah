import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

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
    await prisma.inboxMessage.create({
        data: {
            source: "CONTACT",
            name: `${firstName} ${lastName}`.trim(),
            email,
            message,
        },
    });

    return NextResponse.json({
        message: "Thanks for reaching out. Your message has been sent.",
    });
}
