export const CART_STORAGE_KEY = "diensa-cart";
export const CART_UPDATED_EVENT = "diensa-cart-updated";

export type CartItem = {
    id: string;
    name: string;
    price: number;
    image: string;
    note: string;
    badge: string;
    size: string;
    qty: number;
};

export function parsePrice(value: string): number {
    const amount = Number(value.replace(/[^0-9.]/g, ""));
    return Number.isFinite(amount) ? amount : 0;
}

export function getStoredCart(): CartItem[] {
    if (typeof window === "undefined") {
        return [];
    }

    try {
        const raw = window.localStorage.getItem(CART_STORAGE_KEY);
        if (!raw) {
            return [];
        }

        const parsed = JSON.parse(raw) as CartItem[];
        if (!Array.isArray(parsed)) {
            return [];
        }

        return parsed;
    } catch {
        return [];
    }
}

export function setStoredCart(items: CartItem[]) {
    if (typeof window === "undefined") {
        return;
    }

    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    window.dispatchEvent(new CustomEvent(CART_UPDATED_EVENT));
}

export function addItemToCart(item: CartItem) {
    const cart = getStoredCart();
    const existing = cart.find(
        (entry) => entry.id === item.id && entry.size === item.size,
    );

    if (existing) {
        existing.qty += item.qty;
    } else {
        cart.push(item);
    }

    setStoredCart(cart);
}
