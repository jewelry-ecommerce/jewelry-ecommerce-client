"use client";
import React, { useRef, useState, useEffect } from "react";
import { Box } from "@mui/material";
import { useSearchParams, useRouter } from "next/navigation";
import { useAppSelector } from "@/redux/hooks";
import { selectCurrentUser, selectIsAuthResolved, selectIsLogin } from "@/redux/slices/auth.slice";
import MyAccountSidebar from "./my-account-sidebar/my-account-sidebar.component";
import MyAccountProfile from "./my-account-profile/my-account-profile.component";
import { makeStyles } from "tss-react/mui";
import { StackRow } from "@/components/styled";
import { useMediaQuery, useTheme, Typography } from "@mui/material";
import { ArrowNarrowLeft, Plus } from "@untitledui/icons";
import useAddressStyles from "./my-account-address/my-account-address.styles";
import { TYPOGRAPHY_STYLES } from "@/utils/constants/typography.constant";
import useSWR from "swr";
import { AuthApi } from "@/utils/api";
import MyAccountPromotion from "./my-account-promotion/my-account-promotion.component";
import MyAccountAddress, { type MyAccountAddressHandle } from "./my-account-address/my-account-address.component";
import MyAccountPrefer from "./my-account-refer/my-account-refer.component";
import MyAccountHistoryOrders from "./my-account-history-orders/my-account-history-orders.component";
import { BreadcrumbComponent } from "@/components";

const useStyles = makeStyles()((theme) => ({
  root: {
    minHeight: "100vh",
  },
  container: {
    maxWidth: "1392px",
    width: "100%",
    margin: "0 auto",
    padding: "40px 0",
    boxSizing: "border-box",
    [theme.breakpoints.down("lg")]: {
      padding: "40px 16px",
    },
  },
  stack: {
    gap: "40px",
    alignItems: "flex-start",
    [theme.breakpoints.down("lg")]: {
      gap: "24px",
    },
    [theme.breakpoints.down(810)]: {
      gap: "0",
      flexDirection: "column",
    },
  },
  mobileHeader: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "24px",
    padding: "0 4px",
  },
  mobileHeaderTitle: {
    ...TYPOGRAPHY_STYLES.lg.bold,
    color: "#27251F",
    textTransform: "uppercase",
    flex: 1,
    minWidth: 0,
  },
  backButton: {
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "4px",
  },
}));

const MyAccount = () => {
  // hook
  const { classes } = useStyles();
  const { classes: addressClasses } = useAddressStyles();
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab");
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down(810));
  const isAuthResolved = useAppSelector(selectIsAuthResolved);
  const isLogin = useAppSelector(selectIsLogin);
  const currentUserId = useAppSelector(selectCurrentUser)?.id;
  const [activeId, setActiveId] = useState("profile");
  const [showSidebar, setShowSidebar] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const addressRef = useRef<MyAccountAddressHandle>(null);

  const { data: user, isLoading } = useSWR(
    isAuthResolved && isLogin && currentUserId ? ["customer-profile", currentUserId] : null,
    async () => await AuthApi.getCustomerProfile(),
  );
  useEffect(() => {
    if (!isAuthResolved) return;

    if (!isLogin && !isLoggingOut) {
      router.replace("/dang-nhap?callbackUrl=/tai-khoan");
    }
  }, [isAuthResolved, isLoggingOut, isLogin, router]);

  useEffect(() => {
    if (tab) {
      setActiveId(tab);
      if (isMobile) {
        setShowSidebar(false);
      }
    } else {
      if (isMobile) {
        setShowSidebar(true);
      }
    }
  }, [tab, isMobile]);

  const handleItemClick = (id: string) => {
    if (id === "logout") return;
    setActiveId(id);
    router.push(`/tai-khoan?tab=${id}`, { scroll: false });
  };

  const handleBack = () => {
    setShowSidebar(true);
    router.push("/tai-khoan", { scroll: false });
  };

  const getActiveTitle = () => {
    switch (activeId) {
      case "thong-tin-tai-khoan":
        return "Thông tin tài khoản";
      case "lich-su-don-hang":
        return "Lịch sử đơn hàng";
      case "uu-dai-cua-ban":
        return "Ưu đãi của bạn";
      case "so-dia-chi":
        return "Sổ địa chỉ";
      case "gioi-thieu-ban-be":
        return "Giới thiệu bạn bè";
      default:
        return "";
    }
  };

  const renderContent = () => {
    switch (activeId) {
      case "thong-tin-tai-khoan":
        return <MyAccountProfile user={user} isLoading={isLoading} />;
      case "lich-su-don-hang":
        return <MyAccountHistoryOrders />;
      case "uu-dai-cua-ban":
        return <MyAccountPromotion />;
      case "so-dia-chi":
        return <MyAccountAddress ref={addressRef} />;
      case "gioi-thieu-ban-be":
        return <MyAccountPrefer user={user} />;
      default:
        return <MyAccountProfile user={user} isLoading={isLoading} />;
    }
  };

  return (
    <>
      <BreadcrumbComponent items={[{ label: "Trang chủ", href: "/" }, { label: getActiveTitle() }]} />
      <Box className={classes.root}>
        <Box className={classes.container}>
          {!isAuthResolved || !isLogin ? null : isMobile ? (
            <Box>
              {showSidebar ? (
                <MyAccountSidebar activeId={activeId} onItemClick={handleItemClick} onLogoutStart={() => setIsLoggingOut(true)} />
              ) : (
                <Box>
                  <Box className={classes.mobileHeader}>
                    <Box className={classes.backButton} onClick={handleBack}>
                      <ArrowNarrowLeft size={24} color="#101828" />
                    </Box>
                    <Typography className={classes.mobileHeaderTitle}>{getActiveTitle()}</Typography>
                    {activeId === "so-dia-chi" ? (
                      <Box
                        component="button"
                        type="button"
                        className={addressClasses.addButton}
                        onClick={() => addressRef.current?.openAddDialog()}
                      >
                        <Plus size={24} color="#525252" />
                        <Typography className={addressClasses.addButtonText}>Thêm địa chỉ</Typography>
                      </Box>
                    ) : null}
                  </Box>
                  {renderContent()}
                </Box>
              )}
            </Box>
          ) : (
            <StackRow className={classes.stack}>
              <MyAccountSidebar activeId={activeId} onItemClick={handleItemClick} onLogoutStart={() => setIsLoggingOut(true)} />
              <Box
                sx={{
                  flex: 1,
                  minWidth: 0,
                  paddingLeft: "24px",
                  paddingTop: "12px",
                  borderLeft: "1px solid #E5E5E5",
                }}
              >
                {renderContent()}
              </Box>
            </StackRow>
          )}
        </Box>
      </Box>
    </>
  );
};

export default MyAccount;
