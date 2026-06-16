/*
components/FxButton.js | Shared button helper | Sree | 2026-06-10
*/

/* - - - - - - - - - - - - - - - - */

import { FX_BUTTON_HEIGHT, FX_BUTTON_PADDING_X, FX_RADIUS, FX_TYPE } from "@/lib/FxTheme";
import { cn } from "@/lib/FxUtils";

const variantClasses = {
  primary: "bg-primary !text-white hover:bg-primary/90",
  secondary: "border border-border bg-card text-card-foreground hover:bg-muted",
  outline: "border border-border bg-background text-foreground hover:bg-muted",
  ghost: "bg-transparent text-foreground hover:bg-[var(--fx-primary)]/10 hover:text-[var(--fx-primary)]",
  auth: "border border-border bg-card text-card-foreground hover:bg-muted",
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

export function fxButtonClassName({ className, variant = "primary", size = "md" } = {}) {
  return cn(
    `inline-flex cursor-pointer items-center justify-center gap-[8px] ${FX_RADIUS.xs} ${FX_TYPE.button} whitespace-nowrap transition-colors disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-inherit`,
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    variantClasses[variant],
    sizeClasses[size],
    className,
  );
}

export function fxIconButtonClassName({ className, variant = "outline", size = "md" } = {}) {
  return cn(
    `inline-flex cursor-pointer items-center justify-center ${FX_RADIUS.xs} transition-colors disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-inherit`,
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    variantClasses[variant],
    iconSizeClasses[size],
    className,
  );
}

export function FxButton({ className, variant, size, type = "button", ...props }) {
  return <button className={fxButtonClassName({ className, variant, size })} type={type} {...props} />;
}

/* - - - - - - - - - - - - - - - - */
