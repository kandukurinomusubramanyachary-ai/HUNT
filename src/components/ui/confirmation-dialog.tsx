"use client";

import * as React from "react";
import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function ConfirmationDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  tone = "danger",
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "danger" | "primary";
  onConfirm: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-start gap-3">
            {tone === "danger" ? (
              <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg border border-negative/25 bg-negative/10">
                <AlertTriangle className="size-4 text-negative" />
              </span>
            ) : null}
            <div>
              <DialogTitle>{title}</DialogTitle>
              <DialogDescription className="mt-1.5">
                {description}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            {cancelLabel}
          </Button>
          <Button
            variant={tone === "danger" ? "danger" : "primary"}
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
          >
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function useConfirmDialog() {
  const [state, setState] = React.useState<{
    open: boolean;
    title: string;
    description: string;
    confirmLabel: string;
    onConfirm: () => void;
  }>({
    open: false,
    title: "",
    description: "",
    confirmLabel: "Confirm",
    onConfirm: () => {},
  });

  const confirm = (input: {
    title: string;
    description: string;
    confirmLabel?: string;
    onConfirm: () => void;
  }) =>
    setState({
      open: true,
      title: input.title,
      description: input.description,
      confirmLabel: input.confirmLabel ?? "Confirm",
      onConfirm: input.onConfirm,
    });

  const dialog = (
    <ConfirmationDialog
      open={state.open}
      onOpenChange={(open) => setState((prev) => ({ ...prev, open }))}
      title={state.title}
      description={state.description}
      confirmLabel={state.confirmLabel}
      onConfirm={state.onConfirm}
    />
  );

  return { confirm, dialog };
}
