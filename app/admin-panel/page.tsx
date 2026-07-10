import { Badge } from "@/components/ui/badge";
import {
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    getAdminCookieName,
    getAdminLoginPath,
    verifyAdminSessionToken,
} from "@/lib/admin-auth";
import { formatDisplayPrice } from "@/lib/cart";
import { getCompanyProfile } from "@/lib/company-profile";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

function formatMoney(amountMinor: number, currency: string) {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency,
    }).format(amountMinor / 100);
}

function StatCard({
    label,
    value,
    href,
}: {
    label: string;
    value: number;
    href: string;
}) {
    return (
        <Card asChild className="gap-2">
            <Link href={href}>
                <CardContent>
                    <p className="text-3xl font-bold group-hover/card:text-primary">
                        {value.toLocaleString()}
                    </p>
                    <p className="mt-1 text-sm font-medium text-muted-foreground">
                        {label}
                    </p>
                </CardContent>
            </Link>
        </Card>
    );
}

export default async function AdminDashboardPage() {
    const cookieStore = await cookies();
    const token = cookieStore.get(getAdminCookieName())?.value ?? "";
    const adminSession = verifyAdminSessionToken(token);

    if (!adminSession) {
        redirect(getAdminLoginPath());
    }

    const [
        postCount,
        collectionCount,
        productCount,
        orderCount,
        paymentCount,
        userCount,
        cartCount,
        recentPosts,
        recentProducts,
        recentOrders,
        recentPayments,
        profile,
    ] = await prisma.$transaction([
        prisma.blogPost.count(),
        prisma.collection.count(),
        prisma.product.count(),
        prisma.order.count(),
        prisma.payment.count(),
        prisma.user.count(),
        prisma.cart.count(),
        prisma.blogPost.findMany({
            orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
            take: 5,
            select: { id: true, title: true, slug: true, publishedAt: true },
        }),
        prisma.product.findMany({
            orderBy: { externalId: "desc" },
            take: 5,
            select: {
                id: true,
                name: true,
                slug: true,
                externalId: true,
                price: true,
            },
        }),
        prisma.order.findMany({
            orderBy: { checkedOutAt: "desc" },
            take: 5,
            select: {
                id: true,
                reference: true,
                userEmail: true,
                status: true,
                total: true,
                currency: true,
                checkedOutAt: true,
            },
        }),
        prisma.payment.findMany({
            orderBy: { createdAt: "desc" },
            take: 5,
            select: {
                id: true,
                providerReference: true,
                status: true,
                amount: true,
                currency: true,
                order: {
                    select: {
                        userEmail: true,
                    },
                },
            },
        }),
        prisma.companyProfile.findUnique({
            where: { id: "default" },
            select: { currencySymbol: true },
        }),
    ]);

    const currencySymbol =
        profile?.currencySymbol?.trim() ||
        (await getCompanyProfile()).currencySymbol;

    return (
        <div className="mx-auto max-w-6xl px-4 py-8">
            <div className="mb-8">
                <h1 className="text-2xl font-bold">Dashboard</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    Overview of your store content. Click a card to manage that
                    section.
                </p>
            </div>

            {/* Stat cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
                <StatCard
                    label="Blog Posts"
                    value={postCount}
                    href="/admin-panel/posts"
                />
                <StatCard
                    label="Collections"
                    value={collectionCount}
                    href="/admin-panel/collections"
                />
                <StatCard
                    label="Products"
                    value={productCount}
                    href="/admin-panel/products"
                />
                <StatCard
                    label="Orders"
                    value={orderCount}
                    href="/admin-panel/orders"
                />
                <StatCard
                    label="Payments"
                    value={paymentCount}
                    href="/admin-panel/payments"
                />
                <StatCard
                    label="Users"
                    value={userCount}
                    href="/admin-panel/users"
                />
                <StatCard
                    label="Cart Sessions"
                    value={cartCount}
                    href="/admin-panel/users"
                />
            </div>

            <div className="mt-10 grid gap-6 lg:grid-cols-2">
                {/* Recent Posts */}
                <Card className="gap-0 py-0 hover:translate-y-0">
                    <CardHeader className="border-b py-4">
                        <CardTitle>Recent Posts</CardTitle>
                        <CardAction>
                            <Link
                                href="/admin-panel/posts"
                                className="text-xs font-medium text-primary hover:underline"
                            >
                                View all
                            </Link>
                        </CardAction>
                    </CardHeader>
                    {recentPosts.length === 0 ? (
                        <CardContent className="py-6 text-sm text-muted-foreground">
                            No posts yet.
                        </CardContent>
                    ) : (
                        <CardContent className="p-0">
                            <ul className="divide-y">
                                {recentPosts.map((post) => (
                                    <li
                                        key={post.id}
                                        className="flex items-center justify-between px-5 py-3"
                                    >
                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-medium">
                                                {post.title}
                                            </p>
                                            <p className="truncate font-mono text-xs text-muted-foreground">
                                                {post.slug}
                                            </p>
                                        </div>
                                        {post.publishedAt && (
                                            <time className="ml-4 shrink-0 text-xs text-muted-foreground">
                                                {new Date(
                                                    post.publishedAt,
                                                ).toLocaleDateString("en-GB", {
                                                    day: "2-digit",
                                                    month: "short",
                                                })}
                                            </time>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    )}
                </Card>

                {/* Recent Products */}
                <Card className="gap-0 py-0 hover:translate-y-0">
                    <CardHeader className="border-b py-4">
                        <CardTitle>Recent Products</CardTitle>
                        <CardAction>
                            <Link
                                href="/admin-panel/products"
                                className="text-xs font-medium text-primary hover:underline"
                            >
                                View all
                            </Link>
                        </CardAction>
                    </CardHeader>
                    {recentProducts.length === 0 ? (
                        <CardContent className="py-6 text-sm text-muted-foreground">
                            No products yet.
                        </CardContent>
                    ) : (
                        <CardContent className="p-0">
                            <ul className="divide-y">
                                {recentProducts.map((product) => (
                                    <li
                                        key={product.id}
                                        className="flex items-center justify-between px-5 py-3"
                                    >
                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-medium">
                                                {product.name}
                                            </p>
                                            <p className="truncate font-mono text-xs text-muted-foreground">
                                                #{product.externalId} -{" "}
                                                {product.slug}
                                            </p>
                                        </div>
                                        <Badge className="ml-4 shrink-0">
                                            {formatDisplayPrice(
                                                product.price,
                                                currencySymbol,
                                            )}
                                        </Badge>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    )}
                </Card>
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-2">
                {/* Recent Orders */}
                <Card className="gap-0 py-0 hover:translate-y-0">
                    <CardHeader className="border-b py-4">
                        <CardTitle>Recent Orders</CardTitle>
                        <CardAction>
                            <Link
                                href="/admin-panel/orders"
                                className="text-xs font-medium text-primary hover:underline"
                            >
                                View all
                            </Link>
                        </CardAction>
                    </CardHeader>
                    {recentOrders.length === 0 ? (
                        <CardContent className="py-6 text-sm text-muted-foreground">
                            No orders yet.
                        </CardContent>
                    ) : (
                        <CardContent className="p-0">
                            <ul className="divide-y">
                                {recentOrders.map((order) => (
                                    <li
                                        key={order.id}
                                        className="flex items-center justify-between px-5 py-3"
                                    >
                                        <div className="min-w-0">
                                            <p className="truncate font-mono text-xs font-medium">
                                                {order.reference}
                                            </p>
                                            <p className="truncate font-mono text-xs text-muted-foreground">
                                                {order.userEmail}
                                            </p>
                                        </div>
                                        <div className="ml-4 flex shrink-0 items-center gap-2">
                                            <Badge
                                                variant={
                                                    order.status === "PAID"
                                                        ? "default"
                                                        : "secondary"
                                                }
                                            >
                                                {order.status}
                                            </Badge>
                                            <span className="text-xs font-medium">
                                                {formatMoney(
                                                    order.total,
                                                    order.currency,
                                                )}
                                            </span>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    )}
                </Card>

                {/* Recent Payments */}
                <Card className="gap-0 py-0 hover:translate-y-0">
                    <CardHeader className="border-b py-4">
                        <CardTitle>Recent Payments</CardTitle>
                        <CardAction>
                            <Link
                                href="/admin-panel/payments"
                                className="text-xs font-medium text-primary hover:underline"
                            >
                                View all
                            </Link>
                        </CardAction>
                    </CardHeader>
                    {recentPayments.length === 0 ? (
                        <CardContent className="py-6 text-sm text-muted-foreground">
                            No payments yet.
                        </CardContent>
                    ) : (
                        <CardContent className="p-0">
                            <ul className="divide-y">
                                {recentPayments.map((payment) => (
                                    <li
                                        key={payment.id}
                                        className="flex items-center justify-between px-5 py-3"
                                    >
                                        <div className="min-w-0">
                                            <p className="truncate font-mono text-xs font-medium">
                                                {payment.providerReference}
                                            </p>
                                            <p className="truncate font-mono text-xs text-muted-foreground">
                                                {payment.order.userEmail}
                                            </p>
                                        </div>
                                        <div className="ml-4 flex shrink-0 items-center gap-2">
                                            <Badge
                                                variant={
                                                    payment.status ===
                                                    "SUCCESSFUL"
                                                        ? "default"
                                                        : "secondary"
                                                }
                                            >
                                                {payment.status}
                                            </Badge>
                                            <span className="text-xs font-medium">
                                                {formatMoney(
                                                    payment.amount,
                                                    payment.currency,
                                                )}
                                            </span>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    )}
                </Card>
            </div>

            {/* Quick links */}
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                {[
                    {
                        href: "/admin-panel/posts",
                        label: "Manage Blog Posts",
                        desc: "Create, edit, and delete journal entries",
                    },
                    {
                        href: "/admin-panel/collections",
                        label: "Manage Collections",
                        desc: "Organise products into themed categories",
                    },
                    {
                        href: "/admin-panel/products",
                        label: "Manage Products",
                        desc: "Add and update store catalogue items",
                    },
                    {
                        href: "/admin-panel/orders",
                        label: "View Orders",
                        desc: "Review checkout history and fulfillment status",
                    },
                    {
                        href: "/admin-panel/payments",
                        label: "View Payments",
                        desc: "Track provider references and payment outcomes",
                    },
                ].map((link) => (
                    <Card asChild key={link.href} size="sm">
                        <Link href={link.href}>
                            <CardHeader>
                                <CardTitle>{link.label}</CardTitle>
                                <CardDescription>{link.desc}</CardDescription>
                            </CardHeader>
                        </Link>
                    </Card>
                ))}
            </div>
        </div>
    );
}
