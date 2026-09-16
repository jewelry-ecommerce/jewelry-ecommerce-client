// set term
"use client";

import PaginationComponent from "@/components/pagination/pagination.component";
import ProductEmptyState from "@/components/product/product-empty-state/product-empty-state.component";
import ProductGridSkeleton from "@/components/product/product-grid/product-grid-skeleton.component";
import { ProductFilterControls, StickyBelowHeaderBar, type ProductFilterSection, type ProductSortOption } from "@/components";
import SetCard from "./set-card.component";
import { SetsApi } from "@/utils/api";
import { CatalogSortType } from "@/utils/api/product/product.enum";
import type { GetSetsParams, SetListResponse } from "@/utils/api/sets/sets.interface";
import { PRODUCT_GRID_LCP_IMAGE_INDEX } from "@/components/product/product-grid/product-grid.constants";
import { Box } from "@mui/material";
import { useMemo, useState } from "react";
import useSWR from "swr";
import useStyles from "./set-listing-section.styles";

type SetListingSectionProps = {
  initialData: SetListResponse | null;
  params: GetSetsParams;
};

const SET_SORT_OPTIONS: ProductSortOption[] = [
  { value: CatalogSortType.PRICE_ASC, label: "Giá thấp đến cao" },
  { value: CatalogSortType.PRICE_DESC, label: "Giá cao đến thấp" },
];

const EMPTY_FILTER_SECTIONS: ProductFilterSection[] = [];

const SetListingSection = ({ initialData, params }: SetListingSectionProps) => {
  // hook
  const { classes } = useStyles();

  // state
  const [sortValue, setSortValue] = useState<string>(CatalogSortType.PRICE_ASC);
  const requestParams = useMemo(() => ({ ...params, sort: sortValue as GetSetsParams["sort"] }), [params, sortValue]);
  const key = useMemo(() => ["catalog/sets", requestParams] as const, [requestParams]);

  // function
  const { data, isLoading } = useSWR(key, ([, requestParams]) => SetsApi.getSets(requestParams), {
    fallbackData: initialData ?? undefined,
    revalidateOnMount: true,
  });

  if (isLoading && !data) return <ProductGridSkeleton count={params.take} />;
  if (!data || data.list.length === 0) return <ProductEmptyState />;

  return (
    <Box className={classes.root}>
      <StickyBelowHeaderBar>
        <ProductFilterControls
          variant="simple"
          sections={EMPTY_FILTER_SECTIONS}
          onSectionsChange={() => undefined}
          showResultCount
          resultCount={data.pagination?.total ?? data.total}
          resultLabel="Bộ sản phẩm"
          sortValue={sortValue}
          sortOptions={SET_SORT_OPTIONS}
          onSortChange={setSortValue}
        />
      </StickyBelowHeaderBar>
      <Box className={classes.grid}>
        {data.list.map((item, index) => (
          <SetCard key={item.id} item={item} priority={index === PRODUCT_GRID_LCP_IMAGE_INDEX} />
        ))}
      </Box>
      <PaginationComponent
        total={data.pagination?.total ?? data.total}
        take={params.take}
        page={params.page}
        showPageSize
        itemName="bộ sản phẩm"
      />
    </Box>
  );
};

export default SetListingSection;
