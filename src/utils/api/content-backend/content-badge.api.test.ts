import { afterEach,expect,test,vi } from 'vitest';
import { getContentProductBadges } from './content-badge.api';
afterEach(()=>{vi.unstubAllGlobals();vi.unstubAllEnvs();});
test('Java badge templates map to the requested product and SKU without trusting client stock', async () => {
  vi.stubEnv('NEXT_PUBLIC_BACKEND_PROVIDER', 'JAVA');
  vi.stubEnv('NEXT_PUBLIC_CONTENT_API_URL', 'http://localhost:8082');
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ status: 200, data: [
    { skuId: '41', badges: [{ id: '9', code: 'NEW', name: 'Mới', type: 'TEXT', defaultPosition: 'TOP_LEFT',
      displayText: 'Mới', defaultPriorityWeight: 1 }] }
  ] }))));
  const result = await getContentProductBadges({ products: [{ productId: '7', variants: [{ productVariantId: '41', skuCode: 'RING' }] }] });
  expect(result['7'].variants[0]).toMatchObject({ productVariantId: '41', skuCode: 'RING', badges: [
    { badgeTemplateId: '9', position: 'TOP_LEFT', displayText: 'Mới' }
  ] });
});
test('badge request sends SKU IDs only, never client-provided stock, and maps numeric IDs',async()=>{
  vi.stubEnv('NEXT_PUBLIC_CONTENT_API_URL','http://localhost:8083');
  const fetcher=vi.fn().mockResolvedValue(new Response(JSON.stringify([{productId:7,productVariantId:41,skuCode:'RING',
    badges:[{badgeTemplateId:9,code:'NEW',name:'New',type:'TEXT',position:'TOP_LEFT',displayText:'New',dynamicText:null}]}])));
  vi.stubGlobal('fetch',fetcher);
  const result=await getContentProductBadges({products:[{productId:'7',variants:[{productVariantId:'41',stockQuantity:999999}]}]});
  expect(fetcher.mock.calls[0][0]).toBe('http://localhost:8083/api/v1/storefront/badge?skuIds=41');
  expect(result['7'].variants[0].productVariantId).toBe('41');
  expect(result['7'].variants[0].badges[0].badgeTemplateId).toBe('9');
});
test('large badge batches split into API limit without dropping SKUs',async()=>{
  vi.stubEnv('NEXT_PUBLIC_CONTENT_API_URL','http://localhost:8083');
  const fetcher=vi.fn().mockImplementation(async(url:string)=>{
    const ids=new URL(url).searchParams.get('skuIds')!.split(',').map(Number);
    return new Response(JSON.stringify(ids.map(id=>({productId:7,productVariantId:id,skuCode:'SKU-'+id,badges:[]}))));
  });vi.stubGlobal('fetch',fetcher);
  const result=await getContentProductBadges({products:[{productId:'7',variants:Array.from({length:101},(_,index)=>({productVariantId:String(index+1)}))}]});
  expect(fetcher).toHaveBeenCalledTimes(2);expect(result['7'].variants).toHaveLength(101);
});
