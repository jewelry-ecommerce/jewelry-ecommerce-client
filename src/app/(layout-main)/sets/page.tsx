// set term
import type { Metadata } from "next";
import { headers } from "next/headers";
import { BreadcrumbComponent } from "@/components";
import { getSharedSeoImage, createPageMetadata } from "@/lib/server/storefront-metadata";
import { fetchSetListing, getSetListParams } from "@/lib/server/set-listing-fetch.server";
import { siteConfig } from "@/utils/config/site";
import SetListingSection from "./_components/set-listing-section.component";
import React from "react";

export const dynamic = "force-dynamic";

type SetPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata(): Promise<Metadata> {
  const host = (await headers()).get("host");
  return createPageMetadata({
    path: "/sets",
    title: `Mua trọn bộ sưu tập | ${siteConfig.name}`,
    description: `Khám phá các bộ trang sức đang mở bán tại ${siteConfig.name}.`,
    image: getSharedSeoImage(host),
  });
}

export default async function SetListingPage({ searchParams }: SetPageProps) {
  const params = getSetListParams(await searchParams);
  const initialData = await fetchSetListing(params);

  return (
    <React.Fragment>
      <BreadcrumbComponent items={[{ label: "Trang chủ", href: "/" }, { label: "STELLA SET" }]} />
      <SetListingSection initialData={initialData} params={params} />
    </React.Fragment>
  );
}
