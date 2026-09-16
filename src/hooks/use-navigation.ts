"use client";

import { gotoBack, gotoPage, pushPage, replacePage } from "@/utils/helpers/common/navigation";
import { useRouter, useSearchParams } from "next/navigation";

export const useNavigation = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  return {
    pushPage: (path: string, query?: Record<string, any>, options?: any) => pushPage(router, path, query, searchParams, options),

    replacePage: (path: string, query?: Record<string, any>, options?: any) => replacePage(router, path, query, searchParams, options),

    gotoPage: (path: string, query?: Record<string, any>, options?: any) => gotoPage(router, path, query, searchParams, options),

    gotoBack: (fallback?: string) => gotoBack(router, fallback),
  };
};
