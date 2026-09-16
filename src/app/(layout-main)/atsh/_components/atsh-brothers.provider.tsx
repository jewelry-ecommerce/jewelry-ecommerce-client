"use client";

import { createContext, useContext, useEffect, useMemo } from "react";
import useSWR from "swr";
import { notFound, usePathname } from "next/navigation";
import { AtshBrothersLoadingShell } from "@/app/(layout-main)/atsh/_components/atsh-brothers-loading.component";
import { ATSH_BROTHERS_SAMPLE_DATA } from "@/app/(layout-main)/atsh/_data/atsh-brothers-static.data";
import { useAtshLandingPageLayoutLock } from "@/app/(layout-main)/atsh/_hooks/use-atsh-landing-page-layout-lock.hook";
import { ATSH_BROTHERS_CMS_PAGE_SLUG, resolveAtshBrothersData } from "@/app/(layout-main)/atsh/_utils/atsh-brothers-cms.util";
import type { AtshBrothersData } from "@/app/(layout-main)/atsh/_utils/atsh-brothers.interface";
import { isAtshLandingPath } from "@/app/(layout-main)/atsh/_constants/atsh.constants";
import { clearAtshSpiralHash, hasAtshSpiralHash } from "@/app/(layout-main)/atsh/_utils/atsh-section-scroll.util";
import { CmsApi } from "@/utils/api";

const AtshBrothersContext = createContext<AtshBrothersData | null>(null);

interface AtshBrothersProviderProps {
  children: React.ReactNode;
}

export function AtshBrothersProvider({ children }: AtshBrothersProviderProps) {
  const pathname = usePathname();
  const isLanding = isAtshLandingPath(pathname);

  useAtshLandingPageLayoutLock(isLanding);

  useEffect(() => {
    if (!isLanding && hasAtshSpiralHash()) {
      clearAtshSpiralHash();
    }
  }, [isLanding]);

  const { data: pageData, isLoading } = useSWR(
    `storefront/pages/${ATSH_BROTHERS_CMS_PAGE_SLUG}`,
    () => CmsApi.getStorefrontPageBySlug(ATSH_BROTHERS_CMS_PAGE_SLUG),
    {
      revalidateOnFocus: false,
    },
  );

  const cmsBrothersData = useMemo<AtshBrothersData | null | undefined>(() => {
    if (isLoading && !pageData) {
      return undefined;
    }

    return resolveAtshBrothersData(pageData);
  }, [pageData, isLoading]);

  if (cmsBrothersData === undefined) {
    return <AtshBrothersLoadingShell />;
  }

  if (!isLanding) {
    if (!cmsBrothersData) {
      notFound();
    }

    return <AtshBrothersContext.Provider value={cmsBrothersData}>{children}</AtshBrothersContext.Provider>;
  }

  const landingBrothersData = cmsBrothersData ?? ATSH_BROTHERS_SAMPLE_DATA;

  return <AtshBrothersContext.Provider value={landingBrothersData}>{children}</AtshBrothersContext.Provider>;
}

export function useAtshBrothersDataOptional(): AtshBrothersData | null {
  return useContext(AtshBrothersContext);
}

export function useAtshBrothersData(): AtshBrothersData {
  const data = useAtshBrothersDataOptional();
  if (!data) {
    throw new Error("useAtshBrothersData must be used within AtshBrothersProvider with CMS data");
  }

  return data;
}
