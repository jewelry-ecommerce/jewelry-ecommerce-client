import { beforeEach, expect, test, vi } from 'vitest';
const transport = vi.hoisted(() => ({ get: vi.fn() }));
vi.mock('@/utils/axios', () => ({ commonAxios: transport, authAxios: transport }));
vi.mock('@/utils/config/java-backend.config', () => ({ isJavaBackend: () => true }));
import { getStorefrontNavigation, getStorefrontNavigationPlpRail } from '../cms/cms.api';
import { getProductListBannersApi } from '../banner/banner.api';
import { getSearchLanding } from '../product/product.api';
import { javaGlobalConfig } from './java-site-layout.api';
import { javaOrderItem } from './java-order.mapper';
beforeEach(() => { transport.get.mockReset(); });

test('Java menu is read from the published endpoint without replacing empty data with a static menu', async () => {
  transport.get.mockResolvedValue({ data: { items: [] } });
  expect(await getStorefrontNavigation()).toEqual({ items: [] });
  expect(transport.get).toHaveBeenCalledWith('storefront/cms/navigation');
});
test('Java menu failures remain failures, not fabricated fallback configuration', async () => {
  transport.get.mockRejectedValue(new Error('Backend unavailable'));
  await expect(getStorefrontNavigation()).rejects.toThrow('Backend unavailable');
});
test('PLP rail forwards only nonempty context parameters', async () => {
  transport.get.mockResolvedValue({ data: { items: [] } });
  await getStorefrontNavigationPlpRail({ categoryId: '12', rootUrl: '' });
  expect(transport.get).toHaveBeenCalledWith('storefront/cms/navigation/plp-rail', { params: { categoryId: '12' } });
});
test.each([true, false])('product-list banner maps Java config into storefront placement data (category=%s)', async isCategory => {
  transport.get.mockResolvedValue({ data: { banners: [{ id: '2', imageUrl: '/uploads/banner.webp', enabled: true }] } });
  const result = await getProductListBannersApi('nhan', isCategory);
  expect(result).toMatchObject({ contextSlug: 'nhan', source: isCategory ? 'CATEGORY' : 'CMS_STOREFRONT', banners: [{ targetSlug: 'nhan', imageUrl: '/uploads/banner.webp' }] });
  expect(transport.get).toHaveBeenCalledWith('storefront/banner/product-list', { params: { conditionType: isCategory ? 'CATEGORY' : 'CMS_STOREFRONT', targetSlug: 'nhan' } });
});
test('no banner config returns empty content; unknown API failures do not', async () => {
  transport.get.mockResolvedValue({ data: null });
  expect(await getProductListBannersApi('nhan', true)).toEqual({ contextSlug: 'nhan', source: 'NONE', banners: [] });
  transport.get.mockRejectedValue(new Error('Forbidden'));
  await expect(getProductListBannersApi('nhan', true)).rejects.toThrow('Forbidden');
});
test('search landing shows actual published pins, never an arbitrary product list', async () => {
  transport.get.mockResolvedValue({ data: [{ productId: '12', productName: 'Nhẫn', productSlug: 'nhan', defaultVariationId: '14' }] });
  expect(await getSearchLanding()).toMatchObject([{ productId: '12', defaultVariationId: '14' }]);
  expect(transport.get).toHaveBeenCalledWith('storefront/product/search-pinned');
});
test('newsletter copy and order SKU snapshots survive response mapping', async () => {
  transport.get.mockResolvedValue({ data: { header: null, logos: {}, footer: { newsletterHeading: 'Nhận tin', newsletterSubHeading: 'Ưu đãi mới', socialLinks: [], menuColumns: [] } } });
  expect((await javaGlobalConfig()).footer).toMatchObject({ newsletterHeading: 'Nhận tin', newsletterSubHeading: 'Ưu đãi mới' });
  expect(javaOrderItem({ id: 2, productId: 3, skuId: 4, name: 'Nhẫn', skuCode: 'RING-S', sizeLabel: 'S', metalColorLabel: 'Bạc', imageUrl: null, quantity: 1, unitPrice: 100000, lineTotal: 100000 }))
    .toMatchObject({ skuCode: 'RING-S', variationName: 'S / Bạc', variationId: '4' });
});
