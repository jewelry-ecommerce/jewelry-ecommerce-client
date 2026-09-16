import { MediaType } from "@/utils/api/banner/banner.enum";
import { ActionType, AnimationType, BlockTypeCode } from "./cms.enum";

export type CmsRichTextHtml = string;

export interface Seo {
  title: string | null;
  description: string | null;
  keywords: string | null;
  canonicalUrl: string | null;
  imageUrl?: string | null;
}

export interface Page {
  id: string;
  name: string;
  slug: string;
  locale: string;
  seo: Seo;
}

export interface Layout {
  id: string;
  name: string;
  targetDevice: string;
  versionId: string;
  versionName: string;
}

export interface BlockItem {
  id?: string;
  text?: string;
  imageUrl?: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  mediaType?: MediaType;
  title?: string;
  description?: string;
  actionLabel?: string;
  actionText?: string;
  actionType?: ActionType | "LINK_URL" | "MIX_MATCH";
  actionUrl?: string;
  mixMatchSkus?: ProductListMixMatchSkuConfig[];
  label?: string;
}

export interface ProductListMixMatchSkuConfig {
  variationId?: string;
  slug?: string;
  skuCode?: string;
  name?: string;
  imageUrl?: string;
  compareAtPriceAfterTaxMinor?: number;
  sellingPriceAfterTaxMinor?: number;
  sortOrder?: number;
}

export interface ProductListInterleavedBannerConfig {
  id?: string;
  enabled?: boolean;
  bannerType?: "CAROUSEL";
  imageUrl?: string;
  startTime?: string;
  endTime?: string;
  actionType?: "LINK_URL" | "MIX_MATCH";
  actionUrl?: string;
  openInNewTab?: boolean;
  mixMatchSkus?: ProductListMixMatchSkuConfig[];
}

export interface ProductListInterleavedBannerRuleConfig {
  inheritFromParent?: boolean;
  items?: ProductListInterleavedBannerConfig[];
}

export interface ProductListInterleavedBannerCategoryRuleConfig extends ProductListInterleavedBannerRuleConfig {
  id?: string;
  categoryId?: string;
  categorySlug?: string;
  categoryName?: string;
  categoryPathSlugs?: string[];
}

export interface BlockConfig {
  settings?: {
    isClosable?: boolean;
    animationType?: AnimationType;
    animationSpeed?: number;
    backgroundColor?: string;
    textColor?: string;
  };
  badge?: {
    text?: string;
    textColor?: string;
    backgroundColor?: string;
    actionType?: ActionType;
    actionUrl?: string;
  };
  items?: BlockItem[];
  header?: {
    title: string;
    subtitle: string;
  };
  seeMore?: {
    enabled?: boolean;
    text?: string;
    url?: string;
  };
  display?: {
    limit?: number;
    columns?: number;
    layoutStyle?: string;
  };
  dataSource?: {
    filterType?:
      | "NONE"
      | "CATEGORY"
      | "COLLECTION"
      | "CAMPAIGN"
      | "NEW_ARRIVALS"
      | "BEST_SELLERS"
      | "MOST_FAVORITED"
      | "MANUAL_PRODUCTS"
      | "CMS_STOREFRONT";
    categoryId?: string;
    categorySlugs?: string[];
    sort?: string;
    collectionId?: string;
    collectionSlug?: string;
    campaignId?: string;
    productIds?: string[];
    cmsPageId?: string;
    cmsPageSlug?: string;
    cmsPageName?: string;
  };
  productDataSource?: {
    filterType?: "ALL_PRODUCTS" | "COLLECTION" | "PROMOTION";
    sort?: string;
    collectionId?: string;
    collectionSlug?: string;
  };
  /** Chuỗi mã placement; API lỗi có thể trả object rỗng — FE chỉ gọi banner khi là string không rỗng. */
  placementCode?: string | Record<string, unknown>;
  /** NEWSLETTER_SIGNUP — tiêu đề khối đăng ký nhận tin. */
  heading?: string;
  /** NEWSLETTER_SIGNUP — nhãn checkbox đồng ý chính sách. */
  consentText?: string;
  title?: string;
  /** HTML rich text (CKEditor) — dùng bởi PRODUCT_EXPANDABLE_DESCRIPTION. */
  description?: CmsRichTextHtml;
  maxCollapsedLines?: number;
  tags?: Array<{ text?: string; actionUrl?: string } | string>;
  interleavedBanners?: {
    /** Legacy top-level fields from the first PRODUCT_LIST banner version. */
    inheritFromParent?: boolean;
    items?: ProductListInterleavedBannerConfig[];
    defaultRule?: ProductListInterleavedBannerRuleConfig;
    categoryRules?: ProductListInterleavedBannerCategoryRuleConfig[];
  };
  /** JSON_DISPLAY — nội dung JSON tuỳ chỉnh (vd. atsh-brothers). */
  jsonContent?: string;
}

export interface ProductExpandableDescriptionBlockConfig extends Pick<
  BlockConfig,
  "title" | "description" | "maxCollapsedLines" | "header"
> {}

export interface TextBlockConfig extends Pick<BlockConfig, "title"> {
  content?: CmsRichTextHtml;
}

export interface Block {
  id: string;
  blockTypeCode: BlockTypeCode;
  sortOrder: number;
  config: BlockConfig;
  targetSegment: string | null;
}

export interface PageResponse {
  page: Page;
  layout: Layout;
  blocks: Block[];
}

export interface StorefrontSitemapPage {
  slug: string;
  locale: string;
  updatedAt: string;
  canonicalUrl?: string | null;
}

export interface StorefrontSitemapResponse {
  pages: StorefrontSitemapPage[];
}

export interface TopBannerResponse {
  bannerName: string;
  bannerDisplayStyle: string;
  bannerContent: string | null;
  bannerBgColor: string;
  bannerTextColor: string;
  bannerTargetUrl: string;
  bannerAnimationStyle: string;
  bannerLoopIntervalSec: number;
  bannerStartTime: string;
  bannerEndTime: string | null;
}

export type LogoType = "HEADER" | "FOOTER" | "AUTH" | "FAVICON";

export const LOGO_TYPES: LogoType[] = ["HEADER", "FOOTER", "AUTH", "FAVICON"];

export type StorefrontLogoSrcMap = Record<LogoType, string>;

export interface StorefrontLogoResponse {
  logoUrl: string;
  logoTheme?: string | null;
  logoTargetUrl?: string | null;
}

export type StorefrontLogosResponse = Partial<Record<LogoType, StorefrontLogoResponse>>;

export interface StorefrontFooterMenuItem {
  label: string;
  url: string;
  orderIndex: number;
}

export interface StorefrontFooterMenuColumn {
  title: string;
  orderIndex: number;
  items: StorefrontFooterMenuItem[];
}

export interface StorefrontFooterSocialLink {
  platform: string;
  displayName: string;
  url: string;
  image?: string | null;
  orderIndex: number;
}

export interface StorefrontFooterResponse {
  newsletterHeading: string;
  newsletterSubHeading?: string;
  newsletterEmailPlaceholder?: string;
  newsletterButtonText?: string;
  newsletterPrivacyUrl?: string;
  newsletterTermsText?: string;
  copyrightText?: string;
  footerLogoUrl?: string;
  certificationImageUrl?: string;
  certificationUrl?: string;
  socialLinks: StorefrontFooterSocialLink[];
  menuColumns: StorefrontFooterMenuColumn[];
}

export interface StorefrontGlobalConfigResponse {
  header: TopBannerResponse | null;
  footer: StorefrontFooterResponse | null;
}

export type StorefrontNavigationType = "NONE" | "CATEGORY" | "PAGE" | "LINK";
export type StorefrontNavigationBadgeDesignType = "TEXT" | "IMAGE";

export type StorefrontNavigationLinkTarget =
  | { kind: "none" }
  | { kind: "category"; targetId: string; url?: string; queryParams?: Record<string, unknown> }
  | { kind: "page"; targetId: string; url?: string; queryParams?: Record<string, unknown> }
  | { kind: "url"; url: string; queryParams?: Record<string, unknown> }
  | { kind: "filter"; queryParams: Record<string, unknown> };

export interface StorefrontNavigationBadge {
  id: string;
  designType: StorefrontNavigationBadgeDesignType;
  displayText: string | null;
  imageUrl: string | null;
  styleConfig: Record<string, unknown>;
  startTime: string;
  endTime: string | null;
}

export interface StorefrontNavigationItem {
  id: string;
  label: string;
  type: StorefrontNavigationType;
  targetId: string | null;
  url: string | null;
  queryParams: Record<string, unknown> | null;
  icon: string | null;
  image: string | null;
  openInNewTab: boolean;
  sortOrder: number;
  parentId: string | null;
  showOnMenuPopup: boolean;
  showOnPlp: boolean;
  linkTarget: StorefrontNavigationLinkTarget;
  badge: StorefrontNavigationBadge | null;
  hasChildren: boolean;
  expandOnly: boolean;
  viewAllLabel: string | null;
  parentEffectivelyHidden: boolean;
  children: StorefrontNavigationItem[];
}

export interface StorefrontNavigationResponse {
  items: StorefrontNavigationItem[];
}

export interface StorefrontNavigationPlpRailParams {
  categoryId?: string | null;
  rootTargetId?: string | null;
  rootUrl?: string | null;
}
