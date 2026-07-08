import { getAuthEmailFromRequest } from "@/lib/auth-token";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

type DeliveryDefaultsRequestBody = {
    deliveryContactName?: string;
    deliveryPhone?: string;
    deliveryAddressLine1?: string;
    deliveryAddressLine2?: string;
    deliveryCity?: string;
    deliveryState?: string;
    deliveryPostalCode?: string;
    deliveryCountry?: string;
    deliveryNotes?: string;
};

export async function GET(request: NextRequest) {
    const userEmail = getAuthEmailFromRequest(request);

    if (!userEmail) {
        return NextResponse.json(
            { success: false, message: "Authentication is required" },
            { status: 401 },
        );
    }

    const user = await prisma.user.findUnique({
        where: { email: userEmail },
        select: {
            deliveryDefaultContactName: true,
            deliveryDefaultPhone: true,
            deliveryDefaultAddress: true,
            deliveryDefaultNotes: true,
        },
    });

    const address =
        user?.deliveryDefaultAddress &&
        typeof user.deliveryDefaultAddress === "object" &&
        !Array.isArray(user.deliveryDefaultAddress)
            ? (user.deliveryDefaultAddress as Record<string, unknown>)
            : null;

    return NextResponse.json({
        success: true,
        defaults: {
            deliveryContactName: user?.deliveryDefaultContactName ?? "",
            deliveryPhone: user?.deliveryDefaultPhone ?? "",
            deliveryAddressLine1:
                typeof address?.line1 === "string" ? address.line1 : "",
            deliveryAddressLine2:
                typeof address?.line2 === "string" ? address.line2 : "",
            deliveryCity: typeof address?.city === "string" ? address.city : "",
            deliveryState:
                typeof address?.state === "string" ? address.state : "",
            deliveryPostalCode:
                typeof address?.postalCode === "string"
                    ? address.postalCode
                    : "",
            deliveryCountry:
                typeof address?.country === "string" ? address.country : "",
            deliveryNotes: user?.deliveryDefaultNotes ?? "",
        },
    });
}

export async function PATCH(request: NextRequest) {
    const userEmail = getAuthEmailFromRequest(request);

    if (!userEmail) {
        return NextResponse.json(
            { success: false, message: "Authentication is required" },
            { status: 401 },
        );
    }

    const body = (await request
        .json()
        .catch(() => null)) as DeliveryDefaultsRequestBody | null;

    const deliveryContactName = body?.deliveryContactName?.trim() ?? "";
    const deliveryPhone = body?.deliveryPhone?.trim() ?? "";
    const deliveryAddressLine1 = body?.deliveryAddressLine1?.trim() ?? "";
    const deliveryAddressLine2 = body?.deliveryAddressLine2?.trim() ?? "";
    const deliveryCity = body?.deliveryCity?.trim() ?? "";
    const deliveryState = body?.deliveryState?.trim() ?? "";
    const deliveryPostalCode = body?.deliveryPostalCode?.trim() ?? "";
    const deliveryCountry = body?.deliveryCountry?.trim() ?? "";
    const deliveryNotes = body?.deliveryNotes?.trim() ?? "";

    const hasAddress =
        Boolean(deliveryAddressLine1) ||
        Boolean(deliveryCity) ||
        Boolean(deliveryCountry) ||
        Boolean(deliveryAddressLine2) ||
        Boolean(deliveryState) ||
        Boolean(deliveryPostalCode);

    await prisma.user.updateMany({
        where: { email: userEmail },
        data: {
            deliveryDefaultContactName: deliveryContactName || null,
            deliveryDefaultPhone: deliveryPhone || null,
            deliveryDefaultAddress: hasAddress
                ? {
                      line1: deliveryAddressLine1 || null,
                      line2: deliveryAddressLine2 || null,
                      city: deliveryCity || null,
                      state: deliveryState || null,
                      postalCode: deliveryPostalCode || null,
                      country: deliveryCountry || null,
                  }
                : null,
            deliveryDefaultNotes: deliveryNotes || null,
            deliveryDefaultUpdatedAt: new Date(),
        },
    });

    return NextResponse.json({ success: true });
}
