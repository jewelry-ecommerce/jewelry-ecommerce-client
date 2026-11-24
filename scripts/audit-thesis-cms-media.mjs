/**
 * Audit thesis CMS pages + banner placements for broken / ephemeral / cloudinary-fetch URLs.
 */
import { api, login, verifyThesisTarget } from './thesis-catalog.api.mjs';

verifyThesisTarget();
await login();

async function head(url) {
  if (!url) return { url, status: 'empty' };
  try {
    const response = await fetch(url, { method: 'HEAD', signal: AbortSignal.timeout(20000), redirect: 'follow' });
    return {
      url,
      status: response.status,
      type: response.headers.get('content-type'),
      len: response.headers.get('content-length'),
    };
  } catch (error) {
    return { url, status: 'ERR', err: String(error.message || error).slice(0, 120) };
  }
}

function collectUrls(value, out = []) {
  if (!value || typeof value !== 'object') return out;
  if (Array.isArray(value)) {
    for (const item of value) collectUrls(item, out);
    return out;
  }
  for (const [key, item] of Object.entries(value)) {
    if (typeof item === 'string' && /^https?:\/\//i.test(item)) {
      const hay = key + ' ' + item;
      if (/(image|media|logo|banner|thumbnail|webp|png|jpg|jpeg|svg|cloudinary|storefront\/files|unsplash)/i.test(hay)
        || /\.(webp|png|jpe?g|svg|gif)(\?|$)/i.test(item)) {
        out.push({ key, url: item });
      }
    } else if (item && typeof item === 'object') {
      collectUrls(item, out);
    }
  }
  return out;
}

function classify(url) {
  if (/\/storefront\/files\//i.test(url) || /onrender\.com\/api\/v1\/storefront\/files\//i.test(url)) return 'ephemeral';
  if (/res\.cloudinary\.com\/.+\/image\/fetch\//i.test(url)) return 'cloudFetch';
  if (/images\.unsplash\.com/i.test(url)) return 'unsplash';
  return 'okish';
}

const pagesPayload = await api('admin/cms/pages');
const pages = Array.isArray(pagesPayload) ? pagesPayload : pagesPayload.content || [];
const focus = pages.filter((page) => {
  const slug = String(page.slug || '');
  return ['trang-chu', 'san-pham', 'bo-suu-tap', 'black-friday', 'best-seller'].includes(slug)
    || slug.startsWith('bo-suu-tap')
    || /cam-hung|lookbook|everyday|layered|cz|gift|black|best/i.test(slug);
});

process.stdout.write('FOCUS_PAGES ' + focus.map((page) => page.slug).join(', ') + '\n');

for (const meta of focus) {
  const page = await api('storefront/cms/pages/' + meta.slug, 'GET', undefined, false).catch(() => null);
  if (!page) {
    process.stdout.write('MISSING ' + meta.slug + '\n');
    continue;
  }
  const urls = [...new Map(collectUrls(page).map((row) => [row.url, row])).values()];
  const results = await Promise.all(urls.map((row) => head(row.url)));
  const bad = results.filter((row) => row.status !== 200);
  const flagged = results.filter((row) => classify(row.url) !== 'okish' || row.status !== 200);
  process.stdout.write(
    '\n=== ' + meta.slug
    + ' blocks=' + (page.blocks || []).length
    + ' urls=' + results.length
    + ' bad=' + bad.length
    + ' flagged=' + flagged.length
    + '\n',
  );
  for (const block of page.blocks || []) {
    process.stdout.write('  block ' + (block.type || block.blockTypeCode) + '\n');
  }
  for (const row of flagged.slice(0, 20)) {
    process.stdout.write('  ' + classify(row.url) + ' ' + row.status + ' ' + (row.type || '') + ' ' + row.url.slice(0, 160) + '\n');
  }
}

const codes = [
  'JEW_HOME_HERO',
  'JEW_HOME_STORIES',
  'JEW_PRODUCT_HERO',
  'JEW_COLLECTION_HERO',
  'JEW_BF_HERO',
  'JEW_BEST_SELLER_GRID',
];

for (const code of codes) {
  const render = await api('storefront/banner/placements/code/' + code + '/render', 'GET', undefined, false).catch(() => null);
  const urls = [];
  for (const slot of render?.slots || []) {
    for (const entry of slot.banners || []) {
      const banner = entry.banner || entry;
      if (banner.mediaUrl) urls.push(banner.mediaUrl);
      if (banner.mediaMobileUrl && banner.mediaMobileUrl !== banner.mediaUrl) urls.push(banner.mediaMobileUrl);
    }
  }
  const uniq = [...new Set(urls)];
  const results = await Promise.all(uniq.map((url) => head(url)));
  process.stdout.write('\nBANNER ' + code + ' n=' + uniq.length + '\n');
  for (const row of results) {
    process.stdout.write('  ' + classify(row.url) + ' ' + row.status + ' ' + (row.type || '') + ' ' + row.url.slice(0, 160) + '\n');
  }
}

process.stdout.write('\nDONE audit\n');
