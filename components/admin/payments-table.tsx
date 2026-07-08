import { Badge } from "@/components/ui/badge";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

export type AdminPayment = {
    id: string;
    orderReference: string;
    userEmail: string;
    provider: string;
    providerReference: string;
    status: "PENDING" | "SUCCESSFUL" | "FAILED" | "CANCELLED" | "REFUNDED";
    amount: number;
    currency: string;
    checkoutUrl: string | null;
    paidAt: string | null;
    createdAt: string;
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

function getStatusVariant(status: AdminPayment["status"]) {
    if (status === "SUCCESSFUL") return "default";
    if (status === "FAILED" || status === "CANCELLED") return "destructive";
    if (status === "REFUNDED") return "outline";
    return "secondary";
}

export function PaymentsTable({ payments }: { payments: AdminPayment[] }) {
    return (
        <Card className="gap-0 py-0 hover:translate-y-0">
            <CardHeader className="border-b py-4">
                <CardTitle className="text-sm text-muted-foreground">
                    {payments.length} payment{payments.length !== 1 ? "s" : ""}
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/60 hover:bg-muted/60">
                            <TableHead>Reference</TableHead>
                            <TableHead>Order</TableHead>
                            <TableHead>Customer</TableHead>
                            <TableHead>Provider</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Created</TableHead>
                            <TableHead>Paid</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {payments.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={8}
                                    className="h-24 text-center text-muted-foreground"
                                >
                                    No payments yet.
                                </TableCell>
                            </TableRow>
                        ) : null}
                        {payments.map((payment) => (
                            <TableRow key={payment.id}>
                                <TableCell className="font-mono text-xs">
                                    {payment.providerReference}
                                </TableCell>
                                <TableCell className="font-mono text-xs text-muted-foreground">
                                    {payment.orderReference}
                                </TableCell>
                                <TableCell className="max-w-[240px] truncate font-mono text-xs text-muted-foreground">
                                    {payment.userEmail}
                                </TableCell>
                                <TableCell className="capitalize">
                                    {payment.provider}
                                </TableCell>
                                <TableCell>
                                    <Badge variant={getStatusVariant(payment.status)}>
                                        {payment.status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="font-medium">
                                    {formatMoney(payment.amount, payment.currency)}
                                </TableCell>
                                <TableCell className="text-muted-foreground">
                                    {formatDate(payment.createdAt)}
                                </TableCell>
                                <TableCell className="text-muted-foreground">
                                    {formatDate(payment.paidAt)}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
