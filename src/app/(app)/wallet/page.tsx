import type { Metadata } from "next";

import { WalletView } from "@/components/wallet/wallet-view";

export const metadata: Metadata = {
  title: "Commerce Wallet",
  description: "Simulated cash flow, expenses and reinvestment planning.",
};

export default function WalletPage() {
  return <WalletView />;
}
