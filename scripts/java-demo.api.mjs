import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { basename, extname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { DEMO_POLICY } from './java-demo.data.mjs';

export const baseUrl = process.env.JEWELRY_DEMO_API_URL ?? 'http://localhost:8082/api/v1';
const publicRoot = fileURLToPath(new URL('../public/', import.meta.url));
const assetCache = new Map();
let token;
export function verifyLocalDatabase() {
  assert.equal(process.env.JEWELRY_DEMO_CONFIRM, 'CREATE_LOCAL_DEMO', 'Explicit confirmation required.');
  assert.ok(['localhost', '127.0.0.1'].includes(new URL(baseUrl).hostname), 'Only local API allowed.');
  const containers = JSON.parse(execFileSync('docker', ['inspect', 'jewelry-java-local'], { encoding: 'utf8', windowsHide: true }));
  assert.ok(containers[0].State.Running);
  assert.ok(containers[0].Config.Env.includes('DB_URL=jdbc:postgresql://jewelry-commerce-postgres:5432/kltn_ecommerce'), 'Unexpected database; stop.');
}
export async function api(path, method = 'GET', body, authenticated = true) {
  const multipart = body instanceof FormData;
  const response = await fetch(baseUrl + '/' + path, {
    method, signal: AbortSignal.timeout(DEMO_POLICY.timeout),
    headers: { ...(multipart ? {} : { 'Content-Type': 'application/json' }), ...(authenticated && token ? { Authorization: 'Bearer ' + token } : {}) },
    body: body === undefined ? undefined : multipart ? body : JSON.stringify(body),
  });
  const payload = response.status === 204 ? null : await response.json();
  assert.ok(response.ok, method + ' ' + path + ': ' + JSON.stringify(payload));
  return payload && typeof payload.status === 'number' ? payload.data ?? null : payload;
}
export async function login() {
  assert.ok(process.env.JEWELRY_DEMO_PASSWORD, 'Set JEWELRY_DEMO_PASSWORD in process environment.');
  const session = await api('admin/auth/login', 'POST', {
    phone: process.env.JEWELRY_DEMO_PHONE ?? '0796406514', password: process.env.JEWELRY_DEMO_PASSWORD,
  }, false);
  token = session.accessToken;
  assert.ok(session.user.roles.includes('ADMIN'));
}
export async function upload(relativePath) {
  if (assetCache.has(relativePath)) return assetCache.get(relativePath);
  const absolute = resolve(publicRoot, relativePath);
  assert.ok(absolute.startsWith(resolve(publicRoot) + sep), 'Asset must stay within public.');
  const bytes = await readFile(absolute);
  const mime = { '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp' }[extname(absolute)];
  assert.ok(mime, 'Only existing image assets are allowed.');
  const form = new FormData(); form.append('file', new Blob([bytes], { type: mime }), basename(absolute));
  const result = await api('admin/catalog/upload', 'POST', form);
  assert.ok(result.url);
  assetCache.set(relativePath, result.url);
  return result.url;
}
export const numericId = value => { const id = Number(value); assert.ok(Number.isSafeInteger(id) && id > 0); return id; };
export function demoBlock(type, config) {
  return { type, isVisible: true, config: { ...config, demoNamespace: DEMO_POLICY.namespace } };
}

