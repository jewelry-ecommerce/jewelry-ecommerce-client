/**
 * Seed catalog đồ án lên API (cloud/local):
 * - Gỡ CLOUD26-* khỏi storefront (unpublish + discontinue)
 * - 6 danh mục × 20 SPU, 2–3 SKU, 2–3 ảnh/SKU, chỉ bạc/hợp kim, mã JEW-*
 * - CMS pages theo cấu trúc Seva staging (không dùng ảnh Seva)
 *
 * ENV (không commit):
 *   JEWELRY_DEMO_CONFIRM=CREATE_THESIS_CATALOG_120
 *   JEWELRY_DEMO_API_URL=https://jewelry-ecommerce-be-java.onrender.com/api/v1
 *   JEWELRY_DEMO_PHONE=...
 *   JEWELRY_DEMO_PASSWORD=...
 */
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { api, login, numericId, thesisBlock, upload, verifyThesisTarget } from './thesis-catalog.api.mjs';
import {
  THESIS_CMS_PAGES,
  THESIS_COLLECTIONS,
  THESIS_GROUPS,
  THESIS_INFORMATION,
  THESIS_POLICY,
} from './thesis-catalog.data.mjs';

verifyThesisTarget();
const downloadScript = fileURLToPath(new URL('./download-thesis-product-images.mjs', import.meta.url));
const download = spawnSync(process.execPath, [downloadScript], { stdio: 'inherit', windowsHide: true });
assert.equal(download.status, 0, 'download-thesis-product-images failed');
await login();

const existingProducts = (await api('admin/catalog/products?take=' + THESIS_POLICY.catalogTake)).content ?? [];
const existingCategories = await api('admin/catalog/categories');
const attributes = await api('admin/catalog/attributes');

async function retireLegacyCloudProducts() {
  const legacy = existingProducts.filter((product) => String(product.code || '').startsWith('CLOUD26-'));
  for (const product of legacy) {
    try { await api('admin/catalog/products/' + product.id + '/unpublish', 'PATCH'); } catch { /* already off */ }
    try { await api('admin/catalog/products/' + product.id + '/discontinue', 'PATCH'); } catch { /* ignore */ }
  }
  process.stdout.write('RETIRED_CLOUD26=' + legacy.length + '\n');
}

await retireLegacyCloudProducts();

const color = attributes.find((attribute) => attribute.code === THESIS_POLICY.attribute.code)
  ?? await api('admin/catalog/attributes', 'POST', THESIS_POLICY.attribute);

const products = [];
const categories = [];

async function ensureCategory(group) {
  const code = THESIS_POLICY.prefix + group.code;
  const existing = existingCategories.find((category) => category.code === code || category.slug === group.slug);
  const imageUrl = await upload('images/product/' + group.folder + '/' + group.folder + '-1.1.jpg');
  if (existing) {
    await api('admin/catalog/categories/' + existing.id, 'PUT', {
      name: group.name,
      slug: group.slug,
      code,
      status: 'ACTIVE',
      directAttributeIds: [numericId(color.id)],
      imageUrl,
    }).catch(() => existing);
    return api('admin/catalog/categories').then((rows) => rows.find((row) => row.code === code) ?? existing);
  }
  return api('admin/catalog/categories', 'POST', {
    name: group.name,
    slug: group.slug,
    code,
    status: 'ACTIVE',
    directAttributeIds: [numericId(color.id)],
    imageUrl,
  });
}

function materialFor(index) {
  return index % 4 === 0 ? THESIS_POLICY.materialAlloy : THESIS_POLICY.materialPrimary;
}

async function ensureProduct(group, category, style, index) {
  const code = THESIS_POLICY.prefix + group.code + '-' + String(index + 1).padStart(3, '0');
  const slug = code.toLowerCase();
  const existing = existingProducts.find((product) => product.code === code);
  if (existing) {
    const detail = await api('admin/catalog/products/' + existing.id);
    products.push(detail);
    return detail;
  }

  const styleNo = style.styleIndex;
  const photoIndexes = Array.from({ length: style.imageCount }, (_, shot) => shot + 1);
  const photos = [];
  for (const shot of photoIndexes) {
    photos.push(await upload('images/product/' + group.folder + '/' + group.folder + '-' + styleNo + '.' + shot + '.jpg'));
  }

  const price = group.basePrice + index * THESIS_POLICY.priceStep;
  const fullName = group.name + ' ' + style.name;
  const material = materialFor(index);
  const optionSlice = THESIS_POLICY.attribute.options.slice(0, style.skuCount);

  const product = await api('admin/catalog/products', 'POST', {
    categoryId: numericId(category.id),
    code,
    name: fullName,
    slug,
    shortDescription: fullName + ' — ' + material + ', thiết kế chuyên nghiệp cho đồ án.',
    description: '<p>' + fullName + ' chế tác trên nền ' + material + '. Phù hợp phối set hằng ngày, không phải hàng vàng.</p>',
    material,
    occasion: 'Hằng ngày, quà tặng, sự kiện nhẹ',
    unitOfMeasure: group.unit,
    thumbnailUrl: photos[0],
    metaTitle: fullName,
    metaDescription: 'Mua ' + fullName + ' bạc/hợp kim tại Jewelry Ecommerce.',
    productInfos: [
      { title: 'Thông tin sản phẩm', description: '<p>Mã SPU ' + code + '. Chất liệu ' + material + '. Dữ liệu minh họa đồ án.</p>', sortOrder: 0 },
      { title: 'Bảo quản', description: '<p>Giữ khô ráo, tránh hóa chất, lau nhẹ bằng khăn mềm.</p>', sortOrder: 1 },
    ],
    variants: optionSlice.map((label, variant) => ({
      skuCode: code + '-V' + (variant + 1),
      name: fullName + ' - ' + label,
      material,
      metalColorLabel: label,
      sizeLabel: group.code === 'RING' ? String(12 + (index % 5)) : 'Tiêu chuẩn',
      listPrice: price + variant * THESIS_POLICY.variantPriceStep,
      onHand: THESIS_POLICY.inventory + variant * 2,
      isDefault: variant === 0,
    })),
  });

  for (const [variantIndex, sku] of product.skus.entries()) {
    await api('admin/catalog/products/' + product.id + '/variants/' + sku.id + '/attributes', 'PUT', {
      values: [{ attributeId: numericId(color.id), value: optionSlice[variantIndex] }],
    });
    for (const [sortOrder, url] of photos.entries()) {
      await api('admin/catalog/products/' + product.id + '/media', 'POST', {
        url,
        alt: fullName + ' ảnh ' + (sortOrder + 1),
        skuId: numericId(sku.id),
        type: 'IMAGE',
        sortOrder,
        primary: sortOrder === 0,
      });
    }
  }
  await api('admin/catalog/products/' + product.id + '/publish', 'PATCH');
  const detail = await api('admin/catalog/products/' + product.id);
  products.push(detail);
  return detail;
}

for (const group of THESIS_GROUPS) {
  const category = await ensureCategory(group);
  categories.push(category);
  for (const [index, style] of group.styles.entries()) {
    await ensureProduct(group, category, style, index);
    if ((index + 1) % 5 === 0) process.stdout.write('READY ' + group.code + ' ' + (index + 1) + '/20\n');
  }
}

const collections = [];
const existingCollections = await api('admin/catalog/collections');
for (const [index, definition] of THESIS_COLLECTIONS.entries()) {
  const collection = existingCollections.find((row) => row.slug === definition.slug)
    ?? await api('admin/catalog/collections', 'POST', {
      name: definition.name,
      slug: definition.slug,
      heroImageUrl: await upload(definition.image),
      status: 'PUBLISHED',
      description: definition.blurb,
    });
  const productIds = products.filter((_, position) => position % THESIS_COLLECTIONS.length === index).map((row) => numericId(row.id));
  await api('admin/catalog/collections/' + collection.id + '/products', 'POST', { productIds });
  collections.push(collection);
}

async function ensurePlacement(code, displayType, images) {
  const list = await api('admin/banner/placements?take=100');
  const rows = Array.isArray(list) ? list : list.content ?? list.list ?? [];
  const placement = rows.find((row) => row.code === code)
    ?? await api('admin/banner/placements', 'POST', {
      code,
      name: 'Thesis ' + code,
      displayType,
      platform: 'ALL',
      status: 'ACTIVE',
    });
  const current = await api('storefront/banner/placements/code/' + code + '/render', 'GET', undefined, false);
  if (current?.slots?.some((slot) => slot.banners?.length)) return placement;
  const banners = [];
  for (const [index, image] of images.entries()) {
    banners.push(await api('admin/banner/banners', 'POST', {
      internalName: 'Thesis ' + code + ' ' + index,
      status: 'ACTIVE',
      mediaUrl: await upload(image),
      mediaMobileUrl: await upload(image),
      actionType: 'LINK_URL',
      actionUrl: '/san-pham',
    }));
  }
  await api('admin/banner/placements/' + placement.id + '/layouts', 'POST', {
    name: 'Thesis layout',
    status: 'ACTIVE',
    items: banners.map((banner, index) => ({
      bannerId: numericId(banner.id),
      slotKey: displayType === 'SLIDER' ? 'main' : 'slot-' + index,
      isActive: true,
      priority: index,
      displayMetadata: { slotType: displayType, x: index, y: 0, width: 1, height: 1, order: index },
    })),
  });
  return placement;
}

await ensurePlacement(THESIS_POLICY.heroCode, 'SLIDER', ['images/banner/grid-banner/01.png']);
await ensurePlacement(THESIS_POLICY.storiesCode, 'DOUBLE_BANNER', THESIS_COLLECTIONS.slice(0, 2).map((row) => row.image));
await ensurePlacement(THESIS_POLICY.listingCode, 'SLIDER', ['images/banner/product-banner/1.webp']);
await ensurePlacement(THESIS_POLICY.collectionHeroCode, 'SLIDER', ['images/banner/double-banner/01.webp']);

const showcase = await Promise.all(THESIS_COLLECTIONS.map(async (definition) => ({
  title: definition.name,
  imageUrl: await upload(definition.image),
  actionUrl: '/san-pham?collectionSlug=' + definition.slug,
})));
const cards = await Promise.all(THESIS_INFORMATION.map(async (info) => ({
  ...info,
  imageUrl: await upload(info.image),
  actionText: 'Khám phá',
  actionUrl: '/san-pham',
})));
const gallery = await Promise.all([1, 2, 3, 4].map(async (index) => ({
  imageUrl: await upload('images/gallery-image/0' + index + '.webp'),
  title: 'Lookbook ' + index,
  label: 'JEWELRY',
  actionUrl: '/san-pham',
})));

async function savePage(slug, name, seo, newBlocks) {
  const pages = await api('admin/cms/pages');
  const previous = pages.find((page) => page.slug === slug);
  const preserved = (previous?.blocks ?? [])
    .filter((block) => block.config?.demoNamespace !== THESIS_POLICY.namespace && block.config?.demoNamespace !== 'jewelry-cloud-demo-2026')
    .map((block) => ({ type: block.type ?? block.blockTypeCode, config: block.config, isVisible: block.isVisible ?? block.visible ?? true }));
  const blocks = [...newBlocks, ...preserved].map((block, sortOrder) => ({ ...block, sortOrder }));
  const body = {
    name: previous?.name ?? name,
    slug,
    locale: previous?.locale ?? 'vi-VN',
    isActive: true,
    targetDevice: 'ALL',
    seo: previous?.seo ?? seo,
    blocks,
  };
  const page = await api('admin/cms/pages' + (previous ? '/' + previous.id : ''), previous ? 'PUT' : 'POST', body);
  await api('admin/cms/pages/' + page.id + '/publish', 'POST');
  return page;
}

const homeMeta = THESIS_CMS_PAGES.find((page) => page.slug === 'trang-chu');
const listingMeta = THESIS_CMS_PAGES.find((page) => page.slug === 'san-pham');

const home = await savePage(homeMeta.slug, homeMeta.name, homeMeta.seo, [
  thesisBlock('TOP_LINE_BANNER', {
    settings: { isClosable: true, animationType: 'MARQUEE', animationSpeed: 12, backgroundColor: '#111827', textColor: '#FFFFFF' },
    badge: { text: 'BẠC 925', actionType: 'NONE', backgroundColor: '#F59E0B', textColor: '#111827' },
    items: [
      { text: 'Freeship đơn từ 500K', actionType: 'NONE' },
      { text: 'Chỉ bạc & hợp kim — không vàng', actionType: 'LINK', actionUrl: '/san-pham' },
      { text: 'Đổi trả 7 ngày', actionType: 'NONE' },
    ],
  }),
  thesisBlock('BANNER', { placementCode: THESIS_POLICY.heroCode }),
  thesisBlock('PRODUCT_CAROUSEL', {
    header: { title: 'MỚI VỀ BẠC', subtitle: '120 thiết kế cho hội đồng' },
    display: { limit: 8 },
    dataSource: { filterType: 'MANUAL_PRODUCTS', productIds: products.slice(0, 8).map((row) => String(row.id)) },
    seeMore: { enabled: true, text: 'Xem tất cả', url: '/san-pham' },
  }),
  thesisBlock('BANNER', { placementCode: THESIS_POLICY.storiesCode }),
  thesisBlock('PRODUCT_COLLECTION_SHOWCASE', {
    header: { title: 'BỘ SƯU TẬP', subtitle: 'Tối giản · Hiện đại · CZ' },
    items: showcase.slice(0, 3),
  }),
  thesisBlock('INFO_CARDS', {
    header: { title: 'VÌ SAO CHỌN BẠC', subtitle: 'Rõ ràng cho thầy và hội đồng' },
    display: { columns: 3 },
    items: cards,
  }),
  thesisBlock('CTA_BLOCK', {
    title: 'Khám phá toàn bộ danh mục bạc',
    description: 'Nhẫn · Dây chuyền · Vòng tay · Khuyên tai · Lắc tay · Charm',
    alignment: 'CENTER',
    buttons: [
      { label: 'Xem sản phẩm', url: '/san-pham', textColor: '#FFFFFF', backgroundColor: '#0A0A0A', borderColor: '#0A0A0A', target: '_self' },
      { label: 'Bộ sưu tập', url: '/bo-suu-tap', textColor: '#0A0A0A', backgroundColor: '#FFFFFF', borderColor: '#0A0A0A', target: '_self' },
    ],
    background: { color: '#F8FAFC', borderColor: 'transparent', borderRadius: 24 },
  }),
  thesisBlock('IMAGE_GALLERY', {
    header: { title: 'LOOKBOOK BẠC', subtitle: 'Ảnh minh họa Unsplash — không dùng ảnh Sevatrading' },
    display: { columns: 4 },
    items: gallery,
  }),
  thesisBlock('NEWSLETTER_SIGNUP', {
    heading: 'Đăng ký nhận tin bộ sưu tập bạc mới',
    consentText: 'Bằng cách đăng ký, bạn đồng ý với chính sách bảo mật thông tin.',
  }),
]);

const listing = await savePage(listingMeta.slug, listingMeta.name, listingMeta.seo, [
  thesisBlock('BANNER', { placementCode: THESIS_POLICY.listingCode }),
  thesisBlock('PRODUCT_CATEGORY_NAV', { display: { limit: 6 } }),
  thesisBlock('PRODUCT_LIST', {
    header: { title: 'TẤT CẢ TRANG SỨC BẠC', subtitle: '6 danh mục · ~120 SPU' },
    productDataSource: { filterType: 'ALL_PRODUCTS', sort: 'newest' },
  }),
]);

const collectionHub = THESIS_CMS_PAGES.find((page) => page.slug === 'bo-suu-tap');
await savePage(collectionHub.slug, collectionHub.name, collectionHub.seo, [
  thesisBlock('BANNER', { placementCode: THESIS_POLICY.collectionHeroCode }),
  thesisBlock('PRODUCT_COLLECTION_SHOWCASE', {
    header: { title: 'BỘ SƯU TẬP', subtitle: 'Chọn cảm hứng phù hợp' },
    items: showcase.slice(0, 3),
  }),
  thesisBlock('CTA_BLOCK', {
    title: 'Xem toàn bộ sản phẩm',
    alignment: 'CENTER',
    buttons: [{ label: 'Tới trang sản phẩm', url: '/san-pham', textColor: '#FFFFFF', backgroundColor: '#0A0A0A', borderColor: '#0A0A0A', target: '_self' }],
    background: { color: '#FFFFFF', borderColor: '#E5E7EB', borderRadius: 16 },
  }),
]);

for (const pageMeta of THESIS_CMS_PAGES.filter((page) => page.slug.startsWith('bst-') || page.slug.startsWith('cam-hung-'))) {
  const collection = collections[THESIS_CMS_PAGES.filter((page) => page.slug.startsWith('bst-') || page.slug.startsWith('cam-hung-')).indexOf(pageMeta) % collections.length];
  await savePage(pageMeta.slug, pageMeta.name, pageMeta.seo, [
    thesisBlock('BANNER', { placementCode: THESIS_POLICY.collectionHeroCode }),
    thesisBlock('PRODUCT_EXPANDABLE_DESCRIPTION', {
      title: pageMeta.name,
      description: '<p>' + (pageMeta.seo?.description || '') + '</p><p>Toàn bộ sản phẩm trong trang này thuộc dòng bạc / hợp kim phủ bạc.</p>',
      maxCollapsedLines: 4,
    }),
    thesisBlock('PRODUCT_CAROUSEL', {
      header: { title: 'Gợi ý trong bộ', subtitle: collection?.name || 'Jewelry' },
      display: { limit: 8 },
      dataSource: { filterType: 'COLLECTION', collectionSlug: collection?.slug },
      seeMore: { enabled: true, text: 'Xem listing', url: '/san-pham?collectionSlug=' + (collection?.slug || '') },
    }),
    thesisBlock('CTA_BLOCK', {
      title: 'Tiếp tục mua sắm',
      alignment: 'CENTER',
      buttons: [{ label: 'Tất cả sản phẩm', url: '/san-pham', textColor: '#FFFFFF', backgroundColor: '#111827', borderColor: '#111827', target: '_self' }],
      background: { color: '#F9FAFB', borderColor: 'transparent', borderRadius: 20 },
    }),
  ]);
}

async function ensureMenu(label, type, targetId, url, parentId, sortOrder) {
  const tree = (await api('admin/cms/navigations')).items;
  const flatten = (nodes) => nodes.flatMap((node) => [node, ...flatten(node.children ?? [])]);
  const existing = flatten(tree).find((node) => node.label === label && String(node.parentId ?? '') === String(parentId ?? ''));
  if (existing) return existing;
  return api('admin/cms/navigations', 'POST', {
    label,
    type,
    targetId: String(targetId),
    url,
    parentId,
    sortOrder,
    showOnMenuPopup: true,
    showOnPlp: type === 'CATEGORY',
    openInNewTab: false,
  });
}

await ensureMenu('Trang chủ', 'PAGE', home.id, '/', undefined, 0);
const productMenu = await ensureMenu('Sản phẩm', 'PAGE', listing.id, '/san-pham', undefined, 1);
for (const [index, category] of categories.entries()) {
  await ensureMenu(category.name, 'CATEGORY', category.id, '/san-pham/' + category.slug, numericId(productMenu.id), index);
}
await api('admin/cms/navigations/publish', 'POST');

const published = await api('storefront/product?take=200', 'GET', undefined, false);
assert.ok((published.content?.length ?? 0) >= 100, 'Expected >=100 published products');

const skuTotal = products.reduce((count, product) => count + (product.skus?.length ?? 0), 0);
process.stdout.write(JSON.stringify({
  ok: true,
  products: products.length,
  skus: skuTotal,
  categories: categories.map((row) => ({ code: row.code, slug: row.slug, name: row.name })),
  collections: collections.map((row) => row.slug),
  pages: THESIS_CMS_PAGES.map((page) => page.slug),
}) + '\n');
