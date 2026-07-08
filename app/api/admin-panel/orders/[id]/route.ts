import { getAdminCookieName, verifyAdminSessionToken } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { DeliveryStatus } from "@prisma/client";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

type RouteContext = { params: Promise<{ id: string }> };

const ALLOWED_DELIVERY_STATUS = new Set<DeliveryStatus>([
    DeliveryStatus.AWAITING_PAYMENT,
    DeliveryStatus.PROCESSING,
    DeliveryStatus.SHIPPED,
    DeliveryStatus.OUT_FOR_DELIVERY,
    DeliveryStatus.DELIVERED,
    DeliveryStatus.RETURNED,
    DeliveryStatus.CANCELLED,
]);

async function requireAdmin() {
    const cookieStore = await cookies();
    const token = cookieStore.get(getAdminCookieName())?.value ?? "";
    return Boolean(verifyAdminSessionToken(token));
}

export async function PATCH(request: Request, { params }: RouteContext) {
    if (!(await requireAdmin())) {
        return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }

    const { id } = await params;
    const body = (await request.json().catch(() => null)) as {
        deliveryStatus?: DeliveryStatus;
    } | null;

    const deliveryStatus = body?.deliveryStatus;

    if (
        !id ||
        !deliveryStatus ||
        !ALLOWED_DELIVERY_STATUS.has(deliveryStatus)
    ) {
        return NextResponse.json(
            { message: "Invalid delivery status update." },
            { status: 400 },
        );
    }

    try {
        const order = await prisma.order.update({
            where: { id },
            data: {
                deliveryStatus,
                deliveryUpdatedAt: new Date(),
            },
            select: {
                id: true,
                deliveryStatus: true,
                deliveryUpdatedAt: true,
            },
        });

        return NextResponse.json({
            message: "Delivery status updated.",
            order,
        });
    } catch {
        return NextResponse.json(
            { message: "Unable to update delivery status." },
            { status: 500 },
        );
    }
}
