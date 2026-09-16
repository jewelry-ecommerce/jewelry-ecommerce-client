import React from "react";
import { Box, Typography } from "@mui/material";
import { makeStyles } from "tss-react/mui";
import { XClose } from "@untitledui/icons";
import DialogComponent from "@/components/dialog/dialog.component";
import ProductItemComponent from "@/components/product/product-item/product-item.component";
import type { ProductItemProps } from "@/components/product/product-item/product-item.component";
import type { CartViewItem } from "@/utils/api/cart/cart.interface";
import { CdnImage } from "@/components/cdn-image";
import { TYPOGRAPHY_STYLES } from "@/utils/constants/typography.constant";
import { STYLE } from "@/utils/constants";
import { useFetchProductBadgesBatch } from "@/hooks/use-fetch-product-badges-batch.hook";
import { StackRowAlignCenterJustBetween } from "@/components/styled";
import { PRODUCT_GALLERY_TILE_ASPECT_RATIO } from "@/components/product/product-gallery/product-gallery.constants";

export interface ProductMixMatchModalProps {
  open: boolean;
  onClose: () => void;
  imageSrc: string;
  imageAlt?: string;
  imageLabel?: string;
  title?: string;
  products: ProductItemProps[];
  isLoading?: boolean;
  onProductClick?: (slug: string) => void;
  onAddToCart?: (id: string, item?: CartViewItem) => void;
}

const useStyles = makeStyles()((theme) => ({
  root: {
    display: "flex",
    flexDirection: "column",
    maxHeight: "90vh",
    overflow: "hidden",
  },
  // Mobile/tablet: title cố định trên; desktop ẩn
  topHeader: {
    padding: "16px 20px",
    flexShrink: 0,
    backgroundColor: "#fff",
    [theme.breakpoints.up("lg")]: {
      display: "none",
    },
  },
  // Desktop: title trong panel list; mobile ẩn
  sideHeader: {
    display: "none",
    marginBottom: 12,
    [theme.breakpoints.up("lg")]: {
      display: "flex",
    },
  },
  layout: {
    display: "flex",
    flexDirection: "column",
    flex: 1,
    minHeight: 0,
    overflowY: "auto",
    [theme.breakpoints.up("lg")]: {
      flexDirection: "row",
      overflow: "hidden",
    },
  },
  imagePanel: {
    position: "relative",
    width: "100%",
    aspectRatio: PRODUCT_GALLERY_TILE_ASPECT_RATIO,
    flexShrink: 0,
    backgroundColor: "var(--product-image-background)",
    [theme.breakpoints.up("lg")]: {
      width: "50%",
      alignSelf: "stretch",
      minHeight: "100%",
    },
  },
  image: {
    objectFit: "cover",
  },
  labelWrapper: {
    position: "absolute",
    top: -1,
    left: -1,
    zIndex: 2,
    height: "fit-content",
    width: "fit-content",
    minWidth: "173px",
    display: "flex",
    alignItems: "center",
    backgroundColor: "#fff",
    clipPath: "polygon(0 0, 100% 0, calc(100% - 12px) 100%, 0 100%)",
    paddingLeft: STYLE.PADDING_GAP_ITEM_SMALL,
    willChange: "transform",
    backfaceVisibility: "hidden",
  },
  labelText: {
    ...TYPOGRAPHY_STYLES.xs.regular,
    color: "#000",
    textTransform: "uppercase",
    display: "block",
    maxWidth: "180px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  productPanel: {
    width: "100%",
    minHeight: 0,
    [theme.breakpoints.up("lg")]: {
      width: "50%",
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
    },
  },
  productHeader: {
    ...TYPOGRAPHY_STYLES.xl.bold,
    textTransform: "uppercase",
    minWidth: 0,
    [theme.breakpoints.down("md")]: {
      ...TYPOGRAPHY_STYLES.md.bold,
    },
  },
  productBody: {
    padding: "16px 20px",
    [theme.breakpoints.up("lg")]: {
      flex: 1,
      overflowY: "auto",
      minHeight: 0,
      scrollbarWidth: "thin",
      scrollbarColor: "var(--sb-thumb) transparent",
    },
  },
  productGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    alignItems: "start",
    [theme.breakpoints.up("md")]: {
      gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    },
  },
  footerText: {
    ...TYPOGRAPHY_STYLES.xs.regular,
    color: "#667085",
  },
}));

const TitleCloseRow = ({ title, onClose, className }: { title: string; onClose: () => void; className?: string }) => {
  const { classes } = useStyles();
  return (
    <StackRowAlignCenterJustBetween className={className} gap={1}>
      <Typography className={classes.productHeader}>{title}</Typography>
      <Box onClick={onClose} sx={{ cursor: "pointer", lineHeight: 0, flexShrink: 0 }} aria-label="Đóng">
        <XClose size={24} />
      </Box>
    </StackRowAlignCenterJustBetween>
  );
};

const ProductMixMatchModalComponent = ({
  open,
  onClose,
  imageSrc,
  imageAlt = "",
  imageLabel,
  title = "CHỌN THEO DẤU ẤN RIÊNG",
  products,
  isLoading = false,
  onProductClick,
  onAddToCart,
}: ProductMixMatchModalProps) => {
  useFetchProductBadgesBatch(open ? products : []);
  const { classes } = useStyles();

  return (
    <DialogComponent
      open={open}
      onClose={onClose}
      closeButton={false}
      maxWidth={false}
      sx={(theme) => ({
        maxWidth: 1440,
        width: "calc(100% - 32px)",
        padding: "0 !important",
        margin: 2,
        [theme.breakpoints.between("md", "lg")]: {
          marginLeft: "100px",
          marginRight: "100px",
        },
      })}
      sxTitle={{ display: "none" }}
      sxContent={{ padding: 0 }}
    >
      <Box className={classes.root}>
        <TitleCloseRow title={title} onClose={onClose} className={classes.topHeader} />
        <Box className={classes.layout}>
          <Box className={classes.imagePanel}>
            <Box className={classes.labelWrapper}>
              <Typography className={classes.labelText}>{imageLabel || "POSTHUMAN"}</Typography>
            </Box>
            <CdnImage as="next" src={imageSrc} alt={imageAlt} fill preset="galleryTile" className={classes.image} sizes="50vw" />
          </Box>

          <Box className={classes.productPanel}>
            <Box className={classes.productBody}>
              <TitleCloseRow title={title} onClose={onClose} className={classes.sideHeader} />

              {isLoading ? (
                <Typography className={classes.footerText} sx={{ p: 3, textAlign: "center" }}>
                  Đang tải sản phẩm...
                </Typography>
              ) : products.length ? (
                <Box className={classes.productGrid}>
                  {products.map((product) => (
                    <ProductItemComponent
                      key={product.id}
                      {...product}
                      sx={{ borderLeft: "1px solid #E0E0E0" }}
                      onClick={onProductClick}
                      onAddToCart={onAddToCart}
                    />
                  ))}
                </Box>
              ) : (
                <Typography className={classes.footerText} sx={{ p: 3, textAlign: "center" }}>
                  Không có sản phẩm khả dụng.
                </Typography>
              )}
            </Box>
          </Box>
        </Box>
      </Box>
    </DialogComponent>
  );
};

export default ProductMixMatchModalComponent;
