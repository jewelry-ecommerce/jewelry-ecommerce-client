import type { StorefrontFooterResponse } from "@/utils/api/cms/cms.interface";
import { getCmsDefaults } from "@/utils/api/cms/cms-default";

export type FooterViewModel = {
  columns: { title: string; items: { label: string; url: string }[] }[];
  socialIcons: { src: string; alt: string; href: string }[];
  copyright: string;
  certificationImageUrl?: string;
  certificationUrl?: string;
};

/** Fallback footer cho SSR/hydrate — dùng brandName từ Provider, không đọc env server-only trên client. */
export const buildFooterFallback = (brandName: string): StorefrontFooterResponse =>
  getCmsDefaults(brandName).footer as StorefrontFooterResponse;

export const mapStorefrontFooter = (footer: StorefrontFooterResponse): FooterViewModel => {
  const columns = [...(footer.menuColumns ?? [])]
    .sort((a, b) => a.orderIndex - b.orderIndex)
    .map((column) => ({
      title: column.title,
      items: [...(column.items ?? [])].sort((a, b) => a.orderIndex - b.orderIndex).map((item) => ({ label: item.label, url: item.url })),
    }));

  const socialIcons = [...(footer.socialLinks ?? [])]
    .sort((a, b) => a.orderIndex - b.orderIndex)
    .map((link) => ({
      src: link.image?.trim() ?? "",
      alt: link.displayName || link.platform,
      href: link.url,
    }))
    .filter((icon) => Boolean(icon.src));

  return {
    columns,
    socialIcons,
    copyright: footer.copyrightText?.trim() ?? "",
    certificationImageUrl: footer.certificationImageUrl?.trim() || undefined,
    certificationUrl: footer.certificationUrl?.trim() || undefined,
  };
};
