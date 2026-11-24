/**
 * Re-point ALL thesis CMS page media + campaign banners from ephemeral Render
 * disk URLs to durable public client assets (Vercel).
 *
 * ENV: JEWELRY_DEMO_CONFIRM=CREATE_THESIS_CATALOG_120 + phone/password + API URL
 */
import assert from 'node:assert/strict';
import { api, login, verifyThesisTarget } from './thesis-catalog.api.mjs';
import { THESIS_CMS_PAGES, THESIS_COLLECTIONS, THESIS_INFORMATION, THESIS_POLICY } from './thesis-catalog.data.mjs';

verifyThesisTarget();
await login();

const site = (process.env.JEWELRY_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || 'https://jewelry-ecommerce-client.vercel.app').replace(/\/$/, '');
const publicUrl = (relativePath) => `${site}/${String(relativePath).replace(/^\//, '')}`;

const isBrokenMedia = (url) => {
  const value = String(url || '');
  return !value
    || /\/storefront\/files\//i.test(value)
    || /onrender\.com\/api\/v1\/storefront\/files\//i.test(value)
    || /res\.cloudinary\.com\/.+\/image\/fetch\//i.test(value)
    || /images\.unsplash\.com/i.test(value);
};

async function isReachable(url) {
  if (!url || isBrokenMedia(url)) return false;
  try {
    const response = await fetch(url, { method: 'GET', signal: AbortSignal.timeout(15000), redirect: 'follow' });
    if (!response.ok) return false;
    const type = response.headers.get('content-type') || '';
    return /image|svg|webp|octet-stream/i.test(type);
  } catch {
    return false;
  }
}

async function rewriteUrl(url, fallbackRelative) {
  if (!fallbackRelative) return url;
  const durable = publicUrl(fallbackRelative);
  if (!url || isBrokenMedia(url)) return durable;
  if (await isReachable(url)) return url;
  return durable;
}

const infoImages = THESIS_INFORMATION.map((row) => row.image);
const galleryImages = [1, 2, 3, 4].map((index) => `images/gallery-image/0${index}.webp`);
const collectionImageBySlug = Object.fromEntries(THESIS_COLLECTIONS.map((row) => [row.slug, row.image]));
const pageSeoBySlug = Object.fromEntries(THESIS_CMS_PAGES.map((row) => [row.slug, row.seo?.image]).filter((row) => row[1]));

const focusSlugs = [
  'trang-chu',
  'san-pham',
  'bo-suu-tap',
  'black-friday',
  'best-seller',
  'bst-cz-lap-lanh',
  'cam-hung-toi-gian',
  'cam-hung-hien-dai',
];

const adminPages = await api('admin/cms/pages');
const pages = Array.isArray(adminPages) ? adminPages : adminPages.content || [];

for (const slug of focusSlugs) {
  const previous = pages.find((row) => row.slug === slug);
  if (!previous?.id) {
    process.stdout.write('SKIP_PAGE missing ' + slug + '\n');
    continue;
  }
  const live = await api('storefront/cms/pages/' + slug, 'GET', undefined, false).catch(() => null);
  const sourceBlocks = live?.blocks || previous.blocks || [];
  let changed = false;
  const blocks = [];
  for (const block of sourceBlocks) {
    const type = block.type || block.blockTypeCode;
    const config = { ...(block.config || {}) };

    if (type === 'INFO_CARDS' && Array.isArray(config.items)) {
      const nextItems = [];
      for (const [index, item] of config.items.entries()) {
        const imageUrl = await rewriteUrl(item.imageUrl, infoImages[index] || infoImages[0]);
        if (imageUrl !== item.imageUrl) changed = true;
        nextItems.push({ ...item, imageUrl });
      }
      config.items = nextItems;
    }

    if (type === 'IMAGE_GALLERY' && Array.isArray(config.items)) {
      const nextItems = [];
      for (const [index, item] of config.items.entries()) {
        const imageUrl = await rewriteUrl(item.imageUrl, galleryImages[index] || galleryImages[0]);
        if (imageUrl !== item.imageUrl) changed = true;
        nextItems.push({ ...item, imageUrl });
      }
      config.items = nextItems;
    }

    if (type === 'PRODUCT_COLLECTION_SHOWCASE' && Array.isArray(config.items)) {
      const nextItems = [];
      for (const [index, item] of config.items.entries()) {
        const slugHint = String(item.actionUrl || '').match(/collectionSlug=([^&]+)/)?.[1];
        const fallback = collectionImageBySlug[slugHint] || `images/banner/double-banner/0${(index % 2) + 1}.webp`;
        const imageUrl = await rewriteUrl(item.imageUrl, fallback);
        if (imageUrl !== item.imageUrl) changed = true;
        nextItems.push({ ...item, imageUrl });
      }
      config.items = nextItems;
    }

    if (config.imageUrl) {
      const fallback = pageSeoBySlug[slug] || 'images/banner/grid-banner/01.png';
      const imageUrl = await rewriteUrl(config.imageUrl, fallback);
      if (imageUrl !== config.imageUrl) changed = true;
      config.imageUrl = imageUrl;
    }

    blocks.push({
      type,
      isVisible: block.isVisible !== false,
      sortOrder: block.sortOrder ?? 0,
      config: { ...config, demoNamespace: config.demoNamespace || THESIS_POLICY.namespace },
    });
  }

  let seo = previous.seo || {};
  if (seo.imageUrl || pageSeoBySlug[slug]) {
    const imageUrl = await rewriteUrl(seo.imageUrl, pageSeoBySlug[slug] || 'images/banner/grid-banner/01.png');
    if (imageUrl !== seo.imageUrl) {
      seo = { ...seo, imageUrl };
      changed = true;
    }
  }

  if (!changed) {
    process.stdout.write('PAGE ok ' + slug + '\n');
    continue;
  }

  await api('admin/cms/pages/' + previous.id, 'PUT', {
    name: previous.name || slug,
    slug,
    locale: previous.locale ?? 'vi-VN',
    isActive: true,
    targetDevice: previous.targetDevice || 'ALL',
    seo,
    blocks,
  });
  await api('admin/cms/pages/' + previous.id + '/publish', 'POST');
  process.stdout.write('PAGE fixed ' + slug + '\n');
}

const bannerFallbacks = {
  [THESIS_POLICY.heroCode]: ['images/banner/grid-banner/01.png'],
  [THESIS_POLICY.storiesCode]: ['images/banner/double-banner/01.webp', 'images/banner/double-banner/02.webp'],
  [THESIS_POLICY.listingCode]: ['images/banner/product-banner/1.webp'],
  [THESIS_POLICY.collectionHeroCode]: ['images/banner/double-banner/01.webp'],
  [THESIS_POLICY.blackFridayHeroCode]: ['images/gallery-image/01.webp'],
  [THESIS_POLICY.bestSellerGridCode]: [
    'images/product/charm/charm-1.1.jpg',
    'images/product/day-chuyen/day-chuyen-1.1.jpg',
    'images/product/charm/charm-2.1.jpg',
    'images/product/day-chuyen/day-chuyen-2.1.jpg',
  ],
};

for (const [code, fallbacks] of Object.entries(bannerFallbacks)) {
  const render = await api('storefront/banner/placements/code/' + code + '/render', 'GET', undefined, false).catch(() => null);
  const banners = [];
  for (const slot of render?.slots || []) {
    for (const entry of slot.banners || []) {
      const banner = entry.banner || entry;
      if (banner?.id) banners.push(banner);
    }
  }
  let index = 0;
  for (const banner of banners) {
    const fallback = fallbacks[Math.min(index, fallbacks.length - 1)];
    index += 1;
    if (!fallback) continue;
    const mediaUrl = await rewriteUrl(banner.mediaUrl, fallback);
    const mediaMobileUrl = await rewriteUrl(banner.mediaMobileUrl || banner.mediaUrl, fallback);
    if (mediaUrl === banner.mediaUrl && mediaMobileUrl === (banner.mediaMobileUrl || banner.mediaUrl)) continue;
    await api('admin/banner/banners/' + banner.id, 'PATCH', { mediaUrl, mediaMobileUrl });
    process.stdout.write('BANNER ' + code + ' #' + banner.id + ' -> ' + mediaUrl + '\n');
  }
}

const logoMap = {
  HEADER: 'images/logo/header-logo.svg',
  FOOTER: 'images/logo/footer-logo.svg',
  AUTH: 'images/logo/login-logo.svg',
  FAVICON: 'images/logo/favicon.png',
};
const logosPayload = await api('admin/cms/logos?take=100');
const logoRows = Array.isArray(logosPayload) ? logosPayload : logosPayload.content ?? logosPayload.list ?? [];
for (const row of logoRows) {
  const type = row.type || row.logoType;
  const relative = logoMap[type];
  if (!relative) continue;
  const logoUrl = await rewriteUrl(row.logoUrl, relative);
  if (logoUrl === row.logoUrl) continue;
  await api('admin/cms/logos/' + row.id, 'PATCH', {
    name: row.name,
    type,
    logoUrl,
    logoTargetUrl: row.logoTargetUrl || '/',
  });
  await api('admin/cms/logos/' + row.id + '/status', 'PATCH', { status: 'ACTIVE' });
  process.stdout.write('LOGO ' + type + ' -> ' + logoUrl + '\n');
}

// Also rewrite create-thesis-cms-pages to stop using Cloudinary fetch for campaign.
process.stdout.write('DONE durable media rewrite\n');
