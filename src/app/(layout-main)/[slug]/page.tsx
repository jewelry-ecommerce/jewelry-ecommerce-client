import type { Metadata } from "next";
import { getStorefrontPageMetadata, sharedSeoImage } from "@/lib/server/storefront-metadata";
import { siteConfig } from "@/utils/config/site";
import HomeView from "../trang-chu/_components/home.app";

export const revalidate = 60; // ISR: CMS slug page revalidate mỗi 60 giây

interface CmsSlugPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: CmsSlugPageProps): Promise<Metadata> {
  const { slug } = await params;

  return getStorefrontPageMetadata({
    slug,
    path: `/${slug}`,
    canonicalUrl: `${siteConfig.url}/${slug}`,
    defaults: {
      title: `${siteConfig.name} | ${slug}`,
      description: "Trang nội dung từ CMS",
      keywords: slug,
      image: sharedSeoImage,
    },
  });
}

const CmsSlugPage = async ({ params }: CmsSlugPageProps) => {
  const { slug } = await params;
  return <HomeView slug={slug} />;
};

export default CmsSlugPage;
