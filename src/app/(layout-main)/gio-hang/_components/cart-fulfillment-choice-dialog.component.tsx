"use client";

import { Box, Button, Dialog, DialogContent, Typography } from "@mui/material";
import { XClose } from "@untitledui/icons";
import {
  CART_CHECKOUT_CTA_PAY_NOW,
  CART_CHECKOUT_CTA_PRE_ORDER,
  MIXED_RETAIL_PREORDER_MESSAGE,
  type CartFulfillmentGroup,
} from "@/utils/api/cart/cart-availability.util";
import { StackRowAlignCenterJustEnd } from "@/components/styled";
import useCartFulfillmentChoiceDialogStyles from "./cart-fulfillment-choice-dialog.styles";

export interface CartFulfillmentChoiceDialogProps {
  open: boolean;
  onClose: () => void;
  onChoose: (group: CartFulfillmentGroup) => void;
  isLoading?: boolean;
  modalZIndex?: number;
  title?: string;
}

function CartFulfillmentChoiceDialog({
  open,
  onClose,
  onChoose,
  isLoading = false,
  modalZIndex,
  title = MIXED_RETAIL_PREORDER_MESSAGE,
}: CartFulfillmentChoiceDialogProps) {
  const { classes } = useCartFulfillmentChoiceDialogStyles();

  return (
    <Dialog open={open} onClose={onClose} className={classes.dialog} sx={modalZIndex ? { zIndex: modalZIndex } : undefined}>
      <StackRowAlignCenterJustEnd className={classes.closeButtonWrap} onClick={onClose}>
        <XClose size={32} style={{ cursor: "pointer" }} />
      </StackRowAlignCenterJustEnd>
      <Box className={classes.container}>
        <DialogContent className={classes.content}>
          <Typography className={classes.title}>{title}</Typography>
        </DialogContent>

        <Box className={classes.actions}>
          <Button className={classes.outlinedButton} onClick={() => onChoose("PRE_ORDER")} disabled={isLoading}>
            {CART_CHECKOUT_CTA_PRE_ORDER}
          </Button>
          <Button className={classes.filledButton} onClick={() => onChoose("RETAIL")} disabled={isLoading}>
            {CART_CHECKOUT_CTA_PAY_NOW}
          </Button>
        </Box>
      </Box>
    </Dialog>
  );
}

export default CartFulfillmentChoiceDialog;
