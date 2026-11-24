/**
 * Clear season + product tax override on published JEW products.
 * unitOfMeasure stays EACH (BE cannot null it on update); UI hides it.
 */
import assert from 'node:assert/strict';
import { api, login, numericId, verifyThesisTarget } from './thesis-catalog.api.mjs';

verifyThesisTarget();
await login();

let page = 0;
let cleared = 0;
let skipped = 0;
let failed = 0;

while (page < 20) {
  const res = await api('admin/catalog/products?take=50&page=' + page + '&status=PUBLISHED');
  const content = res.content || [];
  for (const row of content) {
    if (!String(row.code || '').startsWith('JEW-')) continue;
    try {
      const detail = await api('admin/catalog/products/' + row.id);
      const needsSeason = detail.seasonId != null;
      const needsTax = detail.taxRateOverride != null;
      if (!needsSeason && !needsTax) {
        skipped += 1;
        continue;
      }
      await api('admin/catalog/products/' + detail.id, 'PUT', {
        categoryId: numericId(detail.categoryId),
        code: detail.code,
        name: detail.name,
        slug: detail.slug,
        shortDescription: detail.shortDescription,
        description: detail.description,
        material: detail.material,
        occasion: detail.occasion,
        thumbnailUrl: detail.thumbnailUrl,
        unitOfMeasure: detail.unitOfMeasure || 'EACH',
        metaTitle: detail.metaTitle,
        metaDescription: detail.metaDescription,
        metaKeywords: detail.metaKeywords,
        brandId: detail.brandId ?? null,
        seasonId: null,
        taxRateOverride: null,
      });
      await api('admin/catalog/products/' + detail.id + '/publish', 'PATCH').catch(() => null);
      cleared += 1;
      process.stdout.write('CLEARED ' + detail.code + ' season=' + needsSeason + ' tax=' + needsTax + '\n');
    } catch (error) {
      failed += 1;
      process.stdout.write('FAIL ' + row.code + ' ' + String(error.message || error).slice(0, 160) + '\n');
    }
  }
  if (page >= (res.totalPages ?? 1) - 1) break;
  page += 1;
}

assert.ok(failed === 0, 'clear failed=' + failed);
process.stdout.write(JSON.stringify({ cleared, skipped, failed }, null, 2) + '\n');
