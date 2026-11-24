/**
 * Banner placements + CMS pages + collections + menu (copy trang sức chuẩn).
 * ENV: JEWELRY_DEMO_CONFIRM=CREATE_THESIS_CATALOG_120 + phone/password + API URL
 */
import assert from 'node:assert/strict';
import { api, login, numericId, thesisBlock, upload, verifyThesisTarget } from './thesis-catalog.api.mjs';
import {
  THESIS_CMS_PAGES,
  THESIS_COLLECTIONS,
  THESIS_INFORMATION,
  THESIS_POLICY,
} from './thesis-catalog.data.mjs';

verifyThesisTarget();
await login();

const productsPayload = await api('admin/catalog/products?take=' + THESIS_POLICY.catalogTake);
const products = (productsPayload.content ?? []).filter((product) => String(product.code || '').startsWith(THESIS_POLICY.prefix));
assert.ok(products.length >= 40, 'Need JEW-* products first, got ' + products.length);

const categories = (await api('admin/catalog/categories')).filter((row) => String(row.code || '').startsWith(THESIS_POLICY.prefix));

function groupCodeOf(product) {
  const code = String(product.code || '');
  const match = code.match(/^JEW-([A-Z]+)-/i);
  return match ? match[1].toUpperCase() : '';
}

function pickProducts(definition, limit = 18) {
  const wanted = new Set((definition.pick || []).map((code) => code.toUpperCase()));
  const matched = products.filter((product) => wanted.size === 0 || wanted.has(groupCodeOf(product)));
  const pool = matched.length ? matched : products;
  return pool.slice(0, limit).map((row) => numericId(row.id));
}

async function resolveMedia(source) {
  if (/^https?:\/\//i.test(source)) return source;
  return upload(source);
}

let collections = await api('admin/catalog/collections');
for (const definition of THESIS_COLLECTIONS) {
  let collection = collections.find((row) => row.slug === definition.slug);
  if (!collection) {
    collection = await api('admin/catalog/collections', 'POST', {
      name: definition.name,
      slug: definition.slug,
      heroImageUrl: await resolveMedia(definition.image),
      status: 'PUBLISHED',
      description: definition.blurb,
    });
    process.stdout.write('COLLECTION_NEW ' + definition.slug + '\n');
  }
  const productIds = pickProducts(definition);
  if (productIds.length) {
    await api('admin/catalog/collections/' + collection.id + '/products', 'POST', { productIds });
  }
}
collections = await api('admin/catalog/collections');
const collectionsBySlug = Object.fromEntries(collections.map((row) => [row.slug, row]));

async function ensureSliderPlacement(code, images, actionUrl = '/san-pham') {
  const list = await api('admin/banner/placements?take=100');
  const rows = Array.isArray(list) ? list : list.content ?? list.list ?? [];
  let placement = rows.find((row) => row.code === code);
  if (!placement) {
    placement = await api('admin/banner/placements', 'POST', {
      code,
      name: 'Jewelry Ecommerce ' + code,
      displayType: 'SLIDER',
      platform: 'ALL',
      status: 'ACTIVE',
    });
  }
  const current = await api('storefront/banner/placements/code/' + code + '/render', 'GET', undefined, false).catch(() => null);
  if (current?.slots?.some((slot) => slot.banners?.length)) return placement;

  const banners = [];
  for (const [index, image] of images.entries()) {
    banners.push(await api('admin/banner/banners', 'POST', {
      internalName: code + ' ' + index,
      status: 'ACTIVE',
      mediaUrl: await resolveMedia(image),
      mediaMobileUrl: await resolveMedia(image),
      actionType: 'LINK_URL',
      actionUrl,
    }));
  }
  await api('admin/banner/placements/' + placement.id + '/layouts', 'POST', {
    name: code + ' layout',
    status: 'ACTIVE',
    items: banners.map((banner, index) => ({
      bannerId: numericId(banner.id),
      slotKey: 'main',
      isActive: true,
      priority: index,
      displayMetadata: { slotType: 'SLIDER', layoutType: 'SLIDER', x: 0, y: 0, width: 1, height: 1, order: index },
    })),
  });
  return placement;
}

async function ensureDoublePlacement(code, images) {
  const list = await api('admin/banner/placements?take=100');
  const rows = Array.isArray(list) ? list : list.content ?? list.list ?? [];
  let placement = rows.find((row) => row.code === code);
  if (!placement) {
    placement = await api('admin/banner/placements', 'POST', {
      code,
      name: 'Jewelry Ecommerce ' + code,
      displayType: 'DOUBLE_BANNER',
      platform: 'ALL',
      status: 'ACTIVE',
    });
  }
  const current = await api('storefront/banner/placements/code/' + code + '/render', 'GET', undefined, false).catch(() => null);
  if (current?.slots?.some((slot) => slot.banners?.length)) return placement;

  const banners = [];
  for (const [index, image] of images.entries()) {
    banners.push(await api('admin/banner/banners', 'POST', {
      internalName: code + ' ' + index,
      status: 'ACTIVE',
      mediaUrl: await resolveMedia(image),
      mediaMobileUrl: await resolveMedia(image),
      actionType: 'LINK_URL',
      actionUrl: '/san-pham',
    }));
  }
  await api('admin/banner/placements/' + placement.id + '/layouts', 'POST', {
    name: code + ' layout',
    status: 'ACTIVE',
    items: banners.map((banner, index) => ({
      bannerId: numericId(banner.id),
      slotKey: 'slot-' + index,
      isActive: true,
      priority: index,
      displayMetadata: { slotType: 'DOUBLE_BANNER', layoutType: 'DOUBLE_BANNER', x: index, y: 0, width: 1, height: 1, order: index },
    })),
  });
  return placement;
}

/** GRID 4×2 (8 ô) — layout 4 ảnh: hero lớn + 3 ô phụ. */
async function ensureBestSellerGrid(code, images) {
  const list = await api('admin/banner/placements?take=100');
  const rows = Array.isArray(list) ? list : list.content ?? list.list ?? [];
  let placement = rows.find((row) => row.code === code);
  if (!placement) {
    placement = await api('admin/banner/placements', 'POST', {
      code,
      name: 'Jewelry Ecommerce Best Seller Grid',
      displayType: 'GRID',
      platform: 'ALL',
      status: 'ACTIVE',
      settings: { columns: 4, rows: 2, gap: 0, mobileOddFullWidthItem: 'LAST' },
    });
  } else if (!placement.settings?.columns) {
    try {
      await api('admin/banner/placements/' + placement.id, 'PATCH', {
        settings: { columns: 4, rows: 2, gap: 0, mobileOddFullWidthItem: 'LAST' },
      });
    } catch {
      /* keep existing */
    }
  }

  const current = await api('storefront/banner/placements/code/' + code + '/render', 'GET', undefined, false).catch(() => null);
  if (current?.slots?.some((slot) => slot.banners?.length)) return placement;

  const slots = [
    { key: 'A', x: 0, y: 0, width: 2, height: 2, image: images[0], href: '/best-seller' },
    { key: 'B', x: 2, y: 0, width: 2, height: 1, image: images[1], href: '/san-pham?collectionSlug=best-sellers' },
    { key: 'C', x: 2, y: 1, width: 1, height: 1, image: images[2], href: '/san-pham' },
    { key: 'D', x: 3, y: 1, width: 1, height: 1, image: images[3], href: '/bo-suu-tap' },
  ];

  const items = [];
  for (const [index, slot] of slots.entries()) {
    const banner = await api('admin/banner/banners', 'POST', {
      internalName: code + ' ' + slot.key,
      status: 'ACTIVE',
      mediaUrl: await resolveMedia(slot.image),
      mediaMobileUrl: await resolveMedia(slot.image),
      actionType: 'LINK_URL',
      actionUrl: slot.href,
    });
    items.push({
      bannerId: numericId(banner.id),
      slotKey: slot.key,
      isActive: true,
      priority: index,
      displayMetadata: {
        slotType: 'SINGLE_IMAGE',
        layoutType: 'GRID',
        x: slot.x,
        y: slot.y,
        width: slot.width,
        height: slot.height,
        order: index,
      },
    });
  }

  await api('admin/banner/placements/' + placement.id + '/layouts', 'POST', {
    name: 'Best seller mosaic',
    status: 'ACTIVE',
    items,
  });
  return placement;
}

await ensureSliderPlacement(THESIS_POLICY.heroCode, ['images/banner/grid-banner/01.png'], '/black-friday');
await ensureDoublePlacement(
  THESIS_POLICY.storiesCode,
  ['images/banner/double-banner/01.webp', 'images/banner/double-banner/02.webp'],
);
await ensureSliderPlacement(THESIS_POLICY.listingCode, ['images/banner/product-banner/1.webp']);
await ensureSliderPlacement(THESIS_POLICY.collectionHeroCode, ['images/banner/double-banner/01.webp'], '/bo-suu-tap');
// Campaign banners: durable public assets (Render disk / Cloudinary fetch gãy).
await ensureSliderPlacement(
  THESIS_POLICY.blackFridayHeroCode,
  ['images/gallery-image/01.webp'],
  '/black-friday',
);
await ensureBestSellerGrid(THESIS_POLICY.bestSellerGridCode, [
  'images/product/charm/charm-1.1.jpg',
  'images/product/day-chuyen/day-chuyen-1.1.jpg',
  'images/product/charm/charm-2.1.jpg',
  'images/product/day-chuyen/day-chuyen-2.1.jpg',
]);

const featuredCollections = ['everyday-silver', 'layered-look', 'cz-glow', 'gift-edit', 'black-friday-picks', 'best-sellers']
  .map((slug) => THESIS_COLLECTIONS.find((row) => row.slug === slug))
  .filter(Boolean);

const showcase = await Promise.all(featuredCollections.slice(0, 3).map(async (definition) => ({
  title: definition.name,
  imageUrl: await resolveMedia(definition.image),
  actionUrl: '/san-pham?collectionSlug=' + definition.slug,
})));

const cards = await Promise.all(THESIS_INFORMATION.map(async (info) => ({
  title: info.title,
  description: info.description,
  imageUrl: await resolveMedia(info.image),
  actionText: 'Khám phá',
  actionUrl: '/san-pham',
})));

const gallery = await Promise.all([1, 2, 3, 4].map(async (index) => ({
  imageUrl: await resolveMedia('images/gallery-image/0' + index + '.webp'),
  title: ['Ánh bạc ban ngày', 'Layered necklace', 'Hoop & cuff', 'Gift-ready set'][index - 1],
  label: 'LOOKBOOK',
  actionUrl: '/san-pham',
})));

async function buildSeo(meta) {
  const imageUrl = meta.seo?.image ? await resolveMedia(meta.seo.image) : '';
  return {
    title: meta.seo?.title || meta.name,
    description: meta.seo?.description || '',
    keywords: meta.seo?.keywords || '',
    canonicalUrl: '/' + meta.slug,
    imageUrl,
  };
}

function withSort(blocks) {
  return blocks.map((block, sortOrder) => ({
    type: block.type,
    isVisible: block.isVisible !== false,
    config: block.config,
    sortOrder,
  }));
}

async function savePage(meta, newBlocks) {
  const pages = await api('admin/cms/pages');
  const previous = pages.find((page) => page.slug === meta.slug);
  const blocks = withSort(newBlocks);
  const seo = await buildSeo(meta);
  const body = {
    name: meta.name,
    slug: meta.slug,
    locale: previous?.locale ?? 'vi-VN',
    isActive: true,
    targetDevice: 'ALL',
    seo,
    blocks,
  };
  const page = await api('admin/cms/pages' + (previous ? '/' + previous.id : ''), previous ? 'PUT' : 'POST', body);
  await api('admin/cms/pages/' + page.id + '/publish', 'POST');
  process.stdout.write('PAGE ' + meta.slug + ' blocks=' + blocks.length + '\n');
  return page;
}

const homeMeta = THESIS_CMS_PAGES.find((page) => page.slug === 'trang-chu');
const listingMeta = THESIS_CMS_PAGES.find((page) => page.slug === 'san-pham');
const collectionHub = THESIS_CMS_PAGES.find((page) => page.slug === 'bo-suu-tap');
const blackFridayMeta = THESIS_CMS_PAGES.find((page) => page.slug === 'black-friday');
const bestSellerMeta = THESIS_CMS_PAGES.find((page) => page.slug === 'best-seller');

const homeBlocksLive = await api('storefront/cms/pages/trang-chu', 'GET', undefined, false).catch(() => null);
const allowNew = (homeBlocksLive?.blocks || []).some((block) => ['CTA_BLOCK', 'NEWSLETTER_SIGNUP'].includes(block.type || block.blockTypeCode))
  || true;

const everyday = collectionsBySlug['everyday-silver'] || collectionsBySlug['bac-toi-gian'];
const layered = collectionsBySlug['layered-look'] || collectionsBySlug['cz-lap-lanh'];
const blackFridayCollection = collectionsBySlug['black-friday-picks'];
const bestSellerCollection = collectionsBySlug['best-sellers'];

// Top banner = admin/cms/headers (trong Header như trading-fe) — không seed TOP_LINE_BANNER vào nội dung trang.
async function ensureBlackFridayHeader() {
  const start = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  await api('admin/cms/headers', 'POST', {
    bannerName: 'Black Friday',
    bannerDisplayStyle: 'TEXT',
    bannerContent: 'BLACK FRIDAY — Giảm sâu trang sức bạc 925 · Freeship đơn từ 500K · Đổi trả 7 ngày',
    bannerBgColor: '#000000',
    bannerTextColor: '#FFFFFF',
    bannerTargetUrl: '/black-friday',
    bannerAnimationStyle: 'MARQUEE',
    bannerLoopIntervalSec: 14,
    bannerStartTime: start,
    status: 'ACTIVE',
    confirmReplaceActive: true,
  });
  process.stdout.write('HEADER Black Friday ACTIVE\n');
}

await ensureBlackFridayHeader();

const homeBlocks = [
  thesisBlock('BANNER', { placementCode: THESIS_POLICY.heroCode }),
  thesisBlock('PRODUCT_CAROUSEL', {
    header: {
      title: 'Everyday Silver',
      subtitle: 'Trang sức bạc mỏng nhẹ — đeo mỗi ngày vẫn nổi bật',
    },
    display: { limit: 8 },
    dataSource: {
      filterType: 'COLLECTION',
      collectionSlug: everyday?.slug || 'everyday-silver',
    },
    seeMore: {
      enabled: true,
      text: 'Xem bộ sưu tập',
      url: '/san-pham?collectionSlug=' + (everyday?.slug || 'everyday-silver'),
    },
  }),
  thesisBlock('BANNER', { placementCode: THESIS_POLICY.storiesCode }),
  thesisBlock('PRODUCT_CAROUSEL', {
    header: {
      title: 'Layered Look',
      subtitle: 'Dây chuyền, charm và vòng — xếp lớp theo mood của bạn',
    },
    display: { limit: 8 },
    dataSource: {
      filterType: 'COLLECTION',
      collectionSlug: layered?.slug || 'layered-look',
    },
    seeMore: {
      enabled: true,
      text: 'Khám phá Layered',
      url: '/san-pham?collectionSlug=' + (layered?.slug || 'layered-look'),
    },
  }),
  thesisBlock('PRODUCT_COLLECTION_SHOWCASE', {
    header: { title: 'Bộ sưu tập nổi bật', subtitle: 'Chọn mood — còn lại để trang sức lo' },
    items: showcase,
  }),
  thesisBlock('INFO_CARDS', {
    header: { title: 'Vì sao chọn Jewelry Ecommerce', subtitle: 'Chất liệu rõ ràng · Phối set dễ · Bảo quản đơn giản' },
    display: { columns: 3 },
    items: cards,
  }),
  ...(allowNew
    ? [thesisBlock('CTA_BLOCK', {
        title: 'Khám phá toàn bộ trang sức',
        description: 'Nhẫn · Dây chuyền · Vòng tay · Khuyên tai · Lắc tay · Charm',
        alignment: 'CENTER',
        buttons: [
          { label: 'Xem sản phẩm', url: '/san-pham', textColor: '#FFFFFF', backgroundColor: '#0A0A0A', borderColor: '#0A0A0A', target: '_self' },
          { label: 'Black Friday', url: '/black-friday', textColor: '#0A0A0A', backgroundColor: '#FFFFFF', borderColor: '#0A0A0A', target: '_self' },
        ],
        background: { color: '#F8FAFC', borderColor: 'transparent', borderRadius: 24 },
      })]
    : []),
  thesisBlock('IMAGE_GALLERY', {
    header: { title: 'Lookbook', subtitle: 'Gợi ý phối trang sức bạc theo từng khoảnh khắc' },
    display: { columns: 4 },
    items: gallery,
  }),
  ...(allowNew
    ? [thesisBlock('NEWSLETTER_SIGNUP', {
        heading: 'Nhận tin bộ sưu tập & ưu đãi mới',
        consentText: 'Bằng cách đăng ký, bạn đồng ý với chính sách bảo mật thông tin.',
      })]
    : []),
];

const home = await savePage(homeMeta, homeBlocks);

const listing = await savePage(listingMeta, [
  thesisBlock('BANNER', { placementCode: THESIS_POLICY.listingCode }),
  thesisBlock('PRODUCT_CATEGORY_NAV', { display: { limit: 6 } }),
  thesisBlock('PRODUCT_LIST', {
    header: { title: 'Tất cả trang sức', subtitle: 'Nhẫn, dây chuyền, vòng, khuyên, lắc và charm bạc 925' },
    productDataSource: { filterType: 'ALL_PRODUCTS', sort: 'newest' },
  }),
]);

await savePage(collectionHub, [
  thesisBlock('BANNER', { placementCode: THESIS_POLICY.collectionHeroCode }),
  thesisBlock('PRODUCT_COLLECTION_SHOWCASE', {
    header: { title: 'Bộ sưu tập', subtitle: 'Từ everyday đến gift edit — chọn phong cách của bạn' },
    items: showcase,
  }),
  thesisBlock('CTA_BLOCK', {
    title: 'Chưa tìm thấy mood phù hợp?',
    alignment: 'CENTER',
    buttons: [{ label: 'Xem tất cả sản phẩm', url: '/san-pham', textColor: '#FFFFFF', backgroundColor: '#0A0A0A', borderColor: '#0A0A0A', target: '_self' }],
    background: { color: '#FFFFFF', borderColor: '#E5E7EB', borderRadius: 16 },
  }),
]);

const blackFriday = await savePage(blackFridayMeta, [
  thesisBlock('BANNER', { placementCode: THESIS_POLICY.blackFridayHeroCode }),
  thesisBlock('CTA_BLOCK', {
    title: 'Black Friday đã sẵn sàng',
    titleColor: '#FFFFFF',
    description: 'Chọn nhanh món trang sức bạn thích — hoặc xem thêm toàn bộ deal mùa này.',
    descriptionColor: '#E5E7EB',
    alignment: 'CENTER',
    buttons: [
      {
        label: 'Chọn món bạn thích',
        url: '/san-pham?collectionSlug=' + (blackFridayCollection?.slug || 'black-friday-picks'),
        textColor: '#000000',
        backgroundColor: '#FFFFFF',
        borderColor: '#FFFFFF',
        target: '_self',
      },
      {
        label: 'Xem thêm',
        url: '/san-pham',
        textColor: '#FFFFFF',
        backgroundColor: '#000000',
        borderColor: '#FFFFFF',
        target: '_self',
      },
    ],
    background: { color: '#000000', borderColor: '#000000', borderRadius: 0 },
  }),
  thesisBlock('PRODUCT_LIST', {
    header: { title: 'Deal Black Friday', subtitle: 'Ưu đãi trang sức bạc đáng sắm ngay' },
    productDataSource: {
      filterType: 'COLLECTION',
      collectionSlugs: [blackFridayCollection?.slug || 'black-friday-picks'],
      sort: 'newest',
    },
  }),
]);

const bestSeller = await savePage(bestSellerMeta, [
  thesisBlock('BANNER', { placementCode: THESIS_POLICY.bestSellerGridCode }),
  thesisBlock('PRODUCT_LIST', {
    header: { title: 'Best sellers', subtitle: 'Những thiết kế được yêu thích nhất' },
    productDataSource: {
      filterType: 'COLLECTION',
      collectionSlugs: [bestSellerCollection?.slug || 'best-sellers'],
      sort: 'newest',
    },
  }),
]);

const storyPages = THESIS_CMS_PAGES.filter((page) => page.slug.startsWith('bst-') || page.slug.startsWith('cam-hung-'));
const storyCollectionSlugs = ['bac-toi-gian', 'anh-kim-hien-dai', 'cz-lap-lanh', 'everyday-silver', 'layered-look'];
for (const [index, pageMeta] of storyPages.entries()) {
  const collection = collectionsBySlug[storyCollectionSlugs[index % storyCollectionSlugs.length]];
  await savePage(pageMeta, [
    thesisBlock('BANNER', { placementCode: THESIS_POLICY.collectionHeroCode }),
    thesisBlock('PRODUCT_EXPANDABLE_DESCRIPTION', {
      title: pageMeta.name,
      description: '<p>' + (pageMeta.seo?.description || '') + '</p>',
      maxCollapsedLines: 4,
    }),
    thesisBlock('PRODUCT_CAROUSEL', {
      header: { title: 'Gợi ý trong bộ', subtitle: collection?.name || 'Jewelry Ecommerce' },
      display: { limit: 8 },
      dataSource: { filterType: 'COLLECTION', collectionSlug: collection?.slug },
      seeMore: {
        enabled: true,
        text: 'Xem thêm',
        url: '/san-pham?collectionSlug=' + (collection?.slug || ''),
      },
    }),
    thesisBlock('CTA_BLOCK', {
      title: 'Tiếp tục khám phá',
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
await ensureMenu('Black Friday', 'PAGE', blackFriday.id, '/black-friday', undefined, 2);
await ensureMenu('Best Seller', 'PAGE', bestSeller.id, '/best-seller', undefined, 3);
await ensureMenu('Bộ sưu tập', 'PAGE', (await api('admin/cms/pages')).find((page) => page.slug === 'bo-suu-tap').id, '/bo-suu-tap', undefined, 4);
await api('admin/cms/navigations/publish', 'POST');

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
  } catch (error) {
    process.stdout.write('SKIP_CAT ' + category.code + ' ' + error.message.slice(0, 80) + '\n');
  }
}

const storefront = await api('storefront/cms/pages/trang-chu', 'GET', undefined, false);
const bfLive = await api('storefront/cms/pages/black-friday', 'GET', undefined, false);
const bsLive = await api('storefront/cms/pages/best-seller', 'GET', undefined, false);
process.stdout.write(JSON.stringify({
  ok: true,
  jewProducts: products.length,
  collections: Object.keys(collectionsBySlug),
  homeSeo: storefront.seo,
  homeBlocks: storefront.blocks?.map((block) => block.type || block.blockTypeCode),
  blackFridayBlocks: bfLive.blocks?.map((block) => block.type || block.blockTypeCode),
  bestSellerBlocks: bsLive.blocks?.map((block) => block.type || block.blockTypeCode),
  pages: THESIS_CMS_PAGES.map((page) => page.slug),
}, null, 2) + '\n');
