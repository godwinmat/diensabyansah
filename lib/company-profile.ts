import { prisma } from "@/lib/prisma";

export type CompanyProfileData = {
    companyName: string;
    contactEmail: string;
    supportEmail: string;
    phonePrimary: string;
    phoneSecondary: string;
    addressLine1: string;
    addressLine2: string;
    city: string;
    stateRegion: string;
    postalCode: string;
    country: string;
    businessHours: string;
    mapEmbedUrl: string;
    craftedInLabel: string;
    currencyCode: string;
    currencySymbol: string;
};

export const DEFAULT_COMPANY_PROFILE: CompanyProfileData = {
    companyName: "Diensa by Ansah",
    contactEmail: "info@diensabyansah.com",
    supportEmail: "hello@diensa-ansah.cm",
    phonePrimary: "+237 233 44 55 66",
    phoneSecondary: "",
    addressLine1: "Avenue de l'Independance",
    addressLine2: "Bonanjo",
    city: "Douala",
    stateRegion: "Littoral Region",
    postalCode: "",
    country: "Cameroon",
    businessHours:
        "Mon - Fri: 09:00 AM - 06:00 PM\nSaturday: 10:00 AM - 04:00 PM\nSunday: By Appointment Only",
    mapEmbedUrl:
        "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3979.982926805878!2d9.704553400000002!3d4.0238909000000005!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x106112b8beb14df9%3A0xddc83e225dade421!2sAv.%20de%20l&#39;Ind%C3%A9pendance%2C%20Douala%2C%20Cameroon!5e0!3m2!1sen!2sng!4v1774890018125!5m2!1sen!2sng",
    craftedInLabel: "Crafted in Cameroon",
    currencyCode: "XAF",
    currencySymbol: "FCFA",
};

function toStringValue(value: unknown) {
    return typeof value === "string" ? value.trim() : "";
}

function buildMapQuery(profile: CompanyProfileData) {
    return [
        profile.companyName,
        profile.addressLine1,
        profile.addressLine2,
        profile.city,
        profile.stateRegion,
        profile.country,
    ]
        .map((value) => value.trim())
        .filter((value) => value.length > 0)
        .join(", ");
}

function buildEmbedUrlFromQuery(query: string) {
    return `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`;
}

export function getCompanyMapEmbedUrl(profile: CompanyProfileData) {
    const raw = profile.mapEmbedUrl.trim();
    const fallbackQuery = buildMapQuery(profile);

    if (!raw) {
        return buildEmbedUrlFromQuery(fallbackQuery);
    }

    try {
        const url = new URL(raw);
        const hostname = url.hostname.replace(/^www\./, "");

        if (!hostname.includes("google.com")) {
            return raw;
        }

        if (url.searchParams.has("pb")) {
            return buildEmbedUrlFromQuery(fallbackQuery);
        }

        const searchQuery =
            url.searchParams.get("q")?.trim() ||
            url.searchParams.get("query")?.trim() ||
            url.searchParams.get("destination")?.trim() ||
            fallbackQuery;

        return buildEmbedUrlFromQuery(searchQuery || fallbackQuery);
    } catch {
        return buildEmbedUrlFromQuery(fallbackQuery);
    }
}

export async function getCompanyProfile(): Promise<CompanyProfileData> {
    const profile = await prisma.companyProfile.findUnique({
        where: { id: "default" },
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

    if (!profile) {
        return DEFAULT_COMPANY_PROFILE;
    }

    return {
        companyName:
            toStringValue(profile.companyName) ||
            DEFAULT_COMPANY_PROFILE.companyName,
        contactEmail:
            toStringValue(profile.contactEmail) ||
            DEFAULT_COMPANY_PROFILE.contactEmail,
        supportEmail:
            toStringValue(profile.supportEmail) ||
            DEFAULT_COMPANY_PROFILE.supportEmail,
        phonePrimary:
            toStringValue(profile.phonePrimary) ||
            DEFAULT_COMPANY_PROFILE.phonePrimary,
        phoneSecondary: toStringValue(profile.phoneSecondary),
        addressLine1:
            toStringValue(profile.addressLine1) ||
            DEFAULT_COMPANY_PROFILE.addressLine1,
        addressLine2:
            toStringValue(profile.addressLine2) ||
            DEFAULT_COMPANY_PROFILE.addressLine2,
        city: toStringValue(profile.city) || DEFAULT_COMPANY_PROFILE.city,
        stateRegion:
            toStringValue(profile.stateRegion) ||
            DEFAULT_COMPANY_PROFILE.stateRegion,
        postalCode: toStringValue(profile.postalCode),
        country:
            toStringValue(profile.country) || DEFAULT_COMPANY_PROFILE.country,
        businessHours:
            toStringValue(profile.businessHours) ||
            DEFAULT_COMPANY_PROFILE.businessHours,
        mapEmbedUrl:
            toStringValue(profile.mapEmbedUrl) ||
            DEFAULT_COMPANY_PROFILE.mapEmbedUrl,
        craftedInLabel:
            toStringValue(profile.craftedInLabel) ||
            DEFAULT_COMPANY_PROFILE.craftedInLabel,
        currencyCode:
            toStringValue(profile.currencyCode) ||
            DEFAULT_COMPANY_PROFILE.currencyCode,
        currencySymbol:
            toStringValue(profile.currencySymbol) ||
            DEFAULT_COMPANY_PROFILE.currencySymbol,
    };
}
