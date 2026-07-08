import {
    buildCartApiResponseForUser,
    getCartUserEmailFromToken,
} from "@/lib/cart-store";
import { createFlutterwavePaymentLink } from "@/lib/flutterwave";
import { prisma } from "@/lib/prisma";
import { DeliveryStatus, Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

type CheckoutRequestBody = {
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

function getDefaultNameParts(email: string) {
    const local = email.split("@")[0] ?? "Customer";
    const normalized = local
        .replace(/[^a-zA-Z0-9._-]/g, " ")
        .replace(/[._-]+/g, " ")
        .trim();
    const parts =
        normalized.length > 0 ? normalized.split(/\s+/) : ["Customer"];
    const firstName = parts[0] ?? "Customer";
    const lastName = parts.slice(1).join(" ") || "Customer";

    return { firstName, lastName };
}

export async function POST(request: NextRequest) {
    const authToken = request.cookies.get("auth_token")?.value;
    const userEmail = getCartUserEmailFromToken(authToken);

    if (!userEmail) {
        console.error("[checkout] No authenticated user");
        return NextResponse.json(
            { success: false, message: "Authentication is required" },
            { status: 401 },
        );
    }

    const body = (await request
        .json()
        .catch(() => null)) as CheckoutRequestBody | null;

    const deliveryContactNameInput = body?.deliveryContactName?.trim() ?? "";
    const deliveryPhoneInput = body?.deliveryPhone?.trim() ?? "";
    const deliveryAddressLine1Input = body?.deliveryAddressLine1?.trim() ?? "";
    const deliveryAddressLine2Input = body?.deliveryAddressLine2?.trim() ?? "";
    const deliveryCityInput = body?.deliveryCity?.trim() ?? "";
    const deliveryStateInput = body?.deliveryState?.trim() ?? "";
    const deliveryPostalCodeInput = body?.deliveryPostalCode?.trim() ?? "";
    const deliveryCountryInput = body?.deliveryCountry?.trim() ?? "";
    const deliveryNotesInput = body?.deliveryNotes?.trim() ?? "";

    const userDefaults = await prisma.user.findUnique({
        where: { email: userEmail },
        select: {
            deliveryDefaultContactName: true,
            deliveryDefaultPhone: true,
            deliveryDefaultAddress: true,
            deliveryDefaultNotes: true,
        },
    });

    const defaultAddress =
        userDefaults?.deliveryDefaultAddress &&
        typeof userDefaults.deliveryDefaultAddress === "object" &&
        !Array.isArray(userDefaults.deliveryDefaultAddress)
            ? (userDefaults.deliveryDefaultAddress as Record<string, unknown>)
            : null;

    const deliveryContactName =
        deliveryContactNameInput ||
        userDefaults?.deliveryDefaultContactName ||
        "";
    const deliveryPhone =
        deliveryPhoneInput || userDefaults?.deliveryDefaultPhone || "";
    const deliveryAddressLine1 =
        deliveryAddressLine1Input ||
        (typeof defaultAddress?.line1 === "string" ? defaultAddress.line1 : "");
    const deliveryAddressLine2 =
        deliveryAddressLine2Input ||
        (typeof defaultAddress?.line2 === "string" ? defaultAddress.line2 : "");
    const deliveryCity =
        deliveryCityInput ||
        (typeof defaultAddress?.city === "string" ? defaultAddress.city : "");
    const deliveryState =
        deliveryStateInput ||
        (typeof defaultAddress?.state === "string" ? defaultAddress.state : "");
    const deliveryPostalCode =
        deliveryPostalCodeInput ||
        (typeof defaultAddress?.postalCode === "string"
            ? defaultAddress.postalCode
            : "");
    const deliveryCountry =
        deliveryCountryInput ||
        (typeof defaultAddress?.country === "string"
            ? defaultAddress.country
            : "");
    const deliveryNotes =
        deliveryNotesInput || userDefaults?.deliveryDefaultNotes || "";

    if (
        !deliveryContactName ||
        !deliveryPhone ||
        !deliveryAddressLine1 ||
        !deliveryCity ||
        !deliveryCountry
    ) {
        return NextResponse.json(
            {
                success: false,
                message:
                    "Delivery contact name, phone, address line 1, city, and country are required.",
            },
            { status: 400 },
        );
    }

    const cart = await buildCartApiResponseForUser(userEmail);

    if (cart.items.length === 0) {
        console.error("[checkout] Cart is empty for user:", userEmail);
        return NextResponse.json(
            { success: false, message: "Your cart is empty" },
            { status: 400 },
        );
    }

    try {
        const user = await prisma.user.findUnique({
            where: { email: userEmail },
            select: {
                id: true,
            },
        });

        const totalMinor = Number(cart.totals.total_price ?? 0);
        const currency = cart.totals.currency_code ?? "USD";
        const amount = totalMinor / 100;
        const { firstName, lastName } = getDefaultNameParts(userEmail);
        const reference = `ds-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

        if (!Number.isFinite(amount) || amount <= 0) {
            throw new Error("Unable to calculate a valid checkout amount");
        }

        console.log(
            "[checkout] Creating Flutterwave payment session for user:",
            userEmail,
            "items:",
            cart.items.length,
            "amount:",
            amount,
            currency,
        );

        const checkoutSummary = cart.items
            .map(
                (item) =>
                    `${item.quantity}x ${item.name}${item.item_data?.[0]?.value ? ` (${item.item_data[0].value})` : ""}`,
            )
            .join(", ");

        const { checkoutUrl } = await createFlutterwavePaymentLink({
            email: userEmail,
            name: `${firstName} ${lastName}`.trim(),
            amount,
            currency,
            reference,
            description:
                checkoutSummary || `Checkout for ${cart.items.length} item(s)`,
        });

        const order = await prisma.$transaction(async (tx) => {
            await tx.user.updateMany({
                where: { email: userEmail },
                data: {
                    deliveryDefaultContactName: deliveryContactName || null,
                    deliveryDefaultPhone: deliveryPhone || null,
                    deliveryDefaultAddress: {
                        line1: deliveryAddressLine1,
                        line2: deliveryAddressLine2 || null,
                        city: deliveryCity,
                        state: deliveryState || null,
                        postalCode: deliveryPostalCode || null,
                        country: deliveryCountry,
                    },
                    deliveryDefaultNotes: deliveryNotes || null,
                    deliveryDefaultUpdatedAt: new Date(),
                },
            });

            const createdOrder = await tx.order.create({
                data: {
                    reference,
                    userId: user?.id ?? null,
                    userEmail,
                    deliveryStatus: DeliveryStatus.AWAITING_PAYMENT,
                    deliveryContactName,
                    deliveryPhone,
                    deliveryAddress: {
                        line1: deliveryAddressLine1,
                        line2: deliveryAddressLine2 || null,
                        city: deliveryCity,
                        state: deliveryState || null,
                        postalCode: deliveryPostalCode || null,
                        country: deliveryCountry,
                    },
                    deliveryNotes: deliveryNotes || null,
                    deliveryUpdatedAt: new Date(),
                    currency,
                    subtotal: Number(cart.totals.total_items ?? totalMinor),
                    total: totalMinor,
                    items: cart.items as Prisma.InputJsonValue,
                },
                select: {
                    id: true,
                    reference: true,
                },
            });

            await tx.payment.create({
                data: {
                    orderId: createdOrder.id,
                    provider: "flutterwave",
                    providerReference: reference,
                    amount: totalMinor,
                    currency,
                    checkoutUrl,
                },
            });

            return createdOrder;
        });

        console.log("[checkout] Redirecting to:", checkoutUrl);

        return NextResponse.json({
            success: true,
            checkoutUrl,
            orderId: order.id,
            reference,
            amount,
            currency,
            provider: "flutterwave",
        });
    } catch (error) {
        const message =
            error instanceof Error ? error.message : "Checkout failed";
        console.error("[checkout] Error:", message);

        return NextResponse.json(
            {
                success: false,
                message,
            },
            { status: 500 },
        );
    }
}
