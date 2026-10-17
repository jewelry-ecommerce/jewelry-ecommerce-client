import assert from 'node:assert/strict';
import { api, demoBlock, login, numericId, upload, verifyLocalDatabase } from './java-demo.api.mjs';
import { DEMO_ATTRIBUTE, DEMO_COLLECTIONS, DEMO_GROUPS, DEMO_INFORMATION, DEMO_POLICY } from './java-demo.data.mjs';

verifyLocalDatabase();
await login();
const existingProducts = (await api('admin/catalog/products?take=' + DEMO_POLICY.catalogTake)).content;
const existingCategories = await api('admin/catalog/categories');
const attributes = await api('admin/catalog/attributes');
const color = attributes.find(attribute => attribute.code === DEMO_ATTRIBUTE.code)
  ?? await api('admin/catalog/attributes', 'POST', DEMO_ATTRIBUTE);
const products = [], categories = [], collections = [];
async function ensureCategory(group) {
  const existing = existingCategories.find(category => category.code === DEMO_POLICY.prefix + group.code);
  if (existing) return existing;
  return api('admin/catalog/categories', 'POST', { name: group.name, slug: group.slug,
    code: DEMO_POLICY.prefix + group.code, status: 'ACTIVE', directAttributeIds: [numericId(color.id)],
    imageUrl: await upload('images/product/' + group.folder + '/' + group.folder + '-1.1.png') });
}
async function ensureProduct(group, category, name, index) {
  const code = DEMO_POLICY.prefix + group.code + '-' + String(index + 1).padStart(2, '0');
  const existing = existingProducts.find(product => product.code === code);
  if (existing) return api('admin/catalog/products/' + existing.id);
  const style = index % 3 + 1;
  const photos = await Promise.all([1, 2].map(photo => upload('images/product/' + group.folder + '/' + group.folder + '-' + style + '.' + photo + '.png')));
  const price = group.basePrice + index * DEMO_POLICY.priceStep;
  const fullName = group.name + ' ' + name;
  const product = await api('admin/catalog/products', 'POST', {
    categoryId: numericId(category.id), code, name: fullName, slug: code.toLowerCase(),
    shortDescription: 'Thiết kế tinh tế cho phong cách hằng ngày và quà tặng.',
    description: '<p>' + fullName + ' mang điểm nhấn nhẹ nhàng, dễ phối cùng trang phục thường ngày.</p>',
    material: 'Bạc 925', occasion: 'Hằng ngày, quà tặng', unitOfMeasure: group.code === 'EARRING' ? 'PAIR' : 'EACH',
    thumbnailUrl: photos[0], metaTitle: fullName, metaDescription: 'Khám phá ' + fullName + ' trong bộ sưu tập trang sức.',
    productInfos: [{ title: 'Thông tin sản phẩm', description: '<p>Dữ liệu minh họa phục vụ demo đồ án. Thông số và giá không phải cam kết thương mại.</p>', sortOrder: 0 },
      { title: 'Bảo quản', description: '<p>Giữ khô ráo, tránh hóa chất và lau nhẹ bằng khăn mềm.</p>', sortOrder: 1 }],
    variants: DEMO_ATTRIBUTE.options.map((label, variant) => ({ skuCode: code + '-' + (variant + 1),
      name: fullName + ' - ' + label, material: 'Bạc 925', metalColorLabel: label, sizeLabel: 'Tiêu chuẩn',
      listPrice: price + variant * DEMO_POLICY.variantPriceStep, onHand: DEMO_POLICY.inventory, isDefault: variant === 0 })),
  });
  for (const [variantIndex, sku] of product.skus.entries()) {
    await api('admin/catalog/products/' + product.id + '/variants/' + sku.id + '/attributes', 'PUT',
      { values: [{ attributeId: numericId(color.id), value: DEMO_ATTRIBUTE.options[variantIndex] }] });
    for (const [sortOrder, url] of photos.entries())
      await api('admin/catalog/products/' + product.id + '/media', 'POST',
        { url, alt: fullName, skuId: numericId(sku.id), type: 'IMAGE', sortOrder, primary: sortOrder === 0 });
  }
  await api('admin/catalog/products/' + product.id + '/publish', 'PATCH');
  return api('admin/catalog/products/' + product.id);
}
for (const group of DEMO_GROUPS) {
  const category = await ensureCategory(group); categories.push(category);
  for (const [index, name] of group.names.entries()) products.push(await ensureProduct(group, category, name, index));
  process.stdout.write('READY ' + group.name + ': 5 products\n');
}
async function ensureCollections() {
  const existing = await api('admin/catalog/collections');
  for (const [index, definition] of DEMO_COLLECTIONS.entries()) {
    const collection = existing.find(row => row.slug === definition.slug) ?? await api('admin/catalog/collections', 'POST',
      { ...definition, heroImageUrl: await upload(definition.image), status: 'PUBLISHED', description: 'Bộ sưu tập minh họa cho đồ án trang sức.' });
    const productIds = products.filter((_, position) => position % DEMO_COLLECTIONS.length === index).map(row => numericId(row.id));
    await api('admin/catalog/collections/' + collection.id + '/products', 'POST', { productIds });
    collections.push(collection);
  }
}
await ensureCollections();
async function ensurePlacement(code, displayType, images) {
  const list = await api('admin/banner/placements?take=' + DEMO_POLICY.catalogTake);
  const rows = Array.isArray(list) ? list : list.content ?? list.list ?? [];
  const placement = rows.find(row => row.code === code) ?? await api('admin/banner/placements', 'POST',
    { code, name: code === DEMO_POLICY.heroCode ? 'Banner chính trang chủ' : 'Demo ' + code, displayType, platform: 'ALL', status: 'ACTIVE' });
  const current = await api('storefront/banner/placements/code/' + code + '/render');
  if (current.slots?.some(slot => slot.banners?.length)) return placement;
  const banners = [];
  for (const [index, image] of images.entries()) banners.push(await api('admin/banner/banners', 'POST',
    { internalName: 'Demo ' + code + ' ' + index, status: 'ACTIVE', mediaUrl: await upload(image),
      mediaMobileUrl: await upload(image), actionType: 'LINK_URL', actionUrl: '/san-pham' }));
  await api('admin/banner/placements/' + placement.id + '/layouts', 'POST', { name: 'Demo layout', status: 'ACTIVE',
    items: banners.map((banner, index) => ({ bannerId: numericId(banner.id), slotKey: displayType === 'SLIDER' ? 'main' : 'slot-' + index,
      isActive: true, priority: index, displayMetadata: { slotType: displayType, x: index, y: 0, width: 1, height: 1, order: index } })) });
  return placement;
}
await ensurePlacement(DEMO_POLICY.heroCode, 'SLIDER', [DEMO_POLICY.heroImage]);
await ensurePlacement(DEMO_POLICY.storiesCode, 'DOUBLE_BANNER', DEMO_COLLECTIONS.slice(0, 2).map(row => row.image));
await ensurePlacement(DEMO_POLICY.listingCode, 'SLIDER', [DEMO_POLICY.heroImage]);
const showcase = await Promise.all(DEMO_COLLECTIONS.map(async definition => ({ title: definition.name,
  imageUrl: await upload(definition.image), actionUrl: '/san-pham?collectionSlug=' + definition.slug })));
const cards = await Promise.all(DEMO_INFORMATION.map(async info => ({ ...info, imageUrl: await upload(info.image), actionText: 'Khám phá', actionUrl: '/san-pham' })));
const gallery = await Promise.all([1, 2, 3, 4].map(async index => ({ imageUrl: await upload('images/gallery-image/0' + index + '.webp'), title: 'Cảm hứng ' + index, label: 'JEWELRY ECOMMERCE', actionUrl: '/san-pham' })));
async function savePage(slug, name, newBlocks) {
  const pages = await api('admin/cms/pages');
  const previous = pages.find(page => page.slug === slug);
  const preserved = (previous?.blocks ?? []).filter(block => block.config?.demoNamespace !== DEMO_POLICY.namespace)
    .map(block => ({ type: block.type, config: block.config, isVisible: block.isVisible ?? block.visible }));
  const additions = newBlocks.filter(block => !(block.type === 'BANNER' && preserved.some(existing => existing.type === 'BANNER' && existing.config.placementCode === block.config.placementCode)));
  const blocks = [...preserved, ...additions].map((block, sortOrder) => ({ ...block, sortOrder }));
  const body = { name: previous?.name ?? name, slug, locale: previous?.locale ?? 'vi-VN', isActive: true, targetDevice: 'ALL',
    seo: previous?.seo ?? { title: name, description: 'Khám phá thiết kế trang sức cho phong cách riêng.' }, blocks };
  const page = await api('admin/cms/pages' + (previous ? '/' + previous.id : ''), previous ? 'PUT' : 'POST', body);
  await api('admin/cms/pages/' + page.id + '/publish', 'POST');
  const visible = await api('storefront/cms/pages/' + slug + '?device=DESKTOP');
  assert.equal(visible.blocks.length, blocks.length);
  return page;
}
const home = await savePage('trang-chu', 'Trang chủ', [
  demoBlock('BANNER', { placementCode: DEMO_POLICY.heroCode }),
  demoBlock('PRODUCT_CAROUSEL', { header: { title: 'THIẾT KẾ NỔI BẬT', subtitle: 'Điểm nhấn cho phong cách riêng' }, display: { limit: 8 },
    dataSource: { filterType: 'MANUAL_PRODUCTS', productIds: products.slice(0, 8).map(row => String(row.id)) }, seeMore: { enabled: true, text: 'Xem tất cả', url: '/san-pham' } }),
  demoBlock('BANNER', { placementCode: DEMO_POLICY.storiesCode }),
  demoBlock('PRODUCT_COLLECTION_SHOWCASE', { header: { title: 'BỘ SƯU TẬP', subtitle: 'Mỗi thiết kế, một câu chuyện' }, items: showcase }),
  demoBlock('INFO_CARDS', { header: { title: 'CẢM HỨNG TRANG SỨC', subtitle: 'Tìm điều phù hợp với bạn' }, display: { columns: 3 }, items: cards }),
  demoBlock('IMAGE_GALLERY', { header: { title: 'KHOẢNH KHẮC TỎA SÁNG', subtitle: 'Trang sức trong cuộc sống hằng ngày' }, display: { columns: 4 }, items: gallery }),
]);
const listing = await savePage('san-pham', 'Sản phẩm', [
  demoBlock('BANNER', { placementCode: DEMO_POLICY.listingCode }),
  demoBlock('PRODUCT_CATEGORY_NAV', { display: { limit: 4 } }),
  demoBlock('PRODUCT_LIST', { header: { title: 'TẤT CẢ TRANG SỨC', subtitle: 'Chọn thiết kế dành riêng cho bạn' }, productDataSource: { filterType: 'ALL_PRODUCTS', sort: 'newest' } }),
]);
async function ensureMenu(label, type, targetId, url, parentId, sortOrder) {
  const tree = (await api('admin/cms/navigations')).items;
  const flatten = nodes => nodes.flatMap(node => [node, ...flatten(node.children ?? [])]);
  const existing = flatten(tree).find(node => node.label === label && String(node.parentId ?? '') === String(parentId ?? ''));
  if (existing) return existing;
  return api('admin/cms/navigations', 'POST', { label, type, targetId: String(targetId), url, parentId,
    sortOrder, showOnMenuPopup: true, showOnPlp: type === 'CATEGORY', openInNewTab: false });
}
await ensureMenu('Trang chủ', 'PAGE', home.id, '/', undefined, 0);
const productMenu = await ensureMenu('Sản phẩm', 'PAGE', listing.id, '/san-pham', undefined, 1);
for (const [index, category] of categories.entries())
  await ensureMenu(category.name, 'CATEGORY', category.id, '/san-pham/' + category.slug, numericId(productMenu.id), index);
await api('admin/cms/navigations/publish', 'POST');
const published = await api('storefront/product?take=100');
assert.ok(published.content.length >= products.length);
for (const product of products) {
  const detail = await api('storefront/product/' + product.slug);
  assert.ok(detail.skus.every(sku => Number(sku.availableStock) > 0));
}
process.stdout.write(JSON.stringify({ createdOrReused: { products: products.length, skus: products.reduce((count, product) => count + product.skus.length, 0),
  categories: categories.length, collections: collections.length }, pages: [{ id: home.id, slug: home.slug }, { id: listing.id, slug: listing.slug }],
  links: { client: 'http://localhost:3100', products: 'http://localhost:3100/san-pham', admin: 'http://localhost:6100' } }) + '\n');

