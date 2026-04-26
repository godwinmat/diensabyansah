import { NextRequest } from "next/server";

type JwtPayload = {
    email?: string;
    user_email?: string;
};

function decodeJwtPayload(token: string): JwtPayload | null {
    try {
        const parts = token.split(".");

        if (parts.length < 2) {
            return null;
        }

        const payloadBase64 = parts[1]
            .replace(/-/g, "+")
            .replace(/_/g, "/")
            .padEnd(Math.ceil(parts[1].length / 4) * 4, "=");

        return JSON.parse(
            Buffer.from(payloadBase64, "base64").toString("utf8"),
        ) as JwtPayload;
    } catch {
        return null;
    }
}

export function getAuthEmailFromToken(authToken?: string) {
    const token = authToken?.trim() ?? "";

    if (!token) {
        return "";
    }

    const payload = decodeJwtPayload(token);

    return payload?.email?.trim() || payload?.user_email?.trim() || "";
}

export function getAuthEmailFromRequest(request: NextRequest) {
    return getAuthEmailFromToken(request.cookies.get("auth_token")?.value);
}
