/*
components/FxTabs.js | Shared tabs primitive | Sree | 2026-06-13
*/

"use client";

import { cn } from "@/lib/FxUtils";
import { FX_COLORS, FX_RADIUS, FX_TYPOGRAPHY } from "@/lib/FxTheme";

export function FxTabs({ tabs, active, onChange, className }) {
  return (
    <div className={cn("inline-flex items-center gap-[8px] rounded-full border border-[var(--fx-border)] bg-[var(--fx-surface)] p-[4px]", className)}>
      {tabs.map((tab) => {
        const isActive = tab.value === active;

        return (
          <button
            key={tab.value}
            type="button"
            onClick={() => onChange(tab.value)}
            className={cn(
              "min-h-[36px] rounded-full px-[16px] transition-colors",
              FX_TYPOGRAPHY.button,
              isActive
                ? `bg-[var(--fx-primary)] text-[var(--fx-primary-foreground)]`
                : `${FX_COLORS.textMuted} hover:bg-[var(--fx-surface-hover)] hover:text-[var(--fx-text)]`,
              FX_RADIUS.xs,
            )}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

