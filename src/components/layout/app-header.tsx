"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  ChevronRight,
  LogOut,
  Menu,
  RotateCcw,
  Settings,
} from "lucide-react";

import { GlobalSearch } from "@/components/layout/global-search";
import { usePageMeta } from "@/components/layout/page-meta";
import { RelativeTime } from "@/components/shared/relative-time";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useConfirmDialog } from "@/components/ui/confirmation-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/components/ui/toast";
import { getRecentActivity } from "@/lib/services/activity";
import { navItemFor } from "@/lib/nav";
import { useHuntStore } from "@/store/hunt-store";
import { cn } from "@/lib/utils";

export function AppHeader({ onOpenMobileNav }: { onOpenMobileNav: () => void }) {
  const pathname = usePathname();
  const meta = usePageMeta();
  const activities = useHuntStore((state) => state.activities);
  const orders = useHuntStore((state) => state.orders);
  const resetDemo = useHuntStore((state) => state.resetDemo);
  const { confirm, dialog } = useConfirmDialog();

  const recent = React.useMemo(
    () => getRecentActivity(6),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activities, orders],
  );

  const navItem = navItemFor(pathname);
  const crumbs = meta.breadcrumbs ?? [
    { label: "HUNT", href: "/dashboard" },
    ...(navItem ? [{ label: navItem.label }] : []),
  ];

  const unread = recent.length;

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-bg/85 px-4 backdrop-blur-md sm:px-6 lg:px-8">
      <button
        type="button"
        onClick={onOpenMobileNav}
        aria-label="Open navigation"
        className="-ml-1 rounded-md p-2 text-text-secondary transition-colors hover:bg-elevated hover:text-text md:hidden"
      >
        <Menu className="size-4.5 size-[18px]" />
      </button>

      <div className="flex min-w-0 flex-1 flex-col justify-center gap-0.5">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1 overflow-hidden">
          {crumbs.map((crumb, index) => (
            <React.Fragment key={`${crumb.label}-${index}`}>
              {index > 0 ? (
                <ChevronRight className="size-3 shrink-0 text-text-muted" />
              ) : null}
              {crumb.href && index < crumbs.length - 1 ? (
                <Link
                  href={crumb.href}
                  className="truncate text-[11px] font-medium text-text-muted transition-colors hover:text-text-secondary"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span
                  className={cn(
                    "truncate text-[11px] font-medium",
                    index === crumbs.length - 1
                      ? "text-text-secondary"
                      : "text-text-muted",
                  )}
                  aria-current={index === crumbs.length - 1 ? "page" : undefined}
                >
                  {crumb.label}
                </span>
              )}
            </React.Fragment>
          ))}
        </nav>
        <h1 className="truncate text-[15px] font-semibold leading-5 text-text">
          {meta.title ?? navItem?.label ?? "HUNT"}
        </h1>
      </div>

      <div className="flex items-center gap-2">
        {meta.actions ? (
          <div className="hidden items-center gap-2 lg:flex">{meta.actions}</div>
        ) : null}

        <GlobalSearch className="w-9 justify-center sm:w-[200px] sm:justify-start xl:w-[260px]" />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label={`Notifications — ${unread} recent events`}
              className="relative flex size-9 items-center justify-center rounded-btn border border-border bg-bg text-text-secondary transition-colors hover:border-[#38414F] hover:text-text"
            >
              <Bell className="size-4" />
              {unread > 0 ? (
                <span className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-brand text-[9px] font-bold text-[#10140A]">
                  {unread > 9 ? "9+" : unread}
                </span>
              ) : null}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[320px]">
            <DropdownMenuLabel>Recent activity</DropdownMenuLabel>
            {recent.length === 0 ? (
              <p className="px-2 py-3 text-secondary text-text-muted">
                Nothing recorded yet.
              </p>
            ) : (
              recent.map((item) => (
                <DropdownMenuItem key={item.id} asChild>
                  <Link
                    href={item.href ?? "/dashboard"}
                    className="flex flex-col items-start gap-0.5 py-2"
                  >
                    <span className="text-[13px] font-medium text-text">
                      {item.title}
                    </span>
                    <span className="flex items-center gap-2 text-[11px] text-text-muted">
                      <RelativeTime timestamp={item.timestamp} />
                      <span>·</span>
                      <span className="truncate">{item.description}</span>
                    </span>
                  </Link>
                </DropdownMenuItem>
              ))
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/dashboard" className="text-[13px]">
                View all activity
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label="Demo workspace menu"
              className="flex h-9 items-center gap-2 rounded-btn border border-border bg-bg pl-1 pr-2 transition-colors hover:border-[#38414F]"
            >
              <span className="flex size-7 items-center justify-center rounded-[6px] bg-gradient-to-br from-brand/85 to-info/70 text-[11px] font-bold text-[#0B0E13]">
                DW
              </span>
              <span className="hidden text-[13px] font-medium text-text-secondary xl:inline">
                Demo workspace
              </span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[248px]">
            <div className="px-2 py-2">
              <p className="text-[13px] font-semibold text-text">
                Demo workspace
              </p>
              <p className="mt-0.5 text-[11px] leading-4 text-text-muted">
                Single-user demo. No account or billing is connected.
              </p>
              <Badge tone="muted" className="mt-2 border-dashed">
                All data stored in this browser
              </Badge>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/settings">
                <Settings />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              tone="danger"
              onSelect={(event) => {
                event.preventDefault();
                confirm({
                  title: "Reset demo data?",
                  description:
                    "All stores, orders, creatives and wallet records you created will be replaced with the original sample data.",
                  confirmLabel: "Reset demo data",
                  onConfirm: () => {
                    resetDemo();
                    toast({
                      title: "Demo data reset",
                      description: "Sample stores and orders were restored.",
                    });
                  },
                });
              }}
            >
              <RotateCcw />
              Reset demo data
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem disabled>
              <LogOut />
              Sign out (unavailable in demo)
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {dialog}
    </header>
  );
}
