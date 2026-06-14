/*
components/FxInput.js | Shared input primitive | Sree | 2026-06-13
*/

"use client";

import { forwardRef } from "react";

import { FX_COLORS, FX_RADIUS, FX_TYPOGRAPHY } from "@/lib/FxTheme";
import { cn } from "@/lib/FxUtils";

export const FxInput = forwardRef(function FxInput(
  { className, label, helperText, id, textarea = false, ...props },
  ref,
) {
  const fieldId = id ?? props.name;
  const Field = textarea ? "textarea" : "input";

  return (
    <label className="flex w-full flex-col gap-[8px]" htmlFor={fieldId}>
      {label ? <span className={`${FX_TYPOGRAPHY.fieldLabel} text-[var(--fx-text)]`}>{label}</span> : null}
      <Field
        ref={ref}
        id={fieldId}
        className={cn(
          `min-h-[40px] w-full border ${FX_COLORS.border} ${FX_RADIUS.xs} bg-[var(--fx-bg)] px-[16px] py-[8px] ${FX_TYPOGRAPHY.input} text-[var(--fx-text)] outline-none placeholder:text-[var(--fx-text-disabled)] focus:border-[var(--fx-primary)] focus:ring-2 focus:ring-[var(--fx-primary)]/20`,
          textarea ? "min-h-[120px] resize-y" : "",
          className,
        )}
        {...props}
      />
      {helperText ? <span className={`${FX_TYPOGRAPHY.fieldHint} text-[var(--fx-text-muted)]`}>{helperText}</span> : null}
    </label>
  );
});

