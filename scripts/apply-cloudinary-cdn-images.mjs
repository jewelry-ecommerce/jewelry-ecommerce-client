/**
 * Gắn ảnh JEW-* sang Cloudinary CDN (f_auto + q_auto + w_900) — nhẹ & nhanh.
 * - charm / day-chuyen / khuyên tai: URL upload sẵn trên Cloudinary (manifest)
 * - nhẫn / vòng / lắc (+ bổ sung): upload JPG local đúng loại → bọc Cloudinary fetch
 *
 * ENV:
 *   JEWELRY_DEMO_CONFIRM=APPLY_CLOUDINARY_CDN
 *   JEWELRY_DEMO_API_URL / JEWELRY_DEMO_PHONE / JEWELRY_DEMO_PASSWORD
 */
import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import { basename, extname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { api, login, numericId } from './thesis-catalog.api.mjs';
import { THESIS_GROUPS, THESIS_POLICY } from './thesis-catalog.data.mjs';

assert.equal(process.env.JEWELRY_DEMO_CONFIRM, 'APPLY_CLOUDINARY_CDN');

const CLOUD = process.env.CLOUDINARY_CLOUD_NAME || 'dcvr6sf2';
const publicRoot = fileURLToPath(new URL('../public/', import.meta.url));
const origin = new URL(process.env.JEWELRY_DEMO_API_URL || 'https://jewelry-ecommerce-be-java.onrender.com/api/v1').origin;
const manifest = JSON.parse(
  await readFile(fileURLToPath(new URL('../.demo-data/cloud-upload-manifest.json', import.meta.url)), 'utf8'),
);

const uploadCache = new Map();

function optimizeUploadUrl(url) {
  if (!url.includes('res.cloudinary.com') || !url.includes('/upload/')) return url;
  if (url.includes('/upload/f_auto')) return url;
  return url.replace('/upload/', '/upload/f_auto,q_auto,w_900/');
}

function viaFetch(absoluteUrl) {
  if (!absoluteUrl) return absoluteUrl;
  if (absoluteUrl.includes('res.cloudinary.com')) return optimizeUploadUrl(absoluteUrl);
  return `https://res.cloudinary.com/${CLOUD}/image/fetch/f_auto,q_auto,w_900/${encodeURIComponent(absoluteUrl)}`;
}

function manifestPool(prefixes) {
  return Object.entries(manifest.assets)
    .filter(([path]) => prefixes.some((prefix) => path.startsWith(prefix)))
    .map(([, url]) => optimizeUploadUrl(url));
}

const MANIFEST_BY_GROUP = {
  CHARM: manifestPool(['images/product/charm/', 'images/product/mat-day-chuyen/']),
  NECKLACE: manifestPool(['images/product/day-chuyen/']),
  EARRING: manifestPool(['images/product/hoa-tai/']),
};

async function listLocalPool(folder) {
  const dir = resolve(publicRoot, 'images/product', folder);
  const files = await readdir(dir).catch(() => []);
  return files
    .filter((name) => /\.(jpe?g|png|webp)$/i.test(name) && !name.startsWith('_'))
    .sort()
    .map((name) => join(dir, name));
}

async function uploadLocal(absolutePath) {
  if (uploadCache.has(absolutePath)) return uploadCache.get(absolutePath);
  const bytes = await readFile(absolutePath);
  const mime = { '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp' }[extname(absolutePath).toLowerCase()];
  assert.ok(mime, absolutePath);
  const form = new FormData();
  form.append('file', new Blob([bytes], { type: mime }), basename(absolutePath));
  const result = await api('admin/catalog/upload', 'POST', form);
  assert.ok(result.url);
  const absolute = result.url.startsWith('/api/v1/storefront/files/') ? origin + result.url : result.url;
  const cdn = viaFetch(absolute);
  uploadCache.set(absolutePath, cdn);
  return cdn;
}

async function urlsForProduct(group, index, imageCount) {
  const fromManifest = MANIFEST_BY_GROUP[group.code];
  if (fromManifest?.length) {
    return Array.from({ length: imageCount }, (_, shot) => fromManifest[(index * 2 + shot) % fromManifest.length]);
  }
  const locals = await listLocalPool(group.folder);
  assert.ok(locals.length > 0, 'No local images for ' + group.folder);
  const picks = [];
  for (let shot = 0; shot < imageCount; shot += 1) {
    picks.push(await uploadLocal(locals[(index * 3 + shot) % locals.length]));
  }
  return picks;
}

await login();

const productsPayload = await api('admin/catalog/products?take=' + THESIS_POLICY.catalogTake);
const products = (productsPayload.content ?? []).filter((p) => String(p.code || '').startsWith(THESIS_POLICY.prefix));
assert.ok(products.length >= 100, 'Expected JEW products, got ' + products.length);

let updated = 0;
for (const group of THESIS_GROUPS) {
  const groupProducts = products
    .filter((p) => String(p.code || '').startsWith(THESIS_POLICY.prefix + group.code + '-'))
    .sort((a, b) => String(a.code).localeCompare(String(b.code)));

  for (const [index, row] of groupProducts.entries()) {
    const detail = await api('admin/catalog/products/' + row.id);
    const skus = detail.skus || [];
    const imageCount = Math.min(3, Math.max(2, skus.length || 2));
    const urls = await urlsForProduct(group, index, imageCount);

    for (const media of detail.media ?? []) {
      try { await api('admin/catalog/products/' + detail.id + '/media/' + media.id, 'DELETE'); } catch { /* ignore */ }
    }

    for (const sku of skus) {
      for (const [sortOrder, url] of urls.entries()) {
        await api('admin/catalog/products/' + detail.id + '/media', 'POST', {
          url,
          alt: `${detail.name} ${sortOrder + 1}`,
          skuId: numericId(sku.id),
          type: 'IMAGE',
          sortOrder,
          primary: sortOrder === 0,
        });
      }
    }

    await api('admin/catalog/products/' + detail.id, 'PUT', {
      categoryId: Number(detail.categoryId ?? detail.category?.id),
      code: detail.code,
      name: detail.name,
      slug: detail.slug,
      shortDescription: detail.shortDescription,
      description: detail.description,
      material: detail.material,
      occasion: detail.occasion,
      unitOfMeasure: detail.unitOfMeasure,
      thumbnailUrl: urls[0],
      metaTitle: detail.metaTitle,
      metaDescription: detail.metaDescription,
      productInfos: detail.productInfos ?? [],
      variants: skus.map((sku) => ({
        id: Number(sku.id),
        skuCode: sku.skuCode,
        name: sku.name,
        material: sku.material,
        metalColorLabel: sku.metalColorLabel,
        sizeLabel: sku.sizeLabel,
        listPrice: sku.listPrice,
        onHand: sku.onHand ?? sku.stockOnHand ?? sku.availableStock,
        isDefault: sku.isDefault ?? sku.default,
      })),
    });
    await api('admin/catalog/products/' + detail.id + '/publish', 'PATCH').catch(() => null);
    updated += 1;
    if (updated % 15 === 0) process.stdout.write(`CDN ${updated}/${products.length}\n`);
  }
}

const cats = await api('admin/catalog/categories');
for (const group of THESIS_GROUPS) {
  const category = cats.find((c) => c.code === THESIS_POLICY.prefix + group.code);
  if (!category) continue;
  const imageUrl = (await urlsForProduct(group, 0, 1))[0];
  await api('admin/catalog/categories/' + category.id, 'PUT', {
    name: category.name,
    slug: category.slug,
    code: category.code,
    status: 'ACTIVE',
    imageUrl,
    directAttributeIds: [],
  }).catch(() => null);
}

const sample = await api('storefront/product/jew-charm-001', 'GET', undefined, false);
process.stdout.write(JSON.stringify({
  ok: true,
  updated,
  uploadCacheSize: uploadCache.size,
  sampleThumb: sample?.thumbnailUrl || sample?.image || null,
}, null, 2) + '\n');
