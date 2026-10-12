import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[11px] font-medium leading-4 transition-colors",
  {
    variants: {
      tone: {
        neutral: "border-border bg-elevated text-text-secondary",
        brand: "border-brand/25 bg-brand/10 text-brand",
        positive: "border-positive/25 bg-positive/10 text-positive",
        negative: "border-negative/25 bg-negative/10 text-negative",
        info: "border-info/25 bg-info/10 text-info",
        warning: "border-warning/25 bg-warning/10 text-warning",
        muted: "border-border/70 bg-transparent text-text-muted",
      },
    },
    defaultVariants: {
      tone: "neutral",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, tone, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ tone }), className)} {...props} />;
}

export { Badge, badgeVariants };
