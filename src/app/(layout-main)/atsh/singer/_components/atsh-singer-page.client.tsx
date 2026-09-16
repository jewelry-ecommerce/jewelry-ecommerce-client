"use client";

import AtshSingerApp from "@/app/(layout-main)/atsh/singer/_components/atsh-singer.app";
import { getAtshSingerPageDataFromBrothers } from "@/app/(layout-main)/atsh/singer/_utils/atsh-singer-brothers.mapper";
import type { ApiProduct } from "@/utils/api/product/product.interface";
import { notFound } from "next/navigation";
import { useAtshBrothersData } from "@/app/(layout-main)/atsh/_components/atsh-brothers.provider";

interface AtshSingerPageClientProps {
  slug: string;
  collectionProducts: ApiProduct[];
  fullLookTotalPrice: number;
}

export function AtshSingerPageClient({ slug, collectionProducts, fullLookTotalPrice }: AtshSingerPageClientProps) {
  const brothersData = useAtshBrothersData();
  const pageData = getAtshSingerPageDataFromBrothers(slug, brothersData, collectionProducts);

  if (!pageData) {
    notFound();
  }

  return (
    <AtshSingerApp
      pageData={{
        ...pageData,
        collectionProducts,
        fullLookTotalPrice,
      }}
    />
  );
}
