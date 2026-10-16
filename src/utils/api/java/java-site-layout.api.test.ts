import { beforeEach, expect, test, vi } from 'vitest';
const transport = vi.hoisted(() => ({ get: vi.fn() }));
vi.mock('@/utils/axios', () => ({ commonAxios: transport }));
import { javaGlobalConfig, javaSiteLayout } from './java-site-layout.api';
beforeEach(() => { transport.get.mockReset(); });
test('public Java site-layout feeds header, footer and logos without seeded content', async () => {
  transport.get.mockResolvedValue({ data: { header: { bannerName: 'Thông báo', bannerContent: 'Nội dung thật' },
    footer: { menuColumns: [{ title: 'Hỗ trợ', items: [] }], socialLinks: [] }, logos: { HEADER: { logoUrl: '/uploads/logo.svg' } } } });
  const config = await javaGlobalConfig();
  expect(config.header?.bannerContent).toBe('Nội dung thật');
  expect(config.footer?.menuColumns[0].title).toBe('Hỗ trợ');
  expect((await javaSiteLayout()).logos.HEADER?.logoUrl).toBe('/uploads/logo.svg');
  expect(transport.get).toHaveBeenCalledWith('storefront/cms/site-layout');
});
test('empty Java site-layout stays empty', async () => {
  transport.get.mockResolvedValue({ data: { header: null, footer: null, logos: {} } });
  expect(await javaGlobalConfig()).toEqual({ header: null, footer: null });
});
