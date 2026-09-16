import { Box, Button, Divider, Skeleton, Typography, useMediaQuery, useTheme } from "@mui/material";
import Image from "next/image";
import { RefObject } from "react";
import { CartCalculateTotalResponse } from "@/utils/api/cart/cart.interface";
import { StackRowAlignCenter } from "@/components/styled";
import { useNavigation } from "@/hooks/use-navigation";
import { IS_LOYALTY_UI_ENABLED } from "@/utils/constants/commerce-feature.constant";

export type CartViewStyles = Record<string, string>;

export type CartSummaryProps = {
  summaryValues: CartCalculateTotalResponse;
  isCalculating: boolean;
  classes: CartViewStyles;
  cx: (...args: any[]) => string;
  onCheckout: () => Promise<void>;
  isInitiatingCheckout: boolean;
  checkoutButtonLabel: string;
  mobileSummaryBarRef?: RefObject<HTMLDivElement | null>;
};

const CartSummaryComponent = ({
  summaryValues,
  isCalculating,
  classes,
  onCheckout,
  isInitiatingCheckout,
  checkoutButtonLabel,
  mobileSummaryBarRef,
}: CartSummaryProps) => {
  const { gotoPage } = useNavigation();
  const theme = useTheme();
  const isMobileSummary = useMediaQuery(theme.breakpoints.down("lg"));
  if (isCalculating) {
    return (
      <>
        <Box className={classes.summaryRow}>
          <Skeleton width="40%" />
          <Skeleton width="30%" />
        </Box>
        <Box className={classes.summarySubRow}>
          <Skeleton width="50%" />
          <Skeleton width="40%" />
        </Box>
        <Box className={classes.summarySubRow}>
          <Skeleton width="50%" />
          <Skeleton width="40%" />
        </Box>
        <Box className={classes.summarySubRow}>
          <Skeleton width="50%" />
          <Skeleton width="40%" />
        </Box>
        <Divider className={classes.summaryDivider} />
        <Skeleton width="100%" height={30} />
        <Skeleton width="100%" height={32} />
        <Skeleton width="100%" height={40} />
      </>
    );
  }

  return (
    <>
      <Box className={classes.summaryRow}>
        <Typography className={classes.summaryLabel}>Tạm tính</Typography>
        <Typography className={classes.summaryValue}>{new Intl.NumberFormat("vi-VN").format(summaryValues.subTotal)}đ</Typography>
      </Box>
      {/* <Box className={classes.summarySubRow}>
        <Typography className={classes.summaryLabel}>Tổng khuyến mãi</Typography>
        <Typography className={classes.summaryValue}>-{new Intl.NumberFormat("vi-VN").format(summaryValues.discountTotal)}đ</Typography>
      </Box> */}
      <Box component="ul" className={classes.summaryList}>
        {summaryValues.discounts.map((discount, index) => (
          <li key={index} className={classes.summaryItem}>
            <div className={classes.summarySubRow}>
              <Typography
                className={discount.label === "VIP" || discount.label === "vip" ? classes.summarySubLabelBold : classes.summaryLabel}
              >
                {discount.label}
              </Typography>
              <Typography className={classes.summaryValue}>{new Intl.NumberFormat("vi-VN").format(discount.value)}đ</Typography>
            </div>
          </li>
        ))}
      </Box>
      {/* <Box className={classes.summarySubRow}>
        <Typography className={classes.summaryLabel}>Giao hàng</Typography>
        <Typography className={classes.summaryValue}>
          {summaryValues.shippingFee === 0 ? "Miễn phí" : `${new Intl.NumberFormat("vi-VN").format(summaryValues.shippingFee)}đ`}
        </Typography>
      </Box> */}

      {!isMobileSummary ? (
        <>
          <Divider className={classes.summaryDivider} />
          <Box className={classes.summaryTotalRow}>
            <Typography className={classes.summaryTotalLabel}>Tổng cộng</Typography>
            <Typography className={classes.summaryTotalValue}>
              {new Intl.NumberFormat("vi-VN").format(summaryValues.totalAmount)}đ
            </Typography>
          </Box>
          {IS_LOYALTY_UI_ENABLED ? (
            <Box className={classes.summaryTotalReward}>
              <Typography className={classes.summaryTotalLabel}>Điểm thưởng</Typography>
              <StackRowAlignCenter gap={0.5}>
                <Image src="/image/icons/icon-point.svg" alt="coin" width={15} height={15} className={classes.summaryRewardIcon} />
                <Typography className={classes.summaryReward}> +{summaryValues.rewardPoints}</Typography>
              </StackRowAlignCenter>
            </Box>
          ) : null}

          <Button fullWidth className={classes.summaryButton} onClick={onCheckout} disabled={isInitiatingCheckout}>
            {checkoutButtonLabel}
          </Button>
          <Button fullWidth variant="outlined" className={classes.summaryButtonOutlined} onClick={() => gotoPage("/san-pham")}>
            Tiếp Tục Mua Hàng
          </Button>
        </>
      ) : (
        <Box ref={mobileSummaryBarRef} className={classes.summaryMobileBar}>
          <Box className={classes.summaryTotalRow}>
            <Typography className={classes.summaryTotalLabel}>Tổng tiền</Typography>
            <Typography className={classes.summaryTotalValue}>
              {new Intl.NumberFormat("vi-VN").format(summaryValues.totalAmount)}đ
            </Typography>
          </Box>
          {IS_LOYALTY_UI_ENABLED ? (
            <Box className={classes.summaryTotalReward}>
              <Typography className={classes.summaryTotalLabel}>Điểm thưởng</Typography>
              <StackRowAlignCenter gap={0.5}>
                <Image src="/image/icons/icon-point.svg" alt="coin" width={15} height={15} className={classes.summaryRewardIcon} />
                <Typography className={classes.summaryReward}> +{summaryValues.rewardPoints}</Typography>
              </StackRowAlignCenter>
            </Box>
          ) : null}

          <Button fullWidth className={classes.summaryButton} onClick={onCheckout} disabled={isInitiatingCheckout}>
            {checkoutButtonLabel}
          </Button>
          <Button fullWidth variant="outlined" className={classes.summaryButtonOutlined} onClick={() => gotoPage("/san-pham")}>
            Tiếp Tục Mua Hàng
          </Button>
        </Box>
      )}
    </>
  );
};

export default CartSummaryComponent;
