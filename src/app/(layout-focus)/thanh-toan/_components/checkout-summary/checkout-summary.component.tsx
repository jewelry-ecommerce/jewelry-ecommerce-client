import React from "react";
import { Box, Stack, Typography, Skeleton } from "@mui/material";
import CheckoutSectionHeaderComponent from "../checkout-header/checkout-header.component";
import TextFieldComponent from "@/components/text-field/text-field.component";
import Image from "next/image";
import useStyles from "./checkout-summary.styles";
import { StackRowAlignCenter } from "@/components/styled";
import { toast } from "react-toastify";
import { IS_LOYALTY_UI_ENABLED } from "@/utils/constants/commerce-feature.constant";

export interface DiscountItem {
  label: string;
  value: string;
}

export interface CheckoutSummarySectionProps {
  subtotal: string;
  shippingFee: string;
  originalShippingFee?: string;
  totalDiscount: string;
  discounts: DiscountItem[];
  pointsAvailable: number;
  pointsValue: string;
  pointsUsed: number;
  pointsDiscount?: string;
  onPointsChange?: (val: number) => void;
  total: string;
  earnedPointsText: string;
  isLoggedIn?: boolean;
  showTitle?: boolean;
  hidePointsBalance?: boolean;
  forceShowPointsRow?: boolean;
  isLoading?: boolean;
}

const CheckoutSummarySection = ({
  subtotal,
  shippingFee,
  originalShippingFee,
  totalDiscount,
  discounts,
  pointsAvailable,
  pointsValue,
  pointsUsed,
  pointsDiscount,
  onPointsChange,
  total,
  earnedPointsText,
  isLoggedIn = false,
  showTitle = true,
  hidePointsBalance = false,
  forceShowPointsRow = false,
  isLoading = false,
}: CheckoutSummarySectionProps) => {
  const { classes, cx } = useStyles();

  const showPointsHeader = IS_LOYALTY_UI_ENABLED && (isLoggedIn || pointsUsed > 0) && !hidePointsBalance;
  const showPointsInput = IS_LOYALTY_UI_ENABLED && isLoggedIn && !!onPointsChange && !hidePointsBalance;
  const showPointsDetail = (pointsUsed > 0 && !!pointsDiscount) || forceShowPointsRow;

  const renderValue = (value: string, width: number = 60) => {
    if (isLoading) {
      return <Skeleton variant="text" width={width} />;
    }
    return value;
  };

  return (
    <Stack className={classes.root}>
      {showTitle && <CheckoutSectionHeaderComponent title="TỔNG TIỀN" />}

      <Stack className={classes.summaryTable}>
        <Box className={classes.row}>
          <Typography className={classes.textBase}>{renderValue("Tạm tính", 80)}</Typography>
          <Typography className={classes.textValue}>{renderValue(subtotal)}</Typography>
        </Box>

        <Box className={classes.row}>
          <Typography className={classes.textBase}>{renderValue("Phí vận chuyển và bảo hiểm hàng hóa", 100)}</Typography>
          <Box className={classes.shippingValueWrapper}>
            {originalShippingFee ? (
              <Typography className={classes.originalShippingFee}>{renderValue(originalShippingFee)}</Typography>
            ) : null}
            <Typography className={classes.shippingFeeValue}>{renderValue(shippingFee)}</Typography>
          </Box>
        </Box>

        {totalDiscount !== "0đ" && (
          <Box className={classes.row}>
            <Typography className={classes.textBase}>{renderValue("Tổng khuyến mãi", 110)}</Typography>
            <Typography className={classes.textValue}>{renderValue(totalDiscount)}</Typography>
          </Box>
        )}

        <Box component="ul" sx={{ m: 0, p: 0, listStyle: "none" }}>
          {discounts?.map((discount, idx) => (
            <Box className={cx(classes.row, classes.discountRow)} component="li" key={idx} sx={{ pl: 2 }}>
              <Typography className={cx(classes.discountText, !isLoading && classes.discountLabel)}>
                {renderValue(discount.label, 140)}
              </Typography>
              <Typography className={classes.discountValue}>{renderValue(discount.value)}</Typography>
            </Box>
          ))}
        </Box>

        <Stack className={classes.pointsWrapper}>
          {showPointsHeader && (
            <React.Fragment>
              <StackRowAlignCenter className={classes.pointsInfo}>
                <Image src="/image/icons/icon-point.svg" alt="coin" width={15} height={15} className={classes.coinIcon} />
                <Box>
                  <Typography component="span" className={classes.pointsText}>
                    {pointsAvailable} Điểm{" "}
                  </Typography>
                  <Typography component="span" className={classes.pointsDiscount}>
                    ({pointsValue})
                  </Typography>
                </Box>
              </StackRowAlignCenter>

              {showPointsInput && (
                <Box className={classes.stepperWrapper}>
                  <TextFieldComponent
                    label="Nhập điểm"
                    value={pointsUsed === 0 ? "" : pointsUsed.toString()}
                    onValueChange={(val: string) => {
                      const numValue = parseInt(val, 10) || 0;
                      if (numValue > pointsAvailable) {
                        toast.error(
                          `Bạn không đủ điểm để thực hiện hành động này. Số điểm tối đa bạn có thể sử dụng là: ${pointsAvailable}`,
                          {
                            toastId: "points-limit-exceeded",
                          },
                        );
                      }
                      const cappedValue = Math.min(Math.max(0, numValue), pointsAvailable);
                      onPointsChange?.(cappedValue);
                    }}
                    onKeyDown={(e) => {
                      if (["+", "-", ".", ",", "e", "E"].includes(e.key)) {
                        e.preventDefault();
                      }
                    }}
                    type="number"
                  />
                </Box>
              )}

              {showPointsDetail && (
                <Box className={classes.row} sx={{ pl: 2 }}>
                  <Typography className={cx(classes.discountText, !isLoading && classes.discountLabel)}>
                    {renderValue(`${pointsUsed} điểm`, 80)}
                  </Typography>
                  <Typography className={classes.discountValue}>{renderValue(pointsDiscount || "")}</Typography>
                </Box>
              )}
            </React.Fragment>
          )}

          <Box className={classes.row}>
            <Typography className={classes.totalLabelValue}>{renderValue("Tổng cộng", 50)}</Typography>
            <Typography className={classes.totalValue}>{renderValue(total)}</Typography>
          </Box>

          {IS_LOYALTY_UI_ENABLED && isLoggedIn ? (
            <Box className={classes.row}>
              <Typography className={classes.caption}>{earnedPointsText}</Typography>
            </Box>
          ) : null}
        </Stack>
      </Stack>
    </Stack>
  );
};

export default CheckoutSummarySection;
