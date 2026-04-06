"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeSlash, Flag, X } from "@phosphor-icons/react/dist/ssr";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export default function SignUpPage() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError("");
        setLoading(true);

        try {
            const response = await fetch("/api/auth/signup", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ name, email, password }),
            });

            const data = (await response.json().catch(() => null)) as {
                message?: string;
            } | null;

            if (!response.ok) {
                setError(
                    data?.message ?? "Unable to create account right now.",
                );
                return;
            }

            router.push("/account");
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="mx-auto w-full max-w-screen px-4 py-6 lg:px-10 lg:py-10 reveal-up">
            <div className="glass-panel overflow-hidden rounded-xl border border-[#e2e8f0] bg-white/88 lg:grid lg:grid-cols-[1.15fr_1fr]">
                <div className="image-zoom relative hidden min-h-190 lg:block">
                    <Image
                        src="https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1400&q=80"
                        alt="Textile pattern"
                        fill
                        sizes="50vw"
                        className="object-cover"
                    />
                    <div className="absolute inset-0 bg-black/35" />

                    <div className="absolute bottom-8 left-8 max-w-md text-white">
                        <h2 className="text-6xl font-semibold tracking-tight">
                            The Art of Heritage
                        </h2>
                        <p className="mt-4 text-xl leading-9 text-white/85">
                            Discover a world where traditional African
                            craftsmanship meets contemporary luxury. Join the
                            Diensa collective today.
                        </p>
                    </div>
                </div>

                <div className="min-w-0 bg-[#f8fafc]/92 px-5 py-8 md:px-8 lg:px-10">
                    <div className="mx-auto w-full max-w-md">
                        <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2 text-[#1f2937]">
                                <Flag
                                    size={16}
                                    weight="fill"
                                    className="text-primary"
                                />
                                <span className="font-semibold">
                                    Diensa by Ansah
                                </span>
                            </div>
                            <Link href="/" className="text-[#64748b]">
                                <X size={18} />
                            </Link>
                        </div>

                        <h1 className="mt-8 text-5xl font-semibold text-[#0f172a]">
                            Create Account
                        </h1>
                        <p className="mt-2 text-base text-[#64748b]">
                            Join the world of luxury African textiles.
                        </p>

                        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
                            <label className="block text-[11px] font-semibold uppercase tracking-[0.18em] text-[#1f2937]">
                                Full Name
                                <Input
                                    type="text"
                                    placeholder="John Doe"
                                    className="mt-2 h-11 border-[#dbe1e7] bg-white text-sm"
                                    value={name}
                                    onChange={(event) =>
                                        setName(event.target.value)
                                    }
                                />
                            </label>

                            <label className="block text-[11px] font-semibold uppercase tracking-[0.18em] text-[#1f2937]">
                                Email Address
                                <Input
                                    type="email"
                                    placeholder="john@example.com"
                                    className="mt-2 h-11 border-[#dbe1e7] bg-white text-sm"
                                    value={email}
                                    onChange={(event) =>
                                        setEmail(event.target.value)
                                    }
                                />
                            </label>

                            <label className="block text-[11px] font-semibold uppercase tracking-[0.18em] text-[#1f2937]">
                                Password
                                <div className="relative mt-2">
                                    <Input
                                        type={
                                            showPassword ? "text" : "password"
                                        }
                                        placeholder="••••••••"
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
                                className="mt-2 h-11 w-full rounded-sm bg-primary text-xs font-semibold uppercase tracking-[0.2em] text-[#1f2937] hover:bg-primary/90"
                            >
                                {loading ? "Creating..." : "Create Account"}
                            </Button>

                            {error ? (
                                <p className="text-center text-sm text-red-600">
                                    {error}
                                </p>
                            ) : null}
                        </form>

                        <div className="my-7 flex items-center gap-3 text-sm text-[#94a3b8]">
                            <span className="h-px flex-1 bg-[#dbe1e7]" />
                            Continue with
                            <span className="h-px flex-1 bg-[#dbe1e7]" />
                        </div>

                        <Button
                            type="button"
                            variant="outline"
                            className="h-10 w-full rounded-sm border-[#dbe1e7] bg-white text-sm font-medium text-[#1f2937]"
                        >
                            Google
                        </Button>

                        <p className="mt-8 text-center text-sm text-[#64748b]">
                            Already have an account?{" "}
                            <Link
                                href="/account"
                                className="font-medium text-primary"
                            >
                                Sign In
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
