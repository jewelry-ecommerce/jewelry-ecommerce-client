"use client";

import { Box, Typography } from "@mui/material";
import Image from "next/image";
import useStyles from "./product-empty-state.styles";

const EMPTY_PRODUCT_ILLUSTRATION_SRC = "/image/icons/empty-item.svg";
const EMPTY_PRODUCT_MESSAGE = "Không có kết quả hiển thị";
const EMPTY_PRODUCT_DESCRIPTION = "Hiện không có kết quả hiển thị phù hợp với yêu cầu của bạn.";

type ProductEmptyStateProps = {
  message?: string;
  description?: string;
};

function ProductEmptyState({ message = EMPTY_PRODUCT_MESSAGE, description = EMPTY_PRODUCT_DESCRIPTION }: ProductEmptyStateProps) {
  const { classes } = useStyles();

  return (
    <Box className={classes.root} role="status" aria-live="polite">
      <Image src={EMPTY_PRODUCT_ILLUSTRATION_SRC} alt="" width={298} height={237} className={classes.illustration} priority />
      <Typography className={classes.message}>{message}</Typography>
      {description ? <Typography className={classes.description}>{description}</Typography> : null}
    </Box>
  );
}

export default ProductEmptyState;
