import MainLayout from "@/layouts/main/main.layout";
import React from "react";

type MainGroupLayoutProps = {
  children: React.ReactNode;
};

export default function MainGroupLayout({ children }: MainGroupLayoutProps) {
  return <MainLayout>{children}</MainLayout>;
}
