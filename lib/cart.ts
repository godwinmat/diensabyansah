export const CART_UPDATED_EVENT = "diensa-cart-updated";

export function parsePrice(value: string): number {
    const amount = Number(value.replace(/[^0-9.]/g, ""));
    return Number.isFinite(amount) ? amount : 0;
}
