declare module "react" {
  function forwardRef<T, P = {}>(
    render: (props: P, ref: React.Ref<T>) => React.ReactElement | null,
  ): (props: P & React.RefAttributes<T>) => React.ReactElement | null;
}

import React from "react";

import { Container, ContainerProps } from "@mui/material";

/**
 * Wrapper của MUI `Container` với `maxWidth="lg"` làm mặc định.
 * Dùng để giới hạn chiều rộng nội dung và căn giữa trang.
 * Hỗ trợ ref forwarding và nhận toàn bộ props của MUI ContainerProps.
 */
const AppContainer = (props: ContainerProps, ref: React.ForwardedRef<any>) => {
  return <Container maxWidth="lg" ref={ref} {...props} />;
};

const AppContainerWithRef = React.forwardRef(AppContainer);

export default AppContainerWithRef;
