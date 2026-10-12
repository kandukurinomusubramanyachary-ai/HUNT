import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";

import "./globals.css";
import { StoreHydrator } from "@/components/layout/store-hydrator";

export const metadata: Metadata = {
  title: {
    default: "HUNT — AI commerce intelligence",
    template: "%s · HUNT",
  },
  description:
    "Discover product opportunities, validate demand, launch stores, create campaigns and track performance from one dashboard. Demo build with simulated data.",
};

export const viewport: Viewport = {
  themeColor: "#090B10",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="min-h-screen bg-bg font-sans text-text antialiased">
        <StoreHydrator />
        {children}
      </body>
    </html>
  );
}
