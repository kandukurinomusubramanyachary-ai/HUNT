"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";

import { AppHeader } from "@/components/layout/app-header";
import { AppSidebar } from "@/components/layout/app-sidebar";
import {
  PageMetaProvider,
  type Breadcrumb,
} from "@/components/layout/page-meta";
import { PageMeta } from "@/components/layout/page-meta";
import { useHydrated } from "@/components/layout/store-hydrator";
import { ToastViewport } from "@/components/ui/toast";
import { useHuntStore } from "@/store/hunt-store";
import { cn } from "@/lib/utils";

/** SSR-safe media query: always false on the first paint, resolved after mount. */
function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = React.useState(false);

  React.useEffect(() => {
    const list = window.matchMedia(query);
    const update = () => setMatches(list.matches);
    update();
    list.addEventListener("change", update);
    return () => list.removeEventListener("change", update);
  }, [query]);

  return matches;
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const pathname = usePathname();
  const hydrated = useHydrated();
  const persistedCollapsed = useHuntStore((state) => state.sidebarCollapsed);
  const collapsed = hydrated ? persistedCollapsed : false;
  const hasPersistentSidebar = useMediaQuery("(min-width: 768px)");
  const isWide = useMediaQuery("(min-width: 1024px)");

  React.useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <PageMetaProvider>
      <TooltipPrimitive.Provider delayDuration={220}>
        <AppSidebar
          mobileOpen={mobileOpen}
          onCloseMobile={() => setMobileOpen(false)}
          forceCollapsed={!isWide}
        />
        <div
          className={cn(
            "flex min-h-screen flex-col transition-[padding] duration-200 ease-out",
            collapsed
              ? "md:pl-[72px]"
              : "md:pl-[72px] lg:pl-[248px]",
            !hasPersistentSidebar && "pl-0",
          )}
        >
          <AppHeader onOpenMobileNav={() => setMobileOpen(true)} />
          <main className="mx-auto w-full max-w-content flex-1 px-4 py-6 sm:px-6 lg:px-8">
            {children}
          </main>
        </div>
        <ToastViewport />
      </TooltipPrimitive.Provider>
    </PageMetaProvider>
  );
}

export function PageIntro({
  title,
  subtitle,
  breadcrumbs,
  actions,
  meta,
}: {
  title: string;
  subtitle?: string;
  breadcrumbs?: Breadcrumb[];
  actions?: React.ReactNode;
  meta?: React.ReactNode;
}) {
  return (
    <>
      <PageMeta title={title} breadcrumbs={breadcrumbs} actions={actions} />
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-display text-text">{title}</h2>
          {subtitle ? (
            <p className="mt-1.5 text-body text-text-secondary">{subtitle}</p>
          ) : null}
          {meta ? <div className="mt-3">{meta}</div> : null}
        </div>
        {actions ? (
          <div className="flex flex-wrap items-center gap-2 lg:hidden">
            {actions}
          </div>
        ) : null}
      </div>
    </>
  );
}
