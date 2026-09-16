import { isRequestAborted } from "@/utils/helpers/axios";

let cartSyncAbortController: AbortController | null = null;
let cartSyncGeneration = 0;

export function abortPendingCartGet(): void {
  cartSyncAbortController?.abort();
  cartSyncAbortController = null;
}

/** Abort in-flight GET và bump generation — gọi ngay khi user thay đổi cart (optimistic). */
export function invalidatePendingCartSync(): number {
  abortPendingCartGet();
  cartSyncGeneration += 1;
  return cartSyncGeneration;
}

export function getCartSyncGeneration(): number {
  return cartSyncGeneration;
}

export function isStaleCartSync(generation: number): boolean {
  return generation !== cartSyncGeneration;
}

export function createCartGetAbortSignal(): AbortSignal {
  cartSyncAbortController = new AbortController();
  return cartSyncAbortController.signal;
}

export function isCartGetAborted(error: unknown): boolean {
  return isRequestAborted(error);
}
