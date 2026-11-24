/** Catalog đồ án: SPU theo bộ ảnh unique (không share). SKU: màu Bạc + size 8/10/12/14/16. */

export const THESIS_POLICY = {
  namespace: 'jewelry-thesis-2026',
  prefix: 'JEW-',
  confirm: 'CREATE_THESIS_CATALOG_120',
  rebuildConfirm: 'REBUILD_UNIQUE_CATALOG',
  inventory: 24,
  timeout: 60000,
  catalogTake: 500,
  priceStep: 45000,
  variantPriceStep: 10000,
  heroCode: 'JEW_HOME_HERO',
  storiesCode: 'JEW_HOME_STORIES',
  listingCode: 'JEW_PRODUCT_HERO',
  collectionHeroCode: 'JEW_COLLECTION_HERO',
  blackFridayHeroCode: 'JEW_BF_HERO',
  bestSellerGridCode: 'JEW_BEST_SELLER_GRID',
  materialPrimary: 'Bạc 925',
  materialAlloy: 'Hợp kim cao cấp phủ bạc',
  color: 'Bạc',
  sizes: ['8', '10', '12', '14', '16'],
  imagesPerSpu: 4,
  attribute: {
    name: 'Màu kim loại',
    code: 'JEW_METAL_COLOR',
    type: 'SELECT',
    displayType: 'TEXT',
    status: 'ACTIVE',
    options: ['Bạc'],
  },
  sizeAttribute: {
    name: 'Kích cỡ',
    code: 'JEW_SIZE',
    type: 'SELECT',
    displayType: 'TEXT',
    status: 'ACTIVE',
    options: ['8', '10', '12', '14', '16'],
  },
};

/**
 * Nguồn SPU/ảnh thực tế: `.demo-data/spu-image-sets.json` (Heartlock public + local unique).
 * Số SPU mỗi danh mục = số bộ ảnh riêng — không ép 20 nếu thiếu ảnh.
 */
export const THESIS_GROUP_META = [
  { code: 'RING', slug: 'nhan', name: 'Nhẫn', folder: 'nhan', basePrice: 690000, unit: 'EACH', seoPrefix: 'Nhẫn bạc' },
  { code: 'NECKLACE', slug: 'day-chuyen', name: 'Dây chuyền', folder: 'day-chuyen', basePrice: 990000, unit: 'EACH', seoPrefix: 'Dây chuyền bạc' },
  { code: 'BRACELET', slug: 'vong-tay', name: 'Vòng tay', folder: 'vong-tay', basePrice: 890000, unit: 'EACH', seoPrefix: 'Vòng tay bạc' },
  { code: 'EARRING', slug: 'khuyen-tai', name: 'Khuyên tai', folder: 'khuyen-tai', basePrice: 590000, unit: 'PAIR', seoPrefix: 'Khuyên tai bạc' },
  { code: 'BANGLE', slug: 'lac-tay', name: 'Lắc tay', folder: 'lac-tay', basePrice: 790000, unit: 'EACH', seoPrefix: 'Lắc tay bạc' },
  { code: 'CHARM', slug: 'charm', name: 'Charm', folder: 'charm', basePrice: 390000, unit: 'EACH', seoPrefix: 'Charm bạc' },
];

/** @deprecated dùng spu-image-sets.json; giữ alias để script cũ không gãy. */
export const THESIS_GROUPS = THESIS_GROUP_META.map((group) => ({ ...group, styles: [] }));

/** Collection đa danh mục — `pick` chọn sản phẩm theo nhóm code trong JEW-*. */
export const THESIS_COLLECTIONS = [
  {
    name: 'Everyday Silver',
    slug: 'everyday-silver',
    image: 'images/banner/double-banner/01.webp',
    blurb: 'Trang sức bạc mỏng nhẹ — đeo mỗi ngày vẫn thanh lịch.',
    pick: ['RING', 'NECKLACE', 'EARRING'],
  },
  {
    name: 'Layered Look',
    slug: 'layered-look',
    image: 'images/banner/product-banner/1.webp',
    blurb: 'Dây chuyền, charm và vòng xếp lớp tạo điểm nhấn.',
    pick: ['NECKLACE', 'CHARM', 'BRACELET'],
  },
  {
    name: 'Statement Cuff',
    slug: 'statement-cuff',
    image: 'images/banner/double-banner/02.webp',
    blurb: 'Cuff, lắc và nhẫn form lớn cho vẻ hiện đại.',
    pick: ['BRACELET', 'BANGLE', 'RING'],
  },
  {
    name: 'CZ Glow',
    slug: 'cz-glow',
    image: 'images/banner/grid-banner/01.png',
    blurb: 'Điểm CZ lấp lánh trên nền bạc 925.',
    pick: ['RING', 'EARRING', 'NECKLACE'],
  },
  {
    name: 'Gift Edit',
    slug: 'gift-edit',
    image: 'images/banner/product-banner/2.webp',
    blurb: 'Gợi ý quà trang sức tinh tế cho người thương.',
    pick: ['NECKLACE', 'EARRING', 'CHARM', 'RING'],
  },
  {
    name: 'Black Friday Picks',
    slug: 'black-friday-picks',
    image: 'images/gallery-image/01.webp',
    blurb: 'Ưu đãi mùa Black Friday — chọn nhanh những món đáng sắm.',
    pick: ['RING', 'NECKLACE', 'BRACELET', 'EARRING', 'BANGLE', 'CHARM'],
  },
  {
    name: 'Best Sellers',
    slug: 'best-sellers',
    image: 'images/gallery-image/02.webp',
    blurb: 'Những thiết kế được yêu thích nhất tuần này.',
    pick: ['RING', 'NECKLACE', 'EARRING', 'BRACELET'],
  },
  // Giữ slug cũ nếu đã seed trước đó
  { name: 'Bạc Tối Giản', slug: 'bac-toi-gian', image: 'images/banner/double-banner/01.webp', blurb: 'Đường nét sạch, dễ xếp lớp mỗi ngày.', pick: ['RING', 'NECKLACE', 'EARRING'] },
  { name: 'Ánh Kim Hiện Đại', slug: 'anh-kim-hien-dai', image: 'images/banner/product-banner/1.webp', blurb: 'Hình khối mạnh, hợp kim phủ bạc.', pick: ['BRACELET', 'BANGLE', 'RING'] },
  { name: 'CZ Lấp Lánh', slug: 'cz-lap-lanh', image: 'images/banner/double-banner/02.webp', blurb: 'Điểm CZ tinh tế trên nền bạc 925.', pick: ['RING', 'EARRING', 'CHARM'] },
  { name: 'Quà Tặng Thanh Lịch', slug: 'qua-tang-thanh-lich', image: 'images/banner/grid-banner/01.png', blurb: 'Gợi ý món quà bạc cho người thương.', pick: ['NECKLACE', 'EARRING', 'CHARM'] },
];

export const THESIS_INFORMATION = [
  {
    title: 'Bạc 925 chuẩn',
    description: 'Chất liệu bạc 925 và hợp kim phủ bạc — sáng bóng, dịu da, dễ phối đồ.',
    image: 'images/info-card/01.webp',
  },
  {
    title: 'Phối set theo mood',
    description: 'Nhẫn, dây, vòng, khuyên, lắc và charm — ghép set riêng chỉ trong vài phút.',
    image: 'images/info-card/02.png',
  },
  {
    title: 'Bảo quản dễ dàng',
    description: 'Giữ khô, tránh hóa chất, lau nhẹ bằng khăn mềm sau khi đeo.',
    image: 'images/info-card/03.webp',
  },
];

const seoImage = (path) => path;

export const THESIS_CMS_PAGES = [
  {
    slug: 'trang-chu',
    name: 'Trang chủ',
    seo: {
      title: 'Heartlock — Trang sức bạc tinh tế mỗi ngày',
      description: 'Khám phá nhẫn, dây chuyền, vòng tay, khuyên tai, lắc tay và charm bạc 925. Giao hàng nhanh, đổi trả dễ dàng.',
      keywords: 'trang sức bạc, bạc 925, nhẫn bạc, dây chuyền bạc, khuyên tai bạc, Heartlock',
      image: 'images/banner/grid-banner/01.png',
    },
  },
  {
    slug: 'san-pham',
    name: 'Sản phẩm',
    seo: {
      title: 'Tất cả trang sức bạc | Heartlock',
      description: 'Danh mục trang sức bạc 925 đầy đủ — lọc theo danh mục, bộ sưu tập và kích cỡ.',
      keywords: 'mua trang sức bạc, danh mục bạc 925, trang sức online',
      image: 'images/banner/product-banner/1.webp',
    },
  },
  {
    slug: 'bo-suu-tap',
    name: 'Bộ sưu tập',
    seo: {
      title: 'Bộ sưu tập trang sức bạc | Heartlock',
      description: 'Everyday Silver, Layered Look, CZ Glow và Gift Edit — chọn mood phù hợp với bạn.',
      keywords: 'bộ sưu tập bạc, everyday silver, layered jewelry',
      image: 'images/banner/double-banner/01.webp',
    },
  },
  {
    slug: 'black-friday',
    name: 'Black Friday',
    seo: {
      title: 'Black Friday — Ưu đãi trang sức bạc | Heartlock',
      description: 'Săn deal Black Friday với trang sức bạc 925. Chọn món bạn thích hoặc xem thêm toàn bộ ưu đãi.',
      keywords: 'black friday trang sức, sale bạc 925, ưu đãi trang sức',
      image: 'images/gallery-image/01.webp',
    },
  },
  {
    slug: 'best-seller',
    name: 'Best Seller',
    seo: {
      title: 'Best Seller — Trang sức được yêu thích | Heartlock',
      description: 'Những thiết kế bán chạy nhất: nhẫn, dây chuyền, khuyên tai và vòng tay bạc 925.',
      keywords: 'best seller trang sức, trang sức bán chạy, bạc 925 hot',
      image: 'images/gallery-image/02.webp',
    },
  },
  {
    slug: 'bst-bac-toi-gian',
    name: 'BST Bạc Tối Giản',
    seo: {
      title: 'BST Bạc Tối Giản | Heartlock',
      description: 'Đường nét sạch, form mỏng — trang sức bạc tối giản cho mọi outfit.',
      keywords: 'bạc tối giản, minimal silver jewelry',
      image: 'images/banner/double-banner/01.webp',
    },
  },
  {
    slug: 'bst-anh-kim-hien-dai',
    name: 'BST Ánh Kim Hiện Đại',
    seo: {
      title: 'BST Ánh Kim Hiện Đại | Heartlock',
      description: 'Form lớn, ánh kim mạnh mẽ — dành cho look hiện đại và cá tính.',
      keywords: 'trang sức hiện đại, statement silver',
      image: 'images/banner/product-banner/1.webp',
    },
  },
  {
    slug: 'bst-cz-lap-lanh',
    name: 'BST CZ Lấp Lánh',
    seo: {
      title: 'BST CZ Lấp Lánh | Heartlock',
      description: 'Điểm CZ tinh tế trên nền bạc 925 — đủ sáng cho ngày thường lẫn dịp đặc biệt.',
      keywords: 'trang sức CZ, bạc đính đá',
      image: 'images/banner/double-banner/02.webp',
    },
  },
  {
    slug: 'cam-hung-toi-gian',
    name: 'Cảm hứng tối giản',
    seo: {
      title: 'Cảm hứng tối giản với trang sức bạc | Heartlock',
      description: 'Gợi ý phối đồ với trang sức bạc mảnh — sạch sẽ, thanh lịch, dễ đeo mỗi ngày.',
      keywords: 'phối đồ trang sức bạc, minimal jewelry look',
      image: 'images/gallery-image/03.webp',
    },
  },
  {
    slug: 'cam-hung-hien-dai',
    name: 'Cảm hứng hiện đại',
    seo: {
      title: 'Cảm hứng hiện đại với trang sức bạc | Heartlock',
      description: 'Hoop, cuff và nhẫn form lớn — tạo điểm nhấn hiện đại cho set đồ của bạn.',
      keywords: 'hoop bạc, cuff bạc, statement jewelry',
      image: 'images/gallery-image/04.webp',
    },
  },
];

export { seoImage };
