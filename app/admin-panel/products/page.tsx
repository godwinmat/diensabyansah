import {
    ProductsTable,
    type AdminProduct,
    type SlimCollection,
} from "@/components/admin/products-table";
import {
    getAdminCookieName,
    getAdminLoginPath,
    verifyAdminSessionToken,
} from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
    const cookieStore = await cookies();
    const token = cookieStore.get(getAdminCookieName())?.value ?? "";
    const adminSession = verifyAdminSessionToken(token);

    if (!adminSession) {
        redirect(getAdminLoginPath());
    }

    const [products, allCollections] = await Promise.all([
        prisma.product.findMany({
            orderBy: { externalId: "desc" },
            select: {
                id: true,
                externalId: true,
                slug: true,
                name: true,
                price: true,
                imageUrl: true,
                note: true,
                description: true,
                origin: true,
                material: true,
                permalink: true,
                sizes: true,
                createdAt: true,
                collections: {
                    include: {
                        collection: {
                            select: { name: true, slug: true },
                        },
                    },
                },
            },
        }),
        prisma.collection.findMany({
            orderBy: { name: "asc" },
            select: { id: true, name: true, slug: true },
        }),
    ]);

    const serialized: AdminProduct[] = products.map((product) => ({
        ...product,
        permalink: product.permalink ?? null,
        createdAt: product.createdAt.toISOString(),
        collections: product.collections.map((pc) => ({
            name: pc.collection.name,
            slug: pc.collection.slug,
        })),
    }));

    const availableCollections: SlimCollection[] = allCollections;

    return (
        <div className="mx-auto max-w-7xl px-6 py-8">
            <div className="mb-6">
                <h1 className="text-2xl font-bold">Products</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    Add, edit, and remove catalogue items.
                </p>
            </div>
            <ProductsTable
                initialProducts={serialized}
                availableCollections={availableCollections}
            />
        </div>
    );
}
