
import { isJavaBackend, unwrapJavaResponse } from '../../config/java-backend.config';
import type { Block, Page, PageResponse } from '../cms/cms.interface';
import type { BannerItem, BannerPlacement, BannerSlot, LayoutMetadata } from '../banner/banner.interface';
import { getContentApiBaseUrl } from '../../config/content-backend.config';
type WireBlock=Omit<Block,'id'|'targetSegment'> & {id:number};
export type WirePage=Omit<PageResponse,'page'|'blocks'> & {page:Omit<Page,'id'> & {id:number};blocks:WireBlock[]};
export type WireBanner=Omit<BannerPlacement,'id'|'slots'> & {id:number;slots:(Omit<BannerSlot,'id'|'banners'|'layout_metadata'> & {
  id:number;layout_metadata:LayoutMetadata;banners:{order_index:number|string;banner:Omit<BannerItem,'id'> & {id:number}}[];
})[]};
export class ContentHttpError extends Error {
  constructor(readonly status:number,message:string) {super(message);this.name='ContentHttpError';}
}
export async function requestContentBackend<T>(path:string):Promise<T> {
  const base=getContentApiBaseUrl();
  if(!base) throw new Error('Chưa cấu hình backend nội dung.');
  const response=await fetch(base+'/'+path,{headers:{Accept:'application/json'},cache:'no-store'});
  if(!response.ok) {
    const error:{message?:string}=await response.json();
    throw new ContentHttpError(response.status,error.message??'Không thể đọc nội dung.');
  }
  const payload = await response.json();
  return (isJavaBackend() ? unwrapJavaResponse(payload) : payload) as T;
}
export function mapContentPage(input:WirePage):PageResponse {
  return {...input,page:{...input.page,id:String(input.page.id)},
    blocks:input.blocks.map(block=>({...block,id:String(block.id),targetSegment:null}))};
}
export function mapContentBanner(input:WireBanner):BannerPlacement {
  return {...input,id:String(input.id),slots:input.slots.map(slot=>({...slot,id:String(slot.id),
    banners:slot.banners.map(entry=>({...entry,banner:{...entry.banner,id:String(entry.banner.id)}}))}))};
}
export async function getContentPage(slug:string):Promise<PageResponse> {
  return mapContentPage(await requestContentBackend<WirePage>('storefront/cms/pages/'+encodeURIComponent(slug)));
}
export async function getContentBanner(code:string):Promise<BannerPlacement> {
  return mapContentBanner(await requestContentBackend<WireBanner>('storefront/banner/placements/code/'+encodeURIComponent(code)+'/render'));
}
