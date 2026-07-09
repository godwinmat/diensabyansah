import { getAdminCookieName, verifyAdminSessionToken } from "@/lib/admin-auth";
import {
    DEFAULT_COMPANY_PROFILE,
    getCompanyProfile,
} from "@/lib/company-profile";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

type CompanyProfileBody = {
    companyName?: string;
    contactEmail?: string;
    supportEmail?: string;
    phonePrimary?: string;
    phoneSecondary?: string;
    addressLine1?: string;
    addressLine2?: string;
    city?: string;
    stateRegion?: string;
    postalCode?: string;
    country?: string;
    businessHours?: string;
    mapEmbedUrl?: string;
    craftedInLabel?: string;
    currencyCode?: string;
    currencySymbol?: string;
};

function normalizeString(value: unknown) {
    return typeof value === "string" ? value.trim() : "";
}

async function isAdminAuthenticated() {
    const cookieStore = await cookies();
    const token = cookieStore.get(getAdminCookieName())?.value ?? "";
    return Boolean(verifyAdminSessionToken(token));
}

export async function GET() {
    if (!(await isAdminAuthenticated())) {
        return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }

    const profile = await getCompanyProfile();

    return NextResponse.json({ profile });
}

export async function PATCH(request: Request) {
    if (!(await isAdminAuthenticated())) {
        return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }

    const body = (await request
        .json()
        .catch(() => null)) as CompanyProfileBody | null;

    const companyName =
        normalizeString(body?.companyName) ||
        DEFAULT_COMPANY_PROFILE.companyName;
    const contactEmail =
        normalizeString(body?.contactEmail) ||
        DEFAULT_COMPANY_PROFILE.contactEmail;
    const supportEmail =
        normalizeString(body?.supportEmail) ||
        DEFAULT_COMPANY_PROFILE.supportEmail;
    const phonePrimary =
        normalizeString(body?.phonePrimary) ||
        DEFAULT_COMPANY_PROFILE.phonePrimary;
    const phoneSecondary = normalizeString(body?.phoneSecondary);
    const addressLine1 =
        normalizeString(body?.addressLine1) ||
        DEFAULT_COMPANY_PROFILE.addressLine1;
    const addressLine2 = normalizeString(body?.addressLine2);
    const city = normalizeString(body?.city) || DEFAULT_COMPANY_PROFILE.city;
    const stateRegion =
        normalizeString(body?.stateRegion) ||
        DEFAULT_COMPANY_PROFILE.stateRegion;
    const postalCode = normalizeString(body?.postalCode);
    const country =
        normalizeString(body?.country) || DEFAULT_COMPANY_PROFILE.country;
    const businessHours =
        normalizeString(body?.businessHours) ||
        DEFAULT_COMPANY_PROFILE.businessHours;
    const mapEmbedUrl =
        normalizeString(body?.mapEmbedUrl) ||
        DEFAULT_COMPANY_PROFILE.mapEmbedUrl;
    const craftedInLabel =
        normalizeString(body?.craftedInLabel) ||
        DEFAULT_COMPANY_PROFILE.craftedInLabel;
    const currencyCode =
        normalizeString(body?.currencyCode).toUpperCase() ||
        DEFAULT_COMPANY_PROFILE.currencyCode;
    const currencySymbol =
        normalizeString(body?.currencySymbol) ||
        DEFAULT_COMPANY_PROFILE.currencySymbol;

    const saved = await prisma.companyProfile.upsert({
        where: { id: "default" },
        create: {
            id: "default",
            companyName,
            contactEmail,
            supportEmail,
            phonePrimary,
            phoneSecondary: phoneSecondary || null,
            addressLine1,
            addressLine2: addressLine2 || null,
            city,
            stateRegion,
            postalCode: postalCode || null,
            country,
            businessHours,
            mapEmbedUrl,
            craftedInLabel,
            currencyCode,
            currencySymbol,
        },
        update: {
            companyName,
            contactEmail,
            supportEmail,
            phonePrimary,
            phoneSecondary: phoneSecondary || null,
            addressLine1,
            addressLine2: addressLine2 || null,
            city,
            stateRegion,
            postalCode: postalCode || null,
            country,
            businessHours,
            mapEmbedUrl,
            craftedInLabel,
            currencyCode,
            currencySymbol,
        },
        select: {
            companyName: true,
            contactEmail: true,
            supportEmail: true,
            phonePrimary: true,
            phoneSecondary: true,
            addressLine1: true,
            addressLine2: true,
            city: true,
            stateRegion: true,
            postalCode: true,
            country: true,
            businessHours: true,
            mapEmbedUrl: true,
            craftedInLabel: true,
            currencyCode: true,
            currencySymbol: true,
        },
    });

    return NextResponse.json({
        message: "Company profile updated successfully.",
        profile: {
            companyName: saved.companyName,
            contactEmail:
                saved.contactEmail ?? DEFAULT_COMPANY_PROFILE.contactEmail,
            supportEmail:
                saved.supportEmail ?? DEFAULT_COMPANY_PROFILE.supportEmail,
            phonePrimary:
                saved.phonePrimary ?? DEFAULT_COMPANY_PROFILE.phonePrimary,
            phoneSecondary: saved.phoneSecondary ?? "",
            addressLine1:
                saved.addressLine1 ?? DEFAULT_COMPANY_PROFILE.addressLine1,
            addressLine2: saved.addressLine2 ?? "",
            city: saved.city ?? DEFAULT_COMPANY_PROFILE.city,
            stateRegion:
                saved.stateRegion ?? DEFAULT_COMPANY_PROFILE.stateRegion,
            postalCode: saved.postalCode ?? "",
            country: saved.country ?? DEFAULT_COMPANY_PROFILE.country,
            businessHours:
                saved.businessHours ?? DEFAULT_COMPANY_PROFILE.businessHours,
            mapEmbedUrl:
                saved.mapEmbedUrl ?? DEFAULT_COMPANY_PROFILE.mapEmbedUrl,
            craftedInLabel:
                saved.craftedInLabel ?? DEFAULT_COMPANY_PROFILE.craftedInLabel,
            currencyCode:
                saved.currencyCode ?? DEFAULT_COMPANY_PROFILE.currencyCode,
            currencySymbol:
                saved.currencySymbol ?? DEFAULT_COMPANY_PROFILE.currencySymbol,
        },
    });
}
