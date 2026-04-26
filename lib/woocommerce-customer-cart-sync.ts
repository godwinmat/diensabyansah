import { wooStoreRequest } from "@/lib/woocommerce-store-cart";

type JwtPayload = {
    email?: string;
    user_email?: string;
};

type CustomerMeta = {
    id?: number;
    key?: string;
    value?: unknown;
};

type WooCustomerRecord = {
    id?: number;
    email?: string;
    first_name?: string;
    last_name?: string;
    username?: string;
    meta_data?: CustomerMeta[];
};

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

function buildCustomerUsername(email: string) {
    const [localPart = "user"] = email.split("@");
    const usernameSeed = localPart.replace(/[^a-z0-9._-]/gi, "").toLowerCase();

    return `${usernameSeed || "user"}-${Math.floor(Date.now() / 1000)}`;
}

function splitName(fullName?: string) {
    const cleanedName = fullName?.trim() ?? "";
    const [firstName = "", ...lastNameParts] = cleanedName.split(/\s+/);

    return {
        firstName,
        lastName: lastNameParts.join(" "),
    };
}

function decodeJwtPayload(token: string): JwtPayload | null {
    try {
        const payloadSegment = token.split(".")[1];

        if (!payloadSegment) {
            return null;
        }

        const payloadBase64 = payloadSegment
            .replace(/-/g, "+")
            .replace(/_/g, "/")
            .padEnd(Math.ceil(payloadSegment.length / 4) * 4, "=");

        const payloadString = Buffer.from(payloadBase64, "base64").toString(
            "utf8",
        );

        return JSON.parse(payloadString) as JwtPayload;
    } catch {
        return null;
    }
}

function getEmailFromAuthToken(authToken?: string) {
    const token = authToken?.trim() ?? "";

    if (!token) {
        return "";
    }

    const payload = decodeJwtPayload(token);

    return payload?.email?.trim() || payload?.user_email?.trim() || "";
}

async function findCustomerById(customerId: number) {
    const wordpressApiUrl = getWordPressApiUrl();
    const authorization = getWooAuthorizationHeader();

    if (!wordpressApiUrl || !authorization || !Number.isFinite(customerId)) {
        return null;
    }

    const response = await fetch(
        `${wordpressApiUrl}/wc/v3/customers/${customerId}`,
        {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: authorization,
            },
            cache: "no-store",
        },
    );

    if (!response.ok) {
        return null;
    }

    return (await response
        .json()
        .catch(() => null)) as WooCustomerRecord | null;
}


async function findCustomerByEmail(
    email: string,
): Promise<WooCustomerRecord | null> {
    const wordpressApiUrl = getWordPressApiUrl();
    const authorization = getWooAuthorizationHeader();

    if (!wordpressApiUrl || !authorization || !email) {
        return null;
    }

    const exactUrl = new URL(`${wordpressApiUrl}/wc/v3/customers`);
    exactUrl.searchParams.set("email", email);

    const exactResponse = await fetch(exactUrl, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Authorization: authorization,
        },
        cache: "no-store",
    });

    const exactPayload = (await exactResponse
        .json()
        .catch(() => [])) as unknown;

    if (Array.isArray(exactPayload) && exactPayload.length > 0) {
        return exactPayload[0] as WooCustomerRecord;
    }

    const fallbackUrl = new URL(`${wordpressApiUrl}/wc/v3/customers`);
    fallbackUrl.searchParams.set("search", email);

    const fallbackResponse = await fetch(fallbackUrl, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Authorization: authorization,
        },
        cache: "no-store",
    });

    const fallbackPayload = (await fallbackResponse
        .json()
        .catch(() => [])) as unknown;

    if (!Array.isArray(fallbackPayload)) {
        return null;
    }

    const exactMatch = fallbackPayload.find((record) => {
        const candidateEmail = String(
            (record as WooCustomerRecord).email ?? "",
        ).toLowerCase();
        return candidateEmail === email.toLowerCase();
    });

    return (
        (exactMatch as WooCustomerRecord | undefined) ??
        (fallbackPayload[0] as WooCustomerRecord | undefined) ??
        null
    );
}

async function getCustomerByIdentifier(options: {
    customerId?: string | number;
    authToken?: string;
}) {
    const customerId = Number(options.customerId ?? 0);

    if (Number.isFinite(customerId) && customerId > 0) {
        const customerById = await findCustomerById(customerId);

        if (customerById) {
            return customerById;
        }
    }

    const email = getEmailFromAuthToken(options.authToken);

    if (!email) {
        return null;
    }

    return findCustomerByEmail(email);
}

export async function ensureWooCustomerRecord(options: {
    email?: string;
    name?: string;
}) {
    const email = options.email?.trim().toLowerCase() ?? "";

    if (!email) {
        return null;
    }

    const existingCustomer = await findCustomerByEmail(email);

    if (existingCustomer?.id) {
        return existingCustomer;
    }

    const wordpressApiUrl = getWordPressApiUrl();
    const authorization = getWooAuthorizationHeader();

    if (!wordpressApiUrl || !authorization) {
        return null;
    }

    const { firstName, lastName } = splitName(options.name || email);

    const createResponse = await fetch(`${wordpressApiUrl}/wc/v3/customers`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: authorization,
        },
        body: JSON.stringify({
            email,
            username: buildCustomerUsername(email),
            first_name: firstName,
            last_name: lastName,
        }),
        cache: "no-store",
    });

    const createPayload = (await createResponse.json().catch(() => null)) as
        | WooCustomerRecord
        | { message?: string }
        | null;

    if (createResponse.ok) {
        return createPayload as WooCustomerRecord;
    }

    // If creation raced with another browser or the customer already exists,
    // try fetching it one more time before giving up.
    return findCustomerByEmail(email);
}
