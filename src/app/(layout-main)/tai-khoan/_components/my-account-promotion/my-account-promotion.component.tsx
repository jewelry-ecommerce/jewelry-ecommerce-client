"use client";

import React from "react";
import { Box, Typography, Skeleton, useTheme, useMediaQuery, Stack } from "@mui/material";
import useStyles from "./my-account-promotion.styles";
import { TYPOGRAPHY_STYLES } from "@/utils/constants/typography.constant";
import EmptyComponent from "@/components/empty/empty.component";
import VoucherItem from "@/app/(layout-focus)/thanh-toan/_components/checkout-voucher/voucher-item.component";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

interface AccountPromotionVoucher {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  code: string;
}

export const MOCK_ACTIVE_VOUCHERS: AccountPromotionVoucher[] = [];

export const MOCK_EXPIRED_VOUCHERS: AccountPromotionVoucher[] = [];

interface MyAccountPromotionProps {
  isLoading?: boolean;
}

const SectionSkeleton = () => {
  const { classes } = useStyles();
  return (
    <Box className={classes.sectionCard}>
      <Skeleton variant="text" width={180} height={32} />
      <Box className={classes.voucherGrid}>
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} variant="rectangular" height={100} sx={{ borderRadius: "4px" }} />
        ))}
      </Box>
    </Box>
  );
};

const MyAccountPromotion = ({ isLoading = false }: MyAccountPromotionProps) => {
  // hook
  const { classes } = useStyles();
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down(810));

  // function
  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("Đã sao chép mã thành công");
  };

  return (
    <Stack id="uu-dai-cua-ban" sx={{ gap: "24px" }}>
      {!isMobile && (
        <Typography
          sx={{
            ...TYPOGRAPHY_STYLES.xl.bold,
            color: "#27251F",
            textTransform: "uppercase",
          }}
        >
          Ưu đãi của tôi
        </Typography>
      )}

      {isLoading ? (
        <Stack spacing={2}>
          <SectionSkeleton />
          <SectionSkeleton />
        </Stack>
      ) : !(MOCK_ACTIVE_VOUCHERS.length > 0 || MOCK_EXPIRED_VOUCHERS.length > 0) ? (
        <EmptyComponent
          url="/image/icons/icon-empty-promotion.svg"
          title="Chưa có mã ưu đãi"
          subtitle="Hiện chưa có voucher khả dụng, nhưng vẫn còn nhiều thiết kế dành cho phong cách của bạn."
          buttonText="Bắt Đầu Mua Sắm"
          onClick={() => router.push("/san-pham")}
        />
      ) : (
        <React.Fragment>
          {/* Active Vouchers */}
          <Box className={classes.sectionCard}>
            <Typography className={classes.sectionTitle}>Ưu đãi có hiệu lực</Typography>
            <Box className={classes.voucherGrid}>
              {MOCK_ACTIVE_VOUCHERS.map((voucher) => (
                <VoucherItem
                  key={voucher.id}
                  id={voucher.id}
                  title={voucher.title}
                  subtitle={voucher.subtitle}
                  image={voucher.image}
                  isSelected={false}
                  actionType="copy"
                  onCopy={() => handleCopy(voucher.code)}
                  onToggle={() => {}}
                  onShowCondition={() => {}}
                />
              ))}
            </Box>
          </Box>

          {/* Expired Vouchers */}
          <Box className={classes.sectionCard}>
            <Typography className={classes.sectionTitle}>Ưu đãi hết hạn</Typography>
            <Box className={classes.voucherGrid}>
              {MOCK_EXPIRED_VOUCHERS.map((voucher) => (
                <VoucherItem
                  key={voucher.id}
                  id={voucher.id}
                  title={voucher.title}
                  subtitle={voucher.subtitle}
                  image={voucher.image}
                  isSelected={false}
                  isDisable={true}
                  actionType="copy"
                  onCopy={() => handleCopy(voucher.code)}
                  onToggle={() => {}}
                  onShowCondition={() => {}}
                />
              ))}
            </Box>
          </Box>
        </React.Fragment>
      )}
    </Stack>
  );
};

export default MyAccountPromotion;
