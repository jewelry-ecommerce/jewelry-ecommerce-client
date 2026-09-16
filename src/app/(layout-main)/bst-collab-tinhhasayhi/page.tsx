import AtshApp from "@/app/(layout-main)/atsh/_components/atsh.app";
import { ATSH_PAGE_PATH } from "@/app/(layout-main)/atsh/_constants/atsh.constants";
import { getAtshLandingPageMetadata } from "@/app/(layout-main)/atsh/_utils/atsh-landing-metadata.server";

export const revalidate = 300; // ISR: ATSH landing page revalidate mỗi 5 phút

export async function generateMetadata() {
  return getAtshLandingPageMetadata({ path: ATSH_PAGE_PATH });
}

export default function BstCollabTinhHaSayHiPage() {
  return <AtshApp />;
}
