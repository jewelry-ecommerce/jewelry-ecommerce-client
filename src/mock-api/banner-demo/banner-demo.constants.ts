import path from 'node:path';
export const BANNER_DEMO_FILE = path.resolve(process.cwd(), process.env.BANNER_DEMO_STORE_FILE || '.demo-data/cms-banners.json');
export const BANNER_DEMO_BLOCKED_URI = /^(?:javascript|data|vbscript):/i;
export const BANNER_DEMO_DEFAULTS = {
  displayType: 'GRID', columns: 4, rows: 2, gap: 16, platform: 'ALL', status: 'ACTIVE',
  layout: 'CENTER', mediaType: 'IMAGE', mediaFit: 'cover', actionsLayout: 'STACK', overlayOpacity: 0,
  ctaBackground: '#FFFFFF', ctaColor: '#111827', titleColor: '#FFFFFF',
} as const;
