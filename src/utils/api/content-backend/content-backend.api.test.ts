
import { afterEach, expect, test, vi } from 'vitest';
import { BlockTypeCode } from '../cms/cms.enum';
import { ContentHttpError,getContentPage,mapContentPage,type WirePage } from './content-backend.api';
afterEach(()=>{vi.unstubAllEnvs();vi.unstubAllGlobals();});
const page:WirePage={
  page:{id:11,name:'Home',slug:'trang-chu',locale:'vi-VN',seo:{title:'Trang chủ',description:null,keywords:null,canonicalUrl:null}},
  layout:{id:'default',name:'Default',targetDevice:'ALL',versionId:'2',versionName:'2'},
  blocks:[{id:12,blockTypeCode:BlockTypeCode.INFO_CARDS,sortOrder:0,config:{}}],
};
test('CMS mapper preserves source configuration and converts numeric entity IDs only',()=>{
  const result=mapContentPage(page);
  expect(result.page.id).toBe('11');
  expect(result.blocks[0].id).toBe('12');
  expect(result.blocks[0].targetSegment).toBeNull();
  expect(result.page.seo.title).toBe('Trang chủ');
});
test('content backend URL and API prefix are configurable',async()=>{
  vi.stubEnv('NEXT_PUBLIC_CONTENT_API_URL','http://localhost:8083');
  vi.stubEnv('NEXT_PUBLIC_CONTENT_API_PREFIX','/api/v1');
  const fetcher=vi.fn().mockResolvedValue(new Response(JSON.stringify(page),{status:200}));
  vi.stubGlobal('fetch',fetcher);
  expect((await getContentPage('trang-chu')).page.id).toBe('11');
  expect(fetcher.mock.calls[0][0]).toBe('http://localhost:8083/api/v1/storefront/cms/pages/trang-chu');
});
test('unpublished page does not silently show mock data',async()=>{
  vi.stubEnv('NEXT_PUBLIC_CONTENT_API_URL','http://localhost:8083/api/v1');
  vi.stubGlobal('fetch',vi.fn().mockResolvedValue(new Response(JSON.stringify({message:'Chưa publish'}),{status:404})));
  await expect(getContentPage('trang-chu')).rejects.toBeInstanceOf(ContentHttpError);
});
