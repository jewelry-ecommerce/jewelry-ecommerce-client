import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { randomBytes } from "node:crypto";

const policy = {
  baseUrl: process.env.OMS_VERIFY_API || "http://127.0.0.1:8084/api/v1",
  container: "jewelry-oms-verify-db", database: "jewelry_oms_verify", username: "oms_verify",
};
const endpoint = new URL(policy.baseUrl);
assert.equal(process.env.OMS_VERIFY_ISOLATED, "1", "Set OMS_VERIFY_ISOLATED=1 for disposable DB only.");
assert.ok(["localhost", "127.0.0.1"].includes(endpoint.hostname) && endpoint.port === "8084",
  "Refuse writes outside isolated localhost:8084 verification server.");
const password = randomBytes(16).toString("hex");
const tag = Date.now().toString();
const phone = (suffix) => "09" + (Number(tag.slice(-8)) + suffix).toString().padStart(8, "0").slice(-8);
const checks = [];
function passed(name) { checks.push(name); console.log("PASS " + name); }
async function request(path, method = "GET", body, token, guestId, allowError = false) {
  const response = await fetch(policy.baseUrl + "/" + path, {
    signal: AbortSignal.timeout(15000),
    method, headers: { "Content-Type": "application/json",
      ...(token ? { Authorization: "Bearer " + token } : {}), ...(guestId ? { "x-guest-id": guestId } : {}) },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const payload = response.status === 204 ? null : await response.json();
  const status = typeof payload?.status === "number" && payload.status >= 400 ? payload.status : response.status;
  if (status >= 400 && !allowError) throw new Error(method + " " + path + ": " + JSON.stringify(payload));
  return { data: payload?.data ?? payload, status, httpStatus: response.status };
}
async function register(suffix) {
  const result = await request("auth/register", "POST", {
    phone: phone(suffix), password, fullName: "OMS verification " + tag + "-" + suffix,
  });
  assert.ok(result.data.accessToken);
  return result.data;
}
function grantAdmin(userId) {
  assert.match(String(userId), /^[1-9][0-9]*$/);
  const metadata = JSON.parse(execFileSync("docker", ["inspect", policy.container], { encoding: "utf8", windowsHide: true }))[0];
  assert.ok(metadata.Config.Env.includes("POSTGRES_DB=" + policy.database));
  execFileSync("docker", ["exec", policy.container, "psql", "-U", policy.username, "-d", policy.database,
    "-v", "ON_ERROR_STOP=1", "-c",
    "INSERT INTO user_roles(user_id,role_id) SELECT " + userId + ",id FROM roles WHERE name='ADMIN' ON CONFLICT DO NOTHING"],
    { encoding: "utf8", windowsHide: true });
}
async function createCatalog(adminToken) {
  const category = (await request("admin/catalog/categories", "POST",
    { name: "OMS test " + tag, code: "OMS-" + tag, status: "ACTIVE" }, adminToken)).data;
  const product = (await request("admin/catalog/products", "POST", {
    categoryId: Number(category.id), code: "OMS-" + tag, name: "OMS verification ring", slug: "oms-" + tag,
    variants: [1, 2].map(index => ({ skuCode: "OMS-" + tag + "-" + index, listPrice: 1000000,
      onHand: 10, isDefault: index === 1 })),
  }, adminToken)).data;
  await request("admin/catalog/products/" + product.id + "/publish", "PATCH", undefined, adminToken);
  const published = (await request("storefront/product/oms-" + tag)).data;
  assert.equal(published.skus.length, 2);
  passed("PIM publish -> public product/SKU");
  return product;
}
const address = { recipientName: "OMS verification customer", phone: phone(4),
  province: "Ho Chi Minh", district: "", ward: "Phuong 1", addressLine: "OMS test address",
  shippingMethod: "STANDARD", paymentMethod: "COD" };
async function stock(product, adminToken) {
  const detail = (await request("admin/catalog/products/" + product.id, "GET", undefined, adminToken)).data;
  return detail.skus.map(sku => Number(sku.availableStock));
}
async function guestFlow(product, adminToken) {
  const skuId = Number(product.skus[0].id), retainedSku = Number(product.skus[1].id);
  const cart = (await request("storefront/cart/cart", "PUT", { variationId: String(skuId), quantity: 2 })).data;
  assert.ok(cart.guestId);
  const guestId = cart.guestId;
  await request("storefront/cart/cart", "PUT", { variationId: String(retainedSku), quantity: 1 }, undefined, guestId);
  const detail = (await request("storefront/cart/cart", "GET", undefined, undefined, guestId)).data;
  assert.equal(detail.items.length, 2);
  passed("Guest cart absolute quantity + persisted guest ID");
  const body = { ...address, items: [{ skuId, quantity: 2 }] };
  const quote = (await request("storefront/checkout/quote/guest", "POST", body)).data;
  assert.equal(Number(quote.summary.grandTotal), 2000000);
  const order = (await request("storefront/order/guest", "POST", body, undefined, guestId)).data;
  assert.ok(order.id && order.code);
  assert.equal(Number(order.grandTotal), Number(quote.summary.grandTotal));
  assert.equal(order.paymentStatus, "UNPAID");
  passed("Guest quote -> real COD order, no online payment");
  const afterCart = (await request("storefront/cart/cart", "GET", undefined, undefined, guestId)).data;
  assert.equal(afterCart.items.some(item => Number(item.variationId) === skuId), false);
  assert.equal(afterCart.items.some(item => Number(item.variationId) === retainedSku), true);
  assert.deepEqual(await stock(product, adminToken), [8, 10]);
  passed("Placed lines removed; unselected cart line retained; stock reserved");
  assert.equal((await request("storefront/order/guest/" + order.code + "?phone=" + phone(4))).data.code, order.code);
  assert.equal((await request("storefront/order/guest/" + order.code + "?phone=0900000000",
    "GET", undefined, undefined, undefined, true)).status, 404);
  passed("Guest lookup requires matching phone");
  for (const status of ["CONFIRMED", "SHIPPING", "DELIVERED"]) {
    const updated = (await request("admin/orders/" + order.code + "/status", "PATCH", { status }, adminToken)).data;
    assert.equal(updated.status, status);
    assert.equal(updated.paymentStatus, status === "DELIVERED" ? "PAID" : "UNPAID");
  }
  passed("Admin PENDING -> CONFIRMED -> SHIPPING -> DELIVERED; COD paid on delivery");
  return { guestId, code: order.code, retainedSku };
}
async function accountFlow(product, adminToken, guest) {
  const user = await register(2);
  await request("storefront/cart/cart/merge", "POST", {}, user.accessToken, guest.guestId);
  const merged = (await request("storefront/cart/cart", "GET", undefined, user.accessToken)).data;
  assert.ok(merged.items.some(item => Number(item.variationId) === guest.retainedSku));
  passed("Guest -> customer cart merge");
  const saved = (await request("storefront/me/addresses", "POST", address, user.accessToken)).data;
  const body = { addressId: Number(saved.id), paymentMethod: "COD", shippingMethod: "STANDARD",
    items: [{ skuId: guest.retainedSku, quantity: 1 }] };
  const quote = (await request("storefront/checkout/quote", "POST", body, user.accessToken)).data;
  const order = (await request("storefront/order", "POST", body, user.accessToken)).data;
  assert.equal(Number(order.grandTotal), Number(quote.summary.grandTotal));
  const mine = (await request("storefront/order", "GET", undefined, user.accessToken)).data;
  assert.ok(mine.content.some(entry => entry.code === order.code));
  assert.equal((await request("storefront/order/" + order.code, "GET", undefined, user.accessToken)).data.code, order.code);
  passed("Customer saved address -> COD -> history -> order detail");
  const another = await register(3);
  assert.equal((await request("storefront/order/" + order.code, "GET", undefined, another.accessToken, undefined, true)).status, 404);
  passed("Order ownership prevents another customer reading order");
  await request("storefront/order/" + order.code + "/cancel", "POST", { reason: "OMS smoke verification" }, user.accessToken);
  assert.deepEqual(await stock(product, adminToken), [8, 10]);
  const second = await request("storefront/order/" + order.code + "/cancel", "POST", {}, user.accessToken, undefined, true);
  assert.equal(second.status, 400);
  assert.deepEqual(await stock(product, adminToken), [8, 10]);
  passed("Cancellation releases stock exactly once");
}
const adminUser = await register(1);
grantAdmin(adminUser.user.id);
const adminToken = (await request("admin/auth/login", "POST", { phone: phone(1), password })).data.accessToken;
assert.ok(adminToken);
const product = await createCatalog(adminToken);
const guest = await guestFlow(product, adminToken);
await accountFlow(product, adminToken, guest);
const invalid = await request("storefront/order/guest", "POST",
  { ...address, items: [{ skuId: 999999999, quantity: 1 }] }, undefined, undefined, true);
assert.equal(invalid.status, 404);
console.log(JSON.stringify({ checks: checks.length, guestOrderCode: guest.code,
  invalidOrder: { httpStatus: invalid.httpStatus, businessStatus: invalid.status },
  server: policy.baseUrl, database: policy.database }, null, 2));
