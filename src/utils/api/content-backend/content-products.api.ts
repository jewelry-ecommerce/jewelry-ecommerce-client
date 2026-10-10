
import type { IParamsGetProducts,IProductSkuCardItem,IProductSkuCardResponse,ApiProductPagination } from '../product/product.interface';
import { requestContentBackend } from './content-backend.api';
type WireCard=Omit<IProductSkuCardItem,'productId'|'selectedSku'> & {
  productId:number;selectedSku:Omit<IProductSkuCardItem['selectedSku'],'id'> & {id:number};
};
interface WireCards {total:number;list:WireCard[];pagination:ApiProductPagination}
const CONTENT_PRODUCT_QUERY_POLICY={firstPage:1,defaultTake:20,maximumTake:100} as const;
function cardView(card:WireCard):IProductSkuCardItem {
  return {...card,productId:String(card.productId),selectedSku:{...card.selectedSku,id:String(card.selectedSku.id)}};
}
async function cardPage(query:IParamsGetProducts,page:number):Promise<IProductSkuCardResponse> {
  const take=query.isPagination===false?CONTENT_PRODUCT_QUERY_POLICY.maximumTake:
    Math.min(Math.max(query.take??CONTENT_PRODUCT_QUERY_POLICY.defaultTake,1),CONTENT_PRODUCT_QUERY_POLICY.maximumTake);
  const params=new URLSearchParams({page:String(page),take:String(take)});
  for(const key of ['search','productIds','collectionSlug','categorySlug'] as const) {
    const value=query[key]?.trim();if(value) params.set(key,value);
  }
  const result=await requestContentBackend<WireCards>('storefront/product?'+params);
  return {...result,list:result.list.map(cardView)};
}
export async function getContentProducts(query:IParamsGetProducts):Promise<IProductSkuCardResponse> {
  const result=await cardPage(query,query.isPagination===false?CONTENT_PRODUCT_QUERY_POLICY.firstPage:Math.max(query.page??CONTENT_PRODUCT_QUERY_POLICY.firstPage,1));
  if(query.isPagination!==false) return result;
  while(result.pagination.hasNextPage) {
    const next=await cardPage(query,result.pagination.currentPage+1);
    result.list.push(...next.list);result.pagination=next.pagination;
  }
  return {...result,pagination:{...result.pagination,currentPage:1,totalPage:1,hasNextPage:false,hasPreviousPage:false,nextPage:false,previousPage:false}};
}
