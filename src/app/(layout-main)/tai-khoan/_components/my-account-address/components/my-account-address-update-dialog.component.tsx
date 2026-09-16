"use client";

import React, { useEffect } from "react";
import { CircularProgress, Stack, Box, Button } from "@mui/material";
import { useForm, Controller, Resolver } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";

import useStyles from "./my-account-address-dialog.styles";
import TextFieldComponent from "@/components/text-field/text-field.component";
import TextFieldDropdownComponent from "@/components/text-field/text-field-dropdown.component";
import TextFieldPhoneNumberComponent from "@/components/text-field/text-field-phone-number.component";
import CheckboxComponent from "@/components/checkbox/checkbox.component";
import { DialogComponent } from "@/components";
import { Address } from "@/utils/api/checkout/checkout.interface";
import { AddressFormValues, validationSchema, INITIAL_ADDRESS_VALUES } from "@/hooks/address/use-address-form.hook";
import { useMyAccountAddress } from "../hooks/my-account-address.hook";
import TextFieldSelectSearchComponent from "@/components/text-field/text-field-select-search.component";

interface MyAccountAddressUpdateDialogProps {
  open: boolean;
  onClose: () => void;
  address: Address | null;
}

const MyAccountAddressUpdateDialog: React.FC<MyAccountAddressUpdateDialogProps> = ({ open, onClose, address }) => {
  const { classes } = useStyles();

  const {
    control,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors, isDirty },
  } = useForm<AddressFormValues>({
    resolver: yupResolver(validationSchema) as unknown as Resolver<AddressFormValues>,
    defaultValues: INITIAL_ADDRESS_VALUES,
  });

  const provinceCode = watch("provinceCode");
  const watchedValues = watch();

  const {
    addresses,
    provinces,
    wards,
    handleProvinceSelect,
    handleWardSelect,
    getProvinceSearchSelectProps,
    getWardSearchSelectProps,
    updateUserAddress,
    isSubmitting: loading,
  } = useMyAccountAddress(provinceCode);
  const isOnlyAddress = addresses.length === 1;

  useEffect(() => {
    if (open && address) {
      reset({
        lastName: address.lastName || "",
        firstName: address.firstName || "",
        provinceCode: address.provinceCode || 0,
        provinceName: address.provinceName || "",
        wardCode: address.wardCode || 0,
        wardName: address.wardName || "",
        addressLine: address.addressLine || "",
        receiverPhone: address.receiverPhone || "",
        isDefault: address.isDefault || false,
      });
    }
  }, [open, address, reset]);

  const onSubmit = (values: AddressFormValues) => {
    if (!address?.id) return;
    updateUserAddress(address.id, values, { onClose });
  };

  return (
    <DialogComponent
      open={open}
      onClose={onClose}
      title="CẬP NHẬT ĐỊA CHỈ"
      sx={{ maxWidth: "550px", width: "100%" }}
      buttonCenter={
        <Button fullWidth className={classes.submitButton} onClick={handleSubmit(onSubmit)} disabled={loading || !isDirty}>
          {loading ? <CircularProgress size={24} color="inherit" /> : "Cập Nhật Địa Chỉ"}
        </Button>
      }
    >
      <Stack className={classes.modalContentWrapper}>
        <Controller
          name="firstName"
          control={control}
          render={({ field }) => (
            <TextFieldComponent
              required
              {...field}
              label="Họ và tên"
              onValueChange={field.onChange}
              error={errors.firstName?.message as string}
            />
          )}
        />
        <Box className={classes.gridTwoColumns}>
          <Controller
            name="provinceCode"
            control={control}
            render={({ field }) => (
              <TextFieldSelectSearchComponent
                {...getProvinceSearchSelectProps(setValue, field, {
                  provinceName: watchedValues.provinceName,
                  error: errors.provinceCode?.message as string,
                })}
              />
            )}
          />
          <Controller
            name="wardCode"
            control={control}
            render={({ field }) => (
              <TextFieldSelectSearchComponent
                {...getWardSearchSelectProps(setValue, field, {
                  wardName: watchedValues.wardName,
                  provinceCode: watchedValues.provinceCode,
                  error: errors.wardCode?.message as string,
                })}
              />
            )}
          />
        </Box>

        <Controller
          name="addressLine"
          control={control}
          render={({ field }) => (
            <TextFieldComponent
              required
              {...field}
              label="Địa chỉ cụ thể"
              onValueChange={field.onChange}
              error={errors.addressLine?.message as string}
            />
          )}
        />

        <Controller
          name="receiverPhone"
          control={control}
          render={({ field }) => (
            <TextFieldPhoneNumberComponent
              required
              label="Số điện thoại"
              name={field.name}
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              error={errors.receiverPhone?.message as string}
            />
          )}
        />

        <Box className={classes.checkboxWrapper}>
          <Controller
            name="isDefault"
            control={control}
            render={({ field }) => (
              <Stack sx={{ gap: "4px" }}>
                <CheckboxComponent
                  checked={field.value}
                  onChange={field.onChange}
                  disabled={isOnlyAddress}
                  title="Đặt làm địa chỉ mặc định"
                  shape="square"
                  sxCheckbox={{
                    backgroundColor: field.value ? "#171717" : "transparent",
                    borderColor: "#171717",
                    color: "#FFFFFF",
                    borderRadius: "4px",
                  }}
                  sxLabel={{
                    color: "#71717A",
                    fontSize: "14px",
                  }}
                />
                {isOnlyAddress && (
                  <Box className={classes.defaultAddressWarning}>
                    Để hủy địa chỉ mặc định này, chọn địa chỉ khác làm địa chỉ mặc định mới
                  </Box>
                )}
              </Stack>
            )}
          />
        </Box>
      </Stack>
    </DialogComponent>
  );
};

export default MyAccountAddressUpdateDialog;
