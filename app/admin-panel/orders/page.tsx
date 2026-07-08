import { OrdersTable, type AdminOrder } from "@/components/admin/orders-table";
import {
    getAdminCookieName,
    getAdminLoginPath,
    verifyAdminSessionToken,
} from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

function getItemCount(items: Prisma.JsonValue) {
    if (!Array.isArray(items)) return 0;

    return items.reduce<number>((total, item) => {
        if (!item || typeof item !== "object" || Array.isArray(item)) {
            return total + 1;
        }

        const quantity = item["quantity"];
        return total + (typeof quantity === "number" ? quantity : 1);
    }, 0);
}

export default async function AdminOrdersPage() {
    const cookieStore = await cookies();
    const token = cookieStore.get(getAdminCookieName())?.value ?? "";
    const adminSession = verifyAdminSessionToken(token);

    if (!adminSession) {
        redirect(getAdminLoginPath());
    }

    const orders = await prisma.order.findMany({
        orderBy: { checkedOutAt: "desc" },
        select: {
            id: true,
            reference: true,
            userEmail: true,
            status: true,
            deliveryStatus: true,
            deliveryContactName: true,
            deliveryPhone: true,
            deliveryAddress: true,
            currency: true,
            subtotal: true,
            total: true,
            items: true,
            checkedOutAt: true,
            paidAt: true,
            _count: {
                select: { payments: true },
            },
        },
    });

    const serialized: AdminOrder[] = orders.map((order) => {
        const deliveryAddress =
            order.deliveryAddress &&
            typeof order.deliveryAddress === "object" &&
            !Array.isArray(order.deliveryAddress)
                ? (order.deliveryAddress as Record<string, unknown>)
                : null;

        return {
            id: order.id,
            reference: order.reference,
            userEmail: order.userEmail,
            status: order.status,
            deliveryStatus: order.deliveryStatus,
            deliveryContactName: order.deliveryContactName,
            deliveryPhone: order.deliveryPhone,
            deliveryAddressLine1:
                typeof deliveryAddress?.line1 === "string"
                    ? deliveryAddress.line1
                    : null,
            deliveryCity:
                typeof deliveryAddress?.city === "string"
                    ? deliveryAddress.city
                    : null,
            deliveryCountry:
                typeof deliveryAddress?.country === "string"
                    ? deliveryAddress.country
                    : null,
            currency: order.currency,
            subtotal: order.subtotal,
            total: order.total,
            itemCount: getItemCount(order.items),
            paymentCount: order._count.payments,
            checkedOutAt: order.checkedOutAt.toISOString(),
            paidAt: order.paidAt?.toISOString() ?? null,
        };
    });

    return (
        <div className="mx-auto max-w-7xl px-4 py-8">
            <div className="mb-6">
                <h1 className="text-2xl font-bold">Orders</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    View checkout orders, payment state, and customer
                    references.
                </p>
            </div>
            <OrdersTable orders={serialized} />
        </div>
    );
}
