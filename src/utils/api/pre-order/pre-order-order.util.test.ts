import { describe, expect, it } from "vitest";
import {
  getPreOrderDetailLookupCode,
  getPreOrderDisplayLabel,
  getPreOrderDisplayState,
  getPreOrderListDisplayCode,
  getPreOrderStatusInfo,
  isConvertedOrderStatus,
  isPreOrderOrder,
  isPreOrderVisibleInHistoryTab,
  isTerminalPreOrderStatus,
  normalizePreOrderStatus,
  PreOrderStatusCode,
} from "./pre-order-order.util";

describe("pre-order-order.util", () => {
  it("maps BE PreOrderStatusLabel values", () => {
    expect(getPreOrderDisplayLabel(PreOrderStatusCode.DRAFT)).toBe("Nháp");
    expect(getPreOrderDisplayLabel(PreOrderStatusCode.PRE_ORDERED)).toBe("Đặt trước");
    // BR-03: Đã có hàng / ZNS lỗi vẫn hiển thị "Đặt trước" với khách
    expect(getPreOrderDisplayLabel(PreOrderStatusCode.STOCK_AVAILABLE)).toBe("Đặt trước");
    expect(getPreOrderDisplayLabel(PreOrderStatusCode.ZNS_FAILED)).toBe("Đặt trước");
    expect(getPreOrderDisplayLabel(PreOrderStatusCode.AWAITING_PAYMENT)).toBe("Chờ thanh toán");
    expect(getPreOrderDisplayLabel(PreOrderStatusCode.CONVERTED)).toBe("Đã đặt hàng");
    expect(getPreOrderDisplayLabel(PreOrderStatusCode.CANCELLED)).toBe("Đã hủy");
    expect(getPreOrderDisplayLabel(PreOrderStatusCode.EXPIRED)).toBe("Hết hạn");
  });

  it("uses shared amber badge colors for pre-order and awaiting payment", () => {
    expect(getPreOrderStatusInfo(PreOrderStatusCode.PRE_ORDERED)).toMatchObject({
      bg: "#FEF3C7",
      color: "#B45309",
    });
    expect(getPreOrderStatusInfo(PreOrderStatusCode.AWAITING_PAYMENT)).toMatchObject({
      bg: "#FEF3C7",
      color: "#B45309",
    });
    expect(getPreOrderStatusInfo(PreOrderStatusCode.STOCK_AVAILABLE)).toMatchObject({
      bg: "#FEF3C7",
      color: "#B45309",
    });
  });

  it("normalizes SCREAMING_SNAKE and STOCK_READY alias from list API", () => {
    expect(normalizePreOrderStatus("STOCK_READY")).toBe(PreOrderStatusCode.STOCK_AVAILABLE);
    expect(normalizePreOrderStatus("AWAITING_PAYMENT")).toBe(PreOrderStatusCode.AWAITING_PAYMENT);
    expect(normalizePreOrderStatus("StockAvailable")).toBe(PreOrderStatusCode.STOCK_AVAILABLE);
    expect(getPreOrderStatusInfo("STOCK_READY").label).toBe("Đặt trước");
    expect(getPreOrderStatusInfo("AWAITING_PAYMENT").label).toBe("Chờ thanh toán");
    expect(
      getPreOrderDisplayState({
        fulfillmentType: "PRE_ORDER",
        preOrderStatus: "STOCK_READY",
      }).actionTypes,
    ).toEqual(["CANCEL"]);
    expect(
      getPreOrderDisplayState({
        fulfillmentType: "PRE_ORDER",
        preOrderStatus: "AWAITING_PAYMENT",
        paymentHoldExpiresAt: new Date(Date.now() + 60_000).toISOString(),
      }).actionTypes,
    ).toEqual(["CANCEL", "PAYMENT"]);
  });

  it("prefers preOrderCode for history list display", () => {
    expect(
      getPreOrderListDisplayCode({
        preOrderCode: "PO_SEVARETAILB1_26ZJP9OE",
        orderCode: "SEVARETAILB1_26ZJP9OE",
      }),
    ).toBe("PO_SEVARETAILB1_26ZJP9OE");
    expect(getPreOrderListDisplayCode({ orderCode: "SEVARETAILB1_26ZJP9OE" })).toBe("SEVARETAILB1_26ZJP9OE");
  });

  it("prefers orderCode for detail API lookup and falls back to preOrderCode", () => {
    expect(
      getPreOrderDetailLookupCode({
        orderCode: "SEVARETAILB1_26ZJP9OE",
        preOrderCode: "PO_SEVARETAILB1_26ZJP9OE",
      }),
    ).toBe("SEVARETAILB1_26ZJP9OE");
    expect(getPreOrderDetailLookupCode({ preOrderCode: "PO_SEVARETAILB1_26ZJP9OE" })).toBe("PO_SEVARETAILB1_26ZJP9OE");
    expect(getPreOrderDetailLookupCode({ orderCode: "", preOrderCode: null })).toBe("");
  });

  it("shows cancel only while pre-ordered / zns failed", () => {
    expect(
      getPreOrderDisplayState({
        fulfillmentType: "PRE_ORDER",
        preOrderStatus: PreOrderStatusCode.PRE_ORDERED,
      }).actionTypes,
    ).toEqual(["CANCEL"]);
    expect(
      getPreOrderDisplayState({
        fulfillmentType: "PRE_ORDER",
        preOrderStatus: PreOrderStatusCode.ZNS_FAILED,
      }).actionTypes,
    ).toEqual(["CANCEL"]);
  });

  it("shows cancel only when stock is available — payment only on AwaitingPayment", () => {
    expect(
      getPreOrderDisplayState({
        fulfillmentType: "PRE_ORDER",
        preOrderStatus: PreOrderStatusCode.STOCK_AVAILABLE,
      }).actionTypes,
    ).toEqual(["CANCEL"]);
    expect(getPreOrderStatusInfo(PreOrderStatusCode.STOCK_AVAILABLE).label).toBe("Đặt trước");
  });

  it("shows payment + cancel with HH:mm:ss countdown when awaiting payment", () => {
    const state = getPreOrderDisplayState(
      {
        fulfillmentType: "PRE_ORDER",
        preOrderStatus: PreOrderStatusCode.AWAITING_PAYMENT,
        paymentHoldExpiresAt: new Date(Date.now() + 90 * 60 * 1000).toISOString(),
      },
      Date.now(),
    );
    expect(state.actionTypes).toEqual(["CANCEL", "PAYMENT"]);
    expect(state.paymentCountdownLabel).toMatch(/^\d{2}:\d{2}:\d{2}$/);
    expect(state.isPaymentActionDisabled).toBe(false);
  });

  it("disables payment and marks expired when hold ends", () => {
    const state = getPreOrderDisplayState(
      {
        fulfillmentType: "PRE_ORDER",
        preOrderStatus: PreOrderStatusCode.AWAITING_PAYMENT,
        paymentHoldExpiresAt: new Date(Date.now() - 1000).toISOString(),
      },
      Date.now(),
    );
    expect(state.isPaymentHoldExpired).toBe(true);
    expect(state.isPaymentActionDisabled).toBe(true);
    expect(state.paymentCountdownLabel).toBe("00:00:00");
  });

  it("shows cancel for unknown pre-order status codes", () => {
    const state = getPreOrderDisplayState({
      fulfillmentType: "PRE_ORDER",
      preOrderStatus: "SOME_OMS_CODE",
    });
    expect(state.statusInfo.label).toBe("Đặt trước");
    expect(state.actionTypes).toEqual(["CANCEL"]);
  });

  it("hides actions for terminal statuses and draft", () => {
    expect(isTerminalPreOrderStatus(PreOrderStatusCode.CONVERTED)).toBe(true);
    expect(isTerminalPreOrderStatus(PreOrderStatusCode.CANCELLED)).toBe(true);
    expect(isTerminalPreOrderStatus(PreOrderStatusCode.EXPIRED)).toBe(true);
    expect(
      getPreOrderDisplayState({
        fulfillmentType: "PRE_ORDER",
        preOrderStatus: PreOrderStatusCode.CONVERTED,
      }).actionTypes,
    ).toEqual([]);
    expect(
      getPreOrderDisplayState({
        fulfillmentType: "PRE_ORDER",
        preOrderStatus: PreOrderStatusCode.CANCELLED,
      }).actionTypes,
    ).toEqual([]);
    expect(
      getPreOrderDisplayState({
        fulfillmentType: "PRE_ORDER",
        preOrderStatus: PreOrderStatusCode.EXPIRED,
      }).actionTypes,
    ).toEqual([]);
    expect(
      getPreOrderDisplayState({
        fulfillmentType: "PRE_ORDER",
        preOrderStatus: PreOrderStatusCode.DRAFT,
      }).actionTypes,
    ).toEqual([]);
  });

  it("hides Converted and Draft from history tab", () => {
    expect(isPreOrderVisibleInHistoryTab(PreOrderStatusCode.PRE_ORDERED)).toBe(true);
    expect(isPreOrderVisibleInHistoryTab(PreOrderStatusCode.STOCK_AVAILABLE)).toBe(true);
    expect(isPreOrderVisibleInHistoryTab("STOCK_READY")).toBe(true);
    expect(isPreOrderVisibleInHistoryTab(PreOrderStatusCode.ZNS_FAILED)).toBe(true);
    expect(isPreOrderVisibleInHistoryTab(PreOrderStatusCode.AWAITING_PAYMENT)).toBe(true);
    expect(isPreOrderVisibleInHistoryTab(PreOrderStatusCode.CANCELLED)).toBe(true);
    expect(isPreOrderVisibleInHistoryTab(PreOrderStatusCode.EXPIRED)).toBe(true);
    expect(isPreOrderVisibleInHistoryTab(PreOrderStatusCode.CONVERTED)).toBe(false);
    expect(isPreOrderVisibleInHistoryTab("SUCCESS")).toBe(false);
    expect(isPreOrderVisibleInHistoryTab(PreOrderStatusCode.DRAFT)).toBe(false);
  });

  it("treats Converted/SUCCESS as retail — not active pre-order", () => {
    expect(normalizePreOrderStatus("SUCCESS")).toBe(PreOrderStatusCode.CONVERTED);
    expect(
      isPreOrderOrder({
        fulfillmentType: "PRE_ORDER",
        preOrderStatus: "SUCCESS",
        preOrderCode: "PO_SEVARETAILB1_1",
      }),
    ).toBe(false);
    expect(
      isPreOrderOrder({
        fulfillmentType: "PRE_ORDER",
        preOrderStatus: PreOrderStatusCode.CONVERTED,
        preOrderCode: "PO_SEVARETAILB1_1",
      }),
    ).toBe(false);
    expect(isConvertedOrderStatus(PreOrderStatusCode.CONVERTED)).toBe(true);
    expect(isConvertedOrderStatus("SUCCESS")).toBe(false);
    expect(isConvertedOrderStatus("Picking")).toBe(false);
    expect(getPreOrderStatusInfo(PreOrderStatusCode.CONVERTED).label).toBe("Đã đặt hàng");
    expect(
      getPreOrderDisplayState({
        preOrderStatus: PreOrderStatusCode.CONVERTED,
      }).statusInfo.label,
    ).toBe("Đã đặt hàng");
    expect(
      isPreOrderOrder({
        fulfillmentType: "PRE_ORDER",
        preOrderStatus: PreOrderStatusCode.AWAITING_PAYMENT,
        preOrderCode: "PO_SEVARETAILB1_1",
      }),
    ).toBe(true);
    expect(
      isPreOrderOrder({
        fulfillmentType: "PRE_ORDER",
        preOrderStatus: PreOrderStatusCode.CANCELLED,
        orderCode: "PO_SEVARETAILB1_2",
      }),
    ).toBe(true);
  });

  it("treats retail order spawned from pre-order as retail when PO identity is missing", () => {
    expect(
      isPreOrderOrder({
        orderCode: "SEVARETAILB1_26W8YLWZ",
        fulfillmentType: "PRE_ORDER",
        preOrderStatus: PreOrderStatusCode.AWAITING_PAYMENT,
      }),
    ).toBe(false);
    expect(
      isPreOrderOrder({
        orderCode: "SEVARETAILB1_26W8YLWZ",
        preOrderCode: "PO_SEVARETAILB1_26W8YLWZ",
        fulfillmentType: "PRE_ORDER",
        preOrderStatus: PreOrderStatusCode.AWAITING_PAYMENT,
      }),
    ).toBe(true);
    expect(
      isPreOrderOrder({
        orderCode: "PO_SEVARETAILB1_26W8YLWZ",
        fulfillmentType: "PRE_ORDER",
        preOrderStatus: PreOrderStatusCode.PRE_ORDERED,
      }),
    ).toBe(true);
  });
});
