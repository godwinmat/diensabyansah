import { AdminPanelShell } from "@/components/admin/panel-shell";
import { getAdminCookieName, verifyAdminSessionToken } from "@/lib/admin-auth";
import { cookies } from "next/headers";

export default async function AdminPanelLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const cookieStore = await cookies();
    const token = cookieStore.get(getAdminCookieName())?.value ?? "";
    const isAuthenticated = Boolean(verifyAdminSessionToken(token));

    if (!isAuthenticated) {
        // Login page: full-screen, no sidebar
        return (
            <div className="fixed inset-0 z-50 overflow-y-auto bg-background">
                {children}
            </div>
        );
    }

    // Authenticated: full-screen overlay with responsive sidebar shell
    return (
        <div className="fixed inset-0 z-50 bg-background">
            <AdminPanelShell>{children}</AdminPanelShell>
        </div>
    );
}
