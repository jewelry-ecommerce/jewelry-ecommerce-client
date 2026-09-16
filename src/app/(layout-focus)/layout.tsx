import CheckoutLayout from "@/layouts/checkout/checkout.layout";
import React from "react";

type CheckoutGroupLayoutProps = {
  children: React.ReactNode;
};

export default function CheckoutGroupLayout({ children }: CheckoutGroupLayoutProps) {
  return <CheckoutLayout>{children}</CheckoutLayout>;
}
