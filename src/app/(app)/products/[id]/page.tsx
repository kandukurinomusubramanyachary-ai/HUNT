import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ProductDetailView } from "@/components/products/product-detail-view";
import { getProductById, getProducts } from "@/lib/services/products";

export function generateStaticParams() {
  return getProducts().map((product) => ({ id: product.id }));
}

export function generateMetadata({
  params,
}: {
  params: { id: string };
}): Metadata {
  const product = getProductById(params.id);
  if (!product) return { title: params.id.startsWith("live-") ? "Product intelligence" : "Product not found" };
  return {
    title: product.name,
    description: product.tagline,
  };
}

export default function ProductDetailPage({
  params,
}: {
  params: { id: string };
}) {
  if (!params.id.startsWith('live-') && !getProductById(params.id)) {
    notFound();
  }
  return <ProductDetailView productId={params.id} />;
}
