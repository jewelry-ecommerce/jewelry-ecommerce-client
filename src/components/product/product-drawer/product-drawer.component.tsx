import React from "react";
import { Box, Drawer } from "@mui/material";
import ProductItemComponent from "@/components/product/product-item/product-item.component";
import type { ProductItemProps } from "@/components/product/product-item/product-item.component";
import type { CartViewItem } from "@/utils/api/cart/cart.interface";
import { makeStyles } from "tss-react/mui";
import { XClose } from "@untitledui/icons";
import { useFetchProductBadgesBatch } from "@/hooks/use-fetch-product-badges-batch.hook";
import { RemoveScroll } from "react-remove-scroll";

interface ProductDrawerProps {
  open: boolean;
  onClose: () => void;
  products: ProductItemProps[];
  title?: string;
  onProductClick?: (slug: string) => void;
  onAddToCart?: (id: string, item?: CartViewItem) => void;
}

const useStyles = makeStyles()((theme) => ({
  drawerPaper: {
    width: "480px",
    maxWidth: "100%",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    [theme.breakpoints.down(600)]: {
      width: "100%",
    },
  },
  drawerHeader: {
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "16px 20px",
    borderBottom: "1px solid #E5E5E5",
  },
  drawerTitle: {
    fontSize: "18px",
    fontWeight: 700,
    color: "#000",
  },
  drawerContent: {
    padding: 0,
    flex: 1,
    minHeight: 0,
    display: "flex",
    flexDirection: "column",
    overflowY: "auto",
    backgroundColor: "#fff",
  },
  productGrid: {
    display: "grid",
    gap: 0,
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    alignItems: "start",
  },
}));

const ProductDrawerComponent = ({ open, onClose, products, title = "MIX & MATCH", onProductClick, onAddToCart }: ProductDrawerProps) => {
  useFetchProductBadgesBatch(open ? products : []);
  const { classes } = useStyles();

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{ className: classes.drawerPaper }}
      ModalProps={{ disableScrollLock: true }}
    >
      <Box className={classes.drawerHeader}>
        <Box className={classes.drawerTitle}>{title}</Box>
        <XClose onClick={onClose} style={{ cursor: "pointer" }} />
      </Box>
      <RemoveScroll enabled={open} forwardProps>
        <Box className={classes.drawerContent}>
          <Box className={classes.productGrid}>
            {products.map((product) => (
              <ProductItemComponent key={product.id} {...product} onClick={onProductClick} onAddToCart={onAddToCart} />
            ))}
          </Box>
        </Box>
      </RemoveScroll>
    </Drawer>
  );
};

export default ProductDrawerComponent;
