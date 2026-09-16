import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const postMock = vi.fn();
const getMock = vi.fn();

vi.mock("@/utils/axios", () => ({
  authAxios: {
    get: (...args: unknown[]) => getMock(...args),
    post: (...args: unknown[]) => postMock(...args),
  },
}));

const { getCartRecommendations, mergeCart, postCart } = await import("./cart.api");
const { getGuestCartId, GUEST_CART_ID_STORAGE_KEY, setGuestCartId } = await import("./guest-cart-id.util");

describe("cart.api guestId persistence", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("postCart persists guestId from response", async () => {
    postMock.mockResolvedValue({
      data: {
        guestId: "guest-from-post",
        success: true,
        items: [],
      },
    });

    const response = await postCart({ items: [{ variationId: "v-1", quantity: 1 }] });

    expect(response.guestId).toBe("guest-from-post");
    expect(localStorage.getItem(GUEST_CART_ID_STORAGE_KEY)).toBe("guest-from-post");
    expect(getGuestCartId()).toBe("guest-from-post");
  });

  it("mergeCart persists guestId from response", async () => {
    localStorage.setItem(GUEST_CART_ID_STORAGE_KEY, "guest-old");
    postMock.mockResolvedValue({
      data: {
        guestId: "guest-from-merge",
        success: true,
        items: [],
      },
    });

    await mergeCart({ headers: { "x-guest-id": "guest-stale" } });

    expect(postMock).toHaveBeenCalledWith("cart/cart/merge", {}, { headers: { "x-guest-id": "guest-old" } });
    expect(getGuestCartId()).toBe("guest-from-merge");
  });

  it("getCart persists guestId when response is an envelope", async () => {
    getMock.mockResolvedValue({
      data: {
        guestId: "guest-from-get",
        success: true,
        items: [{ id: "v-1", quantity: 1 }],
      },
    });

    const { getCart } = await import("./cart.api");
    const items = await getCart();

    expect(items).toHaveLength(1);
    expect(getGuestCartId()).toBe("guest-from-get");
  });

  it("does not overwrite guest id when response omits guestId", async () => {
    setGuestCartId("guest-existing");
    postMock.mockResolvedValue({
      data: {
        success: true,
        items: [],
      },
    });

    await postCart({ items: [{ variationId: "v-1", quantity: 1 }] });

    expect(getGuestCartId()).toBe("guest-existing");
  });

  it("requests a bounded recommendation page and returns the paginated envelope", async () => {
    const response = {
      total: 12,
      list: [{ id: "recommendation-1" }],
      pagination: {
        total: 12,
        currentPage: 1,
        nextPage: 2,
        previousPage: false,
        hasNextPage: true,
        hasPreviousPage: false,
        totalPage: 2,
      },
    };
    getMock.mockResolvedValue({ data: response });

    await expect(getCartRecommendations(undefined, { page: 1, take: 10 })).resolves.toBe(response);
    expect(getMock).toHaveBeenCalledWith("cart/cart/recommendation", {
      params: { page: 1, take: 10 },
    });
  });

  it("postCart clears stale guest id on 403 and retries without x-guest-id", async () => {
    setGuestCartId("stale-guest");
    postMock
      .mockRejectedValueOnce({
        response: {
          status: 403,
          data: { message: "Không có quyền truy cập giỏ hàng guest này" },
        },
      })
      .mockResolvedValueOnce({
        data: {
          guestId: "guest-fresh",
          success: true,
          items: [],
        },
      });

    const response = await postCart({ items: [{ variationId: "v-1", quantity: 1 }] });

    expect(postMock).toHaveBeenCalledTimes(2);
    expect(postMock.mock.calls[0][2]).toEqual({ headers: { "x-guest-id": "stale-guest" } });
    expect(postMock.mock.calls[1][2]).toEqual({});
    expect(response.guestId).toBe("guest-fresh");
    expect(getGuestCartId()).toBe("guest-fresh");
  });
});
