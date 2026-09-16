// set term
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { getSharedSeoImage, createPageMetadata } from "@/lib/server/storefront-metadata";
import { fetchSetBySlug } from "@/lib/server/set-detail-fetch.server";
import { siteConfig } from "@/utils/config/site";
import SetDetailApp from "../_components/set-detail.app";

type SetDetailPageProps = { params: Promise<{ slug: string }> };

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: SetDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const host = (await headers()).get("host");
  const set = await fetchSetBySlug(slug);
  return createPageMetadata({
    path: `/sets/${slug}`,
    title: set ? `${set.name} | ${siteConfig.name}` : `Set | ${siteConfig.name}`,
    description: set?.description ?? `Khám phá Set trang sức tại ${siteConfig.name}.`,
    image: set?.images[0] ? { url: set.images[0] } : getSharedSeoImage(host),
  });
}

export default async function SetDetailPage({ params }: SetDetailPageProps) {
  const { slug } = await params;
  const set = await fetchSetBySlug(slug);
  if (!set) notFound();
  return <SetDetailApp initialData={set} />;
}
