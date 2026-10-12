"use client";

import * as React from "react";
import { Database, RotateCcw, Settings2, Sliders } from "lucide-react";

import { PageIntro } from "@/components/layout/app-shell";
import { useHydrated } from "@/components/layout/store-hydrator";
import { DemoNote } from "@/components/shared/demo-badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useConfirmDialog } from "@/components/ui/confirmation-dialog";
import { toast } from "@/components/ui/toast";
import { useHuntStore, type AnalyticsRangeKey } from "@/store/hunt-store";
import { formatCurrency, formatNumber } from "@/lib/utils";

export function SettingsView() {
  const hydrated = useHydrated();
  const sidebarCollapsed = useHuntStore((state) => state.sidebarCollapsed);
  const setSidebarCollapsed = useHuntStore((state) => state.setSidebarCollapsed);
  const defaultRange = useHuntStore((state) => state.defaultRange);
  const setDefaultRange = useHuntStore((state) => state.setDefaultRange);
  const reinvestmentPct = useHuntStore((state) => state.reinvestmentPct);
  const setReinvestmentPct = useHuntStore((state) => state.setReinvestmentPct);
  const resetDemo = useHuntStore((state) => state.resetDemo);

  const stores = useHuntStore((state) => state.stores);
  const orders = useHuntStore((state) => state.orders);
  const creatives = useHuntStore((state) => state.creatives);
  const transactions = useHuntStore((state) => state.transactions);
  const { confirm, dialog } = useConfirmDialog();

  const revenue = React.useMemo(
    () =>
      orders
        .filter((order) => order.status !== "refunded")
        .reduce((sum, order) => sum + order.total, 0),
    [orders],
  );

  return (
    <>
      <PageIntro
        title="Settings"
        subtitle="Workspace preferences and demo data controls."
        breadcrumbs={[{ label: "HUNT", href: "/dashboard" }, { label: "Settings" }]}
      />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <section className="rounded-card border border-border bg-surface p-5 sm:p-6">
          <div className="flex items-center gap-2">
            <Settings2 className="size-4 text-text-muted" />
            <h3 className="text-card font-semibold text-text">Workspace</h3>
          </div>
          <p className="mt-1 text-[12px] text-text-secondary">
            Interface defaults for this browser.
          </p>

          <div className="mt-5 flex flex-col gap-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[13px] font-medium text-text">
                  Start with the sidebar collapsed
                </p>
                <p className="text-[12px] text-text-muted">
                  Keeps more width for charts on smaller screens.
                </p>
              </div>
              <Switch
                checked={hydrated ? sidebarCollapsed : false}
                onCheckedChange={setSidebarCollapsed}
                aria-label="Start with the sidebar collapsed"
              />
            </div>

            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[13px] font-medium text-text">
                  Default analytics range
                </p>
                <p className="text-[12px] text-text-muted">
                  Used when you open the analytics page.
                </p>
              </div>
              <Select
                value={defaultRange}
                onValueChange={(value) => setDefaultRange(value as AnalyticsRangeKey)}
              >
                <SelectTrigger className="h-9 w-[150px]" aria-label="Default analytics range">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </section>

        <section className="rounded-card border border-border bg-surface p-5 sm:p-6">
          <div className="flex items-center gap-2">
            <Sliders className="size-4 text-text-muted" />
            <h3 className="text-card font-semibold text-text">
              Reinvestment default
            </h3>
          </div>
          <p className="mt-1 text-[12px] text-text-secondary">
            Starting position for the wallet planner slider.
          </p>

          <div className="mt-6">
            <div className="mb-3 flex items-baseline justify-between">
              <span className="text-label text-text-secondary">
                Reinvestment percentage
              </span>
              <span className="tabular text-[18px] font-semibold text-text">
                {reinvestmentPct}%
              </span>
            </div>
            <Slider
              value={[reinvestmentPct]}
              onValueChange={(value) => setReinvestmentPct(value[0] ?? 0)}
              min={0}
              max={100}
              step={1}
              aria-label="Default reinvestment percentage"
            />
          </div>
          <p className="mt-4 text-[12px] leading-5 text-text-muted">
            This value is also adjustable directly on the wallet page and is
            saved with your workspace data.
          </p>
        </section>

        <section className="rounded-card border border-border bg-surface p-5 sm:p-6">
          <div className="flex items-center gap-2">
            <Database className="size-4 text-text-muted" />
            <h3 className="text-card font-semibold text-text">Demo data</h3>
          </div>
          <p className="mt-1 text-[12px] text-text-secondary">
            Everything HUNT shows is stored in this browser.
          </p>

          <dl className="mt-5 grid grid-cols-2 gap-3">
            {[
              { label: "Stores", value: formatNumber(stores.length) },
              { label: "Demo orders", value: formatNumber(orders.length) },
              { label: "Creatives", value: formatNumber(creatives.length) },
              {
                label: "Wallet entries",
                value: formatNumber(transactions.length),
              },
              {
                label: "Simulated revenue",
                value: formatCurrency(revenue),
              },
              {
                label: "Storage key",
                value: "hunt-frontend-state",
              },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-[10px] border border-border bg-elevated/40 px-3 py-2.5"
              >
                <dt className="text-[11px] text-text-muted">{item.label}</dt>
                <dd className="tabular mt-0.5 truncate text-[13px] font-semibold text-text">
                  {item.value}
                </dd>
              </div>
            ))}
          </dl>

          <div className="mt-5 flex flex-wrap gap-2">
            <Button
              variant="danger"
              onClick={() =>
                confirm({
                  title: "Reset demo data?",
                  description:
                    "Stores, orders, creatives and wallet records you created will be replaced with the original sample data.",
                  confirmLabel: "Reset demo data",
                  onConfirm: () => {
                    resetDemo();
                    toast({
                      title: "Demo data reset",
                      description: "Sample stores and orders were restored.",
                    });
                  },
                })
              }
            >
              <RotateCcw />
              Reset demo data
            </Button>
          </div>

          <div className="mt-4">
            <DemoNote>
              Resetting restores a known consistent state: three sample stores,
              their demo order history and the original sample creatives.
            </DemoNote>
          </div>
        </section>

        <section className="rounded-card border border-border bg-surface p-5 sm:p-6">
          <h3 className="text-card font-semibold text-text">About this build</h3>
          <p className="mt-1 text-[12px] text-text-secondary">
            HUNT milestone 1 — frontend demonstration.
          </p>
          <ul className="mt-4 flex flex-col gap-2">
            {[
              "No backend, payments, scraping or social publishing.",
              "Discovery signals, orders and revenue are sample data.",
              "State persists in localStorage under hunt-frontend-state.",
              "Service functions are isolated so API calls can replace them.",
            ].map((item) => (
              <li
                key={item}
                className="flex gap-2 text-[12px] leading-5 text-text-secondary"
              >
                <span className="mt-1.5 size-1 shrink-0 rounded-full bg-brand" />
                {item}
              </li>
            ))}
          </ul>
        </section>
      </div>

      {dialog}
    </>
  );
}
