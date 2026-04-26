import { ensureWooCustomerRecord } from "@/lib/woocommerce-customer-cart-sync";
import { WC_CUSTOMER_ID_COOKIE } from "@/lib/woocommerce-store-cart";
import { NextResponse } from "next/server";

type SignupBody = {
    name?: string;
    email?: string;
    password?: string;
};

export async function POST(request: Request) {
    const body = (await request.json().catch(() => null)) as SignupBody | null;

    const name = body?.name?.trim() ?? "";
    const email = body?.email?.trim().toLowerCase() ?? "";
    const password = body?.password ?? "";

    const wpApiUrl = process.env.WORDPRESS_API_URL?.trim() ?? "";
    const registerPath =
        process.env.WORDPRESS_REGISTER_PATH ?? "/simple-jwt-login/v1/users";
    const appUser = process.env.WORDPRESS_APP_USERNAME;
    const appPassword = process.env.WORDPRESS_APP_PASSWORD;

    if (!name || !email || !password) {
        return Response.json(
            { message: "Name, email and password are required." },
            { status: 400 },
        );
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
        return Response.json(
            { message: "Please provide a valid email." },
            { status: 400 },
        );
    }

    if (password.length < 6) {
        return Response.json(
            { message: "Password must be at least 6 characters." },
            { status: 400 },
        );
    }

    if (!wpApiUrl) {
        return Response.json(
            {
                message:
                    "WORDPRESS_API_URL is not configured. Please set it to your WordPress REST API base URL.",
            },
            { status: 500 },
        );
    }

    const isWpUsersEndpoint = registerPath === "/wp/v2/users";
    const isSimpleJwtRegisterEndpoint =
        registerPath.startsWith("/simple-jwt-login/");

    if (isWpUsersEndpoint && (!appUser?.trim() || !appPassword?.trim())) {
        return Response.json(
            {
                message:
                    "Signup requires admin Application Password credentials. Set WORDPRESS_APP_USERNAME and WORDPRESS_APP_PASSWORD in your environment.",
            },
            { status: 500 },
        );
    }

    const baseUsername = email
        .split("@")[0]
        .replace(/[^a-z0-9._-]/gi, "")
        .toLowerCase();
    const fallbackFromName = name
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
    const usernameSeed = baseUsername || fallbackFromName || "user";
    const username = `${usernameSeed}-${Math.floor(Date.now() / 1000)}`;

    const headers: HeadersInit = {
        "Content-Type": "application/json",
    };

    if (appUser && appPassword) {
        const token = Buffer.from(`${appUser}:${appPassword}`).toString(
            "base64",
        );
        headers.Authorization = `Basic ${token}`;
    }

    const [firstName = "", ...lastNameParts] = name.trim().split(/\s+/);
    const lastName = lastNameParts.join(" ");

    const requestBody = isSimpleJwtRegisterEndpoint
        ? {
              email,
              password,
              user_login: username,
              display_name: name,
              first_name: firstName,
              last_name: lastName,
          }
        : {
              username,
              name,
              email,
              password,
          };

    let wpResponse: Response;

    try {
        wpResponse = await fetch(`${wpApiUrl}${registerPath}`, {
            method: "POST",
            headers,
            body: JSON.stringify(requestBody),
        });
    } catch {
        return Response.json(
            {
                message:
                    "Unable to reach WordPress while creating the account. Please try again later.",
            },
            { status: 502 },
        );
    }

    const wpData = (await wpResponse.json().catch(() => null)) as {
        id?: number;
        email?: string;
        name?: string;
        success?: boolean;
        message?: string;
        user?: {
            email?: string;
            display_name?: string;
            user_login?: string;
        };
        jwt?: string;
        code?: string;
    } | null;

    if (!wpResponse.ok) {
        if (wpData?.code === "rest_cannot_create_user") {
            return Response.json(
                {
                    message:
                        "WordPress denied user creation. The account in WORDPRESS_APP_USERNAME must be an Administrator and WORDPRESS_APP_PASSWORD must be an Application Password for that account.",
                },
                { status: 403 },
            );
        }

        const missingAdminCredentials =
            wpResponse.status === 401 || wpResponse.status === 403;

        return Response.json(
            {
                message:
                    wpData?.message ??
                    (missingAdminCredentials
                        ? "Unable to create account. /wp/v2/users usually requires admin authentication (Application Password)."
                        : null) ??
                    "Unable to create account from WordPress API.",
            },
            { status: wpResponse.status },
        );
    }

    const wooCustomer = await ensureWooCustomerRecord({
        email,
        name,
    }).catch(() => null);

    const response = NextResponse.json({
        message: "Account created successfully.",
        token: wpData?.jwt,
        user: {
            id: String(wpData?.id ?? ""),
            name: wpData?.user?.display_name ?? wpData?.name ?? name,
            email: wpData?.user?.email ?? wpData?.email ?? email,
        },
    });

    if (wooCustomer?.id) {
        response.cookies.set(WC_CUSTOMER_ID_COOKIE, String(wooCustomer.id), {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 60 * 60 * 24 * 7,
        });
    }

    return response;
}
