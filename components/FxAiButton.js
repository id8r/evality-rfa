/* components/FxAiButton.js | Shared AI action button | Sree | 2026-06-14 */

import { Sparkles } from "lucide-react";
// import { WandSparkles } from "lucide-react";

import { FX_BUTTON_HEIGHT, FX_BUTTON_PADDING_X, FX_RADIUS, FX_TYPOGRAPHY } from "@/lib/FxTheme";
import { cn } from "@/lib/FxUtils";

const sizeClasses = {
  sm: `${FX_BUTTON_HEIGHT.sm} ${FX_BUTTON_PADDING_X.sm}`,
  md: `${FX_BUTTON_HEIGHT.md} ${FX_BUTTON_PADDING_X.md}`,
  lg: `${FX_BUTTON_HEIGHT.lg} ${FX_BUTTON_PADDING_X.lg}`,
};

const iconSizeClasses = {
  sm: "size-[18px]",
  md: "size-[20px]",
  lg: "size-[22px]",
};

const iconInnerSizeClasses = {
  sm: "size-[13px]",
  md: "size-[14px]",
  lg: "size-[15px]",
};

const aiButtonBase =
  "inline-flex items-center justify-center gap-[8px] whitespace-nowrap border transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--fx-ai)]/30 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-100";

const aiButtonSurface =
  "border-transparent bg-[linear-gradient(135deg,var(--fx-primary)_0%,var(--fx-ai)_100%)] text-[var(--fx-primary-foreground)] shadow-[0_1px_2px_rgba(15,23,42,0.14)] hover:brightness-[1.04] hover:shadow-[0_6px_16px_rgba(32,96,232,0.22)] active:brightness-[0.98]";

const aiButtonDarkSurface =
  "dark:border-[color:color-mix(in_srgb,white_14%,transparent)] dark:text-white dark:shadow-[0_1px_2px_rgba(0,0,0,0.32)] dark:hover:brightness-[1.08] dark:hover:shadow-[0_8px_20px_rgba(0,0,0,0.38)]";

const aiButtonDisabled =
  "disabled:border-[var(--fx-disabled-border,var(--fx-border))] disabled:bg-[var(--fx-disabled-bg)] disabled:bg-none disabled:text-[var(--fx-disabled-text)] disabled:shadow-none disabled:brightness-100 disabled:hover:bg-[var(--fx-disabled-bg)] disabled:hover:text-[var(--fx-disabled-text)] disabled:hover:shadow-none disabled:hover:brightness-100";

const aiIconSurface =
  "bg-transparent text-white";

export function FxAiButton({
  className,
  // Previous default: Sparkles
  icon: Icon = Sparkles,
  // icon: Icon = WandSparkles,
  children,
  size = "md",
  type = "button",
  ...props
}) {
  return (
    <button
      type={type}
      className={cn(
        aiButtonBase,
        aiButtonSurface,
        aiButtonDarkSurface,
        aiButtonDisabled,
        FX_RADIUS.xl,
        FX_TYPOGRAPHY.button,
        sizeClasses[size],
        className,
      )}
      {...props}
    >
      <span
        className={cn(
          "inline-flex shrink-0 items-center justify-center rounded-full",
          iconSizeClasses[size],
          aiIconSurface,
        )}
      >
        <Icon className={iconInnerSizeClasses[size]} strokeWidth={1.9} />
      </span>
      <span className="text-current">{children}</span>
    </button>
  );
}

/* - - - - - - - - - - - - - - - - */
