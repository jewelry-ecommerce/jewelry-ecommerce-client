import { useState, useCallback } from "react";
import useSWR from "swr";
import type { ControllerRenderProps, UseFormSetValue } from "react-hook-form";
import { LocationApi } from "@/utils/api";
import { toast } from "react-toastify";
import { AddressFormValues, useAddressForm } from "@/hooks/address/use-address-form.hook";

type LocationRow = { code: number; name: string };

function buildLocationSearchOptions(rows: LocationRow[], selectedCode: number, selectedName: string) {
  const optionsMap = new Map<string, { label: string; value: string }>();

  if (selectedCode && selectedName) {
    optionsMap.set(selectedName.trim().toLowerCase(), {
      label: selectedName.trim(),
      value: String(selectedCode),
    });
  }

  rows.forEach((r) => {
    const label = (r.code === selectedCode && selectedName ? selectedName : r.name).trim();
    const labelKey = label.toLowerCase();

    if (!optionsMap.has(labelKey)) {
      optionsMap.set(labelKey, { label, value: String(r.code) });
    }
  });

  return Array.from(optionsMap.values());
}

// Hook
export const useMyAccountAddress = (provinceCode?: number, lookupsEnabled = true) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const addressForm = useAddressForm(provinceCode, lookupsEnabled);
  const {
    provinces,
    wards,
    handleProvinceSelect,
    handleWardSelect,
    handleProvinceSearch,
    handleWardSearch,
    provinceSearch,
    wardSearch,
    isLookupsLoading,
  } = addressForm;

  const { data: addressRes, isLoading: isAddressesLoading, mutate } = useSWR("user/addresses", () => LocationApi.getUserAddresses());

  const deleteUserAddress = async (id: string, callbacks?: { onSuccess?: () => void; onClose?: () => void }) => {
    setIsDeleting(true);
    try {
      await LocationApi.deleteUserAddress(id);
      toast.success("Xoá địa chỉ thành công");
      mutate();
      callbacks?.onSuccess?.();
      callbacks?.onClose?.();
      return true;
    } catch (error) {
      console.error("Failed to delete address:", error);
      toast.error("Không thể xoá địa chỉ");
      return false;
    } finally {
      setIsDeleting(false);
    }
  };

  const addUserAddress = async (values: AddressFormValues, callbacks?: { onSuccess?: () => void; onClose?: () => void }) => {
    setIsSubmitting(true);
    try {
      await LocationApi.addUserAddress(values);
      toast.success("Thêm địa chỉ thành công");
      mutate();
      callbacks?.onSuccess?.();
      callbacks?.onClose?.();
      return true;
    } catch (error) {
      console.error("Failed to add address:", error);
      toast.error("Có lỗi xảy ra khi thêm địa chỉ");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const getProvinceSearchSelectProps = useCallback(
    (
      setValue: UseFormSetValue<AddressFormValues>,
      field: ControllerRenderProps<AddressFormValues, "provinceCode">,
      meta: { provinceName: string; error?: string },
    ) => ({
      required: true as const,
      label: "Tỉnh/Thành phố" as const,
      value: field.value ? String(field.value) : "",
      options: buildLocationSearchOptions(provinces, Number(field.value) || 0, meta.provinceName),
      onSelect: (val: string | number) => {
        handleProvinceSelect(String(val), setValue);
        field.onChange(Number(val));
      },
      onSearch: handleProvinceSearch,
      searchValue: provinceSearch,
      isLoading: isLookupsLoading,
      onBlur: field.onBlur,
      error: meta.error,
    }),
    [provinces, handleProvinceSelect, handleProvinceSearch, provinceSearch, isLookupsLoading],
  );

  const getWardSearchSelectProps = useCallback(
    (
      setValue: UseFormSetValue<AddressFormValues>,
      field: ControllerRenderProps<AddressFormValues, "wardCode">,
      meta: { wardName: string; provinceCode: number; error?: string },
    ) => ({
      required: true as const,
      label: "Phường/Xã" as const,
      value: field.value ? String(field.value) : "",
      options: buildLocationSearchOptions(wards, Number(field.value) || 0, meta.wardName),
      onSelect: (val: string | number) => {
        handleWardSelect(String(val), setValue);
        field.onChange(Number(val));
      },
      onSearch: handleWardSearch,
      searchValue: wardSearch,
      isLoading: isLookupsLoading,
      onBlur: field.onBlur,
      disabled: !meta.provinceCode,
      error: meta.error,
    }),
    [wards, handleWardSelect, handleWardSearch, wardSearch, isLookupsLoading],
  );

  const updateUserAddress = async (id: string, values: AddressFormValues, callbacks?: { onSuccess?: () => void; onClose?: () => void }) => {
    setIsSubmitting(true);
    try {
      await LocationApi.updateUserAddress(id, values);
      toast.success("Cập nhật địa chỉ thành công");
      mutate();
      callbacks?.onSuccess?.();
      callbacks?.onClose?.();
      return true;
    } catch (error) {
      console.error("Failed to update address:", error);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    addresses: addressRes?.list || [],
    provinces,
    wards,
    isLoading: isAddressesLoading,
    isLookupsLoading,
    getProvinceSearchSelectProps,
    getWardSearchSelectProps,
    isSubmitting,
    isDeleting,
    deleteUserAddress,
    handleProvinceSelect,
    handleWardSelect,
    addUserAddress,
    updateUserAddress,
  };
};
