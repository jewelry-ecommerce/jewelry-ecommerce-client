import type {
  Category,
  Collection,
  FacetOption,
  JewelryGemstone,
  JewelryMaterial,
  JewelryOccasion,
  Product,
  ProductCard,
  ProductFacets,
  ProductListQuery,
  ProductListResult,
} from "@/utils/api/catalog/catalog.interface";
import { MockApiError, matchesSearch, normalizeSearch, paginate, withLatency } from "@/mocks/mock-transport";
import {
  CATEGORIES,
  COLLECTIONS,
  GEMSTONE_LABELS,
  MATERIAL_LABELS,
  OCCASION_LABELS,
  PRODUCTS,
  findProductBySlug,
} from "@/mocks/data/catalog.data";

const toProductCard = (product: Product): ProductCard => {
  const primary = product.media.find((asset) => asset.isPrimary) ?? product.media[0];
  const hover = product.media.find((asset) => !asset.isPrimary);
  const discountPercent =
    product.compareAtPrice && product.compareAtPrice > product.priceFrom
      ? Math.round(((product.compareAtPrice - product.priceFrom) / product.compareAtPrice) * 100)
      : null;

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    categoryName: product.category.name,
    brandName: product.brandName,
    image: primary?.url ?? "",
    imageHover: hover?.url ?? null,
    priceFrom: product.priceFrom,
    compareAtPrice: product.compareAtPrice,
    discountPercent,
    stockStatus: product.preOrder
      ? "PRE_ORDER"
      : (product.variants.find((variant) => variant.availableStock > 0)?.stockStatus ?? "OUT_OF_STOCK"),
    ratingAverage: product.ratingAverage,
    ratingCount: product.ratingCount,
    badges: product.badges,
    isPreOrder: Boolean(product.preOrder),
  };
};

const countBy = <TValue extends string>(products: Product[], pick: (product: Product) => TValue[]): Map<TValue, number> => {
  const counts = new Map<TValue, number>();
  for (const product of products) {
    for (const value of new Set(pick(product))) {
      counts.set(value, (counts.get(value) ?? 0) + 1);
    }
  }
  return counts;
};

const toFacetOptions = <TValue extends string>(counts: Map<TValue, number>, labels: Record<TValue, string>): FacetOption<TValue>[] =>
  [...counts.entries()]
    .map(([value, count]) => ({ value, label: labels[value], count }))
    .sort((left, right) => right.count - left.count || left.label.localeCompare(right.label));

const buildFacets = (products: Product[]): ProductFacets => {
  const prices = products.map((product) => product.priceFrom);

  return {
    materials: toFacetOptions(
      countBy(products, (product) => product.variants.map((variant) => variant.material)),
      MATERIAL_LABELS,
    ),
    gemstones: toFacetOptions(
      countBy(products, (product) => product.variants.map((variant) => variant.gemstone)),
      GEMSTONE_LABELS,
    ),
    occasions: toFacetOptions(
      countBy(products, (product) => [product.occasion]),
      OCCASION_LABELS,
    ),
    priceRange: {
      min: prices.length ? Math.min(...prices) : 0,
      max: prices.length ? Math.max(...prices) : 0,
    },
  };
};

const applySort = (products: Product[], sort: ProductListQuery["sort"]): Product[] => {
  const sorted = [...products];
  switch (sort) {
    case "NEWEST":
      return sorted.sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime());
    case "PRICE_ASC":
      return sorted.sort((left, right) => left.priceFrom - right.priceFrom);
    case "PRICE_DESC":
      return sorted.sort((left, right) => right.priceFrom - left.priceFrom);
    case "RATING_DESC":
      return sorted.sort((left, right) => right.ratingAverage - left.ratingAverage || right.ratingCount - left.ratingCount);
    default:
      // Recommended: bestsellers and higher-rated pieces first, then newest.
      return sorted.sort(
        (left, right) =>
          Number(right.badges.includes("Bestseller")) - Number(left.badges.includes("Bestseller")) ||
          right.ratingAverage - left.ratingAverage ||
          new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
      );
  }
};

const filterProducts = (query: ProductListQuery): Product[] => {
  const search = normalizeSearch(query.search);

  return PRODUCTS.filter((product) => {
    if (product.status !== "PUBLISHED") return false;
    if (query.categorySlug && product.category.slug !== query.categorySlug) return false;
    if (query.collectionSlug && !product.collections.some((collection) => collection.slug === query.collectionSlug)) return false;

    if (query.materials?.length && !product.variants.some((variant) => query.materials?.includes(variant.material))) return false;
    if (query.gemstones?.length && !product.variants.some((variant) => query.gemstones?.includes(variant.gemstone))) return false;
    if (query.occasions?.length && !query.occasions.includes(product.occasion)) return false;

    if (typeof query.minPrice === "number" && product.priceFrom < query.minPrice) return false;
    if (typeof query.maxPrice === "number" && product.priceFrom > query.maxPrice) return false;

    if (query.inStockOnly && !product.variants.some((variant) => variant.availableStock > 0)) return false;

    return matchesSearch(
      [
        product.name,
        product.shortDescription,
        product.category.name,
        product.brandName,
        ...product.variants.map((variant) => variant.skuCode),
      ],
      search,
    );
  });
};

export const mockListProducts = (query: ProductListQuery): Promise<ProductListResult> =>
  withLatency(() => {
    const matched = filterProducts(query);
    const sorted = applySort(matched, query.sort);
    const page = paginate(sorted.map(toProductCard), query.page ?? 1, query.take ?? 12);

    return { ...page, facets: buildFacets(matched) };
  });

export const mockGetProductBySlug = (slug: string): Promise<Product> =>
  withLatency(() => {
    const product = findProductBySlug(slug);
    if (!product) throw new MockApiError("PRODUCT_NOT_FOUND", `No product exists for slug "${slug}".`, 404);
    return product;
  });

export const mockGetProductsByIds = (ids: string[]): Promise<ProductCard[]> =>
  withLatency(() => {
    const byId = new Map(PRODUCTS.map((product) => [product.id, product]));
    return ids
      .map((id) => byId.get(id))
      .filter((product): product is Product => Boolean(product))
      .map(toProductCard);
  });

export const mockGetRelatedProducts = (slug: string, limit = 4): Promise<ProductCard[]> =>
  withLatency(() => {
    const product = findProductBySlug(slug);
    if (!product) return [];

    return PRODUCTS.filter((candidate) => candidate.id !== product.id && candidate.category.slug === product.category.slug)
      .slice(0, limit)
      .map(toProductCard);
  });

export const mockListCategories = (): Promise<Category[]> => withLatency(() => CATEGORIES);

export const mockGetCategoryBySlug = (slug: string): Promise<Category> =>
  withLatency(() => {
    const category = CATEGORIES.find((entry) => entry.slug === slug);
    if (!category) throw new MockApiError("CATEGORY_NOT_FOUND", `No category exists for slug "${slug}".`, 404);
    return category;
  });

export const mockListCollections = (): Promise<Collection[]> => withLatency(() => COLLECTIONS);

export const mockGetCollectionBySlug = (slug: string): Promise<Collection> =>
  withLatency(() => {
    const collection = COLLECTIONS.find((entry) => entry.slug === slug);
    if (!collection) throw new MockApiError("COLLECTION_NOT_FOUND", `No collection exists for slug "${slug}".`, 404);
    return collection;
  });

export const mockSearchSuggestions = (term: string): Promise<{ products: ProductCard[]; categories: Category[] }> =>
  withLatency(() => {
    const search = normalizeSearch(term);
    if (!search) return { products: [], categories: [] };

    return {
      products: PRODUCTS.filter((product) => matchesSearch([product.name, product.category.name], search))
        .slice(0, 5)
        .map(toProductCard),
      categories: CATEGORIES.filter((category) => matchesSearch([category.name], search)).slice(0, 3),
    };
  });

export { toProductCard };

export type { JewelryGemstone, JewelryMaterial, JewelryOccasion };
