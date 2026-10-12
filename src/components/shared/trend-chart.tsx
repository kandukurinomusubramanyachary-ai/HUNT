"use client";

import * as React from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  ComposedChart,
} from "recharts";

import { formatCompact, formatCurrency, formatNumber, formatShortDate } from "@/lib/utils";

export interface TrendPointData {
  date: string;
  value: number;
}

function ChartTooltip({
  active,
  payload,
  label,
  formatter,
}: {
  active?: boolean;
  payload?: { value?: number; name?: string; dataKey?: string | number }[];
  label?: string;
  formatter: (value: number) => string;
}) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="rounded-[8px] border border-border bg-elevated px-3 py-2 shadow-elevated">
      <p className="text-[11px] text-text-muted">{label}</p>
      {payload.map((entry) => (
        <p key={String(entry.dataKey)} className="tabular mt-0.5 text-[13px] font-semibold text-text">
          {formatter(Number(entry.value ?? 0))}
        </p>
      ))}
    </div>
  );
}

export function TrendChart({
  data,
  height = 220,
  color = "#A3E635",
  valueFormatter = (value: number) => formatNumber(value),
  showGrid = true,
}: {
  data: TrendPointData[];
  height?: number;
  color?: string;
  valueFormatter?: (value: number) => string;
  showGrid?: boolean;
}) {
  const gradientId = React.useId().replace(/:/g, "");

  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 6, right: 6, left: -18, bottom: 0 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.32} />
              <stop offset="100%" stopColor={color} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          {showGrid ? (
            <CartesianGrid stroke="#1C222C" vertical={false} strokeDasharray="3 3" />
          ) : null}
          <XAxis
            dataKey="date"
            tickFormatter={formatShortDate}
            tickLine={false}
            axisLine={false}
            minTickGap={24}
          />
          <YAxis
            tickFormatter={(value: number) => formatNumber(value)}
            tickLine={false}
            axisLine={false}
            width={44}
          />
          <Tooltip
            content={
              <ChartTooltip
                formatter={(value) => valueFormatter(value)}
              />
            }
            cursor={{ stroke: "#38414F", strokeWidth: 1 }}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            fill={`url(#${gradientId})`}
            activeDot={{ r: 3.5, strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export interface PerformancePoint {
  label: string;
  visitors: number;
  orders: number;
  revenue: number;
}

export function PerformanceChart({
  data,
  height = 260,
}: {
  data: PerformancePoint[];
  height?: number;
}) {
  const visitorsId = React.useId().replace(/:/g, "");
  const ordersId = React.useId().replace(/:/g, "");

  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 6, right: 4, left: -18, bottom: 0 }}>
          <defs>
            <linearGradient id={visitorsId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#60A5FA" stopOpacity={0.28} />
              <stop offset="100%" stopColor="#60A5FA" stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id={ordersId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#A3E635" stopOpacity={0.26} />
              <stop offset="100%" stopColor="#A3E635" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#1C222C" vertical={false} strokeDasharray="3 3" />
          <XAxis dataKey="label" tickLine={false} axisLine={false} minTickGap={20} />
          <YAxis
            yAxisId="left"
            tickFormatter={(value: number) => formatNumber(value)}
            tickLine={false}
            axisLine={false}
            width={44}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            tickFormatter={(value: number) => formatNumber(value)}
            tickLine={false}
            axisLine={false}
            width={40}
          />
          <Tooltip
            cursor={{ stroke: "#38414F", strokeWidth: 1 }}
            content={({ active, payload, label }) => {
              if (!active || !payload || payload.length === 0) return null;
              const visitors = Number(payload[0]?.value ?? 0);
              const orders = Number(payload[1]?.value ?? 0);
              const revenue = Number(payload[2]?.value ?? 0);
              return (
                <div className="rounded-[8px] border border-border bg-elevated px-3 py-2 shadow-elevated">
                  <p className="text-[11px] text-text-muted">{label}</p>
                  <p className="tabular mt-0.5 text-[13px] text-text">
                    {formatNumber(visitors)} visitors
                  </p>
                  <p className="tabular text-[13px] text-text">
                    {formatNumber(orders)} orders
                  </p>
                  <p className="tabular text-[13px] font-semibold text-brand">
                    {formatCurrency(revenue)}
                  </p>
                </div>
              );
            }}
          />
          <Area
            yAxisId="left"
            type="monotone"
            dataKey="visitors"
            stroke="#60A5FA"
            strokeWidth={2}
            fill={`url(#${visitorsId})`}
          />
          <Area
            yAxisId="right"
            type="monotone"
            dataKey="orders"
            stroke="#A3E635"
            strokeWidth={2}
            fill={`url(#${ordersId})`}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="revenue"
            stroke="#F4F6FA"
            strokeWidth={0}
            dot={false}
            activeDot={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
