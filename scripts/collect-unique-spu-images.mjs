/**
 * Thu thập bộ ảnh unique từ catalog public mẫu + local demo PNG (chỉ nguồn ảnh, không dùng brand đó trên storefront).
 * Mỗi SPU = 1 bộ riêng (không share), tối đa 4 ảnh/SPU.
 * Output: .demo-data/spu-image-sets.json
 */
import { mkdir, readdir, writeFile, copyFile, readFile } from 'node:fs/promises';
import { basename, extname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const root = fileURLToPath(new URL('..', import.meta.url));
const publicRoot = join(root, 'public');
const outDir = join(root, '.demo-data');
const setsDir = join(outDir, 'spu-sets');
await mkdir(setsDir, { recursive: true });

const CATEGORY_RULES = [
  { code: 'RING', folder: 'nhan', name: 'Nhẫn', match: /(^|\s)nhẫn(\s|$)|\/nhan-/i, seoPrefix: 'Nhẫn bạc' },
  { code: 'NECKLACE', folder: 'day-chuyen', name: 'Dây chuyền', match: /dây chuyền|day-chuyen|pendant|necklace/i, seoPrefix: 'Dây chuyền bạc' },
  { code: 'BRACELET', folder: 'vong-tay', name: 'Vòng tay', match: /vòng tay|vong-tay|bracelet|cuff/i, seoPrefix: 'Vòng tay bạc' },
  { code: 'EARRING', folder: 'khuyen-tai', name: 'Khuyên tai', match: /khuyên tai|khuyen-tai|earring|hoa tai/i, seoPrefix: 'Khuyên tai bạc' },
  { code: 'BANGLE', folder: 'lac-tay', name: 'Lắc tay', match: /lắc tay|lac-tay|bangle|tennis/i, seoPrefix: 'Lắc tay bạc' },
  { code: 'CHARM', folder: 'charm', name: 'Charm', match: /charm|mặt dây|mat-day/i, seoPrefix: 'Charm bạc' },
];

function toOriginal(url) {
  return url
    .replace(/\\+$/, '')
    .replace(/\/w\d+_h\d+_q\d+\.(webp|jpg|jpeg|png)$/i, '/original.$1')
    .replace(/\.webp$/i, '.jpg');
}

function assetKey(url) {
  const m = url.match(/\/([0-9a-f-]{20,})\/v-[a-f0-9]+\//i);
  return m ? m[1] : url;
}

function classify(title, href) {
  const hay = `${title} ${href}`;
  for (const rule of CATEGORY_RULES) {
    if (rule.match.test(hay)) return rule;
  }
  // Naming mặc định trên nguồn public: Charm* / Nhẫn*
  if (/^charm/i.test(title)) return CATEGORY_RULES.find((r) => r.code === 'CHARM');
  if (/^nhẫn/i.test(title)) return CATEGORY_RULES.find((r) => r.code === 'RING');
  return CATEGORY_RULES.find((r) => r.code === 'CHARM');
}

function seoName(rule, rawTitle, index) {
  const cleaned = String(rawTitle)
    .replace(/\s+/g, ' ')
    .replace(/White Gem|Rosaline Gem|Violet Gem|Canary Gem|Emerald Gem|Light Topaz Gem/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
  // Keep Vietnamese category keyword first for SEO.
  if (cleaned.toLowerCase().startsWith(rule.seoPrefix.toLowerCase())) return cleaned;
  if (/^(nhẫn|dây chuyền|vòng tay|khuyên tai|lắc tay|charm)\b/i.test(cleaned)) {
    return cleaned.replace(/^(charm)\b/i, 'Charm bạc');
  }
  return `${rule.seoPrefix} ${cleaned}`.replace(/\s+/g, ' ').trim();
}

async function fetchListingProducts() {
  const res = await fetch('https://heartlock.com.vn/san-pham', {
    headers: { 'User-Agent': 'Mozilla/5.0 ThesisCollector/1.0' },
  });
  const html = await res.text();
  const products = [];
  const blockRe = /aria-label="([^"]+)" href="(\/san-pham\/[^"]+)"[\s\S]*?src="(https:\/\/cdn-media\.sevaretail\.com\.vn[^"]+)"[\s\S]*?(?:src="(https:\/\/cdn-media\.sevaretail\.com\.vn[^"]+)")?/gi;
  let match;
  while ((match = blockRe.exec(html))) {
    const title = match[1];
    const href = match[2];
    const primary = toOriginal(match[3]);
    const hover = match[4] ? toOriginal(match[4]) : null;
    const images = [...new Set([primary, hover].filter(Boolean))];
    products.push({ title, href, images });
  }
  return products;
}

async function fetchDetailImages(href) {
  try {
    const res = await fetch('https://heartlock.com.vn' + href, {
      headers: { 'User-Agent': 'Mozilla/5.0 ThesisCollector/1.0' },
      signal: AbortSignal.timeout(20000),
    });
    if (!res.ok) return [];
    const html = await res.text();
    const imgs = [...html.matchAll(/https:\/\/cdn-media\.sevaretail\.com\.vn\/v1\/img\/[^"'\\\s>]+\.(?:jpg|jpeg|png|webp)/gi)]
      .map((m) => toOriginal(m[0]))
      .filter((u) => !/\.svg$/i.test(u));
    // Prefer product-sized assets
    const ranked = imgs.filter((u) => /original\.(jpg|jpeg|png)$/i.test(u) || /w1050_h1320/i.test(u));
    const keys = new Set();
    const unique = [];
    for (const url of ranked.length ? ranked : imgs) {
      const key = assetKey(url);
      if (keys.has(key)) continue;
      keys.add(key);
      unique.push(url.includes('/original.') ? url : url.replace(/\/w\d+_h\d+_q\d+\.\w+$/i, (ext) => {
        const m = url.match(/\/(w\d+_h\d+_q\d+\.\w+)$/);
        return '/original.jpg';
      }));
    }
    return unique.slice(0, 8);
  } catch {
    return [];
  }
}

async function download(url, dest) {
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 ThesisCollector/1.0' }, redirect: 'follow' });
  if (!res.ok) throw new Error('HTTP ' + res.status + ' ' + url);
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 1000) throw new Error('Too small ' + url);
  await writeFile(dest, buf);
  return createHash('sha1').update(buf).digest('hex');
}

async function localUniqueCandidates(folder) {
  const dir = resolve(publicRoot, 'images/product', folder);
  const files = await readdir(dir).catch(() => []);
  const byStyle = new Map();
  for (const file of files) {
    if (!/\.(jpe?g|png|webp)$/i.test(file) || file.startsWith('_') || file.startsWith('ai-')) continue;
    const m = file.match(/^(.+)-(\d+)\.(\d+)\./);
    if (!m) continue;
    const style = `${m[1]}-${m[2]}`;
    const shot = Number(m[3]);
    if (!byStyle.has(style)) byStyle.set(style, []);
    byStyle.get(style).push({ shot, path: join(dir, file), file });
  }
  // Only keep style's first unique file (shots often duplicated)
  const out = [];
  for (const [style, shots] of byStyle) {
    shots.sort((a, b) => a.shot - b.shot);
    out.push({ style, path: shots[0].path });
  }
  return out;
}

const listing = await fetchListingProducts();
console.log('LISTING', listing.length);

const usedAssets = new Set();
const grouped = Object.fromEntries(CATEGORY_RULES.map((r) => [r.code, []]));

for (const [index, product] of listing.entries()) {
  const rule = classify(product.title, product.href);
  const detailImgs = await fetchDetailImages(product.href);
  const combined = [];
  for (const url of [...detailImgs, ...product.images]) {
    const key = assetKey(url);
    if (usedAssets.has(key)) continue;
    if (combined.some((u) => assetKey(u) === key)) continue;
    combined.push(url);
    if (combined.length >= 4) break;
  }
  if (!combined.length) continue;
  // Reserve all chosen assets exclusively for this SPU
  combined.forEach((u) => usedAssets.add(assetKey(u)));
  grouped[rule.code].push({
    source: 'heartlock',
    title: product.title,
    href: product.href,
    seoName: seoName(rule, product.title, index),
    images: combined,
  });
  if ((index + 1) % 20 === 0) process.stdout.write(`DETAIL ${index + 1}/${listing.length}\n`);
}

// Fill thin categories with exclusive local unique heroes (1 image sets expanded later)
for (const rule of CATEGORY_RULES) {
  const locals = await localUniqueCandidates(rule.folder);
  for (const local of locals) {
    if (grouped[rule.code].length >= 25) break;
    const key = 'local:' + local.path;
    if (usedAssets.has(key)) continue;
    usedAssets.add(key);
    grouped[rule.code].push({
      source: 'local',
      title: local.style,
      href: null,
      seoName: `${rule.seoPrefix} ${local.style.replace(/-/g, ' ')}`,
      images: [local.path],
      localPaths: [local.path],
    });
  }
}

const manifest = {
  generatedAt: new Date().toISOString(),
  policy: {
    imagesPerSpuTarget: 4,
    uniqueAcrossSpus: true,
    sizes: ['8', '10', '12', '14', '16'],
    color: 'Bạc',
  },
  groups: {},
};

for (const rule of CATEGORY_RULES) {
  const items = grouped[rule.code];
  const prepared = [];
  for (const [i, item] of items.entries()) {
    const spuCode = `JEW-${rule.code}-${String(i + 1).padStart(3, '0')}`;
    const destFolder = join(setsDir, rule.folder, spuCode);
    await mkdir(destFolder, { recursive: true });
    const saved = [];
    const hashes = new Set();
    // Download remote images
    for (const url of item.images) {
      if (saved.length >= 4) break;
      if (url.startsWith('http')) {
        const dest = join(destFolder, `${String(saved.length + 1).padStart(2, '0')}.jpg`);
        try {
          const hash = await download(url, dest);
          if (hashes.has(hash)) continue;
          hashes.add(hash);
          saved.push({ path: dest.replace(/\\/g, '/'), url, hash });
        } catch (error) {
          process.stdout.write(`SKIP ${url}: ${error.message}\n`);
        }
      }
    }
    // Local paths
    for (const localPath of item.localPaths || []) {
      if (saved.length >= 4) break;
      const dest = join(destFolder, `${String(saved.length + 1).padStart(2, '0')}${extname(localPath) || '.jpg'}`);
      await copyFile(localPath, dest);
      const buf = await readFile(dest);
      const hash = createHash('sha1').update(buf).digest('hex');
      if (hashes.has(hash)) continue;
      hashes.add(hash);
      saved.push({ path: dest.replace(/\\/g, '/'), url: null, hash });
    }
    // Pad to 4 using exclusive CDN derivatives of first image only if still short
    // (same binary not duplicated — store references to first for gallery slots via cloudinary transforms later)
    if (!saved.length) continue;
    while (saved.length < 4) {
      saved.push({
        path: saved[0].path,
        url: saved[0].url,
        hash: saved[0].hash,
        padFromPrimary: true,
      });
    }
    prepared.push({
      code: spuCode,
      seoName: item.seoName,
      source: item.source,
      href: item.href,
      images: saved.slice(0, 4),
    });
  }
  manifest.groups[rule.code] = {
    folder: rule.folder,
    name: rule.name,
    seoPrefix: rule.seoPrefix,
    spuCount: prepared.length,
    spus: prepared,
  };
  process.stdout.write(`${rule.code}: ${prepared.length} SPU\n`);
}

const totalSpu = Object.values(manifest.groups).reduce((n, g) => n + g.spuCount, 0);
const totalImages = Object.values(manifest.groups).reduce(
  (n, g) => n + g.spus.reduce((m, s) => m + s.images.filter((i) => !i.padFromPrimary).length, 0),
  0,
);
manifest.totals = { spu: totalSpu, uniqueImageFiles: totalImages };
await writeFile(join(outDir, 'spu-image-sets.json'), JSON.stringify(manifest, null, 2));
console.log(JSON.stringify({ ok: true, totals: manifest.totals }, null, 2));
