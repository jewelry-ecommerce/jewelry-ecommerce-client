import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { CMS_DEMO_MEDIA_DIRECTORY } from './cms-demo-media.constants';
export async function persistCmsDemoMedia(filename: string, bytes: Uint8Array): Promise<void> {
  await mkdir(CMS_DEMO_MEDIA_DIRECTORY, { recursive: true });
  await writeFile(path.join(CMS_DEMO_MEDIA_DIRECTORY, filename), bytes, { flag: 'wx' });
}
export async function readCmsDemoMedia(filename: string): Promise<Uint8Array> {
  return readFile(path.join(CMS_DEMO_MEDIA_DIRECTORY, filename));
}
