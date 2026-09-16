import type { Metadata } from "next";
import { headers } from "next/headers";
import ConfirmPaymentView from "./_components/confirm-payment-view.component";
import { resolveTenantBranding } from "@/lib/server/resolve-tenant-branding.server";

export async function generateMetadata(): Promise<Metadata> {
  const host = (await headers()).get("host");
  const { brandName } = resolveTenantBranding(host);

  return {
    title: `Xác nhận thanh toán | ${brandName}`,
    description: "Xác nhận thông tin và hoàn tất thanh toán cho đơn hàng của bạn.",
  };
}

function Page() {
  return <ConfirmPaymentView />;
}

export default Page;
