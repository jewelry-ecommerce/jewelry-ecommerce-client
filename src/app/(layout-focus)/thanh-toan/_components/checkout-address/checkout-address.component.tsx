import React, { useRef, useState } from "react";
import { Box, Typography, Stack, Link } from "@mui/material";
import { useFormContext, Controller, useWatch } from "react-hook-form";
import CheckboxComponent from "@/components/checkbox/checkbox.component";
import useStyles from "./checkout-address.styles";
import CheckoutSectionHeaderComponent from "../checkout-header/checkout-header.component";
import { StackRowAlignCenter, StackRowAlignCenterJustBetween } from "@/components/styled";
import CheckoutAddressBookModal from "./components/checkout-address-bool-modal/checkout-address-book-modal.component";
import { ShippingAddress } from "@/utils/api/checkout/checkout.interface";
import { Address } from "./components/checkout-address-item/checkout-address-item.component";
import TextFieldComponent from "@/components/text-field/text-field.component";
import TextFieldSelectSearchComponent, { TextFieldSelectSearchRef } from "@/components/text-field/text-field-select-search.component";
import TextFieldPhoneNumberComponent from "@/components/text-field/text-field-phone-number.component";
import { CheckoutFormValues } from "../checkout.constant";
import CheckoutAddressFormModal from "./components/checkout-address-form-modal/checkout-address-form-modal.component";
import { mutate } from "swr";
import { focusAddressSelectField, useAddressForm } from "@/hooks/address/use-address-form.hook";

interface CheckoutAddressSectionProps {
  isSaved?: boolean;
  address?: ShippingAddress;
  addresses?: Address[];
  onSelectAddress?: (addr: Address) => void;
  onUpdateAddress?: (addr: Address) => void;
  onAddAddress?: () => void;
  isSyncing?: boolean;
  selectedAddressId?: string;
  isLoggedIn?: boolean;
  readOnly?: boolean;
  /** Khóa riêng SĐT (vd. thanh toán pre-order lần 2). */
  lockReceiverPhone?: boolean;
  /** Pre-order lần 1: hiện + bắt buộc email. */
  showEmail?: boolean;
}

const CheckoutAddressSection = ({
  isSaved,
  address,
  addresses = [],
  onSelectAddress,
  onUpdateAddress,
  onAddAddress,
  isSyncing,
  selectedAddressId,
  isLoggedIn,
  readOnly = false,
  lockReceiverPhone = false,
  showEmail = false,
}: CheckoutAddressSectionProps) => {
  const { classes } = useStyles();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [isAddressLineFocused, setIsAddressLineFocused] = useState(false);

  const { control, setValue, clearErrors } = useFormContext<CheckoutFormValues>();
  const wardFieldRef = useRef<TextFieldSelectSearchRef>(null);

  const [wLastName, wFirstName, wReceiverPhone, wAddressLine, wWardName, wProvinceName, wProvinceCode] = (useWatch({
    control,
    name: ["lastName", "firstName", "receiverPhone", "addressLine", "wardName", "provinceName", "provinceCode"],
  }) ?? []) as [
    CheckoutFormValues["lastName"],
    CheckoutFormValues["firstName"],
    CheckoutFormValues["receiverPhone"],
    CheckoutFormValues["addressLine"],
    CheckoutFormValues["wardName"],
    CheckoutFormValues["provinceName"],
    CheckoutFormValues["provinceCode"],
  ];

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
  } = useAddressForm(wProvinceCode, true);

  return (
    <Box className={classes.rootWrapper}>
      <CheckoutSectionHeaderComponent title="Địa chỉ giao hàng" />

      {isSaved && address ? (
        <Box className={classes.savedAddressBox}>
          <StackRowAlignCenter>
            <Stack className={classes.savedAddressContent}>
              <StackRowAlignCenterJustBetween>
                <Typography className={classes.savedAddressName}>{wFirstName?.trim() || address?.firstName?.trim() || ""}</Typography>
                {addresses.length > 0 && !readOnly && (
                  <Link component="button" type="button" onClick={() => setIsModalOpen(true)} className={classes.editAddressLink}>
                    Thay Đổi
                  </Link>
                )}
              </StackRowAlignCenterJustBetween>
              <Typography className={classes.savedAddressPhone}>{wReceiverPhone || address.receiverPhone}</Typography>
              <Typography className={classes.savedAddressDetail}>
                {wAddressLine || address.addressLine}, {wWardName || address.wardName}, {wProvinceName || address.provinceName}
              </Typography>
            </Stack>
          </StackRowAlignCenter>
          {showEmail ? (
            <Box className={classes.formSectionWrapper} sx={{ mt: 2 }}>
              <Controller
                name="email"
                control={control}
                render={({ field, fieldState }) => (
                  <TextFieldComponent
                    {...field}
                    required
                    label="Email"
                    onValueChange={field.onChange}
                    disabled={readOnly}
                    error={fieldState.error?.message as string}
                  />
                )}
              />
            </Box>
          ) : null}
        </Box>
      ) : (
        <Stack className={classes.formSectionWrapper} position="relative">
          <Controller
            name="firstName"
            control={control}
            render={({ field, fieldState }) => (
              <TextFieldComponent
                {...field}
                required
                label="Họ và tên"
                onValueChange={field.onChange}
                disabled={readOnly}
                error={fieldState.error?.message as string}
              />
            )}
          />

          <Box className={classes.gridWrapper}>
            <Controller
              name="provinceCode"
              control={control}
              render={({ field, fieldState }) => (
                <TextFieldSelectSearchComponent
                  label="Tỉnh/Thành phố"
                  required
                  value={field.value ? String(field.value) : ""}
                  options={
                    provinces.length > 0
                      ? provinces.map((p) => ({ label: p.name, value: String(p.code) }))
                      : field.value
                        ? [{ label: wProvinceName ?? "", value: String(field.value) }]
                        : []
                  }
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
                  disabled={readOnly}
                  error={fieldState.error?.message as string}
                />
              )}
            />
            <Controller
              name="wardCode"
              control={control}
              render={({ field, fieldState }) => (
                <TextFieldSelectSearchComponent
                  ref={wardFieldRef}
                  label="Phường/Xã"
                  required
                  value={field.value ? String(field.value) : ""}
                  options={
                    wards.length > 0
                      ? wards.map((w) => ({ label: w.name, value: String(w.code) }))
                      : field.value
                        ? [{ label: wWardName ?? "", value: String(field.value) }]
                        : []
                  }
                  onSelect={(val) => {
                    handleWardSelect(String(val), setValue);
                    field.onChange(Number(val));
                  }}
                  onSearch={handleWardSearch}
                  searchValue={wardSearch}
                  isLoading={isLookupsLoading}
                  onBlur={field.onBlur}
                  disabled={!wProvinceCode || readOnly}
                  error={fieldState.error?.message as string}
                />
              )}
            />
          </Box>

          <Controller
            name="addressLine"
            control={control}
            render={({ field, fieldState }) => (
              <Box>
                <TextFieldComponent
                  {...field}
                  required
                  label="Địa chỉ cụ thể"
                  onValueChange={field.onChange}
                  onFocus={() => setIsAddressLineFocused(true)}
                  onBlur={(e) => {
                    setIsAddressLineFocused(false);
                    field.onBlur();
                  }}
                  disabled={readOnly}
                  error={fieldState.error?.message as string}
                />
                {isAddressLineFocused && !fieldState.error?.message && (
                  <Typography className={classes.hintText}>Vui lòng nhập địa chỉ sau sáp nhập.</Typography>
                )}
              </Box>
            )}
          />

          <Controller
            name="receiverPhone"
            control={control}
            render={({ field, fieldState }) => (
              <TextFieldPhoneNumberComponent
                required
                label="Số điện thoại"
                name={field.name}
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                disabled={readOnly || lockReceiverPhone}
                error={fieldState.error?.message as string}
              />
            )}
          />

          {showEmail ? (
            <Controller
              name="email"
              control={control}
              render={({ field, fieldState }) => (
                <TextFieldComponent
                  {...field}
                  required
                  label="Email"
                  onValueChange={field.onChange}
                  disabled={readOnly}
                  error={fieldState.error?.message as string}
                />
              )}
            />
          ) : null}

          {!isSaved && isLoggedIn && !readOnly && (
            <Controller
              name="saveAddress"
              control={control}
              render={({ field }) => (
                <CheckboxComponent
                  checked={field.value}
                  onChange={field.onChange}
                  title="Lưu địa chỉ"
                  sxCheckbox={{
                    backgroundColor: field.value ? "#171717" : "transparent",
                    borderColor: "#171717",
                    color: "#FFFFFF",
                    borderRadius: "6px",
                  }}
                  sxLabel={{
                    color: "#71717A",
                    fontSize: "14px",
                  }}
                />
              )}
            />
          )}
        </Stack>
      )}

      <CheckoutAddressBookModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        addresses={addresses}
        selectedAddressId={selectedAddressId || ""}
        onSelect={(addr) => {
          onSelectAddress?.(addr);
        }}
        onUpdate={(addr) => {
          setEditingAddress(addr);
          setIsFormModalOpen(true);
        }}
        onAdd={() => {
          setEditingAddress(null);
          setIsFormModalOpen(true);
        }}
      />

      <CheckoutAddressFormModal
        open={isFormModalOpen}
        address={editingAddress}
        addressCount={addresses.length}
        onClose={() => setIsFormModalOpen(false)}
        onSuccess={(updatedAddr) => {
          mutate("user/addresses");
          if (selectedAddressId === updatedAddr.id) {
            onSelectAddress?.(updatedAddr);
          }
        }}
      />
    </Box>
  );
};

export default CheckoutAddressSection;
