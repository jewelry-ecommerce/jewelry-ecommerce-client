import type { Metadata } from "next";
import { getStorefrontPageMetadata, sharedSeoImage } from "@/lib/server/storefront-metadata";
import { siteConfig } from "@/utils/config/site";
import HomeView from "../../trang-chu/_components/home.app";

export const revalidate = 60; // ISR: CMS slug child page revalidate mỗi 60 giây

interface CmsSlugChildPageProps {
  params: Promise<{ slug: string; child: string[] }>;
}

export async function generateMetadata({ params }: CmsSlugChildPageProps): Promise<Metadata> {
  const { slug, child = [] } = await params;
  const path = `/${[slug, ...child].filter(Boolean).join("/")}` as `/${string}`;

  return getStorefrontPageMetadata({
    slug,
    path,
    canonicalUrl: `${siteConfig.url}${path}`,
    defaults: {
      title: `${siteConfig.name} | ${slug}`,
      description: "Trang noi dung tu CMS",
      keywords: slug,
      image: sharedSeoImage,
    },
  });
}

const CmsSlugChildPage = async ({ params }: CmsSlugChildPageProps) => {
  const { slug } = await params;
  return <HomeView slug={slug} />;
};

export default CmsSlugChildPage;
