import { useHuntStore } from "@/store/hunt-store";
import { clamp } from "@/lib/utils";
import type { WalletTransaction } from "@/types";

/**
 * Wallet service.
 *
 * This is a simulated financial view built from the same order records that
 * drive analytics. No money moves anywhere and nothing here can initiate a
 * transfer or an ad purchase.
 */

export function getWalletTransactions(): WalletTransaction[] {
  return [...useHuntStore.getState().transactions].sort((a, b) =>
    b.timestamp.localeCompare(a.timestamp),
  );
}

export interface WalletSummary {
  availableBalance: number;
  totalSales: number;
  estimatedExpenses: number;
  pendingAmount: number;
  settledAmount: number;
}

export function getWalletSummary(): WalletSummary {
  const transactions = useHuntStore.getState().transactions;
  // Accumulate integer paise so ledger totals remain exact to two decimals.
  let salesPaise = 0;
  let expensePaise = 0;
  let pendingPaise = 0;

  transactions.forEach((txn) => {
    const amountPaise = Math.round((txn.amount + Number.EPSILON) * 100);
    if (txn.type === "sale-credit") {
      salesPaise += amountPaise;
      if (txn.status === "pending") pendingPaise += amountPaise;
    } else {
      expensePaise += amountPaise;
      if (txn.status === "pending") pendingPaise -= amountPaise;
    }
  });

  const totalSales = salesPaise / 100;
  const estimatedExpenses = expensePaise / 100;
  const pendingAmount = pendingPaise / 100;
  const settledAmount = (salesPaise - expensePaise - pendingPaise) / 100;

  return {
    availableBalance: settledAmount,
    totalSales,
    estimatedExpenses,
    pendingAmount,
    settledAmount,
  };
}

export interface ReinvestmentPlan {
  eligibleBalance: number;
  percentage: number;
  reinvestAmount: number;
  remainingBalance: number;
  allocation: { label: string; amount: number; note: string }[];
}

export function getReinvestmentPlan(percentage: number): ReinvestmentPlan {
  const { availableBalance } = getWalletSummary();
  const eligibleBalance = Math.max(availableBalance, 0);
  const pct = clamp(Number.isFinite(percentage) ? percentage : 0, 0, 100);
  const eligiblePaise = Math.round(eligibleBalance * 100);
  const reinvestPaise = Math.round(eligiblePaise * pct / 100);
  const reinvestAmount = reinvestPaise / 100;
  const remainingBalance = (eligiblePaise - reinvestPaise) / 100;
  const socialPaise = Math.round(reinvestPaise * 0.5);
  const creativePaise = Math.round(reinvestPaise * 0.25);

  const allocation = [
    {
      label: "Paid social testing",
      amount: socialPaise / 100,
      note: "New creative angles on the strongest store",
    },
    {
      label: "Creative production",
      amount: creativePaise / 100,
      note: "Additional ad variants and storyboards",
    },
    {
      label: "Inventory buffer",
      amount: (reinvestPaise - socialPaise - creativePaise) / 100,
      note: "Cover lead time on the top seller",
    },
  ];

  return {
    eligibleBalance,
    percentage: pct,
    reinvestAmount,
    remainingBalance,
    allocation: eligibleBalance > 0 ? allocation : [],
  };
}
