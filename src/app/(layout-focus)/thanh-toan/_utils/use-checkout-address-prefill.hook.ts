import { useEffect, useRef } from "react";
import type { UseFormGetValues, UseFormReset, UseFormSetValue } from "react-hook-form";
import type { Address, CheckoutSession } from "@/utils/api/checkout/checkout.interface";
import type { AuthUser } from "@/utils/api/auth/auth.interface";
import type { CheckoutFormValues } from "../_components/checkout.constant";
import { getCheckoutInitialValues } from "../_components/checkout.constant";
import { getCheckoutProfilePrefill } from "./checkout-profile-prefill.util";

export interface UseCheckoutAddressPrefillParams {
  session: CheckoutSession | null | undefined;
  isLoggedIn: boolean;
  user: AuthUser | null;
  userAddresses: Address[];
  selectedAddressId: string | null;
  isManualEntry: boolean;
  reset: UseFormReset<CheckoutFormValues>;
  setValue: UseFormSetValue<CheckoutFormValues>;
  getValues: UseFormGetValues<CheckoutFormValues>;
  setSelectedAddressId: (id: string | null) => void;
}

export function useCheckoutAddressPrefill({
  session,
  isLoggedIn,
  user,
  userAddresses,
  selectedAddressId,
  isManualEntry,
  reset,
  setValue,
  getValues,
  setSelectedAddressId,
}: UseCheckoutAddressPrefillParams) {
  const guestSessionLoaded = useRef(false);
  const profilePrefillApplied = useRef(false);

  useEffect(() => {
    if (!isLoggedIn && session && !guestSessionLoaded.current) {
      guestSessionLoaded.current = true;
      reset(getCheckoutInitialValues(session, isLoggedIn, user));
    }
  }, [session, isLoggedIn, user, reset]);

  /** Đã đăng nhập, chưa có sổ địa chỉ: điền Họ tên + SĐT từ profile Redux (iam/customer/profile). */
  useEffect(() => {
    if (!isLoggedIn || !user || userAddresses.length > 0 || profilePrefillApplied.current) return;

    const prefill = getCheckoutProfilePrefill(user);
    if (!prefill.firstName && !prefill.receiverPhone) return;

    const updates: Partial<CheckoutFormValues> = {};
    if (!getValues("firstName")?.trim() && prefill.firstName) updates.firstName = prefill.firstName;
    if (!getValues("receiverPhone")?.trim() && prefill.receiverPhone) updates.receiverPhone = prefill.receiverPhone;

    if (Object.keys(updates).length === 0) {
      profilePrefillApplied.current = true;
      return;
    }

    Object.entries(updates).forEach(([key, value]) => {
      setValue(key as keyof CheckoutFormValues, value as string, { shouldDirty: false, shouldValidate: true });
    });
    profilePrefillApplied.current = true;
  }, [getValues, isLoggedIn, setValue, user, userAddresses.length]);

  useEffect(() => {
    if (isLoggedIn && userAddresses.length > 0 && session?.shippingAddress && !selectedAddressId && !isManualEntry) {
      const currentAddr = session.shippingAddress;
      const matched = userAddresses.find(
        (addr) =>
          addr.provinceCode === currentAddr.provinceCode &&
          addr.wardCode === currentAddr.wardCode &&
          addr.addressLine === currentAddr.addressLine &&
          addr.firstName === currentAddr.firstName,
      );
      if (matched) setSelectedAddressId(matched.id);
    }
  }, [isLoggedIn, userAddresses, session?.shippingAddress, selectedAddressId, isManualEntry, setSelectedAddressId]);
}
