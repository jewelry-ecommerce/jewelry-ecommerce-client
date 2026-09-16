import ViewRegister from "@/app/(layout-main)/dang-ky/_components/register-account.app";
import { createMetadata } from "@/libs/seo/metadata";
import { getStorefrontPageBySlug } from "@/utils/api/cms";
import { siteConfig } from "@/utils/config/site";
import { Metadata } from "next";
import { Suspense } from "react";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export async function generateMetadata(): Promise<Metadata> {
  const pageTitle = `Đăng Ký - ${siteConfig.name}`;

  try {
    const data = await getStorefrontPageBySlug("dang-ky");
    const { seo } = data.page;
    return {
      ...createMetadata({
        title: pageTitle,
        description:
          seo.description ?? `Đăng ký tài khoản ${siteConfig.name} để bắt đầu trải nghiệm mua sắm trực tuyến với nhiều ưu đãi hấp dẫn.`,
        keywords: seo.keywords ?? `đăng ký ${siteConfig.name}, đăng ký tài khoản ${siteConfig.name}, đăng ký mua sắm online`,
        canonicalUrl: seo.canonicalUrl ?? `${siteConfig.url}/dang-ky`,
      }),
      title: { absolute: pageTitle },
    };
  } catch {
    return {
      ...createMetadata({
        title: pageTitle,
        canonicalUrl: `${siteConfig.url}/dang-ky`,
      }),
      title: { absolute: pageTitle },
    };
  }
}
export default function RegisterPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ViewRegister />
    </Suspense>
  );
}
