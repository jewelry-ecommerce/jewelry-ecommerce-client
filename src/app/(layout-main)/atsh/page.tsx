import { redirect } from "next/navigation";

import { ATSH_PAGE_PATH } from "@/app/(layout-main)/atsh/_constants/atsh.constants";

/** Legacy `/atsh` landing → public BST Collab path. Singer pages vẫn dưới `/atsh/singer/...`. */
export default function AtshLegacyLandingRedirect() {
  redirect(ATSH_PAGE_PATH);
}
