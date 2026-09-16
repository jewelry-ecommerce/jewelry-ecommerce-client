import type { AtshBrotherProduct, AtshBrotherRecord, AtshBrothersData } from "@/app/(layout-main)/atsh/_utils/atsh-brothers.interface";
import {
  buildAtshBrotherResponsiveImage,
  getAtshBrotherBySlug,
  resolveAtshBrotherSpiralCardSrc,
} from "@/app/(layout-main)/atsh/_utils/atsh-brothers.util";
import type { ApiProduct } from "@/utils/api/product/product.interface";
import type { AtshSingerFeaturedProduct, AtshSingerPageData } from "../_constants/atsh-singer.constants";
import { ProductLifecycleStatus, ProductStockStatus } from "@/utils/api/product/product.enum";

const ATSH_SINGER_FULL_LOOK_HERO_TABLET = "/image/atsh/singer/full-look-hero-tablet.png";

function buildCatalogProductIndex(catalogProducts: ApiProduct[]): Map<string, ApiProduct> {
  return new Map(catalogProducts.map((product) => [product.productSlug, product]));
}

function applyShowcaseImageToCatalogProduct(product: AtshBrotherProduct, catalogProduct: ApiProduct): ApiProduct {
  return {
    ...catalogProduct,
    image: product.image,
    imageHover: product.image,
    shortDescription: product.shortDescription?.trim() || "",
    defaultDisplay: catalogProduct.defaultDisplay ? { ...catalogProduct.defaultDisplay, image: product.image } : { image: product.image },
  };
}

function mapShowcaseProductWithoutCatalog(product: AtshBrotherProduct): ApiProduct {
  return {
    productId: product.productSlug,
    productName: product.productSlug,
    productSlug: product.productSlug,
    productStatus: ProductLifecycleStatus.PUBLISHED,
    isPurchasable: true,
    image: product.image,
    imageHover: product.image,
    brandName: "Heartlock",
    defaultDisplay: {
      sellingPriceAfterTaxMinor: "0",
      compareAtPriceAfterTaxMinor: "0",
      image: product.image,
    },
    requiresSelectionDialog: true,
    stockStatus: ProductStockStatus.IN_STOCK,
    shortDescription: product.shortDescription?.trim() || "",
  };
}

function mapShowcaseProductToApiProduct(product: AtshBrotherProduct, catalogBySlug: Map<string, ApiProduct>): ApiProduct {
  const catalogProduct = catalogBySlug.get(product.productSlug);
  if (!catalogProduct) {
    return mapShowcaseProductWithoutCatalog(product);
  }

  return applyShowcaseImageToCatalogProduct(product, catalogProduct);
}

function mapAtshBrotherProductsToFeatured(
  products: AtshBrotherProduct[] | undefined,
  catalogProducts: ApiProduct[] = [],
): AtshSingerFeaturedProduct[] {
  if (!products?.length) {
    return [];
  }

  const catalogBySlug = buildCatalogProductIndex(catalogProducts);

  return products.map((product, index) => ({
    product: mapShowcaseProductToApiProduct(product, catalogBySlug),
    imagePosition: product.imagePosition ?? (index % 2 === 0 ? "left" : "right"),
  }));
}

function mapAtshBrotherToSingerPageData(
  brother: AtshBrotherRecord,
  brothersData: AtshBrothersData,
  catalogProducts: ApiProduct[] = [],
): AtshSingerPageData {
  const spiralFallback = resolveAtshBrotherSpiralCardSrc(brother.slug, brothersData);
  const heroBanner = buildAtshBrotherResponsiveImage(brother.images.heroBanner, spiralFallback);
  const fullLookImg = buildAtshBrotherResponsiveImage(brother.images.fullLookImg, {
    mobile: heroBanner.mobile,
    tablet: ATSH_SINGER_FULL_LOOK_HERO_TABLET,
    desktop: heroBanner.desktop ?? heroBanner.mobile,
  });
  const galleryImages = brother.images.gallery?.filter(Boolean) ?? [];

  const sharedDiscover = brothersData.meta.sharedContent;
  const brotherDiscover = brother.discoverSection;

  const content = brother.content;

  return {
    slug: brother.slug,
    heroBanner,
    singerName: brother.singerName ?? brother.displayName.toUpperCase(),
    pageTitle: content?.pageTitle ?? "",
    introDescription: content?.introDescription ?? "",
    fullLookDescription: content?.fullLookDescription ?? "",
    featuredProducts: mapAtshBrotherProductsToFeatured(brother.products, catalogProducts),
    collectionProducts: [],
    fullLookProductSlug: brother.fullLookProductSlug?.trim() || "",
    fullLookTotalPrice: 0,
    fullLookOriginalPrice: 0,
    fullLookTitle: content?.fullLookTitle ?? "",
    singerGallery: {
      title: content?.galleryTitle ?? "",
      description: content?.galleryDescription ?? "",
      images: galleryImages,
      imageCount: brother.images.galleryImageCount,
    },
    discoverSectionTitle: brotherDiscover?.title ?? sharedDiscover?.discoverSectionTitle ?? "KHÁM PHÁ THÊM",
    discoverCards: brotherDiscover?.cards ?? sharedDiscover?.discoverCards ?? [],
    fullLookImg,
  };
}

export function getAtshSingerPageDataFromBrothers(
  slug: string,
  brothersData: AtshBrothersData,
  catalogProducts: ApiProduct[] = [],
): AtshSingerPageData | undefined {
  const brother = getAtshBrotherBySlug(slug, brothersData);
  if (!brother) {
    return undefined;
  }

  return mapAtshBrotherToSingerPageData(brother, brothersData, catalogProducts);
}
