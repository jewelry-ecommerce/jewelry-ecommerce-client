import { BannerLayout, MediaType, MobileOddFullWidthItem } from "./banner.enum";

export interface LayoutMetadata {
  order: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface BannerAction {
  action_type: string;
  action_target?: string;
  cta_text: string;
  cta_bg: string;
  cta_color: string;
}

export interface BaseBannerItem {
  id: string;
  internal_name: string;
  media_type: MediaType;
  media_url: string;
  media_mobile_url: string;
  media_poster_url?: string | null;
  media_mobile_poster_url?: string | null;
  overlay_opacity: number;
  status: string;
}

export interface BannerCollectionItem extends BaseBannerItem {
  title: string;
  subtitle: string;
  title_color: string;
  layout?: BannerLayout;
  actions_layout?: "STACK" | "ROW" | "INLINE";
  actions: BannerAction[];
  duration?: number;
}

export interface RegularBannerItem extends BaseBannerItem {
  media_link_url?: string | null;
  title?: string;
  subtitle?: string;
  title_color?: string;
  layout?: BannerLayout;
  actions_layout?: "STACK" | "ROW" | "INLINE";
  actions?: BannerAction[];
  action_type?: string;
  action_target?: string;
  cta_text?: string;
  cta_bg?: string;
  cta_color?: string;
}

export type BannerItem = RegularBannerItem;

export type SlotType = "SINGLE_IMAGE" | "MULTIPLE_IMAGE";

export interface BannerSlot<T = BannerItem> {
  id: string;
  slot_key: string;
  slot_type: SlotType;
  layout_metadata: any;
  banners: {
    order_index: string | number;
    banner: T;
  }[];
}

export interface BannerPlacement<T = BannerItem> {
  id: string;
  code: string;
  name: string;
  type: string;
  settings?: {
    columns?: number;
    rows?: number;
    gap?: number;
    mobileOddFullWidthItem?: MobileOddFullWidthItem;
  } | null;
  slots: BannerSlot<T>[];
}

export type ProductListBannerConditionType = "CATEGORY" | "CMS_STOREFRONT";
export type ProductListBannerActionType = "LINK_URL" | "MIX_MATCH";

export interface ProductListBannerMixMatchSku {
  variationId?: string;
  sortOrder?: number;
}

export interface ProductListBannerStorefrontItem {
  id?: string;
  enabled?: boolean;
  imageUrl?: string;
  startTime?: string;
  endTime?: string;
  actionType?: ProductListBannerActionType;
  actionUrl?: string;
  openInNewTab?: boolean;
  mixMatchSkus?: ProductListBannerMixMatchSku[];
  conditionType: ProductListBannerConditionType;
  targetSlug: string;
  targetName?: string;
}

export interface ProductListBannerStorefrontResponse {
  contextSlug: string | null;
  source: ProductListBannerConditionType | "ALL_CATEGORY" | "NONE";
  banners: ProductListBannerStorefrontItem[];
}
