/*
components/FxTabs.js | Shared tabs primitive | Sree | 2026-06-13
*/

"use client";

import { cn } from "@/lib/FxUtils";
import { FX_TYPOGRAPHY } from "@/lib/FxTheme";

export function FxTabs({ tabs, active, onChange, className, showUnderline = true, showBorder = true }) {
  return (
    <div className={cn("flex w-full items-end gap-[24px]", showBorder ? "border-b border-[var(--fx-border)]" : "", className)}>
      {tabs.map((tab) => {
        const isActive = tab.value === active;

        return (
          <button
            key={tab.value}
            type="button"
            onClick={() => onChange(tab.value)}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "relative -mb-[1px] pb-[12px] transition-colors",
              FX_TYPOGRAPHY.button,
              isActive
                ? "text-[var(--fx-primary)]"
                : "text-[var(--fx-text-muted)] hover:text-[var(--fx-text)]",
            )}
          >
            {tab.label}
            {showUnderline && isActive ? <span className="absolute bottom-[-1px] left-0 right-0 h-[2px] rounded-full bg-[var(--fx-primary)]" /> : null}
          </button>
        );
      })}
    </div>
  );
}
