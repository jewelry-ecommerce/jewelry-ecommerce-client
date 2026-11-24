/**
 * Thay ảnh JEW-* bằng ảnh bạc đúng loại (không vàng / không tối / không lẫn danh mục).
 * Nguồn: PNG demo local theo category + Wikimedia sterling product (curated).
 *
 * ENV:
 *   JEWELRY_DEMO_CONFIRM=REFRESH_THESIS_IMAGES
 *   JEWELRY_DEMO_API_URL=https://jewelry-ecommerce-be-java.onrender.com/api/v1
 *   JEWELRY_DEMO_PHONE / JEWELRY_DEMO_PASSWORD
 */
import assert from 'node:assert/strict';
import { mkdir, writeFile, copyFile, access, readdir } from 'node:fs/promises';
import { constants } from 'node:fs';
import { basename, extname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { api, login, numericId } from './thesis-catalog.api.mjs';
import { THESIS_GROUPS, THESIS_POLICY } from './thesis-catalog.data.mjs';

assert.equal(process.env.JEWELRY_DEMO_CONFIRM, 'REFRESH_THESIS_IMAGES');
const publicRoot = fileURLToPath(new URL('../public/', import.meta.url));
const productRoot = join(publicRoot, 'images', 'product');
const origin = new URL(process.env.JEWELRY_DEMO_API_URL || 'https://jewelry-ecommerce-be-java.onrender.com/api/v1').origin;

/**
 * Modern bright silver / white-metal product photos (Pexels + Unsplash CDN).
 * Picked for category match + cool silver tone (avoid gold / dark oxidised).
 */
const REMOTE = {
  nhan: [
    'https://images.pexels.com/photos/265906/pexels-photo-265906.jpeg?auto=compress&cs=tinysrgb&w=900',
    'https://images.pexels.com/photos/1454171/pexels-photo-1454171.jpeg?auto=compress&cs=tinysrgb&w=900',
    'https://images.pexels.com/photos/1191531/pexels-photo-1191531.jpeg?auto=compress&cs=tinysrgb&w=900',
    'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1603561596112-0a132b757785?auto=format&fit=crop&w=900&q=80',
    'https://images.pexels.com/photos/248077/pexels-photo-248077.jpeg?auto=compress&cs=tinysrgb&w=900',
  ],
  'day-chuyen': [
    'https://images.pexels.com/photos/1454172/pexels-photo-1454172.jpeg?auto=compress&cs=tinysrgb&w=900',
    'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=900&q=80',
    'https://images.pexels.com/photos/9428796/pexels-photo-9428796.jpeg?auto=compress&cs=tinysrgb&w=900',
    'https://images.pexels.com/photos/8891953/pexels-photo-8891953.jpeg?auto=compress&cs=tinysrgb&w=900',
  ],
  'vong-tay': [
    'https://images.pexels.com/photos/1191538/pexels-photo-1191538.jpeg?auto=compress&cs=tinysrgb&w=900',
    'https://images.pexels.com/photos/9428804/pexels-photo-9428804.jpeg?auto=compress&cs=tinysrgb&w=900',
    'https://images.unsplash.com/photo-1611955167811-4711904bb7bf?auto=format&fit=crop&w=900&q=80',
    'https://images.pexels.com/photos/8891951/pexels-photo-8891951.jpeg?auto=compress&cs=tinysrgb&w=900',
    'https://images.pexels.com/photos/10983783/pexels-photo-10983783.jpeg?auto=compress&cs=tinysrgb&w=900',
  ],
  'khuyen-tai': [
    'https://images.pexels.com/photos/1413420/pexels-photo-1413420.jpeg?auto=compress&cs=tinysrgb&w=900',
    'https://images.pexels.com/photos/10983784/pexels-photo-10983784.jpeg?auto=compress&cs=tinysrgb&w=900',
    'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=900&q=80',
    'https://images.pexels.com/photos/8891950/pexels-photo-8891950.jpeg?auto=compress&cs=tinysrgb&w=900',
  ],
  'lac-tay': [
    'https://images.pexels.com/photos/1191538/pexels-photo-1191538.jpeg?auto=compress&cs=tinysrgb&w=900',
    'https://images.pexels.com/photos/9428804/pexels-photo-9428804.jpeg?auto=compress&cs=tinysrgb&w=900',
    'https://images.pexels.com/photos/8891951/pexels-photo-8891951.jpeg?auto=compress&cs=tinysrgb&w=900',
    'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?auto=format&fit=crop&w=900&q=80',
  ],
  charm: [
    'https://images.pexels.com/photos/1454171/pexels-photo-1454171.jpeg?auto=compress&cs=tinysrgb&w=900',
    'https://images.pexels.com/photos/9428796/pexels-photo-9428796.jpeg?auto=compress&cs=tinysrgb&w=900',
    'https://images.unsplash.com/photo-1611652022419-a9419f74343a?auto=format&fit=crop&w=900&q=80',
    'https://images.pexels.com/photos/10983783/pexels-photo-10983783.jpeg?auto=compress&cs=tinysrgb&w=900',
  ],
};

/** Local demo PNGs already match store aesthetics. */
const LOCAL_POOLS = {
  nhan: [],
  'day-chuyen': ['images/product/day-chuyen'],
  'vong-tay': [],
  'khuyen-tai': ['images/product/hoa-tai'],
  'lac-tay': [],
  charm: ['images/product/charm', 'images/product/mat-day-chuyen'],
};

async function exists(path) {
  try { await access(path, constants.F_OK); return true; } catch { return false; }
}

async function listLocalImages(relDirs) {
  const out = [];
  for (const rel of relDirs) {
    const dir = resolve(publicRoot, rel);
    if (!(await exists(dir))) continue;
    const files = await readdir(dir);
    for (const file of files) {
      if (!/\.(png|jpe?g|webp)$/i.test(file)) continue;
      out.push(join(rel, file).replace(/\\/g, '/'));
    }
  }
  return out.sort();
}

async function download(url, dest) {
  const response = await fetch(url, {
    headers: { 'User-Agent': 'JewelryThesisBot/1.0 (educational; contact: local)' },
  });
  if (!response.ok) throw new Error('HTTP ' + response.status + ' ' + url);
  await writeFile(dest, Buffer.from(await response.arrayBuffer()));
}

async function prepareFolder(folder, remotes, localRels) {
  const dir = join(productRoot, folder);
  await mkdir(dir, { recursive: true });
  const locals = await listLocalImages(localRels);
  const sources = [];

  // Prefer local demo PNGs first (store-ready look).
  for (const rel of locals) sources.push({ kind: 'local', value: rel });
  for (const url of remotes) sources.push({ kind: 'remote', value: url });
  assert.ok(sources.length > 0, 'No sources for ' + folder);

  const prepared = [];
  for (let style = 1; style <= 10; style += 1) {
    const source = sources[(style - 1) % sources.length];
    const primary = join(dir, `${folder}-${style}.1.jpg`);
    if (source.kind === 'local') {
      const abs = resolve(publicRoot, source.value);
      // Keep png if local png — upload accepts png; copy as .1 with original ext for upload path tracking
      const ext = extname(abs).toLowerCase() || '.jpg';
      const dest = join(dir, `${folder}-${style}.1${ext === '.png' ? '.png' : '.jpg'}`);
      await copyFile(abs, dest);
      // also ensure .jpg sibling for scripts expecting jpg
      if (ext === '.png') await copyFile(abs, primary).catch(async () => { await copyFile(dest, primary); });
      else if (dest !== primary) await copyFile(dest, primary);
      prepared.push(dest.endsWith('.png') ? dest : primary);
    } else {
      await download(source.value, primary);
      prepared.push(primary);
    }
    for (const shot of [2, 3]) {
      const dest = join(dir, `${folder}-${style}.${shot}.jpg`);
      const from = prepared[prepared.length - 1];
      await copyFile(from, dest);
    }
  }
  return prepared;
}

async function uploadAbsolute(absolutePath) {
  const bytes = await (await import('node:fs/promises')).readFile(absolutePath);
  const mime = { '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp' }[extname(absolutePath).toLowerCase()];
  assert.ok(mime, absolutePath);
  const form = new FormData();
  form.append('file', new Blob([bytes], { type: mime }), basename(absolutePath));
  const result = await api('admin/catalog/upload', 'POST', form);
  assert.ok(result.url);
  return result.url.startsWith('/api/v1/storefront/files/') ? origin + result.url : result.url;
}

function styleFiles(folder, styleIndex, imageCount) {
  const files = [];
  for (let shot = 1; shot <= imageCount; shot += 1) {
    const jpg = join(productRoot, folder, `${folder}-${styleIndex}.${shot}.jpg`);
    const png = join(productRoot, folder, `${folder}-${styleIndex}.${shot}.png`);
    files.push(jpg); // prepareFolder always writes jpg shots 1..3
  }
  return files;
}

await login();

for (const group of THESIS_GROUPS) {
  process.stdout.write('PREPARE ' + group.folder + '\n');
  await prepareFolder(group.folder, REMOTE[group.folder] || [], LOCAL_POOLS[group.folder] || []);
}

const productsPayload = await api('admin/catalog/products?take=' + THESIS_POLICY.catalogTake);
const products = (productsPayload.content ?? []).filter((p) => String(p.code || '').startsWith(THESIS_POLICY.prefix));
assert.ok(products.length >= 100, 'Expected JEW products');

let updated = 0;
for (const group of THESIS_GROUPS) {
  const groupProducts = products
    .filter((p) => String(p.code || '').startsWith(THESIS_POLICY.prefix + group.code + '-'))
    .sort((a, b) => String(a.code).localeCompare(String(b.code)));

  for (const [index, row] of groupProducts.entries()) {
    const style = group.styles[index] || group.styles[index % group.styles.length];
    const styleIndex = style.styleIndex;
    const imageCount = style.imageCount || 2;
    const detail = await api('admin/catalog/products/' + row.id);
    const files = styleFiles(group.folder, styleIndex, imageCount);
    const urls = [];
    for (const file of files) {
      if (!(await exists(file))) throw new Error('Missing ' + file);
      urls.push(await uploadAbsolute(file));
    }

    // Replace media: delete old then add new
    const oldMedia = detail.media ?? [];
    for (const media of oldMedia) {
      try { await api('admin/catalog/products/' + detail.id + '/media/' + media.id, 'DELETE'); } catch { /* ignore */ }
    }

    const skus = detail.skus || [];
    for (const sku of skus) {
      for (const [sortOrder, url] of urls.entries()) {
        await api('admin/catalog/products/' + detail.id + '/media', 'POST', {
          url,
          alt: detail.name + ' ' + (sortOrder + 1),
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
    if (updated % 10 === 0) process.stdout.write('UPDATED ' + updated + '\n');
  }
}

// Category images: first style of each folder
for (const group of THESIS_GROUPS) {
  const cats = await api('admin/catalog/categories');
  const category = cats.find((c) => c.code === THESIS_POLICY.prefix + group.code);
  if (!category) continue;
  const file = join(productRoot, group.folder, `${group.folder}-1.1.jpg`);
  const imageUrl = await uploadAbsolute(file);
  await api('admin/catalog/categories/' + category.id, 'PUT', {
    name: category.name,
    slug: category.slug,
    code: category.code,
    status: 'ACTIVE',
    imageUrl,
    directAttributeIds: [],
  }).catch(() => null);
}

process.stdout.write(JSON.stringify({ ok: true, updated }) + '\n');
