"use client";

import { useState, useRef, useEffect, useCallback } from "react";

interface PinchZoomResult {
  scale: number;
  pan: { x: number; y: number };
  resetZoom: () => void;
  setScale: React.Dispatch<React.SetStateAction<number>>;
  setPan: React.Dispatch<React.SetStateAction<{ x: number; y: number }>>;
}

export const usePinchZoom = (containerRef: React.RefObject<HTMLElement>): PinchZoomResult => {
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const currentScaleRef = useRef(1);

  useEffect(() => {
    currentScaleRef.current = scale;
  }, [scale]);

  const state = useRef({
    initialDistance: 0,
    initialScale: 1,
    initialMidpoint: { x: 0, y: 0 },
    initialPan: { x: 0, y: 0 },
    isPinching: false,
    isPanning: false,
    lastTapTime: 0,
  });

  const getDistance = (t1: Touch, t2: Touch) => {
    return Math.sqrt(Math.pow(t1.clientX - t2.clientX, 2) + Math.pow(t1.clientY - t2.clientY, 2));
  };

  const getMidpoint = (t1: Touch, t2: Touch) => {
    return {
      x: (t1.clientX + t2.clientX) / 2,
      y: (t1.clientY + t2.clientY) / 2,
    };
  };

  const handleTouchStart = useCallback(
    (e: TouchEvent) => {
      if (e.touches.length === 2) {
        // Two-finger pinch
        e.preventDefault();
        const t1 = e.touches[0];
        const t2 = e.touches[1];
        state.current.initialDistance = getDistance(t1, t2);
        state.current.initialScale = currentScaleRef.current;
        state.current.initialMidpoint = getMidpoint(t1, t2);
        state.current.initialPan = pan;
        state.current.isPinching = true;
        state.current.isPanning = false;
      } else if (e.touches.length === 1) {
        const now = Date.now();
        const delta = now - state.current.lastTapTime;

        if (delta < 300) {
          // Double tap detected
          e.preventDefault();
          setScale((prev) => {
            if (prev < 1.8) return 1.8;
            if (prev < 3) return 3;
            setPan({ x: 0, y: 0 });
            return 1;
          });
          state.current.lastTapTime = 0;
          return;
        }
        state.current.lastTapTime = now;

        if (currentScaleRef.current > 1) {
          // One-finger pan when zoomed
          const t = e.touches[0];
          state.current.initialMidpoint = { x: t.clientX, y: t.clientY };
          state.current.initialPan = pan;
          state.current.isPanning = true;
          state.current.isPinching = false;
        }
      }
    },
    [pan],
  );

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (e.touches.length === 2 && state.current.isPinching) {
      e.preventDefault();
      const t1 = e.touches[0];
      const t2 = e.touches[1];

      const currentDistance = getDistance(t1, t2);
      if (state.current.initialDistance > 0) {
        const factor = currentDistance / state.current.initialDistance;
        const newScale = Math.min(Math.max(factor * state.current.initialScale, 1), 3);
        setScale(newScale);

        const currentMidpoint = getMidpoint(t1, t2);
        const dx = currentMidpoint.x - state.current.initialMidpoint.x;
        const dy = currentMidpoint.y - state.current.initialMidpoint.y;

        setPan({
          x: state.current.initialPan.x + dx,
          y: state.current.initialPan.y + dy,
        });
      }
    } else if (e.touches.length === 1 && state.current.isPanning) {
      e.preventDefault();
      const t = e.touches[0];
      const dx = t.clientX - state.current.initialMidpoint.x;
      const dy = t.clientY - state.current.initialMidpoint.y;

      setPan({
        x: state.current.initialPan.x + dx,
        y: state.current.initialPan.y + dy,
      });
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    state.current.isPinching = false;
    state.current.isPanning = false;
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // Use non-passive listeners to allow preventDefault
    el.addEventListener("touchstart", handleTouchStart, { passive: false });
    el.addEventListener("touchmove", handleTouchMove, { passive: false });
    el.addEventListener("touchend", handleTouchEnd);
    el.addEventListener("touchcancel", handleTouchEnd);

    return () => {
      el.removeEventListener("touchstart", handleTouchStart);
      el.removeEventListener("touchmove", handleTouchMove);
      el.removeEventListener("touchend", handleTouchEnd);
      el.removeEventListener("touchcancel", handleTouchEnd);
    };
  }, [containerRef, handleTouchStart, handleTouchMove, handleTouchEnd]);

  const resetZoom = useCallback(() => {
    setScale(1);
    setPan({ x: 0, y: 0 });
  }, []);

  return { scale, pan, resetZoom, setScale, setPan };
};
