import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { requireLocalCmsDemo } from '@/mock-api/cms-demo/cms-demo-local';
import { CmsDemoError } from '@/mock-api/cms-demo/cms-demo.service';
import { executeBannerDemoCommand } from '@/mock-api/banner-demo/banner-demo.service';
export const runtime = 'nodejs';
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    requireLocalCmsDemo(request);
    return NextResponse.json(await executeBannerDemoCommand(await request.json()));
  } catch (error) {
    if (error instanceof ZodError) return NextResponse.json({ code: 'INVALID_BANNER', message: error.issues[0]?.message }, { status: 422 });
    if (error instanceof CmsDemoError) return NextResponse.json({ code: error.code, message: error.message }, { status: error.status });
    return NextResponse.json({ code: 'BANNER_STORE_FAILED', message: 'Không thể đọc/lưu banner mock.' }, { status: 500 });
  }
}
