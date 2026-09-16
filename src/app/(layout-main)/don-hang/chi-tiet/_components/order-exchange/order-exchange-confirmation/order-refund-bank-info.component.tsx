"use client";

import { Box, Typography } from "@mui/material";
import TextFieldComponent from "@/components/text-field/text-field.component";
import TextFieldDropdownComponent from "@/components/text-field/text-field-dropdown.component";
import {
  normalizeRefundBankAccountHolder,
  REFUND_BANK_OPTIONS,
  type OrderReturnRefundBankValues,
} from "@/app/(layout-main)/don-hang/chi-tiet/_utils/order-return-refund-bank.util";
import useStyles from "./order-exchange-address/order-exchange-address.styles";

interface OrderRefundBankInfoProps {
  values: OrderReturnRefundBankValues;
  onChange: (next: OrderReturnRefundBankValues) => void;
}

function OrderRefundBankInfo({ values, onChange }: OrderRefundBankInfoProps) {
  const { classes } = useStyles();

  function updateField<K extends keyof OrderReturnRefundBankValues>(key: K, value: OrderReturnRefundBankValues[K]) {
    onChange({ ...values, [key]: value });
  }

  return (
    <Box className={classes.root}>
      <Typography className={classes.sectionTitle}>Thông tin tài khoản ngân hàng</Typography>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
          gap: "16px",
        }}
      >
        <TextFieldComponent
          required
          label="Tên chủ tài khoản"
          value={values.refundBankAccountHolder}
          onValueChange={(v) => updateField("refundBankAccountHolder", v.toUpperCase())}
          onBlur={() => updateField("refundBankAccountHolder", normalizeRefundBankAccountHolder(values.refundBankAccountHolder))}
        />
        <TextFieldComponent
          required
          label="Số tài khoản ngân hàng"
          value={values.refundBankAccountNumber}
          onValueChange={(v) => updateField("refundBankAccountNumber", v.replace(/[^A-Za-z0-9]/g, "").slice(0, 25))}
        />
        <TextFieldDropdownComponent
          required
          label="Tên ngân hàng"
          value={values.refundBankName}
          options={REFUND_BANK_OPTIONS}
          onSelect={(val) => updateField("refundBankName", val)}
        />
        <TextFieldComponent
          required
          label="Chi nhánh ngân hàng"
          value={values.refundBankBranch}
          onValueChange={(v) => updateField("refundBankBranch", v)}
        />
      </Box>
    </Box>
  );
}

export default OrderRefundBankInfo;
