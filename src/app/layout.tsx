import React from "react";
import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import { Hanken_Grotesk } from "next/font/google";

import Providers from "@/components/providers.component";
import { commonConfig } from "@/utils/config";
import { fetchStorefrontLogoSrcMap } from "@/lib/server/fetch-storefront-logo.server";
import { resolveTenantBranding } from "@/lib/server/resolve-tenant-branding.server";

import "@/assets/scss/app.scss";

const hankenGrotesk = Hanken_Grotesk({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin", "vietnamese"],
  display: "swap",
  variable: "--font-hanken-grotesk",
});

/** TEMP(test): lock viewport zoom — QA tradeoffs vs iOS input 16px bump. Revert after lead review. */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export async function generateMetadata(): Promise<Metadata> {
  const host = (await headers()).get("host");
  const logoSrcMap = await fetchStorefrontLogoSrcMap(host);

  return {
    title: {
      default: commonConfig.DOCUMENT_TITLE,
      template: `%s`,
    },
    description: commonConfig.DOCUMENT_TITLE,
    icons: {
      icon: logoSrcMap.FAVICON,
    },
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const host = (await headers()).get("host");
  const branding = resolveTenantBranding(host);
  const logoSrcMap = await fetchStorefrontLogoSrcMap(host);
  const { brandName, productDefaultSrc, tenantCode } = branding;

  return (
    <html lang="vi" className={`${hankenGrotesk.variable} ${hankenGrotesk.className}`} suppressHydrationWarning>
      <body>
        <Providers logoSrcMap={logoSrcMap} brandName={brandName} productDefaultSrc={productDefaultSrc} tenantCode={tenantCode}>
          {children}
        </Providers>
      </body>
    </html>
  );
}
