import type { Metadata } from "next";
import { headers } from "next/headers";
import { createPageMetadata, getSharedSeoImage } from "@/lib/server/storefront-metadata";
import { siteConfig } from "@/utils/config/site";
import StylistHistoryApp from "./_components/stylist-history.app";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const host = (await headers()).get("host");
  return createPageMetadata({
    path: "/stylist/lich-su",
    title: `Lịch sử gợi ý | ${siteConfig.name}`,
    description: `Các phiên gợi ý trang sức đã lưu trong tài khoản tại ${siteConfig.name}.`,
    image: getSharedSeoImage(host),
    noIndex: true,
  });
}

export default function StylistHistoryPage() {
  return <StylistHistoryApp />;
}
