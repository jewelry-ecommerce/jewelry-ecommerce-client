import type { Metadata } from "next";
import { getStorefrontPageMetadata, sharedSeoImage } from "@/lib/server/storefront-metadata";
import { siteConfig } from "@/utils/config/site";
import ViewMyAccount from "@/app/(layout-main)/tai-khoan/_components/my-account.app";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return getStorefrontPageMetadata({
    slug: "tai-khoan",
    path: "/tai-khoan",
    defaults: {
      title: `Tài khoản | ${siteConfig.name}`,
      description: `Quản lý thông tin cá nhân, đơn hàng và các thiết lập tài khoản tại ${siteConfig.name}.`,
      keywords: `tài khoản, hồ sơ khách hàng, ${siteConfig.name}`,
      image: sharedSeoImage,
    },
  });
}

export default function MyAccountPage() {
  return <ViewMyAccount />;
}
