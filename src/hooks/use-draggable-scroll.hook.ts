import { useRef, useState, useCallback } from "react";

const useDraggableScroll = (selector = ".MuiTabs-scroller") => {
  const ref = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const onWheel = useCallback(
    (e: React.WheelEvent) => {
      const scroller = ref.current?.querySelector(selector);
      if (scroller) {
        scroller.scrollLeft += e.deltaY;
      }
    },
    [selector],
  );

  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      const scroller = ref.current?.querySelector(selector);
      if (scroller) {
        setStartX(e.pageX - (scroller as HTMLElement).offsetLeft);
        setScrollLeft(scroller.scrollLeft);
      }
    },
    [selector],
  );

  const onMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const scroller = ref.current?.querySelector(selector);
      if (!scroller || e.buttons !== 1) return;

      const x = e.pageX - (scroller as HTMLElement).offsetLeft;
      const distance = Math.abs(x - startX);

      if (distance > 5) {
        if (!isDragging) setIsDragging(true);
        const walk = (x - startX) * 1.5;
        scroller.scrollLeft = scrollLeft - walk;
      }
    },
    [isDragging, scrollLeft, selector, startX],
  );

  const onMouseUp = useCallback(() => setIsDragging(false), []);
  const onMouseLeave = useCallback(() => setIsDragging(false), []);

  return {
    ref,
    isDragging,
    handlers: {
      onWheel,
      onMouseDown,
      onMouseMove,
      onMouseUp,
      onMouseLeave,
    },
  };
};

export default useDraggableScroll;
