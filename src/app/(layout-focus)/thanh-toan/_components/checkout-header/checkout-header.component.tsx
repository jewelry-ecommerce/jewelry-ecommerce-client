import React from "react";
import { Box, Typography } from "@mui/material";
import { StackRowAlignCenterJustBetween } from "@/components/styled";
import { TYPOGRAPHY_STYLES } from "@/utils/constants/typography.constant";
import { makeStyles } from "tss-react/mui";

const useStyles = makeStyles({ name: "CheckoutSectionHeader" })((theme) => ({
  title: {
    ...TYPOGRAPHY_STYLES.xl.bold,
    color: "#27251F",
    textTransform: "uppercase",
    [theme.breakpoints.down(810)]: {
      ...TYPOGRAPHY_STYLES.md.bold,
    },
  },

  iconWrapper: {
    cursor: "pointer",
  },
}));

interface CheckoutSectionHeaderProps {
  title: string;
  icon?: React.ReactNode;
}

const CheckoutSectionHeaderComponent = ({ title, icon }: CheckoutSectionHeaderProps) => {
  const { classes } = useStyles();

  return (
    <StackRowAlignCenterJustBetween>
      <Typography className={classes.title}>{title}</Typography>
      {icon && <Box className={classes.iconWrapper}>{icon}</Box>}
    </StackRowAlignCenterJustBetween>
  );
};

export default CheckoutSectionHeaderComponent;
