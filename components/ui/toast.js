/*
components/ui/toast.js | shadcn Toast primitive | Sree | 2026-06-11
*/

/* - - - - - - - - - - - - - - - - */

"use client";

import * as React from "react";
import * as ToastPrimitives from "@radix-ui/react-toast";
import { X } from "lucide-react";

import { cn } from "@/lib/FxUtils";

function ToastProvider(props) {
  return <ToastPrimitives.Provider data-slot="toast-provider" {...props} />;
}

function ToastViewport({ className, ...props }) {
  return (
    <ToastPrimitives.Viewport
      data-slot="toast-viewport"
      className={cn(
        "fixed top-[24px] right-[24px] z-[120] flex max-h-screen w-full max-w-[420px] flex-col gap-[12px] outline-none",
        className,
      )}
      {...props}
    />
  );
}

function Toast({ className, ...props }) {
  return (
    <ToastPrimitives.Root
      data-slot="toast"
      className={cn(
        "group pointer-events-auto relative flex w-full items-start justify-between gap-[16px] overflow-hidden rounded-[12px] border border-border bg-[var(--fx-surface-raised)] p-[16px] text-foreground shadow-sm",
        className,
      )}
      {...props}
    />
  );
}

function ToastTitle({ className, ...props }) {
  return (
    <ToastPrimitives.Title
      data-slot="toast-title"
      className={cn("text-[14px] font-medium leading-[20px]", className)}
      {...props}
    />
  );
}

function ToastDescription({ className, ...props }) {
  return (
    <ToastPrimitives.Description
      data-slot="toast-description"
      className={cn("text-[13px] leading-[20px] text-muted-foreground", className)}
      {...props}
    />
  );
}

function ToastClose({ className, ...props }) {
  return (
    <ToastPrimitives.Close
      data-slot="toast-close"
      className={cn(
        "flex h-[28px] w-[28px] cursor-pointer items-center justify-center rounded-[8px] text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
      toast-close=""
      {...props}
    >
      <X className="size-[14px]" />
    </ToastPrimitives.Close>
  );
}

function ToastAction({ className, ...props }) {
  return (
    <ToastPrimitives.Action
      data-slot="toast-action"
      className={cn(
        "inline-flex h-[32px] shrink-0 cursor-pointer items-center justify-center rounded-[8px] border border-border px-[12px] text-[13px] font-medium hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
      {...props}
    />
  );
}

export {
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
};

/* - - - - - - - - - - - - - - - - */
