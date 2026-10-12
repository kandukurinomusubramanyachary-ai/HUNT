"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Info,
  Megaphone,
  Receipt,
  Wallet as WalletIcon,
} from "lucide-react";

import { PageIntro } from "@/components/layout/app-shell";
import { useHydrated } from "@/components/layout/store-hydrator";
import { DemoBadge, DemoNote } from "@/components/shared/demo-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { KpiCard } from "@/components/shared/kpi-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { SegmentedControl } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getReinvestmentPlan, getWalletSummary, getWalletTransactions } from "@/lib/services/wallet";
import { useHuntStore } from "@/store/hunt-store";
import { cn, formatCurrency, formatDate, formatPercent } from "@/lib/utils";
import type { WalletTransactionType } from "@/types";

const TYPE_META: Record<
  WalletTransactionType,
  { label: string; tone: "positive" | "negative" | "info"; icon: React.ComponentType<{ className?: string }> }
> = {
  "sale-credit": { label: "Demo sale credit", tone: "positive", icon: ArrowDownLeft },
  "marketing-debit": {
    label: "Marketing debit",
    tone: "info",
    icon: Megaphone,
  },
  "operating-debit": {
    label: "Operating expense",
    tone: "negative",
    icon: Receipt,
  },
};

export function WalletView() {
  const hydrated = useHydrated();
  const transactions = useHuntStore((state) => state.transactions);
  const stores = useHuntStore((state) => state.stores);
  const reinvestmentPct = useHuntStore((state) => state.reinvestmentPct);
  const setReinvestmentPct = useHuntStore((state) => state.setReinvestmentPct);

  const [typeFilter, setTypeFilter] = React.useState<"all" | "credits" | "debits">(
    "all",
  );
  const [storeFilter, setStoreFilter] = React.useState("all");

  const summary = React.useMemo(
    () => getWalletSummary(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [transactions],
  );
  const plan = React.useMemo(
    () => getReinvestmentPlan(reinvestmentPct),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [transactions, reinvestmentPct],
  );
  const rows = React.useMemo(() => {
    let list = getWalletTransactions();
    if (typeFilter === "credits") {
      list = list.filter((txn) => txn.type === "sale-credit");
    }
    if (typeFilter === "debits") {
      list = list.filter((txn) => txn.type !== "sale-credit");
    }
    if (storeFilter !== "all") {
      list = list.filter((txn) => txn.storeId === storeFilter);
    }
    return list;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transactions, typeFilter, storeFilter]);

  return (
    <>
      <PageIntro
        title="Commerce Wallet"
        subtitle="Track simulated cash flow and plan reinvestment."
        breadcrumbs={[
          { label: "HUNT", href: "/dashboard" },
          { label: "Performance" },
          { label: "Wallet" },
        ]}
        actions={
          <Button asChild variant="secondary">
            <Link href="/analytics">
              View analytics
            </Link>
          </Button>
        }
      />

      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {!hydrated ? (
            Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-[120px] rounded-card" />
            ))
          ) : (
            <>
              <KpiCard
                label="Simulated available balance"
                value={formatCurrency(summary.availableBalance)}
                icon={WalletIcon}
                description={`${formatCurrency(summary.pendingAmount)} pending settlement`}
                accent
              />
              <KpiCard
                label="Total simulated sales"
                value={formatCurrency(summary.totalSales)}
                icon={ArrowDownLeft}
                description="Sum of demo sale credits"
              />
              <KpiCard
                label="Estimated expenses"
                value={formatCurrency(summary.estimatedExpenses)}
                icon={ArrowUpRight}
                description="Simulated marketing and operating costs"
              />
              <KpiCard
                label="Suggested reinvestment"
                value={formatCurrency(plan.reinvestAmount)}
                icon={Info}
                description={`${formatPercent(plan.percentage, 0)} of eligible balance`}
              />
            </>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
          {/* Reinvestment planner */}
          <section className="rounded-card border border-border bg-surface p-5 sm:p-6 xl:col-span-1">
            <div className="flex items-center gap-2">
              <h3 className="text-card font-semibold text-text">
                Reinvestment planner
              </h3>
              <DemoBadge label="Planning only" />
            </div>
            <p className="mt-1 text-secondary text-text-secondary">
              Model how much of your simulated balance to put back into growth.
            </p>

            <div className="mt-6">
              <div className="mb-3 flex items-baseline justify-between">
                <span className="text-label text-text-secondary">
                  Reinvestment setting
                </span>
                <span className="tabular text-[20px] font-semibold text-text">
                  {Math.round(plan.percentage)}%
                </span>
              </div>
              <Slider
                value={[plan.percentage]}
                onValueChange={(value) => setReinvestmentPct(value[0] ?? 0)}
                min={0}
                max={100}
                step={1}
                aria-label="Reinvestment percentage"
              />
              <div className="mt-2 flex justify-between text-[11px] text-text-muted">
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
            </div>

            <dl className="mt-6 flex flex-col gap-2.5">
              <div className="flex items-center justify-between gap-3 text-[13px]">
                <dt className="text-text-muted">Eligible demo balance</dt>
                <dd className="tabular font-medium text-text">
                  {formatCurrency(plan.eligibleBalance)}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3 text-[13px]">
                <dt className="text-text-muted">Suggested reinvestment</dt>
                <dd className="tabular font-semibold text-brand">
                  {formatCurrency(plan.reinvestAmount)}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3 border-t border-border pt-2.5 text-[13px]">
                <dt className="font-semibold text-text">Balance remaining</dt>
                <dd className="tabular font-semibold text-text">
                  {formatCurrency(plan.remainingBalance)}
                </dd>
              </div>
            </dl>

            <div className="mt-6">
              <p className="text-[11px] font-medium tracking-wide text-text-muted">
                Recommended allocation
              </p>
              {plan.allocation.length === 0 ? (
                <p className="mt-2 text-[12px] text-text-muted">
                  Add a demo sale to model an allocation.
                </p>
              ) : (
                <ul className="mt-3 flex flex-col gap-2">
                  {plan.allocation.map((item) => (
                    <li
                      key={item.label}
                      className="rounded-[10px] border border-border bg-elevated/40 px-3 py-2.5"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-[13px] font-medium text-text">
                          {item.label}
                        </span>
                        <span className="tabular text-[13px] font-semibold text-text">
                          {formatCurrency(item.amount)}
                        </span>
                      </div>
                      <p className="mt-0.5 text-[11px] text-text-muted">
                        {item.note}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <p className="mt-5 text-[11px] leading-4 text-text-muted">
              This planner is a calculator. It cannot move money, buy
              advertising or schedule a transfer.
            </p>
          </section>

          {/* Transactions */}
          <section className="rounded-card border border-border bg-surface xl:col-span-2">
            <div className="flex flex-wrap items-start justify-between gap-3 px-5 pb-4 pt-5 sm:px-6">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-card font-semibold text-text">
                    Transaction history
                  </h3>
                  <DemoBadge label="Simulated" />
                </div>
                <p className="mt-1 text-secondary text-text-secondary">
                  Credits from demo orders, debits from simulated spend.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <SegmentedControl
                  ariaLabel="Transaction type"
                  value={typeFilter}
                  onChange={setTypeFilter}
                  size="sm"
                  options={[
                    { value: "all", label: "All" },
                    { value: "credits", label: "Credits" },
                    { value: "debits", label: "Debits" },
                  ]}
                />
                <Select value={storeFilter} onValueChange={setStoreFilter}>
                  <SelectTrigger className="h-8 w-[160px] text-[12px]" aria-label="Store filter">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All stores</SelectItem>
                    {stores.map((store) => (
                      <SelectItem key={store.id} value={store.id}>
                        {store.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="overflow-x-auto px-5 pb-5 sm:px-6">
              {!hydrated ? (
                <div className="flex flex-col gap-2">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <Skeleton key={index} className="h-11 w-full" />
                  ))}
                </div>
              ) : rows.length === 0 ? (
                <EmptyState
                  icon={Receipt}
                  title="No transactions recorded yet."
                  description="Complete a demo checkout on a storefront to record your first simulated sale."
                  action={
                    <Button asChild variant="secondary">
                      <Link href="/stores">Open a storefront</Link>
                    </Button>
                  }
                />
              ) : (
                <table className="w-full min-w-[720px] border-collapse">
                  <thead>
                    <tr className="border-b border-border text-left">
                      <th className="pb-2 text-[11px] font-medium text-text-muted">
                        Date
                      </th>
                      <th className="pb-2 text-[11px] font-medium text-text-muted">
                        Description
                      </th>
                      <th className="pb-2 text-[11px] font-medium text-text-muted">
                        Type
                      </th>
                      <th className="pb-2 text-[11px] font-medium text-text-muted">
                        Store
                      </th>
                      <th className="pb-2 text-right text-[11px] font-medium text-text-muted">
                        Amount
                      </th>
                      <th className="pb-2 text-right text-[11px] font-medium text-text-muted">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.slice(0, 40).map((txn) => {
                      const meta = TYPE_META[txn.type];
                      const Icon = meta.icon;
                      const credit = txn.type === "sale-credit";
                      return (
                        <tr
                          key={txn.id}
                          className="border-b border-border/60 last:border-0"
                        >
                          <td className="whitespace-nowrap py-2.5 text-[12px] text-text-secondary">
                            {formatDate(txn.timestamp)}
                          </td>
                          <td className="max-w-[280px] truncate py-2.5 text-[13px] text-text">
                            {txn.description}
                          </td>
                          <td className="py-2.5">
                            <span className="flex items-center gap-1.5">
                              <Icon
                                className={cn(
                                  "size-3.5",
                                  credit ? "text-positive" : "text-text-muted",
                                )}
                              />
                              <span className="text-[12px] text-text-secondary">
                                {meta.label}
                              </span>
                            </span>
                          </td>
                          <td className="whitespace-nowrap py-2.5 text-[12px] text-text-secondary">
                            {txn.storeName}
                          </td>
                          <td
                            className={cn(
                              "tabular whitespace-nowrap py-2.5 text-right text-[13px] font-semibold",
                              credit ? "text-positive" : "text-text",
                            )}
                          >
                            {credit ? "+" : "−"}
                            {formatCurrency(txn.amount)}
                          </td>
                          <td className="py-2.5 text-right">
                            <Badge
                              tone={txn.status === "settled" ? "muted" : "warning"}
                            >
                              {txn.status}
                            </Badge>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
              {hydrated && rows.length > 40 ? (
                <p className="mt-3 text-[11px] text-text-muted">
                  Showing the 40 most recent of {rows.length} transactions.
                </p>
              ) : null}
            </div>
          </section>
        </div>

        <DemoNote>
          HUNT does not hold money, process payments or place advertising. This
          wallet is a simulated ledger built from the same demo order records
          that power analytics.
        </DemoNote>
      </div>
    </>
  );
}
