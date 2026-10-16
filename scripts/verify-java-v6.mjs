import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';

const base = 'http://127.0.0.1:8084/api/v1';
assert.equal(process.env.OMS_VERIFY_ISOLATED, '1', 'Disposable verification environment only.');
const docker = args => execFileSync('docker', args, { encoding: 'utf8', windowsHide: true });
const metadata = JSON.parse(docker(['inspect', 'jewelry-v6-verify-java']))[0];
assert.ok(metadata.Config.Env.some(value => value.startsWith('DB_URL=') && value.includes('jewelry_oms_verify')));
const tag = Date.now().toString(), password = randomUUID(), phone = '09' + tag.slice(-8);
let token;
const checks = [];
function pass(name) { checks.push(name); console.log('PASS ' + name); }
async function api(path, method = 'GET', body, authenticated = true, headers = {}, expected = 200) {
  const response = await fetch(base + '/' + path, { method, signal: AbortSignal.timeout(15000),
    headers: { 'Content-Type': 'application/json', ...(authenticated && token ? { Authorization: 'Bearer ' + token } : {}), ...headers },
    body: body === undefined ? undefined : JSON.stringify(body) });
  const payload = response.status === 204 ? null : await response.json();
  if (expected >= 400) { assert.equal(response.status, expected, JSON.stringify(payload)); return payload; }
  assert.ok(response.ok, method + ' ' + path + ': ' + JSON.stringify(payload));
  assert.ok(!payload?.status || payload.status < 400, JSON.stringify(payload));
  return payload?.data ?? payload;
}
const registered = await api('auth/register', 'POST', { phone, password, fullName: 'V6 verification' }, false);
assert.match(String(registered.user.id), /^[1-9][0-9]*$/);
docker(['exec', 'jewelry-oms-verify-db', 'psql', '-U', 'oms_verify', '-d', 'jewelry_oms_verify', '-v', 'ON_ERROR_STOP=1', '-c',
  "INSERT INTO user_roles(user_id,role_id) SELECT " + registered.user.id + ",id FROM roles WHERE name='ADMIN' ON CONFLICT DO NOTHING"]);
token = (await api('admin/auth/login', 'POST', { phone, password }, false)).accessToken;
const orders = await api('admin/orders?page=1&take=20');
assert.ok(orders.totalElements > 0);
const counts = await api('admin/orders/counts'); assert.equal(counts.total, orders.totalElements);
pass('OMS omitted filters and single counts endpoint return persisted orders');
const numeric = await api('admin/orders/' + orders.content[0].id); assert.equal(numeric.code, orders.content[0].code);
pass('OMS numeric detail needs no full-list ID scan');
const category = await api('admin/catalog/categories', 'POST', { name: 'V6 ' + tag, code: 'V6_' + tag, status: 'ACTIVE' });
const brand = await api('admin/catalog/brands', 'POST', { name: 'V6 brand', code: 'V6_' + tag, status: 'ACTIVE' });
const season = await api('admin/catalog/seasons', 'POST', { name: 'V6 optional season', code: 'V6_' + tag, startMonth: 1, endMonth: 12, isActive: true });
const product = await api('admin/catalog/products', 'POST', { categoryId: Number(category.id), brandId: Number(brand.id), seasonId: Number(season.id),
  code: 'V6_' + tag, name: 'V6 ring', slug: 'v6-' + tag, variants: [{ skuCode: 'V6_' + tag, listPrice: 1000000, onHand: 10, isDefault: true }] });
const detail = await api('admin/catalog/products/' + product.id);
assert.equal(Number(detail.brandId), Number(brand.id)); assert.equal(Number(detail.seasonId), Number(season.id));
await api('admin/catalog/products/' + product.id + '/publish', 'PATCH');
assert.equal((await api('storefront/product/v6-' + tag, 'GET', undefined, false)).code, product.code);
pass('Brand/season numeric assignments persist and published product is public');
const body = { recipientName: 'V6 guest', phone, province: 'HCM', ward: 'P1', addressLine: 'V6 test address',
  shippingMethod: 'STANDARD', paymentMethod: 'COD', items: [{ skuId: Number(product.skus[0].id), quantity: 1 }] };
const key = randomUUID();
const [first, replay] = await Promise.all([1, 2].map(() => api('storefront/order/guest', 'POST', body, false, { 'Idempotency-Key': key })));
assert.equal(first.id, replay.id);
await api('storefront/order/guest', 'POST', { ...body, note: 'changed' }, false, { 'Idempotency-Key': key }, 409);
const after = await api('admin/catalog/products/' + product.id); assert.equal(Number(after.skus[0].availableStock), 9);
pass('Concurrent idempotent guest order returns same ID and reserves once; changed payload rejected');
const header = { bannerName: 'V6 header ' + tag, bannerDisplayStyle: 'TEXT', bannerContent: 'V6 announcement', status: 'ACTIVE',
  bannerStartTime: new Date(Date.now() - 60000).toISOString(), confirmReplaceActive: true };
await api('admin/cms/headers', 'POST', header);
const conflict = await api('admin/cms/headers', 'POST', { ...header, bannerName: 'Conflict', confirmReplaceActive: false }, true, {}, 409);
assert.equal(conflict.errors[0].code, 'HEADER_SCHEDULE_CONFLICT');
await api('admin/cms/logos', 'POST', { name: 'V6 logo', type: 'HEADER', status: 'ACTIVE', logoUrl: '/images/logo.svg' });
await api('admin/cms/footer', 'PUT', { copyrightText: 'V6 test copyright', socialLinks: [], menuColumns: [
  { title: 'Support', orderIndex: 0, items: [{ label: 'Help', url: '/help', orderIndex: 0 }] }] });
const site = await api('storefront/cms/site-layout', 'GET', undefined, false);
assert.equal(site.header.bannerContent, 'V6 announcement'); assert.equal(site.logos.HEADER.logoUrl, '/images/logo.svg');
assert.equal(site.footer.menuColumns[0].items[0].label, 'Help');
pass('Header conflict guard and persisted public header/footer/logo');
const banners = await Promise.all([1, 2].map(index => api('admin/banner/banners', 'POST', {
  internalName: 'V6 banner ' + index, status: 'ACTIVE', mediaUrl: '/images/banner-' + index + '.jpg', mediaMobileUrl: '/images/mobile-' + index + '.jpg' })));
for (const displayType of ['GRID', 'SLIDER', 'DOUBLE_BANNER']) {
  const placement = await api('admin/banner/placements', 'POST', { name: displayType, code: displayType + '_' + tag, displayType, platform: 'ALL', status: 'ACTIVE' });
  const layout = await api('admin/banner/placements/' + placement.id + '/layouts', 'POST', { name: 'V6 layout', status: 'ACTIVE',
    items: banners.map((banner, index) => ({ bannerId: Number(banner.id), slotKey: displayType === 'SLIDER' ? 'main' : 'slot-' + index,
      isActive: true, priority: index, displayMetadata: { slotType: displayType, x: index, y: 0, width: 1, height: 1, order: index } })) });
  assert.ok(layout.items.length === 2);
  const rendered = await api('storefront/banner/placements/code/' + placement.code + '/render', 'GET', undefined, false);
  assert.equal(rendered.slots.length, displayType === 'SLIDER' ? 1 : 2);
  assert.equal(rendered.slots.flatMap(slot => slot.banners).length, 2);
  assert.equal(rendered.slots[0].layout_type, displayType);
  pass(displayType + ' layout persists and public renders correct slots/desktop/mobile assets');
}
const pageBody = { name: 'V6 page', slug: 'v6-page-' + tag, locale: 'vi-VN', status: 'DRAFT', isActive: true, targetDevice: 'DESKTOP',
  blocks: [{ type: 'INFO_CARDS', sortOrder: 0, isVisible: true, config: { cards: [] } }] };
const page = await api('admin/cms/pages', 'POST', pageBody);
await api('admin/cms/pages/' + page.id + '/publish', 'POST');
await api('admin/cms/pages/' + page.id, 'PUT', { ...pageBody, name: 'V6 edited draft' });
const oldPage = await api('storefront/cms/pages/' + pageBody.slug + '?device=DESKTOP', 'GET', undefined, false);
assert.equal(oldPage.page.name, 'V6 page');
await api('admin/cms/pages/' + page.id + '/publish', 'POST');
assert.equal((await api('storefront/cms/pages/' + pageBody.slug + '?device=DESKTOP', 'GET', undefined, false)).page.name, 'V6 edited draft');
await api('storefront/cms/pages/' + pageBody.slug + '?device=MOBILE', 'GET', undefined, false, {}, 404);
pass('CMS draft/public isolation, republish and target-device enforcement');
const template = await api('admin/badge-templates', 'POST', { name: 'V6 label', code: 'V6_' + tag, type: 'TEXT', badgeType: 'CAMPAIGN',
  status: 'ACTIVE', displayText: 'V6', iconMobile: '/images/mobile-icon.svg', styleConfig: { color: '#000000' } });
await api('admin/badge-flow', 'POST', { name: 'V6 manual label', status: 'ACTIVE', ruleType: 'MANUAL', channel: 'WEB',
  activeFrom: new Date(Date.now() - 60000).toISOString(), ruleConfig: { targets: [{ productId: Number(product.id), productVariantId: Number(product.skus[0].id) }] },
  templates: [{ badgeTemplateId: Number(template.id), priorityWeight: 1, isPinned: false }] });
const labels = await api('storefront/badge?skuIds=' + product.skus[0].id, 'GET', undefined, false);
const resolved = labels.find(row => String(row.skuId) === String(product.skus[0].id));
assert.ok(resolved.badges.some(badge => String(badge.id) === String(template.id) && badge.iconMobile === '/images/mobile-icon.svg'));
const unrelated = await api('storefront/badge?skuIds=1', 'GET', undefined, false);
assert.ok(unrelated.every(row => row.badges.every(badge => String(badge.id) !== String(template.id))));
pass('Manual label admin payload resolves on selected SKU');
const dashboard = await api('admin/dashboard/overview?range=LAST_30_DAYS'); assert.ok(Array.isArray(dashboard.kpis));
const exportJob = await api('admin/ie/export/products', 'POST', { productIds: [Number(product.id)] });
assert.equal(exportJob.status, 'DONE'); assert.ok(exportJob.fileUrl);
const download = await fetch(new URL(exportJob.fileUrl, base)); assert.equal(download.status, 200);
assert.ok((await download.text()).includes(product.code));
pass('Dashboard reads real data; product CSV export creates downloadable file');
const csv = 'product_code,product_name,category_code,sku_code,list_price,stock\r\n'
  + `CSV_${tag},CSV ring,V6_${tag},CSV_SKU_${tag},500000,3\r\n`
  + `,Invalid missing code,V6_${tag},BAD_${tag},500000,1\r\n`;
const form = new FormData(); form.append('file', new Blob([csv], { type: 'text/csv' }), 'verification.csv');
const importedResponse = await fetch(base + '/admin/ie/import/products', { method: 'POST', headers: { Authorization: 'Bearer ' + token }, body: form });
assert.ok(importedResponse.ok);
const imported = (await importedResponse.json()).data;
assert.equal(imported.successRows, 1); assert.equal(imported.failedRows, 1);
const rows = await api('admin/ie/jobs/' + imported.jobId + '/result-rows');
assert.equal(rows.totalElements, 2);
pass('CSV import persists valid row and reports invalid row in task results');
console.log(JSON.stringify({ checks: checks.length, database: 'jewelry_oms_verify', backend: 'v6', code: first.code, page: pageBody.slug }));
