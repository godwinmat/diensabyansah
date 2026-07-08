import { AccountProfileForm } from "@/components/account/profile-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { getAuthCookieName, verifySessionToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ArrowLeft, Package } from "@phosphor-icons/react/dist/ssr";
import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

type OrderRow = {
    id: string;
    reference: string;
    status: string;
    deliveryStatus: string;
    total: number;
    currency: string;
    itemCount: number;
    checkedOutAt: string;
    paidAt: string | null;
};

function formatMoney(amountMinor: number, currency: string) {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency,
    }).format(amountMinor / 100);
}

function formatDateTime(value: string) {
    return new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }).format(new Date(value));
}

function getItemCount(items: unknown) {
    if (!Array.isArray(items)) return 0;

    return items.reduce<number>((total, item) => {
        if (!item || typeof item !== "object" || Array.isArray(item)) {
            return total + 1;
        }

        const quantity = (item as Record<string, unknown>).quantity;
        return total + (typeof quantity === "number" ? quantity : 1);
    }, 0);
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

export default async function AccountProfilePage() {
    const cookieStore = await cookies();
    const token = cookieStore.get(getAuthCookieName())?.value ?? "";
    const session = verifySessionToken(token);

    if (!session) {
        redirect("/account");
    }

    const user = await prisma.user.findUnique({
        where: { id: session.sub },
        select: {
            id: true,
            name: true,
            email: true,
        },
    });

    if (!user) {
        redirect("/account");
    }

    const orders = await prisma.order.findMany({
        where: {
            OR: [{ userId: user.id }, { userEmail: user.email }],
        },
        orderBy: { checkedOutAt: "desc" },
        select: {
            id: true,
            reference: true,
            status: true,
            deliveryStatus: true,
            total: true,
            currency: true,
            checkedOutAt: true,
            paidAt: true,
            items: true,
        },
    });

    const serializedOrders: OrderRow[] = orders.map((order) => ({
        id: order.id,
        reference: order.reference,
        status: order.status,
        deliveryStatus: order.deliveryStatus,
        total: order.total,
        currency: order.currency,
        itemCount: getItemCount(order.items),
        checkedOutAt: order.checkedOutAt.toISOString(),
        paidAt: order.paidAt?.toISOString() ?? null,
    }));

    const totalOrders = serializedOrders.length;
    const activeOrders = serializedOrders.filter(
        (order) => order.status !== "PAID",
    ).length;
    const completedOrders = serializedOrders.filter(
        (order) => order.status === "PAID",
    ).length;

    return (
        <section className="bg-[#f4f4f3] px-4 py-8 sm:px-6 lg:px-10 lg:py-10 reveal-up">
            <div className="mx-auto max-w-7xl space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">
                            Account Profile
                        </p>
                        <h1 className="mt-2 font-heading text-4xl text-[#0f172a] sm:text-5xl">
                            Welcome, {user.name}
                        </h1>
                        <p className="mt-2 text-sm text-[#64748b] sm:text-base">
                            Manage your profile details and review every order
                            you have placed.
                        </p>
                    </div>
                    <Button asChild variant="outline" className="gap-2">
                        <Link href="/products">
                            <ArrowLeft size={16} />
                            Continue Shopping
                        </Link>
                    </Button>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                    <Card className="gap-0 rounded-2xl border border-[#e2e8f0] bg-white/92 py-0 shadow-[0_18px_60px_-36px_rgba(15,23,42,0.35)]">
                        <CardContent className="px-5 py-5">
                            <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                                Total Orders
                            </p>
                            <p className="mt-2 text-3xl font-bold">
                                {totalOrders}
                            </p>
                        </CardContent>
                    </Card>
                    <Card className="gap-0 rounded-2xl border border-[#e2e8f0] bg-white/92 py-0 shadow-[0_18px_60px_-36px_rgba(15,23,42,0.35)]">
                        <CardContent className="px-5 py-5">
                            <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                                Open Orders
                            </p>
                            <p className="mt-2 text-3xl font-bold">
                                {activeOrders}
                            </p>
                        </CardContent>
                    </Card>
                    <Card className="gap-0 rounded-2xl border border-[#e2e8f0] bg-white/92 py-0 shadow-[0_18px_60px_-36px_rgba(15,23,42,0.35)]">
                        <CardContent className="px-5 py-5">
                            <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                                Completed Orders
                            </p>
                            <p className="mt-2 text-3xl font-bold">
                                {completedOrders}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
                    <AccountProfileForm
                        initialName={user.name}
                        initialEmail={user.email}
                    />

                    <Card className="gap-0 rounded-2xl border border-[#e2e8f0] bg-white/92 py-0 shadow-[0_18px_60px_-36px_rgba(15,23,42,0.35)]">
                        <CardContent className="p-0">
                            <div className="border-b border-[#e2e8f0] px-5 py-5 sm:px-6">
                                <div className="flex items-center gap-3">
                                    <Package
                                        size={22}
                                        className="text-primary"
                                    />
                                    <div>
                                        <h2 className="text-2xl font-semibold">
                                            Order History
                                        </h2>
                                        <p className="text-sm text-muted-foreground">
                                            All orders tied to your account,
                                            including previous emails and future
                                            checkouts.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {serializedOrders.length === 0 ? (
                                <div className="px-5 py-10 text-sm text-muted-foreground sm:px-6">
                                    You have not placed any orders yet.
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Reference</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead>Delivery</TableHead>
                                                <TableHead>Items</TableHead>
                                                <TableHead>Total</TableHead>
                                                <TableHead>Placed</TableHead>
                                                <TableHead className="text-right">
                                                    Action
                                                </TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {serializedOrders.map((order) => (
                                                <TableRow key={order.id}>
                                                    <TableCell className="font-mono text-xs font-medium">
                                                        <Link
                                                            href={`/account/orders/${order.id}`}
                                                            className="text-primary hover:underline"
                                                        >
                                                            {order.reference}
                                                        </Link>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge
                                                            variant={getStatusVariant(
                                                                order.status,
                                                            )}
                                                        >
                                                            {order.status}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge
                                                            variant={getDeliveryVariant(
                                                                order.deliveryStatus,
                                                            )}
                                                        >
                                                            {
                                                                order.deliveryStatus
                                                            }
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        {order.itemCount}
                                                    </TableCell>
                                                    <TableCell className="font-medium">
                                                        {formatMoney(
                                                            order.total,
                                                            order.currency,
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-sm text-muted-foreground">
                                                        {formatDateTime(
                                                            order.checkedOutAt,
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <Link
                                                            href={`/account/orders/${order.id}`}
                                                            className="text-sm font-semibold text-primary hover:underline"
                                                        >
                                                            View
                                                        </Link>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </section>
    );
}
