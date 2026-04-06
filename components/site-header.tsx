"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CART_UPDATED_EVENT } from "@/lib/cart";
import { cn } from "@/lib/utils";
import {
    List,
    MagnifyingGlass,
    ShoppingBag,
    User,
    X,
} from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const navigation = [
    { href: "/products", label: "Shop" },
    // { href: "/collections", label: "Collections" },
    { href: "/about", label: "About Diensa" },
    { href: "/testimonials", label: "Testimonials" },
    { href: "/blog", label: "Blog" },
    { href: "/contact", label: "Contact" },
];

export function SiteHeader() {
    const pathname = usePathname();
    const router = useRouter();
    const mobileMenuRef = useRef<HTMLInputElement>(null);
    const userMenuRef = useRef<HTMLDivElement>(null);
    const [cartCount, setCartCount] = useState(0);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState<{ name: string; email: string } | null>(
        null,
    );
    const [authChecked, setAuthChecked] = useState(false);
    const [authLoading, setAuthLoading] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

    useEffect(() => {
        const syncCartCount = async () => {
            try {
                const response = await fetch("/api/cart", {
                    method: "GET",
                    cache: "no-store",
                });

                const data = (await response.json().catch(() => null)) as {
                    success?: boolean;
                    cart?: {
                        items?: Array<{ quantity?: number }>;
                        items_count?: number;
                    };
                } | null;

                const countFromSummary = Number(data?.cart?.items_count ?? 0);

                if (Number.isFinite(countFromSummary) && countFromSummary > 0) {
                    setCartCount(countFromSummary);
                    return;
                }

                const fallbackCount = (data?.cart?.items ?? []).reduce(
                    (sum, item) => sum + Number(item.quantity ?? 0),
                    0,
                );

                setCartCount(fallbackCount);
            } catch {
                setCartCount(0);
            }
        };

        void syncCartCount();

        const onCartUpdated = () => {
            void syncCartCount();
        };

        window.addEventListener(CART_UPDATED_EVENT, onCartUpdated);

        return () => {
            window.removeEventListener(CART_UPDATED_EVENT, onCartUpdated);
        };
    }, [pathname]);

    useEffect(() => {
        const checkSession = async () => {
            try {
                const response = await fetch("/api/auth/session", {
                    method: "GET",
                });
                const data = (await response.json().catch(() => null)) as {
                    authenticated?: boolean;
                    user?: {
                        name?: string;
                        email?: string;
                    };
                } | null;

                const authenticated = Boolean(data?.authenticated);

                setIsAuthenticated(authenticated);
                setUser(
                    authenticated
                        ? {
                              name:
                                  data?.user?.name?.trim() || "Signed-in user",
                              email:
                                  data?.user?.email?.trim() ||
                                  "No email available",
                          }
                        : null,
                );
            } finally {
                setAuthChecked(true);
            }
        };

        void checkSession();
    }, [pathname]);

    useEffect(() => {
        const onDocumentClick = (event: MouseEvent) => {
            if (
                userMenuRef.current &&
                !userMenuRef.current.contains(event.target as Node)
            ) {
                setIsUserMenuOpen(false);
            }
        };

        document.addEventListener("mousedown", onDocumentClick);

        return () => {
            document.removeEventListener("mousedown", onDocumentClick);
        };
    }, []);

    useEffect(() => {
        setIsUserMenuOpen(false);
    }, [pathname]);

    const closeMobileMenu = () => {
        if (mobileMenuRef.current) {
            mobileMenuRef.current.checked = false;
        }
    };

    const handleLogout = async () => {
        setAuthLoading(true);

        try {
            await fetch("/api/auth/logout", {
                method: "POST",
            });
            setIsAuthenticated(false);
            setUser(null);
            setIsUserMenuOpen(false);
            closeMobileMenu();
            router.push("/");
            router.refresh();
        } finally {
            setAuthLoading(false);
        }
    };

    const isActivePath = (href: string) => {
        if (href === "/testimonials") {
            return pathname === "/testimonials" || pathname === "/testimonial";
        }

        return pathname === href || pathname.startsWith(`${href}/`);
    };

    return (
        <header className="glass-panel fixed inset-x-0 top-0 z-50 border-b border-border/70 bg-white/75">
            <div className="mx-auto w-full max-w-screen px-2 sm:px-5 lg:px-10">
                <input
                    id="mobile-menu"
                    type="checkbox"
                    className="peer sr-only"
                    ref={mobileMenuRef}
                />

                <div className="flex h-16 items-center gap-10 lg:h-20">
                    <Link
                        href="/"
                        className="flex min-w-max items-center gap-3 transition-transform duration-300 hover:scale-[1.015]"
                    >
                        <div className="grid h-8 w-8 place-items-center rounded-full bg-neutral-200 text-[9px] font-semibold text-neutral-700">
                            DA
                        </div>
                        <p className="text-[1.15rem] font-semibold uppercase leading-none tracking-tight text-[#111827] lg:text-[1.35rem]">
                            Diensa{" "}
                            <span className="text-primary">by Ansah</span>
                        </p>
                    </Link>

                    <nav className="hidden items-center gap-6 lg:flex">
                        {navigation.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "text-[0.94rem] font-medium uppercase leading-none tracking-[0.06em] transition-colors",
                                    isActivePath(item.href)
                                        ? "text-primary"
                                        : "text-[#111827] hover:text-primary",
                                )}
                            >
                                {item.label}
                            </Link>
                        ))}
                    </nav>

                    <div className="ml-auto hidden items-center gap-4 md:flex">
                        <div className="glass-panel flex h-10 w-56 items-center rounded-lg bg-[#f3f4f6]/85 px-2 text-[#9ca3af] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md focus-within:-translate-y-0.5 focus-within:border-primary/35 focus-within:shadow-md focus-within:ring-2 focus-within:ring-primary/20">
                            <MagnifyingGlass size={18} weight="regular" />
                            <Input
                                placeholder="Search"
                                className="ml-2 h-8 border-0 bg-transparent p-0 text-base shadow-none transition-none focus-visible:border-0 focus-visible:bg-transparent focus-visible:shadow-none focus-visible:ring-0"
                            />
                        </div>

                        {authChecked ? (
                            isAuthenticated ? (
                                <div className="relative" ref={userMenuRef}>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon-sm"
                                        className="text-[#111827] hover:text-primary"
                                        aria-label="Account menu"
                                        onClick={() =>
                                            setIsUserMenuOpen(
                                                (current) => !current,
                                            )
                                        }
                                    >
                                        <User size={24} weight="regular" />
                                    </Button>

                                    {isUserMenuOpen ? (
                                        <div className="absolute right-0 top-full z-50 mt-2 w-64 rounded-lg border border-[#e2e8f0] bg-white p-3 shadow-xl">
                                            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#94a3b8]">
                                                Signed in as
                                            </p>
                                            <p className="mt-1 text-sm font-semibold text-[#111827]">
                                                {user?.name || "Signed-in user"}
                                            </p>
                                            <p className="truncate text-xs text-[#64748b]">
                                                {user?.email ||
                                                    "No email available"}
                                            </p>

                                            <Button
                                                type="button"
                                                variant="outline"
                                                className="mt-3 h-9 w-full border-[#e2e8f0] text-xs font-semibold uppercase tracking-widest text-[#111827]"
                                                onClick={handleLogout}
                                                disabled={authLoading}
                                            >
                                                {authLoading
                                                    ? "Signing Out..."
                                                    : "Log Out"}
                                            </Button>
                                        </div>
                                    ) : null}
                                </div>
                            ) : (
                                <Button
                                    asChild
                                    variant="ghost"
                                    size="icon-sm"
                                    className="text-[#111827] hover:text-primary"
                                >
                                    <Link href="/account" aria-label="Account">
                                        <User size={24} weight="regular" />
                                    </Link>
                                </Button>
                            )
                        ) : null}

                        <Button
                            asChild
                            variant="ghost"
                            size="icon-sm"
                            className="relative text-[#111827] hover:text-primary"
                        >
                            <Link href="/cart" aria-label="Cart">
                                <ShoppingBag size={24} weight="regular" />
                                <Badge className="absolute -right-2 -top-2 h-5 min-w-5 rounded-full bg-primary px-1 text-[10px] font-semibold text-[#1f2937] hover:bg-primary">
                                    {cartCount}
                                </Badge>
                            </Link>
                        </Button>
                    </div>

                    <div className="ml-auto flex items-center gap-3 md:hidden">
                        <Button
                            asChild
                            variant="ghost"
                            size="icon-sm"
                            className="relative text-[#111827]"
                        >
                            <Link href="/cart" aria-label="Cart">
                                <ShoppingBag size={22} weight="regular" />
                                <Badge className="absolute -right-2 -top-2 h-4 min-w-4 rounded-full bg-primary px-1 text-[9px] font-semibold text-[#1f2937] hover:bg-primary">
                                    {cartCount}
                                </Badge>
                            </Link>
                        </Button>

                        <Button
                            asChild
                            variant="outline"
                            size="icon-sm"
                            className="cursor-pointer border-[#e2e8f0] text-[#111827]"
                        >
                            <label
                                htmlFor="mobile-menu"
                                aria-label="Toggle navigation"
                            >
                                <List size={20} weight="bold" />
                            </label>
                        </Button>
                    </div>
                </div>

                <label
                    htmlFor="mobile-menu"
                    aria-label="Close navigation"
                    className="pointer-events-none fixed inset-0 z-55 bg-black/45 opacity-0 transition-opacity duration-300 peer-checked:pointer-events-auto peer-checked:opacity-100 md:hidden"
                />

                <aside className="fixed inset-y-0 left-0 z-60 flex min-h-svh w-80 max-w-[86vw] -translate-x-full flex-col border-r border-[#e2e8f0] bg-white px-4 pb-6 pt-4 shadow-2xl transition-transform duration-300 ease-out peer-checked:translate-x-0 md:hidden">
                    <div className="mb-4 flex items-center justify-between">
                        <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#111827]">
                            Menu
                        </p>
                        <label
                            htmlFor="mobile-menu"
                            aria-label="Close navigation"
                            className="grid h-8 w-8 place-items-center rounded-md border border-[#e2e8f0] text-[#111827]"
                        >
                            <X size={18} weight="bold" />
                        </label>
                    </div>

                    <nav className="flex flex-col gap-1">
                        {navigation.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={closeMobileMenu}
                                className={cn(
                                    "rounded-md px-2 py-2 text-sm font-medium uppercase tracking-[0.08em] transition-colors",
                                    isActivePath(item.href)
                                        ? "bg-[#f8fafc] text-primary"
                                        : "text-[#111827] hover:bg-[#f8fafc] hover:text-primary",
                                )}
                            >
                                {item.label}
                            </Link>
                        ))}
                    </nav>

                    <div className="mt-auto grid gap-3 pt-6">
                        {authChecked ? (
                            isAuthenticated ? (
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="h-10 border-[#e2e8f0] text-sm font-semibold uppercase tracking-[0.08em] text-[#111827]"
                                    onClick={handleLogout}
                                    disabled={authLoading}
                                >
                                    {authLoading
                                        ? "Signing Out..."
                                        : "Sign Out"}
                                </Button>
                            ) : (
                                <Button
                                    asChild
                                    variant="outline"
                                    className="h-10 border-[#e2e8f0] text-sm font-semibold uppercase tracking-[0.08em] text-[#111827]"
                                >
                                    <Link
                                        href="/account"
                                        onClick={closeMobileMenu}
                                    >
                                        Account
                                    </Link>
                                </Button>
                            )
                        ) : null}
                        <Button
                            asChild
                            className="h-10 bg-primary text-sm font-semibold uppercase tracking-[0.08em] text-[#1f2937] hover:bg-primary/90"
                        >
                            <Link href="/contact" onClick={closeMobileMenu}>
                                Contact
                            </Link>
                        </Button>
                    </div>
                </aside>
            </div>
        </header>
    );
}
