import { describe, expect, it } from "vitest";
import type { PromotionVoucherCard } from "@/utils/api/promotion/promotion.interface";
import { PromotionVoucherDisabledReason, PromotionVoucherSchemaType, PromotionVoucherStatus } from "@/utils/api/promotion/promotion.enum";
import { PromotionVoucherGroupType } from "@/utils/api/promotion/promotion.enum";
import type { PromotionVoucherSection } from "@/utils/api/promotion/promotion.interface";
import {
  DEFAULT_MAX_SELECTED_CART_VOUCHERS,
  addOrReplaceVoucher,
  getCheckoutDisplayVoucherItems,
  isHiddenCheckoutVoucherSection,
  mapVoucherCardToItem,
  resolveVoucherReasonText,
  serializePromotionVoucherCheckoutContext,
  toggleVoucher,
} from "./checkout-voucher.mapper";

const makeCard = (voucherCodeId: string, code: string): PromotionVoucherCard =>
  ({
    voucherCodeId,
    promotionId: "promotion-1",
    promotionSchemaId: "schema-1",
    promotionName: "Promotion 1",
    schemaType: PromotionVoucherSchemaType.MARKDOWN,
    code,
    codeMask: code,
    image: "/image/voucher-placeholder.png",
    status: PromotionVoucherStatus.ACTIVE,
    title: code,
    subtitle: "",
    conditionSummary: "",
    benefitSummary: "",
    startsAt: new Date("2026-06-26T00:00:00.000Z").toISOString(),
    endsAt: new Date("2026-06-27T00:00:00.000Z").toISOString(),
    disabled: false,
    reasonCodes: ["PROMOTION_VOUCHER_VALID"],
  }) as unknown as PromotionVoucherCard;

describe("checkout-voucher.mapper selection policy", () => {
  it("caps cart voucher selection at one by default", () => {
    const first = makeCard("voucher-1", "SAVE50");
    const second = makeCard("voucher-2", "SAVE20");

    const selectedFirst = toggleVoucher([], first, DEFAULT_MAX_SELECTED_CART_VOUCHERS);
    expect(selectedFirst).toHaveLength(1);
    expect(selectedFirst[0].code).toBe("SAVE50");

    const selectedSecond = toggleVoucher(selectedFirst, second, DEFAULT_MAX_SELECTED_CART_VOUCHERS);
    expect(selectedSecond).toHaveLength(1);
    expect(selectedSecond[0].code).toBe("SAVE50");

    const replaced = addOrReplaceVoucher(selectedFirst, second, DEFAULT_MAX_SELECTED_CART_VOUCHERS);
    expect(replaced).toHaveLength(1);
    expect(replaced[0].code).toBe("SAVE50");
  });

  it("renders a deterministic disabled reason label with stable fallback", () => {
    const disabledCard = {
      ...makeCard("voucher-3", "SAVE0"),
      disabled: true,
      disabledReason: PromotionVoucherDisabledReason.PROMOTION_VOUCHER_AUDIENCE_NOT_ELIGIBLE,
      reasonCodes: ["PROMOTION_VOUCHER_AUDIENCE_NOT_ELIGIBLE"],
    } as unknown as PromotionVoucherCard;

    expect(mapVoucherCardToItem(disabledCard).subtitle).toBe("Bạn chưa thuộc nhóm khách hàng áp dụng.");
    expect(resolveVoucherReasonText("PROMOTION_VOUCHER_UNKNOWN")).toBe("PROMOTION_VOUCHER_UNKNOWN");
  });

  it("hides day-181 voucher section and flattens remaining vouchers without section titles", () => {
    const hiddenSection: PromotionVoucherSection = {
      groupType: PromotionVoucherGroupType.PROMOTION,
      groupKey: "day-181",
      title: "NGÀY THỨ 181 TRONG NĂM",
      subtitle: "Giảm 50%",
      items: [makeCard("voucher-hidden", "DAY181")],
    };
    const visibleSection: PromotionVoucherSection = {
      groupType: PromotionVoucherGroupType.PROMOTION,
      groupKey: "markdown",
      title: "VOUCHER 19%",
      subtitle: "",
      items: [makeCard("voucher-visible", "SAVE19")],
    };

    expect(isHiddenCheckoutVoucherSection(hiddenSection)).toBe(true);
    expect(isHiddenCheckoutVoucherSection(visibleSection)).toBe(false);

    const displayItems = getCheckoutDisplayVoucherItems([hiddenSection, visibleSection]);
    expect(displayItems).toHaveLength(1);
    expect(displayItems[0].voucherCodeId).toBe("voucher-visible");
  });

  it("serializes checkout context with stable coupon code ordering", () => {
    const first = serializePromotionVoucherCheckoutContext({
      cart: { checkoutSessionId: "session-1" },
      couponCodes: ["B", "A"],
      lines: [],
    });
    const second = serializePromotionVoucherCheckoutContext({
      cart: { checkoutSessionId: "session-1" },
      couponCodes: ["a", "b"],
      lines: [],
    });

    expect(first).toBe(second);
  });
});
