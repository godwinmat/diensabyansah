"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

export type AdminOrder = {
    id: string;
    reference: string;
    userEmail: string;
    status: "PENDING" | "PAID" | "CANCELLED" | "FAILED" | "REFUNDED";
    deliveryStatus:
        | "AWAITING_PAYMENT"
        | "PROCESSING"
        | "SHIPPED"
        | "OUT_FOR_DELIVERY"
        | "DELIVERED"
        | "RETURNED"
        | "CANCELLED";
    deliveryContactName: string | null;
    deliveryPhone: string | null;
    deliveryAddressLine1: string | null;
    deliveryCity: string | null;
    deliveryCountry: string | null;
    currency: string;
    subtotal: number;
    total: number;
    itemCount: number;
    paymentCount: number;
    checkedOutAt: string;
    paidAt: string | null;
};

function formatDate(iso: string | null) {
    if (!iso) return "-";

    return new Date(iso).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

function formatMoney(amountMinor: number, currency: string) {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency,
    }).format(amountMinor / 100);
}

function getStatusVariant(status: AdminOrder["status"]) {
    if (status === "PAID") return "default";
    if (status === "FAILED" || status === "CANCELLED") return "destructive";
    if (status === "REFUNDED") return "outline";
    return "secondary";
}

function getDeliveryStatusVariant(status: AdminOrder["deliveryStatus"]) {
    if (status === "DELIVERED") return "default";
    if (status === "RETURNED" || status === "CANCELLED") return "destructive";
    if (status === "SHIPPED" || status === "OUT_FOR_DELIVERY") return "outline";
    return "secondary";
}

const DELIVERY_STATUS_OPTIONS: AdminOrder["deliveryStatus"][] = [
    "AWAITING_PAYMENT",
    "PROCESSING",
    "SHIPPED",
    "OUT_FOR_DELIVERY",
    "DELIVERED",
    "RETURNED",
    "CANCELLED",
];

export function OrdersTable({ orders }: { orders: AdminOrder[] }) {
    const router = useRouter();
    const [rows, setRows] = useState(orders);
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    const sortedRows = useMemo(() => rows, [rows]);

    const handleDeliveryStatusUpdate = async (
        orderId: string,
        deliveryStatus: AdminOrder["deliveryStatus"],
    ) => {
        setUpdatingId(orderId);

        try {
            const response = await fetch(`/api/admin-panel/orders/${orderId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ deliveryStatus }),
            });

            if (!response.ok) {
                return;
            }

            setRows((prev) =>
                prev.map((order) =>
                    order.id === orderId
                        ? {
                              ...order,
                              deliveryStatus,
                          }
                        : order,
                ),
            );
        } finally {
            setUpdatingId(null);
        }
    };

    return (
        <Card className="gap-0 py-0 hover:translate-y-0">
            <CardHeader className="border-b py-4">
                <CardTitle className="text-sm text-muted-foreground">
                    {sortedRows.length} order
                    {sortedRows.length !== 1 ? "s" : ""}
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/60 hover:bg-muted/60">
                            <TableHead>Reference</TableHead>
                            <TableHead>Customer</TableHead>
                            <TableHead>Delivery</TableHead>
                            <TableHead>Payment</TableHead>
                            <TableHead>Total</TableHead>
                            <TableHead>Checked out</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {sortedRows.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={7}
                                    className="h-24 text-center text-muted-foreground"
                                >
                                    No orders yet.
                                </TableCell>
                            </TableRow>
                        ) : null}
                        {sortedRows.map((order) => (
                            <TableRow
                                key={order.id}
                                role="button"
                                tabIndex={0}
                                className="cursor-pointer"
                                onClick={() => {
                                    router.push(
                                        `/admin-panel/orders/${order.id}`,
                                    );
                                }}
                                onKeyDown={(event) => {
                                    if (
                                        event.key === "Enter" ||
                                        event.key === " "
                                    ) {
                                        event.preventDefault();
                                        router.push(
                                            `/admin-panel/orders/${order.id}`,
                                        );
                                    }
                                }}
                            >
                                <TableCell className="font-mono text-xs">
                                    {order.reference}
                                </TableCell>
                                <TableCell className="max-w-[260px] truncate font-mono text-xs text-muted-foreground">
                                    {order.userEmail}
                                </TableCell>
                                <TableCell>
                                    <Badge
                                        variant={getDeliveryStatusVariant(
                                            order.deliveryStatus,
                                        )}
                                    >
                                        {order.deliveryStatus}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <Badge
                                        variant={getStatusVariant(order.status)}
                                    >
                                        {order.status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="font-medium">
                                    {formatMoney(order.total, order.currency)}
                                </TableCell>
                                <TableCell className="text-muted-foreground">
                                    {formatDate(order.checkedOutAt)}
                                </TableCell>
                                <TableCell>
                                    <div
                                        className="flex items-center gap-2"
                                        onClick={(event) =>
                                            event.stopPropagation()
                                        }
                                        onKeyDown={(event) =>
                                            event.stopPropagation()
                                        }
                                    >
                                        <select
                                            value={order.deliveryStatus}
                                            onChange={(event) => {
                                                void handleDeliveryStatusUpdate(
                                                    order.id,
                                                    event.target
                                                        .value as AdminOrder["deliveryStatus"],
                                                );
                                            }}
                                            disabled={updatingId === order.id}
                                            className="h-8 rounded-md border border-input bg-background px-2 text-xs"
                                        >
                                            {DELIVERY_STATUS_OPTIONS.map(
                                                (status) => (
                                                    <option
                                                        key={status}
                                                        value={status}
                                                    >
                                                        {status}
                                                    </option>
                                                ),
                                            )}
                                        </select>
                                        {updatingId === order.id ? (
                                            <Button
                                                size="xs"
                                                variant="outline"
                                                disabled
                                            >
                                                Updating
                                            </Button>
                                        ) : null}
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
