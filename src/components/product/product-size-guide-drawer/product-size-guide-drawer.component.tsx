"use client";
import { Box, Drawer, Link, Typography, useTheme, useMediaQuery } from "@mui/material";
import React from "react";
import { StackRowAlignCenter, StackRowAlignCenterJustBetween } from "@/components/styled";
import useStyles from "./product-size-guide-drawer.styles";
import { ArrowNarrowLeft, XClose } from "@untitledui/icons";
import { RemoveScroll } from "react-remove-scroll";

const SIZE_GUIDE_DETAIL_URL = "https://heartlock.com.vn/huong-dan-chon-size";

const SIZE_GUIDE_SECTIONS = [
  {
    id: "bracelet",
    title: "A. Lắc & Vòng tay",
    steps: [
      "Quấn thước dây, sợi dây (hoặc dải giấy) quanh cổ tay tại vị trí bạn cảm thấy ôm nhẹ, thoải mái (không quá chặt).",
      "Đánh dấu chính xác điểm giao nhau.",
      "Duỗi thẳng sợi dây hoặc dải giấy và đo lại chiều dài bằng thước kẻ để có được kích thước cổ tay (đơn vị: cm).",
    ],
    images: [
      { src: encodeURI("/image/size/lắc tay.png"), alt: "Bảng size lắc tay" },
      { src: encodeURI("/image/size/vòng tay.png"), alt: "Bảng size vòng cứng" },
    ],
  },
  {
    id: "ring",
    title: "B. Nhẫn",
    steps: [
      "Quấn thước dây, sợi dây (hoặc dải giấy) quanh ngón tay muốn đeo nhẫn tại vị trí ôm vừa vặn.",
      "Đánh dấu chính xác điểm giao nhau.",
      "Duỗi thẳng sợi dây hoặc dải giấy và đo lại chiều dài bằng thước kẻ để có chu vi ngón tay (đơn vị: cm).",
    ],
    images: [{ src: encodeURI("/image/size/nhẫn.png"), alt: "Bảng size nhẫn" }],
  },
  {
    id: "necklace",
    title: "C. Dây chuyền",
    steps: [
      "Dùng thước dây, sợi dây (hoặc dải giấy) đặt quanh cổ đến vị trí bạn muốn đeo.",
      "Điều chỉnh đến độ dài mong muốn và đánh dấu điểm giao nhau.",
      "Duỗi thẳng sợi dây hoặc dải giấy và đo lại chiều dài bằng thước kẻ (đơn vị: cm).",
    ],
    images: [{ src: encodeURI("/image/size/dây chuyền.png"), alt: "Bảng size dây chuyền" }],
  },
];

interface ProductSizeGuideDrawerProps {
  open: boolean;
  onClose: () => void;
  onCloseAll: () => void;
  showBackButton?: boolean;
}

const ProductSizeGuideDrawer = ({ open, onClose, onCloseAll, showBackButton = false }: ProductSizeGuideDrawerProps) => {
  const { classes } = useStyles();
  const theme = useTheme();
  const zIndex = {
    productSizeGuideModal: theme.zIndex.modal + 2,
  };
  const isMobile = useMediaQuery(theme.breakpoints.down(810));

  return (
    <Drawer
      anchor={isMobile ? "bottom" : "right"}
      open={open}
      onClose={onClose}
      PaperProps={{ className: classes.drawerPaper }}
      ModalProps={{
        keepMounted: true,
        disableScrollLock: true,
        sx: { zIndex: zIndex.productSizeGuideModal },
      }}
    >
      <Box className={classes.root}>
        <StackRowAlignCenterJustBetween className={classes.header}>
          <StackRowAlignCenter gap={showBackButton ? 2 : 0}>
            {showBackButton ? <ArrowNarrowLeft size={20} color="#000" onClick={onClose} style={{ cursor: "pointer" }} /> : null}
            <Typography className={classes.title}>Hướng dẫn chọn size</Typography>
          </StackRowAlignCenter>
          <XClose size={20} color="#000" onClick={onCloseAll} style={{ cursor: "pointer" }} />
        </StackRowAlignCenterJustBetween>

        <RemoveScroll enabled={open} forwardProps>
          <Box className={classes.body}>
            {SIZE_GUIDE_SECTIONS.map((section) => (
              <Box key={section.id} className={classes.section}>
                <Typography className={classes.sectionTitle}>{section.title}</Typography>
                <Box className={classes.textList}>
                  {section.steps.map((step, index) => (
                    <Typography key={step} className={classes.textItem}>
                      {index + 1}. {step}
                    </Typography>
                  ))}
                </Box>
                <Box className={classes.imageList}>
                  {section.images.map((image) => (
                    <Box key={image.src} className={classes.imageWrapper}>
                      <Box component="img" src={image.src} alt={image.alt} loading="lazy" className={classes.guideImage} />
                    </Box>
                  ))}
                </Box>
              </Box>
            ))}

            <Typography className={classes.footerNote}>
              Xem chi tiết tại{" "}
              <Link href={SIZE_GUIDE_DETAIL_URL} target="_blank" rel="noopener noreferrer" className={classes.footerLink}>
                Hướng dẫn chọn size
              </Link>
              .
            </Typography>
          </Box>
        </RemoveScroll>
      </Box>
    </Drawer>
  );
};

export default ProductSizeGuideDrawer;
