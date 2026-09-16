import packageJson from "@@/package.json";
import { getTenantBrandName } from "./tenant-branding.util";

export const DOCUMENT_TITLE = getTenantBrandName();
export const APP_VERSION = packageJson.version;
export const APP_NAME = "app";

/** Backend REST base URL — runtime only (K8s / `.env`), không bake lúc docker build. */
export const getApiBeUrl = (): string | undefined => process.env.API_BE_URL?.trim() || undefined;

/** Tenant header `x-tenant-code` — runtime only (K8s). */
export const getTenantCode = (): string | undefined => process.env.TENANT_CODE?.trim() || undefined;

/** reCAPTCHA v3 site key — `NEXT_PUBLIC_*`, giá trị cố định sau `next build` (không đọc runtime K8s). */
