import React from "react";
import { Box, Typography } from "@mui/material";

const Category = () => {
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
        Category
      </Typography>
    </Box>
  );
};

export default Category;
