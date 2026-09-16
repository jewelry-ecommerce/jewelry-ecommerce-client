import { describe, expect, it } from "vitest";
import { CheckoutRequestLineType, type CheckoutSessionSetItem } from "@/utils/api/checkout/checkout.interface";
import { isStellaVoteEligibleCheckout } from "./checkout-stella-vote.util";

const setLine: CheckoutSessionSetItem = {
  type: CheckoutRequestLineType.SET,
  lineId: "set-line-1",
  setId: "set-1",
  quantity: 1,
  components: [],
};

describe("isStellaVoteEligibleCheckout", () => {
  it("enables the campaign for a HEARTLOCK checkout containing a Set", () => {
    expect(isStellaVoteEligibleCheckout("HEARTLOCK", [setLine])).toBe(true);
  });

  it("excludes MEMORIENT and loose-only checkout sessions", () => {
    expect(isStellaVoteEligibleCheckout("MEMORIENT", [setLine])).toBe(false);
    expect(isStellaVoteEligibleCheckout("HEARTLOCK", [])).toBe(false);
  });
});
