import { NextRequest, NextResponse } from 'next/server';
import { requireLocalCmsDemo } from '@/mock-api/cms-demo/cms-demo-local';
import { loadCmsDemoMedia } from '@/mock-api/cms-demo/cms-demo-media.service';
import { CmsDemoError } from '@/mock-api/cms-demo/cms-demo.service';
export const runtime = 'nodejs';
export async function GET(request: NextRequest, context: { params: Promise<{ filename: string }> }): Promise<Response> {
  try {
    requireLocalCmsDemo(request);
    const { filename } = await context.params;
    const { bytes, type } = await loadCmsDemoMedia(filename);
    return new Response(new Uint8Array(bytes), { headers: {
      'Content-Type': type, 'X-Content-Type-Options': 'nosniff',
      'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'; sandbox",
    } });
  } catch (error) {
    if (error instanceof CmsDemoError) return NextResponse.json({ code: error.code, message: error.message }, { status: error.status });
    return NextResponse.json({ code: 'MEDIA_READ_FAILED', message: 'Không thể đọc ảnh CMS mock.' }, { status: 500 });
  }
}
