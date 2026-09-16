import { NextRequest, NextResponse } from "next/server";
import {
  getMockStorefrontGlobalConfig,
  getMockStorefrontLogos,
  getMockStorefrontNavigation,
  getMockStorefrontPage,
} from "@/mock-api/storefront-mock";
import { getMockProductCards } from "@/mock-api/catalog-mock";
import { getMockBannerPlacement } from "@/mock-api/banner-mock";

type RouteContext = {
  params: Promise<{ path: string[] }>;
};

const getPath = async ({ params }: RouteContext): Promise<string> => (await params).path.join("/");

const notFound = () => NextResponse.json({ code: "NOT_FOUND", message: "Mock endpoint was not found" }, { status: 404 });

const getStorefrontPage = (path: string) => {
  const slug = path.replace("cms/storefront/pages/", "");
  const page = getMockStorefrontPage(slug);
  return page ? NextResponse.json(page) : notFound();
};

const getBannerPlacement = (path: string) => {
  const code = path.replace("banner/storefront/placements/code/", "").replace("/render", "");
  const placement = getMockBannerPlacement(code);
  return placement ? NextResponse.json(placement) : notFound();
};

export async function GET(_request: NextRequest, context: RouteContext): Promise<NextResponse> {
  const path = await getPath(context);

  if (path.startsWith("cms/storefront/pages/")) return getStorefrontPage(path);
  if (path.startsWith("banner/storefront/placements/code/")) return getBannerPlacement(path);
  if (path === "catalog/products") return NextResponse.json(getMockProductCards());
  if (path === "cart/cart") return NextResponse.json([]);
  if (path === "cms/storefront/navigation" || path === "cms/storefront/navigation/plp-rail")
    return NextResponse.json(getMockStorefrontNavigation());
  if (path === "cms/storefront/global-config") return NextResponse.json(getMockStorefrontGlobalConfig());
  if (path === "cms/storefront/logo/v2") return NextResponse.json(getMockStorefrontLogos());

  return notFound();
}
