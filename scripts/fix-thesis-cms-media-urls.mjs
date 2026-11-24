/**
 * Re-point thesis CMS/banner media from ephemeral Render disk URLs to durable
 * public client assets (Vercel). FE should only display these URLs.
 *
 * ENV: JEWELRY_DEMO_CONFIRM=CREATE_THESIS_CATALOG_120 + phone/password + API URL
 */
import assert from 'node:assert/strict';
import { api, login, verifyThesisTarget } from './thesis-catalog.api.mjs';
import { THESIS_INFORMATION, THESIS_POLICY } from './thesis-catalog.data.mjs';

verifyThesisTarget();
await login();

const site = (process.env.JEWELRY_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || 'https://jewelry-ecommerce-client.vercel.app').replace(/\/$/, '');
const publicUrl = (relativePath) => `${site}/${String(relativePath).replace(/^\//, '')}`;

const isEphemeralBeFile = (url) => /\/storefront\/files\//i.test(String(url || '')) || /onrender\.com\/api\/v1\/storefront\/files\//i.test(String(url || ''));

function rewriteIfNeeded(url, fallbackRelative) {
  if (!url || isEphemeralBeFile(url)) return publicUrl(fallbackRelative);
  return url;
}

const infoImages = THESIS_INFORMATION.map((row) => row.image);
const galleryImages = [1, 2, 3, 4].map((index) => `images/gallery-image/0${index}.webp`);

const page = await api('storefront/cms/pages/trang-chu', 'GET', undefined, false);
assert.ok(page?.id, 'Missing trang-chu');

const blocks = (page.blocks || []).map((block) => {
  const type = block.type || block.blockTypeCode;
  const config = { ...(block.config || {}) };

  if (type === 'INFO_CARDS' && Array.isArray(config.items)) {
    config.items = config.items.map((item, index) => ({
      ...item,
      imageUrl: rewriteIfNeeded(item.imageUrl, infoImages[index] || infoImages[0]),
    }));
  }

  if (type === 'IMAGE_GALLERY' && Array.isArray(config.items)) {
    config.items = config.items.map((item, index) => ({
      ...item,
      imageUrl: rewriteIfNeeded(item.imageUrl, galleryImages[index] || galleryImages[0]),
    }));
  }

  if (type === 'PRODUCT_COLLECTION_SHOWCASE' && Array.isArray(config.items)) {
    config.items = config.items.map((item, index) => ({
      ...item,
      imageUrl: rewriteIfNeeded(item.imageUrl, `images/banner/grid-banner/0${(index % 1) + 1}.png`),
    }));
  }

  return {
    type,
    isVisible: block.isVisible !== false,
    sortOrder: block.sortOrder ?? 0,
    config: { ...config, demoNamespace: config.demoNamespace || THESIS_POLICY.namespace },
  };
});

const adminPages = await api('admin/cms/pages');
const previous = adminPages.find((row) => row.slug === 'trang-chu');
assert.ok(previous?.id, 'admin trang-chu missing');

await api('admin/cms/pages/' + previous.id, 'PUT', {
  name: previous.name || 'Trang chủ',
  slug: 'trang-chu',
  locale: previous.locale ?? 'vi-VN',
  isActive: true,
  targetDevice: previous.targetDevice || 'ALL',
  seo: previous.seo,
  blocks,
});
await api('admin/cms/pages/' + previous.id + '/publish', 'POST');
process.stdout.write('PAGE trang-chu media rewritten to ' + site + '\n');

const placementCodes = [
  THESIS_POLICY.heroCode,
  THESIS_POLICY.storiesCode,
  THESIS_POLICY.listingCode,
  THESIS_POLICY.collectionHeroCode,
];

const fallbackByCode = {
  [THESIS_POLICY.heroCode]: ['images/banner/grid-banner/01.png'],
  [THESIS_POLICY.storiesCode]: ['images/banner/double-banner/01.webp', 'images/banner/double-banner/02.webp'],
  [THESIS_POLICY.listingCode]: ['images/banner/product-banner/1.webp'],
  [THESIS_POLICY.collectionHeroCode]: ['images/banner/double-banner/01.webp'],
};

for (const code of placementCodes) {
  const render = await api('storefront/banner/placements/code/' + code + '/render', 'GET', undefined, false).catch(() => null);
  const banners = [];
  for (const slot of render?.slots || []) {
    for (const entry of slot.banners || []) {
      const banner = entry.banner || entry;
      if (banner?.id) banners.push(banner);
    }
  }
  const fallbacks = fallbackByCode[code] || [];
  let index = 0;
  for (const banner of banners) {
    const fallback = fallbacks[Math.min(index, fallbacks.length - 1)];
    index += 1;
    if (!fallback) continue;
    if (!isEphemeralBeFile(banner.mediaUrl) && !isEphemeralBeFile(banner.mediaMobileUrl)) continue;
    await api('admin/banner/banners/' + banner.id, 'PATCH', {
      mediaUrl: publicUrl(fallback),
      mediaMobileUrl: publicUrl(fallback),
    });
    process.stdout.write('BANNER ' + code + ' #' + banner.id + ' -> ' + publicUrl(fallback) + '\n');
  }
}

process.stdout.write('DONE durable media rewrite\n');
