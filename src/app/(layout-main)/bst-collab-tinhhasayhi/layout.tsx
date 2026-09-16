import { AtshBrothersProvider } from "@/app/(layout-main)/atsh/_components/atsh-brothers.provider";
import { ATSH_PAGE_PATH } from "@/app/(layout-main)/atsh/_constants/atsh.constants";
import { guardTenantRestrictedRoute } from "@/lib/server/guard-tenant-restricted-route.server";

interface BstCollabTinhHaSayHiLayoutProps {
  children: React.ReactNode;
}

export default async function BstCollabTinhHaSayHiLayout({ children }: BstCollabTinhHaSayHiLayoutProps) {
  await guardTenantRestrictedRoute(ATSH_PAGE_PATH);

  return <AtshBrothersProvider>{children}</AtshBrothersProvider>;
}
