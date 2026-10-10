import type { BannerPlacement } from "@/utils/api/banner/banner.interface";
import { findBannerDemoPlacement } from "./banner-demo/banner-demo.render";
export async function getMockBannerPlacement(code: string): Promise<BannerPlacement | null> {
  if (process.env.NODE_ENV !== "development") return null;
  return findBannerDemoPlacement(code);
}
