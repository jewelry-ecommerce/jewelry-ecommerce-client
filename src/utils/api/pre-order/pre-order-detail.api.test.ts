import { beforeEach, describe, expect, it, vi } from "vitest";

const postMock = vi.fn();
const getMock = vi.fn();
const putMock = vi.fn();

vi.mock("@/utils/axios", () => ({
  commonAxios: {
    get: (...args: unknown[]) => getMock(...args),
    post: (...args: unknown[]) => postMock(...args),
    put: (...args: unknown[]) => putMock(...args),
  },
}));

const {
  cancelPreOrder,
  getPreOrderDetailByOrderCode,
  payPreOrder,
  resolvePreOrderAccess,
  updatePreOrderShippingAddress,
  updatePreOrderSpecialRequests,
} = await import("./pre-order-detail.api");

describe("pre-order-detail.api", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.sessionStorage.clear();
  });

  it("loads pre-order detail by order code", async () => {
    getMock.mockResolvedValue({ data: { orderCode: "123123" } });

    await getPreOrderDetailByOrderCode("123123");

    expect(getMock).toHaveBeenCalledWith("order/pre-orders/client/123123", undefined);
  });

  it("resolves guest pre-order access by token", async () => {
    postMock.mockResolvedValue({
      data: { orderCode: "PO_001", accessExpiresAt: "2026-08-05T00:00:00.000Z" },
    });

    const result = await resolvePreOrderAccess("gpa_v1.opaque-value");

    expect(postMock).toHaveBeenCalledWith("order/pre-orders/access", { token: "gpa_v1.opaque-value" });
    expect(result.orderCode).toBe("PO_001");
  });

  it("cancels pre-order with reason payload", async () => {
    postMock.mockResolvedValue({ data: undefined });

    await cancelPreOrder("123123", { reason: "Đổi ý, không muốn mua nữa" });

    expect(postMock).toHaveBeenCalledWith("order/pre-orders/client/123123/cancel", { reason: "Đổi ý, không muốn mua nữa" }, undefined);
  });

  it("updates shipping address before payment", async () => {
    putMock.mockResolvedValue({ data: { orderCode: "123123123" } });

    await updatePreOrderShippingAddress("123123123", {
      shippingAddressSnapshot: {
        lastName: "Nguyễn",
        firstName: "Văn A",
        receiverPhone: "0901234567",
        wardCode: 25,
        wardName: "Phường Bến Nghé",
        addressLine: "123 Nguyễn Huệ",
        provinceCode: 0,
        provinceName: "string",
      },
      shippingMethod: "Express",
      shippingCarrier: "GHN",
      carrierServiceId: 0,
    });

    expect(putMock).toHaveBeenCalledWith(
      "order/pre-orders/client/123123123/shipping-address",
      {
        shippingAddressSnapshot: {
          lastName: "Nguyễn",
          firstName: "Văn A",
          receiverPhone: "0901234567",
          wardCode: 25,
          wardName: "Phường Bến Nghé",
          addressLine: "123 Nguyễn Huệ",
          provinceCode: 0,
          provinceName: "string",
        },
        shippingMethod: "Express",
        shippingCarrier: "GHN",
        carrierServiceId: 0,
      },
      undefined,
    );
  });

  it("updates special requests before payment", async () => {
    putMock.mockResolvedValue({ data: undefined });

    await updatePreOrderSpecialRequests("123123", {
      note: "string",
      vatInvoice: {
        companyName: "Công ty TNHH ABC",
        companyAddress: "123 Nguyễn Huệ, Quận 1, TP.HCM",
        taxCode: "0312345678",
        email: "ketoan@abc.vn",
      },
    });

    expect(putMock).toHaveBeenCalledWith(
      "order/pre-orders/client/123123/special-requests",
      {
        note: "string",
        vatInvoice: {
          companyName: "Công ty TNHH ABC",
          companyAddress: "123 Nguyễn Huệ, Quận 1, TP.HCM",
          taxCode: "0312345678",
          email: "ketoan@abc.vn",
        },
      },
      undefined,
    );
  });

  it("pays pre-order with payment method and returnUrl", async () => {
    postMock.mockResolvedValue({
      data: { orderCode: "234234234", paymentMethod: "COD" },
    });

    const result = await payPreOrder("234234234", {
      paymentMethod: "COD",
      returnUrl: "https://www.sevago.com.vn/payment-return",
    });

    expect(postMock).toHaveBeenCalledWith(
      "order/pre-orders/client/234234234/pay",
      {
        paymentMethod: "COD",
        returnUrl: "https://www.sevago.com.vn/payment-return",
      },
      undefined,
    );
    expect(result.paymentMethod).toBe("COD");
  });

  it("sends x-pre-order-access-token on pay when guest gpa token is stored", async () => {
    window.sessionStorage.setItem(
      "latest_order",
      JSON.stringify({ guestOrderAccessToken: "gpa_v1.yXITMqdAUsv4ogyhLlqdL9f1b43rhMZUBq7axZkiC44" }),
    );
    postMock.mockResolvedValue({
      data: { orderCode: "PO_SEVARETAILB1_26AVDW96", paymentMethod: "QR_CODE" },
    });

    await payPreOrder("PO_SEVARETAILB1_26AVDW96", {
      paymentMethod: "QR_CODE",
      returnUrl: "https://b1-test.sevagoretail.jewelry/trang-thai-thanh-toan",
    });

    expect(postMock).toHaveBeenCalledWith(
      "order/pre-orders/client/PO_SEVARETAILB1_26AVDW96/pay",
      {
        paymentMethod: "QR_CODE",
        returnUrl: "https://b1-test.sevagoretail.jewelry/trang-thai-thanh-toan",
      },
      {
        headers: {
          "x-pre-order-access-token": "gpa_v1.yXITMqdAUsv4ogyhLlqdL9f1b43rhMZUBq7axZkiC44",
        },
      },
    );
  });
});
