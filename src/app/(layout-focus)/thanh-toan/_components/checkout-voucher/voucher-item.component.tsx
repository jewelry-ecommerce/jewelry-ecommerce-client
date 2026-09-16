import React from "react";
import { Box, Typography, Stack } from "@mui/material";
import Image from "next/image";
import useStyles from "./checkout-voucher.styles";
import CheckboxComponent from "@/components/checkbox/checkbox.component";
import { Copy01 } from "@untitledui/icons";
import { StackRowAlignCenterJustBetween } from "@/components/styled";
import { useProductDefaultImage } from "@/components/providers.component";

interface VoucherItemProps {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  isSelected: boolean;
  isDisable?: boolean;
  conditionSummary?: string;
  onToggle: (id: string) => void;
  onShowCondition: (id: string, summary: string) => void;
  actionType?: "checkbox" | "copy";
  onCopy?: (e: React.MouseEvent) => void;
}

const VoucherItem = ({
  id,
  title,
  subtitle,
  image,
  isSelected,
  isDisable = false,
  conditionSummary = "",
  onToggle,
  onShowCondition,
  actionType = "checkbox",
  onCopy,
}: VoucherItemProps) => {
  const { classes } = useStyles();
  const productDefaultImage = useProductDefaultImage();
  const resolvedImage = image?.trim() || productDefaultImage;

  return (
    <Box className={`${classes.voucherItem} ${isDisable ? classes.disabled : ""}`} onClick={() => !isDisable && onToggle(id)}>
      <Box className={classes.voucherImage}>
        <Image src={resolvedImage} alt={title} fill style={{ objectFit: "cover" }} />
      </Box>
      <StackRowAlignCenterJustBetween className={classes.voucherInfo}>
        <Stack className={classes.infoText}>
          <Typography className={classes.voucherTitle}>{title}</Typography>
          <Typography className={classes.voucherSubtitle}>{subtitle}</Typography>
          <Typography
            className={classes.voucherCondition}
            onClick={(e) => {
              e.stopPropagation();
              if (!isDisable) onShowCondition(id, conditionSummary);
            }}
            style={{ pointerEvents: isDisable ? "none" : "auto" }}
          >
            Điều Kiện
          </Typography>
        </Stack>
        <Box
          className={classes.checkboxWrapper}
          style={{ pointerEvents: isDisable ? "none" : "auto" }}
          onClick={(e) => e.stopPropagation()}
        >
          {actionType === "copy" ? (
            <Copy01
              onClick={(e) => {
                e.stopPropagation();
                onCopy?.(e);
              }}
              size={18}
              color={isDisable ? "#A3A3A3" : "#171717"}
              strokeWidth={1.5}
              style={{ cursor: isDisable ? "default" : "pointer" }}
            />
          ) : (
            <CheckboxComponent
              checked={isSelected}
              disabled={isDisable}
              onChange={() => onToggle(id)}
              sxCheckbox={{
                backgroundColor: isSelected ? "#171717" : "transparent",
                color: "#FFFFFF",
                borderColor: isSelected ? "#171717" : "#E5E5E5",
                borderRadius: "6px",
              }}
              sx={{ width: "100%", height: "100%" }}
            />
          )}
        </Box>
      </StackRowAlignCenterJustBetween>
    </Box>
  );
};

export default VoucherItem;
