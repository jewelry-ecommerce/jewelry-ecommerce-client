import { RefObject, useCallback, useState } from "react";
import useSWR from "swr";
import * as Yup from "yup";
import { FieldValues, Path, PathValue, UseFormSetValue } from "react-hook-form";
import { LocationApi } from "@/utils/api";
import { VALIDATION_MESSAGES, PHONE_REGEX } from "@/utils/constants/common.constant";
import useDebounce from "../use-debounce";

export interface AddressFormValues {
  lastName: string;
  firstName: string;
  provinceCode: number;
  provinceName: string;
  wardCode: number;
  wardName: string;
  addressLine: string;
  receiverPhone: string;
  isDefault: boolean;
}

export const validationSchema = Yup.object().shape({
  lastName: Yup.string().notRequired(),
  firstName: Yup.string().required("Vui lòng nhập đầy đủ Họ và tên"),
  provinceCode: Yup.number().required(VALIDATION_MESSAGES.required).min(1, VALIDATION_MESSAGES.required),
  wardCode: Yup.number().required(VALIDATION_MESSAGES.required).min(1, VALIDATION_MESSAGES.required),
  addressLine: Yup.string().required(VALIDATION_MESSAGES.required),
  receiverPhone: Yup.string().matches(PHONE_REGEX, VALIDATION_MESSAGES.phone).required(VALIDATION_MESSAGES.required),
  isDefault: Yup.boolean().notRequired(),
  provinceName: Yup.string().notRequired(),
  wardName: Yup.string().notRequired(),
});

export type AddressSelectFieldRef = {
  focus: () => void;
};

export const focusAddressSelectField = (ref: RefObject<AddressSelectFieldRef | null>) => {
  window.setTimeout(() => ref.current?.focus(), 0);
};

export const INITIAL_ADDRESS_VALUES: AddressFormValues = {
  lastName: "",
  firstName: "",
  provinceCode: 0,
  provinceName: "",
  wardCode: 0,
  wardName: "",
  addressLine: "",
  receiverPhone: "",
  isDefault: false,
};

export const useAddressForm = (provinceCode?: number, enabled = true) => {
  const [provinceSearch, setProvinceSearch] = useState("");
  const [wardSearch, setWardSearch] = useState("");

  const debouncedProvinceSearch = useDebounce({ value: provinceSearch, delay: 500 });
  const debouncedWardSearch = useDebounce({ value: wardSearch, delay: 500 });

  const handleProvinceSearch = useCallback((val: string) => {
    setProvinceSearch(val);
  }, []);

  const handleWardSearch = useCallback((val: string) => {
    setWardSearch(val);
  }, []);

  const { data: provinceRes, isLoading: isProvincesLoading } = useSWR(enabled ? ["provinces", debouncedProvinceSearch] : null, () =>
    LocationApi.getProvinces(debouncedProvinceSearch),
  );

  const { data: wardRes, isLoading: isWardsLoading } = useSWR(
    enabled && provinceCode ? [`wards/${provinceCode}`, debouncedWardSearch] : null,
    () => LocationApi.getWards(provinceCode as number, debouncedWardSearch),
  );

  const provinces = provinceRes?.list || [];
  const wards = wardRes?.list || [];

  const handleProvinceSelect = <TFieldValues extends FieldValues>(
    val: string,
    setValue: UseFormSetValue<TFieldValues>,
    onProvinceChange?: (code: number) => void,
  ) => {
    const code = Number(val);
    const matchedProvince = provinces.find((province) => province.code === code);

    setValue("provinceCode" as Path<TFieldValues>, code as PathValue<TFieldValues, Path<TFieldValues>>, {
      shouldDirty: true,
      shouldValidate: true,
    });
    setValue("provinceName" as Path<TFieldValues>, (matchedProvince?.name || "") as PathValue<TFieldValues, Path<TFieldValues>>, {
      shouldDirty: true,
    });
    setValue("wardCode" as Path<TFieldValues>, 0 as PathValue<TFieldValues, Path<TFieldValues>>, {
      shouldDirty: true,
      shouldValidate: false,
    });
    setValue("wardName" as Path<TFieldValues>, "" as PathValue<TFieldValues, Path<TFieldValues>>, { shouldDirty: true });
    onProvinceChange?.(code);
  };

  const handleWardSelect = <TFieldValues extends FieldValues>(val: string, setValue: UseFormSetValue<TFieldValues>) => {
    const code = Number(val);
    const matchedWard = wards.find((ward) => ward.code === code);

    setValue("wardCode" as Path<TFieldValues>, code as PathValue<TFieldValues, Path<TFieldValues>>, {
      shouldDirty: true,
      shouldValidate: true,
    });
    setValue("wardName" as Path<TFieldValues>, (matchedWard?.name || "") as PathValue<TFieldValues, Path<TFieldValues>>, {
      shouldDirty: true,
    });
  };

  return {
    provinces,
    wards,
    isLookupsLoading: isProvincesLoading || isWardsLoading,
    provinceSearch,
    wardSearch,
    handleProvinceSearch,
    handleWardSearch,
    handleProvinceSelect,
    handleWardSelect,
  };
};
