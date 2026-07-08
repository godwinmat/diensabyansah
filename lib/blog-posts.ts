import { prisma } from "@/lib/prisma";

export type BlogPost = {
    id: number;
    slug: string;
    title: string;
    excerpt: string;
    content: string;
    image: string;
    categories: string[];
    date: string;
};

function mapPost(record: {
    externalId: number;
    slug: string;
    title: string;
    excerpt: string;
    content: string;
    imageUrl: string;
    categories: string[];
    publishedAt: Date | null;
}): BlogPost {
    return {
        id: record.externalId,
        slug: record.slug,
        title: record.title,
        excerpt: record.excerpt,
        content: record.content,
        image: record.imageUrl,
        categories: record.categories,
        date: record.publishedAt?.toISOString() ?? "",
    };
}

export async function getBlogPosts(limit = 20, query = "") {
    const normalizedQuery = query.trim();

    const records = await prisma.blogPost.findMany({
        where: normalizedQuery
            ? {
                  OR: [
                      {
                          title: {
                              contains: normalizedQuery,
                              mode: "insensitive",
                          },
                      },
                      {
                          excerpt: {
                              contains: normalizedQuery,
                              mode: "insensitive",
                          },
                      },
                      {
                          content: {
                              contains: normalizedQuery,
                              mode: "insensitive",
                          },
                      },
                  ],
              }
            : undefined,
        orderBy: [
            {
                publishedAt: "desc",
            },
            {
                createdAt: "desc",
            },
        ],
        take: Math.max(1, Math.floor(limit)),
    });

    return records.map(mapPost);
}

export async function getBlogPostBySlug(slug: string) {
    const normalizedSlug = slug.trim();

    if (!normalizedSlug) {
        return null;
    }

    const record = await prisma.blogPost.findUnique({
        where: {
            slug: normalizedSlug,
        },
    });

    return record ? mapPost(record) : null;
}
