"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";

type CartItem = {
    key: string;
    quantity: number;
    name: string;
    totals?: {
        line_total?: string;
    };
};

type CartPayload = {
    success?: boolean;
    message?: string;
    cart?: {
        items?: CartItem[];
        totals?: {
            total_items?: string;
            total_shipping?: string | null;
            total_price?: string;
            currency_code?: string;
            currency_minor_unit?: number;
            currency_symbol?: string;
        };
    };
};

type DeliveryDefaultsPayload = {
    success?: boolean;
    defaults?: {
        deliveryContactName?: string;
        deliveryPhone?: string;
        deliveryAddressLine1?: string;
        deliveryAddressLine2?: string;
        deliveryCity?: string;
        deliveryState?: string;
        deliveryPostalCode?: string;
        deliveryCountry?: string;
        deliveryNotes?: string;
    };
};

function parseMinorUnitAmount(value?: string | null) {
    const amount = Number(value ?? 0);
    return Number.isFinite(amount) ? amount : 0;
}

function formatMoney(
    amountMinor: number,
    currencyCode = "USD",
    minorUnit = 2,
    currencySymbol?: string,
) {
    const amount = amountMinor / 10 ** minorUnit;

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
}

export default function CheckoutPage() {
    const router = useRouter();
    const [loadingCart, setLoadingCart] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [totals, setTotals] = useState<CartPayload["cart"]["totals"]>();

    const [deliveryContactName, setDeliveryContactName] = useState("");
    const [deliveryPhone, setDeliveryPhone] = useState("");
    const [deliveryAddressLine1, setDeliveryAddressLine1] = useState("");
    const [deliveryAddressLine2, setDeliveryAddressLine2] = useState("");
    const [deliveryCity, setDeliveryCity] = useState("");
    const [deliveryState, setDeliveryState] = useState("");
    const [deliveryPostalCode, setDeliveryPostalCode] = useState("");
    const [deliveryCountry, setDeliveryCountry] = useState("");
    const [deliveryNotes, setDeliveryNotes] = useState("");

    useEffect(() => {
        const loadCart = async () => {
            setLoadingCart(true);
            setError("");

            try {
                const [cartResponse, defaultsResponse] = await Promise.all([
                    fetch("/api/cart", {
                        method: "GET",
                        cache: "no-store",
                    }),
                    fetch("/api/account/delivery-defaults", {
                        method: "GET",
                        cache: "no-store",
                    }),
                ]);

                const data = (await cartResponse
                    .json()
                    .catch(() => null)) as CartPayload | null;

                const defaultsData = (await defaultsResponse
                    .json()
                    .catch(() => null)) as DeliveryDefaultsPayload | null;

                if (!cartResponse.ok || !data?.success) {
                    throw new Error(
                        data?.message || "Unable to load checkout cart",
                    );
                }

                setCartItems(data.cart?.items ?? []);
                setTotals(data.cart?.totals);

                if (
                    defaultsResponse.ok &&
                    defaultsData?.success &&
                    defaultsData.defaults
                ) {
                    setDeliveryContactName(
                        defaultsData.defaults.deliveryContactName ?? "",
                    );
                    setDeliveryPhone(defaultsData.defaults.deliveryPhone ?? "");
                    setDeliveryAddressLine1(
                        defaultsData.defaults.deliveryAddressLine1 ?? "",
                    );
                    setDeliveryAddressLine2(
                        defaultsData.defaults.deliveryAddressLine2 ?? "",
                    );
                    setDeliveryCity(defaultsData.defaults.deliveryCity ?? "");
                    setDeliveryState(defaultsData.defaults.deliveryState ?? "");
                    setDeliveryPostalCode(
                        defaultsData.defaults.deliveryPostalCode ?? "",
                    );
                    setDeliveryCountry(
                        defaultsData.defaults.deliveryCountry ?? "",
                    );
                    setDeliveryNotes(defaultsData.defaults.deliveryNotes ?? "");
                }
            } catch (checkoutError) {
                setError(
                    checkoutError instanceof Error
                        ? checkoutError.message
                        : "Unable to load checkout",
                );
            } finally {
                setLoadingCart(false);
            }
        };

        void loadCart();
    }, []);

    const currencyCode = totals?.currency_code ?? "USD";
    const minorUnit = totals?.currency_minor_unit ?? 2;
    const currencySymbol = totals?.currency_symbol;

    const subtotal = useMemo(
        () => parseMinorUnitAmount(totals?.total_items),
        [totals?.total_items],
    );
    const shipping = useMemo(
        () => parseMinorUnitAmount(totals?.total_shipping),
        [totals?.total_shipping],
    );
    const total = useMemo(
        () => parseMinorUnitAmount(totals?.total_price),
        [totals?.total_price],
    );

    const isCartEmpty = cartItems.length === 0;

    const handleCheckout = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (isCartEmpty) {
            setError("Your cart is empty.");
            return;
        }

        setSubmitting(true);
        setError("");

        try {
            const response = await fetch("/api/cart/checkout", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    deliveryContactName,
                    deliveryPhone,
                    deliveryAddressLine1,
                    deliveryAddressLine2,
                    deliveryCity,
                    deliveryState,
                    deliveryPostalCode,
                    deliveryCountry,
                    deliveryNotes,
                }),
            });

            const data = (await response.json().catch(() => null)) as {
                success?: boolean;
                message?: string;
                checkoutUrl?: string;
            } | null;

            if (!response.ok || !data?.success || !data.checkoutUrl) {
                throw new Error(data?.message || "Unable to prepare checkout");
            }

            window.location.href = data.checkoutUrl;
        } catch (checkoutError) {
            setError(
                checkoutError instanceof Error
                    ? checkoutError.message
                    : "Checkout failed",
            );
        } finally {
            setSubmitting(false);
        }
    };

    if (loadingCart) {
        return (
            <section className="mx-auto max-w-3xl px-5 py-12">
                <p className="text-sm text-muted-foreground">
                    Loading checkout...
                </p>
            </section>
        );
    }

    if (isCartEmpty) {
        return (
            <section className="mx-auto max-w-3xl px-5 py-12">
                <h1 className="text-3xl font-semibold text-[#1e293b]">
                    Checkout
                </h1>
                <p className="mt-3 text-sm text-muted-foreground">
                    Your cart is empty. Add products before checkout.
                </p>
                <Button
                    type="button"
                    className="mt-6"
                    onClick={() => router.push("/products")}
                >
                    Continue Shopping
                </Button>
            </section>
        );
    }

    return (
        <section className="mx-auto max-w-5xl px-5 py-10 reveal-up">
            <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
                <form onSubmit={handleCheckout} className="space-y-5">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
                            Checkout
                        </p>
                        <h1 className="mt-2 text-4xl font-semibold text-[#1e293b]">
                            Delivery Details
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Add delivery information before payment.
                        </p>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2 sm:col-span-2">
                            <Label htmlFor="delivery-contact-name">
                                Full Name
                            </Label>
                            <Input
                                id="delivery-contact-name"
                                required
                                value={deliveryContactName}
                                onChange={(event) =>
                                    setDeliveryContactName(event.target.value)
                                }
                                placeholder="Recipient full name"
                            />
                        </div>
                        <div className="space-y-2 sm:col-span-2">
                            <Label htmlFor="delivery-phone">Phone Number</Label>
                            <Input
                                id="delivery-phone"
                                required
                                value={deliveryPhone}
                                onChange={(event) =>
                                    setDeliveryPhone(event.target.value)
                                }
                                placeholder="+234..."
                            />
                        </div>
                        <div className="space-y-2 sm:col-span-2">
                            <Label htmlFor="delivery-line1">
                                Address Line 1
                            </Label>
                            <Input
                                id="delivery-line1"
                                required
                                value={deliveryAddressLine1}
                                onChange={(event) =>
                                    setDeliveryAddressLine1(event.target.value)
                                }
                                placeholder="Street address"
                            />
                        </div>
                        <div className="space-y-2 sm:col-span-2">
                            <Label htmlFor="delivery-line2">
                                Address Line 2 (Optional)
                            </Label>
                            <Input
                                id="delivery-line2"
                                value={deliveryAddressLine2}
                                onChange={(event) =>
                                    setDeliveryAddressLine2(event.target.value)
                                }
                                placeholder="Apartment, suite, landmark"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="delivery-city">City</Label>
                            <Input
                                id="delivery-city"
                                required
                                value={deliveryCity}
                                onChange={(event) =>
                                    setDeliveryCity(event.target.value)
                                }
                                placeholder="City"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="delivery-state">State/Region</Label>
                            <Input
                                id="delivery-state"
                                value={deliveryState}
                                onChange={(event) =>
                                    setDeliveryState(event.target.value)
                                }
                                placeholder="State or region"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="delivery-postal-code">
                                Postal Code
                            </Label>
                            <Input
                                id="delivery-postal-code"
                                value={deliveryPostalCode}
                                onChange={(event) =>
                                    setDeliveryPostalCode(event.target.value)
                                }
                                placeholder="Postal code"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="delivery-country">Country</Label>
                            <Input
                                id="delivery-country"
                                required
                                value={deliveryCountry}
                                onChange={(event) =>
                                    setDeliveryCountry(event.target.value)
                                }
                                placeholder="Country"
                            />
                        </div>
                        <div className="space-y-2 sm:col-span-2">
                            <Label htmlFor="delivery-notes">
                                Delivery Notes (Optional)
                            </Label>
                            <Textarea
                                id="delivery-notes"
                                rows={4}
                                value={deliveryNotes}
                                onChange={(event) =>
                                    setDeliveryNotes(event.target.value)
                                }
                                placeholder="Gate code, landmark, preferred time"
                            />
                        </div>
                    </div>

                    {error ? (
                        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                            {error}
                        </p>
                    ) : null}

                    <Button
                        type="submit"
                        disabled={submitting}
                        className="h-12 rounded-sm px-6 text-sm font-semibold uppercase tracking-[0.14em]"
                    >
                        {submitting
                            ? "Preparing Payment..."
                            : "Proceed to Payment"}
                        <ArrowRight size={16} weight="bold" />
                    </Button>
                </form>

                <aside className="h-fit rounded-xl border border-[#e2e8f0] bg-white/90 p-5">
                    <h2 className="text-xl font-semibold text-[#1e293b]">
                        Order Summary
                    </h2>
                    <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                        <p>{cartItems.length} item(s)</p>
                        <div className="space-y-1">
                            {cartItems.slice(0, 5).map((item) => (
                                <p key={item.key} className="truncate">
                                    {item.quantity}x {item.name}
                                </p>
                            ))}
                        </div>
                    </div>

                    <div className="mt-5 space-y-2 border-t pt-4 text-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">
                                Subtotal
                            </span>
                            <span>
                                {formatMoney(
                                    subtotal,
                                    currencyCode,
                                    minorUnit,
                                    currencySymbol,
                                )}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">
                                Shipping
                            </span>
                            <span>
                                {formatMoney(
                                    shipping,
                                    currencyCode,
                                    minorUnit,
                                    currencySymbol,
                                )}
                            </span>
                        </div>
                        <div className="flex items-center justify-between text-base font-semibold">
                            <span>Total</span>
                            <span>
                                {formatMoney(
                                    total,
                                    currencyCode,
                                    minorUnit,
                                    currencySymbol,
                                )}
                            </span>
                        </div>
                    </div>
                </aside>
            </div>
        </section>
    );
}
