import crypto from "crypto";

type AdminSessionPayload = {
    email: string;
    exp: number;
};

const ADMIN_COOKIE_NAME = "admin_panel_token";
const ADMIN_SESSION_TTL_SECONDS = 60 * 60 * 8;

function toBase64Url(input: Buffer | string) {
    const buffer = Buffer.isBuffer(input) ? input : Buffer.from(input, "utf8");
    return buffer
        .toString("base64")
        .replace(/=/g, "")
        .replace(/\+/g, "-")
        .replace(/\//g, "_");
}

function fromBase64Url(value: string) {
    const padded = value
        .replace(/-/g, "+")
        .replace(/_/g, "/")
        .padEnd(Math.ceil(value.length / 4) * 4, "=");

    return Buffer.from(padded, "base64");
}

function signHmacSha256(value: string, secret: string) {
    return crypto.createHmac("sha256", secret).update(value).digest();
}

function getAdminSessionSecret() {
    return (
        process.env.ADMIN_PANEL_SECRET?.trim() ||
        process.env.AUTH_SECRET?.trim() ||
        ""
    );
}

export function createAdminSessionToken(email: string) {
    const secret = getAdminSessionSecret();

    if (!secret) {
        throw new Error(
            "ADMIN_PANEL_SECRET or AUTH_SECRET is required for admin authentication.",
        );
    }

    const normalizedEmail = email.trim().toLowerCase();

    const header = {
        alg: "HS256",
        typ: "JWT",
    };

    const payload: AdminSessionPayload = {
        email: normalizedEmail,
        exp: Math.floor(Date.now() / 1000) + ADMIN_SESSION_TTL_SECONDS,
    };

    const headerPart = toBase64Url(JSON.stringify(header));
    const payloadPart = toBase64Url(JSON.stringify(payload));
    const unsignedToken = `${headerPart}.${payloadPart}`;
    const signature = toBase64Url(signHmacSha256(unsignedToken, secret));

    return `${unsignedToken}.${signature}`;
}

export function verifyAdminSessionToken(token: string) {
    const secret = getAdminSessionSecret();

    if (!secret || !token) {
        return null;
    }

    const parts = token.split(".");

    if (parts.length !== 3) {
        return null;
    }

    const [headerPart, payloadPart, signaturePart] = parts;

    try {
        const unsignedToken = `${headerPart}.${payloadPart}`;
        const expectedSignature = signHmacSha256(unsignedToken, secret);
        const givenSignature = fromBase64Url(signaturePart);

        if (
            expectedSignature.length !== givenSignature.length ||
            !crypto.timingSafeEqual(expectedSignature, givenSignature)
        ) {
            return null;
        }

        const payload = JSON.parse(
            fromBase64Url(payloadPart).toString("utf8"),
        ) as AdminSessionPayload;

        if (!payload?.email || typeof payload.exp !== "number") {
            return null;
        }

        if (payload.exp <= Math.floor(Date.now() / 1000)) {
            return null;
        }

        return payload;
    } catch {
        return null;
    }
}

export function getAdminCookieName() {
    return ADMIN_COOKIE_NAME;
}

export function getAdminSessionTtlSeconds() {
    return ADMIN_SESSION_TTL_SECONDS;
}

export function getAdminLoginPath() {
    return "/admin-panel/login";
}
