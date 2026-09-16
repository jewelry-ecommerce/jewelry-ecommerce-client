import { beforeEach, describe, expect, it } from "vitest";
import {
  ORDER_DETAIL_BASE_PATH,
  buildOrderDetailNavigation,
  buildOrderDetailPath,
  persistOrderDetailContext,
  readOrderDetailContext,
} from "./order-detail-context.util";

describe("order-detail-context.util", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it("builds clean order detail path without order code", () => {
    expect(buildOrderDetailPath()).toBe(ORDER_DETAIL_BASE_PATH);
    expect(buildOrderDetailPath({ source: "tracking", from: "list" })).toBe(`${ORDER_DETAIL_BASE_PATH}?source=tracking&from=list`);
  });

  it("persists and reads order detail context", () => {
    persistOrderDetailContext({
      orderCode: "SV_26ABC123",
      source: "tracking",
      trackingPhone: "0901234567",
    });

    expect(readOrderDetailContext()).toEqual({
      orderCode: "SV_26ABC123",
      source: "tracking",
      trackingPhone: "0901234567",
    });
  });

  it("buildOrderDetailNavigation persists context and returns clean href", () => {
    const href = buildOrderDetailNavigation(
      { orderCode: "SV_26ABC123", source: "tracking", trackingPhone: "0901234567" },
      { from: "list" },
    );

    expect(href).toBe(`${ORDER_DETAIL_BASE_PATH}?source=tracking&from=list`);
    expect(readOrderDetailContext()?.orderCode).toBe("SV_26ABC123");
    expect(readOrderDetailContext()?.trackingPhone).toBe("0901234567");
  });
});
