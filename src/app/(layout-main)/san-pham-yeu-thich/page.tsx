import type { Metadata } from "next";
import { getStorefrontPageMetadata, sharedSeoImage } from "@/lib/server/storefront-metadata";
import { siteConfig } from "@/utils/config/site";
import ProductWishlistApp from "@/app/(layout-main)/san-pham-yeu-thich/_components/product-wishlist.app";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return getStorefrontPageMetadata({
    slug: "san-pham-yeu-thich",
    path: "/san-pham-yeu-thich",
    defaults: {
      title: `Sản phẩm yêu thích | ${siteConfig.name}`,
      description: `Xem lại danh sách sản phẩm yêu thích để lưu giữ những thiết kế bạn quan tâm tại ${siteConfig.name}.`,
      keywords: `sản phẩm yêu thích, wishlist, ${siteConfig.name}`,
      image: sharedSeoImage,
    },
  });
}

export default function ProductWishlistPage() {
  return <ProductWishlistApp />;
}
