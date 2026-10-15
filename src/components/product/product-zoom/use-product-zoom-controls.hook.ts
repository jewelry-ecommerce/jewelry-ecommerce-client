"use client";

import { useLayoutEffect, useRef, useState, type CSSProperties, type MouseEvent, type WheelEvent } from "react";
import { usePinchZoom, clampProductZoomScale, getProductZoomPoint, type PinchZoomResult } from "@/app/(layout-main)/san-pham/_components/hooks/use-pinch-zoom.hook";
import { PRODUCT_ZOOM_CONFIG } from "@/app/(layout-main)/san-pham/_components/hooks/pinch-zoom.constants";
export interface ProductZoomProps {
  images: string[];
  productName?: string;
  initialIndex: number;
  initialScale?: number;
  isOpen: boolean;
  onClose: () => void;
}

interface MouseZoomControls {
  isDragging: boolean;
  handleMouseDown: (event: MouseEvent) => void;
  handleMouseMove: (event: MouseEvent) => void;
  handleMouseUp: (event: MouseEvent) => void;
  stopDragging: () => void;
}

interface ImageNavigation {
  currentIndex: number;
  nextImage: (event: MouseEvent) => void;
  prevImage: (event: MouseEvent) => void;
}

export interface ProductZoomControls extends MouseZoomControls, ImageNavigation {
  setZoomContainer: (container: HTMLDivElement | null) => void;
  handleWheel: (event: WheelEvent) => void;
  isZoomed: boolean;
  imageStyle: CSSProperties;
  resetZoom: () => void;
  zoomIn: () => void;
  zoomOut: () => void;
}

function getImageStyle(zoom: PinchZoomResult, isDragging: boolean): CSSProperties {
  const isZoomed = zoom.scale > PRODUCT_ZOOM_CONFIG.minScale;
  return {
    transform: `translate3d(${zoom.pan.x}px, ${zoom.pan.y}px, 0) scale(${zoom.scale})`,
    transition: isDragging || isZoomed ? "none" : PRODUCT_ZOOM_CONFIG.imageTransition,
    cursor: isZoomed ? (isDragging ? "grabbing" : "grab") : "pointer",
    touchAction: "none",
  };
}

function cycleClickZoom(zoom: PinchZoomResult): void {
  const nextScale = zoom.scale === PRODUCT_ZOOM_CONFIG.minScale ? PRODUCT_ZOOM_CONFIG.clickScales[0]
    : zoom.scale === PRODUCT_ZOOM_CONFIG.clickScales[0] ? PRODUCT_ZOOM_CONFIG.clickScales[1] : PRODUCT_ZOOM_CONFIG.minScale;
  zoom.setScale(nextScale);
  if (nextScale === PRODUCT_ZOOM_CONFIG.minScale) zoom.setPan({ x: 0, y: 0 });
}

function useMouseZoom(zoom: PinchZoomResult): MouseZoomControls {
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const panStart = useRef({ x: 0, y: 0 });
  const handleMouseDown = (event: MouseEvent) => {
    dragStart.current = getProductZoomPoint(event);
    panStart.current = zoom.pan;
    if (zoom.scale > PRODUCT_ZOOM_CONFIG.minScale) setIsDragging(true);
  };
  const handleMouseMove = (event: MouseEvent) => {
    if (!isDragging) return;
    const point = getProductZoomPoint(event);
    zoom.setPan({ x: panStart.current.x + point.x - dragStart.current.x, y: panStart.current.y + point.y - dragStart.current.y });
  };
  const handleMouseUp = (event: MouseEvent) => {
    const point = getProductZoomPoint(event);
    const movedX = Math.abs(point.x - dragStart.current.x);
    const movedY = Math.abs(point.y - dragStart.current.y);
    if (!isDragging && movedX < PRODUCT_ZOOM_CONFIG.clickMovementThresholdPx && movedY < PRODUCT_ZOOM_CONFIG.clickMovementThresholdPx) {
      cycleClickZoom(zoom);
    }
    setIsDragging(false);
  };
  return { isDragging, handleMouseDown, handleMouseMove, handleMouseUp, stopDragging: () => setIsDragging(false) };
}

function useImageNavigation(props: ProductZoomProps, resetZoom: PinchZoomResult["resetZoom"]): ImageNavigation {
  const [currentIndex, setCurrentIndex] = useState(props.initialIndex);
  useLayoutEffect(() => {
    if (!props.isOpen) return;
    setCurrentIndex(props.initialIndex);
    // Continue the zoom the user was already viewing outside the overlay.
    resetZoom(Math.max(
      props.initialScale ?? PRODUCT_ZOOM_CONFIG.minScale,
      window.visualViewport?.scale ?? PRODUCT_ZOOM_CONFIG.minScale,
    ));
  }, [props.isOpen, props.initialIndex, props.initialScale, resetZoom]);
  const changeImage = (direction: number, event: MouseEvent) => {
    event.stopPropagation();
    if (props.images.length === 0) return;
    setCurrentIndex((index) => (index + direction + props.images.length) % props.images.length);
    resetZoom();
  };
  return { currentIndex, nextImage: (event: MouseEvent) => changeImage(1, event), prevImage: (event: MouseEvent) => changeImage(-1, event) };
}

export function useProductZoomControls(props: ProductZoomProps): ProductZoomControls {
  const [zoomContainer, setZoomContainer] = useState<HTMLDivElement | null>(null);
  const zoom = usePinchZoom(zoomContainer);
  const mouse = useMouseZoom(zoom);
  const navigation = useImageNavigation(props, zoom.resetZoom);
  const changeScale = (delta: number) => {
    const nextScale = clampProductZoomScale(zoom.scale + delta);
    zoom.setScale(nextScale);
    if (nextScale === PRODUCT_ZOOM_CONFIG.minScale) zoom.setPan({ x: 0, y: 0 });
  };
  const handleWheel = (event: WheelEvent) => changeScale(event.deltaY > 0 ? -PRODUCT_ZOOM_CONFIG.wheelStep : PRODUCT_ZOOM_CONFIG.wheelStep);
  return {
    ...mouse, ...navigation, setZoomContainer, handleWheel,
    isZoomed: zoom.scale > PRODUCT_ZOOM_CONFIG.minScale,
    imageStyle: getImageStyle(zoom, mouse.isDragging), resetZoom: () => zoom.resetZoom(),
    zoomIn: () => changeScale(PRODUCT_ZOOM_CONFIG.toolbarStep),
    zoomOut: () => changeScale(-PRODUCT_ZOOM_CONFIG.toolbarStep),
  };
}
