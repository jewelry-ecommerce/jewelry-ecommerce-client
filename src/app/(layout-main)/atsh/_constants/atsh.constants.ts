import { ATSH_HERO_SECTION_ID, ATSH_SECTION_SCROLL_DURATION_MS, ATSH_SPIRAL_SECTION_ID } from "./atsh-hero-motion.constants";

export { ATSH_HERO_SECTION_ID, ATSH_SECTION_SCROLL_DURATION_MS, ATSH_SPIRAL_SECTION_ID };

/** Public landing URL (BST Collab Tinh Hà "Say Hi"). */
export const ATSH_PAGE_PATH = "/bst-collab-tinhhasayhi" as const;

/**
 * Đích CTA card 24 anh trai trên spiral gallery.
 * - `collection` — trang BST riêng (WebClient), URL từ `routes.collectionPage` (CMS nhập)
 * - `singer` — trang chi tiết anh trai `/atsh/singer/[slug]` (`routes.singerPage`)
 *
 * Đổi 1 dòng này để bật/tắt lại trang chi tiết — không cần sửa JSON trên server.
 */
export type AtshSpiralCardNavTarget = "singer" | "collection";
export const ATSH_SPIRAL_CARD_NAV_TARGET: AtshSpiralCardNavTarget = "collection";

export function isAtshLandingPath(pathname: string | null | undefined): boolean {
  if (!pathname) {
    return false;
  }

  return pathname === ATSH_PAGE_PATH || pathname === `${ATSH_PAGE_PATH}/`;
}

/** Deep link tới section 24 Anh Trai trên trang landing */
export const ATSH_SPIRAL_SECTION_HREF = `${ATSH_PAGE_PATH}#${ATSH_SPIRAL_SECTION_ID}` as const;

export const ATSH_IMAGE_BASE = "/image/atsh";

/** Heartlock full vertical logo — Figma Logo White Vertical node 21951:384017 */
export const ATSH_HEARTLOCK_LOGO = `${ATSH_IMAGE_BASE}/heartlock-logo.svg` as const;

/** Nền hero — export từ Figma imageRef lớp 1 (cosmic scene). Các lớp 2/3 raw export không khớp composite Figma. */
export const ATSH_HERO_BACKGROUND = `${ATSH_IMAGE_BASE}/hero-bg-desktop-1.png`;

/** Nền CTA — Figma Default (primary) / Frame 1948757346 (secondary) */
export const ATSH_CTA_BUTTON_BACKGROUND = {
  primary: `${ATSH_IMAGE_BASE}/button.svg`,
  secondary: `${ATSH_IMAGE_BASE}/button-secondary.svg`,
} as const;

export const ATSH_HERO_TYPOGRAPHY = {
  headline: {
    mobile: { fontSize: 24, lineHeight: "150%" },
    tablet: { fontSize: 32, lineHeight: "150%" },
    desktop: { fontSize: 40, lineHeight: "150%" },
  },
  tagline: {
    mobile: { fontSize: 14, lineHeight: "20px" },
    tablet: { fontSize: 18, lineHeight: "26px" },
    desktop: { fontSize: 20, lineHeight: "28px" },
  },
  cta: {
    mobile: { fontSize: 14, lineHeight: "20px" },
    desktop: { fontSize: 20, lineHeight: "28px" },
  },
} as const;

export const ATSH_CTA_BUTTON_SIZE = {
  mobile: { width: 180, height: 36 },
  desktop: { width: 280, height: 56 },
} as const;
