declare module "react" {
  function forwardRef<T, P = {}>(
    render: (props: P, ref: React.Ref<T>) => React.ReactElement | null,
  ): (props: P & React.RefAttributes<T>) => React.ReactElement | null;
}

import React from "react";

import NextLink, { type LinkProps as NextLinkProps } from "next/link";

import { Link } from "@mui/material";

import type { LinkProps } from "@mui/material";

export interface AppLinkProps extends LinkProps {
  component?: React.ElementType<any>;
  prefetch?: NextLinkProps["prefetch"];
}

/**
 * Wrapper kết hợp MUI `Link` và Next.js `Link`.
 * - Tự động sử dụng Next.js router để chuyển trang (client-side navigation).
 * - Tắt underline mặc định của MUI Link; màu kế thừa từ parent (`sx={{ color: 'inherit' }}`).
 * - Hỗ trợ ref forwarding và nhận toàn bộ props của MUI LinkProps.
 * - Cho phép override `component` nếu cần.
 */
const AppLink = (props: AppLinkProps, ref: React.ForwardedRef<any>) => {
  const { component: controlledComponent, sx, ...rest } = props;

  return <Link ref={ref} component={NextLink} underline="none" sx={{ color: "inherit", ...sx }} href="" {...rest} />;
};

const AppLinkWithRef = React.forwardRef(AppLink);

export default AppLinkWithRef;
