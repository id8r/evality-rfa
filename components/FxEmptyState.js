/*
components/FxEmptyState.js | Shared empty state primitive | Sree | 2026-06-13
*/

import { FX_COLORS, FX_TYPOGRAPHY } from "@/lib/FxTheme";

export function FxEmptyState({ icon: Icon, title, body, action }) {
  return (
    <div className={`flex flex-col items-center justify-center gap-[16px] rounded-[16px] border ${FX_COLORS.border} bg-[var(--fx-surface)] p-[32px] text-center`}>
      {Icon ? (
        <div className={`flex size-[48px] items-center justify-center rounded-[12px] bg-[var(--fx-bg-soft)] ${FX_COLORS.primaryText}`}>
          <Icon className="size-[24px]" />
        </div>
      ) : null}
      <div className="space-y-[8px]">
        <div className={`${FX_TYPOGRAPHY.cardTitle} text-[var(--fx-text)]`}>{title}</div>
        <p className={`${FX_TYPOGRAPHY.body} text-[var(--fx-text-muted)]`}>{body}</p>
      </div>
      {action ? <div>{action}</div> : null}
    </div>
  );
}
