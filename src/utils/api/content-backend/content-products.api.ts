


import type { IParamsGetProducts,IProductSkuCardItem,IProductSkuCardResponse,ApiProductPagination } from '../product/product.interface';
import { requestContentBackend } from './content-backend.api';
import { isJavaBackend } from '@/utils/config/java-backend.config';
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
    const value=query[key]?.trim();
    const javaKey = key === "categorySlug" ? "category" : key === "collectionSlug" ? "collection" : key;
    if(value) params.set(isJavaBackend() ? javaKey : key,value);
  }
  for (const key of ["minPrice", "maxPrice", "sort"] as const) if (query[key] !== undefined) params.set(key, String(query[key]));
  const result=await requestContentBackend<WireCards>('storefront/product?'+params);
  return {...result,list:result.list.map(cardView)};
}
export async function getContentProducts(query:IParamsGetProducts):Promise<IProductSkuCardResponse> {
  if (isJavaBackend() && query.productIds?.trim()) return selectedJavaProducts(query);
  const result=await cardPage(query,query.isPagination===false?CONTENT_PRODUCT_QUERY_POLICY.firstPage:Math.max(query.page??CONTENT_PRODUCT_QUERY_POLICY.firstPage,1));
  if(query.isPagination!==false) return result;
  while(result.pagination.hasNextPage) {
    const next=await cardPage(query,result.pagination.currentPage+1);
    result.list.push(...next.list);result.pagination=next.pagination;
  }
  return {...result,pagination:{...result.pagination,currentPage:1,totalPage:1,hasNextPage:false,hasPreviousPage:false,nextPage:false,previousPage:false}};
}

async function selectedJavaProducts(query: IParamsGetProducts): Promise<IProductSkuCardResponse> {
  const ids = [...new Set(query.productIds!.split(",").map(id => id.trim()).filter(Boolean))];
  if (ids.some(id => !/^[1-9][0-9]*$/.test(id))) throw new Error("ID sản phẩm phải là số nguyên dương.");
  const result = await getContentProducts({ ...query, productIds: undefined, isPagination: false });
  const byId = new Map(result.list.map(card => [card.productId, card]));
  const selected = ids.flatMap(id => { const card = byId.get(id); return card ? [card] : []; });
  const page = query.isPagination === false ? 1 : Math.max(query.page ?? 1, 1);
  const take = Math.min(Math.max(query.take ?? CONTENT_PRODUCT_QUERY_POLICY.defaultTake, 1), CONTENT_PRODUCT_QUERY_POLICY.maximumTake);
  const totalPage = query.isPagination === false ? 1 : Math.ceil(selected.length / take);
  return { ...result, total: selected.length, list: query.isPagination === false ? selected : selected.slice((page - 1) * take, page * take),
    pagination: { total: selected.length, currentPage: page, totalPage, hasNextPage: page < totalPage, hasPreviousPage: page > 1,
      nextPage: page < totalPage, previousPage: page > 1 } };
}
