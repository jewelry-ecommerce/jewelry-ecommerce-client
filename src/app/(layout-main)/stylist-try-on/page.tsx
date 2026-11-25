import type { Metadata } from "next";
import { headers } from "next/headers";
import { createPageMetadata, getSharedSeoImage } from "@/lib/server/storefront-metadata";
import { siteConfig } from "@/utils/config/site";
import StylistTryOnApp from "./_components/stylist-try-on.app";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const host = (await headers()).get("host");
  return createPageMetadata({
    path: "/stylist-try-on",
    title: `Đeo thử trang sức | ${siteConfig.name}`,
    description: `Tải ảnh vùng đeo và xem vài mẫu minh họa từ catalog ${siteConfig.name} trước khi mua.`,
    image: getSharedSeoImage(host),
  });
}

export default function StylistTryOnPage() {
  return <StylistTryOnApp />;
}
