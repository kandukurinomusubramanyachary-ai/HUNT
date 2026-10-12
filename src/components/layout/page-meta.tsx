"use client";

import * as React from "react";

export interface Breadcrumb {
  label: string;
  href?: string;
}

export interface PageMetaValue {
  title?: string;
  breadcrumbs?: Breadcrumb[];
  actions?: React.ReactNode;
}

interface PageMetaContextValue {
  meta: PageMetaValue;
  setMeta: (meta: PageMetaValue) => void;
}

const PageMetaContext = React.createContext<PageMetaContextValue>({
  meta: {},
  setMeta: () => {},
});

export function PageMetaProvider({ children }: { children: React.ReactNode }) {
  const [meta, setMetaState] = React.useState<PageMetaValue>({});
  const setMeta = React.useCallback((next: PageMetaValue) => {
    setMetaState((prev) => {
      const same =
        prev.title === next.title &&
        JSON.stringify(prev.breadcrumbs ?? null) ===
          JSON.stringify(next.breadcrumbs ?? null) &&
        prev.actions === next.actions;
      return same ? prev : next;
    });
  }, []);

  const value = React.useMemo(() => ({ meta, setMeta }), [meta, setMeta]);

  return (
    <PageMetaContext.Provider value={value}>{children}</PageMetaContext.Provider>
  );
}

export function usePageMeta(): PageMetaValue {
  return React.useContext(PageMetaContext).meta;
}

/** Declares header metadata from inside a page. */
export function PageMeta({
  title,
  breadcrumbs,
  actions,
}: {
  title?: string;
  breadcrumbs?: Breadcrumb[];
  actions?: React.ReactNode;
}) {
  const { setMeta } = React.useContext(PageMetaContext);

  React.useEffect(() => {
    setMeta({ title, breadcrumbs, actions });
    return () => setMeta({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, actions, JSON.stringify(breadcrumbs ?? null)]);

  return null;
}
