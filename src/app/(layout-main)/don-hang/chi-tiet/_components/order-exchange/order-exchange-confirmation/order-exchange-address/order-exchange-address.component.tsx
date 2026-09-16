"use client";

import React, { useCallback, useEffect, useLayoutEffect, useMemo } from "react";
import { Box, Divider, Stack, Typography } from "@mui/material";
import { FormProvider, useForm, useWatch, Controller, type Resolver } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import TextFieldComponent from "@/components/text-field/text-field.component";
import TextFieldSelectSearchComponent from "@/components/text-field/text-field-select-search.component";
import TextFieldPhoneNumberComponent from "@/components/text-field/text-field-phone-number.component";
import { useAddressForm } from "@/hooks/address/use-address-form.hook";
import useDebounce from "@/hooks/use-debounce";
import useStyles from "./order-exchange-address.styles";
import type { OrderDetailResponse } from "@/utils/api/checkout/checkout.interface";
import type { PickupAddressValues } from "./order-exchange-address.types";
import { pickupAddressDefaultsFromOrder } from "./order-exchange-address.types";
import {
  isValidProvinceCode,
  isValidWardCode,
  normalizePickupAddressValues,
} from "@/app/(layout-main)/don-hang/chi-tiet/_interfaces/order-return-pickup.interface";
import { orderExchangePickupAddressSchema } from "./order-exchange-address.validation";

/** Trùng hướng debounce địa chỉ khi quote phí ship checkout (~600ms). */
const PICKUP_ADDRESS_VALIDATE_DEBOUNCE_MS = 600;

export interface OrderExchangeAddressProps {
  order: OrderDetailResponse;
  /** Ưu tiên hơn snapshot đơn — dùng khi khôi phục draft. */
  initialValues?: PickupAddressValues;
  onAddressUpdate?: (values: PickupAddressValues, isValid: boolean) => void;
}

const OrderExchangeAddress: React.FC<OrderExchangeAddressProps> = ({ order, initialValues, onAddressUpdate }) => {
  const { classes } = useStyles();

  const defaultValues = useMemo(() => {
    const base = initialValues ?? pickupAddressDefaultsFromOrder(order);
    return normalizePickupAddressValues(base);
  }, [initialValues, order.id, order.shippingAddressSnapshot]);

  const methods = useForm<PickupAddressValues>({
    defaultValues,
    resolver: yupResolver(orderExchangePickupAddressSchema) as Resolver<PickupAddressValues>,
    mode: "onTouched",
    reValidateMode: "onChange",
  });

  const { control, reset, trigger, getValues, setValue, formState } = methods;
  const { isDirty } = formState;

  const wProvinceCode = useWatch({ control, name: "provinceCode" });
  const wProvinceName = useWatch({ control, name: "provinceName" });
  const wWardCode = useWatch({ control, name: "wardCode" });
  const wWardName = useWatch({ control, name: "wardName" });

  const watchedForm = useWatch({ control });
  /** Chuỗi ổn định — tránh debounce theo object (reference đổi mỗi render → timer 600ms reset liên tục, nút Gửi kẹt disabled). */
  const addressValidationFingerprint = useMemo(
    () =>
      [
        watchedForm.fullName,
        watchedForm.provinceCode,
        watchedForm.provinceName,
        watchedForm.wardCode,
        watchedForm.wardName,
        watchedForm.addressLine,
        watchedForm.phone,
      ].join("|"),
    [
      watchedForm.fullName,
      watchedForm.provinceCode,
      watchedForm.provinceName,
      watchedForm.wardCode,
      watchedForm.wardName,
      watchedForm.addressLine,
      watchedForm.phone,
    ],
  );
  const debouncedAddressFingerprint = useDebounce({
    value: addressValidationFingerprint,
    delay: PICKUP_ADDRESS_VALIDATE_DEBOUNCE_MS,
  });

  const {
    provinces,
    wards,
    isLookupsLoading,
    provinceSearch,
    wardSearch,
    handleProvinceSearch,
    handleWardSearch,
    handleProvinceSelect,
    handleWardSelect,
  } = useAddressForm(isValidProvinceCode(wProvinceCode) ? wProvinceCode : undefined, true);

  /** Snapshot đôi khi chỉ có tên (mã sentinel) — map lại khi danh sách IAM load. */
  useEffect(() => {
    if (!provinces.length || isValidProvinceCode(wProvinceCode)) return;
    const name = (wProvinceName || defaultValues.provinceName).trim();
    if (!name) return;
    const lower = name.toLowerCase();
    const matched = provinces.find((p) => p.name.trim().toLowerCase() === lower);
    if (!matched) return;
    setValue("provinceCode", matched.code, { shouldDirty: false, shouldValidate: true });
    setValue("provinceName", matched.name, { shouldDirty: false });
    void trigger().then((ok) => onAddressUpdate?.(getValues(), ok));
  }, [defaultValues.provinceName, getValues, onAddressUpdate, provinces, setValue, trigger, wProvinceCode, wProvinceName]);

  useEffect(() => {
    if (!wards.length || !isValidProvinceCode(wProvinceCode) || isValidWardCode(wWardCode)) return;
    const name = (wWardName || defaultValues.wardName).trim();
    if (!name) return;
    const lower = name.toLowerCase();
    const matched = wards.find((w) => w.name.trim().toLowerCase() === lower);
    if (!matched) return;
    setValue("wardCode", matched.code, { shouldDirty: false, shouldValidate: true });
    setValue("wardName", matched.name, { shouldDirty: false });
    void trigger().then((ok) => onAddressUpdate?.(getValues(), ok));
  }, [defaultValues.wardName, getValues, onAddressUpdate, setValue, trigger, wProvinceCode, wWardCode, wWardName, wards]);

  useLayoutEffect(() => {
    reset(defaultValues);
    void trigger().then((ok) => {
      onAddressUpdate?.(getValues(), ok);
    });
  }, [defaultValues, getValues, onAddressUpdate, reset, trigger]);

  const notifyValidity = useCallback(() => {
    void trigger().then((ok) => {
      onAddressUpdate?.(getValues(), ok);
    });
  }, [getValues, onAddressUpdate, trigger]);

  useEffect(() => {
    if (!isDirty) return;
    notifyValidity();
  }, [debouncedAddressFingerprint, isDirty, notifyValidity]);

  const notifyValidityAfterSelect = useCallback(() => {
    queueMicrotask(() => {
      notifyValidity();
    });
  }, [notifyValidity]);

  return (
    <FormProvider {...methods}>
      <Box className={classes.root}>
        <Divider sx={{ mb: 4 }} />
        <Typography className={classes.sectionTitle}>Thông tin lấy hàng</Typography>
        <Stack gap="16px" sx={{ mt: 2 }}>
          <Controller
            name="fullName"
            control={control}
            render={({ field, fieldState }) => (
              <TextFieldComponent
                label="Họ và tên"
                required
                value={field.value}
                onValueChange={field.onChange}
                onBlur={field.onBlur}
                error={fieldState.error?.message}
              />
            )}
          />

          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <Controller
              name="provinceCode"
              control={control}
              render={({ field, fieldState }) => (
                <TextFieldSelectSearchComponent
                  label="Tỉnh/Thành phố"
                  required
                  value={isValidProvinceCode(field.value) ? String(field.value) : ""}
                  options={
                    provinces.length > 0
                      ? provinces.map((p) => ({ label: p.name, value: String(p.code) }))
                      : wProvinceName
                        ? [{ label: wProvinceName, value: "" }]
                        : []
                  }
                  onSelect={(val) => {
                    handleProvinceSelect(String(val), setValue);
                    field.onChange(Number(val));
                    notifyValidityAfterSelect();
                  }}
                  onSearch={handleProvinceSearch}
                  searchValue={provinceSearch}
                  isLoading={isLookupsLoading}
                  onBlur={field.onBlur}
                  error={fieldState.error?.message}
                />
              )}
            />
            <Controller
              name="wardCode"
              control={control}
              render={({ field, fieldState }) => (
                <TextFieldSelectSearchComponent
                  label="Phường/Xã"
                  required
                  value={isValidWardCode(field.value) ? String(field.value) : ""}
                  options={
                    wards.length > 0
                      ? wards.map((w) => ({ label: w.name, value: String(w.code) }))
                      : wWardName
                        ? [{ label: wWardName, value: "" }]
                        : []
                  }
                  onSelect={(val) => {
                    handleWardSelect(String(val), setValue);
                    field.onChange(Number(val));
                    notifyValidityAfterSelect();
                  }}
                  onSearch={handleWardSearch}
                  searchValue={wardSearch}
                  isLoading={isLookupsLoading}
                  disabled={!isValidProvinceCode(wProvinceCode)}
                  onBlur={field.onBlur}
                  error={fieldState.error?.message}
                />
              )}
            />
          </Box>

          <Controller
            name="addressLine"
            control={control}
            render={({ field, fieldState }) => (
              <TextFieldComponent
                label="Địa chỉ cụ thể"
                required
                value={field.value}
                onValueChange={field.onChange}
                onBlur={field.onBlur}
                error={fieldState.error?.message}
              />
            )}
          />

          <Controller
            name="phone"
            control={control}
            render={({ field, fieldState }) => (
              <TextFieldPhoneNumberComponent
                label="Số điện thoại"
                required
                name={field.name}
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                error={fieldState.error?.message}
              />
            )}
          />
        </Stack>
      </Box>
    </FormProvider>
  );
};

export default OrderExchangeAddress;
