"use client";

import ForgotPasswordFlow from "./forgot-password-flow";
import { readForgotPasswordPhone } from "@/utils/auth/auth-phone-flow.client";
import { buildLoginUrlPreservingReturn } from "@/utils/helpers/common/navigation";
import { useRouter, useSearchParams } from "next/navigation";

export default function ForgotPasswordPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");
  const phone = searchParams.get("phone") || readForgotPasswordPhone();

  return (
    <ForgotPasswordFlow
      callbackUrl={callbackUrl}
      initialPhone={phone}
      onClose={() => router.push(buildLoginUrlPreservingReturn(callbackUrl))}
    />
  );
}
