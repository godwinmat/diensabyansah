import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    getAdminCookieName,
    getAdminLoginPath,
    verifyAdminSessionToken,
} from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import { OrderStatus, PaymentStatus, Prisma } from "@prisma/client";
import { cookies } from "next/headers";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

export const dynamic = "force-dynamic";

type Params = {
    id: string;
};

type ItemRow = {
    key: string;
    name: string;
    quantity: number;
    lineTotalMinor: number;
    size: string | null;
};

function formatDateTime(iso: Date | string | null) {
    if (!iso) return "-";

    return new Date(iso).toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function formatMoney(amountMinor: number, currency: string) {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency,
    }).format(amountMinor / 100);
}

function getStatusVariant(status: OrderStatus) {
    if (status === "PAID") return "default" as const;
    if (status === "FAILED" || status === "CANCELLED") {
        return "destructive" as const;
    }
    if (status === "REFUNDED") return "outline" as const;
    return "secondary" as const;
}

function getPaymentStatusVariant(status: PaymentStatus) {
    if (status === "SUCCESSFUL") return "default" as const;
    if (status === "FAILED" || status === "CANCELLED") {
        return "destructive" as const;
    }
    if (status === "REFUNDED") return "outline" as const;
    return "secondary" as const;
}

function getDeliveryStatusVariant(status: string | null) {
    if (status === "DELIVERED") return "default" as const;
    if (status === "RETURNED" || status === "CANCELLED") {
        return "destructive" as const;
    }
    if (status === "SHIPPED" || status === "OUT_FOR_DELIVERY") {
        return "outline" as const;
    }
    return "secondary" as const;
}

function parseItems(items: Prisma.JsonValue): ItemRow[] {
    if (!Array.isArray(items)) return [];

    return items.map((item, index) => {
        const record =
            item && typeof item === "object" && !Array.isArray(item)
                ? (item as Record<string, unknown>)
                : null;

        const itemData =
            Array.isArray(record?.item_data) &&
            record?.item_data[0] &&
            typeof record.item_data[0] === "object"
                ? (record.item_data[0] as Record<string, unknown>)
                : null;

        const key =
            typeof record?.key === "string"
                ? record.key
                : typeof record?.id === "number"
                  ? String(record.id)
                  : `item-${index}`;

        const quantity =
            typeof record?.quantity === "number" &&
            Number.isFinite(record.quantity)
                ? record.quantity
                : 1;

        const name =
            typeof record?.name === "string" && record.name.trim().length > 0
                ? record.name
                : "Unnamed product";

        const lineTotalRaw =
            record?.totals &&
            typeof record.totals === "object" &&
            !Array.isArray(record.totals)
                ? (record.totals as Record<string, unknown>).line_total
                : null;

        const lineTotalMinor =
            typeof lineTotalRaw === "string" ? Number(lineTotalRaw) || 0 : 0;

        const size =
            typeof itemData?.value === "string" &&
            itemData.value.trim().length > 0
                ? itemData.value
                : null;

        return {
            key,
            name,
            quantity,
            lineTotalMinor,
            size,
        };
    });
}

export default async function AdminOrderDetailsPage({
    params,
}: {
    params: Promise<Params>;
}) {
    const cookieStore = await cookies();
    const token = cookieStore.get(getAdminCookieName())?.value ?? "";
    const adminSession = verifyAdminSessionToken(token);

    if (!adminSession) {
        redirect(getAdminLoginPath());
    }

    const { id } = await params;

    const order = await prisma.order.findUnique({
        where: { id },
        select: {
            id: true,
            reference: true,
            userEmail: true,
            status: true,
            deliveryStatus: true,
            deliveryContactName: true,
            deliveryPhone: true,
            deliveryAddress: true,
            deliveryNotes: true,
            deliveryUpdatedAt: true,
            currency: true,
            subtotal: true,
            total: true,
            items: true,
            checkedOutAt: true,
            paidAt: true,
            createdAt: true,
            updatedAt: true,
            payments: {
                orderBy: { createdAt: "desc" },
                select: {
                    id: true,
                    provider: true,
                    providerReference: true,
                    status: true,
                    amount: true,
                    currency: true,
                    checkoutUrl: true,
                    paidAt: true,
                    createdAt: true,
                    updatedAt: true,
                },
            },
        },
    });

    if (!order) {
        notFound();
    }

    const deliveryAddress =
        order.deliveryAddress &&
        typeof order.deliveryAddress === "object" &&
        !Array.isArray(order.deliveryAddress)
            ? (order.deliveryAddress as Record<string, unknown>)
            : null;

    const items = parseItems(order.items);

    return (
        <div className="mx-auto max-w-7xl px-4 py-8">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                        Order Details
                    </p>
                    <h1 className="mt-1 text-2xl font-bold">
                        {order.reference}
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Customer: {order.userEmail}
                    </p>
                </div>
                <Button asChild variant="outline" className="gap-2">
                    <Link href="/admin-panel/orders">
                        <ArrowLeft size={14} />
                        Back to Orders
                    </Link>
                </Button>
            </div>

            <div className="grid gap-5 lg:grid-cols-[1.2fr_1fr]">
                <Card className="">
                    <CardHeader className="px-4">
                        <CardTitle>Order Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm px-4">
                        <div className="grid gap-3 sm:grid-cols-2">
                            <div>
                                <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
                                    Order status
                                </p>
                                <div className="mt-1">
                                    <Badge
                                        variant={getStatusVariant(order.status)}
                                    >
                                        {order.status}
                                    </Badge>
                                </div>
                            </div>
                            <div>
                                <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
                                    Delivery status
                                </p>
                                <div className="mt-1">
                                    <Badge
                                        variant={getDeliveryStatusVariant(
                                            order.deliveryStatus,
                                        )}
                                    >
                                        {order.deliveryStatus}
                                    </Badge>
                                </div>
                            </div>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                            <div>
                                <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
                                    Subtotal
                                </p>
                                <p className="mt-1 font-medium">
                                    {formatMoney(
                                        order.subtotal,
                                        order.currency,
                                    )}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
                                    Total
                                </p>
                                <p className="mt-1 font-semibold">
                                    {formatMoney(order.total, order.currency)}
                                </p>
                            </div>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                            <div>
                                <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
                                    Checked out
                                </p>
                                <p className="mt-1">
                                    {formatDateTime(order.checkedOutAt)}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
                                    Paid at
                                </p>
                                <p className="mt-1">
                                    {formatDateTime(order.paidAt)}
                                </p>
                            </div>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                            <div>
                                <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
                                    Created
                                </p>
                                <p className="mt-1">
                                    {formatDateTime(order.createdAt)}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
                                    Last updated
                                </p>
                                <p className="mt-1">
                                    {formatDateTime(order.updatedAt)}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="px-4">
                        <CardTitle>Delivery Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm px-4">
                        <div>
                            <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
                                Contact name
                            </p>
                            <p className="mt-1">
                                {order.deliveryContactName ?? "-"}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
                                Phone
                            </p>
                            <p className="mt-1">{order.deliveryPhone ?? "-"}</p>
                        </div>
                        <div>
                            <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
                                Address
                            </p>
                            <p className="mt-1">
                                {deliveryAddress ? (
                                    <>
                                        {String(deliveryAddress.line1 ?? "")}
                                        {deliveryAddress.line2
                                            ? `, ${String(deliveryAddress.line2)}`
                                            : ""}
                                        {deliveryAddress.city
                                            ? `, ${String(deliveryAddress.city)}`
                                            : ""}
                                        {deliveryAddress.state
                                            ? `, ${String(deliveryAddress.state)}`
                                            : ""}
                                        {deliveryAddress.postalCode
                                            ? `, ${String(deliveryAddress.postalCode)}`
                                            : ""}
                                        {deliveryAddress.country
                                            ? `, ${String(deliveryAddress.country)}`
                                            : ""}
                                    </>
                                ) : (
                                    "-"
                                )}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
                                Notes
                            </p>
                            <p className="mt-1 whitespace-pre-wrap">
                                {order.deliveryNotes ?? "-"}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
                                Delivery last updated
                            </p>
                            <p className="mt-1">
                                {formatDateTime(order.deliveryUpdatedAt)}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="mt-5 grid gap-5 lg:grid-cols-[1.2fr_1fr]">
                <Card>
                    <CardHeader className="px-4">
                        <CardTitle>Items ({items.length})</CardTitle>
                    </CardHeader>
                    <CardContent className="overflow-x-auto px-4">
                        {items.length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                                No item data stored for this order.
                            </p>
                        ) : (
                            <table className="w-full text-left text-sm">
                                <thead>
                                    <tr className="border-b text-xs uppercase tracking-[0.1em] text-muted-foreground">
                                        <th className="py-2 pr-2">Name</th>
                                        <th className="py-2 pr-2">Size</th>
                                        <th className="py-2 pr-2">Qty</th>
                                        <th className="py-2 text-right">
                                            Line total
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.map((item) => (
                                        <tr
                                            key={item.key}
                                            className="border-b last:border-b-0"
                                        >
                                            <td className="py-3 pr-2 font-medium">
                                                {item.name}
                                            </td>
                                            <td className="py-3 pr-2 text-muted-foreground">
                                                {item.size ?? "-"}
                                            </td>
                                            <td className="py-3 pr-2">
                                                {item.quantity}
                                            </td>
                                            <td className="py-3 text-right font-medium">
                                                {formatMoney(
                                                    item.lineTotalMinor,
                                                    order.currency,
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="px-4">
                        <div className="flex items-center justify-between gap-2">
                            <CardTitle>
                                Payments ({order.payments.length})
                            </CardTitle>
                            {order.status !== "PAID" ? (
                                <Button asChild size="sm" variant="outline">
                                    <a
                                        href={`/api/admin-panel/orders/${order.id}/checkout-link`}
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        Open fresh checkout URL
                                    </a>
                                </Button>
                            ) : null}
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm px-4">
                        {order.status !== "PAID" ? (
                            <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                                Provider checkout links expire. Use "Open fresh
                                checkout URL" to generate a new payment session.
                            </p>
                        ) : null}
                        {order.payments.length === 0 ? (
                            <p className="text-muted-foreground">
                                No payment records for this order.
                            </p>
                        ) : (
                            order.payments.map((payment) => (
                                <div
                                    key={payment.id}
                                    className="rounded-md border p-3"
                                >
                                    <div className="flex items-center justify-between gap-2">
                                        <p className="font-mono text-xs text-muted-foreground">
                                            {payment.providerReference}
                                        </p>
                                        <Badge
                                            variant={getPaymentStatusVariant(
                                                payment.status,
                                            )}
                                        >
                                            {payment.status}
                                        </Badge>
                                    </div>
                                    <p className="mt-2 text-xs text-muted-foreground">
                                        Provider: {payment.provider}
                                    </p>
                                    <p className="mt-1 font-medium">
                                        {formatMoney(
                                            payment.amount,
                                            payment.currency,
                                        )}
                                    </p>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        Created:{" "}
                                        {formatDateTime(payment.createdAt)}
                                    </p>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        Paid: {formatDateTime(payment.paidAt)}
                                    </p>
                                    {payment.checkoutUrl ? (
                                        <p className="mt-2 text-xs text-muted-foreground">
                                            Stored checkout URL may expire.
                                        </p>
                                    ) : null}
                                </div>
                            ))
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
