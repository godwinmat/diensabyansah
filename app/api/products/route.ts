import { getWooCommerceProducts } from "@/lib/woocommerce";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const products = await getWooCommerceProducts();

        return NextResponse.json({
            success: true,
            count: products.length,
            products,
        });
    } catch (error) {
        console.error("Products API error:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Failed to load products",
                products: [],
            },
            { status: 500 },
        );
    }
}
