import type { Metadata } from "next";

import { CreativeStudioView } from "@/components/creative/creative-studio-view";

export const metadata: Metadata = {
  title: "Creative Studio",
  description: "Generate demo ad copy, storyboards and video prompts.",
};

export default function CreativeStudioPage() {
  return <CreativeStudioView />;
}
