/**
 * Chuẩn hóa SKU: mỗi JEW-* active có đúng 5 size (8/10/12/14/16), màu Bạc.
 * ENV: JEWELRY_DEMO_CONFIRM=FIX_SKU_SIZES + phone/password
 */
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { api, login, numericId } from './thesis-catalog.api.mjs';
import { THESIS_POLICY } from './thesis-catalog.data.mjs';

assert.equal(process.env.JEWELRY_DEMO_CONFIRM, 'FIX_SKU_SIZES');
const SIZES = THESIS_POLICY.sizes;
const COLOR = THESIS_POLICY.color;
const manifest = JSON.parse(await readFile(fileURLToPath(new URL('../.demo-data/spu-image-sets.json', import.meta.url)), 'utf8'));
const codes = Object.values(manifest.groups).flatMap((g) => (g.spus || []).map((s) => s.code));

await login();
const attributes = await api('admin/catalog/attributes');
const color = attributes.find((a) => a.code === 'JEW_METAL_COLOR');
const sizeAttr = attributes.find((a) => a.code === 'JEW_SIZE');
assert.ok(color && sizeAttr, 'Missing JEW_METAL_COLOR or JEW_SIZE');

const products = [];
for (const code of codes) {
  const found = await api('admin/catalog/products?take=5&search=' + encodeURIComponent(code));
  const row = (found.content || []).find((p) => p.code === code);
  if (row) products.push(row);
}

let fixed = 0;
for (const row of products) {
  const detail = await api('admin/catalog/products/' + row.id);
  const skus = [...(detail.skus || [])];
  const material = detail.material || THESIS_POLICY.materialPrimary;
  const basePrice = Number(skus[0]?.listPrice || detail.listPrice || 500000);

  // Update existing slots
  for (let i = 0; i < Math.min(skus.length, SIZES.length); i += 1) {
    const size = SIZES[i];
    const sku = skus[i];
    await api('admin/catalog/products/' + detail.id + '/variants/' + sku.id, 'PUT', {
      skuCode: `${detail.code}-S${size}`,
      name: `${detail.name} - Size ${size}`,
      material,
      metalColorLabel: COLOR,
      sizeLabel: size,
      listPrice: basePrice + i * THESIS_POLICY.variantPriceStep,
      onHand: THESIS_POLICY.inventory + i,
      isDefault: i === 0,
    });
    await api('admin/catalog/products/' + detail.id + '/variants/' + sku.id + '/attributes', 'PUT', {
      values: [
        { attributeId: numericId(color.id), value: COLOR },
        { attributeId: numericId(sizeAttr.id), value: size },
      ],
    });
  }

  // Add missing sizes
  for (let i = skus.length; i < SIZES.length; i += 1) {
    const size = SIZES[i];
    const created = await api('admin/catalog/products/' + detail.id + '/variants', 'POST', {
      skuCode: `${detail.code}-S${size}`,
      name: `${detail.name} - Size ${size}`,
      material,
      metalColorLabel: COLOR,
      sizeLabel: size,
      listPrice: basePrice + i * THESIS_POLICY.variantPriceStep,
      onHand: THESIS_POLICY.inventory + i,
      isDefault: false,
    });
    const skuId = created.id || created.skuId || created?.skus?.at?.(-1)?.id;
    if (skuId) {
      await api('admin/catalog/products/' + detail.id + '/variants/' + skuId + '/attributes', 'PUT', {
        values: [
          { attributeId: numericId(color.id), value: COLOR },
          { attributeId: numericId(sizeAttr.id), value: size },
        ],
      });
    }
  }

  await api('admin/catalog/products/' + detail.id + '/publish', 'PATCH').catch(() => null);
  fixed += 1;
  if (fixed % 15 === 0) process.stdout.write(`SKU ${fixed}/${products.length}\n`);
}

const sample = await api('storefront/product/jew-ring-001', 'GET', undefined, false);
console.log(JSON.stringify({
  ok: true,
  fixed,
  sample: {
    name: sample.name,
    skus: (sample.skus || sample.variants || []).map((s) => ({
      size: s.sizeLabel || s.size,
      color: s.metalColorLabel || s.color,
      code: s.skuCode || s.code,
    })),
  },
}, null, 2));
