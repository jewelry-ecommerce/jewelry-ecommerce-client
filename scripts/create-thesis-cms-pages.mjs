/**
 * Tiếp tục sau khi catalog JEW-* đã seed: banner placements + CMS pages + menu.
 * ENV giống create-thesis-catalog.mjs
 */
import assert from 'node:assert/strict';
import { api, login, numericId, thesisBlock, upload, verifyThesisTarget } from './thesis-catalog.api.mjs';
import {
  THESIS_CMS_PAGES,
  THESIS_COLLECTIONS,
  THESIS_GROUPS,
  THESIS_INFORMATION,
  THESIS_POLICY,
} from './thesis-catalog.data.mjs';

verifyThesisTarget();
await login();

const productsPayload = await api('admin/catalog/products?take=' + THESIS_POLICY.catalogTake);
const products = (productsPayload.content ?? []).filter((product) => String(product.code || '').startsWith(THESIS_POLICY.prefix));
assert.ok(products.length >= 100, 'Need JEW-* products first, got ' + products.length);

const categories = (await api('admin/catalog/categories')).filter((row) => String(row.code || '').startsWith(THESIS_POLICY.prefix));
let collections = await api('admin/catalog/collections');
for (const definition of THESIS_COLLECTIONS) {
  if (!collections.find((row) => row.slug === definition.slug)) {
    await api('admin/catalog/collections', 'POST', {
      name: definition.name,
      slug: definition.slug,
      heroImageUrl: await upload(definition.image),
      status: 'PUBLISHED',
      description: definition.blurb,
    });
  }
}
collections = await api('admin/catalog/collections');
collections = THESIS_COLLECTIONS.map((definition) => collections.find((row) => row.slug === definition.slug)).filter(Boolean);

async function ensurePlacement(code, displayType, images) {
  const list = await api('admin/banner/placements?take=100');
  const rows = Array.isArray(list) ? list : list.content ?? list.list ?? [];
  let placement = rows.find((row) => row.code === code);
  if (!placement) {
    placement = await api('admin/banner/placements', 'POST', {
      code, name: 'Thesis ' + code, displayType, platform: 'ALL', status: 'ACTIVE',
    });
  }
  const current = await api('storefront/banner/placements/code/' + code + '/render', 'GET', undefined, false).catch(() => null);
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
  title: info.title,
  description: info.description,
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

function withSort(blocks) {
  return blocks.map((block, sortOrder) => ({
    type: block.type,
    isVisible: block.isVisible !== false,
    config: block.config,
    sortOrder,
  }));
}

async function savePage(slug, name, seo, newBlocks) {
  const pages = await api('admin/cms/pages');
  const previous = pages.find((page) => page.slug === slug);
  const blocks = withSort(newBlocks);
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
  process.stdout.write('PAGE ' + slug + ' blocks=' + blocks.length + '\n');
  return page;
}

const homeMeta = THESIS_CMS_PAGES.find((page) => page.slug === 'trang-chu');
const listingMeta = THESIS_CMS_PAGES.find((page) => page.slug === 'san-pham');
const collectionHub = THESIS_CMS_PAGES.find((page) => page.slug === 'bo-suu-tap');

async function supportsBlock(type, config) {
  const probe = withSort([thesisBlock(type, config)]);
  try {
    await api('admin/cms/pages/' + (await api('admin/cms/pages')).find((page) => page.slug === 'trang-chu').id, 'PUT', {
      name: 'trang chủ',
      slug: 'trang-chu',
      locale: 'vi-VN',
      isActive: true,
      targetDevice: 'ALL',
      seo: { title: 'probe', description: 'probe' },
      blocks: probe,
    });
    return true;
  } catch {
    return false;
  }
}

const allowNew = await supportsBlock('CTA_BLOCK', {
  title: 'T',
  alignment: 'CENTER',
  buttons: [{ label: 'A', url: '/san-pham', textColor: '#FFFFFF', backgroundColor: '#0A0A0A', borderColor: '#0A0A0A', target: '_self' }],
  background: { color: '#FFFFFF', borderColor: 'transparent', borderRadius: 8 },
});
process.stdout.write('NEW_BLOCKS=' + allowNew + '\n');

// Không seed TOP_LINE_BANNER — storefront đã có top banner sẵn.
const homeBlocks = [
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
  ...(allowNew
    ? [thesisBlock('CTA_BLOCK', {
        title: 'Khám phá toàn bộ danh mục bạc',
        description: 'Nhẫn · Dây chuyền · Vòng tay · Khuyên tai · Lắc tay · Charm',
        alignment: 'CENTER',
        buttons: [
          { label: 'Xem sản phẩm', url: '/san-pham', textColor: '#FFFFFF', backgroundColor: '#0A0A0A', borderColor: '#0A0A0A', target: '_self' },
          { label: 'Bộ sưu tập', url: '/bo-suu-tap', textColor: '#0A0A0A', backgroundColor: '#FFFFFF', borderColor: '#0A0A0A', target: '_self' },
        ],
        background: { color: '#F8FAFC', borderColor: 'transparent', borderRadius: 24 },
      })]
    : [thesisBlock('PRODUCT_EXPANDABLE_DESCRIPTION', {
        title: 'Khám phá toàn bộ danh mục bạc',
        description: '<p>Nhẫn · Dây chuyền · Vòng tay · Khuyên tai · Lắc tay · Charm. Chỉ bạc 925 và hợp kim phủ bạc.</p>',
        maxCollapsedLines: 3,
      })]),
  thesisBlock('IMAGE_GALLERY', {
    header: { title: 'LOOKBOOK BẠC', subtitle: 'Ảnh minh họa — không dùng ảnh Sevatrading' },
    display: { columns: 4 },
    items: gallery,
  }),
  ...(allowNew
    ? [thesisBlock('NEWSLETTER_SIGNUP', {
        heading: 'Đăng ký nhận tin bộ sưu tập bạc mới',
        consentText: 'Bằng cách đăng ký, bạn đồng ý với chính sách bảo mật thông tin.',
      })]
    : []),
];

const home = await savePage(homeMeta.slug, homeMeta.name, homeMeta.seo, homeBlocks);

const listing = await savePage(listingMeta.slug, listingMeta.name, listingMeta.seo, [
  thesisBlock('BANNER', { placementCode: THESIS_POLICY.listingCode }),
  thesisBlock('PRODUCT_CATEGORY_NAV', { display: { limit: 6 } }),
  thesisBlock('PRODUCT_LIST', {
    header: { title: 'TẤT CẢ TRANG SỨC BẠC', subtitle: '6 danh mục · ~120 SPU' },
    productDataSource: { filterType: 'ALL_PRODUCTS', sort: 'newest' },
  }),
]);

await savePage(collectionHub.slug, collectionHub.name, collectionHub.seo, [
  thesisBlock('BANNER', { placementCode: THESIS_POLICY.collectionHeroCode }),
  thesisBlock('PRODUCT_COLLECTION_SHOWCASE', {
    header: { title: 'BỘ SƯU TẬP', subtitle: 'Chọn cảm hứng phù hợp' },
    items: showcase.slice(0, 3),
  }),
  ...(allowNew
    ? [thesisBlock('CTA_BLOCK', {
        title: 'Xem toàn bộ sản phẩm',
        alignment: 'CENTER',
        buttons: [{ label: 'Tới trang sản phẩm', url: '/san-pham', textColor: '#FFFFFF', backgroundColor: '#0A0A0A', borderColor: '#0A0A0A', target: '_self' }],
        background: { color: '#FFFFFF', borderColor: '#E5E7EB', borderRadius: 16 },
      })]
    : [thesisBlock('PRODUCT_EXPANDABLE_DESCRIPTION', {
        title: 'Xem toàn bộ sản phẩm',
        description: '<p><a href="/san-pham">Tới trang sản phẩm</a> để xem ~120 SPU bạc / hợp kim.</p>',
        maxCollapsedLines: 3,
      })]),
]);

const storyPages = THESIS_CMS_PAGES.filter((page) => page.slug.startsWith('bst-') || page.slug.startsWith('cam-hung-'));
for (const [index, pageMeta] of storyPages.entries()) {
  const collection = collections[index % collections.length];
  await savePage(pageMeta.slug, pageMeta.name, pageMeta.seo, [
    thesisBlock('BANNER', { placementCode: THESIS_POLICY.collectionHeroCode }),
    thesisBlock('PRODUCT_EXPANDABLE_DESCRIPTION', {
      title: pageMeta.name,
      description: '<p>' + (pageMeta.seo?.description || '') + '</p><p>Toàn bộ sản phẩm thuộc dòng bạc / hợp kim phủ bạc.</p>',
      maxCollapsedLines: 4,
    }),
    thesisBlock('PRODUCT_CAROUSEL', {
      header: { title: 'Gợi ý trong bộ', subtitle: collection?.name || 'Jewelry' },
      display: { limit: 8 },
      dataSource: { filterType: 'COLLECTION', collectionSlug: collection?.slug },
      seeMore: { enabled: true, text: 'Xem listing', url: '/san-pham?collectionSlug=' + (collection?.slug || '') },
    }),
    ...(allowNew
      ? [thesisBlock('CTA_BLOCK', {
          title: 'Tiếp tục mua sắm',
          alignment: 'CENTER',
          buttons: [{ label: 'Tất cả sản phẩm', url: '/san-pham', textColor: '#FFFFFF', backgroundColor: '#111827', borderColor: '#111827', target: '_self' }],
          background: { color: '#F9FAFB', borderColor: 'transparent', borderRadius: 20 },
        })]
      : [thesisBlock('PRODUCT_EXPANDABLE_DESCRIPTION', {
          title: 'Tiếp tục mua sắm',
          description: '<p><a href="/san-pham">Tất cả sản phẩm bạc</a></p>',
          maxCollapsedLines: 2,
        })]),
  ]);
}

async function ensureMenu(label, type, targetId, url, parentId, sortOrder) {
  const tree = (await api('admin/cms/navigations')).items;
  const flatten = (nodes) => nodes.flatMap((node) => [node, ...flatten(node.children ?? [])]);
  const existing = flatten(tree).find((node) => node.label === label && String(node.parentId ?? '') === String(parentId ?? ''));
  if (existing) return existing;
  return api('admin/cms/navigations', 'POST', {
    label, type, targetId: String(targetId), url, parentId, sortOrder,
    showOnMenuPopup: true, showOnPlp: type === 'CATEGORY', openInNewTab: false,
  });
}

await ensureMenu('Trang chủ', 'PAGE', home.id, '/', undefined, 0);
const productMenu = await ensureMenu('Sản phẩm', 'PAGE', listing.id, '/san-pham', undefined, 1);
for (const [index, category] of categories.entries()) {
  await ensureMenu(category.name, 'CATEGORY', category.id, '/san-pham/' + category.slug, numericId(productMenu.id), index);
}
await api('admin/cms/navigations/publish', 'POST');

// Ẩn danh mục CLOUD cũ nếu API cho phép
const allCategories = await api('admin/catalog/categories');
for (const category of allCategories.filter((row) => String(row.code || '').startsWith('CLOUD26-'))) {
  try {
    await api('admin/catalog/categories/' + category.id, 'PUT', {
      name: category.name,
      slug: category.slug,
      code: category.code,
      status: 'INACTIVE',
      imageUrl: category.imageUrl,
      directAttributeIds: [],
    });
    process.stdout.write('INACTIVE ' + category.code + '\n');
  } catch (error) {
    process.stdout.write('SKIP_CAT ' + category.code + ' ' + error.message.slice(0, 80) + '\n');
  }
}

const storefront = await api('storefront/cms/pages/trang-chu', 'GET', undefined, false);
const listingLive = await api('storefront/cms/pages/san-pham', 'GET', undefined, false);
process.stdout.write(JSON.stringify({
  ok: true,
  jewProducts: products.length,
  jewCategories: categories.map((row) => row.slug),
  homeBlocks: storefront.blocks?.map((block) => block.type || block.blockTypeCode),
  listingBlocks: listingLive.blocks?.map((block) => block.type || block.blockTypeCode),
  pages: THESIS_CMS_PAGES.map((page) => page.slug),
}) + '\n');
