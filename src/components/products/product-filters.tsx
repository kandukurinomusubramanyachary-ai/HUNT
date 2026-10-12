"use client";

import * as React from "react";
import { Check, ChevronDown, RefreshCw, Search, SlidersHorizontal, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { sourceMeta } from "@/data/demo-evidence";
import { cn } from "@/lib/utils";
import type { CompetitionLevel, DataSourceType } from "@/types";

export interface DiscoverFiltersState {
  query: string;
  categories: string[];
  sources: DataSourceType[];
  competition: CompetitionLevel[];
  sort: "score" | "growth" | "margin" | "price-asc" | "price-desc" | "competition";
  trendWeeks: number;
}

interface Option<T extends string> {
  value: T;
  label: string;
}

function MultiSelectFilter<T extends string>({
  label,
  options,
  selected,
  onChange,
}: {
  label: string;
  options: Option<T>[];
  selected: T[];
  onChange: (next: T[]) => void;
}) {
  const toggle = (value: T) => {
    onChange(
      selected.includes(value)
        ? selected.filter((item) => item !== value)
        : [...selected, value],
    );
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="secondary"
          size="md"
          className={cn(
            "h-9 gap-2 border-border bg-bg",
            selected.length > 0 && "border-brand/40 text-text",
          )}
        >
          {label}
          {selected.length > 0 ? (
            <Badge tone="brand" className="px-1.5 py-0">
              {selected.length}
            </Badge>
          ) : null}
          <ChevronDown className="size-3.5 text-text-muted" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-60 p-2">
        <p className="px-1 pb-1.5 text-[11px] font-medium tracking-wide text-text-muted">
          {label}
        </p>
        <div className="flex flex-col">
          {options.map((option) => {
            const active = selected.includes(option.value);
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => toggle(option.value)}
                className="flex items-center gap-2 rounded-md px-2 py-1.5 text-left text-[13px] text-text-secondary transition-colors hover:bg-[#232A36] hover:text-text"
              >
                <span
                  className={cn(
                    "flex size-4 shrink-0 items-center justify-center rounded border",
                    active
                      ? "border-brand bg-brand text-[#10140A]"
                      : "border-border bg-bg",
                  )}
                >
                  {active ? <Check className="size-3" strokeWidth={3} /> : null}
                </span>
                {option.label}
              </button>
            );
          })}
        </div>
        {selected.length > 0 ? (
          <Button
            variant="ghost"
            size="sm"
            className="mt-1.5 w-full justify-start"
            onClick={() => onChange([])}
          >
            <X />
            Clear {label.toLowerCase()}
          </Button>
        ) : null}
      </PopoverContent>
    </Popover>
  );
}

const CATEGORY_OPTIONS = (categories: string[]) =>
  categories.map((category) => ({ value: category, label: category }));

const SOURCE_OPTIONS = (
  Object.keys(sourceMeta) as DataSourceType[]
).map((source) => ({ value: source, label: sourceMeta[source].label }));

const COMPETITION_OPTIONS: Option<CompetitionLevel>[] = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

export function ProductFilters({
  state,
  onChange,
  categories,
  onRefresh,
  refreshing,
  resultCount,
  totalCount,
  liveMode = false,
}: {
  state: DiscoverFiltersState;
  onChange: (next: Partial<DiscoverFiltersState>) => void;
  categories: string[];
  onRefresh: () => void;
  refreshing: boolean;
  resultCount: number;
  totalCount: number;
  liveMode?: boolean;
}) {
  const hasFilters =
    state.query.trim().length > 0 ||
    state.categories.length > 0 ||
    state.sources.length > 0 ||
    state.competition.length > 0;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1 lg:max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-muted" />
          <Input
            value={state.query}
            onChange={(event) => onChange({ query: event.target.value })}
            placeholder="Search products, categories, tags…"
            className="pl-9"
            aria-label="Search products"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <MultiSelectFilter
            label="Category"
            options={CATEGORY_OPTIONS(categories)}
            selected={state.categories}
            onChange={(next) => onChange({ categories: next })}
          />
          <MultiSelectFilter
            label="Source"
            options={liveMode ? SOURCE_OPTIONS.filter(option => option.value === "google-trends" || option.value === "reddit") : SOURCE_OPTIONS}
            selected={state.sources}
            onChange={(next) => onChange({ sources: next })}
          />
          {!liveMode && <><MultiSelectFilter
            label="Competition"
            options={COMPETITION_OPTIONS}
            selected={state.competition}
            onChange={(next) => onChange({ competition: next })}
          />

          <Select
            value={String(state.trendWeeks)}
            onValueChange={(value) => onChange({ trendWeeks: Number(value) })}
          >
            <SelectTrigger className="h-9 w-[112px]" aria-label="Trend period">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="4">Last 4 weeks</SelectItem>
              <SelectItem value="8">Last 8 weeks</SelectItem>
              <SelectItem value="12">Last 12 weeks</SelectItem>
            </SelectContent>
          </Select>

          </>}
          <Select
            value={state.sort}
            onValueChange={(value) =>
              onChange({ sort: value as DiscoverFiltersState["sort"] })
            }
          >
            <SelectTrigger className="h-9 w-[168px]" aria-label="Sort products">
              <SlidersHorizontal className="size-3.5 shrink-0 text-text-muted" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="score">Sort · Opportunity score</SelectItem>
              {!liveMode && <><SelectItem value="growth">Sort · Sample growth</SelectItem>
              <SelectItem value="margin">Sort · Gross margin</SelectItem>
              <SelectItem value="competition">Sort · Lowest competition</SelectItem>
              <SelectItem value="price-asc">Sort · Price low to high</SelectItem>
              <SelectItem value="price-desc">Sort · Price high to low</SelectItem></>}
            </SelectContent>
          </Select>

          <Button
            variant="secondary"
            onClick={onRefresh}
            disabled={refreshing}
            className="h-9"
          >
            <RefreshCw className={cn(refreshing && "animate-spin")} />
            {refreshing ? "Loading..." : liveMode ? "Refresh results" : "Refresh analysis"}
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-[12px] text-text-muted">
        <span>
          Showing <span className="tabular text-text">{resultCount}</span> of{" "}
          <span className="tabular text-text">{totalCount}</span> {liveMode ? "research" : "sample"}
          opportunities
        </span>
        {hasFilters ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              onChange({
                query: "",
                categories: [],
                sources: [],
                competition: [],
              })
            }
          >
            <X />
            Clear filters
          </Button>
        ) : null}
      </div>
    </div>
  );
}
