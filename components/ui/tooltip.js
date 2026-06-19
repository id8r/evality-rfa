/*
components/ui/tooltip.js | shadcn Tooltip primitive | Sree | 2026-06-14
*/

"use client";

import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";

import { cn } from "@/lib/FxUtils";

function TooltipProvider({ delayDuration = 0, ...props }) {
  return <TooltipPrimitive.Provider data-slot="tooltip-provider" delayDuration={delayDuration} {...props} />;
}

function Tooltip({ ...props }) {
  return <TooltipPrimitive.Root data-slot="tooltip" {...props} />;
}

function TooltipTrigger({ ...props }) {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />;
}

function TooltipContent({ className, sideOffset = 6, ...props }) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        data-slot="tooltip-content"
        sideOffset={sideOffset}
        className={cn(
          "z-[999] overflow-hidden rounded-[8px] border border-[var(--fx-border)] bg-[var(--fx-surface-raised)] px-[10px] py-[6px] text-[12px] leading-[18px] font-normal text-[var(--fx-text)] shadow-[0_4px_16px_rgba(0,0,0,0.08)]",
          className,
        )}
        {...props}
      />
    </TooltipPrimitive.Portal>
  );
}

export {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
};
