import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const { email, code, newPassword } = await request.json();

        if (!email || !code || !newPassword) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Email, code, and new password are required",
                },
                { status: 400 },
            );
        }

        const wordpressUrl = process.env.WORDPRESS_API_URL;
        const resetPath =
            process.env.WORDPRESS_JWT_RESET_PASSWORD_PATH ||
            "/simple-jwt-login/v1/users/reset_password";
        const authCode = process.env.WORDPRESS_JWT_RESET_AUTH_CODE;

        const payload: Record<string, string> = {
            email,
            code,
            new_password: newPassword,
        };
        if (authCode) {
            payload.AUTH_CODE = authCode;
        }

        const response = await fetch(`${wordpressUrl}${resetPath}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
            return NextResponse.json(
                {
                    success: false,
                    message: data.message || "Failed to reset password",
                },
                { status: response.status || 400 },
            );
        }

        return NextResponse.json({
            success: true,
            message: data.message || "Password reset successfully",
        });
    } catch (error) {
        console.error("Change password error:", error);
        return NextResponse.json(
            { success: false, message: "Internal server error" },
            { status: 500 },
        );
    }
}
