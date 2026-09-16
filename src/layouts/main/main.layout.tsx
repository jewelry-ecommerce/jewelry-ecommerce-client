import { Footer, Header } from "@/components";
import { siteHeaderHeightCssVar } from "@/utils/constants/layout.constant";
import { Box } from "@mui/material";
import React from "react";

type MainLayoutProps = {
  children: React.ReactNode;
  checkAccessToken?: boolean;
};

const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <Box display="flex" flexDirection="column" minHeight="100vh" sx={{ paddingTop: siteHeaderHeightCssVar() }}>
      <Header />
      <Box component="main" flex={1} sx={{ width: "100%", maxWidth: "none" }}>
        {children}
      </Box>
      <Footer />
    </Box>
  );
};

export default MainLayout;
