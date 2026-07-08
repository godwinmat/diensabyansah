import crypto from "crypto";

type SessionPayload = {
    sub: string;
    email: string;
    name: string;
    exp: number;
};

const AUTH_COOKIE_NAME = "auth_token";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;

function getAuthSecret() {
    return process.env.AUTH_SECRET?.trim() || "";
}

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

export function hashPassword(password: string) {
    const salt = crypto.randomBytes(16);
    const derived = crypto.scryptSync(password, salt, 64);
    return `${salt.toString("hex")}:${derived.toString("hex")}`;
}

export function verifyPassword(password: string, storedHash: string) {
    const [saltHex, hashHex] = storedHash.split(":");

    if (!saltHex || !hashHex) {
        return false;
    }

    try {
        const salt = Buffer.from(saltHex, "hex");
        const expected = Buffer.from(hashHex, "hex");
        const actual = crypto.scryptSync(password, salt, expected.length);
        return crypto.timingSafeEqual(actual, expected);
    } catch {
        return false;
    }
}

export function createSessionToken(payload: {
    userId: string;
    email: string;
    name: string;
}) {
    const secret = getAuthSecret();

    if (!secret) {
        throw new Error("AUTH_SECRET is required for authentication");
    }

    const header = {
        alg: "HS256",
        typ: "JWT",
    };

    const body: SessionPayload = {
        sub: payload.userId,
        email: payload.email,
        name: payload.name,
        exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
    };

    const headerPart = toBase64Url(JSON.stringify(header));
    const payloadPart = toBase64Url(JSON.stringify(body));
    const unsignedToken = `${headerPart}.${payloadPart}`;
    const signature = toBase64Url(signHmacSha256(unsignedToken, secret));

    return `${unsignedToken}.${signature}`;
}

export function verifySessionToken(token: string): SessionPayload | null {
    const secret = getAuthSecret();

    if (!secret) {
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
        ) as SessionPayload;

        if (
            !payload?.sub ||
            !payload?.email ||
            !payload?.name ||
            typeof payload.exp !== "number"
        ) {
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

export function getAuthCookieName() {
    return AUTH_COOKIE_NAME;
}

export function getSessionTtlSeconds() {
    return SESSION_TTL_SECONDS;
}

export function createPasswordResetCode() {
    return String(crypto.randomInt(100000, 1000000));
}
