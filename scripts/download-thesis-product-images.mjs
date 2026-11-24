/** Tải ảnh minh họa bạc (Unsplash) vào public/images/product/<danh-muc>/ — không dùng ảnh Sevatrading. */
import { mkdir, copyFile, access } from 'node:fs/promises';
import { constants } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../public/images/product/', import.meta.url));

const URLS = [
  'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?auto=format&fit=crop&w=900&q=80',
];

const FOLDERS = ['nhan', 'day-chuyen', 'vong-tay', 'khuyen-tai', 'lac-tay', 'charm'];

async function exists(path) {
  try {
    await access(path, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

async function download(url, dest) {
  const response = await fetch(url);
  if (!response.ok) throw new Error('HTTP ' + response.status + ' ' + url);
  const bytes = Buffer.from(await response.arrayBuffer());
  const { writeFile } = await import('node:fs/promises');
  await writeFile(dest, bytes);
}

for (const folder of FOLDERS) {
  const dir = join(root, folder);
  await mkdir(dir, { recursive: true });
  for (let style = 1; style <= 10; style += 1) {
    const primary = join(dir, `${folder}-${style}.1.jpg`);
    if (!(await exists(primary))) {
      const url = URLS[(style + FOLDERS.indexOf(folder)) % URLS.length];
      try {
        await download(url, primary);
        process.stdout.write(`OK ${folder}-${style}\n`);
      } catch (error) {
        const fallback = URLS[0];
        await download(fallback, primary);
        process.stdout.write(`FALLBACK ${folder}-${style} ${error.message}\n`);
      }
    }
    for (const shot of [2, 3]) {
      const dest = join(dir, `${folder}-${style}.${shot}.jpg`);
      if (!(await exists(dest))) await copyFile(primary, dest);
    }
  }
}
process.stdout.write('DONE thesis product images under ' + root + '\n');
