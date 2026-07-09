import { getAdminCookieName, verifyAdminSessionToken } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

async function isAdminAuthenticated() {
    const cookieStore = await cookies();
    const token = cookieStore.get(getAdminCookieName())?.value ?? "";
    return Boolean(verifyAdminSessionToken(token));
}

export async function GET() {
    if (!(await isAdminAuthenticated())) {
        return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }

    const messages = await prisma.inboxMessage.findMany({
        orderBy: { updatedAt: "desc" },
        take: 100,
    });

    return NextResponse.json({ messages });
}
