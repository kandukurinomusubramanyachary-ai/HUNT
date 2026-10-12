import { formatNumber, formatPercent, safeDivide } from "@/lib/utils";

const STAGES = [
  { key: "productViews", label: "Product views", color: "#60A5FA" },
  { key: "checkoutStarts", label: "Checkout starts", color: "#A3E635" },
  { key: "orders", label: "Completed demo orders", color: "#34D399" },
] as const;

export function ConversionFunnel({
  productViews,
  checkoutStarts,
  orders,
}: {
  productViews: number;
  checkoutStarts: number;
  orders: number;
}) {
  const values = { productViews, checkoutStarts, orders };
  const max = Math.max(productViews, 1);

  return (
    <div className="flex flex-col gap-4">
      {STAGES.map((stage, index) => {
        const value = values[stage.key];
        const previous =
          index === 0 ? productViews : values[STAGES[index - 1].key];
        const stepRate = safeDivide(value, previous) * 100;
        const width = Math.max(safeDivide(value, max) * 100, value > 0 ? 4 : 1.5);

        return (
          <div key={stage.key}>
            <div className="flex items-baseline justify-between gap-3">
              <p className="text-secondary text-text-secondary">{stage.label}</p>
              <p className="tabular text-[13px] font-semibold text-text">
                {formatNumber(value)}
              </p>
            </div>
            <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-[#161B24]">
              <div
                className="h-full rounded-full transition-[width] duration-500"
                style={{ width: `${width}%`, backgroundColor: stage.color }}
              />
            </div>
            <p className="mt-1 text-[11px] text-text-muted">
              {index === 0
                ? `${formatPercent(safeDivide(value, max) * 100, 0)} of top-of-funnel volume`
                : `${formatPercent(stepRate)} of the previous stage`}
            </p>
          </div>
        );
      })}
    </div>
  );
}
