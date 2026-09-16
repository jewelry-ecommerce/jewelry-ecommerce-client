import { Box, Skeleton } from "@mui/material";
import { StackRow } from "@/components/styled";
import useCartViewStyles from "@/app/(layout-main)/gio-hang/_components/cart-view.styles";

const CartSkeletonComponent = () => {
  const { classes } = useCartViewStyles();

  return (
    <Box className={classes.grid}>
      <Box className={classes.itemsSlot}>
        <Box className={classes.productHeader}>
          <Skeleton width={140} height={28} />
          <Skeleton width={100} height={24} />
          <Skeleton width={100} height={24} />
        </Box>

        <Box className={classes.selectAllRow} sx={{ alignItems: "center", pl: 0 }}>
          <Skeleton variant="circular" width={20} height={20} sx={{ mr: 1 }} />
          <Skeleton width={120} height={24} />
          <Box sx={{ marginLeft: "auto", display: "flex", gap: 1 }}>
            <Skeleton width={120} height={36} />
            <Skeleton width={80} height={36} />
          </Box>
        </Box>

        <Box sx={{ paddingTop: 8 }}>
          {Array.from({ length: 4 }).map((_, index) => (
            <StackRow key={index} className={classes.itemRow} sx={{ alignItems: "center" }}>
              <Box className={classes.BoxCheckbox}>
                <Skeleton variant="circular" width={20} height={20} />
              </Box>
              <Box sx={{ display: "flex", gap: 12, width: "100%" }}>
                <Skeleton width={122} height={154} />
                <Box sx={{ flex: 1, display: "grid", gap: 8 }}>
                  <Skeleton width="70%" height={24} />
                  <Skeleton width="90%" height={20} />
                  <Skeleton width="40%" height={24} />
                </Box>
              </Box>
            </StackRow>
          ))}
        </Box>
      </Box>

      <Box className={classes.summarySlot}>
        <Skeleton width="100%" height={220} />
      </Box>
    </Box>
  );
};

export default CartSkeletonComponent;
