import React, { useEffect, useRef, useState } from "react";
import { Dialog, DialogTitle, DialogContent, IconButton, Box, Button, useMediaQuery } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useForm, Controller, Resolver } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import useStyles from "./checkout-address-form-modal.styles";
import TextFieldComponent from "@/components/text-field/text-field.component";
import TextFieldSelectSearchComponent, { TextFieldSelectSearchRef } from "@/components/text-field/text-field-select-search.component";
import TextFieldPhoneNumberComponent from "@/components/text-field/text-field-phone-number.component";
import CheckboxComponent from "@/components/checkbox/checkbox.component";
import { LocationApi } from "@/utils/api";
import { getErrorMessage } from "@/utils/helpers/axios";
import { Address } from "../checkout-address-item/checkout-address-item.component";
import { toast } from "react-toastify";
import CheckoutSectionHeaderComponent from "../../../checkout-header/checkout-header.component";
import { StackAlignCenter } from "@/components/styled";
import {
  AddressFormValues,
  focusAddressSelectField,
  INITIAL_ADDRESS_VALUES,
  useAddressForm,
  validationSchema,
} from "@/hooks/address/use-address-form.hook";

interface CheckoutAddressFormModalProps {
  open: boolean;
  onClose: () => void;
  address?: Address | null;
  addressCount?: number;
  onSuccess: (addr: Address) => void;
}

const CheckoutAddressFormModal: React.FC<CheckoutAddressFormModalProps> = ({ open, onClose, address, addressCount = 0, onSuccess }) => {
  const { classes } = useStyles();
  const isMobile = useMediaQuery("(max-width:810px)");
  const [loading, setLoading] = useState(false);
  const wardFieldRef = useRef<TextFieldSelectSearchRef>(null);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    clearErrors,
    formState: { errors, isDirty },
  } = useForm<AddressFormValues>({
    resolver: yupResolver(validationSchema) as unknown as Resolver<AddressFormValues>,
    defaultValues: INITIAL_ADDRESS_VALUES,
  });

  const provinceCode = watch("provinceCode");
  const {
    provinces,
    wards,
    handleProvinceSelect,
    handleWardSelect,
    provinceSearch,
    handleProvinceSearch,
    wardSearch,
    handleWardSearch,
    isLookupsLoading,
  } = useAddressForm(provinceCode, open);

  useEffect(() => {
    if (open) {
      if (address) {
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
      } else {
        reset(INITIAL_ADDRESS_VALUES);
      }
    }
  }, [open, address, reset]);

  const watchedValues = watch();

  const onSubmit = async (values: AddressFormValues) => {
    setLoading(true);
    try {
      let result: Address;
      if (address?.id) {
        result = await LocationApi.updateUserAddress(address.id, values);
        toast.success("Cập nhật địa chỉ thành công");
      } else {
        result = await LocationApi.addUserAddress(values);
        toast.success("Thêm địa chỉ thành công");
      }
      onSuccess({ ...result, ...values, id: (result?.id || address?.id || "") as string });
      onClose();
    } catch (error) {
      console.error("Failed to save address:", error);
      toast.error(getErrorMessage(error) || "Có lỗi xảy ra khi lưu địa chỉ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={isMobile}
      fullWidth
      maxWidth={false}
      PaperProps={{
        className: classes.modalPaper,
      }}
    >
      <DialogTitle className={classes.modalTitleWrapper}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <CheckoutSectionHeaderComponent title={address ? "CẬP NHẬT ĐỊA CHỈ" : "THÊM ĐỊA CHỈ"} />
          <IconButton onClick={onClose} className={classes.closeButton}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent className={classes.modalContent}>
        <StackAlignCenter className={classes.modalContentWrapper}>
          <Controller
            name="firstName"
            control={control}
            render={({ field }) => (
              <TextFieldComponent
                {...field}
                required
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
              render={({ field }) => {
                const provinceOptions =
                  provinces.length > 0
                    ? provinces.map((p) => ({ label: p.name, value: String(p.code) }))
                    : field.value
                      ? [{ label: watchedValues.provinceName, value: String(field.value) }]
                      : [];

                if (field.value && watchedValues.provinceName && !provinceOptions.find((o) => o.value === String(field.value))) {
                  provinceOptions.push({ label: watchedValues.provinceName, value: String(field.value) });
                }

                return (
                  <TextFieldSelectSearchComponent
                    label="Tỉnh/Thành phố"
                    required
                    value={field.value ? String(field.value) : ""}
                    options={provinceOptions}
                    onSelect={(val) => {
                      handleProvinceSelect(String(val), setValue, () => {
                        clearErrors("wardCode");
                        focusAddressSelectField(wardFieldRef);
                      });
                      field.onChange(Number(val));
                    }}
                    onSearch={handleProvinceSearch}
                    searchValue={provinceSearch}
                    isLoading={isLookupsLoading}
                    onBlur={field.onBlur}
                    error={errors.provinceCode?.message as string}
                  />
                );
              }}
            />
            <Controller
              name="wardCode"
              control={control}
              render={({ field }) => {
                const wardOptions =
                  wards.length > 0
                    ? wards.map((w) => ({ label: w.name, value: String(w.code) }))
                    : field.value
                      ? [{ label: watchedValues.wardName, value: String(field.value) }]
                      : [];

                if (field.value && watchedValues.wardName && !wardOptions.find((o) => o.value === String(field.value))) {
                  wardOptions.push({ label: watchedValues.wardName, value: String(field.value) });
                }

                return (
                  <TextFieldSelectSearchComponent
                    ref={wardFieldRef}
                    label="Phường/Xã"
                    required
                    value={field.value ? String(field.value) : ""}
                    options={wardOptions}
                    onSelect={(val) => {
                      handleWardSelect(String(val), setValue);
                      field.onChange(Number(val));
                    }}
                    onSearch={handleWardSearch}
                    searchValue={wardSearch}
                    isLoading={isLookupsLoading}
                    onBlur={field.onBlur}
                    disabled={!watchedValues.provinceCode}
                    error={errors.wardCode?.message as string}
                  />
                );
              }}
            />
          </Box>

          <Controller
            name="addressLine"
            control={control}
            render={({ field }) => (
              <TextFieldComponent
                {...field}
                required
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
        </StackAlignCenter>

        <Box className={classes.checkboxWrapper}>
          <Controller
            name="isDefault"
            control={control}
            render={({ field }) => {
              const isDefaultDisabled = !!address && addressCount === 1 && address.isDefault;

              return (
                <CheckboxComponent
                  checked={field.value}
                  onChange={field.onChange}
                  disabled={isDefaultDisabled}
                  title="Đặt làm địa chỉ mặc định"
                  sxCheckbox={{
                    backgroundColor: field.value ? "#171717" : "transparent",
                    borderColor: isDefaultDisabled ? "#E5001A" : "#171717",
                    color: "#FFFFFF",
                    borderRadius: "6px",
                  }}
                  sxLabel={{
                    color: "#71717A",
                    fontSize: "14px",
                  }}
                />
              );
            }}
          />
        </Box>
      </DialogContent>

      <Box className={classes.footer}>
        <Button fullWidth className={classes.submitButton} onClick={handleSubmit(onSubmit)} disabled={loading || (!!address && !isDirty)}>
          {address ? "Cập Nhật Địa Chỉ" : "Thêm Địa Chỉ"}
        </Button>
      </Box>
    </Dialog>
  );
};

export default CheckoutAddressFormModal;
