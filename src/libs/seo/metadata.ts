import { normalizeCanonicalUrl, type CanonicalPath } from "@/lib/seo/canonical-url";
import { resolvePublicSiteUrl } from "@/lib/server/public-site-url";
import { siteConfig } from "@/utils/config/site";
import type { Metadata } from "next";

type CreateMetadataInput = {
  title?: string;
  description?: string;
  keywords?: string;
  canonicalUrl?: string;
  path?: CanonicalPath;
  siteUrl?: string;
  image?: {
    url: string;
    width?: number;
    height?: number;
    alt?: string;
  };
  noIndex?: boolean;
};

const buildDefaultOgImage = (siteUrl: string) =>
  ({
    url: `${siteUrl}/og.png`,
    width: 1200,
    height: 630,
    alt: `${siteConfig.name} - Tinh tế trong từng thiết kế trang sức`,
  }) as const;

export function createMetadata(input: CreateMetadataInput = {}): Metadata {
  const siteUrl = input.siteUrl ?? resolvePublicSiteUrl();
  const title = input.title ?? siteConfig.name;
  const description = input.description ?? `Khám phá bộ sưu tập trang sức mới nhất tại ${siteConfig.name}.`;

  const canonical = normalizeCanonicalUrl(input.canonicalUrl, input.path ?? "/", siteUrl);
  const image = input.image ?? buildDefaultOgImage(siteUrl);

  return {
    metadataBase: new URL(siteUrl),
    title,
    description,
    keywords: input.keywords,
    alternates: { canonical },
    robots: input.noIndex ? { index: false, follow: false } : undefined,
    openGraph: {
      type: "website",
      siteName: siteConfig.name,
      title,
      description,
      url: canonical,
      images: [
        {
          url: image.url,
          width: image.width ?? 1200,
          height: image.height ?? 630,
          alt: image.alt ?? title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image.url],
    },
  };
}
