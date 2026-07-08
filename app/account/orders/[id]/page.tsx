import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAuthCookieName, verifySessionToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ArrowLeft, Package } from "@phosphor-icons/react/dist/ssr";
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

function parseItems(items: unknown): ItemRow[] {
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

function getStatusVariant(status: string) {
    if (status === "PAID") return "default" as const;
    if (status === "FAILED" || status === "CANCELLED")
        return "destructive" as const;
    return "secondary" as const;
}

function getDeliveryVariant(status: string) {
    if (status === "DELIVERED") return "default" as const;
    if (status === "RETURNED" || status === "CANCELLED")
        return "destructive" as const;
    if (status === "SHIPPED" || status === "OUT_FOR_DELIVERY")
        return "outline" as const;
    return "secondary" as const;
}

export default async function AccountOrderDetailsPage({
    params,
}: {
    params: Promise<Params>;
}) {
    const cookieStore = await cookies();
    const token = cookieStore.get(getAuthCookieName())?.value ?? "";
    const session = verifySessionToken(token);

    if (!session) {
        redirect("/account");
    }

    const { id } = await params;

    const order = await prisma.order.findFirst({
        where: {
            id,
            OR: [{ userId: session.sub }, { userEmail: session.email }],
        },
        select: {
            id: true,
            reference: true,
            status: true,
            deliveryStatus: true,
            deliveryContactName: true,
            deliveryPhone: true,
            deliveryAddress: true,
            deliveryNotes: true,
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
                    provider: true,
                    providerReference: true,
                    status: true,
                    amount: true,
                    currency: true,
                    paidAt: true,
                    createdAt: true,
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
        <section className="bg-[#f4f4f3] px-4 py-8 sm:px-6 lg:px-10 lg:py-10 reveal-up">
            <div className="mx-auto max-w-7xl space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">
                            Order Details
                        </p>
                        <h1 className="mt-2 font-heading text-4xl text-[#0f172a] sm:text-5xl">
                            {order.reference}
                        </h1>
                        <p className="mt-2 text-sm text-[#64748b] sm:text-base">
                            Placed on {formatDateTime(order.checkedOutAt)}
                        </p>
                    </div>
                    <Button asChild variant="outline" className="gap-2">
                        <Link href="/account/profile">
                            <ArrowLeft size={16} />
                            Back to Profile
                        </Link>
                    </Button>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                    <Card className="gap-0 rounded-2xl border border-[#e2e8f0] bg-white/92 py-0 shadow-[0_18px_60px_-36px_rgba(15,23,42,0.35)]">
                        <CardContent className="px-5 py-5">
                            <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                                Order Status
                            </p>
                            <div className="mt-2">
                                <Badge variant={getStatusVariant(order.status)}>
                                    {order.status}
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="gap-0 rounded-2xl border border-[#e2e8f0] bg-white/92 py-0 shadow-[0_18px_60px_-36px_rgba(15,23,42,0.35)]">
                        <CardContent className="px-5 py-5">
                            <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                                Delivery Status
                            </p>
                            <div className="mt-2">
                                <Badge
                                    variant={getDeliveryVariant(
                                        order.deliveryStatus,
                                    )}
                                >
                                    {order.deliveryStatus}
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="gap-0 rounded-2xl border border-[#e2e8f0] bg-white/92 py-0 shadow-[0_18px_60px_-36px_rgba(15,23,42,0.35)]">
                        <CardContent className="px-5 py-5">
                            <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                                Total
                            </p>
                            <p className="mt-2 text-3xl font-bold">
                                {formatMoney(order.total, order.currency)}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
                    <Card className="gap-0 rounded-2xl border border-[#e2e8f0] bg-white/92 py-0 shadow-[0_18px_60px_-36px_rgba(15,23,42,0.35)]">
                        <CardHeader className="border-b border-[#e2e8f0] px-5 py-5 sm:px-6">
                            <div className="flex items-center gap-3">
                                <Package size={22} className="text-primary" />
                                <CardTitle className="text-2xl">
                                    Items
                                </CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="px-5 py-5 sm:px-6">
                            {items.length === 0 ? (
                                <p className="text-sm text-muted-foreground">
                                    No item data stored for this order.
                                </p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm">
                                        <thead>
                                            <tr className="border-b text-xs uppercase tracking-widest text-muted-foreground">
                                                <th className="py-2 pr-2">
                                                    Name
                                                </th>
                                                <th className="py-2 pr-2">
                                                    Size
                                                </th>
                                                <th className="py-2 pr-2">
                                                    Qty
                                                </th>
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
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <div className="space-y-6">
                        <Card className="gap-0 rounded-2xl border border-[#e2e8f0] bg-white/92 py-0 shadow-[0_18px_60px_-36px_rgba(15,23,42,0.35)]">
                            <CardHeader className="border-b border-[#e2e8f0] px-5 py-5 sm:px-6">
                                <CardTitle className="text-2xl">
                                    Delivery
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 px-5 py-5 text-sm sm:px-6">
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
                                    <p className="mt-1">
                                        {order.deliveryPhone ?? "-"}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
                                        Address
                                    </p>
                                    <p className="mt-1">
                                        {deliveryAddress ? (
                                            <>
                                                {String(
                                                    deliveryAddress.line1 ?? "",
                                                )}
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
                            </CardContent>
                        </Card>

                        <Card className="gap-0 rounded-2xl border border-[#e2e8f0] bg-white/92 py-0 shadow-[0_18px_60px_-36px_rgba(15,23,42,0.35)]">
                            <CardHeader className="border-b border-[#e2e8f0] px-5 py-5 sm:px-6">
                                <CardTitle className="text-2xl">
                                    Payment Timeline
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 px-5 py-5 text-sm sm:px-6">
                                {order.payments.length === 0 ? (
                                    <p className="text-muted-foreground">
                                        No payment records found.
                                    </p>
                                ) : (
                                    order.payments.map((payment) => (
                                        <div
                                            key={`${payment.providerReference}-${payment.createdAt.toISOString()}`}
                                            className="rounded-lg border border-[#e2e8f0] px-4 py-3"
                                        >
                                            <div className="flex items-center justify-between gap-3">
                                                <p className="font-mono text-xs text-muted-foreground">
                                                    {payment.providerReference}
                                                </p>
                                                <Badge
                                                    variant={
                                                        payment.status ===
                                                        "SUCCESSFUL"
                                                            ? "default"
                                                            : payment.status ===
                                                                    "FAILED" ||
                                                                payment.status ===
                                                                    "CANCELLED"
                                                              ? "destructive"
                                                              : "secondary"
                                                    }
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
                                                {formatDateTime(
                                                    payment.createdAt,
                                                )}
                                            </p>
                                            <p className="mt-1 text-xs text-muted-foreground">
                                                Paid:{" "}
                                                {formatDateTime(payment.paidAt)}
                                            </p>
                                        </div>
                                    ))
                                )}
                            </CardContent>
                        </Card>

                        <Card className="gap-0 rounded-2xl border border-[#e2e8f0] bg-white/92 py-0 shadow-[0_18px_60px_-36px_rgba(15,23,42,0.35)]">
                            <CardContent className="px-5 py-5 text-sm text-muted-foreground sm:px-6">
                                Placed on {formatDateTime(order.checkedOutAt)}
                                <br />
                                Last updated {formatDateTime(order.updatedAt)}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </section>
    );
}
