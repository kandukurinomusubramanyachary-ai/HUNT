import type { Metadata } from "next";

import { DiscoverView } from "@/components/products/discover-view";

export const metadata: Metadata = {
  title: "Opportunity Radar",
  description:
    "Rank sample product opportunities by demand, competition and margin.",
};

export default function DiscoverPage() {
  return <DiscoverView />;
}
