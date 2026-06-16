/* components/FxAiButton.js | Shared AI action button | Sree | 2026-06-14 */

import { Sparkles } from "lucide-react";

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
  "bg-white/20 text-white ring-1 ring-white/24 dark:bg-white/18 dark:text-white dark:ring-white/20";

export function FxAiButton({
  className,
  icon: Icon = Sparkles,
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

// /* components/FxAiButton.js | Shared AI action button | Sree | 2026-06-14 */

// import { Sparkles } from "lucide-react";

// import { FX_BUTTON_HEIGHT, FX_BUTTON_PADDING_X, FX_RADIUS, FX_TYPOGRAPHY } from "@/lib/FxTheme";
// import { cn } from "@/lib/FxUtils";

// const sizeClasses = {
//   sm: `${FX_BUTTON_HEIGHT.sm} ${FX_BUTTON_PADDING_X.sm}`,
//   md: `${FX_BUTTON_HEIGHT.md} ${FX_BUTTON_PADDING_X.md}`,
//   lg: `${FX_BUTTON_HEIGHT.lg} ${FX_BUTTON_PADDING_X.lg}`,
// };

// const iconSizeClasses = {
//   sm: "size-[18px]",
//   md: "size-[20px]",
//   lg: "size-[22px]",
// };

// const iconInnerSizeClasses = {
//   sm: "size-[13px]",
//   md: "size-[14px]",
//   lg: "size-[15px]",
// };

// const aiButtonBase =
//   "inline-flex items-center justify-center gap-[8px] whitespace-nowrap border transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--fx-ai)]/24 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-100";

// const aiButtonSurface =
//   "border-[color:color-mix(in_srgb,var(--fx-ai)_34%,var(--fx-border)_66%)] bg-[color:color-mix(in_srgb,var(--fx-ai)_8%,var(--fx-surface)_92%)] text-[var(--fx-text)] hover:border-[color:color-mix(in_srgb,var(--fx-ai)_52%,var(--fx-primary)_20%,var(--fx-border)_28%)] hover:bg-[color:color-mix(in_srgb,var(--fx-ai)_12%,var(--fx-surface)_88%)]";

// const aiButtonDarkSurface =
//   "dark:border-[color:color-mix(in_srgb,var(--fx-ai)_34%,var(--fx-border)_66%)] dark:bg-[color:color-mix(in_srgb,var(--fx-ai)_12%,var(--fx-surface)_88%)] dark:text-[var(--fx-text)] dark:hover:border-[color:color-mix(in_srgb,var(--fx-ai)_54%,var(--fx-primary)_16%,var(--fx-border)_30%)] dark:hover:bg-[color:color-mix(in_srgb,var(--fx-ai)_16%,var(--fx-surface)_84%)]";

// const aiButtonDisabled =
//   "disabled:border-[var(--fx-disabled-border,var(--fx-border))] disabled:bg-[var(--fx-disabled-bg)] disabled:text-[var(--fx-disabled-text)] disabled:hover:border-[var(--fx-disabled-border,var(--fx-border))] disabled:hover:bg-[var(--fx-disabled-bg)] disabled:hover:text-[var(--fx-disabled-text)]";

// const aiIconSurface =
//   "bg-[color:color-mix(in_srgb,var(--fx-ai)_14%,var(--fx-surface)_86%)] text-[var(--fx-ai)] ring-1 ring-[color:color-mix(in_srgb,var(--fx-ai)_22%,transparent)] dark:bg-[color:color-mix(in_srgb,var(--fx-ai)_18%,var(--fx-surface)_82%)] dark:text-[color:color-mix(in_srgb,var(--fx-ai)_84%,white_16%)] dark:ring-[color:color-mix(in_srgb,var(--fx-ai)_28%,transparent)]";

// export function FxAiButton({
//   className,
//   icon: Icon = Sparkles,
//   children,
//   size = "md",
//   type = "button",
//   ...props
// }) {
//   return (
//     <button
//       type={type}
//       className={cn(
//         aiButtonBase,
//         aiButtonSurface,
//         aiButtonDarkSurface,
//         aiButtonDisabled,
//         FX_RADIUS.xl,
//         FX_TYPOGRAPHY.button,
//         sizeClasses[size],
//         className,
//       )}
//       {...props}
//     >
//       <span
//         className={cn(
//           "inline-flex shrink-0 items-center justify-center rounded-full",
//           iconSizeClasses[size],
//           aiIconSurface,
//         )}
//       >
//         <Icon className={iconInnerSizeClasses[size]} strokeWidth={1.9} />
//       </span>
//       <span className="text-current">{children}</span>
//     </button>
//   );
// }

// /* - - - - - - - - - - - - - - - - */

// // /* components/FxAiButton.js | Shared AI action button | Sree | 2026-06-14 */

// // import { Sparkles } from "lucide-react";

// // import { FX_BUTTON_HEIGHT, FX_BUTTON_PADDING_X, FX_TYPOGRAPHY } from "@/lib/FxTheme";
// // import { cn } from "@/lib/FxUtils";

// // const sizeClasses = {
// //   sm: `${FX_BUTTON_HEIGHT.sm} ${FX_BUTTON_PADDING_X.sm}`,
// //   md: `${FX_BUTTON_HEIGHT.md} ${FX_BUTTON_PADDING_X.md}`,
// //   lg: `${FX_BUTTON_HEIGHT.lg} ${FX_BUTTON_PADDING_X.lg}`,
// // };

// // export function FxAiButton({ className, icon: Icon = Sparkles, children, size = "md", ...props }) {
// //   return (
// //     <button
// //       type="button"
// //       className={cn(
// //         "group inline-flex items-center justify-center overflow-hidden rounded-full border border-[color:color-mix(in_srgb,var(--fx-ai)_42%,var(--fx-primary)_28%)] bg-[linear-gradient(135deg,color-mix(in_srgb,var(--fx-ai)_72%,white_28%),color-mix(in_srgb,var(--fx-primary)_76%,white_24%))] text-[var(--fx-ai)] shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-[border-color,background-color,box-shadow,opacity] hover:border-[color:color-mix(in_srgb,var(--fx-ai)_56%,var(--fx-primary)_34%)] hover:shadow-[0_1px_2px_rgba(0,0,0,0.04),0_6px_14px_rgba(99,102,241,0.10)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:color-mix(in_srgb,var(--fx-ai)_24%,transparent)] dark:border-[color:color-mix(in_srgb,var(--fx-ai)_28%,var(--fx-border)_72%)] dark:bg-[linear-gradient(135deg,color-mix(in_srgb,var(--fx-surface)_90%,var(--fx-ai)_10%),color-mix(in_srgb,var(--fx-surface)_84%,var(--fx-primary)_16%))] dark:text-[var(--fx-text)] dark:hover:border-[color:color-mix(in_srgb,var(--fx-ai)_40%,var(--fx-border)_60%)] dark:hover:shadow-[0_1px_2px_rgba(0,0,0,0.04),0_4px_10px_rgba(0,0,0,0.18)] disabled:cursor-not-allowed disabled:opacity-55 disabled:border-[color:color-mix(in_srgb,var(--fx-border)_90%,transparent)] disabled:bg-[linear-gradient(135deg,color-mix(in_srgb(var(--fx-surface)_96%,var(--fx-text)_4%),color-mix(in_srgb(var(--fx-surface)_90%,var(--fx-text)_10%))]",
// //         sizeClasses[size],
// //         className,
// //       )}
// //       {...props}
// //     >
// //       <span
// //         className={cn(
// //           "inline-flex h-full w-full items-center justify-center gap-[8px] rounded-full bg-transparent py-0 text-[var(--fx-text)] transition-colors dark:text-[var(--fx-text)]",
// //           sizeClasses[size],
// //         )}
// //       >
// //         <span className="inline-flex size-[20px] shrink-0 items-center justify-center rounded-full bg-[color:color-mix(in_srgb,var(--fx-ai)_14%,white_86%)] text-[var(--fx-ai)] ring-1 ring-[color:color-mix(in_srgb,var(--fx-ai)_24%,transparent)] dark:bg-[color:color-mix(in_srgb,var(--fx-ai)_10%,var(--fx-surface)_90%)] dark:text-[var(--fx-text)] dark:ring-[color:color-mix(in_srgb,var(--fx-ai)_16%,var(--fx-border)_84%)]">
// //           <Icon className="size-[14px]" />
// //         </span>
// //         <span className={`${FX_TYPOGRAPHY.button} whitespace-nowrap text-[var(--fx-text)] dark:text-[var(--fx-text)]`}>
// //           {children}
// //         </span>
// //       </span>
// //     </button>
// //   );
// // }
// // /* - - - - - - - - - - - - - - - - */