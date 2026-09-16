import { StackRowAlignCenter } from "@/components/styled";
import useStyles from "./order-info.styles";
import { Button } from "@mui/material";

export interface OrderAction {
  label: string;
  onClick?: () => void;
  variant: "primary" | "secondary";
  disabled?: boolean;
}

export interface OrderActionProps {
  actions: OrderAction[];
}

export const OrderActionComponent = ({ actions }: OrderActionProps) => {
  const { classes } = useStyles();

  if (!actions || actions.length === 0) return null;

  return (
    <StackRowAlignCenter className={classes.actions}>
      {actions.map((action, index) => (
        <Button
          key={index}
          variant={action.variant === "primary" ? "contained" : "outlined"}
          className={action.variant === "primary" ? classes.btnPrimary : classes.btnSecondary}
          disabled={action.disabled}
          onClick={action.onClick}
        >
          {action.label}
        </Button>
      ))}
    </StackRowAlignCenter>
  );
};
