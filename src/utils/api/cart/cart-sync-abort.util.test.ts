import { afterEach, describe, expect, it } from "vitest";
import {
  abortPendingCartGet,
  createCartGetAbortSignal,
  getCartSyncGeneration,
  invalidatePendingCartSync,
  isCartGetAborted,
  isStaleCartSync,
} from "./cart-sync-abort.util";

describe("cart-sync-abort.util", () => {
  afterEach(() => {
    abortPendingCartGet();
  });

  it("invalidatePendingCartSync aborts GET and bumps generation", () => {
    const signal = createCartGetAbortSignal();
    const generation = invalidatePendingCartSync();

    expect(signal.aborted).toBe(true);
    expect(generation).toBeGreaterThan(0);
    expect(isStaleCartSync(generation - 1)).toBe(true);
    expect(isStaleCartSync(generation)).toBe(false);
  });

  it("abortPendingCartGet aborts the active signal without bumping generation", () => {
    const before = getCartSyncGeneration();
    const signal = createCartGetAbortSignal();

    abortPendingCartGet();

    expect(signal.aborted).toBe(true);
    expect(getCartSyncGeneration()).toBe(before);
  });

  it("isCartGetAborted detects AbortError", () => {
    expect(isCartGetAborted(new DOMException("Aborted", "AbortError"))).toBe(true);
    expect(isCartGetAborted({ name: "AbortError", message: "Aborted" })).toBe(true);
    expect(isCartGetAborted({ code: "ERR_CANCELED", message: "canceled" })).toBe(true);
    expect(isCartGetAborted(new Error("network"))).toBe(false);
  });
});
