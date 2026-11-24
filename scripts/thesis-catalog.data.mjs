/** Catalog đồ án: 6 danh mục × 20 SPU, bạc/hợp kim only. Mã JEW-* chuyên nghiệp (không CLOUD-). */

export const THESIS_POLICY = {
  namespace: 'jewelry-thesis-2026',
  prefix: 'JEW-',
  confirm: 'CREATE_THESIS_CATALOG_120',
  inventory: 24,
  timeout: 60000,
  catalogTake: 500,
  priceStep: 45000,
  variantPriceStep: 80000,
  heroCode: 'JEW_HOME_HERO',
  storiesCode: 'JEW_HOME_STORIES',
  listingCode: 'JEW_PRODUCT_HERO',
  collectionHeroCode: 'JEW_COLLECTION_HERO',
  materialPrimary: 'Bạc 925',
  materialAlloy: 'Hợp kim cao cấp phủ bạc',
  attribute: {
    name: 'Màu kim loại',
    code: 'JEW_METAL_COLOR',
    type: 'SELECT',
    displayType: 'TEXT',
    status: 'ACTIVE',
    options: ['Bạc', 'Bạc xám', 'Hợp kim bạc'],
  },
};

/** Tên mẫu theo nghiên cứu PNJSilver / Pandora style naming (bạc), không copy mã thương mại. */
const RING_NAMES = [
  'Khối Tròn Tối Giản', 'Vân Sóng Nhẹ', 'Đá CZ Giọt Sương', 'Band Mảnh Hằng Ngày', 'Halo Tròn Nhẹ',
  'Geometric Line', 'Twist Đôi Thanh Lịch', 'Open Band Hiện Đại', 'Signet Oval Bạc', 'Stackable Slim',
  'Petal Edge', 'Moon Phase', 'Ribbon Knot', 'Bezel Mini CZ', 'Satin Finish',
  'Hammered Texture', 'Infinity Curve', 'Crown Mini', 'Aurora Line', 'Quiet Luxe',
];

const NECKLACE_NAMES = [
  'Dây Mảnh Box Chain', 'Mặt Tròn Khắc Chìm', 'Layering 2 Dây', 'Mặt Oval Satin', 'Cable Chain 45cm',
  'Mặt Trái Tim Bạc', 'Bar Pendant Dọc', 'Coin Pendant', 'Paperclip Chain', 'Snake Chain Mảnh',
  'Mặt Ngôi Sao CZ', 'Pearl Accent Alloy', 'Lariat Thanh Lịch', 'Choker Soft Curve', 'Figaro Mini',
  'Mặt Initial Disk', 'Y-Necklace CZ', 'Cuban Slim', 'Pendant Drop', 'Station Chain',
];

const BRACELET_NAMES = [
  'Cuff Mở Tối Giản', 'Bangle Tròn Đặc', 'Chain Bracelet Box', 'Tennis CZ Mini', 'Cuff Khắc Line',
  'Bangle Đôi Layer', 'Charm Ready Chain', 'Rope Bracelet', 'ID Plate Bracelet', 'Bead Smooth',
  'Cuff Organic Edge', 'Link Bracelet Flat', 'Snap Bangle', 'Mesh Soft Band', 'Bar Accent Cuff',
  'Twist Bangle', 'Open Oval Cuff', 'Satellite Chain', 'Stack Slim Set', 'Lock Motif',
];

const EARRING_NAMES = [
  'Stud Tròn Mini', 'Hoop Mảnh 2cm', 'Drop Giọt Nước', 'Huggie Khóa Êm', 'Stud CZ Halo',
  'Hoop Oval', 'Threader Dây Mảnh', 'Stud Geometric', 'Drop Bar Dọc', 'Cluster Mini CZ',
  'Hoop Twisted', 'Stud Pearl Alloy', 'Ear Cuff Không Lỗ', 'Drop Leaf', 'Hoop Thick Mini',
  'Stud Hexagon', 'Chandelier Mini', 'Stud Heart Outline', 'Drop Chain', 'Hoop Hinge',
];

const BANGLE_NAMES = [
  'Lắc Mắt Xích Box', 'Lắc Tennis CZ', 'Lắc Charm Base', 'Lắc Plate Khắc', 'Lắc Snake Mảnh',
  'Lắc Figaro', 'Lắc Đôi Layer', 'Lắc Bead Bạc', 'Lắc Paperclip', 'Lắc Rope',
  'Lắc ID Bar', 'Lắc Mesh', 'Lắc Cuban Slim', 'Lắc Satellite', 'Lắc Twist',
  'Lắc Open Cuff Soft', 'Lắc Lock Motif', 'Lắc Station', 'Lắc Organic Link', 'Lắc Quiet Chain',
];

const CHARM_NAMES = [
  'Charm Tim Outline', 'Charm Ngôi Sao', 'Charm Moon', 'Charm Key Mini', 'Charm Flower CZ',
  'Charm Letter Disk', 'Charm Butterfly', 'Charm Clover', 'Charm Anchor', 'Charm Spark CZ',
  'Charm Book', 'Charm Music Note', 'Charm Paw', 'Charm Shell', 'Charm Crown',
  'Charm Infinity', 'Charm Sun', 'Charm Feather', 'Charm Lock', 'Charm Smile',
];

function styles(names) {
  return names.map((name, index) => ({
    name,
    styleIndex: (index % 10) + 1,
    skuCount: index % 3 === 0 ? 3 : 2,
    imageCount: index % 2 === 0 ? 3 : 2,
  }));
}

export const THESIS_GROUPS = [
  { code: 'RING', slug: 'nhan', name: 'Nhẫn', folder: 'nhan', basePrice: 690000, unit: 'EACH', styles: styles(RING_NAMES) },
  { code: 'NECKLACE', slug: 'day-chuyen', name: 'Dây chuyền', folder: 'day-chuyen', basePrice: 990000, unit: 'EACH', styles: styles(NECKLACE_NAMES) },
  { code: 'BRACELET', slug: 'vong-tay', name: 'Vòng tay', folder: 'vong-tay', basePrice: 890000, unit: 'EACH', styles: styles(BRACELET_NAMES) },
  { code: 'EARRING', slug: 'khuyen-tai', name: 'Khuyên tai', folder: 'khuyen-tai', basePrice: 590000, unit: 'PAIR', styles: styles(EARRING_NAMES) },
  { code: 'BANGLE', slug: 'lac-tay', name: 'Lắc tay', folder: 'lac-tay', basePrice: 790000, unit: 'EACH', styles: styles(BANGLE_NAMES) },
  { code: 'CHARM', slug: 'charm', name: 'Charm', folder: 'charm', basePrice: 390000, unit: 'EACH', styles: styles(CHARM_NAMES) },
];

export const THESIS_COLLECTIONS = [
  { name: 'Bạc Tối Giản', slug: 'bac-toi-gian', image: 'images/banner/double-banner/01.webp', blurb: 'Đường nét sạch, dễ xếp lớp mỗi ngày.' },
  { name: 'Ánh Kim Hiện Đại', slug: 'anh-kim-hien-dai', image: 'images/banner/product-banner/1.webp', blurb: 'Hình khối mạnh, hợp kim phủ bạc.' },
  { name: 'CZ Lấp Lánh', slug: 'cz-lap-lanh', image: 'images/banner/double-banner/02.webp', blurb: 'Điểm CZ tinh tế trên nền bạc 925.' },
  { name: 'Quà Tặng Thanh Lịch', slug: 'qua-tang-thanh-lich', image: 'images/banner/grid-banner/01.png', blurb: 'Gợi ý món quà bạc cho người thương.' },
];

export const THESIS_INFORMATION = [
  { title: 'Chỉ bạc & hợp kim', description: 'Toàn bộ mặt hàng đồ án dùng bạc 925 hoặc hợp kim phủ bạc — không có vàng.', image: 'images/info-card/01.webp' },
  { title: 'Phối theo phong cách', description: 'Chọn nhẫn, dây, vòng, khuyên, lắc và charm để dựng set riêng.', image: 'images/info-card/02.png' },
  { title: 'Bảo quản đơn giản', description: 'Giữ khô, tránh hóa chất, lau nhẹ bằng khăn mềm sau khi đeo.', image: 'images/info-card/03.webp' },
];

/** Trang CMS lấy cảm hứng cấu trúc Sevatrading staging (không dùng ảnh Seva). */
export const THESIS_CMS_PAGES = [
  {
    slug: 'trang-chu',
    name: 'Trang chủ',
    seo: { title: 'Jewelry Ecommerce — Trang sức bạc', description: 'Cửa hàng trang sức bạc và hợp kim cho đồ án tốt nghiệp.' },
  },
  {
    slug: 'san-pham',
    name: 'Sản phẩm',
    seo: { title: 'Tất cả sản phẩm bạc', description: 'Nhẫn, dây chuyền, vòng tay, khuyên tai, lắc tay, charm.' },
  },
  {
    slug: 'bo-suu-tap',
    name: 'Bộ sưu tập',
    seo: { title: 'Bộ sưu tập bạc', description: 'Các bộ sưu tập bạc tối giản và hiện đại.' },
  },
  {
    slug: 'bst-bac-toi-gian',
    name: 'BST Bạc Tối Giản',
    seo: { title: 'BST Bạc Tối Giản', description: 'Đường nét sạch trên nền bạc 925.' },
  },
  {
    slug: 'bst-anh-kim-hien-dai',
    name: 'BST Ánh Kim Hiện Đại',
    seo: { title: 'BST Ánh Kim Hiện Đại', description: 'Hình khối mạnh với hợp kim phủ bạc.' },
  },
  {
    slug: 'bst-cz-lap-lanh',
    name: 'BST CZ Lấp Lánh',
    seo: { title: 'BST CZ Lấp Lánh', description: 'Điểm CZ tinh tế cho set hàng ngày.' },
  },
  {
    slug: 'cam-hung-toi-gian',
    name: 'Cảm hứng tối giản',
    seo: { title: 'Cảm hứng tối giản', description: 'Gợi ý phối đồ với trang sức bạc mảnh.' },
  },
  {
    slug: 'cam-hung-hien-dai',
    name: 'Cảm hứng hiện đại',
    seo: { title: 'Cảm hứng hiện đại', description: 'Phom lớn, cuff và hoop cho look hiện đại.' },
  },
];
