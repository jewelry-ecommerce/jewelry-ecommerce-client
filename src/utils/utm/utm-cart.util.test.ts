import { beforeEach, describe, expect, it, vi } from "vitest";

import { buildPostCartLine } from "@/utils/api/cart/cart.util";
import { attachUtmDataToCartLine, attachUtmDataToCartLines } from "./utm-cart.util";
import { captureUtmFromQueryString, resetUtmStorageStateForTests } from "./utm.util";

describe("utm-cart.util", () => {
  beforeEach(() => {
    resetUtmStorageStateForTests();
    localStorage.clear();
    vi.setSystemTime(new Date("2026-06-19T07:00:00.000Z"));
  });

  it("attaches stored utm_data to active cart lines", () => {
    captureUtmFromQueryString("?utm_source=facebook&utm_medium=cpc&utm_campaign=summer_sale");

    expect(
      attachUtmDataToCartLine(
        buildPostCartLine({
          variationId: "var-1",
          quantity: 2,
        }),
      ),
    ).toEqual({
      variationId: "var-1",
      quantity: 2,
      utm_data: {
        utm_source: "facebook",
        utm_medium: "cpc",
        utm_campaign: "summer_sale",
        utm_term: null,
        utm_content: null,
        utm_click_time: "2026-06-19T07:00:00.000Z",
      },
    });
  });

  it("does not attach utm_data when removing a cart line", () => {
    captureUtmFromQueryString("?utm_source=facebook");

    expect(
      attachUtmDataToCartLines([
        buildPostCartLine({ variationId: "var-1", quantity: 0 }),
        buildPostCartLine({ variationId: "var-2", quantity: 1 }),
      ]),
    ).toEqual([
      { variationId: "var-1", quantity: 0 },
      {
        variationId: "var-2",
        quantity: 1,
        utm_data: {
          utm_source: "facebook",
          utm_medium: null,
          utm_campaign: null,
          utm_term: null,
          utm_content: null,
          utm_click_time: "2026-06-19T07:00:00.000Z",
        },
      },
    ]);
  });
});
