"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeSlash } from "@phosphor-icons/react/dist/ssr";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

export default function SignInPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [authenticated, setAuthenticated] = useState(false);
    const [checkingSession, setCheckingSession] = useState(true);

    useEffect(() => {
        const checkSession = async () => {
            try {
                const response = await fetch("/api/auth/session", {
                    method: "GET",
                });
                const data = (await response.json().catch(() => null)) as {
                    authenticated?: boolean;
                } | null;
                setAuthenticated(Boolean(data?.authenticated));
            } finally {
                setCheckingSession(false);
            }
        };

        void checkSession();
    }, []);

    const onLogout = async () => {
        setLoading(true);
        setError("");

        try {
            await fetch("/api/auth/logout", {
                method: "POST",
            });
            setAuthenticated(false);
        } catch {
            setError("Unable to sign out right now.");
        } finally {
            setLoading(false);
        }
    };

    const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError("");
        setLoading(true);

        try {
            const response = await fetch("/api/auth/signin", {
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
                setError(data?.message ?? "Unable to sign in right now.");
                return;
            }

            setAuthenticated(true);

            router.push("/products");
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="mx-auto w-full max-w-screen px-4 py-6 lg:px-10 lg:py-10 reveal-up">
            <div className="glass-panel overflow-hidden rounded-xl border border-[#e2e8f0] bg-white/88 lg:grid lg:grid-cols-2">
                <div className="image-zoom relative hidden min-h-190 lg:block">
                    <Image
                        src="https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?auto=format&fit=crop&w=1200&q=80"
                        alt="Model portrait"
                        fill
                        sizes="50vw"
                        className="object-cover"
                    />
                    <div className="absolute inset-0 bg-black/20" />
                    <p className="absolute bottom-6 left-6 border-b border-primary pb-2 font-heading text-4xl italic text-white">
                        The Art of Structure
                    </p>
                </div>

                <div className="min-w-0 bg-[#f8fafc]/92 px-5 py-8 md:px-8 lg:px-10">
                    <div className="mx-auto w-full max-w-md">
                        <p className="text-center text-2xl text-primary">⚑</p>
                        <h1 className="mt-2 text-center font-heading text-5xl text-[#0f172a]">
                            Welcome Back
                        </h1>
                        <p className="mt-2 text-center text-base text-[#64748b]">
                            Access your Diensa by Ansah account
                        </p>

                        {!checkingSession && authenticated ? (
                            <div className="mt-8 space-y-3">
                                <p className="text-center text-sm text-[#0f172a]">
                                    You are currently signed in.
                                </p>
                                <Button
                                    type="button"
                                    onClick={onLogout}
                                    disabled={loading}
                                    className="h-11 w-full rounded-sm bg-primary text-xs font-semibold uppercase tracking-[0.2em] text-white hover:bg-primary/90"
                                >
                                    {loading ? "Signing Out..." : "Sign Out"}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="h-11 w-full rounded-sm border-[#dbe1e7] text-xs font-semibold uppercase tracking-[0.2em]"
                                    onClick={() => router.push("/products")}
                                >
                                    Continue Shopping
                                </Button>
                                {error ? (
                                    <p className="text-center text-sm text-red-600">
                                        {error}
                                    </p>
                                ) : null}
                            </div>
                        ) : null}

                        <form
                            className="mt-8 space-y-5"
                            onSubmit={onSubmit}
                            hidden={!checkingSession && authenticated}
                        >
                            <label className="block text-[11px] font-semibold uppercase tracking-[0.18em] text-[#64748b]">
                                Email Address
                                <Input
                                    type="email"
                                    placeholder="name@institution.com"
                                    className="mt-2 h-11 border-[#dbe1e7] bg-white text-sm"
                                    value={email}
                                    onChange={(event) =>
                                        setEmail(event.target.value)
                                    }
                                />
                            </label>

                            <label className="block text-[11px] font-semibold uppercase tracking-[0.18em] text-[#64748b]">
                                <div className="flex items-center justify-between gap-3">
                                    <span>Password</span>
                                    <Link
                                        href={
                                            email
                                                ? `/account/reset-password?email=${encodeURIComponent(email)}`
                                                : "/account/reset-password"
                                        }
                                        className="text-[11px] font-medium normal-case tracking-normal text-primary"
                                    >
                                        Forgot password?
                                    </Link>
                                </div>
                                <div className="relative mt-2">
                                    <Input
                                        type={
                                            showPassword ? "text" : "password"
                                        }
                                        placeholder="********"
                                        className="h-11 border-[#dbe1e7] bg-white pr-10 text-sm"
                                        value={password}
                                        onChange={(event) =>
                                            setPassword(event.target.value)
                                        }
                                    />
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowPassword(
                                                (current) => !current,
                                            )
                                        }
                                        aria-label={
                                            showPassword
                                                ? "Hide password"
                                                : "Show password"
                                        }
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94a3b8] transition-colors hover:text-[#64748b]"
                                    >
                                        {showPassword ? (
                                            <EyeSlash size={18} />
                                        ) : (
                                            <Eye size={18} />
                                        )}
                                    </button>
                                </div>
                            </label>

                            <Button
                                type="submit"
                                disabled={loading}
                                className="h-11 w-full rounded-sm bg-primary text-xs font-semibold uppercase tracking-[0.2em] text-white hover:bg-primary/90"
                            >
                                {loading ? "Signing In..." : "Sign In"}
                            </Button>

                            {error ? (
                                <p className="text-center text-sm text-red-600">
                                    {error}
                                </p>
                            ) : null}
                        </form>

                        <p className="mt-10 text-center text-sm text-[#64748b]">
                            New to Diensa?{" "}
                            <Link
                                href="/account/signup"
                                className="text-primary"
                            >
                                Request an Invite
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
