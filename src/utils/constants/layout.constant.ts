/** Chiều cao header site — cập nhật runtime qua ResizeObserver trên `<header>`. */
export const SITE_HEADER_HEIGHT_CSS_VAR = "--site-header-height";

/** Top offset mega search (`topOffset={headerHeight}`) + fallback CSS var trước khi đo. */
export const SITE_HEADER_HEIGHT_FALLBACK_PX = 0;

export const siteHeaderHeightCssVar = () => `var(${SITE_HEADER_HEIGHT_CSS_VAR}, ${SITE_HEADER_HEIGHT_FALLBACK_PX}px)`;
