/**
 * Rewrite relative `/api/v1/storefront/files/...` media URLs to absolute BE origin.
 * ENV: JEWELRY_DEMO_CONFIRM=REPAIR_MEDIA_URLS + phone/password + API URL
 */
import assert from 'node:assert/strict';
import { api, baseUrl, login } from './thesis-catalog.api.mjs';

assert.equal(process.env.JEWELRY_DEMO_CONFIRM, 'REPAIR_MEDIA_URLS', 'Set JEWELRY_DEMO_CONFIRM=REPAIR_MEDIA_URLS');
const origin = new URL(baseUrl).origin;
const REL = /^\/api\/v1\/storefront\/files\//;

function abs(url) {
  if (typeof url !== 'string') return url;
  const trimmed = url.trim();
  if (!REL.test(trimmed)) return trimmed;
  return origin + trimmed;
}

function rewriteDeep(value) {
  if (Array.isArray(value)) return value.map(rewriteDeep);
  if (value && typeof value === 'object') {
    const next = {};
    for (const [key, child] of Object.entries(value)) next[key] = rewriteDeep(child);
    return next;
  }
  return typeof value === 'string' && REL.test(value.trim()) ? abs(value) : value;
}

await login();
let productFixed = 0;
for (let page = 0; page < 5; page += 1) {
  const res = await api('admin/catalog/products?take=100&page=' + page);
  const rows = res.content ?? [];
  if (!rows.length) break;
  for (const row of rows) {
    if (!String(row.code || '').startsWith('JEW-')) continue;
    const detail = await api('admin/catalog/products/' + row.id);
    const thumb = abs(detail.thumbnailUrl || '');
    const needsThumb = thumb !== (detail.thumbnailUrl || '');
    const mediaList = detail.media ?? [];
    let mediaChanged = 0;
    for (const media of mediaList) {
      const nextUrl = abs(media.url || '');
      if (nextUrl === (media.url || '')) continue;
      try {
        await api('admin/catalog/products/' + detail.id + '/media/' + media.id, 'PUT', {
          url: nextUrl,
          alt: media.alt,
          skuId: media.skuId ? Number(media.skuId) : undefined,
          type: media.type || 'IMAGE',
          sortOrder: media.sortOrder ?? 0,
          primary: media.primary ?? media.isPrimary ?? false,
        });
        mediaChanged += 1;
      } catch (error) {
        // Fallback: delete+recreate not needed if PUT unsupported — log
        process.stdout.write('MEDIA_FAIL ' + detail.code + ' ' + error.message.slice(0, 100) + '\n');
      }
    }
    if (needsThumb || mediaChanged) {
      try {
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
          thumbnailUrl: thumb || detail.thumbnailUrl,
          metaTitle: detail.metaTitle,
          metaDescription: detail.metaDescription,
          productInfos: detail.productInfos ?? [],
          variants: (detail.skus || []).map((sku) => ({
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
        productFixed += 1;
        process.stdout.write('PRODUCT ' + detail.code + ' media=' + mediaChanged + '\n');
      } catch (error) {
        process.stdout.write('PRODUCT_FAIL ' + detail.code + ' ' + error.message.slice(0, 120) + '\n');
      }
    }
  }
  if (rows.length < 100) break;
}

// Categories
const categories = await api('admin/catalog/categories');
for (const category of categories) {
  const imageUrl = abs(category.imageUrl || '');
  if (imageUrl === (category.imageUrl || '')) continue;
  try {
    await api('admin/catalog/categories/' + category.id, 'PUT', {
      name: category.name,
      slug: category.slug,
      code: category.code,
      status: category.status || 'ACTIVE',
      imageUrl,
      directAttributeIds: [],
    });
    process.stdout.write('CATEGORY ' + category.code + '\n');
  } catch (error) {
    process.stdout.write('CATEGORY_FAIL ' + category.code + ' ' + error.message.slice(0, 100) + '\n');
  }
}

// CMS pages configs
const pages = await api('admin/cms/pages');
let pagesFixed = 0;
for (const page of pages) {
  const detail = page.blocks ? page : await api('admin/cms/pages/' + page.id);
  const blocks = (detail.blocks || []).map((block, sortOrder) => ({
    type: block.type || block.blockTypeCode,
    isVisible: block.isVisible ?? block.visible ?? true,
    sortOrder,
    config: rewriteDeep(block.config || {}),
  }));
  const before = JSON.stringify(detail.blocks || []);
  const after = JSON.stringify(blocks.map((block) => block.config));
  if (before.includes('/api/v1/storefront/files/') || JSON.stringify(detail).includes('/api/v1/storefront/files/')) {
    await api('admin/cms/pages/' + detail.id, 'PUT', {
      name: detail.name,
      slug: detail.slug,
      locale: detail.locale || 'vi-VN',
      isActive: true,
      targetDevice: detail.targetDevice || 'ALL',
      seo: rewriteDeep(detail.seo || { title: detail.name, description: detail.name }),
      blocks,
    });
    await api('admin/cms/pages/' + detail.id + '/publish', 'POST');
    pagesFixed += 1;
    process.stdout.write('PAGE ' + detail.slug + '\n');
  } else if (after !== JSON.stringify((detail.blocks || []).map((block) => block.config))) {
    // no-op
  }
}

process.stdout.write(JSON.stringify({ ok: true, origin, productFixed, pagesFixed }) + '\n');
