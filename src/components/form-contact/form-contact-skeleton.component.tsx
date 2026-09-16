import React from "react";
import { Box, Skeleton } from "@mui/material";
import { StackAlignJustCenter } from "../styled";
import useStyles from "./form-contact.styles";

const FormContactSkeletonComponent = () => {
  const { classes } = useStyles();

  return (
    <StackAlignJustCenter className={classes.container}>
      <Box className={classes.title} sx={{ width: { xs: "60%", md: "40%" } }}>
        <Skeleton variant="text" width="100%" />
      </Box>

      <Box className={classes.inputWrapper}>
        <Skeleton variant="rectangular" height={54} />
      </Box>
    </StackAlignJustCenter>
  );
};

export default FormContactSkeletonComponent;
