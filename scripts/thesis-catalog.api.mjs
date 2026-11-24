import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { basename, extname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { THESIS_POLICY } from './thesis-catalog.data.mjs';

export const baseUrl = process.env.JEWELRY_DEMO_API_URL ?? 'https://jewelry-ecommerce-be-java.onrender.com/api/v1';
const publicRoot = fileURLToPath(new URL('../public/', import.meta.url));
const assetCache = new Map();
let token;

export function verifyThesisTarget() {
  assert.equal(process.env.JEWELRY_DEMO_CONFIRM, THESIS_POLICY.confirm, 'Set JEWELRY_DEMO_CONFIRM=' + THESIS_POLICY.confirm);
  const host = new URL(baseUrl).hostname;
  assert.ok(host.includes('onrender.com') || host === 'localhost' || host === '127.0.0.1', 'Unexpected API host: ' + host);
}

export async function api(path, method = 'GET', body, authenticated = true) {
  const multipart = body instanceof FormData;
  const response = await fetch(baseUrl + '/' + path, {
    method,
    signal: AbortSignal.timeout(THESIS_POLICY.timeout),
    headers: {
      ...(multipart ? {} : { 'Content-Type': 'application/json' }),
      ...(authenticated && token ? { Authorization: 'Bearer ' + token } : {}),
    },
    body: body === undefined ? undefined : multipart ? body : JSON.stringify(body),
  });
  const payload = response.status === 204 ? null : await response.json().catch(() => null);
  assert.ok(response.ok, method + ' ' + path + ': ' + JSON.stringify(payload));
  return payload && typeof payload.status === 'number' ? payload.data ?? null : payload;
}

export async function login() {
  assert.ok(process.env.JEWELRY_DEMO_PASSWORD, 'Set JEWELRY_DEMO_PASSWORD in the process environment (do not commit).');
  const session = await api('admin/auth/login', 'POST', {
    phone: process.env.JEWELRY_DEMO_PHONE ?? '0796406514',
    password: process.env.JEWELRY_DEMO_PASSWORD,
  }, false);
  token = session.accessToken;
  assert.ok(session.user.roles.includes('ADMIN'));
}

/** Durable public URL for assets already shipped in client `public/` (Vercel). */
export function publicMediaUrl(relativePath) {
  const site = (
    process.env.JEWELRY_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    'https://jewelry-ecommerce-client.vercel.app'
  ).replace(/\/$/, '');
  return `${site}/${String(relativePath).replace(/^\//, '')}`;
}

/**
 * Resolve thesis media.
 * Default: durable public client URL (survives Render redeploys).
 * Set JEWELRY_MEDIA_MODE=be-upload to force admin/catalog/upload (Cloudinary when BE provider=cloudinary).
 */
export async function upload(relativePath) {
  if (assetCache.has(relativePath)) return assetCache.get(relativePath);
  const absolute = resolve(publicRoot, relativePath);
  assert.ok(absolute.startsWith(resolve(publicRoot) + sep), 'Asset must stay within public.');

  if (process.env.JEWELRY_MEDIA_MODE !== 'be-upload') {
    const durable = publicMediaUrl(relativePath);
    assetCache.set(relativePath, durable);
    return durable;
  }

  const bytes = await readFile(absolute);
  const mime = { '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp' }[extname(absolute)];
  assert.ok(mime, 'Unsupported image type: ' + absolute);
  const form = new FormData();
  form.append('file', new Blob([bytes], { type: mime }), basename(absolute));
  const result = await api('admin/catalog/upload', 'POST', form);
  assert.ok(result.url);
  const origin = new URL(baseUrl).origin;
  const url = result.url.startsWith('/api/v1/storefront/files/')
    ? origin + result.url
    : result.url;
  // Prefer durable public assets when BE still returns ephemeral Render disk URLs.
  const finalUrl = /\/storefront\/files\//i.test(url) ? publicMediaUrl(relativePath) : url;
  assetCache.set(relativePath, finalUrl);
  return finalUrl;
}

export const numericId = (value) => {
  const id = Number(value);
  assert.ok(Number.isSafeInteger(id) && id > 0);
  return id;
};

export function thesisBlock(type, config) {
  return { type, isVisible: true, config: { ...config, demoNamespace: THESIS_POLICY.namespace } };
}
