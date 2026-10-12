import type { Metadata } from "next";
import { Suspense } from "react";

import { StoresView } from "@/components/stores/stores-view";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "My Stores",
  description: "Manage every storefront in your HUNT workspace.",
};

export default function StoresPage() {
  return (
    <Suspense
      fallback={
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-[280px] w-full rounded-card" />
          ))}
        </div>
      }
    >
      <StoresView />
    </Suspense>
  );
}
