import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Storefront",
  description: "Customer-facing storefront generated with HUNT.",
};

export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="min-h-screen">{children}</div>;
}
