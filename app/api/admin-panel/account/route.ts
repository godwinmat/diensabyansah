import {
    getAdminAccountEmail,
    updateAdminCredentials,
} from "@/lib/admin-account";
import {
    createAdminSessionToken,
    getAdminCookieName,
    getAdminSessionTtlSeconds,
    verifyAdminSessionToken,
} from "@/lib/admin-auth";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

type UpdateAdminAccountBody = {
    currentPassword?: string;
    newEmail?: string;
    newPassword?: string;
};

async function isAdminAuthenticated() {
    const cookieStore = await cookies();
    const token = cookieStore.get(getAdminCookieName())?.value ?? "";
    return Boolean(verifyAdminSessionToken(token));
}

export async function GET() {
    if (!(await isAdminAuthenticated())) {
        return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }

    const email = await getAdminAccountEmail();

    return NextResponse.json({
        account: {
            email,
        },
    });
}

export async function PATCH(request: Request) {
    if (!(await isAdminAuthenticated())) {
        return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }

    const body = (await request
        .json()
        .catch(() => null)) as UpdateAdminAccountBody | null;

    const result = await updateAdminCredentials({
        currentPassword: body?.currentPassword ?? "",
        newEmail: body?.newEmail,
        newPassword: body?.newPassword,
    });

    if (!result.ok || !result.email) {
        return NextResponse.json(
            {
                message: result.message,
            },
            {
                status: 400,
            },
        );
    }

    const token = createAdminSessionToken(result.email);

    const response = NextResponse.json({
        message: result.message,
        account: {
            email: result.email,
        },
    });

    response.cookies.set(getAdminCookieName(), token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: getAdminSessionTtlSeconds(),
    });

    return response;
}
