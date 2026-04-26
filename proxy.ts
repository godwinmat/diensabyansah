import { NextRequest, NextResponse } from "next/server";

type JwtPayload = {
    exp?: number;
};

function getJwtPayload(token: string): JwtPayload | null {
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

export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    const token = request.cookies.get("auth_token")?.value ?? "";
    const payload = token ? getJwtPayload(token) : null;
    const exp = payload?.exp;
    const isAuthenticated =
        Boolean(token) &&
        (typeof exp !== "number" || exp > Math.floor(Date.now() / 1000));

    if (token && !isAuthenticated) {
        const response = NextResponse.next();
        response.cookies.set("auth_token", "", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 0,
        });
        return response;
    }

    const isPublicPage =
        pathname === "/" ||
        pathname === "/about" ||
        pathname === "/contact" ||
        pathname === "/blog" ||
        pathname === "/testimonial" ||
        pathname === "/testimonials" ||
        pathname === "/products" ||
        pathname.startsWith("/products/") ||
        pathname.startsWith("/blog/");

    const isProtectedPage = pathname === "/cart";

    const isLoggedOutOnlyPage =
        pathname === "/account" ||
        pathname === "/account/signup" ||
        pathname === "/account/reset-password";

    if (isProtectedPage && !isAuthenticated) {
        const redirectUrl = request.nextUrl.clone();
        redirectUrl.pathname = "/account";
        redirectUrl.search = "";
        return NextResponse.redirect(redirectUrl);
    }

    if (isLoggedOutOnlyPage && isAuthenticated) {
        const redirectUrl = request.nextUrl.clone();
        redirectUrl.pathname = "/products";
        redirectUrl.search = "";
        return NextResponse.redirect(redirectUrl);
    }

    if (isPublicPage || isProtectedPage || isLoggedOutOnlyPage) {
        return NextResponse.next();
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/",
        "/about",
        "/contact",
        "/blog/:path*",
        "/testimonial",
        "/testimonials",
        "/products/:path*",
        "/cart",
        "/account",
        "/account/signup",
        "/account/reset-password",
    ],
};
