import {
    CollectionsTable,
    type AdminCollection,
} from "@/components/admin/collections-table";
import {
    getAdminCookieName,
    getAdminLoginPath,
    verifyAdminSessionToken,
} from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminCollectionsPage() {
    const cookieStore = await cookies();
    const token = cookieStore.get(getAdminCookieName())?.value ?? "";
    const adminSession = verifyAdminSessionToken(token);

    if (!adminSession) {
        redirect(getAdminLoginPath());
    }

    const collections = await prisma.collection.findMany({
        orderBy: [{ featured: "desc" }, { name: "asc" }],
        select: {
            id: true,
            externalId: true,
            slug: true,
            name: true,
            description: true,
            imageUrl: true,
            productCount: true,
            featured: true,
            createdAt: true,
        },
    });

    const serialized: AdminCollection[] = collections.map((col) => ({
        ...col,
        createdAt: col.createdAt.toISOString(),
    }));

    return (
        <div className="mx-auto max-w-7xl px-6 py-8">
            <div className="mb-6">
                <h1 className="text-2xl font-bold">Collections</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    Manage product categories and featured groupings.
                </p>
            </div>
            <CollectionsTable initialCollections={serialized} />
        </div>
    );
}
