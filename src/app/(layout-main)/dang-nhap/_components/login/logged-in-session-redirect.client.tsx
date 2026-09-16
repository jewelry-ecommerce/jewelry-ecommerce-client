"use client";

import { getPostAuthRedirectPath } from "@/utils/helpers/common/navigation";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect } from "react";

type MeJson = { success?: boolean; isAuthenticated?: boolean };

/**
 * Khi bấm Back, trang login có thể được khôi phục từ BFCache mà không gọi lại RSC → không chạy redirect phía server.
 * Gọi /api/auth/me trên client (kèm cookie) để đẩy user đã đăng nhập ra khỏi login.
 */
export default function LoggedInSessionRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const redirectIfSession = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me", { credentials: "same-origin", cache: "no-store" });
      const data = (await res.json()) as MeJson;
      const authenticated = res.ok && (data.success === true || data.isAuthenticated === true);
      if (!authenticated) return;

      const callbackUrl = searchParams.get("callbackUrl");
      router.replace(getPostAuthRedirectPath({ callbackUrl, fallback: "/trang-chu" }));
    } catch {
      // ignore
    }
  }, [router, searchParams]);

  useEffect(() => {
    void redirectIfSession();
  }, [redirectIfSession]);

  useEffect(() => {
    const onPageShow = (e: PageTransitionEvent) => {
      if (e.persisted) void redirectIfSession();
    };
    window.addEventListener("pageshow", onPageShow);
    return () => window.removeEventListener("pageshow", onPageShow);
  }, [redirectIfSession]);

  return null;
}
