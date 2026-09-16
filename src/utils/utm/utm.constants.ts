export const UTM_STORAGE_KEY = "marketing_utm_data";

export const UTM_COOKIE_NAME = "marketing_utm_data";

/** Cookie backup TTL — attribution expiry is validated server-side. */
export const UTM_COOKIE_MAX_AGE_SECONDS = 30 * 24 * 60 * 60;

export const UTM_PARAM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"] as const;

export type UtmParamKey = (typeof UTM_PARAM_KEYS)[number];
