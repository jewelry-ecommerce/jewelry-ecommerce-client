import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { BANNER_DEMO_FILE } from './banner-demo.constants';
import { bannerStoreSchema, type BannerDemoStore } from './banner-demo.schema';
export async function readBannerDemoStore(): Promise<BannerDemoStore> {
  try { return bannerStoreSchema.parse(JSON.parse(await readFile(BANNER_DEMO_FILE, 'utf8'))); }
  catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') return { banners: [], placements: [], layouts: [] };
    throw error;
  }
}
export async function writeBannerDemoStore(store: BannerDemoStore): Promise<void> {
  await mkdir(path.dirname(BANNER_DEMO_FILE), { recursive: true });
  const temporary = BANNER_DEMO_FILE + '.tmp';
  await writeFile(temporary, JSON.stringify(bannerStoreSchema.parse(store), null, 2), 'utf8');
  await rename(temporary, BANNER_DEMO_FILE);
}
