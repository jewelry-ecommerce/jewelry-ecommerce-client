"use client";

import { Box, Button, Typography } from "@mui/material";
import Image from "next/image";
import Link from "next/link";
import useStyles from "./empty-cart-state.styles";

type EmptyCartStateProps = {
  title?: string;
  emptyText?: string;
  description?: string;
  buttonLabel?: string;
  buttonHref?: string;
  isMiniCart?: boolean;
  onclose?: () => void;
};

const EmptyCartState = ({
  title,
  emptyText = "Giỏ hàng đang chờ bạn lựa chọn",
  description = "Khám phá những thiết kế phản ánh phong thái và bản sắc riêng của bạn",
  buttonLabel = "Bắt Đầu Mua Sắm",
  buttonHref = "/san-pham",
  isMiniCart = false,
  onclose,
}: EmptyCartStateProps) => {
  const { classes } = useStyles();

  return (
    <Box className={isMiniCart ? classes.miniCartRoot : classes.root}>
      {title && <Typography className={classes.title}>{title}</Typography>}

      <Box className={classes.iconBox}>
        <Image
          src="/images/icon/icon-empty-cart.svg"
          alt="Giỏ hàng trống"
          width={180}
          height={180}
          className={classes.iconImage}
          priority
        />

        <Typography className={classes.emptyText}>{emptyText}</Typography>
        <Typography className={classes.description}>{description}</Typography>

        <Button component={Link} href={buttonHref} className={classes.ctaButton} onClick={onclose}>
          {buttonLabel}
        </Button>
      </Box>
    </Box>
  );
};

export default EmptyCartState;
