"use client";

import * as React from "react";

import { formatDate, relativeTime } from "@/lib/utils";

/**
 * Renders a stable absolute timestamp on the server and upgrades to a
 * relative label after mount, so hydration never mismatches.
 */
export function RelativeTime({
  timestamp,
  className,
}: {
  timestamp: string;
  className?: string;
}) {
  const absolute = formatDate(timestamp);
  const [label, setLabel] = React.useState(absolute);

  React.useEffect(() => {
    const update = () => setLabel(relativeTime(timestamp, Date.now()));
    update();
    const timer = setInterval(update, 60000);
    return () => clearInterval(timer);
  }, [timestamp]);

  return (
    <time dateTime={timestamp} className={className} title={absolute}>
      {label}
    </time>
  );
}
