import { beforeEach, describe, expect, it, vi } from 'vitest';
import { saveCmsDemoMedia, loadCmsDemoMedia } from './cms-demo-media.service';
const store = vi.hoisted(() => new Map<string, Uint8Array>());
vi.mock('./cms-demo-media.repository', () => ({
  persistCmsDemoMedia: async (name: string, bytes: Uint8Array) => { store.set(name, bytes); },
  readCmsDemoMedia: async (name: string) => {
    const bytes = store.get(name);
    if (!bytes) throw Object.assign(new Error('missing'), { code: 'ENOENT' });
    return bytes;
  },
}));
beforeEach(() => store.clear());
describe('shared CMS image mock', () => {
  it('stores image bytes and returns a client-readable URL', async () => {
    const result = await saveCmsDemoMedia(new File(['png-test'], 'example.png', { type: 'image/png' }));
    const name = result.asset.publicUrl.split('/').at(-1)!;
    const media = await loadCmsDemoMedia(name);
    expect(media.type).toBe('image/png');
    expect(new TextDecoder().decode(media.bytes)).toBe('png-test');
  });
  it('rejects unsupported, empty or oversize files and traversal paths', async () => {
    await expect(saveCmsDemoMedia(new File(['html'], 'test.html', { type: 'text/html' }))).rejects.toMatchObject({ code: 'INVALID_IMAGE_TYPE' });
    await expect(saveCmsDemoMedia(new File([], 'empty.png', { type: 'image/png' }))).rejects.toMatchObject({ code: 'INVALID_IMAGE_SIZE' });
    await expect(saveCmsDemoMedia(new File([new Uint8Array(5 * 1024 * 1024 + 1)], 'big.png', { type: 'image/png' }))).rejects.toMatchObject({ code: 'INVALID_IMAGE_SIZE' });
    await expect(loadCmsDemoMedia('../cms-pages.json')).rejects.toMatchObject({ code: 'MEDIA_NOT_FOUND' });
  });
});
