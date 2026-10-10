import { beforeEach, describe, expect, it, vi } from 'vitest';
import { bannerStoreSchema, bannerRecordSchema, placementRecordSchema, layoutRecordSchema, type BannerDemoStore } from './banner-demo.schema';
import { executeBannerDemoCommand } from './banner-demo.service';
import { renderBannerPlacement } from './banner-demo.render';
import { BlockTypeCode } from '@/utils/api/cms/cms.enum';
import { toStorefrontPage } from '../cms-demo/cms-demo.service';
const repository = vi.hoisted(() => ({ store: { banners: [], placements: [], layouts: [] } as BannerDemoStore }));
vi.mock('./banner-demo.repository', () => ({
  readBannerDemoStore: async () => structuredClone(repository.store),
  writeBannerDemoStore: async (store: BannerDemoStore) => { repository.store = structuredClone(store); },
}));
beforeEach(() => { repository.store = bannerStoreSchema.parse({ banners: [], placements: [], layouts: [] }); });
const placement = async (type: string, code = 'HOME_HERO') => placementRecordSchema.parse(await executeBannerDemoCommand({
  operation: 'postPlacement', data: { name: 'Banner trang chủ', code, displayType: type },
}));
const banner = async (name = 'Ảnh banner') => bannerRecordSchema.parse(await executeBannerDemoCommand({
  operation: 'postBanner', data: { internalName: name, mediaUrl: '/media/desktop.png', mediaMobileUrl: '/media/mobile.png',
    title: 'Bộ sưu tập mới', titleColor: '#123456', actions: [{ actionType: 'URL', actionTarget: '/san-pham', ctaText: 'Mua ngay' }] },
}));
describe('CMS banner flow', () => {
  it.each(['GRID', 'SLIDER', 'DOUBLE_BANNER'])('creates %s, saves slots and exposes the same banner through CMS to client', async type => {
    const created = await placement(type);
    expect(renderBannerPlacement(repository.store, created.code)).toBeNull();
    const content = await banner();
    const saved = layoutRecordSchema.parse(await executeBannerDemoCommand({
      operation: 'postPlacementLayout', placementId: created.id, data: { name: 'Bản hiển thị', status: 'ACTIVE',
        items: [{ slotKey: 'hero', bannerId: content.id, displayMetadata: { x: 0, y: 0, width: 1, height: 1, order: 1 } }] },
    }));
    expect(saved.items).toHaveLength(1);
    const response = renderBannerPlacement(repository.store, created.code);
    expect(response?.type).toBe(type);
    expect(response?.slots[0].banners[0].banner).toMatchObject({
      media_url: '/media/desktop.png', media_mobile_url: '/media/mobile.png',
      title: 'Bộ sưu tập mới', title_color: '#123456',
      actions: [{ action_type: 'URL', action_target: '/san-pham', cta_text: 'Mua ngay' }],
    });
    const page = toStorefrontPage({ id: 'page', name: 'Trang chủ', slug: 'trang-chu', status: 'PUBLISHED', revision: 1,
      seo: { title: '', description: '' }, blocks: [{ id: 'block', blockTypeCode: BlockTypeCode.BANNER,
        sortOrder: 1, isVisible: true, config: { placementCode: created.code } }] });
    expect(page?.blocks[0].config.placementCode).toBe(response?.code);
  });
  it('edits media without resetting other fields and reopens with the edited banner', async () => {
    const created = await placement('SLIDER');
    const content = await banner();
    const layout = layoutRecordSchema.parse(await executeBannerDemoCommand({ operation: 'postPlacementLayout', placementId: created.id,
      data: { name: 'Layout', status: 'ACTIVE', items: [{ slotKey: '1', bannerId: content.id }] } }));
    await executeBannerDemoCommand({ operation: 'patchBanner', id: content.id, data: { mediaUrl: '/media/changed.png' } });
    const detail = await executeBannerDemoCommand({ operation: 'getPlacementLayoutDetail', placementId: created.id, layoutId: layout.id });
    expect(detail).toMatchObject({ items: [{ banner: { mediaUrl: '/media/changed.png', titleColor: '#123456', status: 'ACTIVE' } }] });
    expect(renderBannerPlacement(repository.store, created.code)?.slots[0].banners[0].banner.media_url).toBe('/media/changed.png');
  });
  it('serializes concurrent slot writes, rejects duplicate codes and dangling references, and can continue after errors', async () => {
    const created = await placement('GRID');
    await expect(placement('GRID')).rejects.toMatchObject({ code: 'PLACEMENT_CODE_TAKEN' });
    await Promise.all([banner('Slot 1'), banner('Slot 2')]);
    expect(repository.store.banners).toHaveLength(2);
    await expect(executeBannerDemoCommand({ operation: 'postPlacementLayout', placementId: created.id,
      data: { name: 'Invalid', items: [{ slotKey: 'x', bannerId: 'missing' }] } })).rejects.toMatchObject({ code: 'BANNER_NOT_FOUND' });
    expect((await placement('SLIDER', 'SECOND')).code).toBe('SECOND');
  });
  it('rejects executable links before persisting them', async () => {
    await expect(executeBannerDemoCommand({ operation: 'postBanner', data: {
      internalName: 'Unsafe', actions: [{ actionType: 'URL', actionTarget: 'java\nscript:alert(1)' }],
    } })).rejects.toBeDefined();
    expect(repository.store.banners).toEqual([]);
  });
  it('uses only the newest active layout, hides inactive/deleted placements, and leaves media untouched', async () => {
    const created = await placement('SLIDER');
    const content = await banner();
    const input = { name: 'Layout', status: 'ACTIVE', items: [{ slotKey: '1', bannerId: content.id }] };
    await executeBannerDemoCommand({ operation: 'postPlacementLayout', placementId: created.id, data: input });
    await executeBannerDemoCommand({ operation: 'postPlacementLayout', placementId: created.id, data: input });
    expect(repository.store.layouts.map(entry => entry.status)).toEqual(['INACTIVE', 'ACTIVE']);
    await executeBannerDemoCommand({ operation: 'patchPlacement', id: created.id, data: { status: 'INACTIVE' } });
    expect(renderBannerPlacement(repository.store, created.code)).toBeNull();
    await executeBannerDemoCommand({ operation: 'deletePlacement', id: created.id });
    expect(repository.store.placements).toEqual([]);
    expect(repository.store.layouts).toEqual([]);
    expect(repository.store.banners).toHaveLength(1);
  });
});
