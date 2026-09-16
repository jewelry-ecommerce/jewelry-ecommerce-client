import React from "react";
import { Box, Stack, Typography } from "@mui/material";
import Image from "next/image";
import { ArrowNarrowRight } from "@untitledui/icons";
import useStyles from "./my-account-sidebar.styles";
import { useAppDispatch } from "@/redux/hooks";
import { logOut } from "@/redux/slices/auth.slice";
import { useRouter } from "next/navigation";
import { AuthApi } from "@/utils/api";
import { StackRowAlignCenter, StackRowAlignJustCenter } from "@/components/styled";
import { toast } from "react-toastify";
import { clearUserScopedSwrCache } from "@/lib/swr";

interface SidebarItem {
  id: string;
  label: string;
  icon: string;
  path?: string;
  action?: () => void;
}

interface MyAccountSidebarProps {
  activeId: string;
  onItemClick: (id: string) => void;
  onLogoutStart?: () => void;
}

const MyAccountSidebar = ({ activeId, onItemClick, onLogoutStart }: MyAccountSidebarProps) => {
  // hook
  const { classes, cx } = useStyles();
  const dispatch = useAppDispatch();
  const router = useRouter();

  const handleLogout = async () => {
    onLogoutStart?.();

    try {
      await AuthApi.logoutViaRoute();
    } catch {
      // still clear client state even if backend logout fails
    } finally {
      await clearUserScopedSwrCache();
      dispatch(logOut());
      router.push("/");
      toast.success("Đăng xuất thành công");
    }
  };

  const menuItems: SidebarItem[] = [
    { id: "thong-tin-tai-khoan", label: "Thông tin tài khoản", icon: "/image/icons/icon-user.svg" },
    { id: "lich-su-don-hang", label: "Lịch sử đơn hàng", icon: "/image/icons/icon-file-check.svg" },
    { id: "uu-dai-cua-ban", label: "Ưu đãi của bạn", icon: "/image/icons/icon-ticket.svg" },
    { id: "so-dia-chi", label: "Sổ địa chỉ", icon: "/image/icons/icon-marker-pin.svg" },
    { id: "gioi-thieu-ban-be", label: "Giới thiệu bạn bè", icon: "/image/icons/icon-user-plus.svg" },
    { id: "logout", label: "Đăng xuất", icon: "/image/icons/icon-logout.svg", action: handleLogout },
  ];

  return (
    <Stack className={classes.sidebarRoot}>
      {menuItems.map((item) => {
        const isActive = activeId === item.id;
        return (
          <Box
            component="button"
            key={item.id}
            className={cx(classes.sidebarItem, isActive && classes.sidebarItemActive, item.id === "logout" && classes.sidebarItemLogout)}
            onClick={() => {
              if (item.action) {
                item.action();
              } else {
                onItemClick(item.id);
              }
            }}
          >
            <StackRowAlignCenter className={classes.itemLeft}>
              <StackRowAlignJustCenter className={cx(classes.iconBox, isActive && classes.iconBoxActive)}>
                <Image src={item.icon} alt={item.label} width={24} height={24} />
              </StackRowAlignJustCenter>
              <Typography className={cx(classes.label, isActive && classes.labelActive)}>{item.label}</Typography>
            </StackRowAlignCenter>
            {item.id !== "logout" && (
              <Box className={cx(classes.arrowIcon, isActive && classes.arrowIconActive)}>
                <ArrowNarrowRight size={24} color={isActive ? "#fff" : "#101828"} />
              </Box>
            )}
          </Box>
        );
      })}
    </Stack>
  );
};

export default MyAccountSidebar;
