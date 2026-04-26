import {
    getCartUserEmailFromToken,
    getPersistedCartForUser,
} from "@/lib/cart-store";
import { NextRequest, NextResponse } from "next/server";

function getWordPressApiUrl() {
    return process.env.WORDPRESS_API_URL?.replace(/\/$/, "") ?? "";
}

function getWooAuthorizationHeader() {
    const consumerKey = process.env.WOOCOMMERCE_CONSUMER_KEY?.trim();
    const consumerSecret = process.env.WOOCOMMERCE_CONSUMER_SECRET?.trim();

    if (!consumerKey || !consumerSecret) {
        return "";
    }

    return `Basic ${Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64")}`;
}

function getCheckoutUrl(orderId: number, orderKey: string) {
    const siteUrl =
        process.env.WORDPRESS_SITE_URL?.replace(/\/$/, "") ??
        "https://diensabyansah.com";

    return `${siteUrl}/checkout/order-pay/${orderId}/?pay_for_order=true&key=${encodeURIComponent(orderKey)}`;
}

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

async function createWooOrder(options: {
    email: string;
    lineItems: Array<{
        product_id: number;
        quantity: number;
        meta_data?: Array<{ key: string; value: string }>;
    }>;
}) {
    const wordpressApiUrl = getWordPressApiUrl();
    const authorization = getWooAuthorizationHeader();

    if (!wordpressApiUrl) {
        throw new Error("WORDPRESS_API_URL not configured");
    }

    if (!authorization) {
        throw new Error(
            "WooCommerce API credentials are missing. Set WOOCOMMERCE_CONSUMER_KEY and WOOCOMMERCE_CONSUMER_SECRET.",
        );
    }

    const billingCountry =
        process.env.WOOCOMMERCE_DEFAULT_BILLING_COUNTRY?.trim().toUpperCase() ||
        process.env.WOOCOMMERCE_DEFAULT_COUNTRY?.trim().toUpperCase() ||
        "GH";
    const shippingCountry =
        process.env.WOOCOMMERCE_DEFAULT_SHIPPING_COUNTRY?.trim().toUpperCase() ||
        billingCountry;
    const { firstName, lastName } = getDefaultNameParts(options.email);
    const defaultAddress1 =
        process.env.WOOCOMMERCE_DEFAULT_ADDRESS_1?.trim() || "Accra";
    const defaultCity = process.env.WOOCOMMERCE_DEFAULT_CITY?.trim() || "Accra";
    const defaultState =
        process.env.WOOCOMMERCE_DEFAULT_STATE?.trim() || "Greater Accra";
    const defaultPostcode =
        process.env.WOOCOMMERCE_DEFAULT_POSTCODE?.trim() || "00000";
    const defaultPhone =
        process.env.WOOCOMMERCE_DEFAULT_PHONE?.trim() || "0000000000";

    const orderPayload = {
        billing: {
            first_name: firstName,
            last_name: lastName,
            email: options.email,
            phone: defaultPhone,
            address_1: defaultAddress1,
            city: defaultCity,
            state: defaultState,
            postcode: defaultPostcode,
            country: billingCountry,
        },
        shipping: {
            first_name: firstName,
            last_name: lastName,
            address_1: defaultAddress1,
            city: defaultCity,
            state: defaultState,
            postcode: defaultPostcode,
            email: options.email,
            country: shippingCountry,
        },
        line_items: options.lineItems,
        status: "pending",
    };

    console.log("[checkout] Creating WooCommerce order:", orderPayload);

    const response = await fetch(`${wordpressApiUrl}/wc/v3/orders`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: authorization,
        },
        body: JSON.stringify(orderPayload),
        cache: "no-store",
    });

    const data = (await response.json().catch(() => null)) as {
        id?: number;
        order_key?: string;
        checkout_payment_url?: string;
        message?: string;
        code?: string;
    } | null;

    if (!response.ok) {
        console.error(
            "[checkout] Failed to create order:",
            response.status,
            data,
        );
        if (response.status === 401 || response.status === 403) {
            throw new Error(
                "WooCommerce rejected order creation. Verify API keys permissions (Read/Write) and REST API access.",
            );
        }
        throw new Error(
            data?.message || `Failed to create order (${response.status})`,
        );
    }

    if (!data?.id || !data.order_key) {
        throw new Error("Order created but missing order ID/key");
    }

    return {
        id: data.id,
        orderKey: data.order_key,
        paymentUrl: data.checkout_payment_url,
    };
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

    const cart = await getPersistedCartForUser(userEmail);

    if (cart.items.length === 0) {
        console.error("[checkout] Cart is empty for user:", userEmail);
        return NextResponse.json(
            { success: false, message: "Your cart is empty" },
            { status: 400 },
        );
    }

    try {
        console.log(
            "[checkout] Creating order for user:",
            userEmail,
            "items:",
            cart.items.length,
        );

        // Convert Prisma cart items to WooCommerce line items format
        const lineItems = cart.items.map((item) => ({
            product_id: item.productId,
            quantity: item.quantity,
            ...(item.size
                ? {
                      meta_data: [{ key: "Size", value: item.size }],
                  }
                : {}),
        }));

        // Create order via WooCommerce Orders API
        const order = await createWooOrder({
            email: userEmail,
            lineItems,
        });

        console.log("[checkout] Order created with ID:", order.id);

        const checkoutUrl =
            order.paymentUrl || getCheckoutUrl(order.id, order.orderKey);
        console.log("[checkout] Redirecting to:", checkoutUrl);

        return NextResponse.json({
            success: true,
            checkoutUrl,
            orderId: order.id,
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
