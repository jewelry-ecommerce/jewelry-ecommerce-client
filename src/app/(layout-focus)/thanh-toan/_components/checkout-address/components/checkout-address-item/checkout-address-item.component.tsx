import React from "react";
import { Box, Stack, Typography } from "@mui/material";
import useStyles from "./checkout-address-item.styles";
import { StackRowAlignCenter, StackRowAlignCenterJustBetween, StackRowAlignStartJustBetween } from "@/components/styled";
import CheckboxComponent from "@/components/checkbox/checkbox.component";

export interface Address {
  id: string;
  lastName: string;
  firstName: string;
  provinceCode: number;
  provinceName: string;
  wardCode: number;
  wardName: string;
  addressLine: string;
  receiverPhone: string;
  isDefault?: boolean;
}

interface CheckoutAddressItemProps {
  address: Address;
  selected?: boolean;
  onSelect: (address: Address) => void;
  onUpdate: (address: Address) => void;
}

const CheckoutAddressItem: React.FC<CheckoutAddressItemProps> = ({ address, selected = false, onSelect, onUpdate }) => {
  const { classes } = useStyles();

  return (
    <StackRowAlignStartJustBetween className={classes.addressItem} onClick={() => onSelect(address)}>
      <CheckboxComponent
        shape="circle"
        iconType="dot"
        checked={selected}
        onChange={() => onSelect(address)}
        size="medium"
        sxCheckbox={{
          backgroundColor: selected ? "#171717" : "transparent",
          borderColor: selected ? "#171717" : "#DEDEDE",
          color: selected ? "#FFFFFF" : "#DEDEDE",
        }}
      />

      <Stack className={classes.addressInfo}>
        <StackRowAlignCenterJustBetween>
          <StackRowAlignCenter>
            <Typography className={classes.addressName}>{address.firstName}</Typography>
            {address.isDefault && <Box className={classes.badge}>Mặc định</Box>}
          </StackRowAlignCenter>
          <Typography
            className={classes.updateLink}
            onClick={(e) => {
              e.stopPropagation();
              onUpdate(address);
            }}
          >
            Cập Nhật
          </Typography>
        </StackRowAlignCenterJustBetween>
        <Typography className={classes.addressPhone}>{address.receiverPhone}</Typography>
        <Typography className={classes.addressDetail}>
          {address.addressLine}, {address.wardName}, {address.provinceName}
        </Typography>
      </Stack>
    </StackRowAlignStartJustBetween>
  );
};

export default CheckoutAddressItem;
