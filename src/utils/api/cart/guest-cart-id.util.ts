export const GUEST_CART_ID_STORAGE_KEY = "guest_cart_id";

export function getGuestCartId(): string | null {
  if (typeof window === "undefined") return null;

  try {
    return localStorage.getItem(GUEST_CART_ID_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setGuestCartId(guestId: string): void {
  if (typeof window === "undefined" || !guestId) return;

  try {
    localStorage.setItem(GUEST_CART_ID_STORAGE_KEY, guestId);
  } catch {
    // ignore quota / private browsing
  }
}

export function clearGuestCartId(): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.removeItem(GUEST_CART_ID_STORAGE_KEY);
  } catch {
    // ignore quota / private browsing
  }
}
