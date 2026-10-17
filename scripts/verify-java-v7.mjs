import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';

const policy = { base: 'http://127.0.0.1:8084/api/v1', java: 'jewelry-v7-verify-java', db: 'jewelry-oms-verify-db', database: 'jewelry_oms_verify', user: 'oms_verify' };
assert.equal(process.env.OMS_VERIFY_ISOLATED, '1', 'Only isolated test DB is allowed.');
const docker = args => execFileSync('docker', args, { encoding: 'utf8', windowsHide: true });
const runtime = JSON.parse(docker(['inspect', policy.java]))[0];
const database = JSON.parse(docker(['inspect', policy.db]))[0];
assert.ok(runtime.State.Running && runtime.Config.Env.some(setting => setting.startsWith('DB_URL=') && setting.includes(policy.database)));
assert.ok(database.Config.Env.includes('POSTGRES_DB=' + policy.database));
const tag = Date.now().toString(), phone = '09' + tag.slice(-8), password = randomUUID();
let token;
const passed = [], failures = [], knownBugs = [];
async function response(path, method = 'GET', body, authenticated = true) {
  const res = await fetch(policy.base + '/' + path, { method, signal: AbortSignal.timeout(20000),
    headers: { 'Content-Type': 'application/json', ...(authenticated && token ? { Authorization: 'Bearer ' + token } : {}) },
    body: body === undefined ? undefined : JSON.stringify(body) });
  const payload = res.status === 204 ? null : await res.json();
  const envelope = payload && typeof payload.status === 'number' && payload.status >= 200 && payload.status < 300;
  return { status: res.status, data: envelope ? payload.data ?? null : payload };
}
async function api(path, method = 'GET', body, expected) {
  const result = await response(path, method, body);
  assert.ok(expected ? result.status === expected : result.status < 400, method + ' ' + path + ': ' + JSON.stringify(result));
  return result.data;
}
async function check(name, action) {
  try { await action(); passed.push(name); console.log('PASS ' + name); }
  catch (error) { failures.push({ name, error: error.message }); console.log('FAIL ' + name + ': ' + error.message); }
}
async function reproduce(name, action) {
  try { await action(); console.log('NOT_REPRODUCED ' + name); }
  catch (error) {
    if (error.code !== 'ERR_ASSERTION') { failures.push({ name, error: error.message }); console.log('FAIL setup ' + name + ': ' + error.message); return; }
    knownBugs.push({ name, error: error.message }); console.log('REPRODUCED ' + name + ': ' + error.message);
  }
}
const registered = await api('auth/register', 'POST', { phone, password, fullName: 'V7 isolated verification' });
assert.match(String(registered.user.id), /^[1-9]\d*$/);
docker(['exec', policy.db, 'psql', '-U', policy.user, '-d', policy.database, '-v', 'ON_ERROR_STOP=1', '-c',
  'INSERT INTO user_roles(user_id,role_id) SELECT ' + registered.user.id + ",id FROM roles WHERE name='ADMIN' ON CONFLICT DO NOTHING"]);
token = (await api('admin/auth/login', 'POST', { phone, password })).accessToken;
const category = await api('admin/catalog/categories', 'POST', { code: 'V7_' + tag, name: 'V7 ' + tag, status: 'ACTIVE' });
async function product(suffix, price) {
  const created = await api('admin/catalog/products', 'POST', { categoryId: Number(category.id), code: 'V7_' + tag + suffix,
    name: 'V7 ' + suffix + tag, slug: 'v7-' + tag + suffix.toLowerCase(), variants: [{ skuCode: 'V7_' + tag + suffix, listPrice: price, onHand: 30, isDefault: true }] });
  await api('admin/catalog/products/' + created.id + '/publish', 'PATCH');
  return { ...created, skuId: Number(created.skus[0].id) };
}
const first = await product('A', 100000), second = await product('B', 200000);
const startsAt = new Date(Date.now() - 60000).toISOString(), endsAt = new Date(Date.now() + 86400000).toISOString();
const orderBody = quantity => ({ receiverPhone: phone, firstName: 'V7 guest', provinceName: 'TP HCM', wardName: 'Phường 1', addressLine: 'V7 isolated address',
  items: [{ variationId: first.skuId, quantity }], paymentMethod: 'COD', shippingMethod: 'STANDARD', couponCodes: [] });
async function createOrder(quantity = 1) {
  const body = orderBody(quantity), quote = await api('admin/orders/pricing-context/quote', 'POST', body);
  return api('admin/orders', 'POST', { ...body, idempotencyKey: randomUUID(), pricingEvaluationId: quote.pricingEvaluationId, expectedGrandTotalMinor: Number(quote.pricing.grandTotal) });
}
async function deliver(order) {
  for (const status of ['CONFIRMED', 'SHIPPING', 'DELIVERED']) await api('admin/orders/' + order.id + '/status', 'PATCH', { status });
}
await check('PIM server sort and actor filter', async () => {
  const list = await api('admin/catalog/products?createdById=' + registered.user.id + '&orderBy=createdAt&orderType=DESC&page=1&take=1');
  assert.equal(list.content.length, 1); assert.equal(String(list.content[0].id), String(second.id));
});
await check('Navigation draft isolation, PAGE URL, publish, archive', async () => {
  const page = await api('admin/cms/pages', 'POST', { name: 'V7 page ' + tag, slug: 'v7-page-' + tag, locale: 'vi-VN', blocks: [] });
  const node = await api('admin/cms/navigations', 'POST', { label: 'V7 menu ' + tag, type: 'PAGE', targetId: Number(page.id), url: '/v7-page-' + tag });
  assert.ok(!(await api('storefront/cms/navigation')).items.some(row => String(row.id) === String(node.id)));
  await api('admin/cms/navigations/publish', 'POST');
  const visible = (await api('storefront/cms/navigation')).items.find(row => String(row.id) === String(node.id));
  assert.equal(visible.linkTarget.url, '/v7-page-' + tag);
  await api('admin/cms/navigations/' + node.id + '/archive', 'PATCH');
  await api('admin/cms/navigations/publish', 'POST');
  assert.ok(!(await api('storefront/cms/navigation')).items.some(row => String(row.id) === String(node.id)));
});
await check('Search pins create, public, explicit schedule clear, delete', async () => {
  const current = await api('admin/catalog/search-pinned-products');
  for (const pin of current.list) await api('admin/catalog/search-pinned-products/' + pin.id, 'DELETE');
  const pin = await api('admin/catalog/search-pinned-products', 'POST', { productId: Number(first.id), position: 0, startDate: startsAt, endDate: endsAt });
  assert.ok((await api('storefront/product/search-pinned')).some(row => String(row.id) === String(first.id)));
  const cleared = await api('admin/catalog/search-pinned-products/' + pin.id, 'PATCH', { clearEndDate: true });
  assert.ok(!cleared.endDate);
  await api('admin/catalog/search-pinned-products/' + pin.id, 'DELETE');
});
await check('Product-list banner public visibility and delete placement', async () => {
  const config = await api('admin/banner/product-list-configs', 'POST', { conditionType: 'CATEGORY', targetSlug: category.slug,
    isActive: true, banners: [{ enabled: true, imageUrl: '/uploads/v7-banner.webp', startTime: startsAt, endTime: endsAt, actionType: 'LINK_URL', actionUrl: '/san-pham' }] });
  const visible = await api('storefront/banner/product-list?conditionType=CATEGORY&targetSlug=' + encodeURIComponent(category.slug));
  assert.equal(visible.banners.length, 1);
  await api('admin/banner/product-list-configs/' + config.id, 'PATCH', { isActive: false });
  assert.equal(await api('storefront/banner/product-list?conditionType=CATEGORY&targetSlug=' + encodeURIComponent(category.slug)), null);
  const placement = await api('admin/banner/placements', 'POST', { name: 'V7 empty ' + tag, displayType: 'GRID' });
  await api('admin/banner/placements/' + placement.id, 'DELETE');
});
await check('OMS quote/create idempotency, notes, edit, payment and audit', async () => {
  const body = orderBody(2), quote = await api('admin/orders/pricing-context/quote', 'POST', body);
  const payload = { ...body, pricingEvaluationId: quote.pricingEvaluationId, expectedGrandTotalMinor: Number(quote.pricing.grandTotal), idempotencyKey: randomUUID() };
  const order = await api('admin/orders', 'POST', payload), again = await api('admin/orders', 'POST', payload);
  assert.equal(order.id, again.id); assert.equal(order.source, 'ADMIN'); assert.equal(order.items[0].skuCode, 'V7_' + tag + 'A');
  await api('admin/orders/' + order.id + '/notes', 'POST', { type: 'internal', content: 'V7 verification note' });
  assert.equal((await api('admin/orders/' + order.id + '/notes?type=internal')).length, 1);
  await api('admin/orders/' + order.id, 'PUT', { note: 'V7 edit', addressLine: 'New test address' });
  const paid = await api('admin/orders/' + order.id + '/confirm-payment', 'PUT', {}); assert.equal(paid.paymentStatus, 'PAID');
  await api('admin/orders/' + order.id + '/confirm-payment', 'PUT', {}, 409);
  assert.ok((await api('admin/orders/audit-logs?entityName=oms&entityId=' + order.id)).total >= 4);
});
await check('OMS duplicate and cancel replacement', async () => {
  const source = await createOrder();
  const duplicate = await api('admin/orders/duplicate', 'POST', { sourceOrderId: String(source.id), replaceSourceAfterDuplicate: true });
  assert.notEqual(duplicate.id, source.id);
  assert.equal((await api('admin/orders/' + source.id)).status, 'CANCELLED');
});
await check('Return refund quote/commit, approval, list and reject', async () => {
  const order = await createOrder(3); await deliver(order);
  const req = { orderId: String(order.id), type: 'Refund', reason: 'ChangedMind', returnItems: [{ orderItemId: Number(order.items[0].id), quantity: 1 }] };
  const quote = await api('admin/order-returns/quote', 'POST', req);
  const committed = await api('admin/order-returns/commit', 'POST', { ...req, pricingQuote: quote.quoteReference });
  const pending = await api('admin/order-returns/' + committed.orderReturnCode);
  const approved = await api('admin/order-returns/' + pending.id + '/approve', 'PUT', { note: 'Verified test' });
  assert.equal(approved.status, 'Completed'); assert.equal(Number(approved.totalRefundAmount), 100000);
  await api('admin/order-returns/' + pending.id + '/approve', 'PUT', {}, 409);
  const reject = await api('admin/order-returns', 'POST', req);
  await api('admin/order-returns/' + reject.id + '/reject', 'PUT', { note: 'Test rejected' });
  assert.ok((await api('admin/order-returns/list', 'POST', { status: 'Completed' })).total >= 1);
});
async function campaign(schemaType) {
  const draft = await api('admin/promotions/drafts', 'POST', { name: 'V7 ' + schemaType + tag, startsAt, endsAt });
  const prefix = 'admin/promotions/drafts/' + draft.id;
  await api(prefix + '/target', 'PUT', { config: { type: 'MANUAL', version: '1.0.0', skuIds: [String(first.skuId)], lineFilter: { discountState: 'ANY' } } });
  await api(prefix + '/audience', 'PUT', { config: { type: 'ALL', version: '1.0.0' } });
  await api(prefix + '/applicability', 'PUT', { config: { type: 'CHANNEL', version: '1.0.0', channels: ['ONLINE'] } });
  const schema = await api(prefix + '/schemas', 'POST', { name: schemaType + tag, schemaType, costSources: ['ECOMMERCE'], conditionMode: 'IMPLICIT_ALWAYS' });
  await api(prefix + '/schemas/' + schema.id + '/condition', 'PUT', { configType: 'ALWAYS', configVersion: '1.0.0', values: {} });
  await api(prefix + '/schemas/' + schema.id + '/benefit', 'PUT', { configType: schemaType, configVersion: '1.0.0', values: { discountKind: 'PERCENT', discountValue: 10 } });
  return { draft, schema, prefix };
}
await check('Promotion wizard publish and pause/resume/end lifecycle', async () => {
  const created = await campaign('MARKDOWN');
  const published = await api(created.prefix + '/publish', 'POST');
  const id = published.publishedPromotion.id;
  assert.ok((await api('admin/promotions/campaigns')).items.some(row => String(row.id) === String(id) && row.source === 'PUBLISHED'));
  for (const action of ['pause', 'resume', 'end']) await api('admin/promotions/published/' + id + '/' + action, 'POST');
});
await reproduce('Voucher target is lost between wizard runtime and actual checkout', async () => {
  const created = await campaign('VOUCHER'), code = 'V7_' + tag;
  await api(created.prefix + '/schemas/' + created.schema.id + '/voucher-codes', 'PUT', { code, status: 'ACTIVE', visibilityDistributionPolicy: {
    type: 'VOUCHER_VISIBILITY_DISTRIBUTION_POLICY', version: '1.0.0', visibilityType: 'PUBLIC', distributionChannels: [] } });
  await api(created.prefix + '/publish', 'POST');
  const quote = await response('admin/orders/pricing-context/quote', 'POST', { ...orderBody(1), items: [{ variationId: second.skuId, quantity: 1 }], couponCodes: [code] });
  assert.ok(quote.status >= 400 || !quote.data.couponCodes.includes(code), 'Voucher targeting A was applied to B: ' + JSON.stringify(quote.data.pricing));
});
await reproduce('Exchange approval mixes stored prices and current replacement prices', async () => {
  const order = await createOrder(1); await deliver(order);
  const request = await api('admin/order-returns', 'POST', { orderId: String(order.id), type: 'Exchange', reason: 'ChangedMind',
    returnItems: [{ orderItemId: Number(order.items[0].id), quantity: 1 }], exchangeItems: [{ variationId: second.skuId, quantity: 1 }] });
  await api('admin/catalog/products/' + second.id + '/variants/' + second.skuId, 'PUT', { skuCode: 'V7_' + tag + 'B', listPrice: 300000 });
  const approved = await response('admin/order-returns/' + request.id + '/approve', 'PUT', {});
  if (approved.status >= 400) return;
  const replacement = await api('admin/orders/' + approved.data.exchangeFulfillmentOrderId);
  assert.equal(Number(replacement.grandTotal), Number(approved.data.priceDifference), 'Replacement grand total differs from approved return difference');
});
await reproduce('CSV new-product import lost its transactional entry point', async () => {
  const csv = 'product_code,product_name,category_code,sku_code,list_price,stock\r\n' + `CSV7_${tag},CSV V7,V7_${tag},CSV7_SKU_${tag},500000,3\r\n`;
  const body = new FormData(); body.append('file', new Blob([csv], { type: 'text/csv' }), 'v7.csv');
  const result = await fetch(policy.base + '/admin/ie/import/products', { method: 'POST', headers: { Authorization: 'Bearer ' + token }, body });
  assert.ok(result.ok);
  const job = (await result.json()).data;
  const rows = await api('admin/ie/jobs/' + job.jobId + '/result-rows');
  assert.equal(job.successRows, 1, JSON.stringify(rows.content?.map(row => row.message)));
});
await reproduce('Concurrent approval of the same partial return runs more than once', async () => {
  const order = await createOrder(4); await deliver(order);
  const pending = await api('admin/order-returns', 'POST', { orderId: String(order.id), type: 'Refund', reason: 'ChangedMind',
    returnItems: [{ orderItemId: Number(order.items[0].id), quantity: 1 }] });
  const results = await Promise.all(Array.from({ length: 6 }, () => response('admin/order-returns/' + pending.id + '/approve', 'PUT', {})));
  assert.equal(results.filter(result => result.status === 200).length, 1, JSON.stringify(results.map(result => result.status)));
});
console.log(JSON.stringify({ backend: 'v7', passed: passed.length, failures, knownBugs, database: policy.database, fixture: first.slug }));
if (failures.length || knownBugs.length) process.exitCode = 1;
