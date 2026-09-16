import type { Metadata } from "next";
import { headers } from "next/headers";
import PreOrderPaymentView from "./_components/pre-order-payment-view.component";
import { resolveTenantBranding } from "@/lib/server/resolve-tenant-branding.server";

export async function generateMetadata(): Promise<Metadata> {
  const host = (await headers()).get("host");
  const { brandName } = resolveTenantBranding(host);

  return {
    title: `Thanh toán đặt trước | ${brandName}`,
    description: "Hoàn tất thanh toán đơn đặt trước khi hàng đã sẵn sàng.",
  };
}

function Page() {
  return <PreOrderPaymentView />;
}

export default Page;
