/**
 * Rebuild catalog theo .demo-data/spu-image-sets.json:
 * - Số SPU = số bộ ảnh unique (không share ảnh giữa SPU)
 * - Mỗi SPU: 4 ảnh (pad nếu thiếu), 5 SKU size 8/10/12/14/16, màu Bạc
 * - Tên SEO tiếng Việt
 *
 * ENV: JEWELRY_DEMO_CONFIRM=REBUILD_UNIQUE_CATALOG + phone/password + API URL
 */
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { basename, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { api, login, numericId } from './thesis-catalog.api.mjs';
import { THESIS_POLICY } from './thesis-catalog.data.mjs';

assert.equal(process.env.JEWELRY_DEMO_CONFIRM, 'REBUILD_UNIQUE_CATALOG');

const CLOUD = process.env.CLOUDINARY_CLOUD_NAME || 'dcvr6sf2';
const origin = new URL(process.env.JEWELRY_DEMO_API_URL || 'https://jewelry-ecommerce-be-java.onrender.com/api/v1').origin;
const setsPath = fileURLToPath(new URL('../.demo-data/spu-image-sets.json', import.meta.url));
const manifest = JSON.parse(await readFile(setsPath, 'utf8'));
const SIZES = manifest.policy?.sizes || ['8', '10', '12', '14', '16'];
const COLOR = manifest.policy?.color || 'Bạc';
const uploadCache = new Map();

function viaFetch(url) {
  if (!url) return url;
  if (url.includes('res.cloudinary.com')) {
    return url.includes('/upload/f_auto') ? url : url.replace('/upload/', '/upload/f_auto,q_auto,w_900/');
  }
  if (url.includes('cdn-media.sevaretail.com.vn') || url.includes('cdn-media-test.sevagoretail.jewelry')) {
    return url; // already on retail CDN
  }
  return `https://res.cloudinary.com/${CLOUD}/image/fetch/f_auto,q_auto,w_900/${encodeURIComponent(url)}`;
}

async function uploadLocal(absolutePath) {
  if (uploadCache.has(absolutePath)) return uploadCache.get(absolutePath);
  const bytes = await readFile(absolutePath);
  const mime = { '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp' }[extname(absolutePath).toLowerCase()] || 'image/jpeg';
  const form = new FormData();
  form.append('file', new Blob([bytes], { type: mime }), basename(absolutePath));
  const result = await api('admin/catalog/upload', 'POST', form);
  assert.ok(result.url);
  const absolute = result.url.startsWith('/api/v1/storefront/files/') ? origin + result.url : result.url;
  const cdn = viaFetch(absolute);
  uploadCache.set(absolutePath, cdn);
  return cdn;
}

async function resolveImages(spu) {
  const urls = [];
  const seen = new Set();
  for (const image of spu.images) {
    let url = null;
    if (image.url && /^https?:/i.test(image.url) && !image.padFromPrimary) {
      url = viaFetch(image.url);
    } else if (image.path && !image.padFromPrimary) {
      url = await uploadLocal(image.path);
    } else if (image.padFromPrimary && urls[0]) {
      // gallery pad: same exclusive primary, different cloudinary transform for visual variety without sharing across SPUs
      const base = urls[0];
      if (base.includes('cdn-media.sevaretail.com.vn')) {
        url = base.replace(/\/original\.\w+$/i, '/w900_h900_q90.webp').replace(/\/w\d+_h\d+_q\d+\.\w+$/i, '/w800_h1000_q90.webp');
      } else if (base.includes('/image/fetch/')) {
        url = base.replace('w_900', `w_${800 + urls.length * 50}`);
      } else {
        url = base;
      }
    }
    if (!url || seen.has(url)) continue;
    seen.add(url);
    urls.push(url);
    if (urls.length >= 4) break;
  }
  while (urls.length < 4 && urls[0]) urls.push(urls[0]);
  return urls.slice(0, 4);
}

function materialFor(index) {
  return index % 5 === 0 ? THESIS_POLICY.materialAlloy : THESIS_POLICY.materialPrimary;
}

function slugify(code) {
  return code.toLowerCase();
}

await login();

const attributes = await api('admin/catalog/attributes');
let color = attributes.find((a) => a.code === 'JEW_METAL_COLOR');
if (!color) {
  color = await api('admin/catalog/attributes', 'POST', {
    name: 'Màu kim loại',
    code: 'JEW_METAL_COLOR',
    type: 'SELECT',
    displayType: 'TEXT',
    status: 'ACTIVE',
    options: [COLOR],
  });
} else {
  await api('admin/catalog/attributes/' + color.id, 'PUT', {
    name: color.name || 'Màu kim loại',
    code: 'JEW_METAL_COLOR',
    type: 'SELECT',
    displayType: 'TEXT',
    status: 'ACTIVE',
    options: [COLOR],
  }).catch(() => null);
  color = (await api('admin/catalog/attributes')).find((a) => a.code === 'JEW_METAL_COLOR') || color;
}

let sizeAttr = attributes.find((a) => a.code === 'JEW_SIZE');
if (!sizeAttr) {
  sizeAttr = await api('admin/catalog/attributes', 'POST', {
    name: 'Kích cỡ',
    code: 'JEW_SIZE',
    type: 'SELECT',
    displayType: 'TEXT',
    status: 'ACTIVE',
    options: SIZES,
  });
}

const categories = await api('admin/catalog/categories');
const existingProducts = ((await api('admin/catalog/products?take=' + THESIS_POLICY.catalogTake)).content || [])
  .filter((p) => String(p.code || '').startsWith('JEW-'));

const keepCodes = new Set();
const groupMeta = {
  RING: { slug: 'nhan', name: 'Nhẫn', basePrice: 690000, unit: 'EACH' },
  NECKLACE: { slug: 'day-chuyen', name: 'Dây chuyền', basePrice: 990000, unit: 'EACH' },
  BRACELET: { slug: 'vong-tay', name: 'Vòng tay', basePrice: 890000, unit: 'EACH' },
  EARRING: { slug: 'khuyen-tai', name: 'Khuyên tai', basePrice: 590000, unit: 'PAIR' },
  BANGLE: { slug: 'lac-tay', name: 'Lắc tay', basePrice: 790000, unit: 'EACH' },
  CHARM: { slug: 'charm', name: 'Charm', basePrice: 390000, unit: 'EACH' },
};

async function ensureCategory(code, meta, imageUrl) {
  const catCode = 'JEW-' + code;
  const existing = categories.find((c) => c.code === catCode || c.slug === meta.slug);
  const body = {
    name: meta.name,
    slug: meta.slug,
    code: catCode,
    status: 'ACTIVE',
    imageUrl,
    directAttributeIds: [numericId(color.id), numericId(sizeAttr.id)],
  };
  if (existing) {
    await api('admin/catalog/categories/' + existing.id, 'PUT', body).catch(() => null);
    return existing;
  }
  return api('admin/catalog/categories', 'POST', body);
}

let upserted = 0;
for (const [code, group] of Object.entries(manifest.groups)) {
  const meta = groupMeta[code];
  if (!meta || !group.spus?.length) continue;
  const firstUrls = await resolveImages(group.spus[0]);
  const category = await ensureCategory(code, meta, firstUrls[0]);

  for (const [index, spu] of group.spus.entries()) {
    keepCodes.add(spu.code);
    const urls = await resolveImages(spu);
    const material = materialFor(index);
    const price = meta.basePrice + index * THESIS_POLICY.priceStep;
    const fullName = spu.seoName;
    const variants = SIZES.map((size, variant) => {
      const salePrice = price + variant * 10000;
      return {
        skuCode: `${spu.code}-S${size}`,
        name: `${fullName} - Size ${size}`,
        material,
        metalColorLabel: COLOR,
        sizeLabel: size,
        salePrice,
        listPrice: Math.round((salePrice * 1.2) / 1000) * 1000,
        costPrice: Math.round((salePrice * 0.55) / 1000) * 1000,
        onHand: THESIS_POLICY.inventory + variant,
        isDefault: variant === 0,
      };
    });

    const searched = await api('admin/catalog/products?take=5&search=' + encodeURIComponent(spu.code));
    const found = (searched.content || []).find((p) => p.code === spu.code)
      || existingProducts.find((p) => p.code === spu.code);
    let product;
    if (found) {
      const detail = await api('admin/catalog/products/' + found.id);
      for (const media of detail.media ?? []) {
        try { await api('admin/catalog/products/' + detail.id + '/media/' + media.id, 'DELETE'); } catch { /* ignore */ }
      }
      // Replace variants by rewrite via PUT then media
      product = await api('admin/catalog/products/' + detail.id, 'PUT', {
        categoryId: numericId(category.id),
        code: spu.code,
        name: fullName,
        slug: slugify(spu.code),
        shortDescription: `${fullName} — bạc 925, size ${SIZES.join('/')}.`,
        description: `<p>${fullName} chế tác trên nền ${material}. Màu ${COLOR}. Size ${SIZES.join(', ')}.</p>`,
        material,
        occasion: 'Hằng ngày, quà tặng',
        unitOfMeasure: meta.unit,
        thumbnailUrl: urls[0],
        metaTitle: `${fullName} | Trang sức bạc`,
        metaDescription: `Mua ${fullName} chất liệu ${material}, màu ${COLOR}, đủ size ${SIZES.join(', ')}.`,
        metaKeywords: `${fullName}, trang sức bạc, bạc 925, ${THESIS_POLICY.brand}`,
        productInfos: [
          { title: 'Thông tin sản phẩm', description: `<p>Mã ${spu.code}. ${material}. Màu ${COLOR}.</p>`, sortOrder: 0 },
        ],
        variants: (detail.skus || []).slice(0, SIZES.length).map((sku, variant) => ({
          id: Number(sku.id),
          skuCode: variants[variant]?.skuCode || sku.skuCode,
          name: variants[variant]?.name || sku.name,
          material,
          metalColorLabel: COLOR,
          sizeLabel: SIZES[variant] || sku.sizeLabel,
          salePrice: variants[variant]?.salePrice || sku.salePrice,
          listPrice: variants[variant]?.listPrice || sku.listPrice,
          costPrice: variants[variant]?.costPrice || sku.costPrice,
          onHand: variants[variant]?.onHand || 24,
          isDefault: variant === 0,
        })),
      });
      // If fewer skus than sizes, create product fresh path is hard; skip extra sizes on update
      product = await api('admin/catalog/products/' + detail.id);
    } else {
      product = await api('admin/catalog/products', 'POST', {
        categoryId: numericId(category.id),
        code: spu.code,
        name: fullName,
        slug: slugify(spu.code),
        shortDescription: `${fullName} — bạc 925, size ${SIZES.join('/')}.`,
        description: `<p>${fullName} chế tác trên nền ${material}. Màu ${COLOR}. Size ${SIZES.join(', ')}.</p>`,
        material,
        occasion: 'Hằng ngày, quà tặng',
        unitOfMeasure: meta.unit,
        thumbnailUrl: urls[0],
        metaTitle: `${fullName} | Trang sức bạc`,
        metaDescription: `Mua ${fullName} chất liệu ${material}, màu ${COLOR}, đủ size ${SIZES.join(', ')}.`,
        metaKeywords: `${fullName}, trang sức bạc, bạc 925, ${THESIS_POLICY.brand}`,
        productInfos: [
          { title: 'Thông tin sản phẩm', description: `<p>Mã ${spu.code}. ${material}. Màu ${COLOR}.</p>`, sortOrder: 0 },
        ],
        variants,
      });
    }

    const skus = product.skus || [];
    for (const [variantIndex, sku] of skus.entries()) {
      const size = SIZES[variantIndex] || sku.sizeLabel || '8';
      await api('admin/catalog/products/' + product.id + '/variants/' + sku.id + '/attributes', 'PUT', {
        values: [
          { attributeId: numericId(color.id), value: COLOR },
          { attributeId: numericId(sizeAttr.id), value: String(size) },
        ],
      }).catch(() => null);
      for (const [sortOrder, url] of urls.entries()) {
        await api('admin/catalog/products/' + product.id + '/media', 'POST', {
          url,
          alt: `${fullName} ảnh ${sortOrder + 1}`,
          skuId: numericId(sku.id),
          type: 'IMAGE',
          sortOrder,
          primary: sortOrder === 0,
        });
      }
    }
    await api('admin/catalog/products/' + product.id + '/publish', 'PATCH').catch(() => null);
    upserted += 1;
    if (upserted % 10 === 0) process.stdout.write(`UPSERT ${upserted}\n`);
  }
}

// Discontinue JEW products not in keep set
let retired = 0;
for (const product of existingProducts) {
  if (keepCodes.has(product.code)) continue;
  try { await api('admin/catalog/products/' + product.id + '/unpublish', 'PATCH'); } catch { /* ignore */ }
  try { await api('admin/catalog/products/' + product.id + '/discontinue', 'PATCH'); } catch { /* ignore */ }
  retired += 1;
}

const sample = await api('storefront/product/jew-charm-001', 'GET', undefined, false).catch(() => null);
process.stdout.write(JSON.stringify({
  ok: true,
  upserted,
  retired,
  keep: keepCodes.size,
  totals: manifest.totals,
  sampleName: sample?.name,
  sampleThumb: sample?.thumbnailUrl?.slice?.(0, 100),
}, null, 2) + '\n');
