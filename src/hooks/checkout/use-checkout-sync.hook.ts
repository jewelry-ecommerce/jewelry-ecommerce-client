import { useEffect, useRef, useMemo } from "react";
import type { UseFormTrigger } from "react-hook-form";
import useDebounce from "@/hooks/use-debounce";
import { CheckoutSession, Address, ShippingAddress } from "@/utils/api/checkout/checkout.interface";
import type { CheckoutFormValues } from "@/app/(layout-focus)/thanh-toan/_components/checkout.constant";

type WatchedCheckoutAddress = [
  CheckoutFormValues["firstName"],
  CheckoutFormValues["provinceCode"],
  CheckoutFormValues["provinceName"],
  CheckoutFormValues["wardCode"],
  CheckoutFormValues["wardName"],
  CheckoutFormValues["addressLine"],
  CheckoutFormValues["receiverPhone"],
];

interface UseCheckoutSyncProps {
  session: CheckoutSession | null | undefined;
  isDirty: boolean;
  isLoggedIn: boolean;
  userAddresses: Address[];
  syncAddress: (data: ShippingAddress, addressId?: string, options?: { acceptPriceChanges?: boolean }) => Promise<CheckoutSession>;
  handleSelectAddress: (addr: Address, options?: { silent?: boolean }) => void;
  isSubmissionLock: React.MutableRefObject<boolean>;
  watchedAddress: WatchedCheckoutAddress;
  isLoading: boolean;
  trigger?: UseFormTrigger<CheckoutFormValues>;
  onSyncError?: (error: unknown) => void;
}

export const useCheckoutSync = ({
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
  onSyncError,
}: UseCheckoutSyncProps) => {
  const lastSyncedValues = useRef<string | null>(null);
  const hasAttemptedAutoSelect = useRef(false);

  const [firstName, provinceCode, provinceName, wardCode, wardName, addressLine, receiverPhone] = watchedAddress || [];

  const addressToSync = useMemo(
    () => ({
      firstName,
      provinceCode,
      provinceName,
      wardCode,
      wardName,
      addressLine,
      receiverPhone,
    }),
    [firstName, provinceCode, provinceName, wardCode, wardName, addressLine, receiverPhone],
  );

  const debouncedAddress = useDebounce({ value: addressToSync, delay: 1000 });

  useEffect(() => {
    if (session?.shippingAddress && lastSyncedValues.current === null) {
      const addr = session.shippingAddress;
      const initialAddrStr = JSON.stringify({
        firstName: addr.firstName || "",
        provinceCode: addr.provinceCode || 0,
        provinceName: addr.provinceName || "",
        wardCode: addr.wardCode || 0,
        wardName: addr.wardName || "",
        addressLine: addr.addressLine || "",
        receiverPhone: addr.receiverPhone || "",
      });
      lastSyncedValues.current = initialAddrStr;
    }
  }, [session]);

  useEffect(() => {
    const isStatusDraft = session?.status?.toLowerCase() === "draft";
    const hasOrder = Boolean(session?.orderCode);

    if (!isDirty || !session || !isStatusDraft || isSubmissionLock.current || hasOrder) return;

    const { firstName, provinceCode, wardCode, addressLine, receiverPhone } = debouncedAddress;

    if (!firstName || !provinceCode || !wardCode || !addressLine || !receiverPhone) return;

    const currentStr = JSON.stringify(debouncedAddress);
    if (currentStr !== lastSyncedValues.current) {
      if (trigger) {
        trigger(["firstName", "provinceCode", "wardCode", "addressLine", "receiverPhone"]).then((isValid) => {
          if (isValid) {
            void syncAddress(debouncedAddress).catch((error) => {
              onSyncError?.(error);
            });
            lastSyncedValues.current = currentStr;
          }
        });
      } else {
        void syncAddress(debouncedAddress).catch((error) => {
          onSyncError?.(error);
        });
        lastSyncedValues.current = currentStr;
      }
    }
  }, [debouncedAddress, isDirty, session, syncAddress, isSubmissionLock, trigger, onSyncError]);

  useEffect(() => {
    const isStatusDraft = session?.status?.toLowerCase() === "draft";
    const hasAddress = !!session?.shippingAddress;
    const hasOrder = Boolean(session?.orderCode);

    if (
      isLoading ||
      !session ||
      !isStatusDraft ||
      hasAddress ||
      hasOrder ||
      !isLoggedIn ||
      userAddresses.length === 0 ||
      hasAttemptedAutoSelect.current
    )
      return;

    const defaultAddr = userAddresses.find((addr: Address) => addr.isDefault) || userAddresses[0];
    handleSelectAddress(defaultAddr, { silent: true });
    hasAttemptedAutoSelect.current = true;
  }, [isLoading, session, isLoggedIn, userAddresses, handleSelectAddress]);

  return {
    lastSyncedValues,
    hasAttemptedAutoSelect,
  };
};
