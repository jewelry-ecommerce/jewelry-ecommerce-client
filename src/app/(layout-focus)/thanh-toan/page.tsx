import type { Metadata } from "next";
import { getStorefrontPageMetadata, sharedSeoImage } from "@/lib/server/storefront-metadata";
import { siteConfig } from "@/utils/config/site";
import { CheckoutView } from "@/components";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return getStorefrontPageMetadata({
    slug: "thanh-toan",
    path: "/thanh-toan",
    defaults: {
      title: `Thanh toán | ${siteConfig.name}`,
      description: `Hoàn tất thông tin giao hàng và thanh toán đơn hàng một cách nhanh chóng tại ${siteConfig.name}.`,
      keywords: `thanh toán, đặt hàng, ${siteConfig.name}`,
      image: sharedSeoImage,
    },
  });
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={null}>
      <CheckoutView />
    </Suspense>
  );
}
