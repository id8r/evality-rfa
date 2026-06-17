/* components/FxButton.js | Shared button helper | Sree | 2026-06-10 */

import { FX_BUTTON_HEIGHT, FX_BUTTON_PADDING_X, FX_RADIUS, FX_TYPE } from "@/lib/FxTheme";
import { cn } from "@/lib/FxUtils";

const variantClasses = {
  // Primary action button
  primary: "bg-primary text-[var(--fx-primary-foreground)] hover:bg-primary/90",

  // Secondary action button
  secondary:
    "border border-[var(--fx-disabled-border)] bg-[var(--fx-surface)] text-[var(--fx-text)] hover:border-[var(--fx-text-disabled)] hover:bg-[var(--fx-surface-hover)]",

  // Outline utility button
  outline: "border border-[var(--fx-disabled-border)] bg-transparent text-[var(--fx-text)] hover:bg-[var(--fx-surface-hover)]/60",

  // Low-emphasis ghost button
  ghost: "bg-transparent text-foreground hover:bg-[var(--fx-surface-hover)] hover:text-[var(--fx-primary)]",

  // Auth and neutral action button
  auth: "border border-[var(--fx-border)] bg-[var(--fx-surface)] text-[var(--fx-text)] hover:bg-[var(--fx-surface-hover)]",

  // Destructive action button
  destructive: "bg-[var(--fx-danger)] text-white hover:opacity-90",
};

const sizeClasses = {
  sm: `${FX_BUTTON_HEIGHT.sm} ${FX_BUTTON_PADDING_X.sm}`,
  md: `${FX_BUTTON_HEIGHT.md} ${FX_BUTTON_PADDING_X.md}`,
  lg: `${FX_BUTTON_HEIGHT.lg} ${FX_BUTTON_PADDING_X.lg}`,
};

const iconSizeClasses = {
  sm: `${FX_BUTTON_HEIGHT.sm} w-[30px]`,
  md: `${FX_BUTTON_HEIGHT.md} w-[34px]`,
  lg: `${FX_BUTTON_HEIGHT.lg} w-[40px]`,
};
/* - - - - - - - - - - - - - - - - */

const disabledButtonClasses =
  "disabled:pointer-events-none disabled:cursor-not-allowed disabled:border-[var(--fx-disabled-border)] disabled:bg-[var(--fx-disabled-bg)] disabled:text-[var(--fx-disabled-text)] disabled:opacity-100 disabled:shadow-none disabled:hover:bg-[var(--fx-disabled-bg)] disabled:hover:text-[var(--fx-disabled-text)]";

export function fxButtonClassName({ className, variant = "primary", size = "md" } = {}) {
  return cn(
    `inline-flex cursor-pointer items-center justify-center gap-[8px] ${FX_RADIUS.xs} ${FX_TYPE.button} whitespace-nowrap transition-none`,
    disabledButtonClasses,
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    variantClasses[variant],
    sizeClasses[size],
    className,
  );
}
/* - - - - - - - - - - - - - - - - */

export function fxIconButtonClassName({ className, variant = "outline", size = "md" } = {}) {
  return cn(
    `inline-flex cursor-pointer items-center justify-center ${FX_RADIUS.xs} transition-none`,
    disabledButtonClasses,
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    variantClasses[variant],
    iconSizeClasses[size],
    className,
  );
}
/* - - - - - - - - - - - - - - - - */

export function FxButton({ className, variant, size, type = "button", ...props }) {
  return <button className={fxButtonClassName({ className, variant, size })} type={type} {...props} />;
}
/* - - - - - - - - - - - - - - - - */