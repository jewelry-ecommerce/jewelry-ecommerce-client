import type { Metadata } from "next";
import { headers } from "next/headers";
import { createPageMetadata, getSharedSeoImage } from "@/lib/server/storefront-metadata";
import { siteConfig } from "@/utils/config/site";
import SetBuilderApp from "./_components/set-builder.app";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const host = (await headers()).get("host");
  return createPageMetadata({
    path: "/set-builder",
    title: `Phối bộ trang sức | ${siteConfig.name}`,
    description: `Phối 2 đến 6 món trang sức theo dịp và ngân sách tại ${siteConfig.name}.`,
    image: getSharedSeoImage(host),
  });
}

export default function SetBuilderPage() {
  return <SetBuilderApp />;
}
