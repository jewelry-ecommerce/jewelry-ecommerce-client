import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GUEST_CART_ID_STORAGE_KEY } from "./guest-cart-id.util";
import { captureUtmFromQueryString, clearStoredUtmData, resetUtmStorageStateForTests } from "@/utils/utm/utm.util";

const postCartMock = vi.fn();
const getCartMock = vi.fn();
const syncCartFromServerMock = vi.fn();
const syncCartFromServerRejectedMatcher = {
  match: (action: { type?: string } | undefined) => action?.type === "cart/sync/rejected",
};

vi.mock("@/utils/api", () => ({
  CartApi: {
    postCart: (...args: unknown[]) => postCartMock(...args),
  },
}));

vi.mock("@/redux/slices/cart.slice", () => ({
  syncCartFromServer: Object.assign((...args: unknown[]) => syncCartFromServerMock(...args), {
    rejected: syncCartFromServerRejectedMatcher,
  }),
}));

const { persistCartLines } = await import("./cart-mutation.util");

describe("persistCartLines", () => {
  const dispatch = vi.fn((action: unknown) => {
    if (typeof action === "function") {
      return action(dispatch);
    }
    return action;
  });

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
    clearStoredUtmData();
    resetUtmStorageStateForTests();
    localStorage.clear();
    syncCartFromServerMock.mockReturnValue({ type: "cart/sync" });
    postCartMock.mockResolvedValue({ success: true, items: [{ id: "v-1" }] });
  });

  afterEach(() => {
    clearStoredUtmData();
    resetUtmStorageStateForTests();
    localStorage.clear();
  });

  it("attaches stored utm_data when persisting active cart lines", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-19T07:00:00.000Z"));
    captureUtmFromQueryString("?utm_source=facebook&utm_medium=cpc&utm_campaign=summer_sale");

    await persistCartLines(dispatch as never, [{ variationId: "v-1", quantity: 1 }]);

    expect(postCartMock).toHaveBeenCalledWith(
      {
        items: [
          {
            variationId: "v-1",
            quantity: 1,
            utm_data: {
              utm_source: "facebook",
              utm_medium: "cpc",
              utm_campaign: "summer_sale",
              utm_term: null,
              utm_content: null,
              utm_click_time: "2026-06-19T07:00:00.000Z",
            },
          },
        ],
      },
      undefined,
    );
  });

  it("returns empty-lines when no lines provided", async () => {
    const result = await persistCartLines(dispatch as never, []);

    expect(result).toEqual({ success: false, reason: "empty-lines" });
    expect(postCartMock).not.toHaveBeenCalled();
  });

  it("POSTs lines then syncs cart from server on success", async () => {
    const options = { skipAuthLogout: true };
    const lines = [{ variationId: "v-1", quantity: 3 }];

    const result = await persistCartLines(dispatch as never, lines, options);

    expect(result.success).toBe(true);
    expect(postCartMock).toHaveBeenCalledWith({ items: [{ variationId: "v-1", quantity: 3, utm_data: null }] }, options);
    expect(syncCartFromServerMock).toHaveBeenCalledWith({ ...options, syncGeneration: 0 });
    expect(dispatch).toHaveBeenCalled();
  });

  it("syncs with updated guest id after postCart returns a new guestId", async () => {
    localStorage.setItem(GUEST_CART_ID_STORAGE_KEY, "guest-old");
    const options = {
      skipAuthLogout: true,
      headers: { "x-guest-id": "guest-old" },
    };

    postCartMock.mockImplementation(async () => {
      localStorage.setItem(GUEST_CART_ID_STORAGE_KEY, "guest-new");
      return { success: true, guestId: "guest-new", items: [] };
    });

    await persistCartLines(dispatch as never, [{ variationId: "v-1", quantity: 1 }], options);

    expect(syncCartFromServerMock).toHaveBeenCalledWith({
      skipAuthLogout: true,
      headers: { "x-guest-id": "guest-new" },
      syncGeneration: 0,
    });
  });

  it("returns api-failed when POST is unsuccessful", async () => {
    postCartMock.mockResolvedValue({ success: false, reason: "stock-exceeded", items: [] });

    const result = await persistCartLines(dispatch as never, [{ variationId: "v-1", quantity: 1 }]);

    expect(result).toEqual({ success: false, reason: "stock-exceeded" });
    expect(syncCartFromServerMock).not.toHaveBeenCalled();
  });

  it("treats intentional cart sync abort as success after POST", async () => {
    const { syncCartFromServer: syncThunk } =
      await vi.importActual<typeof import("@/redux/slices/cart.slice")>("@/redux/slices/cart.slice");
    const postResponse = { success: true, items: [{ id: "v-1" }] };
    postCartMock.mockResolvedValue(postResponse);

    syncCartFromServerMock.mockResolvedValue(syncThunk.rejected(new DOMException("Aborted", "AbortError"), "req-1", undefined, true));

    const result = await persistCartLines(dispatch as never, [{ variationId: "v-1", quantity: 1 }]);

    expect(result).toEqual({ success: true, postResponse });
  });

  it("returns error when POST throws", async () => {
    postCartMock.mockRejectedValue(new Error("network"));

    const result = await persistCartLines(dispatch as never, [{ variationId: "v-1", quantity: 1 }]);

    expect(result).toEqual({ success: false, reason: "error", message: "network" });
  });
});
