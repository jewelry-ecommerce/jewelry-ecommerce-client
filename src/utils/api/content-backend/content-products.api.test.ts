
import { afterEach,test,vi,expect } from 'vitest';
import { getContentProducts } from './content-products.api';
afterEach(()=>{vi.unstubAllGlobals();vi.unstubAllEnvs();});
function response(page:number,hasNextPage=false) {
  return new Response(JSON.stringify({total:2,list:[{productId:page,name:'Nhẫn',slug:'nhan',status:'PUBLISHED',isPurchasable:true,
    selectedSku:{id:page+10,customerDisplayPrice:{currency:'VND',sellingPriceAfterTaxMinor:200000,compareAtPriceAfterTaxMinor:null,hasDiscount:false,discountPercent:null}},
    visualSwitch:null,addToCart:{mode:'DIRECT'},brandName:null,updatedAt:'2026-10-10T00:00:00Z'}],
    pagination:{total:2,currentPage:page,hasNextPage,hasPreviousPage:page>1,nextPage:hasNextPage,previousPage:page>1,totalPage:2}}));
}
test('carousel sends selected product IDs and collection, mapping numeric IDs for UI',async()=>{
  vi.stubEnv('NEXT_PUBLIC_CONTENT_API_URL','http://localhost:8083');
  const fetcher=vi.fn().mockResolvedValue(response(1));vi.stubGlobal('fetch',fetcher);
  const result=await getContentProducts({productIds:'1,2',collectionSlug:'new',take:12});
  const url=new URL(fetcher.mock.calls[0][0]);
  expect(url.pathname).toBe('/api/v1/storefront/product');
  expect(url.searchParams.get('productIds')).toBe('1,2');expect(url.searchParams.get('collectionSlug')).toBe('new');
  expect(result.list[0].productId).toBe('1');expect(result.list[0].selectedSku.id).toBe('11');
});
test('non-paginated carousel reads all pages, not just the first 100 products',async()=>{
  vi.stubEnv('NEXT_PUBLIC_CONTENT_API_URL','http://localhost:8083');
  const fetcher=vi.fn().mockResolvedValueOnce(response(1,true)).mockResolvedValueOnce(response(2));vi.stubGlobal('fetch',fetcher);
  const result=await getContentProducts({isPagination:false,page:0,take:0});
  expect(result.list).toHaveLength(2);expect(fetcher).toHaveBeenCalledTimes(2);
  expect(result.pagination.hasNextPage).toBe(false);
});
