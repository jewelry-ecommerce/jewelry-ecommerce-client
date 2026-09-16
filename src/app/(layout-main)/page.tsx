import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getStorefrontPageMetadata, sharedSeoImage } from "@/lib/server/storefront-metadata";
import { fetchHomeInitialData, getHomeLcpImagePreloads } from "@/lib/server/home-fetch.server";
import { buildWebsiteJsonLd } from "@/lib/seo/website-json-ld";
import { serializeJsonLd } from "@/lib/seo/product-json-ld";
import { siteConfig } from "@/utils/config/site";
import HomeLcpImagePreloads from "./trang-chu/_components/home-lcp-preloads";
import HomeView from "./trang-chu/_components/home.app";
import React from "react";

export const revalidate = 60; // ISR: revalidate trang chủ mỗi 60 giây

export async function generateMetadata(): Promise<Metadata> {
  return getStorefrontPageMetadata({
    slug: "trang-chu",
    path: "/",
    canonicalUrl: siteConfig.url,
    defaults: {
      title: `${siteConfig.name} | Tinh tế trong từng thiết kế trang sức.`,
      description: `Khám phá sản phẩm mới nhất tại ${siteConfig.name}`,
      keywords: "mua sắm, thời trang, giảm giá",
      image: sharedSeoImage,
    },
  });
}

export default async function HomePage() {
  const initialData = await fetchHomeInitialData("trang-chu");
  if (!initialData) notFound();
  const imagePreloads = getHomeLcpImagePreloads(initialData);
  const websiteJsonLd = buildWebsiteJsonLd({
    name: siteConfig.name,
    url: siteConfig.url,
    domain: siteConfig.domain,
  });

  return (
    <React.Fragment>
      {websiteJsonLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: serializeJsonLd(websiteJsonLd),
          }}
        />
      ) : null}
      <HomeLcpImagePreloads preloads={imagePreloads} />
      <HomeView initialData={initialData} />
    </React.Fragment>
  );
}
