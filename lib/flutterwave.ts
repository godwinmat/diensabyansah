type FlutterwavePaymentInput = {
    email: string;
    name: string;
    amount: number;
    currency: string;
    reference: string;
    description: string;
};

type FlutterwavePaymentResponse = {
    data?: {
        link?: string;
        checkout_url?: string;
        redirect_url?: string;
    };
    meta?: {
        authorization?: {
            redirect?: string;
        };
    };
    message?: string;
};

function getFlutterwaveBaseUrl() {
    return process.env.FLUTTERWAVE_API_URL?.replace(/\/$/, "") || "https://api.flutterwave.com/v3";
}

function getFlutterwaveSecretKey() {
    return process.env.FLUTTERWAVE_SECRET_KEY?.trim() || "";
}

function getSiteUrl() {
    return process.env.APP_BASE_URL?.replace(/\/$/, "") || "https://diensabyansah.com";
}

function getFlutterwaveRedirectUrl(reference: string) {
    const configuredUrl = process.env.FLUTTERWAVE_REDIRECT_URL?.trim();

    if (configuredUrl) {
        return configuredUrl;
    }

    const url = new URL(`${getSiteUrl()}/checkout/success`);
    url.searchParams.set("reference", reference);

    return url.toString();
}

export async function createFlutterwavePaymentLink(
    input: FlutterwavePaymentInput,
) {
    const secretKey = getFlutterwaveSecretKey();

    if (!secretKey) {
        throw new Error(
            "FLUTTERWAVE_SECRET_KEY is not configured. Add your Flutterwave secret key to enable checkout.",
        );
    }

    const response = await fetch(`${getFlutterwaveBaseUrl()}/payments`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${secretKey}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            tx_ref: input.reference,
            amount: Number(input.amount.toFixed(2)),
            currency: input.currency,
            redirect_url: getFlutterwaveRedirectUrl(input.reference),
            customer: {
                email: input.email,
                name: input.name,
            },
            customizations: {
                title: "Diensabyansah checkout",
                description: input.description,
                logo: `${getSiteUrl()}/favicon.ico`,
            },
        }),
        cache: "no-store",
    });

    const data = (await response.json().catch(() => null)) as FlutterwavePaymentResponse | null;

    if (!response.ok) {
        throw new Error(
            data?.message || `Flutterwave checkout failed (${response.status})`,
        );
    }

    const checkoutUrl =
        data?.data?.link ??
        data?.data?.checkout_url ??
        data?.data?.redirect_url ??
        data?.meta?.authorization?.redirect ??
        "";

    if (!checkoutUrl) {
        throw new Error("Flutterwave checkout link was not returned by the API");
    }

    return {
        checkoutUrl,
    };
}