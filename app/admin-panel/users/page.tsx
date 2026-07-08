import { UsersTable, type AdminUser } from "@/components/admin/users-table";
import {
    getAdminCookieName,
    getAdminLoginPath,
    verifyAdminSessionToken,
} from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
    const cookieStore = await cookies();
    const token = cookieStore.get(getAdminCookieName())?.value ?? "";
    const adminSession = verifyAdminSessionToken(token);

    if (!adminSession) {
        redirect(getAdminLoginPath());
    }

    const [users, carts] = await Promise.all([
        prisma.user.findMany({
            orderBy: { createdAt: "desc" },
            select: {
                id: true,
                name: true,
                email: true,
                createdAt: true,
                updatedAt: true,
            },
        }),
        prisma.cart.findMany({
            select: {
                userEmail: true,
                updatedAt: true,
            },
        }),
    ]);

    const cartsByEmail = new Map(
        carts.map((cart) => [
            cart.userEmail.toLowerCase(),
            cart.updatedAt.toISOString(),
        ]),
    );

    const serialized: AdminUser[] = users.map((user) => {
        const cartUpdatedAt = cartsByEmail.get(user.email.toLowerCase()) ?? null;

        return {
            id: user.id,
            name: user.name,
            email: user.email,
            hasCart: cartUpdatedAt !== null,
            cartUpdatedAt,
            createdAt: user.createdAt.toISOString(),
            updatedAt: user.updatedAt.toISOString(),
        };
    });

    return (
        <div className="mx-auto max-w-7xl px-6 py-8">
            <div className="mb-6">
                <h1 className="text-2xl font-bold">Users</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    View registered customer accounts and cart activity.
                </p>
            </div>
            <UsersTable initialUsers={serialized} />
        </div>
    );
}
