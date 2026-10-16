import { commonAxios } from '@/utils/axios';
import type { StorefrontGlobalConfigResponse, StorefrontLogosResponse, StorefrontFooterResponse, TopBannerResponse } from '../cms/cms.interface';

interface JavaSiteLayout {
  header: Partial<TopBannerResponse> | null;
  footer: Omit<StorefrontFooterResponse, 'newsletterHeading'> | null;
  logos: StorefrontLogosResponse;
}
export async function javaSiteLayout(): Promise<JavaSiteLayout> {
  return (await commonAxios.get<JavaSiteLayout>('storefront/cms/site-layout')).data;
}
export async function javaGlobalConfig(): Promise<StorefrontGlobalConfigResponse> {
  const layout = await javaSiteLayout();
  const header = layout.header;
  return {
    header: header ? { ...header, bannerName: header.bannerName ?? '', bannerDisplayStyle: header.bannerDisplayStyle ?? 'TEXT',
      bannerContent: header.bannerContent ?? null, bannerBgColor: header.bannerBgColor ?? '', bannerTextColor: header.bannerTextColor ?? '',
      bannerTargetUrl: header.bannerTargetUrl ?? '', bannerAnimationStyle: header.bannerAnimationStyle ?? '',
      bannerLoopIntervalSec: header.bannerLoopIntervalSec ?? 0, bannerStartTime: header.bannerStartTime ?? '', bannerEndTime: header.bannerEndTime ?? null } : null,
    footer: layout.footer ? { ...layout.footer, newsletterHeading: '', socialLinks: layout.footer.socialLinks ?? [], menuColumns: layout.footer.menuColumns ?? [] } : null,
  };
}
