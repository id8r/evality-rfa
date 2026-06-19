/*
components/FxTabs.js | Shared tabs primitive | Sree | 2026-06-19
*/

"use client";

import { cn } from "@/lib/FxUtils";
import { FX_TYPOGRAPHY } from "@/lib/FxTheme";

function normalizeItems({ tabs, items }) {
  const source = Array.isArray(items) ? items : Array.isArray(tabs) ? tabs : [];

  return source.map((item) => ({
    value: item.value,
    label: item.label,
    count: item.count,
    disabled: Boolean(item.disabled),
  }));
}

function renderItemLabel(item) {
  if (item.count == null) {
    return item.label;
  }

  return `${item.label} (${item.count})`;
}

export function FxTabs({
  tabs,
  items,
  active,
  value,
  onChange,
  onValueChange,
  variant = "stage",
  className,
  itemClassName,
  showBorder = true,
}) {
  const resolvedItems = normalizeItems({ tabs, items });
  const selectedValue = value ?? active;
  const handleValueChange = onValueChange ?? onChange;

  if (variant === "filter") {
    return (
      <div className={cn("flex min-w-0 flex-wrap items-center gap-[8px]", className)}>
        {resolvedItems.map((item) => {
          const isActive = item.value === selectedValue;

          return (
            <button
              key={item.value}
              type="button"
              aria-pressed={isActive}
              disabled={item.disabled}
              onClick={() => !item.disabled && handleValueChange?.(item.value)}
              className={cn(
                "relative inline-flex h-[28px] shrink-0 items-center justify-center px-[4px] text-[13px] leading-[20px] font-medium transition-colors",
                isActive
                  ? "text-[var(--fx-primary)]"
                  : "text-[var(--fx-text-muted)] hover:text-[var(--fx-text)]",
                item.disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
                itemClassName,
              )}
            >
              {renderItemLabel(item)}
              {isActive ? <span className="absolute inset-x-0 bottom-[-1px] h-[2px] rounded-full bg-[var(--fx-primary)]" /> : null}
            </button>
          );
        })}
      </div>
    );
  }

  if (variant === "segmented") {
    return (
      <div className={cn("inline-flex min-w-0 items-center gap-[2px] rounded-[10px] border border-[var(--fx-border)] bg-[var(--fx-surface-subtle)] p-[2px]", className)}>
        {resolvedItems.map((item) => {
          const isActive = item.value === selectedValue;

          return (
            <button
              key={item.value}
              type="button"
              aria-pressed={isActive}
              disabled={item.disabled}
              onClick={() => !item.disabled && handleValueChange?.(item.value)}
              className={cn(
                "inline-flex h-[32px] shrink-0 items-center justify-center rounded-[6px] px-[12px] text-[13px] leading-[20px] font-medium transition-colors",
                isActive
                  ? "bg-[var(--fx-surface)] text-[var(--fx-text)]"
                  : "text-[var(--fx-text-muted)] hover:text-[var(--fx-text)]",
                item.disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
                itemClassName,
              )}
            >
              {renderItemLabel(item)}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className={cn("min-w-0", showBorder ? "border-b border-[var(--fx-border)]" : "", className)}>
      <div className="inline-flex min-w-0 max-w-full flex-wrap items-center gap-[2px] rounded-full border border-[var(--fx-border)] bg-[var(--fx-surface-subtle)] p-[2px]">
        {resolvedItems.map((item) => {
          const isActive = item.value === selectedValue;

          return (
            <button
              key={item.value}
              type="button"
              aria-pressed={isActive}
              disabled={item.disabled}
              onClick={() => !item.disabled && handleValueChange?.(item.value)}
              className={cn(
                "inline-flex h-[36px] shrink-0 items-center justify-center rounded-full border border-transparent px-[12px] transition-colors",
                FX_TYPOGRAPHY.button,
                isActive
                  ? "border-[var(--fx-border)] bg-[var(--fx-surface)] text-[var(--fx-primary)] shadow-[0_1px_2px_rgba(15,23,42,0.04)]"
                  : "text-[var(--fx-text-muted)] hover:bg-[var(--fx-surface-hover)] hover:text-[var(--fx-text)]",
                item.disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
                itemClassName,
              )}
            >
              {renderItemLabel(item)}
            </button>
          );
        })}
      </div>
    </div>
  );
}
