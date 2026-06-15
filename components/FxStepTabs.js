/* components/FxStepTabs.js | Shared workflow step tabs | Sree | 2026-06-15 */

/* - - - - - - - - - - - - - - - - */

"use client";

import { AlertCircle, Check } from "lucide-react";

import { FX_TYPOGRAPHY } from "@/lib/FxTheme";
import { cn } from "@/lib/FxUtils";

/* - - - - - - - - - - - - - - - - */

function getStepToneClassName(step, isActive) {
  if (step.disabled) {
    return "cursor-not-allowed text-[var(--fx-text-disabled)]";
  }

  if (step.error) {
    return isActive ? "text-[var(--fx-danger)]" : "text-[var(--fx-danger)]";
  }

  return isActive ? "text-[var(--fx-primary)]" : "text-[var(--fx-text-muted)] hover:text-[var(--fx-text)]";
}

/* - - - - - - - - - - - - - - - - */

export function FxStepTabs({
  steps = [],
  activeStep,
  onChange,
  className,
  itemClassName,
  labelClassName,
  badgeClassName,
  ariaLabel = "Workflow steps",
}) {
  return (
    <div className={cn("flex w-full flex-wrap items-end gap-[24px] border-b border-[var(--fx-border)]", className)} role="tablist" aria-label={ariaLabel}>
      {steps.map((step) => {
        const isActive = step.value === activeStep;
        const hasBadge = step.count !== undefined && step.count !== null;

        return (
          <button
            key={step.value}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-disabled={step.disabled || undefined}
            disabled={step.disabled}
            onClick={() => {
              if (!step.disabled) {
                onChange?.(step.value, step);
              }
            }}
            className={cn(
              "relative -mb-[1px] inline-flex items-center gap-[8px] pb-[12px] transition-colors",
              FX_TYPOGRAPHY.button,
              getStepToneClassName(step, isActive),
              itemClassName,
            )}
          >
            {step.error ? <AlertCircle className="size-[14px] shrink-0" /> : step.completed && !isActive ? <Check className="size-[14px] shrink-0" /> : null}
            <span className={cn("inline-flex items-center gap-[6px]", labelClassName)}>
              <span>{step.label}</span>
              {hasBadge ? (
                <span
                  className={cn(
                    "inline-flex min-w-[24px] items-center justify-center rounded-full px-[8px] py-[1px] text-[11px] leading-[16px] font-medium",
                    isActive
                      ? "bg-[var(--fx-primary)]/[0.12] text-[var(--fx-primary)]"
                      : "bg-[var(--fx-bg-soft)] text-[var(--fx-text-muted)]",
                    badgeClassName,
                  )}
                >
                  {step.count}
                </span>
              ) : null}
            </span>
            {isActive ? <span className="absolute bottom-[-1px] left-0 right-0 h-[2px] rounded-full bg-[var(--fx-primary)]" /> : null}
          </button>
        );
      })}
    </div>
  );
}

/* - - - - - - - - - - - - - - - - */
