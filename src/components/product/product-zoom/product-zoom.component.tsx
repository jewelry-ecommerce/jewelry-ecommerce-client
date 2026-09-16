"use client";
import React, { useState, useRef, useEffect } from "react";
import { Box, IconButton, Portal, useMediaQuery, useTheme } from "@mui/material";
import useStyles from "./product-zoom.styles";
import { ChevronLeft, ChevronRight, XClose, ZoomIn, ZoomOut } from "@untitledui/icons";
import { usePinchZoom } from "@/app/(layout-main)/san-pham/_components/hooks";
import { RemoveScroll } from "react-remove-scroll";

interface ProductZoomProps {
  images: string[];
  productName?: string;
  initialIndex: number;
  isOpen: boolean;
  onClose: () => void;
}

const ProductZoomComponent = ({ images, productName, initialIndex, isOpen, onClose }: ProductZoomProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down(810));
  const arrowIconSize = isMobile ? 28 : 32;
  const { classes, cx } = useStyles();
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  const zoomContainerRef = useRef<HTMLDivElement>(null);
  const { scale, pan, resetZoom, setScale, setPan } = usePinchZoom(zoomContainerRef);

  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const panStart = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
      resetZoom();
    }
  }, [isOpen, initialIndex, resetZoom]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale <= 1) return;
    setIsDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY };
    panStart.current = { x: pan.x, y: pan.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    setPan({
      x: panStart.current.x + dx,
      y: panStart.current.y + dy,
    });
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!isDragging) {
      // Logic for click-to-zoom
      const dx = Math.abs(e.clientX - dragStart.current.x);
      const dy = Math.abs(e.clientY - dragStart.current.y);
      // Small movement threshold to distinguish click from drag
      if (dx < 5 && dy < 5) {
        if (scale === 1) setScale(1.5);
        else if (scale === 1.5) setScale(2.5);
        else {
          setScale(1);
          setPan({ x: 0, y: 0 });
        }
      }
    }
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    const delta = e.deltaY > 0 ? -0.2 : 0.2;
    setScale((prev) => {
      const next = Math.min(Math.max(prev + delta, 1), 3);
      if (next === 1) setPan({ x: 0, y: 0 });
      return next;
    });
  };

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % images.length);
    resetZoom();
  };
  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    resetZoom();
  };

  if (!isOpen) return null;

  const imageStyle: React.CSSProperties = {
    transform: `translate3d(${pan.x}px, ${pan.y}px, 0) scale(${scale})`,
    transition: isDragging || scale > 1 ? "none" : "transform 0.4s cubic-bezier(0.2, 0, 0, 1)",
    cursor: scale > 1 ? (isDragging ? "grabbing" : "grab") : "pointer",
    touchAction: "none",
  };

  const isZoomed = scale > 1;

  return (
    <Portal>
      <RemoveScroll enabled={isOpen}>
        <Box className={classes.overlay} onMouseUp={handleMouseUp} onMouseLeave={() => setIsDragging(false)} onWheel={handleWheel}>
          {/* Top Right: Close Icon (Global) */}
          <Box className={classes.topRightControls}>
            <IconButton className={classes.closeButton} onClick={onClose}>
              <XClose size={24} color="#fff" />
            </IconButton>
          </Box>

          {/* Side Nav Arrows */}
          {images.length > 1 && (
            <React.Fragment>
              <Box className={cx(classes.sideNav, classes.prevArrow, { disabled: isZoomed })} onClick={prevImage}>
                <ChevronLeft size={arrowIconSize} color="#000" />
              </Box>
              <Box className={cx(classes.sideNav, classes.nextArrow, { disabled: isZoomed })} onClick={nextImage}>
                <ChevronRight size={arrowIconSize} color="#000" />
              </Box>
            </React.Fragment>
          )}

          {/* Dynamic Zoom Toolbar */}
          <Box className={cx(classes.zoomToolbar, { expanded: isZoomed })}>
            <Box className={classes.toolBtn} onClick={() => setScale((prev) => Math.min(prev + 0.5, 3))}>
              <ZoomIn size={24} color="#000" />
            </Box>
            <Box className={cx(classes.toolBtn, { hidden: !isZoomed })} onClick={() => setScale((prev) => Math.max(prev - 0.5, 1))}>
              <ZoomOut size={24} color="#000" />
            </Box>
            <Box className={cx(classes.toolBtn, { hidden: !isZoomed })} onClick={resetZoom}>
              <XClose size={24} color="#000" />
            </Box>
          </Box>

          {/* Main Content Area */}
          <Box className={classes.zoomContainer} onMouseMove={handleMouseMove} onMouseDown={handleMouseDown} ref={zoomContainerRef}>
            <Box
              component="img"
              src={images[currentIndex]}
              alt={productName || "Product image"}
              className={classes.mainImage}
              style={imageStyle}
              onDragStart={(e) => e.preventDefault()}
            />
          </Box>
        </Box>
      </RemoveScroll>
    </Portal>
  );
};

export default ProductZoomComponent;
