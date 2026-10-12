import type { Metadata } from "next";
import { Suspense } from "react";

import { StoreBuilderView } from "@/components/stores/store-builder-view";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "AI store builder",
  description: "Create a storefront from a discovered product opportunity.",
};

export default function NewStorePage() {
  return (
    <Suspense
      fallback={
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,40%)_minmax(0,60%)]">
          <Skeleton className="h-[560px] rounded-card" />
          <Skeleton className="h-[560px] rounded-card" />
        </div>
      }
    >
      <StoreBuilderView />
    </Suspense>
  );
}
