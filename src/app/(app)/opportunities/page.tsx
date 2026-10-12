import type { Metadata } from "next";

import { OpportunitiesView } from "@/components/products/opportunities-view";

export const metadata: Metadata = {
  title: "Saved opportunities",
  description: "Compare saved product opportunities before you launch.",
};

export default function OpportunitiesPage() {
  return <OpportunitiesView />;
}
