import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-bg px-6 text-center">
      <span className="flex size-11 items-center justify-center rounded-xl border border-border bg-elevated">
        <span className="tabular text-[13px] font-semibold text-text-muted">
          404
        </span>
      </span>
      <h1 className="text-display text-text">Page not found</h1>
      <p className="max-w-sm text-body text-text-secondary">
        That route is not part of the HUNT workspace.
      </p>
      <Button asChild variant="primary">
        <Link href="/dashboard">Back to Command Center</Link>
      </Button>
    </div>
  );
}
