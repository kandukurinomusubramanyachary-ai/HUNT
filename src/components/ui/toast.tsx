"use client";

import * as React from "react";
import { create } from "zustand";
import { AlertTriangle, CheckCircle2, Info, X } from "lucide-react";

import { cn } from "@/lib/utils";

export type ToastTone = "success" | "error" | "info";

export interface ToastItem {
  id: string;
  title: string;
  description?: string;
  tone: ToastTone;
}

interface ToastState {
  toasts: ToastItem[];
  push: (toast: Omit<ToastItem, "id">) => void;
  dismiss: (id: string) => void;
}

const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  push: (toast) =>
    set((state) => ({
      toasts: [
        ...state.toasts,
        { ...toast, id: `toast-${Math.random().toString(36).slice(2, 9)}` },
      ].slice(-4),
    })),
  dismiss: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));

export function toast(input: {
  title: string;
  description?: string;
  tone?: ToastTone;
}) {
  useToastStore
    .getState()
    .push({ title: input.title, description: input.description, tone: input.tone ?? "success" });
}

const ICONS: Record<ToastTone, React.ComponentType<{ className?: string }>> = {
  success: CheckCircle2,
  error: AlertTriangle,
  info: Info,
};

const TONE_CLASS: Record<ToastTone, string> = {
  success: "text-positive",
  error: "text-negative",
  info: "text-info",
};

function ToastRow({ item }: { item: ToastItem }) {
  const dismiss = useToastStore((state) => state.dismiss);
  const Icon = ICONS[item.tone];

  React.useEffect(() => {
    const timer = setTimeout(() => dismiss(item.id), 4200);
    return () => clearTimeout(timer);
  }, [dismiss, item.id]);

  return (
    <div
      role="status"
      className="pointer-events-auto flex w-[min(360px,calc(100vw-32px))] items-start gap-3 rounded-[10px] border border-border bg-elevated p-3.5 shadow-elevated animate-fade-in"
    >
      <Icon className={cn("mt-0.5 size-4 shrink-0", TONE_CLASS[item.tone])} />
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-semibold leading-5 text-text">
          {item.title}
        </p>
        {item.description ? (
          <p className="mt-0.5 text-[12px] leading-4 text-text-secondary">
            {item.description}
          </p>
        ) : null}
      </div>
      <button
        type="button"
        onClick={() => dismiss(item.id)}
        aria-label="Dismiss notification"
        className="rounded p-0.5 text-text-muted transition-colors hover:text-text"
      >
        <X className="size-3.5" />
      </button>
    </div>
  );
}

export function ToastViewport() {
  const toasts = useToastStore((state) => state.toasts);
  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[100] flex flex-col gap-2 sm:bottom-6 sm:right-6">
      {toasts.map((item) => (
        <ToastRow key={item.id} item={item} />
      ))}
    </div>
  );
}
