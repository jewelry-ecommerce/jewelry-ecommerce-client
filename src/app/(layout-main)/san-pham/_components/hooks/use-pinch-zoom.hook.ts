"use client";

import { useState, useRef, useEffect, useLayoutEffect, useCallback, useMemo, type Dispatch, type SetStateAction } from "react";
import { PRODUCT_ZOOM_CONFIG } from "./pinch-zoom.constants";

export interface ZoomPoint {
  x: number;
  y: number;
}

export function clampProductZoomScale(scale: number): number {
  const maximumScale = Math.max(PRODUCT_ZOOM_CONFIG.maxScale, window.visualViewport?.scale || PRODUCT_ZOOM_CONFIG.minScale);
  return Math.min(Math.max(scale, PRODUCT_ZOOM_CONFIG.minScale), maximumScale);
}

export function getProductZoomPoint(point: Pick<Touch, "clientX" | "clientY">): ZoomPoint {
  const browserScale = window.visualViewport?.scale || PRODUCT_ZOOM_CONFIG.minScale;
  return { x: point.clientX * browserScale, y: point.clientY * browserScale };
}

function getTouchDistance(firstTouch: Touch, secondTouch: Touch): number {
  return Math.hypot(firstTouch.clientX - secondTouch.clientX, firstTouch.clientY - secondTouch.clientY);
}

function getTouchMidpoint(firstTouch: Touch, secondTouch: Touch): ZoomPoint {
  return getProductZoomPoint({
    clientX: (firstTouch.clientX + secondTouch.clientX) / 2,
    clientY: (firstTouch.clientY + secondTouch.clientY) / 2,
  });
}

function preventZoomGesture(event: TouchEvent): void {
  if (event.cancelable) event.preventDefault();
  event.stopPropagation();
}

export interface PinchZoomResult {
  scale: number;
  pan: ZoomPoint;
  resetZoom: (initialScale?: number) => void;
  setScale: Dispatch<SetStateAction<number>>;
  setPan: Dispatch<SetStateAction<ZoomPoint>>;
}

interface ZoomGestureState {
  scale: number;
  pan: ZoomPoint;
  initialDistance: number;
  initialScale: number;
  initialMidpoint: ZoomPoint;
  initialPan: ZoomPoint;
  isPinching: boolean;
  isPanning: boolean;
  lastTapTime: number;
}

interface ZoomGestureContext {
  state: { current: ZoomGestureState };
  setScale: PinchZoomResult["setScale"];
  setPan: PinchZoomResult["setPan"];
}

interface TouchHandlers {
  start: (event: TouchEvent) => void;
  move: (event: TouchEvent) => void;
  end: () => void;
}

function createGestureState(initialScale: number = PRODUCT_ZOOM_CONFIG.minScale): ZoomGestureState {
  return {
    scale: initialScale, pan: { x: 0, y: 0 },
    initialDistance: 0, initialScale: PRODUCT_ZOOM_CONFIG.minScale,
    initialMidpoint: { x: 0, y: 0 }, initialPan: { x: 0, y: 0 },
    isPinching: false, isPanning: false, lastTapTime: 0,
  };
}

function startPinch(event: TouchEvent, context: ZoomGestureContext): void {
  preventZoomGesture(event);
  const gesture = context.state.current;
  gesture.initialDistance = getTouchDistance(event.touches[0], event.touches[1]);
  gesture.initialScale = gesture.scale;
  gesture.initialMidpoint = getTouchMidpoint(event.touches[0], event.touches[1]);
  gesture.initialPan = gesture.pan;
  gesture.isPinching = true;
  gesture.isPanning = false;
  gesture.lastTapTime = 0;
}

function startSingleTouch(event: TouchEvent, context: ZoomGestureContext): void {
  const gesture = context.state.current;
  const now = Date.now();
  const isDoubleTap = gesture.lastTapTime > 0 && now - gesture.lastTapTime < PRODUCT_ZOOM_CONFIG.doubleTapIntervalMs;
  if (isDoubleTap) {
    preventZoomGesture(event);
    const nextScale = gesture.scale < PRODUCT_ZOOM_CONFIG.doubleTapScale
      ? PRODUCT_ZOOM_CONFIG.doubleTapScale
      : gesture.scale < PRODUCT_ZOOM_CONFIG.maxScale ? PRODUCT_ZOOM_CONFIG.maxScale : PRODUCT_ZOOM_CONFIG.minScale;
    context.setScale(nextScale);
    if (nextScale === PRODUCT_ZOOM_CONFIG.minScale) context.setPan({ x: 0, y: 0 });
    gesture.lastTapTime = 0;
    return;
  }
  gesture.lastTapTime = now;
  if (gesture.scale <= PRODUCT_ZOOM_CONFIG.minScale) return;
  event.stopPropagation();
  gesture.initialMidpoint = getProductZoomPoint(event.touches[0]);
  gesture.initialPan = gesture.pan;
  gesture.isPanning = true;
  gesture.isPinching = false;
}

function updateGesturePan(point: ZoomPoint, context: ZoomGestureContext): void {
  const gesture = context.state.current;
  context.setPan({
    x: gesture.initialPan.x + point.x - gesture.initialMidpoint.x,
    y: gesture.initialPan.y + point.y - gesture.initialMidpoint.y,
  });
}

function moveTouch(event: TouchEvent, context: ZoomGestureContext): void {
  const gesture = context.state.current;
  if (event.touches.length === 2 && gesture.isPinching) {
    preventZoomGesture(event);
    if (gesture.initialDistance <= 0) return;
    const factor = getTouchDistance(event.touches[0], event.touches[1]) / gesture.initialDistance;
    const nextScale = clampProductZoomScale(factor * gesture.initialScale);
    context.setScale(nextScale);
    if (nextScale === PRODUCT_ZOOM_CONFIG.minScale) {
      context.setPan({ x: 0, y: 0 });
      return;
    }
    updateGesturePan(getTouchMidpoint(event.touches[0], event.touches[1]), context);
    return;
  }
  if (event.touches.length !== 1 || !gesture.isPanning) return;
  preventZoomGesture(event);
  updateGesturePan(getProductZoomPoint(event.touches[0]), context);
}

function createTouchHandlers(context: ZoomGestureContext): TouchHandlers {
  return {
    start: (event) => {
      if (event.touches.length === 2) startPinch(event, context);
      else if (event.touches.length === 1) startSingleTouch(event, context);
    },
    move: (event) => moveTouch(event, context),
    end: () => {
      context.state.current.isPinching = false;
      context.state.current.isPanning = false;
    },
  };
}

function useTouchListeners(container: HTMLElement | null, handlers: TouchHandlers): void {
  useEffect(() => {
    if (!container) return;
    container.addEventListener("touchstart", handlers.start, { passive: false });
    container.addEventListener("touchmove", handlers.move, { passive: false });
    container.addEventListener("touchend", handlers.end);
    container.addEventListener("touchcancel", handlers.end);
    return () => {
      container.removeEventListener("touchstart", handlers.start);
      container.removeEventListener("touchmove", handlers.move);
      container.removeEventListener("touchend", handlers.end);
      container.removeEventListener("touchcancel", handlers.end);
      handlers.end();
    };
  }, [container, handlers]);
}

export function clampProductZoomPan(container: HTMLElement | null, pan: ZoomPoint, scale: number): ZoomPoint {
  const image = container?.querySelector("img");
  if (!container || !image || scale <= PRODUCT_ZOOM_CONFIG.minScale) return { x: 0, y: 0 };
  const horizontalLimit = Math.max(0, (image.offsetWidth * scale - container.clientWidth) / 2);
  const verticalLimit = Math.max(0, (image.offsetHeight * scale - container.clientHeight) / 2);
  return {
    x: Math.min(Math.max(pan.x, -horizontalLimit), horizontalLimit),
    y: Math.min(Math.max(pan.y, -verticalLimit), verticalLimit),
  };
}

function usePanBounds(container: HTMLElement | null, scale: number, pan: ZoomPoint, setPan: PinchZoomResult["setPan"]): void {
  const updateBounds = useCallback(() => {
    setPan((currentPan) => {
      const boundedPan = clampProductZoomPan(container, currentPan, scale);
      return boundedPan.x === currentPan.x && boundedPan.y === currentPan.y ? currentPan : boundedPan;
    });
  }, [container, scale, setPan]);
  // Clamp before paint for touch, mouse, and scale changes through the existing setters.
  useLayoutEffect(updateBounds, [updateBounds, pan]);
  useEffect(() => {
    if (!container) return;
    const observer = typeof ResizeObserver === "undefined" ? undefined : new ResizeObserver(updateBounds);
    observer?.observe(container);
    const image = container.querySelector("img");
    if (image) observer?.observe(image);
    container.addEventListener("load", updateBounds, true);
    window.addEventListener("resize", updateBounds);
    return () => {
      observer?.disconnect();
      container.removeEventListener("load", updateBounds, true);
      window.removeEventListener("resize", updateBounds);
    };
  }, [container, updateBounds]);
}

export function usePinchZoom(container: HTMLElement | null): PinchZoomResult {
  const [scale, setScale] = useState<number>(PRODUCT_ZOOM_CONFIG.minScale);
  const [pan, setPan] = useState<ZoomPoint>({ x: 0, y: 0 });
  usePanBounds(container, scale, pan, setPan);
  const state = useRef<ZoomGestureState>(createGestureState());
  useEffect(() => {
    state.current.scale = scale;
    state.current.pan = pan;
  }, [scale, pan]);
  const handlers = useMemo(() => createTouchHandlers({ state, setScale, setPan }), []);
  useTouchListeners(container, handlers);
  const resetZoom = useCallback((initialScale: number = PRODUCT_ZOOM_CONFIG.minScale) => {
    state.current = createGestureState(initialScale);
    setScale(initialScale);
    setPan({ x: 0, y: 0 });
  }, []);
  return { scale, pan, resetZoom, setScale, setPan };
}
