"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FlaskConical, PanelLeftClose, PanelLeftOpen, X } from "lucide-react";

import { NAV_GROUPS, SETTINGS_ITEM, type NavItem } from "@/lib/nav";
import { useHuntStore } from "@/store/hunt-store";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

function HuntMark({ collapsed }: { collapsed: boolean }) {
  return (
    <Link
      href="/dashboard"
      className="group flex h-14 items-center gap-2.5 px-4 focus-visible:outline-none"
      aria-label="HUNT home"
    >
      <span className="relative flex size-7 shrink-0 items-center justify-center rounded-md border border-brand/30 bg-brand/10">
        <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
          <circle cx="7" cy="7" r="5.25" fill="none" stroke="#A3E635" strokeWidth="1.4" />
          <circle cx="7" cy="7" r="1.9" fill="#A3E635" />
          <path d="M7 0v2.2M7 11.8V14M0 7h2.2M11.8 7H14" stroke="#A3E635" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      </span>
      {!collapsed ? (
        <span className="hidden flex-col leading-none lg:flex">
          <span className="text-[15px] font-semibold tracking-[0.14em] text-text">
            HUNT
          </span>
          <span className="mt-0.5 text-[10px] leading-3 text-text-muted">
            Commerce intelligence
          </span>
        </span>
      ) : null}
    </Link>
  );
}

function NavRow({
  item,
  collapsed,
  active,
  onNavigate,
}: {
  item: NavItem;
  collapsed: boolean;
  active: boolean;
  onNavigate?: () => void;
}) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      title={collapsed ? item.label : undefined}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group relative flex h-9 items-center gap-2.5 rounded-btn px-2.5 text-[13px] font-medium transition-colors duration-150",
        active
          ? "bg-elevated text-text"
          : "text-text-secondary hover:bg-elevated/70 hover:text-text",
      )}
    >
      <span
        className={cn(
          "absolute left-0 top-1/2 h-4 w-[2px] -translate-y-1/2 rounded-r bg-brand transition-opacity duration-150",
          active ? "opacity-100" : "opacity-0",
        )}
      />
      <Icon
        className={cn(
          "size-4 shrink-0 transition-colors",
          active ? "text-brand" : "text-text-muted group-hover:text-text-secondary",
        )}
      />
      {!collapsed ? <span className="truncate">{item.label}</span> : null}
    </Link>
  );
}

export function AppSidebar({
  mobileOpen,
  onCloseMobile,
  forceCollapsed = false,
}: {
  mobileOpen: boolean;
  onCloseMobile: () => void;
  forceCollapsed?: boolean;
}) {
  const pathname = usePathname();
  const storedCollapsed = useHuntStore((state) => state.sidebarCollapsed);
  const toggleSidebar = useHuntStore((state) => state.toggleSidebar);
  const collapsed = storedCollapsed || forceCollapsed;

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  const content = (
    <>
      <div
        className={cn(
          "flex h-14 items-center justify-between border-b border-border",
          collapsed && "lg:justify-center",
        )}
      >
        <HuntMark collapsed={collapsed} />
        <button
          type="button"
          onClick={onCloseMobile}
          aria-label="Close navigation"
          className="mr-2 rounded-md p-1.5 text-text-muted transition-colors hover:bg-elevated hover:text-text md:hidden"
        >
          <X className="size-4" />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 no-scrollbar">
        {NAV_GROUPS.map((group) => (
          <div key={group.label} className="mb-5 last:mb-0">
            {collapsed ? (
              <div className="mx-2 mb-2 h-px bg-border" />
            ) : (
              <p className="mb-1.5 px-2.5 text-[11px] font-medium tracking-wide text-text-muted">
                {group.label}
              </p>
            )}
            <div className="flex flex-col gap-0.5">
              {group.items.map((item) => (
                <NavRow
                  key={item.href}
                  item={item}
                  collapsed={collapsed}
                  active={isActive(item.href)}
                  onNavigate={onCloseMobile}
                />
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-border px-3 py-3">
        {!collapsed ? (
          <div className="mb-2 hidden items-center gap-2 rounded-btn border border-dashed border-border bg-elevated/50 px-2.5 py-2 lg:flex">
            <FlaskConical className="size-3.5 shrink-0 text-brand" />
            <div className="min-w-0">
              <p className="text-[11px] font-semibold text-text">Demo mode</p>
              <p className="truncate text-[10px] leading-3 text-text-muted">
                All figures are simulated
              </p>
            </div>
          </div>
        ) : (
          <div className="mb-2 flex justify-center">
            <span
              title="Demo mode — all figures are simulated"
              className="flex size-7 items-center justify-center rounded-md border border-dashed border-border bg-elevated/50"
            >
              <FlaskConical className="size-3.5 text-brand" />
            </span>
          </div>
        )}

        <NavRow
          item={SETTINGS_ITEM}
          collapsed={collapsed}
          active={isActive(SETTINGS_ITEM.href)}
          onNavigate={onCloseMobile}
        />

        <Button
          variant="ghost"
          size="sm"
          onClick={toggleSidebar}
          className={cn(
            "mt-1 hidden w-full justify-start gap-2.5 px-2.5 lg:flex",
            collapsed && "justify-center px-0",
          )}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <PanelLeftOpen className="size-4 text-text-muted" />
          ) : (
            <>
              <PanelLeftClose className="size-4 text-text-muted" />
              <span className="text-[13px] font-medium text-text-secondary">
                Collapse
              </span>
            </>
          )}
        </Button>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop / tablet */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 hidden flex-col border-r border-border bg-surface transition-[width] duration-200 ease-out md:flex",
          collapsed ? "w-[72px]" : "w-[72px] lg:w-[248px]",
        )}
      >
        {content}
      </aside>

      {/* Mobile drawer */}
      <div
        className={cn(
          "fixed inset-0 z-50 md:hidden",
          mobileOpen ? "pointer-events-auto" : "pointer-events-none",
        )}
        aria-hidden={!mobileOpen}
      >
        <div
          onClick={onCloseMobile}
          className={cn(
            "absolute inset-0 bg-[#04060A]/75 transition-opacity duration-200",
            mobileOpen ? "opacity-100" : "opacity-0",
          )}
        />
        <aside
          className={cn(
            "absolute inset-y-0 left-0 flex w-[264px] flex-col border-r border-border bg-surface shadow-elevated transition-transform duration-200 ease-out",
            mobileOpen ? "translate-x-0" : "-translate-x-full",
          )}
        >
          {content}
        </aside>
      </div>
    </>
  );
}
