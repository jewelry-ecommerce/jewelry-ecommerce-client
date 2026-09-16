// set term
import { guardTenantRestrictedRoute } from "@/lib/server/guard-tenant-restricted-route.server";

type SetLayoutProps = {
  children: React.ReactNode;
};

export default async function SetLayout({ children }: SetLayoutProps) {
  await guardTenantRestrictedRoute("/sets");

  return children;
}
