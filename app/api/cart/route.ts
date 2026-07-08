import {
    buildCartApiResponseForUser,
    getCartUserEmailFromToken,
} from "@/lib/cart-store";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const authToken = request.cookies.get("auth_token")?.value;
    const userEmail = getCartUserEmailFromToken(authToken);

    if (!userEmail) {
        return NextResponse.json(
            {
                success: false,
                message: "Authentication is required",
                cart: null,
            },
            { status: 401 },
        );
    }

    const cart = await buildCartApiResponseForUser(userEmail);

    return NextResponse.json({
        success: true,
        cart,
    });
}
