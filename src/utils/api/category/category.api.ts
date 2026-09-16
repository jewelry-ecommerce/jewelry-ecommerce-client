import { commonAxios } from "@/utils/axios";
import type { ApiCategory, ICategoryProductsResponse, IParamsGetCategoryProducts } from "./category.interface";
import { filterVisibleCategories } from "./category.util";

export const getCategories = async (): Promise<ApiCategory[]> => {
  const categories = (await commonAxios.get<ApiCategory[]>("catalog/categories")).data;
  return filterVisibleCategories(categories);
};

export const getCategoryProducts = async (categoryId: string, params: IParamsGetCategoryProducts): Promise<ICategoryProductsResponse> =>
  (await commonAxios.get<ICategoryProductsResponse>(`catalog/categories/${categoryId}/products`, { params })).data;
