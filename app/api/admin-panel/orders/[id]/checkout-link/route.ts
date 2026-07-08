import {
    getAdminCookieName,
    getAdminLoginPath,
    verifyAdminSessionToken,
} from "@/lib/admin-auth";
import { createFlutterwavePaymentLink } from "@/lib/flutterwave";
import { prisma } from "@/lib/prisma";
import { PaymentStatus } from "@prisma/client";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

type RouteContext = { params: Promise<{ id: string }> };

function getDefaultNameFromEmail(email: string) {
    const local = email.split("@")[0] ?? "Customer";
    const normalized = local
        .replace(/[^a-zA-Z0-9._-]/g, " ")
        .replace(/[._-]+/g, " ")
        .trim();

    return normalized.length > 0 ? normalized : "Customer";
}

function getItemCount(items: unknown) {
    if (!Array.isArray(items)) {
        return 0;
    }

    return items.reduce<number>((total, item) => {
        if (!item || typeof item !== "object" || Array.isArray(item)) {
            return total + 1;
        }

        const quantity = (item as Record<string, unknown>).quantity;
        return total + (typeof quantity === "number" ? quantity : 1);
    }, 0);
}

async function requireAdmin() {
    const cookieStore = await cookies();
    const token = cookieStore.get(getAdminCookieName())?.value ?? "";
    return Boolean(verifyAdminSessionToken(token));
}

export async function GET(_request: Request, { params }: RouteContext) {
    if (!(await requireAdmin())) {
        return NextResponse.redirect(
            new URL(getAdminLoginPath(), _request.url),
        );
    }

    const { id } = await params;

    const order = await prisma.order.findUnique({
        where: { id },
        select: {
            id: true,
            reference: true,
            userEmail: true,
            deliveryContactName: true,
            currency: true,
            total: true,
            items: true,
            status: true,
            payments: {
                where: { status: PaymentStatus.SUCCESSFUL },
                select: { id: true },
                take: 1,
            },
        },
    });

    if (!order) {
        return NextResponse.json(
            { message: "Order not found." },
            { status: 404 },
        );
    }

    if (order.status === "PAID" || order.payments.length > 0) {
        return NextResponse.json(
            { message: "This order is already paid." },
            { status: 400 },
        );
    }

    const amount = order.total / 100;

    if (!Number.isFinite(amount) || amount <= 0) {
        return NextResponse.json(
            { message: "Order total is invalid for checkout." },
            { status: 400 },
        );
    }

    const reference = `${order.reference}-retry-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    const { checkoutUrl } = await createFlutterwavePaymentLink({
        email: order.userEmail,
        name:
            order.deliveryContactName?.trim() ||
            getDefaultNameFromEmail(order.userEmail),
        amount,
        currency: order.currency,
        reference,
        description: `Payment retry for ${getItemCount(order.items)} item(s)`,
    });

    await prisma.payment.create({
        data: {
            orderId: order.id,
            provider: "flutterwave",
            providerReference: reference,
            status: PaymentStatus.PENDING,
            amount: order.total,
            currency: order.currency,
            checkoutUrl,
        },
    });

    return NextResponse.redirect(checkoutUrl);
}
