"use client";

import { Button } from "@/components/ui/button";
import {
    Article,
    BuildingOffice,
    ChatsCircle,
    ChatText,
    CreditCard,
    Folders,
    List,
    Package,
    Receipt,
    SignOut,
    SquaresFour,
    Users,
    X,
} from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

const navLinks = [
    { href: "/admin-panel", label: "Dashboard", icon: SquaresFour },
    { href: "/admin-panel/posts", label: "Blog Posts", icon: Article },
    { href: "/admin-panel/collections", label: "Collections", icon: Folders },
    { href: "/admin-panel/products", label: "Products", icon: Package },
    { href: "/admin-panel/orders", label: "Orders", icon: Receipt },
    { href: "/admin-panel/payments", label: "Payments", icon: CreditCard },
    {
        href: "/admin-panel/testimonials",
        label: "Testimonies",
        icon: ChatsCircle,
    },
    {
        href: "/admin-panel/chat",
        label: "Chat Inbox",
        icon: ChatText,
    },
    { href: "/admin-panel/users", label: "Users", icon: Users },
    {
        href: "/admin-panel/profile",
        label: "Company Profile",
        icon: BuildingOffice,
    },
];

type AdminSidebarProps = {
    isOpen: boolean;
    onOpen: () => void;
    onClose: () => void;
};

export function AdminSidebar({ isOpen, onOpen, onClose }: AdminSidebarProps) {
    const pathname = usePathname();
    const router = useRouter();
    const [signingOut, setSigningOut] = useState(false);

    const isActive = (href: string) => {
        if (href === "/admin-panel") return pathname === "/admin-panel";
        return pathname === href || pathname.startsWith(`${href}/`);
    };

    const handleSignOut = async () => {
        setSigningOut(true);
        try {
            await fetch("/api/admin-panel/logout", { method: "POST" });
            router.push("/admin-panel/login");
            router.refresh();
        } finally {
            setSigningOut(false);
        }
    };

    return (
        <>
            <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={onOpen}
                className="fixed left-4 top-4 z-40 md:hidden"
                aria-label="Open admin navigation"
            >
                <List size={18} />
            </Button>

            <div
                className={`fixed inset-0 z-40 bg-black/45 transition-opacity md:hidden ${
                    isOpen
                        ? "pointer-events-auto opacity-100"
                        : "pointer-events-none opacity-0"
                }`}
                onClick={onClose}
                aria-hidden="true"
            />

            <aside
                className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r bg-card transition-transform duration-200 md:static md:z-auto md:h-full md:w-64 md:translate-x-0 ${
                    isOpen ? "translate-x-0" : "-translate-x-full"
                }`}
                aria-label="Admin sidebar"
            >
                <div className="border-b px-5 py-5">
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                                Admin Panel
                            </p>
                            <p className="mt-1 text-lg font-semibold">
                                Diensa by Ansah
                            </p>
                        </div>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={onClose}
                            className="md:hidden"
                            aria-label="Close admin navigation"
                        >
                            <X size={18} />
                        </Button>
                    </div>
                </div>

                <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
                    {navLinks.map(({ href, label, icon: Icon }) => (
                        <Link
                            key={href}
                            href={href}
                            onClick={onClose}
                            className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
                                isActive(href)
                                    ? "bg-primary/10 text-primary"
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            }`}
                        >
                            <Icon
                                size={18}
                                weight={isActive(href) ? "fill" : "regular"}
                            />
                            {label}
                        </Link>
                    ))}
                </nav>

                <div className="border-t px-3 py-3">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={handleSignOut}
                        disabled={signingOut}
                        className="w-full justify-start gap-3 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                    >
                        <SignOut size={18} />
                        {signingOut ? "Signing out…" : "Sign out"}
                    </Button>
                </div>
            </aside>
        </>
    );
}
