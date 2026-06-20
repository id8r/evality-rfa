/* components/FxPill.js | Shared pill primitive | Sree | 2026-06-20 */

"use client";
import { FX_PILL } from "@/lib/FxTheme";
import { cn } from "@/lib/FxUtils";
/* - - - - - - - - - - - - - - - - */

const toneClasses = {
  neutral: "bg-[var(--fx-bg-soft)] text-[var(--fx-text)]",
  subtle: "bg-[var(--fx-surface-subtle)] text-[var(--fx-text-muted)]",
  primary: "bg-[var(--fx-surface-selected)] text-[var(--fx-primary)]",
  success: "bg-[color:color-mix(in_srgb,var(--fx-success)_12%,var(--fx-surface)_88%)] text-[var(--fx-success)]",
  warning: "bg-[color:color-mix(in_srgb,var(--fx-warning)_12%,var(--fx-surface)_88%)] text-[var(--fx-warning)]",
  danger: "bg-[color:color-mix(in_srgb,var(--fx-danger)_12%,var(--fx-surface)_88%)] text-[var(--fx-danger)]",
};
/* - - - - - - - - - - - - - - - - */

export function fxPillClassName({ shape = "full", tone = "neutral", className = "" } = {}) {
  return cn(
    FX_PILL.base,
    shape === "rect" ? FX_PILL.rect : FX_PILL.full,
    toneClasses[tone] ?? toneClasses.neutral,
    className,
  );
}
/* - - - - - - - - - - - - - - - - */

export function FxPill({ asChild = false, className = "", shape = "full", tone = "neutral", ...props }) {
  const Component = asChild ? "div" : "span";

  return (
    <Component
      className={fxPillClassName({ shape, tone, className })}
      {...props}
    />
  );
}
/* - - - - - - - - - - - - - - - - */