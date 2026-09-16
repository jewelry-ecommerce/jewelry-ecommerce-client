export {
  getFaroAppMeta,
  getFaroCollectorUrl,
  getResolvedFaroConfig,
  isFaroEnabled,
  parseFaroCollectorUrl,
  scheduleFaro,
  type FaroAppMeta,
  type ResolvedFaroConfig,
} from "@/lib/faro/config";
export { FARO_EVENTS, type FaroEventName } from "@/lib/faro/events";
export { ensureFaroInitializedAsync, isFaroReady } from "@/lib/faro/init-faro";
export { applyFaroSessionContext, type FaroSessionContextInput } from "@/lib/faro/context";
export {
  safePushError,
  safePushEvent,
  safePushLog,
  safeSetUser,
  type FaroContextAttributes,
  type FaroUserIdentity,
} from "@/lib/faro/faro-client";
