import { beforeEach, describe, expect, it, vi } from "vitest";

const authPostMock = vi.fn();
const authGetMock = vi.fn();
const commonPostMock = vi.fn();

vi.mock("@/utils/axios", () => ({
  authAxios: {
    get: (...args: unknown[]) => authGetMock(...args),
    post: (...args: unknown[]) => authPostMock(...args),
  },
  commonAxios: {
    get: vi.fn(),
    post: (...args: unknown[]) => commonPostMock(...args),
    put: vi.fn(),
    delete: vi.fn(),
    patch: vi.fn(),
  },
}));

const { cancelOrder, retryPayment } = await import("./order.api");
const { OrderCancellationReason } = await import("./order.enum");

describe("order.api retryPayment", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
  });

  it("sends the stored guest order access token when retrying as a guest", async () => {
    sessionStorage.setItem("latest_order", JSON.stringify({ guestOrderAccessToken: "goa_v1.secret-value" }));
    authPostMock.mockResolvedValue({
      data: { orderCode: "SV_26ABC123", paymentMethod: "QR_CODE" },
    });

    await retryPayment("SV_26ABC123", {
      paymentMethod: "QR_CODE",
      returnUrl: "https://app.example.com/payment-return",
    });

    expect(authPostMock).toHaveBeenCalledWith(
      "order/orders/SV_26ABC123/retry-payment",
      {
        paymentMethod: "QR_CODE",
        returnUrl: "https://app.example.com/payment-return",
      },
      {
        headers: {
          "x-guest-order-access-token": "goa_v1.secret-value",
        },
      },
    );
  });

  it("does not send the guest token when none is stored", async () => {
    authPostMock.mockResolvedValue({
      data: { orderCode: "SV_26ABC123", paymentMethod: "QR_CODE" },
    });

    await retryPayment("SV_26ABC123", {
      paymentMethod: "QR_CODE",
      returnUrl: "https://app.example.com/payment-return",
    });

    expect(authPostMock).toHaveBeenCalledWith(
      "order/orders/SV_26ABC123/retry-payment",
      {
        paymentMethod: "QR_CODE",
        returnUrl: "https://app.example.com/payment-return",
      },
      undefined,
    );
  });
});

describe("order.api cancelOrder", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
  });

  it("sends the stored guest order access token when cancelling as a guest", async () => {
    sessionStorage.setItem("latest_order", JSON.stringify({ guestOrderAccessToken: "goa_v1.secret-value" }));
    commonPostMock.mockResolvedValue({ data: undefined });

    await cancelOrder("SEVARETAILB1_26SQ61QH", {
      cancellationReason: OrderCancellationReason.CHANGE_MIND,
    });

    expect(commonPostMock).toHaveBeenCalledWith(
      "order/orders/client/SEVARETAILB1_26SQ61QH/cancel",
      { cancellationReason: OrderCancellationReason.CHANGE_MIND },
      {
        headers: {
          "x-guest-order-access-token": "goa_v1.secret-value",
        },
      },
    );
  });

  it("does not send the guest token when none is stored", async () => {
    commonPostMock.mockResolvedValue({ data: undefined });

    await cancelOrder("SEVARETAILB1_26SQ61QH", {
      cancellationReason: OrderCancellationReason.CHANGE_MIND,
    });

    expect(commonPostMock).toHaveBeenCalledWith(
      "order/orders/client/SEVARETAILB1_26SQ61QH/cancel",
      { cancellationReason: OrderCancellationReason.CHANGE_MIND },
      undefined,
    );
  });
});
