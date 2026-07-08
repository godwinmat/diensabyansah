import {
    PaymentsTable,
    type AdminPayment,
} from "@/components/admin/payments-table";
import {
    getAdminCookieName,
    getAdminLoginPath,
    verifyAdminSessionToken,
} from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminPaymentsPage() {
    const cookieStore = await cookies();
    const token = cookieStore.get(getAdminCookieName())?.value ?? "";
    const adminSession = verifyAdminSessionToken(token);

    if (!adminSession) {
        redirect(getAdminLoginPath());
    }

    const payments = await prisma.payment.findMany({
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
            order: {
                select: {
                    reference: true,
                    userEmail: true,
                },
            },
        },
    });

    const serialized: AdminPayment[] = payments.map((payment) => ({
        id: payment.id,
        orderReference: payment.order.reference,
        userEmail: payment.order.userEmail,
        provider: payment.provider,
        providerReference: payment.providerReference,
        status: payment.status,
        amount: payment.amount,
        currency: payment.currency,
        checkoutUrl: payment.checkoutUrl,
        paidAt: payment.paidAt?.toISOString() ?? null,
        createdAt: payment.createdAt.toISOString(),
    }));

    return (
        <div className="mx-auto max-w-7xl px-6 py-8">
            <div className="mb-6">
                <h1 className="text-2xl font-bold">Payments</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    Monitor provider references, payment status, and settlement dates.
                </p>
            </div>
            <PaymentsTable payments={serialized} />
        </div>
    );
}
