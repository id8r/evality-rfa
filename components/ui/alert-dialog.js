"use client";

import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog";

import { cn } from "@/lib/FxUtils";
import { FX_TYPOGRAPHY } from "@/lib/FxTheme";

function AlertDialog({ ...props }) {
  return <AlertDialogPrimitive.Root data-slot="alert-dialog" {...props} />;
}

function AlertDialogTrigger({ ...props }) {
  return <AlertDialogPrimitive.Trigger data-slot="alert-dialog-trigger" {...props} />;
}

function AlertDialogPortal({ ...props }) {
  return <AlertDialogPrimitive.Portal data-slot="alert-dialog-portal" {...props} />;
}

function AlertDialogOverlay({ className, ...props }) {
  return (
    <AlertDialogPrimitive.Overlay
      data-slot="alert-dialog-overlay"
      className={cn("fixed inset-0 z-[110] bg-slate-950/[0.14] backdrop-blur-[8px]", className)}
      {...props}
    />
  );
}

function AlertDialogContent({ className, ...props }) {
  return (
    <AlertDialogPortal>
      <AlertDialogOverlay />
      <AlertDialogPrimitive.Content
        data-slot="alert-dialog-content"
        className={cn(
          "fixed left-1/2 top-1/2 z-[111] grid w-[calc(100%-48px)] max-w-[420px] -translate-x-1/2 -translate-y-1/2 gap-[20px] rounded-[16px] border border-border bg-[var(--fx-surface-raised)] p-[24px] text-card-foreground shadow-none",
          className,
        )}
        {...props}
      />
    </AlertDialogPortal>
  );
}

function AlertDialogHeader({ className, ...props }) {
  return <div data-slot="alert-dialog-header" className={cn("space-y-[8px]", className)} {...props} />;
}

function AlertDialogFooter({ className, ...props }) {
  return (
    <div
      data-slot="alert-dialog-footer"
      className={cn("flex flex-col-reverse gap-[12px] sm:flex-row sm:justify-end", className)}
      {...props}
    />
  );
}

function AlertDialogTitle({ className, ...props }) {
  return (
    <AlertDialogPrimitive.Title
      data-slot="alert-dialog-title"
      className={cn(FX_TYPOGRAPHY.dialogTitle, "text-foreground", className)}
      {...props}
    />
  );
}

function AlertDialogDescription({ className, ...props }) {
  return (
    <AlertDialogPrimitive.Description
      data-slot="alert-dialog-description"
      className={cn(FX_TYPOGRAPHY.dialogSubtitle, "text-muted-foreground", className)}
      {...props}
    />
  );
}

function AlertDialogAction({ className, ...props }) {
  return <AlertDialogPrimitive.Action data-slot="alert-dialog-action" className={className} {...props} />;
}

function AlertDialogCancel({ className, ...props }) {
  return <AlertDialogPrimitive.Cancel data-slot="alert-dialog-cancel" className={className} {...props} />;
}

export {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  AlertDialogPortal,
  AlertDialogTitle,
  AlertDialogTrigger,
};
