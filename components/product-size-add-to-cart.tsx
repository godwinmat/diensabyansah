"use client";

import { AddToCartButton } from "@/components/add-to-cart-button";
import { useMemo, useState } from "react";

type ProductSizeAddToCartProps = {
    productId: number;
    sizes: string[];
};

export function ProductSizeAddToCart({
    productId,
    sizes,
}: ProductSizeAddToCartProps) {
    const normalizedSizes = useMemo(
        () =>
            sizes.map((size) => size.trim()).filter((size) => size.length > 0),
        [sizes],
    );

    const [selectedSize, setSelectedSize] = useState<string>(
        normalizedSizes[0] ?? "",
    );

    return (
        <div className="mt-6">
            <div className="mb-2 flex items-center justify-between gap-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#334155]">
                    Select Size
                </p>
                <button
                    type="button"
                    className="text-[10px] font-semibold uppercase tracking-[0.16em] text-primary transition-colors hover:text-[#9d7f14]"
                >
                    Size Guide
                </button>
            </div>

            {normalizedSizes.length > 0 ? (
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {normalizedSizes.map((size) => (
                        <button
                            key={size}
                            type="button"
                            onClick={() => setSelectedSize(size)}
                            className={
                                selectedSize === size
                                    ? "h-12 rounded-full border border-primary bg-primary text-[11px] font-semibold uppercase tracking-[0.16em] text-[#1f2937] shadow-[0_10px_24px_rgba(196,162,66,0.28)]"
                                    : "h-12 rounded-full border border-[#d8dee6] bg-[#fbfaf7] text-[11px] font-semibold uppercase tracking-[0.16em] text-[#64748b] transition-colors hover:border-primary/40 hover:text-[#334155]"
                            }
                            aria-pressed={selectedSize === size}
                        >
                            {size}
                        </button>
                    ))}
                </div>
            ) : (
                <p className="text-sm text-[#94a3b8]">
                    Size options are not available.
                </p>
            )}

            <div className="mt-1">
                <AddToCartButton
                    productId={productId}
                    size={selectedSize || undefined}
                    disabled={normalizedSizes.length > 0 && !selectedSize}
                />
            </div>
        </div>
    );
}
