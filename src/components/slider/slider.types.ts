import { Breakpoint } from "@mui/material";

export type ResponsiveItemsToShow = Partial<Record<Breakpoint, number>>;

export interface SliderProps {
  children: React.ReactNode;
  autoplay?: boolean;
  autoplaySpeed?: number;
  showDots?: boolean;
  showArrows?: boolean;
  loop?: boolean;
  height?: string | number | Partial<Record<Breakpoint, string | number>>;
  className?: string;
  itemsToShow?: number | ResponsiveItemsToShow;
  slidesToScroll?: number;
  spacing?: number;
  swipeable?: boolean;
  centerMode?: boolean;
  currentSlide?: number;
  defaultSlide?: number;
  onSlideChange?: (index: number) => void;
  type?: "dots" | "progress";
  showProgress?: boolean;
  /** Thời gian (ms) từng slide timer-based. Không truyền = dùng autoplaySpeed. Video trong slide được slider tự nhận diện. */
  slideDurations?: (number | undefined)[];
}

export const DEFAULT_AUTOPLAY_SPEED = 10_000;
export const DEFAULT_SPACING = 0;
