import { randomUUID } from 'node:crypto';
import { CmsDemoError } from './cms-demo.service';
import { CMS_DEMO_MAX_MEDIA_BYTES, CMS_DEMO_MAX_VIDEO_BYTES, CMS_DEMO_MEDIA_TYPES, CMS_DEMO_MEDIA_NAME } from './cms-demo-media.constants';
import { persistCmsDemoMedia, readCmsDemoMedia } from './cms-demo-media.repository';
function imageExtension(type: string): string {
  if (!(type in CMS_DEMO_MEDIA_TYPES)) throw new CmsDemoError('INVALID_IMAGE_TYPE', 'Định dạng ảnh/video không được hỗ trợ.', 422);
  return CMS_DEMO_MEDIA_TYPES[type as keyof typeof CMS_DEMO_MEDIA_TYPES];
}
export async function saveCmsDemoMedia(file: File): Promise<{ asset: { publicUrl: string } }> {
  const extension = imageExtension(file.type);
  const maxBytes = file.type.startsWith('video/') ? CMS_DEMO_MAX_VIDEO_BYTES : CMS_DEMO_MAX_MEDIA_BYTES;
  if (file.size === 0 || file.size > maxBytes) {
    throw new CmsDemoError('INVALID_IMAGE_SIZE', 'File phải có dữ liệu, ảnh tối đa 5 MB và video tối đa 50 MB.', 422);
  }
  const filename = randomUUID() + '.' + extension;
  await persistCmsDemoMedia(filename, new Uint8Array(await file.arrayBuffer()));
  return { asset: { publicUrl: '/api/demo-cms/media/' + filename } };
}
export async function loadCmsDemoMedia(filename: string): Promise<{ bytes: Uint8Array; type: string }> {
  if (!CMS_DEMO_MEDIA_NAME.test(filename)) throw new CmsDemoError('MEDIA_NOT_FOUND', 'Không tìm thấy ảnh.', 404);
  const type = Object.entries(CMS_DEMO_MEDIA_TYPES).find(([, extension]) => filename.endsWith('.' + extension))?.[0];
  if (!type) throw new CmsDemoError('MEDIA_NOT_FOUND', 'Không tìm thấy ảnh.', 404);
  try { return { bytes: await readCmsDemoMedia(filename), type }; }
  catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') throw new CmsDemoError('MEDIA_NOT_FOUND', 'Không tìm thấy ảnh.', 404);
    throw error;
  }
}
