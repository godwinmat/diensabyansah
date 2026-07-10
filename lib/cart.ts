export const CART_UPDATED_EVENT = "diensa-cart-updated";

export function parsePrice(value: string): number {
    const normalized = value.replace(/,/g, ".");
    const cleaned = normalized.replace(/[^0-9.]/g, "");
    const firstDot = cleaned.indexOf(".");
    const collapsed =
        firstDot === -1
            ? cleaned
            : `${cleaned.slice(0, firstDot + 1)}${cleaned.slice(firstDot + 1).replace(/\./g, "")}`;

    const amount = Number(collapsed);
    return Number.isFinite(amount) ? amount : 0;
}

export function formatDisplayPrice(
    value: string,
    currencySymbol: string,
    fractionDigits = 2,
) {
    const amount = parsePrice(value);
    const digits = Number.isFinite(fractionDigits)
        ? Math.min(Math.max(Math.floor(fractionDigits), 0), 4)
        : 2;

    return `${currencySymbol}${amount.toFixed(digits)}`;
}
