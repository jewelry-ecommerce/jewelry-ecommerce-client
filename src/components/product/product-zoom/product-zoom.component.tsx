"use client";

import React from "react";
import { Box, IconButton, Portal, useMediaQuery, useTheme } from "@mui/material";
import { ChevronLeft, ChevronRight, XClose, ZoomIn, ZoomOut } from "@untitledui/icons";
import { PRODUCT_ZOOM_CONFIG } from "@/app/(layout-main)/san-pham/_components/hooks/pinch-zoom.constants";
import { RemoveScroll } from "react-remove-scroll";
import useStyles from "./product-zoom.styles";
import { useProductZoomControls, type ProductZoomControls, type ProductZoomProps } from "./use-product-zoom-controls.hook";
import { useProductZoomViewport } from "./use-product-zoom-viewport.hook";

interface ZoomControlsProps {
  controls: ProductZoomControls;
}

function ProductZoomCloseButton({ onClose }: { onClose: () => void }) {
  const { classes } = useStyles();
  return (
    <Box className={classes.topRightControls}>
      <IconButton className={classes.closeButton} onClick={onClose} aria-label="Close product zoom">
        <XClose size={24} color="#fff" />
      </IconButton>
    </Box>
  );
}

function ProductZoomNavigation({ controls }: ZoomControlsProps) {
  const { classes, cx } = useStyles();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down(PRODUCT_ZOOM_CONFIG.mobileBreakpoint));
  const iconSize = isMobile ? PRODUCT_ZOOM_CONFIG.mobileArrowSize : PRODUCT_ZOOM_CONFIG.desktopArrowSize;
  return (
    <React.Fragment>
      <Box className={cx(classes.sideNav, classes.prevArrow, { disabled: controls.isZoomed })} onClick={controls.prevImage} aria-label="Previous image">
        <ChevronLeft size={iconSize} color="#000" />
      </Box>
      <Box className={cx(classes.sideNav, classes.nextArrow, { disabled: controls.isZoomed })} onClick={controls.nextImage} aria-label="Next image">
        <ChevronRight size={iconSize} color="#000" />
      </Box>
    </React.Fragment>
  );
}

function ProductZoomToolbar({ controls }: ZoomControlsProps) {
  const { classes, cx } = useStyles();
  return (
    <Box className={cx(classes.zoomToolbar, { expanded: controls.isZoomed })}>
      <Box className={classes.toolBtn} onClick={controls.zoomIn} aria-label="Zoom in"><ZoomIn size={24} color="#000" /></Box>
      <Box className={cx(classes.toolBtn, { hidden: !controls.isZoomed })} onClick={controls.zoomOut} aria-label="Zoom out">
        <ZoomOut size={24} color="#000" />
      </Box>
      <Box className={cx(classes.toolBtn, { hidden: !controls.isZoomed })} onClick={controls.resetZoom} aria-label="Reset image zoom">
        <XClose size={24} color="#000" />
      </Box>
    </Box>
  );
}

function ProductZoomImage({ props, controls }: { props: ProductZoomProps; controls: ProductZoomControls }) {
  const { classes } = useStyles();
  return (
    <Box className={classes.zoomContainer} ref={controls.setZoomContainer}
      onMouseDown={controls.handleMouseDown} onMouseMove={controls.handleMouseMove}
      onMouseUp={controls.handleMouseUp} onMouseLeave={controls.stopDragging}>
      <Box component="img" src={props.images[controls.currentIndex]} alt={props.productName || "Product image"}
        className={classes.mainImage} style={controls.imageStyle} onDragStart={(event) => event.preventDefault()} />
    </Box>
  );
}

const ProductZoomComponent = (props: ProductZoomProps) => {
  const { classes } = useStyles();
  const controls = useProductZoomControls(props);
  const viewportStyle = useProductZoomViewport(props.isOpen);
  if (!props.isOpen) return null;
  return (
    <Portal>
      {/* Image gestures own pinch zoom; browser zoom is compensated by the overlay. */}
      <RemoveScroll enabled={props.isOpen} allowPinchZoom={false}>
        <Box className={classes.overlay} style={viewportStyle} onWheel={controls.handleWheel}>
          <ProductZoomCloseButton onClose={props.onClose} />
          {props.images.length > 1 && <ProductZoomNavigation controls={controls} />}
          <ProductZoomToolbar controls={controls} />
          <ProductZoomImage props={props} controls={controls} />
        </Box>
      </RemoveScroll>
    </Portal>
  );
};

export default ProductZoomComponent;
