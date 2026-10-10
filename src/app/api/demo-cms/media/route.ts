import { NextRequest, NextResponse } from 'next/server';
import { requireLocalCmsDemo } from '@/mock-api/cms-demo/cms-demo-local';
import { saveCmsDemoMedia } from '@/mock-api/cms-demo/cms-demo-media.service';
import { CmsDemoError } from '@/mock-api/cms-demo/cms-demo.service';
export const runtime = 'nodejs';
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    requireLocalCmsDemo(request);
    const form = await request.formData();
    const file = form.get('file');
    if (!(file instanceof File)) throw new CmsDemoError('IMAGE_REQUIRED', 'Chọn ảnh để upload.', 422);
    return NextResponse.json(await saveCmsDemoMedia(file));
  } catch (error) {
    if (error instanceof CmsDemoError) return NextResponse.json({ code: error.code, message: error.message }, { status: error.status });
    return NextResponse.json({ code: 'MEDIA_STORE_FAILED', message: 'Không thể lưu ảnh CMS mock.' }, { status: 500 });
  }
}
