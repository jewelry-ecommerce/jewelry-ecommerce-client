import type { SWRConfiguration } from "swr";

/** Default SWR options for the storefront — override per-hook when needed. */
export const SWR_DEFAULT_CONFIG: SWRConfiguration = {
  revalidateOnFocus: false,
};
