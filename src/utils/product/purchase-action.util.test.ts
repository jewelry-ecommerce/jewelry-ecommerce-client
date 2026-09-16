import { describe, expect, it } from "vitest";
import { ProductLifecycleStatus, ProductPurchaseActionCode, ProductStockStatus } from "@/utils/api/product/product.enum";
import {
  canAddToCartFromPurchaseAction,
  isNotifyPurchaseAction,
  resolveProductExpectedStockDate,
  resolvePurchaseAction,
} from "./purchase-action.util";

describe("resolvePurchaseAction", () => {
  it("prefers BE purchaseAction when present", () => {
    expect(
      resolvePurchaseAction({
        purchaseAction: { code: ProductPurchaseActionCode.PRE_ORDER, label: "Đặt ngay", enabled: true },
        stockStatus: ProductStockStatus.OUT_OF_STOCK,
      }),
    ).toEqual({
      code: ProductPurchaseActionCode.PRE_ORDER,
      label: "Đặt ngay",
      enabled: true,
    });
  });

  it("falls back to notify when out of stock", () => {
    expect(resolvePurchaseAction({ stockStatus: ProductStockStatus.OUT_OF_STOCK })).toEqual({
      code: ProductPurchaseActionCode.NOTIFY_ME,
      label: "Liên hệ khi có hàng",
      enabled: true,
    });
  });

  it("falls back to pre-order when out of stock but campaign id is present", () => {
    expect(
      resolvePurchaseAction({
        stockStatus: ProductStockStatus.OUT_OF_STOCK,
        preOrderCampaignId: "campaign-1",
      }),
    ).toEqual({
      code: ProductPurchaseActionCode.PRE_ORDER,
      label: "Đặt trước",
      enabled: true,
    });
  });

  it("falls back to buy now when in stock", () => {
    expect(resolvePurchaseAction({ stockStatus: ProductStockStatus.IN_STOCK })).toEqual({
      code: ProductPurchaseActionCode.BUY_NOW,
      label: "Mua ngay",
      enabled: true,
    });
  });

  it("falls back to disabled when discontinued", () => {
    expect(resolvePurchaseAction({ productStatus: ProductLifecycleStatus.DISCONTINUED })).toEqual({
      code: ProductPurchaseActionCode.DISABLED,
      label: "Ngừng kinh doanh",
      enabled: false,
    });
  });
});

describe("purchase action helpers", () => {
  it("allows add to cart for buy now and pre order", () => {
    expect(canAddToCartFromPurchaseAction({ code: ProductPurchaseActionCode.BUY_NOW, label: "Mua ngay", enabled: true })).toBe(true);
    expect(canAddToCartFromPurchaseAction({ code: ProductPurchaseActionCode.PRE_ORDER, label: "Đặt ngay", enabled: true })).toBe(true);
    expect(canAddToCartFromPurchaseAction({ code: ProductPurchaseActionCode.NOTIFY_ME, label: "Liên hệ khi có hàng", enabled: true })).toBe(
      false,
    );
  });

  it("detects notify action", () => {
    expect(isNotifyPurchaseAction({ code: ProductPurchaseActionCode.NOTIFY_ME, label: "Liên hệ", enabled: true })).toBe(true);
  });
});

describe("resolveProductExpectedStockDate", () => {
  it("formats ISO expectedStockAt on the selected variation", () => {
    expect(resolveProductExpectedStockDate({ expectedStockAt: "2026-09-05T00:00:00+07:00" })).toBe("05/09/2026");
  });

  it("falls back to default variant when selected variation has no date", () => {
    expect(resolveProductExpectedStockDate({ expectedStockAt: null }, { expectedStockAt: "2026-09-05" })).toBe("05/09/2026");
  });
});
