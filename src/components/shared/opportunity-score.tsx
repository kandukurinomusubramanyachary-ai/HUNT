import { scoreBand } from "@/lib/services/products";
import { cn } from "@/lib/utils";

export function OpportunityScore({
  score,
  size = "md",
  showLabel = true,
  className,
}: {
  score: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}) {
  const band = scoreBand(score);
  const dimensions = { sm: 44, md: 64, lg: 96 }[size];
  const stroke = { sm: 3.5, md: 4.5, lg: 6 }[size];
  const radius = (dimensions - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(Math.max(score, 0), 100) / 100) * circumference;
  const fontSize = { sm: 12, md: 16, lg: 24 }[size];

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div
        className="relative shrink-0"
        style={{ width: dimensions, height: dimensions }}
      >
        <svg
          width={dimensions}
          height={dimensions}
          viewBox={`0 0 ${dimensions} ${dimensions}`}
          className="-rotate-90"
          role="img"
          aria-label={`Opportunity score ${score} out of 100 — ${band.label}`}
        >
          <circle
            cx={dimensions / 2}
            cy={dimensions / 2}
            r={radius}
            fill="none"
            stroke="#232A36"
            strokeWidth={stroke}
          />
          <circle
            cx={dimensions / 2}
            cy={dimensions / 2}
            r={radius}
            fill="none"
            stroke={band.color}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 600ms ease-out" }}
          />
        </svg>
        <span
          className="tabular absolute inset-0 flex items-center justify-center font-semibold text-text"
          style={{ fontSize }}
        >
          {score}
        </span>
      </div>
      {showLabel ? (
        <div className="min-w-0">
          <p className="text-label text-text-muted">Opportunity score</p>
          <p className="text-[13px] font-medium" style={{ color: band.color }}>
            {band.label}
          </p>
        </div>
      ) : null}
    </div>
  );
}
