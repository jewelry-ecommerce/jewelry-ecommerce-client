import atshBrothersJson from "@/app/(layout-main)/atsh/_data/atsh-brothers.json";
import { parseAtshBrothersJsonContent } from "@/app/(layout-main)/atsh/_utils/atsh-brothers-cms.util";
import type { AtshBrothersData } from "@/app/(layout-main)/atsh/_utils/atsh-brothers.interface";

/**
 * JSON mặc định cho ATSH — fallback tạm khi CMS page `atsh` chưa có.
 * Runtime ưu tiên CMS (`cms/storefront/pages/atsh` → block JSON_DISPLAY).
 */
const parsedSampleData = parseAtshBrothersJsonContent(JSON.stringify(atshBrothersJson));

export const ATSH_BROTHERS_SAMPLE_DATA: AtshBrothersData = parsedSampleData ?? (atshBrothersJson as AtshBrothersData);
/** @deprecated Dùng `ATSH_BROTHERS_SAMPLE_DATA` — giữ alias cho test cũ. */
export const STATIC_ATSH_BROTHERS_DATA = ATSH_BROTHERS_SAMPLE_DATA;
