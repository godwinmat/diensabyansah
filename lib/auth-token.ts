import { verifySessionToken } from "@/lib/auth";
import { NextRequest } from "next/server";

export type AuthSessionPayload = {
    sub: string;
    email: string;
    name: string;
    exp: number;
};

export function getAuthSessionFromToken(authToken?: string) {
    const token = authToken?.trim() ?? "";

    if (!token) {
        return null;
    }

    return verifySessionToken(token);
}

export function getAuthEmailFromToken(authToken?: string) {
    const payload = getAuthSessionFromToken(authToken);

    return payload?.email?.trim() || "";
}

export function getAuthUserIdFromToken(authToken?: string) {
    const payload = getAuthSessionFromToken(authToken);

    return payload?.sub?.trim() || "";
}

export function getAuthEmailFromRequest(request: NextRequest) {
    return getAuthEmailFromToken(request.cookies.get("auth_token")?.value);
}

export function getAuthUserIdFromRequest(request: NextRequest) {
    return getAuthUserIdFromToken(request.cookies.get("auth_token")?.value);
}
