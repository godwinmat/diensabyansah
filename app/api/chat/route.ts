import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

type ChatBody = {
    name?: string;
    email?: string;
    phone?: string;
    message?: string;
};

function normalize(value: unknown) {
    return typeof value === "string" ? value.trim() : "";
}

export async function POST(request: Request) {
    const body = (await request.json().catch(() => null)) as ChatBody | null;

    const name = normalize(body?.name);
    const email = normalize(body?.email).toLowerCase();
    const phone = normalize(body?.phone);
    const message = normalize(body?.message);

    if (!message) {
        return NextResponse.json(
            { message: "Please enter a message." },
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

    if (!phone) {
        return NextResponse.json(
            { message: "Phone number is required." },
            { status: 400 },
        );
    }

    await prisma.inboxMessage.create({
        data: {
            source: "CHAT",
            name: name || null,
            email,
            phone,
            message,
        },
    });

    return NextResponse.json({
        message: "Message received.",
    });
}
