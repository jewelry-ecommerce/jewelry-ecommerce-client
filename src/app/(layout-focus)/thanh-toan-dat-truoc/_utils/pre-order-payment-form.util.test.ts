import { describe, expect, it } from "vitest";
import {
  buildUpdatePreOrderShippingAddressRequest,
  buildUpdatePreOrderSpecialRequestsRequest,
  getPreOrderPaymentFormValues,
  isPreOrderShippingAddressChanged,
  isPreOrderShippingAddressReady,
  isPreOrderSpecialRequestsChanged,
  mergePreOrderShippingAddressResult,
} from "@/app/(layout-focus)/thanh-toan-dat-truoc/_utils/pre-order-payment-form.util";
import { PaymentMethod } from "@/utils/api/order/order.enum";

describe("pre-order-payment-form.util", () => {
  it("maps detail into checkout form values", () => {
    const values = getPreOrderPaymentFormValues({
      orderCode: "PO-1",
      paymentMethod: PaymentMethod.COD,
      note: "Ghi chú",
      shippingAddressSnapshot: {
        firstName: "A",
        lastName: "Nguyen",
        receiverPhone: "0901234567",
        addressLine: "1 Nguyen Hue",
        wardCode: 1,
        wardName: "Ben Nghe",
        provinceCode: 79,
        provinceName: "HCM",
      },
      vatInvoice: {
        companyName: "ABC",
        companyAddress: "Addr",
        taxCode: "0312345678",
        email: "a@b.c",
      },
    });

    expect(values.firstName).toBe("A");
    expect(values.showNote).toBe(true);
    expect(values.showVat).toBe(true);
    expect(values.paymentMethod).toBe(PaymentMethod.COD);
  });

  it("detects shipping address changes", () => {
    const baseline = {
      firstName: "A",
      lastName: "Nguyen",
      receiverPhone: "0901234567",
      addressLine: "1 Nguyen Hue",
      wardCode: 1,
      wardName: "Ben Nghe",
      provinceCode: 79,
      provinceName: "HCM",
    };
    const values = getPreOrderPaymentFormValues({
      orderCode: "PO-1",
      shippingAddressSnapshot: baseline,
    });

    expect(isPreOrderShippingAddressChanged(baseline, values)).toBe(false);
    expect(isPreOrderShippingAddressChanged(baseline, { ...values, addressLine: "2 Le Loi" })).toBe(true);
  });

  it("builds shipping-address payload without stale carrier fields", () => {
    const values = getPreOrderPaymentFormValues({
      orderCode: "PO-1",
      shippingAddressSnapshot: {
        firstName: "A",
        lastName: "Nguyen",
        receiverPhone: "0901234567",
        addressLine: "1 Nguyen Hue",
        wardCode: 1,
        wardName: "Ben Nghe",
        provinceCode: 79,
        provinceName: "HCM",
      },
      shippingMethod: "Express" as any,
      shippingCarrier: "GHN",
      carrierServiceId: 53321,
    });

    expect(
      buildUpdatePreOrderShippingAddressRequest(
        {
          orderCode: "PO-1",
          shippingMethod: "Express" as any,
          shippingCarrier: "GHN",
          carrierServiceId: 53321,
        },
        values,
      ),
    ).toEqual({
      shippingAddressSnapshot: {
        lastName: "Nguyen",
        firstName: "A",
        receiverPhone: "0901234567",
        wardCode: 1,
        wardName: "Ben Nghe",
        addressLine: "1 Nguyen Hue",
        provinceCode: 79,
        provinceName: "HCM",
      },
    });
  });

  it("merges PUT shipping-address result into pricing fields", () => {
    const merged = mergePreOrderShippingAddressResult(
      {
        orderCode: "PO-1",
        shippingFee: "10000",
        grandTotal: "50000",
        shippingAddressSnapshot: {
          firstName: "A",
          lastName: "Nguyen",
          receiverPhone: "0901234567",
          addressLine: "Old",
          wardCode: 1,
          wardName: "Old Ward",
          provinceCode: 79,
          provinceName: "HCM",
        },
      },
      {
        shippingAddressSnapshot: {
          lastName: "Nguyen",
          firstName: "A",
          receiverPhone: "0901234567",
          wardCode: 2,
          wardName: "New Ward",
          addressLine: "New",
          provinceCode: 79,
          provinceName: "HCM",
        },
      },
      {
        orderCode: "PO-1",
        shippingFee: "25000",
        grandTotal: "65000",
        shippingCarrier: "GHN",
        carrierServiceId: 99,
      },
    );

    expect(merged.shippingFee).toBe("25000");
    expect(merged.grandTotal).toBe("65000");
    expect(merged.shippingAddressSnapshot?.addressLine).toBe("New");
    expect(merged.carrierServiceId).toBe(99);
  });

  it("requires province, ward, address line, first name, and receiver phone before shipping sync", () => {
    const values = getPreOrderPaymentFormValues({ orderCode: "PO-1" });
    expect(isPreOrderShippingAddressReady(values)).toBe(false);
    expect(
      isPreOrderShippingAddressReady({
        ...values,
        provinceCode: 79,
        wardCode: 1,
        addressLine: "1 Nguyen Hue",
      }),
    ).toBe(false);
    expect(
      isPreOrderShippingAddressReady({
        ...values,
        provinceCode: 79,
        wardCode: 1,
        addressLine: "1 Nguyen Hue",
        firstName: "Nguyen",
      }),
    ).toBe(false);
    expect(
      isPreOrderShippingAddressReady({
        ...values,
        provinceCode: 79,
        wardCode: 1,
        addressLine: "1 Nguyen Hue",
        firstName: "Nguyen",
        receiverPhone: "0901234567",
      }),
    ).toBe(true);
  });

  it("builds special-requests payload and detects vat/note changes", () => {
    const values = getPreOrderPaymentFormValues({
      orderCode: "PO-1",
      note: "Old",
      vatInvoice: {
        companyName: "ABC",
        companyAddress: "Addr",
        taxCode: "0312345678",
        email: "a@b.c",
      },
    });

    expect(buildUpdatePreOrderSpecialRequestsRequest(values)).toEqual({
      note: "Old",
      vatInvoice: {
        companyName: "ABC",
        companyAddress: "Addr",
        taxCode: "0312345678",
        email: "a@b.c",
      },
    });

    expect(
      isPreOrderSpecialRequestsChanged(
        {
          note: "Old",
          vatInvoice: {
            companyName: "ABC",
            companyAddress: "Addr",
            taxCode: "0312345678",
            email: "a@b.c",
          },
        },
        values,
      ),
    ).toBe(false);

    expect(
      isPreOrderSpecialRequestsChanged(
        {
          note: "Old",
          vatInvoice: {
            companyName: "ABC",
            companyAddress: "Addr",
            taxCode: "0312345678",
            email: "a@b.c",
          },
        },
        { ...values, note: "New" },
      ),
    ).toBe(true);
  });
});
