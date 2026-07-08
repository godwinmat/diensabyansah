"use client";

import { AdminSidebar } from "@/components/admin/sidebar";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type AdminPanelShellProps = {
    children: React.ReactNode;
};

export function AdminPanelShell({ children }: AdminPanelShellProps) {
    const pathname = usePathname();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        setSidebarOpen(false);
    }, [pathname]);

    useEffect(() => {
        if (!sidebarOpen) {
            document.body.style.overflow = "";
            return;
        }

        document.body.style.overflow = "hidden";

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setSidebarOpen(false);
            }
        };

        window.addEventListener("keydown", handleEscape);

        return () => {
            document.body.style.overflow = "";
            window.removeEventListener("keydown", handleEscape);
        };
    }, [sidebarOpen]);

    return (
        <div className="flex h-full min-h-0 bg-background">
            <AdminSidebar
                isOpen={sidebarOpen}
                onOpen={() => setSidebarOpen(true)}
                onClose={() => setSidebarOpen(false)}
            />
            <main className="min-w-0 flex-1 overflow-y-auto pt-16 md:pt-0">
                {children}
            </main>
        </div>
    );
}
