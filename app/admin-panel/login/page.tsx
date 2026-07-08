"use client";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeSlash } from "@phosphor-icons/react/dist/ssr";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

export default function AdminPanelLoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [checkingSession, setCheckingSession] = useState(true);

    useEffect(() => {
        const checkAdminSession = async () => {
            try {
                const response = await fetch("/api/admin-panel/session", {
                    method: "GET",
                    cache: "no-store",
                });

                const data = (await response.json().catch(() => null)) as {
                    authenticated?: boolean;
                } | null;

                if (data?.authenticated) {
                    router.replace("/admin-panel");
                    router.refresh();
                }
            } finally {
                setCheckingSession(false);
            }
        };

        void checkAdminSession();
    }, [router]);

    const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        setError("");
        setLoading(true);

        try {
            const response = await fetch("/api/admin-panel/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
            });

            const data = (await response.json().catch(() => null)) as {
                message?: string;
            } | null;

            if (!response.ok) {
                setError(data?.message ?? "Unable to sign in.");
                return;
            }

            router.push("/admin-panel");
            router.refresh();
        } finally {
            setLoading(false);
        }
    };

    if (checkingSession) {
        return (
            <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f8fafc] px-4 py-10">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(250,204,21,0.12),transparent_55%)]" />
                <Card className="w-full max-w-md border-[#e2e8f0] shadow-[0_24px_60px_-36px_rgba(15,23,42,0.45)] hover:translate-y-0">
                    <CardContent className="py-10 text-center text-sm text-muted-foreground">
                        Checking admin session...
                    </CardContent>
                </Card>
            </section>
        );
    }

    return (
        <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f8fafc] px-4 py-10">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(250,204,21,0.12),transparent_55%)]" />
            <Card className="w-full max-w-md border-[#e2e8f0] shadow-[0_24px_60px_-36px_rgba(15,23,42,0.45)] hover:translate-y-0">
                <CardHeader className="pb-4 text-center">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
                        Secure Access
                    </p>
                    <CardTitle className="text-3xl tracking-tight">
                        Admin Panel Login
                    </CardTitle>
                    <CardDescription>
                        Sign in with your admin credentials to manage posts,
                        collections, and products.
                    </CardDescription>
                </CardHeader>
                <CardContent className="pt-2">
                    <form className="space-y-5" onSubmit={onSubmit}>
                        <div className="space-y-2">
                            <Label htmlFor="admin-email">Admin email</Label>
                            <Input
                                id="admin-email"
                                type="email"
                                value={email}
                                onChange={(event) =>
                                    setEmail(event.target.value)
                                }
                                placeholder="Admin email"
                                required
                                className="h-11"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="admin-password">
                                Admin password
                            </Label>
                            <div className="relative">
                                <Input
                                    id="admin-password"
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(event) =>
                                        setPassword(event.target.value)
                                    }
                                    placeholder="Admin password"
                                    required
                                    className="h-11 pr-10"
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon-sm"
                                    className="absolute right-1 top-1/2 -translate-y-1/2 text-muted-foreground"
                                    onClick={() =>
                                        setShowPassword(
                                            (currentValue) => !currentValue,
                                        )
                                    }
                                    aria-label={
                                        showPassword
                                            ? "Hide password"
                                            : "Show password"
                                    }
                                >
                                    {showPassword ? (
                                        <EyeSlash size={18} />
                                    ) : (
                                        <Eye size={18} />
                                    )}
                                </Button>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="h-11 w-full"
                            disabled={loading}
                        >
                            {loading ? "Signing in..." : "Sign in"}
                        </Button>
                    </form>

                    {error ? (
                        <p className="mt-4 rounded-md border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                            {error}
                        </p>
                    ) : null}
                </CardContent>
            </Card>
        </section>
    );
}
