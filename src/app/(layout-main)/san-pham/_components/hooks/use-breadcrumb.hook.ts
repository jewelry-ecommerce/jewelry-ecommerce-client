import { useMemo } from "react";
import type { ApiCategory } from "@/utils/api/category/category.interface";

const findCategoryPathBySlug = (categories: ApiCategory[], slug: string): ApiCategory[] => {
  for (const category of categories) {
    if (category.slug === slug) {
      return [category];
    }

    const childPath = findCategoryPathBySlug(category.children || [], slug);
    if (childPath.length > 0) {
      return [category, ...childPath];
    }
  }

  return [];
};

const buildCategoryHref = (categoryPath: ApiCategory[], untilIndex: number) =>
  `/san-pham/${categoryPath
    .slice(0, untilIndex + 1)
    .map((category) => category.slug)
    .join("/")}`;

export const useBreadcrumb = (baseItems: { label: string; href?: string }[], categories: ApiCategory[], currentSlug: string | null) => {
  return useMemo(() => {
    const breadcrumbBase = baseItems.slice(0, 2);

    if (!currentSlug) {
      return breadcrumbBase;
    }

    const categoryPath = findCategoryPathBySlug(categories, currentSlug);
    if (categoryPath.length === 0) {
      return breadcrumbBase;
    }

    const categoryItems = categoryPath.map((category, index) => ({
      label: category.name,
      href: index === categoryPath.length - 1 ? undefined : buildCategoryHref(categoryPath, index),
    }));

    return [...breadcrumbBase, ...categoryItems];
  }, [baseItems, categories, currentSlug]);
};
