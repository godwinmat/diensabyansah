"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeSlash } from "@phosphor-icons/react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

export default function ResetPasswordPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
                    <div className="w-full max-w-md rounded-md border border-gray-200 bg-white p-6 text-center text-sm text-gray-600">
                        Loading reset password page...
                    </div>
                </div>
            }
        >
            <ResetPasswordContent />
        </Suspense>
    );
}

function ResetPasswordContent() {
    const searchParams = useSearchParams();
    const initialEmail = searchParams.get("email") || "";

    const [step, setStep] = useState<"email" | "code">("email");
    const [email, setEmail] = useState(initialEmail);
    const [code, setCode] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const handleSendCode = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setMessage("");
        setLoading(true);

        try {
            const response = await fetch("/api/auth/send-reset-code", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (data.success) {
                setMessage(
                    data.message || "Check your email for the reset code",
                );
                setStep("code");
            } else {
                setError(data.message || "Failed to send reset code");
            }
        } catch (err) {
            setError("An error occurred. Please try again.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setMessage("");
        setLoading(true);

        try {
            const response = await fetch("/api/auth/change-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, code, newPassword }),
            });

            const data = await response.json();

            if (data.success) {
                setMessage(
                    "Password reset successfully! Redirecting to login...",
                );
                setTimeout(() => {
                    window.location.href = "/account";
                }, 1500);
            } else {
                setError(data.message || "Failed to reset password");
            }
        } catch (err) {
            setError("An error occurred. Please try again.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Reset Your Password
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        {step === "email"
                            ? "Enter your email to receive a reset code"
                            : "Enter the code sent to your email and your new password"}
                    </p>
                </div>

                {step === "email" ? (
                    <form onSubmit={handleSendCode} className="mt-8 space-y-6">
                        <div>
                            <label htmlFor="email" className="sr-only">
                                Email address
                            </label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="Email address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                disabled={loading}
                            />
                        </div>

                        {error && (
                            <div className="rounded-md bg-red-50 p-4">
                                <p className="text-sm font-medium text-red-800">
                                    {error}
                                </p>
                            </div>
                        )}

                        {message && (
                            <div className="rounded-md bg-green-50 p-4">
                                <p className="text-sm font-medium text-green-800">
                                    {message}
                                </p>
                            </div>
                        )}

                        <Button
                            type="submit"
                            className="w-full"
                            disabled={loading}
                        >
                            {loading ? "Sending..." : "Send Reset Code"}
                        </Button>

                        <div className="text-center">
                            <Link
                                href="/account"
                                className="text-sm text-blue-600 hover:text-blue-500"
                            >
                                Back to sign in
                            </Link>
                        </div>
                    </form>
                ) : (
                    <form
                        onSubmit={handleResetPassword}
                        className="mt-8 space-y-6"
                    >
                        <div>
                            <label htmlFor="code" className="sr-only">
                                Reset code
                            </label>
                            <Input
                                id="code"
                                type="text"
                                placeholder="Reset code"
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                required
                                disabled={loading}
                            />
                        </div>

                        <div className="relative">
                            <label htmlFor="newPassword" className="sr-only">
                                New password
                            </label>
                            <Input
                                id="newPassword"
                                type={showPassword ? "text" : "password"}
                                placeholder="New password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                                disabled={loading}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-900"
                            >
                                {showPassword ? (
                                    <EyeSlash size={20} />
                                ) : (
                                    <Eye size={20} />
                                )}
                            </button>
                        </div>

                        {error && (
                            <div className="rounded-md bg-red-50 p-4">
                                <p className="text-sm font-medium text-red-800">
                                    {error}
                                </p>
                            </div>
                        )}

                        {message && (
                            <div className="rounded-md bg-green-50 p-4">
                                <p className="text-sm font-medium text-green-800">
                                    {message}
                                </p>
                            </div>
                        )}

                        <Button
                            type="submit"
                            className="w-full"
                            disabled={loading}
                        >
                            {loading ? "Resetting..." : "Reset Password"}
                        </Button>

                        <div className="text-center space-y-2">
                            <button
                                type="button"
                                onClick={() => {
                                    setStep("email");
                                    setCode("");
                                    setError("");
                                    setMessage("");
                                }}
                                className="text-sm text-blue-600 hover:text-blue-500"
                            >
                                Enter different email
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
