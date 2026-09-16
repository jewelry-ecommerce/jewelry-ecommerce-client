import React, { Suspense } from "react";
import type { Metadata } from "next";
import { getStorefrontPageMetadata, sharedSeoImage } from "@/lib/server/storefront-metadata";
import { siteConfig } from "@/utils/config/site";
import ViewCart from "./_components/cart.app";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return getStorefrontPageMetadata({
    slug: "gio-hang",
    path: "/gio-hang",
    defaults: {
      title: `Giỏ hàng | ${siteConfig.name}`,
      description: `Xem lại các sản phẩm đã chọn trong giỏ hàng và tiếp tục mua sắm tại ${siteConfig.name}.`,
      keywords: `giỏ hàng, ${siteConfig.name}, mua sắm`,
      image: sharedSeoImage,
    },
  });
}

export default function CartPage() {
  return (
    <Suspense fallback={null}>
      <ViewCart />
    </Suspense>
  );
}
