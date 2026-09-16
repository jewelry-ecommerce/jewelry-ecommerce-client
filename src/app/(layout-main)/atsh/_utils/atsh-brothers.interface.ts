export interface AtshBrotherSpiralCardImage {
  filename: string;
  path: string;
  alt: string;
}

export interface AtshBrotherResponsiveImage {
  mobile: string;
  tablet: string;
  desktop?: string;
}

export type AtshBrotherProductImagePosition = "left" | "right";

/** Showcase trên trang singer — CMS cấu hình slug, ảnh, vị trí, mô tả; tên/giá lấy từ catalog API. */
export interface AtshBrotherProduct {
  productSlug: string;
  image: string;
  imagePosition?: AtshBrotherProductImagePosition;
  /** Mô tả showcase — lấy từ JSON CMS, không lấy từ catalog list. */
  shortDescription?: string;
}

export interface AtshBrotherDiscoverSection {
  title?: string;
  cards?: AtshBrothersDiscoverCard[];
}

export interface AtshBrotherContent {
  pageTitle: string;
  introDescription: string;
  fullLookTitle: string;
  fullLookDescription: string;
  galleryTitle: string;
  galleryDescription: string;
}

export interface AtshBrotherRoutes {
  /**
   * Path trang chi tiết anh trai (Landing) — giữ trong JSON dù đang ẩn.
   * Dùng khi `ATSH_SPIRAL_CARD_NAV_TARGET === "singer"`.
   */
  singerPage?: string;
  /**
   * Path trang BST riêng từng anh trai (WebClient) — CMS/editor tự nhập.
   * Dùng khi `ATSH_SPIRAL_CARD_NAV_TARGET === "collection"`.
   * Có thể là path (`/san-pham/...`) hoặc full URL (FE sẽ strip origin).
   */
  collectionPage?: string;
  spiralSection?: string;
}

export interface AtshBrotherRecord {
  id: number;
  /**
   * URL slug — CMS editor có thể đổi.
   * Dùng cho route `/atsh/singer/[slug]` và `routes.singerPage`.
   */
  slug: string;
  /**
   * Khoá ổn định map slot spiral + ảnh file — KHÔNG đổi khi slug URL thay đổi.
   * Phải khớp với giá trị trong `ATSH_SPIRAL_BROTHER_SLUG_ORDER`.
   * Fallback (CMS cũ): dùng `slug`.
   */
  spiralKey: string;
  /**
   * Slug collection catalog trên BE — dùng để fetch sản phẩm singer page.
   * Chỉ đổi khi backend đổi tên collection.
   * Fallback (CMS cũ): dùng `spiralKey`.
   */
  collectionSlug?: string;
  displayName: string;
  /** URL ảnh card do người dùng nhập (không dùng local fallback). */
  cardImage?: string;
  singerName?: string;
  /** Chi tiết singer — optional khi landing chỉ dùng spiral. */
  roles?: string[];
  starName?: string | null;
  images: {
    spiralCard: AtshBrotherSpiralCardImage;
    heroBanner?: AtshBrotherResponsiveImage;
    fullLookImg?: AtshBrotherResponsiveImage;
    gallery?: string[];
    /** Số ảnh gallery: 2 (xếp dọc/2 cột) hoặc 4 (carousel). Khớp độ dài `gallery`. */
    galleryImageCount?: 2 | 4;
  };
  /** Nội dung trang chi tiết singer — optional khi chưa bật trang này. */
  content?: AtshBrotherContent;
  /** Danh sách sản phẩm showcase (section stack trên trang). Full-look carousel vẫn lấy từ API collection. */
  products?: AtshBrotherProduct[];
  /** Slug sản phẩm Mua trọn bộ — CTA PDP + giá từ catalog/products/{slug}. */
  fullLookProductSlug?: string;
  /** Ghi đè section Khám phá thêm riêng cho anh trai; bỏ trống thì dùng meta.sharedContent.discoverCards */
  discoverSection?: AtshBrotherDiscoverSection;
  routes: AtshBrotherRoutes;
  status?: "published" | "draft";
}

export interface AtshBrothersDiscoverCard {
  title: string;
  description: string;
  image: string;
  href: string;
}

/** CTA góc dưới section spiral gallery — CMS cấu hình label + href. */
export interface AtshSpiralProductsCta {
  label?: string;
  href?: string;
}

/** CTA hero "Khám phá ngay" — cùng shape label + href với spiralProductsCta. */
export type AtshExploreCta = AtshSpiralProductsCta;

/** Copy hero landing `/atsh` — chỉ hiện khi CMS có nhập. */
export interface AtshHeroContent {
  /** Dòng title trên (vd. HEARTLOCK x TINH HÀ SAY HI). */
  headline?: string;
  /** Dòng title chính dưới headline. */
  title?: string;
  /** Mô tả / tagline dưới title. */
  description?: string;
}

/** SEO landing — field lấy từ JSON CMS (`meta.seo`). */
export interface AtshLandingSeoMeta {
  title?: string;
  keywords?: string;
  descriptionPreOrder?: string;
  descriptionAfterPreOrder?: string;
  /** ISO 8601 — VD. `2026-09-05T00:00:00+07:00`. */
  preOrderEndsAt?: string;
  /** Ảnh share OG/Twitter — absolute CDN URL hoặc path `/image/...`. */
  imageUrl?: string;
}

/** Một logo collab trên hero — CMS upload `src` + kích thước CSS; thứ tự mảng = trái → phải. */
export interface AtshCollabLogoItem {
  /** Tuỳ chọn — dùng khi debug / analytics (vd. `heartlock`, `atsh`). */
  id?: string;
  /** Path `/image/...` hoặc URL CDN sau khi upload. */
  src: string;
  alt?: string;
  /** Chiều rộng hiển thị desktop (px), vd. HEARTLOCK 232 / Anh Trai Say Hi 240. */
  width: number;
  /** Chiều cao hiển thị desktop (px), vd. HEARTLOCK 121 / Anh Trai Say Hi 192. */
  height: number;
}

/** Asset dùng chung landing — logo hero, spiral, v.v. */
export interface AtshSharedAssets {
  /**
   * Logo collab hero (HEARTLOCK × Anh Trai Say Hi).
   * Thứ tự phần tử = vị trí trái → phải. Đổi chỗ 2 phần tử để swap.
   */
  collabLogos?: AtshCollabLogoItem[];
  /** @deprecated Ưu tiên `collabLogos`. Fallback src khi chưa có mảng. */
  heartlockLogo?: string;
  /** @deprecated Ưu tiên `collabLogos`. Fallback src khi chưa có mảng. */
  atshLogo?: string;
  spiralCenterLogo?: string;
  spiralCardFrame?: string;
}

export interface AtshBrothersMeta {
  /** Meta tags landing `/bst-collab-tinhhasayhi` — title / keywords / description theo thời gian. */
  seo?: AtshLandingSeoMeta;
  /** Logo / asset chung — upload qua CMS JSON. */
  sharedAssets?: AtshSharedAssets;
  sharedContent?: {
    discoverSectionTitle?: string;
    discoverCards?: AtshBrothersDiscoverCard[];
    /**
     * Nút "Xem tất cả sản phẩm" trên hero + section spiral.
     * CMS editor đổi href/label tuỳ ý. Fallback: label mặc định + `/san-pham`.
     */
    spiralProductsCta?: AtshSpiralProductsCta;
    /**
     * Nút "Khám phá ngay" trên hero landing.
     * CMS editor đổi href/label tuỳ ý. Thiếu href thì để rỗng — không fallback spiral.
     */
    exploreCta?: AtshExploreCta;
    /** Title + mô tả hero landing từ CMS. Thiếu thì không hiện. */
    hero?: AtshHeroContent;
  };
}

export interface AtshBrothersData {
  type?: "atsh-brothers";
  meta: AtshBrothersMeta;
  brothers: AtshBrotherRecord[];
}
