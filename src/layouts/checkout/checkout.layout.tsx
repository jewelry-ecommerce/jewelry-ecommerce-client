import React from "react";
import { HeaderCheckout } from "@/components";
import { Box } from "@mui/material";

type CheckoutLayoutProps = {
  children: React.ReactNode;
};

const CheckoutLayout = ({ children }: CheckoutLayoutProps) => {
  return (
    <Box display="flex" flexDirection="column" minHeight="100vh">
      <HeaderCheckout />
      <Box component="main" flex={1}>
        {children}
      </Box>
    </Box>
  );
};

export default CheckoutLayout;
