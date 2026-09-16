import type { ReactNode } from "react";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface BreadcrumbComponentProps {
  items: BreadcrumbItem[];
  separator?: ReactNode;
}
