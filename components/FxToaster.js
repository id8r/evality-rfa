/*
components/FxToaster.js | Global toast provider shell | Sree | 2026-06-11
*/

/* - - - - - - - - - - - - - - - - */

"use client";

import { useToast } from "@/components/ui/use-toast";
import { ToastProvider, ToastViewport } from "@/components/ui/toast";
import { Toast, ToastAction, ToastClose, ToastDescription, ToastTitle } from "@/components/ui/toast";
import { cn } from "@/lib/FxUtils";

/* - - - - - - - - - - - - - - - - */

function getToastVariantClassName(variant) {
  switch (variant) {
    case "success":
      return "border-[var(--fx-success)]";
    case "warning":
      return "border-[var(--fx-warning)]";
    case "info":
      return "border-[var(--fx-primary)]";
    case "destructive":
      return "border-[var(--fx-danger)]";
    default:
      return "";
  }
}

/* - - - - - - - - - - - - - - - - */

export function FxToaster({ children }) {
  const { toasts, dismissToast } = useToast();

  return (
    <ToastProvider>
      {children}
      {toasts.map((item) => (
        <Toast
          key={item.id}
          open={item.open}
          duration={item.duration}
          onOpenChange={(open) => {
            if (!open) {
              dismissToast(item.id);
            }
          }}
          className={cn(getToastVariantClassName(item.variant))}
        >
          <div className="min-w-0 flex-1 grid gap-[4px]">
            {item.title ? <ToastTitle>{item.title}</ToastTitle> : null}
            {item.description ? <ToastDescription>{item.description}</ToastDescription> : null}
          </div>
          <div className="flex shrink-0 items-center self-center gap-[8px]">
            {item.action ? (
              <ToastAction altText={item.action.altText ?? item.action.label ?? "Action"} onClick={item.action.onClick}>
                {item.action.label}
              </ToastAction>
            ) : null}
            <ToastClose />
          </div>
        </Toast>
      ))}
      <ToastViewport />
    </ToastProvider>
  );
}

/* - - - - - - - - - - - - - - - - */
