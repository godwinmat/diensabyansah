import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import {
    ArrowRight,
    CheckCircle,
    Clock,
    WarningCircle,
} from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";

export const dynamic = "force-dynamic";

type CheckoutSuccessSearchParams = Promise<{
    reference?: string | string[];
    status?: string | string[];
    tx_ref?: string | string[];
    transaction_id?: string | string[];
}>;

function getParam(value?: string | string[]) {
    return Array.isArray(value) ? value[0] : value;
}

function normalizeStatus(status?: string) {
    return status?.trim().toLowerCase() ?? "";
}

function formatMoney(amountMinor: number, currency: string) {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency,
    }).format(amountMinor / 100);
}

function formatDate(date: Date | null) {
    if (!date) return "-";

    return new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }).format(date);
}

function getDisplayState(status: string, orderStatus?: string) {
    if (status === "successful" || orderStatus === "PAID") {
        return {
            icon: CheckCircle,
            title: "Payment received",
            description:
                "Thank you. Your checkout has been received and your order is being prepared.",
            badge: "Successful",
            tone: "text-emerald-600",
            badgeVariant: "default" as const,
        };
    }

    if (["cancelled", "canceled", "failed"].includes(status)) {
        return {
            icon: WarningCircle,
            title: "Payment not completed",
            description:
                "The payment provider did not complete this checkout. You can return to your bag and try again.",
            badge: status === "failed" ? "Failed" : "Cancelled",
            tone: "text-destructive",
            badgeVariant: "destructive" as const,
        };
    }

    return {
        icon: Clock,
        title: "Payment pending",
        description:
            "We have received your checkout return. Payment confirmation may still be processing.",
        badge: "Pending",
        tone: "text-amber-600",
        badgeVariant: "secondary" as const,
    };
}

export default async function CheckoutSuccessPage({
    searchParams,
}: {
    searchParams: CheckoutSuccessSearchParams;
}) {
    const query = await searchParams;
    const reference =
        getParam(query.reference)?.trim() ||
        getParam(query.tx_ref)?.trim() ||
        "";
    const status = normalizeStatus(getParam(query.status));
    const transactionId = getParam(query.transaction_id)?.trim() || "";

    const orderSelect = {
        reference: true,
        userEmail: true,
        status: true,
        deliveryStatus: true,
        deliveryContactName: true,
        deliveryPhone: true,
        deliveryAddress: true,
        total: true,
        currency: true,
        checkedOutAt: true,
        paidAt: true,
        payments: {
            orderBy: { createdAt: "desc" as const },
            take: 1,
            select: {
                provider: true,
                providerReference: true,
                status: true,
                amount: true,
                currency: true,
            },
        },
    };

    const orderByReference = reference
        ? await prisma.order.findUnique({
              where: { reference },
              select: orderSelect,
          })
        : null;

    const paymentLookup =
        !orderByReference && reference
            ? await prisma.payment.findUnique({
                  where: { providerReference: reference },
                  select: {
                      order: {
                          select: orderSelect,
                      },
                  },
              })
            : null;

    const order = orderByReference ?? paymentLookup?.order ?? null;

    const state = getDisplayState(status, order?.status);
    const Icon = state.icon;
    const payment = order?.payments[0] ?? null;
    const deliveryAddress =
        order?.deliveryAddress &&
        typeof order.deliveryAddress === "object" &&
        !Array.isArray(order.deliveryAddress)
            ? (order.deliveryAddress as Record<string, unknown>)
            : null;

    return (
        <section className="bg-[#f4f4f3] px-5 py-12 md:px-8 lg:px-10 lg:py-18 reveal-up">
            <div className="mx-auto max-w-3xl">
                <Card className="gap-0 rounded-lg bg-white/92 py-0 hover:translate-y-0">
                    <CardHeader className="border-b px-6 py-6 text-center">
                        <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-muted">
                            <Icon
                                className={state.tone}
                                size={34}
                                weight="fill"
                            />
                        </div>
                        <div className="mt-4 space-y-2">
                            <Badge variant={state.badgeVariant}>
                                {state.badge}
                            </Badge>
                            <CardTitle className="text-3xl">
                                {state.title}
                            </CardTitle>
                            <p className="mx-auto max-w-xl text-sm text-muted-foreground">
                                {state.description}
                            </p>
                        </div>
                    </CardHeader>

                    <CardContent className="space-y-6 px-6 py-6">
                        <div className="grid gap-3 rounded-md border bg-muted/30 p-4 text-sm sm:grid-cols-2">
                            <div>
                                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                                    Reference
                                </p>
                                <p className="mt-1 break-all font-mono text-xs font-medium">
                                    {reference || "Unavailable"}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                                    Transaction
                                </p>
                                <p className="mt-1 break-all font-mono text-xs font-medium">
                                    {transactionId || "Unavailable"}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                                    Customer
                                </p>
                                <p className="mt-1 break-all font-mono text-xs font-medium">
                                    {order?.userEmail ?? "Unavailable"}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                                    Total
                                </p>
                                <p className="mt-1 font-medium">
                                    {order
                                        ? formatMoney(
                                              order.total,
                                              order.currency,
                                          )
                                        : "Unavailable"}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                                    Order status
                                </p>
                                <p className="mt-1 font-medium">
                                    {order?.status ?? "Not found"}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                                    Payment status
                                </p>
                                <p className="mt-1 font-medium">
                                    {payment?.status ?? state.badge}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                                    Delivery status
                                </p>
                                <p className="mt-1 font-medium">
                                    {order?.deliveryStatus ?? "Unavailable"}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                                    Delivery contact
                                </p>
                                <p className="mt-1 font-medium">
                                    {order?.deliveryContactName ?? "-"}
                                    {order?.deliveryPhone
                                        ? ` (${order.deliveryPhone})`
                                        : ""}
                                </p>
                            </div>
                            <div className="sm:col-span-2">
                                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                                    Delivery address
                                </p>
                                <p className="mt-1 font-medium">
                                    {deliveryAddress
                                        ? `${String(deliveryAddress.line1 ?? "")}${deliveryAddress.line2 ? `, ${String(deliveryAddress.line2)}` : ""}, ${String(deliveryAddress.city ?? "")}, ${String(deliveryAddress.country ?? "")}`
                                        : "Unavailable"}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                                    Checked out
                                </p>
                                <p className="mt-1 font-medium">
                                    {formatDate(order?.checkedOutAt ?? null)}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                                    Paid at
                                </p>
                                <p className="mt-1 font-medium">
                                    {formatDate(order?.paidAt ?? null)}
                                </p>
                            </div>
                        </div>

                        {!order && reference ? (
                            <p className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                                We could not find this order locally yet. If the
                                payment was completed, confirmation may arrive
                                shortly from the payment provider.
                            </p>
                        ) : null}

                        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                            <Button
                                asChild
                                className="h-11 rounded-sm px-5 text-xs font-semibold uppercase tracking-[0.18em]"
                            >
                                <Link href="/products">
                                    Continue Shopping
                                    <ArrowRight size={16} weight="bold" />
                                </Link>
                            </Button>
                            <Button
                                asChild
                                variant="outline"
                                className="h-11 rounded-sm px-5 text-xs font-semibold uppercase tracking-[0.18em]"
                            >
                                <Link href="/account">View Account</Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </section>
    );
}
