import React from "react";
import { Dialog, DialogTitle, DialogContent, IconButton, Box, Button, useMediaQuery } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import useStyles from "./checkout-address-book-modal.styles";
import { StackRowAlignCenterJustBetween } from "@/components/styled";
import CheckoutSectionHeaderComponent from "../../../checkout-header/checkout-header.component";
import CheckoutAddressItem, { Address } from "../checkout-address-item/checkout-address-item.component";

interface CheckoutAddressBookModalProps {
  open: boolean;
  onClose: () => void;
  addresses: Address[];
  selectedAddressId: string;
  onSelect: (address: Address) => void;
  onUpdate: (address: Address) => void;
  onAdd: () => void;
}

const CheckoutAddressBookModal: React.FC<CheckoutAddressBookModalProps> = ({
  open,
  onClose,
  addresses,
  selectedAddressId,
  onSelect,
  onUpdate,
  onAdd,
}) => {
  const { classes } = useStyles();
  const isMobile = useMediaQuery("(max-width:810px)");

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
        <StackRowAlignCenterJustBetween>
          <CheckoutSectionHeaderComponent title="SỔ ĐỊA CHỈ" />
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </StackRowAlignCenterJustBetween>
      </DialogTitle>

      <DialogContent className={classes.modalContent}>
        {addresses.map((addr) => (
          <CheckoutAddressItem
            key={addr.id}
            address={addr}
            selected={selectedAddressId === addr.id}
            onSelect={onSelect}
            onUpdate={onUpdate}
          />
        ))}
      </DialogContent>

      <Box className={classes.footer}>
        <Button className={classes.addButton} fullWidth onClick={onAdd} startIcon={<AddIcon />}>
          Thêm Địa Chỉ
        </Button>
      </Box>
    </Dialog>
  );
};

export default CheckoutAddressBookModal;
