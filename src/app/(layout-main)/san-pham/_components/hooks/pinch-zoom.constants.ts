export const PRODUCT_ZOOM_CONFIG = {
  minScale: 1,
  maxScale: 3,
  doubleTapScale: 1.8,
  doubleTapIntervalMs: 300,
  clickScales: [1.5, 2.5],
  clickMovementThresholdPx: 5,
  toolbarStep: 0.5,
  wheelStep: 0.2,
  mobileBreakpoint: 810,
  mobileArrowSize: 28,
  desktopArrowSize: 32,
  imageTransition: "transform 0.4s cubic-bezier(0.2, 0, 0, 1)",
} as const;
