export type WebsiteJsonLd = {
  "@context": "https://schema.org";
  "@type": "WebSite";
  name: string;
  url: string;
  alternateName?: string[];
};

type BuildWebsiteJsonLdInput = {
  name: string;
  url: string;
  domain?: string;
};

export function buildWebsiteJsonLd({ name, url, domain }: BuildWebsiteJsonLdInput): WebsiteJsonLd | null {
  const siteName = name.trim();
  const siteUrl = url.trim();
  if (!siteName || !siteUrl) {
    return null;
  }

  const normalizedUrl = siteUrl.endsWith("/") ? siteUrl : `${siteUrl}/`;
  const domainName = domain?.trim().toLowerCase();
  const alternateName = domainName && domainName !== siteName.toLowerCase() ? [domainName] : undefined;

  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteName,
    url: normalizedUrl,
    ...(alternateName ? { alternateName } : {}),
  };
}
