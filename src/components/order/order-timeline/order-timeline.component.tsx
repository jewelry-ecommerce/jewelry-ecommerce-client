import React from "react";
import { Box, Stack, Typography } from "@mui/material";
import useStyles from "./order-timeline.styles";
import { StackAlignCenter, StackRowAlignCenter } from "@/components/styled";

export interface OrderTimelineItem {
  id: string;
  time: string;
  date: string;
  title: string;
  description: string;
  isActive?: boolean;
}

export interface OrderTimelineSectionProps {
  items: OrderTimelineItem[];
  title?: string;
}

const OrderTimelineSection = ({ items, title = "Tình trạng đơn hàng" }: OrderTimelineSectionProps) => {
  const { classes, cx } = useStyles();
  if (items.length === 0) return null;
  return (
    <Stack className={classes.root}>
      {title && <Typography className={classes.title}>{title}</Typography>}

      <Stack className={classes.timeline}>
        {items.map((item, index) => (
          <Box key={item.id} className={classes.item}>
            <StackAlignCenter className={classes.spineWrapper}>
              <Box className={cx(classes.dot, { [classes.dotActive]: item.isActive })} />
              {index < items.length - 1 && <Box className={classes.line} />}
            </StackAlignCenter>

            <Stack className={classes.content}>
              <StackRowAlignCenter className={classes.dateTimeWrapper}>
                <Typography className={classes.dateTime}>{item.time}</Typography>
                <Typography className={classes.dateTime}>{item.date}</Typography>
              </StackRowAlignCenter>
              <Typography className={cx(classes.statusTitle, { [classes.statusTitleActive]: item.isActive })}>{item.title}</Typography>
              {item.description ? <Typography className={classes.statusDescription}>{item.description}</Typography> : null}
            </Stack>
          </Box>
        ))}
      </Stack>
    </Stack>
  );
};

export default OrderTimelineSection;
