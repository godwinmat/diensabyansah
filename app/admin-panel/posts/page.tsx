import { PostsTable, type AdminPost } from "@/components/admin/posts-table";
import {
    getAdminCookieName,
    getAdminLoginPath,
    verifyAdminSessionToken,
} from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminPostsPage() {
    const cookieStore = await cookies();
    const token = cookieStore.get(getAdminCookieName())?.value ?? "";
    const adminSession = verifyAdminSessionToken(token);

    if (!adminSession) {
        redirect(getAdminLoginPath());
    }

    const posts = await prisma.blogPost.findMany({
        orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
        select: {
            id: true,
            externalId: true,
            slug: true,
            title: true,
            excerpt: true,
            content: true,
            imageUrl: true,
            categories: true,
            publishedAt: true,
            createdAt: true,
        },
    });

    const serialized: AdminPost[] = posts.map((post) => ({
        ...post,
        publishedAt: post.publishedAt?.toISOString() ?? null,
        createdAt: post.createdAt.toISOString(),
    }));

    return (
        <div className="mx-auto max-w-7xl px-6 py-8">
            <div className="mb-6">
                <h1 className="text-2xl font-bold">Blog Posts</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    Create, edit, and delete journal articles.
                </p>
            </div>
            <PostsTable initialPosts={serialized} />
        </div>
    );
}
