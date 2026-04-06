"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CART_UPDATED_EVENT } from "@/lib/cart";
import {
    CreditCard,
    DeviceMobile,
    ShieldCheck,
    X,
} from "@phosphor-icons/react/dist/ssr";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type WooCartItem = {
    key: string;
    id: number;
    quantity: number;
    name: string;
    short_description?: string;
    description?: string;
    permalink?: string;
    images?: Array<{
        src?: string;
        alt?: string;
    }>;
    item_data?: Array<{
        key?: string;
        value?: string;
    }>;
    prices?: {
        price?: string;
        currency_code?: string;
        currency_minor_unit?: number;
        currency_symbol?: string;
    };
    totals?: {
        line_total?: string;
        currency_code?: string;
        currency_minor_unit?: number;
        currency_symbol?: string;
    };
};

type WooCart = {
    items?: WooCartItem[];
    totals?: {
        total_items?: string;
        total_shipping?: string | null;
        total_price?: string;
        currency_code?: string;
        currency_minor_unit?: number;
        currency_symbol?: string;
        currency_prefix?: string;
        currency_suffix?: string;
    };
    shipping_rates?: Array<{
        shipping_rates?: Array<{
            name?: string;
            price?: string;
            selected?: boolean;
        }>;
    }>;
};

const shipping = 0;

const money = (
    value: number,
    currencyCode = "USD",
    minorUnit = 2,
    currencySymbol?: string,
) => {
    const amount = value / 10 ** minorUnit;

    try {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: currencyCode,
            minimumFractionDigits: minorUnit,
            maximumFractionDigits: minorUnit,
        }).format(amount);
    } catch {
        return `${currencySymbol ?? "$"}${amount.toFixed(minorUnit)}`;
    }
};

const parseMinorUnitAmount = (value?: string | null) => {
    const amount = Number(value ?? 0);
    return Number.isFinite(amount) ? amount : 0;
};

const stripHtml = (value?: string) =>
    (value ?? "")
        .replace(/<[^>]*>/g, " ")
        .replace(/\s+/g, " ")
        .trim();

export default function CartPage() {
    const [cart, setCart] = useState<WooCart | null>(null);
    const [loading, setLoading] = useState(true);
    const [mutatingKey, setMutatingKey] = useState<string | null>(null);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadCart = async () => {
            setLoading(true);
            setError("");

            try {
                const response = await fetch("/api/cart", {
                    method: "GET",
                    cache: "no-store",
                });

                const data = (await response.json().catch(() => null)) as {
                    success?: boolean;
                    cart?: WooCart;
                    message?: string;
                } | null;

                if (!response.ok || !data?.success) {
                    throw new Error(data?.message || "Failed to load cart");
                }

                setCart(data.cart ?? null);
            } catch (loadError) {
                setCart(null);
                setError(
                    loadError instanceof Error
                        ? loadError.message
                        : "Failed to load cart",
                );
            } finally {
                setLoading(false);
            }
        };

        void loadCart();

        const refreshCart = () => {
            void loadCart();
        };

        window.addEventListener(CART_UPDATED_EVENT, refreshCart);

        return () => {
            window.removeEventListener(CART_UPDATED_EVENT, refreshCart);
        };
    }, []);

    const cartItems = cart?.items ?? [];
    const totals = cart?.totals;
    const minorUnit = totals?.currency_minor_unit ?? 2;
    const currencyCode = totals?.currency_code ?? "USD";
    const currencySymbol = totals?.currency_symbol;

    const subtotal = useMemo(
        () => parseMinorUnitAmount(totals?.total_items),
        [totals?.total_items],
    );
    const shippingTotal = parseMinorUnitAmount(totals?.total_shipping);
    const total = parseMinorUnitAmount(totals?.total_price);

    const mutateItem = async (
        body: Record<string, unknown>,
        method: "PATCH" | "DELETE",
    ) => {
        setMutatingKey(String(body.key ?? ""));

        try {
            const response = await fetch("/api/cart/items", {
                method,
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(body),
            });

            const data = (await response.json().catch(() => null)) as {
                success?: boolean;
                message?: string;
            } | null;

            if (!response.ok || !data?.success) {
                throw new Error(data?.message || "Cart update failed");
            }

            window.dispatchEvent(new CustomEvent(CART_UPDATED_EVENT));
        } finally {
            setMutatingKey(null);
        }
    };

    const increaseQty = (key: string, quantity: number) => {
        void mutateItem({ key, quantity: quantity + 1 }, "PATCH");
    };

    const decreaseQty = (key: string, quantity: number) => {
        const nextQuantity = Math.max(0, quantity - 1);
        if (nextQuantity === 0) {
            void mutateItem({ key }, "DELETE");
            return;
        }

        void mutateItem({ key, quantity: nextQuantity }, "PATCH");
    };

    const removeItem = (key: string) => {
        void mutateItem({ key }, "DELETE");
    };

    const checkoutUrl = "https://diensabyansah.com/checkout";
    const isCheckoutDisabled = cartItems.length === 0;

    return (
        <div className="bg-[#f4f4f3]">
            <section className="mx-auto w-full max-w-screen px-5 pb-14 pt-8 md:px-8 lg:px-16 lg:pb-20 xl:px-24 2xl:px-36 reveal-up">
                <h1 className="text-5xl font-semibold tracking-tight text-[#1e293b]">
                    Your Bag
                </h1>
                <p className="mt-2 text-sm text-[#94a3b8]">
                    Review your selections from the latest collection.
                </p>

                <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_350px] lg:items-start">
                    <div className="space-y-5">
                        {loading ? (
                            <div className="rounded-sm border border-[#e2e8f0] bg-white p-8 text-center text-sm text-[#64748b]">
                                Loading your cart...
                            </div>
                        ) : null}

                        {!loading && error ? (
                            <div className="rounded-sm border border-red-200 bg-red-50 p-8 text-center">
                                <p className="text-xl font-semibold text-red-700">
                                    Couldn’t load cart
                                </p>
                                <p className="mt-2 text-sm text-red-600">
                                    {error}
                                </p>
                            </div>
                        ) : null}

                        {!loading && !error && cartItems.length === 0 ? (
                            <div className="rounded-sm border border-[#e2e8f0] bg-white p-8 text-center">
                                <p className="text-xl font-semibold text-[#1e293b]">
                                    Your cart is empty
                                </p>
                                <p className="mt-2 text-sm text-[#64748b]">
                                    Add products from the collection to see them
                                    here.
                                </p>
                            </div>
                        ) : null}

                        {cartItems.map((item, index) => (
                            <article key={item.key}>
                                <div className="grid gap-5 sm:grid-cols-[120px_1fr_auto] sm:items-start">
                                    <div className="relative h-36 w-28 overflow-hidden rounded-sm bg-white">
                                        <Image
                                            src={
                                                item.images?.[0]?.src ||
                                                "https://images.unsplash.com/photo-1615212814093-4f4c0ca0d7f5?auto=format&fit=crop&w=900&q=80"
                                            }
                                            alt={item.name}
                                            fill
                                            sizes="120px"
                                            className="object-cover"
                                        />
                                    </div>

                                    <div>
                                        <h2 className="mt-1 text-3xl font-semibold text-[#1e293b]">
                                            {item.name}
                                        </h2>
                                        <p className="mt-1 text-base text-[#64748b]">
                                            {stripHtml(
                                                item.short_description ||
                                                    item.description ||
                                                    item.name,
                                            )}
                                        </p>
                                        <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-[#94a3b8]">
                                            {item.item_data?.find((entry) =>
                                                String(entry.key ?? "")
                                                    .toLowerCase()
                                                    .includes("size"),
                                            )?.value ? (
                                                <span>
                                                    Size:{" "}
                                                    {
                                                        item.item_data.find(
                                                            (entry) =>
                                                                String(
                                                                    entry.key ??
                                                                        "",
                                                                )
                                                                    .toLowerCase()
                                                                    .includes(
                                                                        "size",
                                                                    ),
                                                        )?.value
                                                    }
                                                </span>
                                            ) : null}
                                            <span>Qty: {item.quantity}</span>
                                        </div>

                                        <div className="mt-4 inline-flex items-center rounded-sm border border-[#e2e8f0] bg-white px-1">
                                            <button
                                                type="button"
                                                className="h-8 w-8 text-[#94a3b8]"
                                                onClick={() =>
                                                    decreaseQty(
                                                        item.key,
                                                        item.quantity,
                                                    )
                                                }
                                                disabled={
                                                    mutatingKey === item.key
                                                }
                                                aria-label={`Decrease quantity for ${item.name}`}
                                            >
                                                -
                                            </button>
                                            <span className="w-8 text-center text-sm font-semibold text-[#334155]">
                                                {item.quantity}
                                            </span>
                                            <button
                                                type="button"
                                                className="h-8 w-8 text-primary"
                                                onClick={() =>
                                                    increaseQty(
                                                        item.key,
                                                        item.quantity,
                                                    )
                                                }
                                                disabled={
                                                    mutatingKey === item.key
                                                }
                                                aria-label={`Increase quantity for ${item.name}`}
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4 sm:flex-col sm:items-end">
                                        <button
                                            type="button"
                                            className="text-[#94a3b8] transition-colors hover:text-[#334155]"
                                            onClick={() => removeItem(item.key)}
                                            disabled={mutatingKey === item.key}
                                            aria-label={`Remove ${item.name} from cart`}
                                        >
                                            <X size={16} weight="bold" />
                                        </button>
                                        <p className="pt-1 text-3xl font-semibold text-primary">
                                            {money(
                                                parseMinorUnitAmount(
                                                    item.totals?.line_total ??
                                                        item.prices?.price,
                                                ),
                                                item.totals?.currency_code ??
                                                    currencyCode,
                                                item.totals
                                                    ?.currency_minor_unit ??
                                                    minorUnit,
                                                item.totals?.currency_symbol ??
                                                    currencySymbol,
                                            )}
                                        </p>
                                    </div>
                                </div>

                                {index !== cartItems.length - 1 && (
                                    <Separator className="mt-6 bg-[#e2e8f0]" />
                                )}
                            </article>
                        ))}
                    </div>

                    <Card className="glass-panel gap-0 rounded-xl bg-white/85 py-0 shadow-none ring-1 ring-[#e2e8f0]">
                        <CardContent className="p-6">
                            <h3 className="text-3xl uppercase font-semibold text-[#1e293b]">
                                Order Summary
                            </h3>

                            <div className="mt-6 space-y-4 text-base text-[#64748b]">
                                <div className="flex items-center justify-between gap-3">
                                    <span>Subtotal</span>
                                    <span className="font-medium text-[#334155]">
                                        {money(
                                            subtotal,
                                            currencyCode,
                                            minorUnit,
                                            currencySymbol,
                                        )}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between gap-3">
                                    <span>Shipping (Estimated)</span>
                                    <span className="font-medium text-[#334155]">
                                        {money(
                                            shippingTotal,
                                            currencyCode,
                                            minorUnit,
                                            currencySymbol,
                                        )}
                                    </span>
                                </div>
                            </div>

                            <Separator className="my-5 bg-[#e2e8f0]" />

                            <div className="flex items-center justify-between gap-3">
                                <span className="text-2xl font-semibold text-[#1e293b]">
                                    Total
                                </span>
                                <span className="text-3xl font-semibold text-primary">
                                    {money(
                                        total,
                                        currencyCode,
                                        minorUnit,
                                        currencySymbol,
                                    )}
                                </span>
                            </div>

                            {isCheckoutDisabled ? (
                                <Button
                                    disabled
                                    className="mt-6 h-12 w-full rounded-sm bg-primary text-sm font-semibold uppercase tracking-[0.14em] text-[#1f2937] hover:bg-primary/90"
                                >
                                    Proceed to Checkout
                                </Button>
                            ) : (
                                <Button
                                    asChild
                                    className="mt-6 h-12 w-full rounded-sm bg-primary text-sm font-semibold uppercase tracking-[0.14em] text-[#1f2937] hover:bg-primary/90"
                                >
                                    <Link
                                        href={checkoutUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        Proceed to Checkout
                                    </Link>
                                </Button>
                            )}

                            <div className="mt-6">
                                <p className="text-sm font-medium text-[#64748b]">
                                    Accepted Payment Methods
                                </p>
                                <div className="mt-3 flex items-center gap-3 text-[#334155]">
                                    <CreditCard size={18} />
                                    <DeviceMobile size={18} />
                                    <ShieldCheck size={18} />
                                </div>
                            </div>

                            <div className="mt-5 rounded-sm border border-[#eaeef3] bg-[#f8fafc] p-3">
                                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#475569]">
                                    Authenticity Guaranteed
                                </p>
                                <p className="mt-1 text-xs text-[#94a3b8]">
                                    Each Diensa piece is handcrafted by our
                                    master artisans in West Africa.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </section>
        </div>
    );
}
