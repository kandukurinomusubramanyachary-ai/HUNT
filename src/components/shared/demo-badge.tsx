import { FlaskConical } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/**
 * Every simulated figure in HUNT is marked. This badge is the single visual
 * contract for "this number is sample data, not a live measurement".
 */
export function DemoBadge({
  label = "Demo data",
  className,
  withIcon = true,
}: {
  label?: string;
  className?: string;
  withIcon?: boolean;
}) {
  return (
    <Badge
      tone="muted"
      className={cn("border-dashed text-text-muted", className)}
    >
      {withIcon ? <FlaskConical className="size-3" /> : null}
      {label}
    </Badge>
  );
}

export function DemoNote({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "flex items-start gap-2 text-[12px] leading-4 text-text-muted",
        className,
      )}
    >
      <FlaskConical className="mt-px size-3.5 shrink-0" />
      <span>{children}</span>
    </p>
  );
}
