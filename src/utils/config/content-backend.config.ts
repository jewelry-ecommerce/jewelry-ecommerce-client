import { composeApiBaseUrl } from "./api-base-url.util";
import { isJavaBackend } from "./java-backend.config";

/** Trình duyệt đi qua BFF cùng origin. Gọi thẳng Render bị CORS từ localhost. */
export function getContentApiBaseUrl(): string | undefined {
  if (typeof window !== "undefined" && isJavaBackend()) return "/api/java";
  const base = process.env.NEXT_PUBLIC_CONTENT_API_URL?.trim();
  return base ? composeApiBaseUrl(base, process.env.NEXT_PUBLIC_CONTENT_API_PREFIX ?? "/api/v1") : undefined;
}
