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
        "group inline-flex items-center gap-[10px] rounded-full border border-transparent bg-[linear-gradient(135deg,color-mix(in_srgb,var(--fx-ai)_78%,white_22%),color-mix(in_srgb,var(--fx-primary)_82%,white_18%))] p-[2px] text-[var(--fx-ai)] shadow-[0_0_0_1px_color-mix(in_srgb,var(--fx-ai)_42%,var(--fx-primary)_24%)] transition-[transform,box-shadow,border-color,background-color] hover:-translate-y-[1px] hover:shadow-[0_0_0_1px_color-mix(in_srgb,var(--fx-ai)_54%,var(--fx-primary)_32%),0_10px_24px_rgba(99,102,241,0.16)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:color-mix(in_srgb,var(--fx-ai)_28%,transparent)] disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <span
        className={cn(
          "inline-flex items-center gap-[8px] rounded-full border border-[color:color-mix(in_srgb,var(--fx-ai)_34%,var(--fx-primary)_28%)] bg-[linear-gradient(180deg,white,color-mix(in_srgb,var(--fx-surface)_88%,var(--fx-ai)_12%))] px-[12px] py-[6px] text-[var(--fx-ai)] transition-colors group-hover:bg-[linear-gradient(180deg,white,color-mix(in_srgb,var(--fx-surface-hover)_82%,var(--fx-ai)_18%))]",
        )}
      >
        <span className="inline-flex size-[20px] items-center justify-center rounded-full bg-[color:color-mix(in_srgb,var(--fx-ai)_14%,white_86%)] text-[var(--fx-ai)] ring-1 ring-[color:color-mix(in_srgb,var(--fx-ai)_30%,transparent)]">
          <Icon className="size-[14px]" />
        </span>
        <span className={`${FX_TYPOGRAPHY.button} text-[var(--fx-ai)]`}>{children}</span>
      </span>
    </button>
  );
}
