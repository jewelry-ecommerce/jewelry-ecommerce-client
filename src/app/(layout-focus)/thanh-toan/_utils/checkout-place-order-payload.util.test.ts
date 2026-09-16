import { describe, expect, it } from "vitest";
import type { CheckoutFormValues } from "../_components/checkout.constant";
import { buildPlaceOrderPayload } from "./checkout-place-order-payload.util";

const formValues: CheckoutFormValues = {
  companyName: "",
  companyAddress: "",
  taxCode: "",
  vatEmail: "",
  note: "",
  paymentMethod: "QR_CODE",
  consent: true,
  isAllowCheck: false,
  consentCollabPartnerSharing: false,
  showVat: false,
  showNote: false,
  lastName: "Nguyen",
  firstName: "An",
  provinceCode: 1,
  provinceName: "Ho Chi Minh",
  wardCode: 1,
  wardName: "Ward 1",
  addressLine: "1 Street",
  receiverPhone: "0900000000",
  email: "",
  saveAddress: false,
};

describe("buildPlaceOrderPayload", () => {
  it("sends the campaign commitment when the checkout rule provides it", () => {
    const payload = buildPlaceOrderPayload({
      values: formValues,
      recaptchaToken: null,
      isLoggedIn: true,
      isAllowCheck: false,
      origin: "https://heartlock.example",
    });

    expect(payload.isAllowCheck).toBe(false);
  });

  it("omits the campaign commitment outside the eligible flow", () => {
    const payload = buildPlaceOrderPayload({
      values: formValues,
      recaptchaToken: null,
      isLoggedIn: true,
      isAllowCheck: undefined,
      origin: "https://memorient.example",
    });

    expect(payload.isAllowCheck).toBeUndefined();
  });

  it("preserves a checked campaign commitment", () => {
    const payload = buildPlaceOrderPayload({
      values: { ...formValues, isAllowCheck: true },
      recaptchaToken: null,
      isLoggedIn: true,
      isAllowCheck: true,
      origin: "https://heartlock.example",
    });

    expect(payload.isAllowCheck).toBe(true);
  });
});
