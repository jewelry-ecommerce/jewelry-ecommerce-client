import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const postMock = vi.fn();

vi.mock("@/utils/axios", () => ({
  commonAxios: {
    post: (...args: unknown[]) => postMock(...args),
  },
}));

const { discoverPromotionVouchers, validatePromotionVoucherCode } = await import("./promotion.api");
const { setGuestCartId, clearGuestCartId } = await import("../cart/guest-cart-id.util");

describe("promotion.api OMS checkout voucher routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    postMock.mockResolvedValue({ data: { sections: [] } });
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("calls OMS discover with empty body and x-guest-id", async () => {
    setGuestCartId("guest-123");

    await discoverPromotionVouchers("session-1");

    expect(postMock).toHaveBeenCalledWith(
      "order/checkout/session-1/promotion-vouchers/discover",
      {},
      { headers: { "x-guest-id": "guest-123" } },
    );
  });

  it("calls OMS validate-code with code and x-guest-id", async () => {
    setGuestCartId("guest-456");
    postMock.mockResolvedValue({ data: { valid: false, message: "invalid" } });

    await validatePromotionVoucherCode("session-1", "SAVE10");

    expect(postMock).toHaveBeenCalledWith(
      "order/checkout/session-1/promotion-vouchers/validate-code",
      { code: "SAVE10" },
      { headers: { "x-guest-id": "guest-456" } },
    );
    clearGuestCartId();
  });
});
