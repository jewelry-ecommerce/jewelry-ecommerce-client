// set term
import { cache } from "react";
import { fetchApiJson } from "@/lib/server/storefront-metadata";
import type { SetDetailResponse } from "@/utils/api/sets/sets.interface";

export const fetchSetBySlug = cache(async (slug: string): Promise<SetDetailResponse | null> =>
  fetchApiJson<SetDetailResponse>(`catalog/sets/${encodeURIComponent(slug)}`),
);
