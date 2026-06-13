/*
components/FxButton.js | Shared button helper | Sree | 2026-06-10
*/

/* - - - - - - - - - - - - - - - - */

import { FX_BUTTON_HEIGHT, FX_RADIUS, FX_SPACE, FX_TYPE } from "@/lib/FxTheme";
import { cn } from "@/lib/FxUtils";

const variantClasses = {
  primary: "bg-primary text-primary-foreground hover:bg-primary/90",
  secondary: "border border-border bg-card text-card-foreground hover:bg-muted",
  outline: "border border-border bg-background text-foreground hover:bg-muted",
  ghost: "bg-transparent text-foreground hover:bg-muted",
  auth: "border border-border bg-card text-card-foreground hover:bg-muted",
  destructive: "bg-[var(--fx-danger)] text-white hover:opacity-90",
};

const sizeClasses = {
  sm: `${FX_BUTTON_HEIGHT.sm} ${FX_SPACE.PX_16}`,
  md: `${FX_BUTTON_HEIGHT.md} ${FX_SPACE.PX_16}`,
  lg: `${FX_BUTTON_HEIGHT.lg} ${FX_SPACE.PX_16}`,
};

export function fxButtonClassName({ className, variant = "primary", size = "md" } = {}) {
  return cn(
    `cursor-pointer inline-flex items-center justify-center ${FX_SPACE.GAP_16} ${FX_RADIUS.xs} ${FX_TYPE.button} transition-colors`,
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    variantClasses[variant],
    sizeClasses[size],
    className,
  );
}

export function FxButton({ className, variant, size, type = "button", ...props }) {
  return <button className={fxButtonClassName({ className, variant, size })} type={type} {...props} />;
}

/* - - - - - - - - - - - - - - - - */
