import type { NextRequest } from 'next/server';
import { CmsDemoError } from './cms-demo.service';
import { CMS_DEMO_LOCAL_HOSTS } from './cms-demo-media.constants';
export function requireLocalCmsDemo(request: NextRequest): void {
  if (process.env.NODE_ENV !== 'development' || !CMS_DEMO_LOCAL_HOSTS.has(request.nextUrl.hostname)) {
    throw new CmsDemoError('DEMO_DISABLED', 'CMS mock chỉ dùng cho demo local.', 403);
  }
  const origin = request.headers.get('origin');
  if (origin && !CMS_DEMO_LOCAL_HOSTS.has(new URL(origin).hostname)) {
    throw new CmsDemoError('DEMO_ORIGIN_DENIED', 'Origin không được phép dùng CMS mock.', 403);
  }
}
