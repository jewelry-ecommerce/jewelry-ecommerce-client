import path from 'node:path';
export const CMS_DEMO_MEDIA_DIRECTORY = path.resolve(process.cwd(), '.demo-data/cms-media');
export const CMS_DEMO_MAX_MEDIA_BYTES = 5 * 1024 * 1024;
export const CMS_DEMO_MAX_VIDEO_BYTES = 50 * 1024 * 1024;
export const CMS_DEMO_MEDIA_TYPES = {
  'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif', 'image/svg+xml': 'svg',
  'video/mp4': 'mp4', 'video/webm': 'webm', 'video/quicktime': 'mov', 'video/ogg': 'ogv',
} as const;
export const CMS_DEMO_LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '[::1]']);
export const CMS_DEMO_MEDIA_NAME = /^[0-9a-f-]{36}\.(?:jpg|png|webp|gif|svg|mp4|webm|mov|ogv)$/;
