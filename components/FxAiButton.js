/*
components/FxAiButton.js | Shared AI action button | Sree | 2026-06-14
*/

import { Sparkles } from "lucide-react";

import { FX_TYPOGRAPHY } from "@/lib/FxTheme";
import { cn } from "@/lib/FxUtils";

export function FxAiButton({ className, icon: Icon = Sparkles, children, ...props }) {
  return (
    <button
      type="button"
      className={cn(
        "group inline-flex items-center gap-[10px] rounded-full border border-transparent bg-[linear-gradient(135deg,color-mix(in_srgb,var(--fx-primary)_14%,var(--fx-surface)_86%),color-mix(in_srgb,var(--fx-success)_10%,var(--fx-surface)_90%))] p-[1px] text-[var(--fx-primary)] shadow-[0_0_0_1px_color-mix(in_srgb,var(--fx-primary)_34%,transparent)] transition-[transform,box-shadow,border-color,background-color] hover:-translate-y-[1px] hover:border-[color:color-mix(in_srgb,var(--fx-primary)_46%,var(--fx-success)_28%)] hover:shadow-[0_0_0_1px_color-mix(in_srgb,var(--fx-primary)_50%,transparent),0_6px_18px_rgba(37,99,235,0.08)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--fx-primary)]/20 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <span
        className={cn(
          "inline-flex items-center gap-[8px] rounded-full border border-[color:color-mix(in_srgb,var(--fx-primary)_22%,var(--fx-border)_78%)] bg-[var(--fx-surface)] px-[12px] py-[6px] text-[var(--fx-text)] transition-colors group-hover:bg-[var(--fx-surface-hover)]",
        )}
      >
        <span className="inline-flex size-[20px] items-center justify-center rounded-full bg-[var(--fx-primary)]/10 text-[var(--fx-primary)] ring-1 ring-[color:color-mix(in_srgb,var(--fx-primary)_28%,transparent)]">
          <Icon className="size-[14px]" />
        </span>
        <span className={`${FX_TYPOGRAPHY.button} text-[var(--fx-text)]`}>{children}</span>
      </span>
    </button>
  );
}
