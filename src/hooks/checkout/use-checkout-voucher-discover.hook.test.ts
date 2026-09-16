import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { useCheckoutVoucherDiscover } from "./use-checkout-voucher-discover.hook";
import { PromotionApi } from "@/utils/api";
import { PromotionVoucherGroupType, PromotionVoucherSchemaType, PromotionVoucherStatus } from "@/utils/api/promotion/promotion.enum";
import type { PromotionVoucherCheckoutContext, PromotionVoucherSection } from "@/utils/api/promotion/promotion.interface";

vi.mock("@/utils/api", () => ({
  PromotionApi: {
    discoverPromotionVouchers: vi.fn(),
  },
}));

const mockSections: PromotionVoucherSection[] = [
  {
    groupType: PromotionVoucherGroupType.PROMOTION,
    groupKey: "markdown",
    title: "VOUCHER 19%",
    subtitle: "",
    items: [
      {
        voucherCodeId: "voucher-1",
        promotionId: "promo-1",
        promotionSchemaId: "schema-1",
        promotionName: "Promo",
        schemaType: PromotionVoucherSchemaType.MARKDOWN,
        code: "SAVE19",
        codeMask: "SA***19",
        image: "",
        status: PromotionVoucherStatus.ACTIVE,
        title: "Giảm 19%",
        subtitle: "",
        conditionSummary: "",
        benefitSummary: "",
        startsAt: "2026-01-01T00:00:00.000Z",
        endsAt: "2026-12-31T00:00:00.000Z",
        disabled: false,
        reasonCodes: [],
      },
    ],
  },
];

const baseContext: PromotionVoucherCheckoutContext = {
  cart: { checkoutSessionId: "session-1" },
  couponCodes: [],
  lines: [],
};

describe("useCheckoutVoucherDiscover", () => {
  beforeEach(() => {
    vi.mocked(PromotionApi.discoverPromotionVouchers).mockReset();
    vi.mocked(PromotionApi.discoverPromotionVouchers).mockResolvedValue({ sections: mockSections });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("loads vouchers on first open", async () => {
    const { result } = renderHook(() => useCheckoutVoucherDiscover(true, baseContext));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.sections).toHaveLength(1);
    });

    expect(PromotionApi.discoverPromotionVouchers).toHaveBeenCalledTimes(1);
  });

  it("does not refetch discover when reopening popup with unchanged context", async () => {
    const { result, rerender } = renderHook(({ isOpen, checkoutContext }) => useCheckoutVoucherDiscover(isOpen, checkoutContext), {
      initialProps: { isOpen: true, checkoutContext: baseContext },
    });

    await waitFor(() => {
      expect(result.current.sections).toHaveLength(1);
    });
    expect(PromotionApi.discoverPromotionVouchers).toHaveBeenCalledTimes(1);

    rerender({ isOpen: false, checkoutContext: baseContext });
    rerender({ isOpen: true, checkoutContext: baseContext });

    await waitFor(() => {
      expect(result.current.sections).toHaveLength(1);
    });

    expect(PromotionApi.discoverPromotionVouchers).toHaveBeenCalledTimes(1);
  });

  it("debounces discover refresh when checkout context changes with cached list", async () => {
    vi.useFakeTimers();

    const { result, rerender } = renderHook(({ checkoutContext }) => useCheckoutVoucherDiscover(true, checkoutContext), {
      initialProps: { checkoutContext: baseContext },
    });

    await act(async () => {
      await vi.runAllTimersAsync();
    });

    expect(result.current.sections).toHaveLength(1);
    expect(PromotionApi.discoverPromotionVouchers).toHaveBeenCalledTimes(1);

    rerender({ checkoutContext: { ...baseContext, couponCodes: ["A"] } });
    rerender({ checkoutContext: { ...baseContext, couponCodes: ["B"] } });
    rerender({ checkoutContext: { ...baseContext, couponCodes: ["C"] } });

    await act(async () => {
      await vi.advanceTimersByTimeAsync(399);
    });
    expect(PromotionApi.discoverPromotionVouchers).toHaveBeenCalledTimes(1);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1);
    });
    expect(PromotionApi.discoverPromotionVouchers).toHaveBeenCalledTimes(2);
  });

  it("does not fetch until checkout session id is available", async () => {
    const initialCheckoutContext: PromotionVoucherCheckoutContext = {
      ...baseContext,
      cart: { checkoutSessionId: null },
    };

    const { result, rerender } = renderHook(
      ({ checkoutContext }: { checkoutContext: PromotionVoucherCheckoutContext }) => useCheckoutVoucherDiscover(true, checkoutContext),
      {
        initialProps: {
          checkoutContext: initialCheckoutContext,
        },
      },
    );

    expect(PromotionApi.discoverPromotionVouchers).toHaveBeenCalledTimes(0);
    expect(result.current.sections).toHaveLength(0);

    rerender({
      checkoutContext: baseContext,
    });

    await waitFor(() => {
      expect(PromotionApi.discoverPromotionVouchers).toHaveBeenCalledTimes(1);
    });

    expect(result.current.sections).toHaveLength(1);
    expect(result.current.isLoading).toBe(false);
  });

  it("waits for pricing-context ready before calling discover", async () => {
    const { result, rerender } = renderHook(
      ({ isPricingContextReady }) => useCheckoutVoucherDiscover(true, baseContext, { isPricingContextReady }),
      { initialProps: { isPricingContextReady: false } },
    );

    expect(PromotionApi.discoverPromotionVouchers).toHaveBeenCalledTimes(0);
    expect(result.current.isLoading).toBe(true);

    rerender({ isPricingContextReady: true });

    await waitFor(() => {
      expect(PromotionApi.discoverPromotionVouchers).toHaveBeenCalledTimes(1);
      expect(result.current.sections).toHaveLength(1);
    });

    expect(result.current.isLoading).toBe(false);
  });

  it("refetches discover after pricing-context becomes ready again", async () => {
    const { result, rerender } = renderHook(
      ({ isPricingContextReady }) => useCheckoutVoucherDiscover(true, baseContext, { isPricingContextReady }),
      { initialProps: { isPricingContextReady: true } },
    );

    await waitFor(() => {
      expect(result.current.sections).toHaveLength(1);
    });
    expect(PromotionApi.discoverPromotionVouchers).toHaveBeenCalledTimes(1);

    rerender({ isPricingContextReady: false });
    expect(PromotionApi.discoverPromotionVouchers).toHaveBeenCalledTimes(1);

    rerender({ isPricingContextReady: true });

    await waitFor(() => {
      expect(PromotionApi.discoverPromotionVouchers).toHaveBeenCalledTimes(2);
    });
  });
});
