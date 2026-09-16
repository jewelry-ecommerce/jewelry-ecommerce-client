import { useEffect, useState } from "react";

const KEYBOARD_OPEN_THRESHOLD_PX = 150;

/** Chiều cao bàn phím ảo che viewport (px). Trả về 0 khi không hỗ trợ hoặc bàn phím đóng. */
export function getVisualKeyboardInset(): number {
  if (typeof window === "undefined") return 0;

  const viewport = window.visualViewport;
  if (!viewport) return 0;

  return Math.max(0, window.innerHeight - viewport.height - viewport.offsetTop);
}

/**
 * Phát hiện bàn phím ảo trên mobile qua Visual Viewport API.
 * Dùng để ẩn thanh fixed (CTA thanh toán) khi người dùng đang nhập form.
 */
export function useVisualKeyboardOpen(enabled = true): boolean {
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

  useEffect(() => {
    if (!enabled) {
      setIsKeyboardOpen(false);
      return;
    }

    const viewport = window.visualViewport;
    if (!viewport) return;

    const update = () => {
      setIsKeyboardOpen(getVisualKeyboardInset() > KEYBOARD_OPEN_THRESHOLD_PX);
    };

    update();
    viewport.addEventListener("resize", update);
    viewport.addEventListener("scroll", update);
    window.addEventListener("resize", update);

    return () => {
      viewport.removeEventListener("resize", update);
      viewport.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [enabled]);

  return isKeyboardOpen;
}
