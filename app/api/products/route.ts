import { getCatalogProducts } from "@/lib/catalog";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const products = await getCatalogProducts();

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
