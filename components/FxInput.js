/* components/FxInput.js | Shared input primitive | Sree | 2026-06-13 */

/* - - - - - - - - - - - - - - - - */

"use client";

import { forwardRef } from "react";

import { FX_RADIUS, FX_TYPOGRAPHY } from "@/lib/FxTheme";
import { cn } from "@/lib/FxUtils";
import {
  FX_FIELD_STATES,
  FxFieldLabel,
  FxFieldMessage,
  getFieldFrameToneClassName,
} from "@/components/FxFieldState";

/* - - - - - - - - - - - - - - - - */

export const FxInput = forwardRef(function FxInput(
  {
    className,
    stackClassName,
    label,
    helperText,
    validationMessage,
    messageType,
    id,
    textarea = false,
    rightElement = null,
    required = false,
    state = FX_FIELD_STATES.DEFAULT,
    optional = false,
    hideRequiredMark = false,
    ...props
  },
  ref,
) {
  const fieldId = id ?? props.name;
  const Field = textarea ? "textarea" : "input";
  const fieldMessage = validationMessage ?? helperText;
  const fieldMessageState = messageType ?? state;

  return (
    <label className={cn("flex w-full flex-col gap-[8px]", stackClassName)} htmlFor={fieldId}>
      {label ? (
        <FxFieldLabel required={required && !hideRequiredMark} optional={optional} state={state}>
          {label}
        </FxFieldLabel>
      ) : null}
      <div className="relative w-full">
        <Field
          ref={ref}
          id={fieldId}
          className={cn(
            `min-h-[40px] w-full border ${FX_RADIUS.xs} bg-[var(--fx-bg)] px-[16px] py-[8px] ${FX_TYPOGRAPHY.input} text-[var(--fx-text)] outline-none placeholder:text-[var(--fx-text-disabled)] focus:ring-2`,
            getFieldFrameToneClassName(state),
            rightElement ? "pr-[56px]" : "",
            textarea ? "min-h-[120px] resize-y" : "",
            className,
          )}
          aria-invalid={state === FX_FIELD_STATES.ERROR}
          {...props}
        />
        {rightElement ? (
          <div className="pointer-events-none absolute inset-y-0 right-[12px] flex items-center">
            {rightElement}
          </div>
        ) : null}
      </div>
      {fieldMessage ? <FxFieldMessage state={fieldMessageState}>{fieldMessage}</FxFieldMessage> : null}
    </label>
  );
});

/* - - - - - - - - - - - - - - - - */
