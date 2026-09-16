"use client";

import React from "react";
import { Box, Typography, Stack, Avatar } from "@mui/material";
import CheckoutSectionHeaderComponent from "../checkout-header/checkout-header.component";
import AppLink from "@/components/app-link/app-link.component";
import useStyles from "./checkout-account.styles";
import { CHECKOUT_GUEST_ACCOUNT_DESCRIPTION } from "../../../../../utils/constants/checkout-account.constant";
import { StackRow, StackRowAlignCenter } from "@/components/styled";
import { usePathname, useSearchParams } from "next/navigation";
import { useTenantBrandName } from "@/components/providers.component";

interface UserProfile {
  name: string;
  email: string;
  avatar?: string;
}

interface CheckoutAccountSectionProps {
  user?: UserProfile;
  title?: string;
  description?: string;
  readOnly?: boolean;
}

const GuestEmailSection: React.FC<Omit<CheckoutAccountSectionProps, "user">> = ({
  description = CHECKOUT_GUEST_ACCOUNT_DESCRIPTION,
  readOnly,
}) => {
  const { classes } = useStyles({ user: undefined });
  const brandName = useTenantBrandName();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentPath = `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;
  const callbackParam = `?callbackUrl=${encodeURIComponent(currentPath)}`;

  return (
    <Box className={classes.rootWrapper}>
      <Stack className={classes.guestInfoWrapper}>
        <Typography className={classes.guestDescription}>
          {description}
          <br />
          {`Tham gia ${brandName} Keyholder ngay bây giờ! - "Đăng Ký" ngay. Chọn "Đăng Nhập" nếu bạn đã có tài khoản.`}
        </Typography>

        <StackRow className={classes.authLinksWrapper}>
          <AppLink
            href={`/dang-ky${callbackParam}`}
            className={classes.authLink}
            sx={readOnly ? { pointerEvents: "none", color: "#A3A3A3", textDecoration: "none" } : {}}
          >
            Đăng Ký
          </AppLink>
          <Typography sx={readOnly ? { color: "#A3A3A3" } : {}}>/</Typography>
          <AppLink
            href={`/dang-nhap${callbackParam}`}
            className={classes.authLink}
            sx={readOnly ? { pointerEvents: "none", color: "#A3A3A3", textDecoration: "none" } : {}}
          >
            Đăng Nhập
          </AppLink>
        </StackRow>
      </Stack>
    </Box>
  );
};

const UserProfileSection = ({ user }: { user: UserProfile }) => {
  const { classes } = useStyles({ user });

  return (
    <StackRowAlignCenter className={classes.userProfileWrapper}>
      <Avatar src={user.avatar} className={classes.userAvatar} />
      <Box>
        <Typography className={classes.userName}>{user.name || "Khách hàng"}</Typography>
      </Box>
    </StackRowAlignCenter>
  );
};

const CheckoutAccountSection: React.FC<CheckoutAccountSectionProps> = (props) => {
  const { user, title } = props;
  const { classes } = useStyles({ user });
  const brandName = useTenantBrandName();
  const sectionTitle = title || (user ? `Thân chào, ${user.name}` : `GIA NHẬP ${brandName} KEYHOLDER - TẠO TÀI KHOẢN`);

  return (
    <Stack className={classes.container}>
      <CheckoutSectionHeaderComponent title={sectionTitle} />
      {user ? <UserProfileSection user={user} /> : <GuestEmailSection {...props} />}
    </Stack>
  );
};

export default CheckoutAccountSection;
