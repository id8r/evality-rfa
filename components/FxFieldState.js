/* components/FxFieldState.js | Shared field status helpers | Sree | 2026-06-15 */

/* - - - - - - - - - - - - - - - - */

import { FX_TYPOGRAPHY } from "@/lib/FxTheme";
import { cn } from "@/lib/FxUtils";

export const FX_FIELD_STATES = {
  DEFAULT: "default",
  ERROR: "error",
  WARNING: "warning",
  SUCCESS: "success",
};

const FIELD_FRAME_TONES = {
  default: "border-[var(--fx-border)] focus:border-[var(--fx-primary)] focus:ring-[var(--fx-primary)]/20",
  error: "border-[var(--fx-danger)] focus:border-[var(--fx-danger)] focus:ring-[var(--fx-danger)]/20",
  warning: "border-[var(--fx-warning)] focus:border-[var(--fx-warning)] focus:ring-[var(--fx-warning)]/20",
  success: "border-[var(--fx-success)] focus:border-[var(--fx-success)] focus:ring-[var(--fx-success)]/20",
};

const FIELD_LABEL_TONES = {
  default: "text-[var(--fx-text-muted)]",
  error: "text-[var(--fx-danger)]",
  warning: "text-[var(--fx-warning)]",
  success: "text-[var(--fx-success)]",
};

const FIELD_MESSAGE_TONES = {
  default: "text-[var(--fx-text-muted)]",
  error: "text-[var(--fx-danger)]",
  warning: "text-[var(--fx-warning)]",
  success: "text-[var(--fx-success)]",
};

export function getFieldFrameToneClassName(state = FX_FIELD_STATES.DEFAULT) {
  return FIELD_FRAME_TONES[state] ?? FIELD_FRAME_TONES.default;
}

/* - - - - - - - - - - - - - - - - */

export function getFieldLabelToneClassName(state = FX_FIELD_STATES.DEFAULT) {
  return FIELD_LABEL_TONES[state] ?? FIELD_LABEL_TONES.default;
}

/* - - - - - - - - - - - - - - - - */

export function getFieldMessageToneClassName(state = FX_FIELD_STATES.DEFAULT) {
  return FIELD_MESSAGE_TONES[state] ?? FIELD_MESSAGE_TONES.default;
}

/* - - - - - - - - - - - - - - - - */

export function FxFieldLabel({ children, required = false, optional = false, state = FX_FIELD_STATES.DEFAULT, className }) {
  return (
    <span className={cn(FX_TYPOGRAPHY.fieldLabel, getFieldLabelToneClassName(state), className)}>
      {children}
      {required ? <span aria-hidden="true" className="ml-[4px] text-[var(--fx-danger)]">*</span> : null}
      {optional ? <span className="ml-[6px] text-[var(--fx-text-muted)]">(optional)</span> : null}
    </span>
  );
}

/* - - - - - - - - - - - - - - - - */

export function FxFieldMessage({ children, state = FX_FIELD_STATES.DEFAULT, className }) {
  if (!children) {
    return null;
  }

  return <span className={cn(FX_TYPOGRAPHY.fieldHint, getFieldMessageToneClassName(state), className)}>{children}</span>;
}

/* - - - - - - - - - - - - - - - - */
