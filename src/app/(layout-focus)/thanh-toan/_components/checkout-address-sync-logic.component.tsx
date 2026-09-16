import React from "react";
import { useFormContext, useFormState, useWatch } from "react-hook-form";
import type { CheckoutFormValues } from "./checkout.constant";
import { useCheckoutSync } from "@/hooks/checkout/use-checkout-sync.hook";
import type { Address, CheckoutSession, ShippingAddress } from "@/utils/api/checkout/checkout.interface";

export type CheckoutAddressSyncLogicProps = {
  session: CheckoutSession;
  isLoggedIn: boolean;
  userAddresses: Address[];
  syncAddress: (data: ShippingAddress, addressId?: string, options?: { acceptPriceChanges?: boolean }) => Promise<CheckoutSession>;
  handleSelectAddress: (addr: Address, options?: { silent?: boolean }) => void;
  isSubmissionLock: React.MutableRefObject<boolean>;
  isLoading: boolean;
  onAddressSyncError?: (error: unknown) => void;
};

export const CheckoutAddressSyncLogic = ({
  session,
  isLoggedIn,
  userAddresses,
  syncAddress,
  handleSelectAddress,
  isSubmissionLock,
  isLoading,
  onAddressSyncError,
}: CheckoutAddressSyncLogicProps) => {
  const { control, trigger } = useFormContext<CheckoutFormValues>();
  const { isDirty } = useFormState({ control });
  const watchedAddress = useWatch({
    control,
    name: ["firstName", "provinceCode", "provinceName", "wardCode", "wardName", "addressLine", "receiverPhone"],
  });

  useCheckoutSync({
    session,
    isDirty,
    isLoggedIn,
    userAddresses,
    syncAddress,
    handleSelectAddress,
    isSubmissionLock,
    watchedAddress,
    isLoading,
    trigger,
    onSyncError: onAddressSyncError,
  });

  return null;
};

export default CheckoutAddressSyncLogic;
