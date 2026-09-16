import { getOrCreateAnonymousId } from "@/utils/session/anonymous-session.util";

export const buildRecentlyViewedRequestOptions = () => ({
  skipAuthLogout: true as const,
  headers: {
    "x-guest-id": getOrCreateAnonymousId(),
  },
});
