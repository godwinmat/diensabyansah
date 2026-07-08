import { hashPassword, verifyPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const ADMIN_ACCOUNT_ID = "default";

function getEnvAdminEmail() {
    return process.env.ADMIN_PANEL_EMAIL?.trim().toLowerCase() || "";
}

function getEnvAdminPassword() {
    return process.env.ADMIN_PANEL_PASSWORD?.trim() || "";
}

export async function getAdminAccountEmail() {
    const stored = await prisma.adminAccount.findUnique({
        where: { id: ADMIN_ACCOUNT_ID },
        select: { email: true },
    });

    return stored?.email ?? getEnvAdminEmail();
}

export async function validateAdminLoginCredentials(
    email: string,
    password: string,
) {
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPassword = password.trim();

    const stored = await prisma.adminAccount.findUnique({
        where: { id: ADMIN_ACCOUNT_ID },
        select: {
            email: true,
            passwordHash: true,
        },
    });

    if (stored) {
        if (normalizedEmail !== stored.email) {
            return {
                ok: false,
                message: "Invalid admin email or password.",
            };
        }

        if (!verifyPassword(normalizedPassword, stored.passwordHash)) {
            return {
                ok: false,
                message: "Invalid admin email or password.",
            };
        }

        return {
            ok: true,
            email: stored.email,
            message: "Authenticated",
        };
    }

    const configuredEmail = getEnvAdminEmail();
    const configuredPassword = getEnvAdminPassword();

    if (!configuredEmail || !configuredPassword) {
        return {
            ok: false,
            message:
                "Admin credentials are not configured. Set ADMIN_PANEL_EMAIL and ADMIN_PANEL_PASSWORD.",
        };
    }

    if (
        normalizedEmail !== configuredEmail ||
        normalizedPassword !== configuredPassword
    ) {
        return {
            ok: false,
            message: "Invalid admin email or password.",
        };
    }

    return {
        ok: true,
        email: configuredEmail,
        message: "Authenticated",
    };
}

export async function updateAdminCredentials(input: {
    currentPassword: string;
    newEmail?: string;
    newPassword?: string;
}) {
    const currentPassword = input.currentPassword.trim();
    const nextEmail = input.newEmail?.trim().toLowerCase() ?? "";
    const nextPassword = input.newPassword?.trim() ?? "";

    if (!currentPassword) {
        return {
            ok: false,
            message: "Current password is required.",
        };
    }

    const stored = await prisma.adminAccount.findUnique({
        where: { id: ADMIN_ACCOUNT_ID },
        select: {
            email: true,
            passwordHash: true,
        },
    });

    const envEmail = getEnvAdminEmail();
    const envPassword = getEnvAdminPassword();

    if (!stored && (!envEmail || !envPassword)) {
        return {
            ok: false,
            message:
                "Admin credentials are not configured. Set ADMIN_PANEL_EMAIL and ADMIN_PANEL_PASSWORD first.",
        };
    }

    const canAuthenticateCurrent = stored
        ? verifyPassword(currentPassword, stored.passwordHash)
        : currentPassword === envPassword;

    if (!canAuthenticateCurrent) {
        return {
            ok: false,
            message: "Current password is incorrect.",
        };
    }

    if (!nextEmail && !nextPassword) {
        return {
            ok: false,
            message: "Provide a new email or a new password.",
        };
    }

    const resolvedEmail = nextEmail || stored?.email || envEmail;

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(resolvedEmail)) {
        return {
            ok: false,
            message: "Please provide a valid admin email.",
        };
    }

    if (nextPassword && nextPassword.length < 8) {
        return {
            ok: false,
            message: "New password must be at least 8 characters.",
        };
    }

    const resolvedPasswordHash = nextPassword
        ? hashPassword(nextPassword)
        : stored?.passwordHash || hashPassword(currentPassword);

    const saved = await prisma.adminAccount.upsert({
        where: { id: ADMIN_ACCOUNT_ID },
        create: {
            id: ADMIN_ACCOUNT_ID,
            email: resolvedEmail,
            passwordHash: resolvedPasswordHash,
        },
        update: {
            email: resolvedEmail,
            passwordHash: resolvedPasswordHash,
        },
        select: {
            email: true,
        },
    });

    return {
        ok: true,
        message: "Admin credentials updated successfully.",
        email: saved.email,
    };
}
