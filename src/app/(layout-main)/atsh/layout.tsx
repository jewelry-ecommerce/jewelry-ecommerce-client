import { guardTenantRestrictedRoute } from "@/lib/server/guard-tenant-restricted-route.server";
import { AtshBrothersProvider } from "./_components/atsh-brothers.provider";

interface AtshLayoutProps {
  children: React.ReactNode;
}

export default async function AtshLayout({ children }: AtshLayoutProps) {
  await guardTenantRestrictedRoute("/atsh");

  return <AtshBrothersProvider>{children}</AtshBrothersProvider>;
}
