import type { Metadata } from "next";

import { DashboardView } from "@/components/dashboard/dashboard-view";

export const metadata: Metadata = {
  title: "Command Center",
  description:
    "Simulated overview of discovered products, live stores, revenue and conversion.",
};

export default function DashboardPage() {
  return <DashboardView />;
}
