import type { CdnImageTransform } from "@/utils/cdn/cdn-image.util";
import { CDN_IMAGE_RETINA_DPR, scaleCdnTransformByDevicePixelRatio } from "@/utils/cdn/cdn-image-dpr.util";

/** Base hero grid cell size from storefront design spec (4×2 grid, 378×378 px per cell). */
export const HERO_GRID_CELL_WIDTH = 378;
export const HERO_GRID_CELL_HEIGHT = 378;

/** Retina CDN dimensions (CSS cell size ×3 for sharp iPhone / high-DPR displays). */
export const buildHeroGridCdnTransform = (colSpan: number, rowSpan: number): CdnImageTransform =>
  scaleCdnTransformByDevicePixelRatio(
    {
      width: HERO_GRID_CELL_WIDTH * colSpan,
      height: HERO_GRID_CELL_HEIGHT * rowSpan,
      quality: 95,
      format: "webp",
    },
    CDN_IMAGE_RETINA_DPR,
  );

export const buildHeroSlotAspectRatio = (gridWidth: number, gridHeight: number): string =>
  `${gridWidth * HERO_GRID_CELL_WIDTH} / ${gridHeight * HERO_GRID_CELL_HEIGHT}`;
