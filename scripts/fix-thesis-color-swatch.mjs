/**
 * Re-download Bạc swatch (original, not 72px), upload via admin catalog,
 * save durable public copy, attach to Màu sắc attributes.
 */
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { api, login, publicMediaUrl, verifyThesisTarget } from './thesis-catalog.api.mjs';

verifyThesisTarget();
await login();

const SOURCE =
  'https://cdn-media-stg.sevagoretail.jewelry/v1/img/staging-external-trading/019feadc-10b3-7783-bef5-a91ecbc238e7/v-c81fccec/original.webp';
const RELATIVE = 'images/attributes/mau-bac.webp';
const publicRoot = fileURLToPath(new URL('../public/', import.meta.url));

const downloaded = await fetch(SOURCE, { signal: AbortSignal.timeout(60000) });
assert.ok(downloaded.ok, 'download failed ' + downloaded.status);
const bytes = Buffer.from(await downloaded.arrayBuffer());
assert.ok(bytes.length > 1000, 'swatch too small: ' + bytes.length);

const absolute = resolve(publicRoot, RELATIVE);
await mkdir(dirname(absolute), { recursive: true });
await writeFile(absolute, bytes);
process.stdout.write('SAVED_PUBLIC ' + absolute + ' bytes=' + bytes.length + '\n');

const form = new FormData();
form.append('file', new Blob([bytes], { type: 'image/webp' }), 'mau-bac.webp');
const uploaded = await api('admin/catalog/upload', 'POST', form);
assert.ok(uploaded?.url, 'admin upload missing url');
const origin = new URL(process.env.JEWELRY_DEMO_API_URL || 'https://jewelry-ecommerce-be-java.onrender.com/api/v1').origin;
const adminUrl = String(uploaded.url).startsWith('http') ? uploaded.url : origin + uploaded.url;
process.stdout.write('UPLOAD_ADMIN ' + adminUrl + '\n');

// Durable display URL (Render disk is ephemeral). File is also in client public/.
const imageUrl = publicMediaUrl(RELATIVE);
process.stdout.write('ATTR_IMAGE ' + imageUrl + '\n');

const attrs = await api('admin/catalog/attributes?take=100');
const list = Array.isArray(attrs) ? attrs : attrs.content ?? [];
const metal = list.find((row) => row.code === 'JEW_METAL_COLOR');
const demo = list.find((row) => row.code === 'DEMO_COLOR');
assert.ok(metal, 'JEW_METAL_COLOR missing');

await api('admin/catalog/attributes/' + metal.id, 'PUT', {
  name: 'Màu sắc',
  code: metal.code,
  type: metal.type || 'SELECT',
  displayType: 'IMAGE',
  status: 'ACTIVE',
  values: (metal.values || []).map((value) => ({
    id: Number(value.id),
    code: value.code,
    value: value.value || value.name || value.code,
    imageUrl: (value.value || value.name || value.code) === 'Bạc' ? imageUrl : value.imageUrl || undefined,
  })),
});
process.stdout.write('UPDATED JEW_METAL_COLOR -> name Màu sắc + Bạc image\n');

if (demo) {
  await api('admin/catalog/attributes/' + demo.id, 'PUT', {
    name: 'Màu sắc (demo cũ)',
    code: demo.code,
    type: demo.type || 'SELECT',
    displayType: 'IMAGE',
    status: 'INACTIVE',
    values: (demo.values || []).map((value) => ({
      id: Number(value.id),
      code: value.code,
      value: value.value || value.name || value.code,
      imageUrl: (value.value || value.name || value.code) === 'Bạc' ? imageUrl : value.imageUrl || undefined,
    })),
  });
  process.stdout.write('DEMO_COLOR set INACTIVE to avoid duplicate name\n');
}

const check = await api('admin/catalog/attributes?take=100');
for (const row of check) {
  if (row.code === 'JEW_METAL_COLOR' || row.code === 'DEMO_COLOR') {
    const bac = (row.values || []).find((value) => (value.value || value.name) === 'Bạc');
    process.stdout.write([row.code, row.name, row.status, row.displayType, bac?.imageUrl].join(' | ') + '\n');
  }
}
process.stdout.write('DONE\n');
