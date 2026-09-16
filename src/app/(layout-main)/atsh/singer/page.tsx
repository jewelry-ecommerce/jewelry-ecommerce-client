import { ATSH_SINGER_DEFAULT_SLUG } from "@/app/(layout-main)/atsh/singer/_constants/atsh-singer.constants";
import { redirect } from "next/navigation";

export default function AtshSingerIndexPage() {
  redirect(`/atsh/singer/${ATSH_SINGER_DEFAULT_SLUG}`);
}
