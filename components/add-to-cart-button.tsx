"use client";

import { Button } from "@/components/ui/button";
import { CART_UPDATED_EVENT } from "@/lib/cart";
import { useRouter } from "next/navigation";
import { useState } from "react";

type AddToCartButtonProps = {
    productId: number;
    size?: string;
    disabled?: boolean;
};

export function AddToCartButton({
    productId,
    size,
    disabled = false,
}: AddToCartButtonProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const handleAdd = async () => {
        setIsLoading(true);

        try {
            const response = await fetch("/api/cart/items", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    productId,
                    quantity: 1,
                    size,
                }),
            });

            const data = (await response.json().catch(() => null)) as {
                success?: boolean;
                message?: string;
            } | null;

            if (response.status === 401) {
                router.push("/account");
                return;
            }

            if (!response.ok || !data?.success) {
                throw new Error(data?.message || "Failed to add item to cart");
            }

            window.dispatchEvent(new CustomEvent(CART_UPDATED_EVENT));
            router.push("/cart");
            router.refresh();
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Button
            onClick={handleAdd}
            disabled={isLoading || disabled}
            className="mt-6 h-12 w-full rounded-none bg-primary text-sm font-semibold uppercase tracking-[0.14em] text-[#1f2937] hover:bg-primary/90"
        >
            {isLoading ? "Adding..." : "Add to cart"}
        </Button>
    );
}
