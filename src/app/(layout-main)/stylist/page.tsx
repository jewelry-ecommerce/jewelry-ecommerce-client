import type { Metadata } from "next";
import { headers } from "next/headers";
import { createPageMetadata, getSharedSeoImage } from "@/lib/server/storefront-metadata";
import { siteConfig } from "@/utils/config/site";
import StylistApp from "./_components/stylist.app";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const host = (await headers()).get("host");
  return createPageMetadata({
    path: "/stylist",
    title: `Gợi ý trang sức | ${siteConfig.name}`,
    description: `Chọn dịp, phong cách và ngân sách để nhận gợi ý trang sức tại ${siteConfig.name}.`,
    image: getSharedSeoImage(host),
  });
}

export default function StylistPage() {
  return <StylistApp />;
}
