import { AdminAccountForm } from "@/components/admin/admin-account-form";
import { CompanyProfileForm } from "@/components/admin/company-profile-form";
import { getAdminAccountEmail } from "@/lib/admin-account";
import {
    getAdminCookieName,
    getAdminLoginPath,
    verifyAdminSessionToken,
} from "@/lib/admin-auth";
import { getCompanyProfile } from "@/lib/company-profile";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminCompanyProfilePage() {
    const cookieStore = await cookies();
    const token = cookieStore.get(getAdminCookieName())?.value ?? "";
    const adminSession = verifyAdminSessionToken(token);

    if (!adminSession) {
        redirect(getAdminLoginPath());
    }

    const [profile, adminEmail] = await Promise.all([
        getCompanyProfile(),
        getAdminAccountEmail(),
    ]);

    return (
        <div className="mx-auto max-w-4xl px-4 py-8">
            <div className="mb-6">
                <h1 className="text-2xl font-bold">Company Profile</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    Manage reusable company details used across customer-facing
                    pages.
                </p>
            </div>
            <div className="mb-6">
                <AdminAccountForm initialEmail={adminEmail} />
            </div>
            <CompanyProfileForm initialProfile={profile} />
        </div>
    );
}
