/**
 * Fill admin-required catalog fields for JEW-* products via admin APIs:
 * - SKU listPrice (giá gạch) > salePrice (giá bán)
 * - costPrice
 * - metaKeywords
 * - attribute "Màu sắc" / metal color value "Bạc" with uploaded swatch image
 *
 * ENV: JEWELRY_DEMO_CONFIRM=CREATE_THESIS_CATALOG_120 + phone/password + API URL
 */
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { api, login, publicMediaUrl, verifyThesisTarget } from './thesis-catalog.api.mjs';
import { THESIS_POLICY } from './thesis-catalog.data.mjs';

verifyThesisTarget();
await login();

const COMPARE_RATIO = 1.2;
const COST_RATIO = 0.55;
const BATCH = 8;
const COLOR_SOURCE =
  'https://cdn-media-stg.sevagoretail.jewelry/v1/img/staging-external-trading/019feadc-10b3-7783-bef5-a91ecbc238e7/v-c81fccec/w72_h72_q90.webp';
const COLOR_PUBLIC_RELATIVE = 'images/attributes/mau-bac.webp';
const publicRoot = fileURLToPath(new URL('../public/', import.meta.url));

function roundVnd(value) {
  return Math.max(1000, Math.round(Number(value) / 1000) * 1000);
}

async function mapPool(items, size, worker) {
  const results = [];
  for (let index = 0; index < items.length; index += size) {
    const chunk = items.slice(index, index + size);
    const settled = await Promise.allSettled(chunk.map((item, offset) => worker(item, index + offset)));
    results.push(...settled);
  }
  return results;
}

async function uploadColorSwatch() {
  const response = await fetch(COLOR_SOURCE, { signal: AbortSignal.timeout(THESIS_POLICY.timeout) });
  assert.ok(response.ok, 'Download color swatch failed: ' + response.status);
  const bytes = Buffer.from(await response.arrayBuffer());
  const absolute = resolve(publicRoot, COLOR_PUBLIC_RELATIVE);
  await mkdir(dirname(absolute), { recursive: true });
  await writeFile(absolute, bytes);

  const form = new FormData();
  form.append('file', new Blob([bytes], { type: 'image/webp' }), 'mau-bac.webp');
  const uploaded = await api('admin/catalog/upload', 'POST', form);
  assert.ok(uploaded?.url, 'Admin upload returned no url');
  process.stdout.write('UPLOAD_ADMIN ' + uploaded.url + '\n');

  // Prefer durable public URL (Render disk is ephemeral).
  const durable = publicMediaUrl(COLOR_PUBLIC_RELATIVE);
  process.stdout.write('COLOR_DURABLE ' + durable + '\n');
  return durable;
}

async function patchColorAttributes(imageUrl) {
  const attrs = await api('admin/catalog/attributes?take=100');
  const list = Array.isArray(attrs) ? attrs : attrs.content ?? [];
  const color = list.find((row) => row.code === 'DEMO_COLOR' || row.name === 'Màu sắc');
  const metal = list.find((row) => row.code === 'JEW_METAL_COLOR');
  assert.ok(color, 'Missing attribute Màu sắc / DEMO_COLOR');

  const colorValues = (color.values || []).map((value) => ({
    id: Number(value.id),
    code: value.code,
    value: value.value || value.name || value.code,
    imageUrl: (value.value || value.name || value.code) === 'Bạc' ? imageUrl : value.imageUrl || undefined,
  }));
  await api('admin/catalog/attributes/' + color.id, 'PUT', {
    name: 'Màu sắc',
    code: color.code,
    type: color.type || 'SELECT',
    displayType: 'IMAGE',
    status: color.status || 'ACTIVE',
    values: colorValues,
  });
  process.stdout.write('ATTR DEMO_COLOR IMAGE Bạc ok\n');

  if (metal) {
    const metalValues = (metal.values || []).map((value) => ({
      id: Number(value.id),
      code: value.code,
      value: value.value || value.name || value.code,
      imageUrl: (value.value || value.name || value.code) === 'Bạc' ? imageUrl : value.imageUrl || undefined,
    }));
    await api('admin/catalog/attributes/' + metal.id, 'PUT', {
      name: metal.name,
      code: metal.code,
      type: metal.type || 'SELECT',
      displayType: 'IMAGE',
      status: metal.status || 'ACTIVE',
      values: metalValues,
    });
    process.stdout.write('ATTR JEW_METAL_COLOR IMAGE Bạc ok\n');
  }
}

async function fixProduct(product) {
  const detail = await api('admin/catalog/products/' + product.id);
  const skus = detail.skus || [];
  const skuSettled = await Promise.allSettled(
    skus.map(async (sku) => {
      const currentSell = Number(sku.salePrice ?? sku.listPrice ?? 0);
      assert.ok(currentSell > 0, 'SKU missing price: ' + sku.skuCode);
      const salePrice = roundVnd(currentSell);
      const listPrice = roundVnd(salePrice * COMPARE_RATIO);
      const costPrice = roundVnd(salePrice * COST_RATIO);
      await api('admin/catalog/products/' + product.id + '/variants/' + sku.id, 'PUT', {
        skuCode: sku.skuCode,
        name: sku.name,
        material: sku.material,
        sizeLabel: sku.sizeLabel,
        metalColorLabel: sku.metalColorLabel,
        listPrice,
        salePrice,
        costPrice,
        status: sku.status || 'PUBLISHED',
        isDefault: Boolean(sku.default || sku.isDefault),
        onHand: Number(sku.availableStock ?? 0),
      });
    }),
  );
  const skuFailed = skuSettled.filter((row) => row.status === 'rejected');
  if (skuFailed.length) {
    throw new Error(product.code + ' sku fails: ' + skuFailed.map((row) => row.reason?.message || row.reason).join(' | '));
  }

  const keywords =
    detail.metaKeywords?.trim() ||
    [detail.name, 'trang sức bạc', 'bạc 925', THESIS_POLICY.brand].filter(Boolean).join(', ');

  await api('admin/catalog/products/' + product.id, 'PUT', {
    code: detail.code,
    categoryId: Number(detail.categoryId),
    name: detail.name,
    shortDescription: detail.shortDescription,
    description: detail.description,
    material: detail.material,
    occasion: detail.occasion,
    thumbnailUrl: detail.thumbnailUrl,
    unitOfMeasure: detail.unitOfMeasure || 'EACH',
    metaTitle: detail.metaTitle,
    metaDescription: detail.metaDescription,
    metaKeywords: keywords,
    productInfos: detail.productInfos,
    brandId: detail.brandId ?? null,
  });
  return product.code;
}

const colorUrl = await uploadColorSwatch();
await patchColorAttributes(colorUrl);

const productsPayload = await api('admin/catalog/products?take=' + THESIS_POLICY.catalogTake);
const products = (productsPayload.content ?? []).filter((row) => String(row.code || '').startsWith(THESIS_POLICY.prefix));
assert.ok(products.length > 0, 'No JEW-* products');

const settled = await mapPool(products, BATCH, fixProduct);
const failed = settled.filter((row) => row.status === 'rejected');
const ok = settled.filter((row) => row.status === 'fulfilled').length;
process.stdout.write('PRODUCTS_OK ' + ok + '/' + products.length + '\n');
if (failed.length) {
  process.stdout.write('PRODUCTS_FAIL ' + failed.length + '\n');
  for (const row of failed.slice(0, 10)) process.stdout.write(String(row.reason?.message || row.reason) + '\n');
  process.exitCode = 1;
} else {
  process.stdout.write('DONE sku required fields + color swatch\n');
}
