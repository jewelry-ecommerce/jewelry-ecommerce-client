import React from "react";
import { Box } from "@mui/material";
import RegisterForm from "./register/register-form";

const RegisterPage = () => {
  return (
    <Box
      sx={{
        minHeight: { xs: "auto", md: "70vh" },
        display: "block",
        pt: { xs: "40px", md: 5 },
        pb: { xs: "60px", md: 5 },
        px: { xs: 2, md: 2 },
      }}
    >
      <RegisterForm />
    </Box>
  );
};

export default RegisterPage;
