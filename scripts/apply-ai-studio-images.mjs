/**
 * Gắn ảnh AI studio làm thumbnail chính từng nhóm JEW-* (qua Cloudinary fetch).
 * ENV: JEWELRY_DEMO_CONFIRM=APPLY_AI_STUDIO + phone/password + API URL
 */
import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { constants } from 'node:fs';
import { basename, extname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { api, login, numericId } from './thesis-catalog.api.mjs';

assert.equal(process.env.JEWELRY_DEMO_CONFIRM, 'APPLY_AI_STUDIO');
const CLOUD = process.env.CLOUDINARY_CLOUD_NAME || 'dcvr6sf2';
const publicRoot = fileURLToPath(new URL('../public/', import.meta.url));
const origin = new URL(process.env.JEWELRY_DEMO_API_URL || 'https://jewelry-ecommerce-be-java.onrender.com/api/v1').origin;
const cache = new Map();

function viaFetch(url) {
  if (!url) return url;
  if (url.includes('res.cloudinary.com')) {
    return url.includes('/upload/f_auto') ? url : url.replace('/upload/', '/upload/f_auto,q_auto,w_900/');
  }
  return `https://res.cloudinary.com/${CLOUD}/image/fetch/f_auto,q_auto,w_900/${encodeURIComponent(url)}`;
}

async function exists(path) {
  try {
    await access(path, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

async function uploadLocal(relPath) {
  if (cache.has(relPath)) return cache.get(relPath);
  const absolutePath = resolve(publicRoot, relPath);
  assert.ok(await exists(absolutePath), 'Missing ' + absolutePath);
  const bytes = await readFile(absolutePath);
  const mime = { '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp' }[extname(absolutePath).toLowerCase()];
  assert.ok(mime, absolutePath);
  const form = new FormData();
  form.append('file', new Blob([bytes], { type: mime }), basename(absolutePath));
  const result = await api('admin/catalog/upload', 'POST', form);
  assert.ok(result.url);
  const absolute = result.url.startsWith('/api/v1/storefront/files/') ? origin + result.url : result.url;
  const cdn = viaFetch(absolute);
  cache.set(relPath, cdn);
  return cdn;
}

const MAP = [
  { prefix: 'JEW-RING-', image: 'images/product/nhan/ai-nhan-studio-1.jpg' },
  { prefix: 'JEW-NECKLACE-', image: 'images/product/day-chuyen/ai-day-chuyen-studio-1.jpg' },
  { prefix: 'JEW-BRACELET-', image: 'images/product/vong-tay/ai-vong-tay-studio-1.jpg' },
  { prefix: 'JEW-EARRING-', image: 'images/product/khuyen-tai/ai-khuyen-tai-studio-1.jpg' },
  { prefix: 'JEW-BANGLE-', image: 'images/product/lac-tay/ai-lac-tay-studio-1.jpg' },
  { prefix: 'JEW-CHARM-', image: 'images/product/charm/ai-charm-studio-1.jpg' },
];

await login();
let updated = 0;
const skipped = [];

for (const entry of MAP) {
  if (!(await exists(resolve(publicRoot, entry.image)))) {
    skipped.push(entry.prefix + ' (missing ' + entry.image + ')');
    continue;
  }
  const cdnUrl = await uploadLocal(entry.image);
  for (let i = 1; i <= 20; i += 1) {
    const code = entry.prefix + String(i).padStart(3, '0');
    const found = await api('admin/catalog/products?take=5&search=' + encodeURIComponent(code));
    const row = (found.content || []).find((p) => p.code === code);
    if (!row) {
      process.stdout.write('MISS ' + code + '\n');
      continue;
    }
    const detail = await api('admin/catalog/products/' + row.id);
    const skus = detail.skus || [];
    const keep = (detail.media || [])
      .map((m) => m.url)
      .filter((url) => url && url !== detail.thumbnailUrl && !String(url).includes('ai-'))
      .slice(0, 2);
    const urls = [cdnUrl, ...keep].slice(0, 3);

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
  }
  process.stdout.write(`${entry.prefix}* → ${cdnUrl.slice(0, 100)}\n`);
}

process.stdout.write(JSON.stringify({ ok: true, updated, skipped }, null, 2) + '\n');
