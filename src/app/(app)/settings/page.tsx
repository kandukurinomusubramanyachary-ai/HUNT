import type { Metadata } from "next";

import { SettingsView } from "@/components/settings/settings-view";

export const metadata: Metadata = {
  title: "Settings",
  description: "Workspace preferences and demo data controls.",
};

export default function SettingsPage() {
  return <SettingsView />;
}
