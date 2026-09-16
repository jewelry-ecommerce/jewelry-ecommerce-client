import React from "react";
import { Box } from "@mui/material";
import LoggedInSessionRedirect from "./logged-in-session-redirect.client";
import LoginFlow from "./login-flow.component";

const MyAccount = () => {
  return (
    <>
      <LoggedInSessionRedirect />
      <Box
        sx={{
          minHeight: { xs: "auto", md: "70vh" },
          display: "block",
          pt: { xs: "40px", md: 5 },
          pb: { xs: "60px", md: 5 },
          px: { xs: 2, md: 2 },
        }}
      >
        <LoginFlow />
      </Box>
    </>
  );
};

export default MyAccount;
