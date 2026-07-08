import { prisma } from "@/lib/prisma";
import { DeliveryStatus, Prisma } from "@prisma/client";
import { timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";

type PersistedCartItem = {
    productId: number;
    quantity: number;
    size?: string;
};

type FlutterwaveWebhookPayload = {
    id?: string;
    tx_ref?: string;
    txRef?: string;
    reference?: string;
    transaction_id?: string | number;
    status?: string;
    amount?: number | string;
    currency?: string;
    charged_amount?: number | string;
    chargedAmount?: number | string;
    type?: string;
    event?: string;
    timestamp?: number | string;
    data?: {
        id?: string | number;
        tx_ref?: string;
        txRef?: string;
        reference?: string;
        status?: string;
        amount?: number | string;
        currency?: string;
        charged_amount?: number | string;
        chargedAmount?: number | string;
    };
};

type FlutterwaveTransactionData = NonNullable<
    FlutterwaveWebhookPayload["data"]
>;

type FlutterwaveVerifyResponse = {
    status?: string;
    message?: string;
    data?: FlutterwaveTransactionData;
};

function getWebhookSecretHash() {
    return (
        process.env.FLW_SECRET_HASH?.trim() ||
        process.env.FLUTTERWAVE_WEBHOOK_SECRET_HASH?.trim() ||
        ""
    );
}

function getFlutterwaveBaseUrl() {
    return (
        process.env.FLUTTERWAVE_API_URL?.replace(/\/$/, "") ||
        "https://api.flutterwave.com/v3"
    );
}

function getFlutterwaveSecretKey() {
    return process.env.FLUTTERWAVE_SECRET_KEY?.trim() || "";
}

function secureCompare(actual: string, expected: string) {
    const actualBuffer = Buffer.from(actual);
    const expectedBuffer = Buffer.from(expected);

    return (
        actualBuffer.length === expectedBuffer.length &&
        timingSafeEqual(actualBuffer, expectedBuffer)
    );
}

function isValidFlutterwaveSignature(request: NextRequest) {
    const secretHash = getWebhookSecretHash();
    const verificationHash = request.headers.get("verif-hash") ?? "";

    if (!secretHash) {
        console.warn("[flutterwave-webhook] Secret hash is not configured");
        return false;
    }

    if (verificationHash) {
        const isMatch = secureCompare(verificationHash.trim(), secretHash);

        if (!isMatch) {
            console.warn(
                `[flutterwave-webhook] Verification hash mismatch: received length ${verificationHash.trim().length}, configured length ${secretHash.length}`,
            );
        }

        return isMatch;
    }

    console.warn(
        `[flutterwave-webhook] Missing verification headers: verif-hash=${Boolean(verificationHash)}`,
    );

    return false;
}

function normalizeStatus(status?: string) {
    return status?.trim().toLowerCase() ?? "";
}

function getPaymentReference(
    payload: FlutterwaveWebhookPayload,
    verifiedData?: FlutterwaveTransactionData | null,
) {
    return (
        verifiedData?.tx_ref?.trim() ||
        verifiedData?.txRef?.trim() ||
        verifiedData?.reference?.trim() ||
        payload.data?.tx_ref?.trim() ||
        payload.data?.txRef?.trim() ||
        payload.data?.reference?.trim() ||
        payload.tx_ref?.trim() ||
        payload.txRef?.trim() ||
        payload.reference?.trim() ||
        ""
    );
}

function getTransactionId(payload: FlutterwaveWebhookPayload) {
    return String(
        payload.data?.id ?? payload.transaction_id ?? payload.id ?? "",
    ).trim();
}

async function verifyFlutterwaveTransaction(transactionId: string) {
    const secretKey = getFlutterwaveSecretKey();

    if (!secretKey || !transactionId) {
        return null;
    }

    const response = await fetch(
        `${getFlutterwaveBaseUrl()}/transactions/${encodeURIComponent(transactionId)}/verify`,
        {
            headers: {
                Authorization: `Bearer ${secretKey}`,
            },
            cache: "no-store",
        },
    );

    const data = (await response
        .json()
        .catch(() => null)) as FlutterwaveVerifyResponse | null;

    if (!response.ok || !data?.data) {
        console.warn("[flutterwave-webhook] Transaction verification failed", {
            transactionId,
            status: response.status,
            message: data?.message ?? null,
        });
        return null;
    }

    return data.data;
}

function getWebhookAmountMinorUnits(
    payload: FlutterwaveWebhookPayload,
    verifiedData?: FlutterwaveTransactionData | null,
) {
    const rawAmount =
        verifiedData?.charged_amount ??
        verifiedData?.chargedAmount ??
        verifiedData?.amount ??
        payload.data?.charged_amount ??
        payload.data?.chargedAmount ??
        payload.data?.amount ??
        payload.charged_amount ??
        payload.chargedAmount ??
        payload.amount;
    const amount = Number(rawAmount);

    if (!Number.isFinite(amount) || amount <= 0) {
        return null;
    }

    return Math.round(amount * 100);
}

function doesAmountMatch(
    storedAmount: number,
    webhookAmountMinor: number | null,
) {
    if (webhookAmountMinor === null) {
        return false;
    }

    return (
        storedAmount === webhookAmountMinor ||
        storedAmount === Math.round(webhookAmountMinor / 100)
    );
}

function doesCurrencyMatch(storedCurrency: string, webhookCurrency?: string) {
    return (
        storedCurrency.trim().toUpperCase() ===
        (webhookCurrency ?? "").trim().toUpperCase()
    );
}

function getPaymentStatus(status: string) {
    if (["successful", "succeeded", "success", "completed"].includes(status)) {
        return "SUCCESSFUL";
    }

    if (["failed", "failure", "error"].includes(status)) {
        return "FAILED";
    }

    if (["cancelled", "canceled"].includes(status)) {
        return "CANCELLED";
    }

    return "PENDING";
}

function getOrderStatus(paymentStatus: ReturnType<typeof getPaymentStatus>) {
    if (paymentStatus === "SUCCESSFUL") {
        return "PAID";
    }

    if (paymentStatus === "FAILED") {
        return "FAILED";
    }

    if (paymentStatus === "CANCELLED") {
        return "CANCELLED";
    }

    return "PENDING";
}

function normalizePersistedCartItems(value: unknown): PersistedCartItem[] {
    if (!Array.isArray(value)) {
        return [];
    }

    return value
        .map((entry) => {
            const record = entry as Partial<PersistedCartItem>;

            return {
                productId: Number(record.productId ?? 0),
                quantity: Math.max(1, Number(record.quantity ?? 1)),
                size:
                    typeof record.size === "string" && record.size.trim()
                        ? record.size.trim()
                        : undefined,
            } satisfies PersistedCartItem;
        })
        .filter(
            (item) => Number.isFinite(item.productId) && item.productId > 0,
        );
}

function getCartItemKey(productId: number, size?: string) {
    return size ? `${productId}::${encodeURIComponent(size)}` : `${productId}`;
}

function getPurchasedQuantitiesFromOrderItems(orderItems: unknown) {
    const quantities = new Map<string, number>();

    if (!Array.isArray(orderItems)) {
        return quantities;
    }

    for (const entry of orderItems) {
        const record = entry as {
            key?: unknown;
            id?: unknown;
            productId?: unknown;
            quantity?: unknown;
            item_data?: unknown;
        };

        const quantity = Math.max(1, Number(record.quantity ?? 1));

        let itemKey = typeof record.key === "string" ? record.key.trim() : "";

        if (!itemKey) {
            const productId = Number(record.id ?? record.productId ?? 0);

            if (!Number.isFinite(productId) || productId <= 0) {
                continue;
            }

            let size = "";

            if (Array.isArray(record.item_data)) {
                const sizeField = record.item_data.find((item) => {
                    const data = item as { key?: unknown; value?: unknown };
                    return (
                        typeof data.key === "string" &&
                        data.key.trim().toLowerCase() === "size" &&
                        typeof data.value === "string"
                    );
                }) as { value?: string } | undefined;

                size = sizeField?.value?.trim() ?? "";
            }

            itemKey = getCartItemKey(productId, size || undefined);
        }

        const existing = quantities.get(itemKey) ?? 0;
        quantities.set(itemKey, existing + quantity);
    }

    return quantities;
}

function removePurchasedItemsFromCart(
    cartItems: PersistedCartItem[],
    purchasedQuantities: Map<string, number>,
) {
    if (purchasedQuantities.size === 0) {
        return cartItems;
    }

    const remaining = new Map(purchasedQuantities);

    return cartItems
        .map((item) => {
            const key = getCartItemKey(item.productId, item.size);
            const purchased = remaining.get(key) ?? 0;

            if (purchased <= 0) {
                return item;
            }

            const nextQuantity = item.quantity - purchased;
            remaining.set(key, Math.max(0, purchased - item.quantity));

            if (nextQuantity <= 0) {
                return null;
            }

            return {
                ...item,
                quantity: nextQuantity,
            };
        })
        .filter((item): item is PersistedCartItem => item !== null);
}

export async function POST(request: NextRequest) {
    if (!isValidFlutterwaveSignature(request)) {
        console.warn("[flutterwave-webhook] Invalid signature");
        return NextResponse.json({ received: false }, { status: 401 });
    }

    const payload = (await request.json()) as FlutterwaveWebhookPayload;
    const transactionId = getTransactionId(payload);
    const initialReference = getPaymentReference(payload);
    const verifiedData = initialReference
        ? null
        : await verifyFlutterwaveTransaction(transactionId);
    const reference = getPaymentReference(payload, verifiedData);

    console.log("[flutterwave-webhook] Received event", {
        event: payload.event ?? payload.type ?? null,
        reference: reference || null,
        transactionId: transactionId || null,
        status:
            verifiedData?.status ??
            payload.data?.status ??
            payload.status ??
            null,
    });

    if (!reference) {
        console.warn("[flutterwave-webhook] Missing payment reference");
        return NextResponse.json({ received: true });
    }

    const payment = await prisma.payment.findUnique({
        where: {
            providerReference: reference,
        },
        select: {
            id: true,
            orderId: true,
            amount: true,
            currency: true,
            status: true,
            order: {
                select: {
                    userEmail: true,
                    items: true,
                },
            },
        },
    });

    if (!payment) {
        console.warn(
            "[flutterwave-webhook] Unknown payment reference",
            reference,
        );
        return NextResponse.json({ received: true });
    }

    const normalizedStatus = normalizeStatus(
        verifiedData?.status ?? payload.data?.status ?? payload.status,
    );
    const paymentStatus = getPaymentStatus(normalizedStatus);
    const orderStatus = getOrderStatus(paymentStatus);
    const webhookAmountMinor = getWebhookAmountMinorUnits(
        payload,
        verifiedData,
    );
    const hasMatchingAmount = doesAmountMatch(
        payment.amount,
        webhookAmountMinor,
    );
    const hasMatchingCurrency = doesCurrencyMatch(
        payment.currency,
        verifiedData?.currency ?? payload.data?.currency ?? payload.currency,
    );
    const canMarkSuccessful =
        paymentStatus === "SUCCESSFUL" &&
        hasMatchingAmount &&
        hasMatchingCurrency;
    const nextPaymentStatus = canMarkSuccessful ? "SUCCESSFUL" : paymentStatus;
    const nextOrderStatus = canMarkSuccessful ? "PAID" : orderStatus;
    const paidAt = canMarkSuccessful ? new Date() : null;

    await prisma.$transaction(async (tx) => {
        await tx.payment.update({
            where: {
                id: payment.id,
            },
            data: {
                status: nextPaymentStatus,
                rawPayload: payload as Prisma.InputJsonValue,
                ...(paidAt ? { paidAt } : {}),
            },
        });

        if (nextOrderStatus !== "PENDING") {
            await tx.order.update({
                where: {
                    id: payment.orderId,
                },
                data: {
                    status: nextOrderStatus,
                    ...(canMarkSuccessful
                        ? {
                              deliveryStatus: DeliveryStatus.PROCESSING,
                              deliveryUpdatedAt: new Date(),
                          }
                        : {}),
                    ...(paidAt ? { paidAt } : {}),
                },
            });
        }

        if (canMarkSuccessful && payment.order.userEmail) {
            const purchasedQuantities = getPurchasedQuantitiesFromOrderItems(
                payment.order.items,
            );

            if (purchasedQuantities.size > 0) {
                const cart = await tx.cart.findUnique({
                    where: {
                        userEmail: payment.order.userEmail,
                    },
                    select: {
                        items: true,
                    },
                });

                if (cart) {
                    const normalizedItems = normalizePersistedCartItems(
                        cart.items,
                    );
                    const nextItems = removePurchasedItemsFromCart(
                        normalizedItems,
                        purchasedQuantities,
                    );

                    await tx.cart.update({
                        where: {
                            userEmail: payment.order.userEmail,
                        },
                        data: {
                            items: nextItems as Prisma.InputJsonValue,
                        },
                    });
                }
            }
        }
    });

    if (paymentStatus === "SUCCESSFUL" && !canMarkSuccessful) {
        console.warn("[flutterwave-webhook] Payment verification mismatch", {
            reference,
            amountMatched: hasMatchingAmount,
            currencyMatched: hasMatchingCurrency,
        });
    }

    return NextResponse.json({ received: true });
}
