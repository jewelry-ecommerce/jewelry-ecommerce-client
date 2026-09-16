"use client";

import React, { useMemo } from "react";
import { Box, Typography, Popover, Stack, Drawer } from "@mui/material";
import Image from "next/image";
import { buildAuthUrl } from "@/utils/helpers/common/navigation";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { toast } from "react-toastify";
import { XClose } from "@untitledui/icons";
import { StackRowAlignCenter, StackRowAlignCenterJustBetween, StackRowAlignStartJustBetween } from "@/components/styled";
import { TYPOGRAPHY_STYLES } from "@/utils/constants/typography.constant";
import { REFER_SHARE_CODE_DESCRIPTION } from "@/utils/constants/refer.constant";
import { AuthUser } from "@/utils/api/auth/auth.interface";
import useStyles from "./header-user-account.styles";
import { CheckoutApi } from "@/utils/api";
import { MOCK_ACTIVE_VOUCHERS } from "@/app/(layout-main)/tai-khoan/_components/my-account-promotion/my-account-promotion.component";
import { RemoveScroll } from "react-remove-scroll";

interface HeaderUserAccountProps {
  user: AuthUser | null;
  anchorElUser: HTMLDivElement | null;
  setAnchorElUser: (el: HTMLDivElement | null) => void;
  isUserDrawerOpen: boolean;
  setIsUserDrawerOpen: (open: boolean) => void;
}

const HeaderUserAccount = ({ user, anchorElUser, setAnchorElUser, isUserDrawerOpen, setIsUserDrawerOpen }: HeaderUserAccountProps) => {
  // hook
  const { classes } = useStyles();
  const router = useRouter();

  const { data: ordersResponse } = useSWR(user && isUserDrawerOpen ? ["header-user-orders-count", user.id] : null, () =>
    CheckoutApi.getOrdersMe({
      page: 1,
      take: 1,
    }),
  );
  // data
  const orderCount = ordersResponse?.summary.ALL || 0;
  const activeVoucherCount = MOCK_ACTIVE_VOUCHERS.length;
  const referralCode = user?.phone || user?.id || "";
  const formattedOrderCount = orderCount > 99 ? "99+" : `${orderCount}`;
  const formattedVoucherCount = activeVoucherCount > 99 ? "99+" : `${activeVoucherCount}`;
  const accountActions = useMemo(
    () => [
      {
        key: "thong-tin-tai-khoan",
        label: "Thông tin tài khoản",
        icon: "/image/icons/icon-user.svg",
        href: "/tai-khoan?tab=thong-tin-tai-khoan",
      },
      {
        key: "lich-su-don-hang",
        label: "Lịch sử đơn hàng",
        icon: "/image/icons/icon-file-check.svg",
        href: "/tai-khoan?tab=lich-su-don-hang",
        badge: formattedOrderCount,
      },
      {
        key: "uu-dai-cua-ban",
        label: "Ưu đãi của bạn",
        icon: "/image/icons/icon-ticket.svg",
        href: "/tai-khoan?tab=uu-dai-cua-ban",
        badge: formattedVoucherCount,
      },
      {
        key: "so-dia-chi",
        label: "Sổ địa chỉ",
        icon: "/image/icons/icon-marker-pin.svg",
        href: "/tai-khoan?tab=so-dia-chi",
      },
    ],
    [formattedOrderCount, formattedVoucherCount],
  );

  // function
  const handleNavigate = (href: string) => {
    router.push(href);
    setIsUserDrawerOpen(false);
  };

  const handleCopyReferralCode = async () => {
    if (!referralCode) {
      return;
    }

    await navigator.clipboard.writeText(referralCode);
    toast.success("Đã sao chép mã giới thiệu thành công");
  };

  return (
    <React.Fragment>
      <Popover
        open={Boolean(anchorElUser)}
        anchorEl={anchorElUser}
        onClose={() => setAnchorElUser(null)}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        elevation={0}
        PaperProps={{ className: classes.userPopupPaper }}
        sx={{ mt: 1 }}
      >
        <Stack gap="40px">
          <Stack gap="10px">
            <Box
              component="button"
              className={classes.userPopupButton}
              onClick={() => {
                setAnchorElUser(null);
                router.push(buildAuthUrl("/dang-nhap"));
              }}
            >
              Đăng nhập
            </Box>
            <Box
              component="button"
              className={classes.userPopupButton}
              onClick={() => {
                setAnchorElUser(null);
                router.push(buildAuthUrl("/dang-ky"));
              }}
            >
              Đăng ký
            </Box>
          </Stack>
          <Typography className={classes.userPopupText}>Rất nhiều đặc quyền và quyền lợi mua sắm đang chờ bạn</Typography>
        </Stack>
      </Popover>

      <Drawer
        anchor="right"
        open={isUserDrawerOpen}
        onClose={() => setIsUserDrawerOpen(false)}
        PaperProps={{ className: classes.userDrawerPaper }}
        ModalProps={{ disableScrollLock: true }}
      >
        <Box className={classes.userDrawerHeader}>
          <StackRowAlignCenterJustBetween>
            <Box>
              <StackRowAlignCenter>
                <Typography className={classes.userDrawerName}>Thân chào, {user?.firstName}</Typography>
                {/* <Box className={classes.userDrawerBadge}>Silver</Box> */}
              </StackRowAlignCenter>
              {/* <Box className={classes.userDrawerPoints}>
                <Image src="/image/icons/icon-point.svg" alt="coin" width={20} height={20} />
                <Typography className={classes.userDrawerPointsText}>1999 điểm</Typography>
              </Box> */}
            </Box>
            <Box className={classes.userDrawerClose} onClick={() => setIsUserDrawerOpen(false)}>
              <XClose size={24} />
            </Box>
          </StackRowAlignCenterJustBetween>
        </Box>

        <RemoveScroll enabled={isUserDrawerOpen} forwardProps>
          <Box className={classes.userDrawerContent}>
            {/* Points Card */}
            {/* <Box className={classes.pointsCard}>
            <Typography className={classes.pointsCardTitle}>Bạn đang có</Typography>
            <Box className={classes.pointsCardValue}>
              <Coins03 size={24} color="#FACC15" />
              1999 điểm
            </Box>
            <StackRowAlignCenter sx={{ gap: 0.5, mt: 1 }}>
              <Typography sx={{ ...TYPOGRAPHY_STYLES.xs.regular, color: "#71717A" }}>Chờ: 0 điểm</Typography>
              <InfoCircle size={14} color="#71717A" />
            </StackRowAlignCenter>

            <Box className={classes.levelSection}>
              <Box className={classes.levelProgressLine}>
                <Box className={classes.levelProgressFill} />
              </Box>
              <Box className={classes.levelItem}>
                <Box className={cx(classes.levelLabel, classes.levelLabelActive)}>Silver</Box>
              </Box>
              <Box className={classes.levelItem}>
                <Box className={classes.levelLabel}>Gold</Box>
              </Box>
              <Box className={classes.levelItem}>
                <Box className={classes.levelLabel}>Silver</Box>
              </Box>
              <Box className={classes.levelItem}>
                <Box className={classes.levelLabel}>Silver</Box>
              </Box>
            </Box>

            <Typography sx={{ ...TYPOGRAPHY_STYLES.xs.bold, color: "#27251F", mt: 3, textAlign: "center", fontStyle: "italic" }}>
              Hạng thành viên được vừa được xét lại vào ngày{" "}
              <Box component="span" sx={{ fontWeight: 800 }}>
                01/01/2026
              </Box>
              , ngày xét hạng tiếp theo:{" "}
              <Box component="span" sx={{ fontWeight: 800 }}>
                01/04/2026
              </Box>
            </Typography>
          </Box> */}

            {/* Refer Section */}
            <Box sx={{ p: 2, backgroundColor: "#FAFAFA", mb: 2 }}>
              <StackRowAlignStartJustBetween gap={1}>
                <Stack sx={{ gap: 0.5 }}>
                  <Typography sx={{ ...TYPOGRAPHY_STYLES.lg.bold, color: "#27251F", textTransform: "uppercase" }}>
                    Giới thiệu bạn bè
                  </Typography>
                  <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: "#737373" }}>{REFER_SHARE_CODE_DESCRIPTION}</Typography>
                </Stack>
                <Box
                  component="button"
                  onClick={handleCopyReferralCode}
                  sx={{
                    ...TYPOGRAPHY_STYLES.base.bold,
                    padding: "6px 12px",
                    border: "1px solid #0A0A0A",
                    cursor: "pointer",
                    color: "#0A0A0A",
                    whiteSpace: "nowrap",
                    backgroundColor: "transparent",
                  }}
                >
                  Sao Chép Mã
                </Box>
              </StackRowAlignStartJustBetween>
            </Box>

            {/* Icons Grid */}
            <Box className={classes.actionGrid}>
              {accountActions.map((action) => (
                <Box key={action.key} className={classes.actionItem} onClick={() => handleNavigate(action.href)}>
                  <Box className={classes.actionIconWrapper}>
                    <Image src={action.icon} alt={action.label} width={32} height={32} />
                    {action.badge && <Box className={classes.actionBadge}>{action.badge}</Box>}
                  </Box>
                  <Typography className={classes.actionLabel}>{action.label}</Typography>
                </Box>
              ))}
            </Box>
          </Box>
        </RemoveScroll>
        <Box sx={{ p: "0 20px 16px", flexShrink: 0 }}>
          <Box component="button" className={classes.accountButton} onClick={() => handleNavigate("/tai-khoan?tab=thong-tin-tai-khoan")}>
            Tài khoản của tôi
          </Box>
        </Box>
      </Drawer>
    </React.Fragment>
  );
};

export default HeaderUserAccount;
