"use client";

import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";

import { cn } from "@/lib/FxUtils";

export function Checkbox({ className, ...props }) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "peer size-[16px] shrink-0 rounded-[4px] border border-[var(--fx-border)] bg-[var(--fx-bg)] text-[var(--fx-primary-foreground)] outline-none transition-colors focus-visible:ring-2 focus-visible:ring-[var(--fx-primary)]/20 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:border-[var(--fx-primary)] data-[state=checked]:bg-[var(--fx-primary)]",
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator data-slot="checkbox-indicator" className="flex items-center justify-center text-current">
        <Check className="size-[12px]" strokeWidth={2.4} />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}
