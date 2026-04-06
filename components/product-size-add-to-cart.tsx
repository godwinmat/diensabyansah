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
            <div className="mb-2 flex items-center justify-between">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#334155]">
                    Select Size
                </p>
                <button
                    type="button"
                    className="text-[10px] font-semibold uppercase tracking-[0.12em] text-primary"
                >
                    Size Guide
                </button>
            </div>

            {normalizedSizes.length > 0 ? (
                <div className="grid grid-cols-4 gap-2">
                    {normalizedSizes.map((size) => (
                        <button
                            key={size}
                            type="button"
                            onClick={() => setSelectedSize(size)}
                            className={
                                selectedSize === size
                                    ? "h-10 rounded-none border border-primary bg-primary/12 text-[11px] font-semibold uppercase tracking-[0.12em] text-primary"
                                    : "h-10 rounded-none border border-[#dce4ed] bg-white text-[11px] font-semibold uppercase tracking-[0.12em] text-[#64748b]"
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

            <AddToCartButton
                productId={productId}
                size={selectedSize || undefined}
                disabled={normalizedSizes.length > 0 && !selectedSize}
            />
        </div>
    );
}
