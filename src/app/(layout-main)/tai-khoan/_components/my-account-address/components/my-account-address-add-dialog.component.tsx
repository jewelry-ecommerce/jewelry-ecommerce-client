"use client";

import React, { useEffect } from "react";
import { CircularProgress, Stack, Box, Button } from "@mui/material";
import { useForm, Controller, Resolver } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import useStyles from "./my-account-address-dialog.styles";
import TextFieldComponent from "@/components/text-field/text-field.component";
import TextFieldPhoneNumberComponent from "@/components/text-field/text-field-phone-number.component";
import CheckboxComponent from "@/components/checkbox/checkbox.component";
import { DialogComponent } from "@/components";
import { AddressFormValues, validationSchema, INITIAL_ADDRESS_VALUES } from "@/hooks/address/use-address-form.hook";
import { useMyAccountAddress } from "../hooks/my-account-address.hook";
import TextFieldSelectSearchComponent from "@/components/text-field/text-field-select-search.component";

interface MyAccountAddressAddDialogProps {
  open: boolean;
  onClose: () => void;
  currentUser?: {
    firstName?: string;
    lastName?: string;
    phone?: string;
  };
}

const MyAccountAddressAddDialog: React.FC<MyAccountAddressAddDialogProps> = ({ open, onClose, currentUser }) => {
  const { classes } = useStyles();

  const {
    control,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = useForm<AddressFormValues>({
    resolver: yupResolver(validationSchema) as unknown as Resolver<AddressFormValues>,
    defaultValues: INITIAL_ADDRESS_VALUES,
  });

  const provinceCode = watch("provinceCode");
  const watchedValues = watch();

  const {
    getProvinceSearchSelectProps,
    getWardSearchSelectProps,
    addUserAddress,
    isSubmitting: loading,
  } = useMyAccountAddress(provinceCode, open);

  useEffect(() => {
    if (open) {
      reset({
        ...INITIAL_ADDRESS_VALUES,
        lastName: currentUser?.lastName || "",
        firstName: currentUser?.firstName || "",
        receiverPhone: currentUser?.phone || "",
      });
    }
  }, [open, currentUser, reset]);

  const onSubmit = (values: AddressFormValues) => {
    addUserAddress(values, { onClose });
  };

  return (
    <DialogComponent
      open={open}
      onClose={onClose}
      title="THÊM ĐỊA CHỈ MỚI"
      sx={{ maxWidth: "550px", width: "100%" }}
      buttonCenter={
        <Button fullWidth className={classes.submitButton} onClick={handleSubmit(onSubmit)} disabled={loading}>
          {loading ? <CircularProgress size={24} color="inherit" /> : "Thêm Địa Chỉ"}
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
              <CheckboxComponent
                checked={field.value}
                onChange={field.onChange}
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
            )}
          />
        </Box>
      </Stack>
    </DialogComponent>
  );
};

export default MyAccountAddressAddDialog;
