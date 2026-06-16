"use client";

import * as React from "react";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { Circle } from "lucide-react";

import { cn } from "@/lib/FxUtils";

export function RadioGroup({ className, ...props }) {
  return (
    <RadioGroupPrimitive.Root
      data-slot="radio-group"
      className={cn("grid gap-[8px]", className)}
      {...props}
    />
  );
}

export function RadioGroupItem({ className, ...props }) {
  return (
    <RadioGroupPrimitive.Item
        data-slot="radio-group-item"
        className={cn(
        "aspect-square size-[16px] shrink-0 appearance-none rounded-full border border-[var(--fx-border)] bg-[var(--fx-surface)] text-[var(--fx-primary)] shadow-sm outline-none transition-colors hover:bg-[var(--fx-surface-hover)] focus-visible:ring-2 focus-visible:ring-[var(--fx-primary)]/20 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:border-[var(--fx-primary)]",
        className,
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
        <Circle className="size-[10px] fill-current text-current" />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  );
}
