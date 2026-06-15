/* components/FxAiButton.js | Shared AI action button | Sree | 2026-06-14 */

import { Sparkles } from "lucide-react";
import { FX_BUTTON_HEIGHT, FX_BUTTON_PADDING_X, FX_TYPOGRAPHY } from "@/lib/FxTheme";
import { cn } from "@/lib/FxUtils";

const sizeClasses = {
  sm: `${FX_BUTTON_HEIGHT.sm} ${FX_BUTTON_PADDING_X.sm}`,
  md: `${FX_BUTTON_HEIGHT.md} ${FX_BUTTON_PADDING_X.md}`,
  lg: `${FX_BUTTON_HEIGHT.lg} ${FX_BUTTON_PADDING_X.lg}`,
};

export function FxAiButton({ className, icon: Icon = Sparkles, children, size = "md", ...props }) {
  return (
    <button
      type="button"
      className={cn(
        "group inline-flex items-center justify-center rounded-full border border-transparent bg-[linear-gradient(135deg,color-mix(in_srgb,var(--fx-ai)_72%,white_28%),color-mix(in_srgb,var(--fx-primary)_76%,white_24%))] p-[1px] text-[var(--fx-ai)] shadow-[0_0_0_1px_color-mix(in_srgb,var(--fx-ai)_30%,var(--fx-primary)_18%)] transition-[box-shadow,border-color,background-color,opacity] hover:shadow-[0_0_0_1px_color-mix(in_srgb,var(--fx-ai)_42%,var(--fx-primary)_26%),0_6px_14px_rgba(99,102,241,0.10)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:color-mix(in_srgb,var(--fx-ai)_24%,transparent)] dark:bg-[linear-gradient(135deg,color-mix(in_srgb,var(--fx-surface)_90%,var(--fx-ai)_10%),color-mix(in_srgb,var(--fx-surface)_84%,var(--fx-primary)_16%))] dark:text-[var(--fx-text)] dark:shadow-[0_0_0_1px_color-mix(in_srgb,var(--fx-ai)_18%,var(--fx-border)_82%)] dark:hover:shadow-[0_0_0_1px_color-mix(in_srgb,var(--fx-ai)_28%,var(--fx-border)_72%),0_4px_10px_rgba(0,0,0,0.18)] disabled:cursor-not-allowed disabled:opacity-55 disabled:shadow-[0_0_0_1px_color-mix(in_srgb,var(--fx-border)_90%,transparent)] disabled:[background:linear-gradient(135deg,color-mix(in_srgb,var(--fx-surface)_96%,var(--fx-text)_4%),color-mix(in_srgb,var(--fx-surface)_90%,var(--fx-text)_10%))]",
        sizeClasses[size],
        className,
      )}
      {...props}
    >
      <span
        className={cn(
          "inline-flex h-full w-full items-center justify-center gap-[8px] rounded-full border border-[color:color-mix(in_srgb,var(--fx-ai)_24%,var(--fx-primary)_18%)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--fx-surface)_98%,white_2%),color-mix(in_srgb,var(--fx-surface)_88%,var(--fx-ai)_12%))] py-0 text-[var(--fx-ai)] transition-colors group-hover:bg-[linear-gradient(180deg,color-mix(in_srgb,var(--fx-surface)_98%,white_2%),color-mix(in_srgb,var(--fx-surface-hover)_84%,var(--fx-ai)_16%))] dark:border-[color:color-mix(in_srgb,var(--fx-ai)_18%,var(--fx-border)_82%)] dark:bg-[linear-gradient(180deg,color-mix(in_srgb,var(--fx-surface)_94%,var(--fx-ai)_6%),color-mix(in_srgb,var(--fx-surface)_88%,var(--fx-text)_12%))] dark:text-[var(--fx-text)] dark:group-hover:bg-[linear-gradient(180deg,color-mix(in_srgb,var(--fx-surface)_94%,var(--fx-ai)_6%),color-mix(in_srgb,var(--fx-surface)_84%,var(--fx-ai)_16%))] disabled:bg-[linear-gradient(180deg,color-mix(in_srgb,var(--fx-surface)_96%,var(--fx-text)_4%),color-mix(in_srgb,var(--fx-surface)_90%,var(--fx-text)_10%))]",
          sizeClasses[size],
        )}
      >
        <span className="inline-flex size-[20px] shrink-0 items-center justify-center rounded-full bg-[color:color-mix(in_srgb,var(--fx-ai)_14%,white_86%)] text-[var(--fx-ai)] ring-1 ring-[color:color-mix(in_srgb,var(--fx-ai)_24%,transparent)] dark:bg-[color:color-mix(in_srgb,var(--fx-ai)_10%,var(--fx-surface)_90%)] dark:text-[var(--fx-text)] dark:ring-[color:color-mix(in_srgb,var(--fx-ai)_16%,var(--fx-border)_84%)]">
          <Icon className="size-[14px]" />
        </span>
        <span className={`${FX_TYPOGRAPHY.button} whitespace-nowrap text-[var(--fx-ai)] dark:text-[var(--fx-text)]`}>
          {children}
        </span>
      </span>
    </button>
  );
}
/* - - - - - - - - - - - - - - - - */
