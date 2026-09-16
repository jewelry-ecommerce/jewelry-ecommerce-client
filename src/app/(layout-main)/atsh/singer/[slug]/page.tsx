import { AtshSingerPageClient } from "@/app/(layout-main)/atsh/singer/_components/atsh-singer-page.client";
import { getAtshSingerPageDataFromBrothers } from "@/app/(layout-main)/atsh/singer/_utils/atsh-singer-brothers.mapper";
import { fetchAtshBrothersData } from "@/app/(layout-main)/atsh/_utils/atsh-brothers-fetch.server";
import {
  fetchAtshSingerCollectionProducts,
  resolveAtshSingerFullLookTotalPrice,
} from "@/app/(layout-main)/atsh/singer/_utils/atsh-singer-products-fetch.server";
import { createMetadata } from "@/libs/seo/metadata";
import { siteConfig } from "@/utils/config/site";
import type { Metadata } from "next";

export const revalidate = 300; // ISR: ATSH singer detail revalidate mỗi 5 phút

type AtshSingerSlugPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: AtshSingerSlugPageProps): Promise<Metadata> {
  const { slug } = await params;
  const brothersData = await fetchAtshBrothersData();
  const pageData = brothersData ? getAtshSingerPageDataFromBrothers(slug, brothersData) : undefined;

  if (!pageData) {
    return createMetadata({
      title: "Tinh Hà Say Hi x Heartlock",
      description: "Bộ sưu tập collab độc quyền Heartlock x Anh Trai Say Hi.",
      noIndex: !pageData,
    });
  }

  const title = `${pageData.singerName} | Tinh Hà Say Hi x Heartlock`;
  const description = pageData.introDescription;

  return {
    ...createMetadata({
      title,
      description,
      keywords: `tinh hà say hi, ${pageData.singerName}, heartlock, anh trai say hi, bộ sưu tập collab`,
      canonicalUrl: `${siteConfig.url}/atsh/singer/${slug}`,
    }),
    title: { absolute: title },
  };
}

export default async function AtshSingerSlugPage({ params }: AtshSingerSlugPageProps) {
  const { slug } = await params;
  const collectionProducts = await fetchAtshSingerCollectionProducts(slug);

  return (
    <AtshSingerPageClient
      slug={slug}
      collectionProducts={collectionProducts}
      fullLookTotalPrice={resolveAtshSingerFullLookTotalPrice(collectionProducts)}
    />
  );
}
