import {
    getAdminCookieName,
    verifyAdminSessionToken,
} from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

type CreatePostBody = {
    title?: string;
    slug?: string;
    excerpt?: string;
    content?: string;
    imageUrl?: string;
    categories?: string[];
    publishedAt?: string;
};

async function isAdminAuthenticated() {
    const cookieStore = await cookies();
    const token = cookieStore.get(getAdminCookieName())?.value ?? "";
    return Boolean(verifyAdminSessionToken(token));
}

async function getNextBlogExternalId() {
    const latest = await prisma.blogPost.findFirst({
        orderBy: {
            externalId: "desc",
        },
        select: {
            externalId: true,
        },
    });

    return (latest?.externalId ?? 0) + 1;
}

export async function POST(request: Request) {
    if (!(await isAdminAuthenticated())) {
        return NextResponse.json(
            {
                message: "Unauthorized.",
            },
            {
                status: 401,
            },
        );
    }

    const body = (await request.json().catch(() => null)) as
        | CreatePostBody
        | null;

    const title = body?.title?.trim() ?? "";
    const slug = body?.slug?.trim() ?? "";
    const excerpt = body?.excerpt?.trim() ?? "";
    const content = body?.content?.trim() ?? "";
    const imageUrl = body?.imageUrl?.trim() ?? "";

    if (!title || !slug || !excerpt || !content || !imageUrl) {
        return NextResponse.json(
            {
                message:
                    "Title, slug, excerpt, content, and image URL are required.",
            },
            {
                status: 400,
            },
        );
    }

    const categories = Array.from(
        new Set(
            (body?.categories ?? [])
                .map((category) => category.trim())
                .filter((category) => category.length > 0),
        ),
    );

    const publishedAt = body?.publishedAt?.trim()
        ? new Date(body.publishedAt)
        : null;

    if (publishedAt && Number.isNaN(publishedAt.getTime())) {
        return NextResponse.json(
            {
                message: "Published date is invalid.",
            },
            {
                status: 400,
            },
        );
    }

    try {
        const record = await prisma.blogPost.create({
            data: {
                externalId: await getNextBlogExternalId(),
                title,
                slug,
                excerpt,
                content,
                imageUrl,
                categories,
                publishedAt,
            },
            select: {
                id: true,
                externalId: true,
                title: true,
                slug: true,
            },
        });

        return NextResponse.json(
            {
                message: "Post created successfully.",
                post: record,
            },
            {
                status: 201,
            },
        );
    } catch {
        return NextResponse.json(
            {
                message:
                    "Unable to create post. Confirm the slug is unique and try again.",
            },
            {
                status: 500,
            },
        );
    }
}
