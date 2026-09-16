import ViewLogin from "@/app/(layout-main)/dang-nhap/_components/login/login-account.app";
import { createMetadata } from "@/libs/seo/metadata";
import { getStorefrontPageBySlug } from "@/utils/api/cms";
import { siteConfig } from "@/utils/config/site";
import { Metadata } from "next";
import { Suspense } from "react";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export async function generateMetadata(): Promise<Metadata> {
  const pageTitle = `Đăng Nhập - ${siteConfig.name}`;

  try {
    const data = await getStorefrontPageBySlug("dang-nhap");
    const { seo } = data.page;
    return {
      ...createMetadata({
        title: pageTitle,
        description: seo.description ?? `Đăng nhập vào tài khoản ${siteConfig.name} của bạn để trải nghiệm mua sắm tốt nhất.`,
        keywords: seo.keywords ?? `đăng nhập ${siteConfig.name}, đăng nhập tài khoản ${siteConfig.name}, đăng nhập mua sắm online`,
        canonicalUrl: seo.canonicalUrl ?? `${siteConfig.url}/dang-nhap`,
      }),
      title: { absolute: pageTitle },
    };
  } catch {
    return {
      ...createMetadata({
        title: pageTitle,
        canonicalUrl: `${siteConfig.url}/dang-nhap`,
      }),
      title: { absolute: pageTitle },
    };
  }
}

// Không redirect theo việc "có cookie hay không": cookie còn nhưng phiên đã chết sẽ khiến user bị
// kẹt giữa /tai-khoan và /dang-nhap mà không vào được đâu. Việc chuyển trang khi đã đăng nhập do
// client xử lý, dựa trên cùng nguồn sự thật là /api/auth/me.
export default async function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ViewLogin />
    </Suspense>
  );
}
