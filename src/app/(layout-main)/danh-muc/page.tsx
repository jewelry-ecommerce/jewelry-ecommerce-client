import type { Metadata } from "next";
import { createMetadata } from "@/libs/seo/metadata";
import { getStorefrontPageBySlug } from "@/utils/api/cms";
import { siteConfig } from "@/utils/config/site";
import ViewCategory from "./_components/category.app";

export async function generateMetadata(): Promise<Metadata> {
  try {
    const data = await getStorefrontPageBySlug("danh-muc");
    const { seo } = data.page;
    return createMetadata({
      title: seo.title ?? undefined,
      description: seo.description ?? undefined,
      keywords: seo.keywords ?? undefined,
      canonicalUrl: seo.canonicalUrl ?? `${siteConfig.url}/danh-muc`,
    });
  } catch {
    return createMetadata();
  }
}

export default function CategoryPage() {
  return <ViewCategory />;
}
