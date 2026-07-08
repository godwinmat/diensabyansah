import {
    addPersistedCartItemForUser,
    getCartUserEmailFromToken,
    removePersistedCartItemForUser,
    updatePersistedCartItemForUser,
} from "@/lib/cart-store";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    const body = (await request.json().catch(() => null)) as {
        productId?: number;
        quantity?: number;
        size?: string;
    } | null;

    const userEmail = getCartUserEmailFromToken(
        request.cookies.get("auth_token")?.value,
    );

    if (!userEmail) {
        return NextResponse.json(
            { success: false, message: "Authentication is required" },
            { status: 401 },
        );
    }

    const productId = Number(body?.productId);
    const quantity = Math.max(1, Number(body?.quantity ?? 1));
    const size = body?.size?.trim() ?? "";

    if (!Number.isFinite(productId) || productId <= 0) {
        return NextResponse.json(
            { success: false, message: "A valid productId is required" },
            { status: 400 },
        );
    }

    const items = await addPersistedCartItemForUser(userEmail, {
        productId,
        quantity,
        size: size || undefined,
    });

    return NextResponse.json({ success: true, cart: { items } });
}

export async function PATCH(request: NextRequest) {
    const body = (await request.json().catch(() => null)) as {
        key?: string;
        quantity?: number;
    } | null;

    const userEmail = getCartUserEmailFromToken(
        request.cookies.get("auth_token")?.value,
    );

    if (!userEmail) {
        return NextResponse.json(
            { success: false, message: "Authentication is required" },
            { status: 401 },
        );
    }

    const key = body?.key?.trim();
    const quantity = Math.max(0, Number(body?.quantity ?? 0));

    if (!key) {
        return NextResponse.json(
            { success: false, message: "Item key is required" },
            { status: 400 },
        );
    }

    if (quantity <= 0) {
        const items = await removePersistedCartItemForUser(userEmail, key);
        return NextResponse.json({ success: true, cart: { items } });
    }

    const items = await updatePersistedCartItemForUser(
        userEmail,
        key,
        quantity,
    );

    return NextResponse.json({ success: true, cart: { items } });
}

export async function DELETE(request: NextRequest) {
    const body = (await request.json().catch(() => null)) as {
        key?: string;
    } | null;

    const userEmail = getCartUserEmailFromToken(
        request.cookies.get("auth_token")?.value,
    );

    if (!userEmail) {
        return NextResponse.json(
            { success: false, message: "Authentication is required" },
            { status: 401 },
        );
    }

    const key = body?.key?.trim();

    if (!key) {
        return NextResponse.json(
            { success: false, message: "Item key is required" },
            { status: 400 },
        );
    }

    const items = await removePersistedCartItemForUser(userEmail, key);

    return NextResponse.json({ success: true, cart: { items } });
}
