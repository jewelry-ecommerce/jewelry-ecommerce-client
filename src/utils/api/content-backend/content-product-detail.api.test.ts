import { afterEach, expect, test, vi } from 'vitest';
import { contentVariationPicker, getContentProductDetail, mapContentProductDetail, type WireProductDetail } from './content-product-detail.api';
import { ContentHttpError } from './content-backend.api';

afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });
const attribute = { id: 8, name: 'Size', code: 'SIZE', index: 0, displayType: 'TEXT' };
const price = { currency: 'VND', sellingPriceAfterTaxMinor: 150000, compareAtPriceAfterTaxMinor: null, discountPercent: null };
const gallery = [{ url: '/uploads/ring.png', type: 'IMAGE', sortOrder: 0, isPrimary: true }];
const variant = { id: 41, slug: 'ring', name: 'Ring', sku: 'RING-8', stock: 5, stockStatus: 'IN_STOCK',
  image: gallery[0].url, gallery, pricing: price, isDefault: true,
  attributeValues: [{ id: 12, code: 'SIZE-8', value: '8', attribute }] };
const fixture: WireProductDetail = {
  id: 3, slug: 'ring', name: 'Ring', status: 'PUBLISHED', isPurchasable: true, sku: 'RING-8', spuCode: 'RING',
  brand: { name: '', code: '', image: null, tenantCode: '' }, category: { id: 9, name: 'Rings', slug: 'rings' },
  description: 'Created in admin', shortDescription: 'Created in admin', gallery,
  seo: { metaTitle: 'Ring SEO', metaDescription: null, metaKeywords: null },
  dimensions: { weight: null, length: null, width: null, height: null },
  pricing: price, availability: { inStock: true, stockStatus: 'IN_STOCK' },
  defaultVariant: variant, defaultVariantId: 41, variants: [variant],
  variantSelectors: [{ attribute, options: [{ id: 12, code: 'SIZE-8', label: '8', value: '8',
    thumbnail: null, selected: true, available: true, variationIds: [41] }] }],
  productInfos: [{ id: 0, title: 'Material', content: 'Silver', sortOrder: 0 }],
  createdAt: '2026-10-10T00:00:00Z', updatedAt: '2026-10-10T00:00:00Z',
};
test('numeric product, SKU and selector IDs match across PDP and quick picker', () => {
  const detail = mapContentProductDetail(fixture);
  expect(detail.id).toBe('3'); expect(detail.category.id).toBe('9');
  expect(detail.defaultVariantId).toBe('41');
  expect(detail.variants[0].attributeValues[0].attribute.id).toBe('8');
  expect(detail.variantSelectors[0].options[0].variationIds).toEqual(['41']);
  const picker = contentVariationPicker(detail);
  expect(picker.variations[0].id).toBe(detail.defaultVariantId);
  expect(picker.variations[0].sellingPriceAfterTaxMinor).toBe('150000');
  expect(picker.variations[0].attributeValues).toEqual([{ attributeCode: 'SIZE', valueCode: 'SIZE-8' }]);
  expect(detail.productInfos[0].content).toBe('Silver');
});
test('detail uses configured real API and propagates errors without mock fallback', async () => {
  vi.stubEnv('NEXT_PUBLIC_CONTENT_API_URL', 'http://localhost:8083');
  const fetcher = vi.fn().mockResolvedValueOnce(new Response(JSON.stringify(fixture)))
    .mockResolvedValueOnce(new Response(JSON.stringify({ message: 'Not published' }), { status: 404 }));
  vi.stubGlobal('fetch', fetcher);
  expect((await getContentProductDetail('ring')).id).toBe('3');
  expect(fetcher.mock.calls[0][0]).toBe('http://localhost:8083/api/v1/storefront/product/ring');
  await expect(getContentProductDetail('draft')).rejects.toBeInstanceOf(ContentHttpError);
});
