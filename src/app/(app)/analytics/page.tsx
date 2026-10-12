import type { Metadata } from "next";
import { Suspense } from "react";

import { AnalyticsView } from "@/components/analytics/analytics-view";
import { Skeleton, SkeletonChart } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Performance Analytics",
  description: "Visitors, orders, conversion and estimated profit.",
};

export default function AnalyticsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col gap-4">
          <SkeletonChart />
          <Skeleton className="h-[220px] rounded-card" />
        </div>
      }
    >
      <AnalyticsView />
    </Suspense>
  );
}
