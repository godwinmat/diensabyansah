import {
    getAdminCookieName,
    verifyAdminSessionToken,
} from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

type CreateCollectionBody = {
    name?: string;
    slug?: string;
    description?: string;
    imageUrl?: string;
    featured?: boolean;
    externalId?: string;
};

async function isAdminAuthenticated() {
    const cookieStore = await cookies();
    const token = cookieStore.get(getAdminCookieName())?.value ?? "";
    return Boolean(verifyAdminSessionToken(token));
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
        | CreateCollectionBody
        | null;

    const name = body?.name?.trim() ?? "";
    const slug = body?.slug?.trim() ?? "";
    const description = body?.description?.trim() ?? "";
    const imageUrl = body?.imageUrl?.trim() ?? "";

    if (!name || !slug || !description || !imageUrl) {
        return NextResponse.json(
            {
                message:
                    "Name, slug, description, and image URL are required.",
            },
            {
                status: 400,
            },
        );
    }

    const externalId = body?.externalId?.trim()
        ? Number(body.externalId)
        : null;

    if (externalId !== null && !Number.isFinite(externalId)) {
        return NextResponse.json(
            {
                message: "External ID must be a number if provided.",
            },
            {
                status: 400,
            },
        );
    }

    try {
        const record = await prisma.collection.create({
            data: {
                name,
                slug,
                description,
                imageUrl,
                featured: Boolean(body?.featured),
                externalId,
                productCount: 0,
            },
            select: {
                id: true,
                name: true,
                slug: true,
            },
        });

        return NextResponse.json(
            {
                message: "Collection created successfully.",
                collection: record,
            },
            {
                status: 201,
            },
        );
    } catch {
        return NextResponse.json(
            {
                message:
                    "Unable to create collection. Confirm slug/external ID uniqueness and try again.",
            },
            {
                status: 500,
            },
        );
    }
}
