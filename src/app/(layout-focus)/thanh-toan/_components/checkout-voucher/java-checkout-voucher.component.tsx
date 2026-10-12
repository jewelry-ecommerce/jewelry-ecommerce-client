"use client";
import { useState } from "react";
import { Dialog, DialogTitle, DialogContent, IconButton, Typography, Stack } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { ArrowNarrowRight } from "@untitledui/icons";
import { toast } from "react-toastify";
import { ButtonComponent } from "@/components/button/button.component";
import TextFieldComponent from "@/components/text-field/text-field.component";
import { StackRowAlignCenterJustBetween } from "@/components/styled";
import { getErrorMessage } from "@/utils/helpers/axios";
import CheckoutSectionHeaderComponent from "../checkout-header/checkout-header.component";
import useStyles from "./checkout-voucher.styles";
interface Props { code: string; onApply: (code: string) => Promise<void>; showTitle?: boolean; readOnly?: boolean }
function VoucherCodeForm({ code, onApply }: Pick<Props, "code" | "onApply">) {
  const [input, setInput] = useState(code), [busy, setBusy] = useState(false);
  const apply = async (value: string) => {
    if (busy) return; setBusy(true);
    try { await onApply(value.trim()); toast.success(value.trim() ? "Đã áp dụng mã giảm giá." : "Đã bỏ mã giảm giá."); }
    catch (failure) { toast.error(getErrorMessage(failure) || "Không thể áp dụng mã giảm giá."); }
    finally { setBusy(false); }
  };
  return <Stack gap={2}>
    <Typography>Nhập một mã giảm giá. Giá và điều kiện áp dụng được kiểm tra lại trên hệ thống khi báo giá và đặt hàng.</Typography>
    <TextFieldComponent label="Mã giảm giá" value={input} onValueChange={setInput} disabled={busy} />
    <ButtonComponent content="Áp dụng" disabled={busy || !input.trim()} loading={busy} onClick={() => void apply(input)} />
    {code && <ButtonComponent content={"Bỏ mã " + code} disabled={busy} onClick={() => void apply("")} />}
  </Stack>;
}
export function JavaCheckoutVoucher({ code, onApply, showTitle = true, readOnly = false }: Props) {
  const [open, setOpen] = useState(false), { classes } = useStyles();
  return <Stack className={classes.root}>
    {showTitle && <CheckoutSectionHeaderComponent title="MÃ GIẢM GIÁ" />}
    <StackRowAlignCenterJustBetween className={classes.voucherWrapper} onClick={() => !readOnly && setOpen(true)} sx={{ cursor: readOnly ? "default" : "pointer" }}>
      <Typography className={classes.label}>{code || "Nhập mã giảm giá"}</Typography><ArrowNarrowRight size={18} />
    </StackRowAlignCenterJustBetween>
    <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
      <DialogTitle><StackRowAlignCenterJustBetween><Typography>Mã giảm giá</Typography>
        <IconButton aria-label="Đóng" onClick={() => setOpen(false)}><CloseIcon /></IconButton>
      </StackRowAlignCenterJustBetween></DialogTitle>
      <DialogContent><VoucherCodeForm key={code} code={code} onApply={onApply} /></DialogContent>
    </Dialog>
  </Stack>;
}
