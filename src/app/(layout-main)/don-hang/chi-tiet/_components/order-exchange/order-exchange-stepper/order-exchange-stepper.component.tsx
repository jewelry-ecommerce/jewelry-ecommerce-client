import React from "react";
import { Box, Typography } from "@mui/material";
import useStyles from "./order-exchange-stepper.styles";
import { StackAlignCenter, StackRowAlignCenter, StackRowAlignCenterJustBetween } from "@/components/styled";

export interface OrderExchangeStepperProps {
  currentStep: number;
  steps: string[];
}

const OrderExchangeStepper: React.FC<OrderExchangeStepperProps> = ({ currentStep, steps }) => {
  const { classes, cx } = useStyles();

  return (
    <Box className={classes.root}>
      <StackRowAlignCenter className={classes.lineWrapper}>
        <Box
          className={classes.lineActive}
          sx={{
            width: `calc(${(currentStep / (steps.length - 1)) * 100}% - ${(currentStep / (steps.length - 1)) * 80}px)`,
          }}
        />
        <StackRowAlignCenterJustBetween className={classes.stepsContainer}>
          {steps.map((step, index) => (
            <StackAlignCenter key={index} className={classes.stepItem}>
              <Box
                className={cx(
                  classes.circle,
                  currentStep === index && classes.circleActive,
                  currentStep > index && classes.circleCompleted,
                )}
              />
              <Typography className={cx(classes.label, index <= currentStep && classes.labelActive)}>{step}</Typography>
            </StackAlignCenter>
          ))}
        </StackRowAlignCenterJustBetween>
      </StackRowAlignCenter>
    </Box>
  );
};

export default OrderExchangeStepper;
