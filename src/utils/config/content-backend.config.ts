
import { composeApiBaseUrl } from './api-base-url.util';
export function getContentApiBaseUrl():string|undefined {
  const base=process.env.NEXT_PUBLIC_CONTENT_API_URL?.trim();
  return base?composeApiBaseUrl(base,process.env.NEXT_PUBLIC_CONTENT_API_PREFIX??'/api/v1'):undefined;
}
