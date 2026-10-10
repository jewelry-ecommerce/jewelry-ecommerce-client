import type { BannerItem, BannerPlacement, BannerSlot } from '@/utils/api/banner/banner.interface';
import { MobileOddFullWidthItem } from '@/utils/api/banner/banner.enum';
import { BANNER_DEMO_DEFAULTS } from './banner-demo.constants';
import type { BannerDemoStore, DemoBanner } from './banner-demo.schema';
import { readBannerDemoStore } from './banner-demo.repository';
function renderBanner(banner: DemoBanner): BannerItem {
  return {
    id: banner.id, internal_name: banner.internalName, media_type: banner.mediaType,
    media_url: banner.mediaUrl || '', media_mobile_url: banner.mediaMobileUrl || '',
    media_poster_url: banner.mediaPosterUrl, media_mobile_poster_url: banner.mediaMobilePosterUrl,
    media_link_url: banner.mediaLinkUrl, overlay_opacity: banner.overlayOpacity, status: banner.status,
    title: banner.title, subtitle: banner.subtitle, title_color: banner.titleColor, layout: banner.layout,
    actions_layout: banner.actionsLayout, actions: (banner.actions || []).map(action => ({
      action_type: action.actionType || 'URL', action_target: action.actionTarget,
      cta_text: action.ctaText || '', cta_bg: action.ctaBg || BANNER_DEMO_DEFAULTS.ctaBackground,
      cta_color: action.ctaColor || BANNER_DEMO_DEFAULTS.ctaColor,
    })),
  };
}
export function renderBannerPlacement(store: BannerDemoStore, code: string): BannerPlacement | null {
  const placement = store.placements.find(entry => entry.code === code && entry.status === 'ACTIVE');
  if (!placement) return null;
  const layout = store.layouts.filter(entry => entry.placementId === placement.id && entry.status === 'ACTIVE')
    .sort((left, right) => right.revision - left.revision)[0];
  if (!layout) return null;
  const slots: BannerSlot[] = layout.items.filter(entry => entry.isActive).flatMap(entry => {
    const banner = store.banners.find(candidate => candidate.id === entry.bannerId && candidate.status === 'ACTIVE');
    if (!banner?.mediaUrl?.trim()) return [];
    const position = entry.displayMetadata || { x: 0, y: 0, width: 1, height: 1, order: 1 };
    return [{ id: entry.id, slot_key: entry.slotKey, slot_type: 'SINGLE_IMAGE' as const,
      layout_metadata: position, banners: [{ order_index: position.order || 1, banner: renderBanner(banner) }] }];
  });
  const settings = placement.settings || {};
  return { id: placement.id, code: placement.code, name: placement.name, type: placement.displayType,
    settings: { columns: typeof settings.columns === 'number' ? settings.columns : BANNER_DEMO_DEFAULTS.columns,
      rows: typeof settings.rows === 'number' ? settings.rows : BANNER_DEMO_DEFAULTS.rows,
      gap: typeof settings.gap === 'number' ? settings.gap : BANNER_DEMO_DEFAULTS.gap,
      mobileOddFullWidthItem: settings.mobileOddFullWidthItem === 'FIRST' ? MobileOddFullWidthItem.FIRST : MobileOddFullWidthItem.LAST },
    slots };
}
export async function findBannerDemoPlacement(code: string): Promise<BannerPlacement | null> {
  return renderBannerPlacement(await readBannerDemoStore(), code);
}
