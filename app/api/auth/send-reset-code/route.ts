import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const { email } = await request.json();

        if (!email) {
            return NextResponse.json(
                { success: false, message: "Email is required" },
                { status: 400 },
            );
        }

        const wordpressUrl = process.env.WORDPRESS_API_URL;
        const resetPath = process.env.WORDPRESS_JWT_RESET_PASSWORD_PATH;
        const authCode = process.env.WORDPRESS_JWT_RESET_AUTH_CODE;

        const payload: Record<string, string> = { email };
        if (authCode) {
            payload.AUTH_CODE = authCode;
        }

        const response = await fetch(`${wordpressUrl}${resetPath}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
            return NextResponse.json(
                {
                    success: false,
                    message: data.message || "Failed to send reset code",
                },
                { status: response.status || 400 },
            );
        }

        return NextResponse.json({
            success: true,
            message: data.message || "Reset code sent to your email",
        });
    } catch (error) {
        console.error("Reset code error:", error);
        return NextResponse.json(
            { success: false, message: "Internal server error" },
            { status: 500 },
        );
    }
}
