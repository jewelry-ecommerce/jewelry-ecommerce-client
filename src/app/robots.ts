import type { MetadataRoute } from "next";
import { ROBOTS_DISALLOW_PATHS } from "@/lib/seo/app-routes";
import { resolvePublicSiteUrl } from "@/lib/server/public-site-url";

export const revalidate = 3600;

export default function robots(): MetadataRoute.Robots {
  const siteUrl = resolvePublicSiteUrl();

  return {
    rules: {
      userAgent: "*",
      disallow: [...ROBOTS_DISALLOW_PATHS],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
