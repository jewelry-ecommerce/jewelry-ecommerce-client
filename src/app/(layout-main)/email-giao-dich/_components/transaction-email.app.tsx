import React from "react";
import { Box, Typography } from "@mui/material";

const TransactionEmail = () => {
  return (
    <Box
      sx={{
        minHeight: "60vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Typography variant="h3" color="text.primary">
        Transaction Email
      </Typography>
    </Box>
  );
};

export default TransactionEmail;
