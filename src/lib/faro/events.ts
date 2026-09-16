export const FARO_EVENTS = {
  cartSyncError: "cart_sync_error",
  checkoutSyncFailed: "checkout_sync_failed",
  chunkLoadRecovered: "chunk_load_recovered",
} as const;

export type FaroEventName = (typeof FARO_EVENTS)[keyof typeof FARO_EVENTS];
