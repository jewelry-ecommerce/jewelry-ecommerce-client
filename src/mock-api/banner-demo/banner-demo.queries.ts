import { CmsDemoError } from '../cms-demo/cms-demo.service';
import type { BannerDemoStore, DemoLayout } from './banner-demo.schema';
export function findPlacement(store: BannerDemoStore, id: string) {
  const placement = store.placements.find(entry => entry.id === id);
  if (!placement) throw new CmsDemoError('PLACEMENT_NOT_FOUND', 'Không tìm thấy vị trí banner.', 404);
  return placement;
}
export function findBanner(store: BannerDemoStore, id: string) {
  const banner = store.banners.find(entry => entry.id === id);
  if (!banner) throw new CmsDemoError('BANNER_NOT_FOUND', 'Không tìm thấy nội dung banner.', 404);
  return banner;
}
export function findLayout(store: BannerDemoStore, placementId: string, id: string) {
  const layout = store.layouts.find(entry => entry.id === id && entry.placementId === placementId);
  if (!layout) throw new CmsDemoError('LAYOUT_NOT_FOUND', 'Không tìm thấy cấu hình banner.', 404);
  return layout;
}
export function enrichLayout(store: BannerDemoStore, layout: DemoLayout) {
  const placement = { ...findPlacement(store, layout.placementId), placementLayouts: [] };
  const relation = { ...layout, placement, items: [] };
  return { ...layout, placement, items: layout.items.map(item => ({
    ...item, layout: relation, banner: { ...findBanner(store, item.bannerId), placementLayoutItems: [] },
  })) };
}
export function listPlacements(store: BannerDemoStore, query: { code?: string; status?: string; search?: string } = {}) {
  const search = query.search?.trim().toLowerCase();
  const list = store.placements.filter(placement =>
    (!query.code || placement.code === query.code) && (!query.status || placement.status === query.status) &&
    (!search || placement.name.toLowerCase().includes(search) || placement.code.toLowerCase().includes(search))
  ).map(placement => ({ ...placement, placementLayouts: [] }));
  return { total: list.length, list };
}
