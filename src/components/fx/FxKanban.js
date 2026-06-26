/* src/components/fx/FxKanban.js | Reusable kanban board and card surface | Sree | 2026-06-26 */

"use client";

import { BellRing, CalendarDays, Eye, MoreHorizontal, Plus } from "lucide-react";

import { FX_COLORS, FX_TYPOGRAPHY } from "@/lib/FxTheme";
import { cn } from "@/lib/FxUtils";

function formatText(value, fallback = "N/A") {
  const text = String(value ?? "").trim();
  return text || fallback;
}

function getCardActionIcon(actionKey) {
  if (actionKey === "schedule" || actionKey === "reschedule") {
    return CalendarDays;
  }

  if (actionKey === "reminder") {
    return BellRing;
  }

  if (actionKey === "more") {
    return MoreHorizontal;
  }

  return Eye;
}

function FxKanbanCard({ card, isSelected = false, onSelect, onAction }) {
  const lines = Array.isArray(card?.lines) ? card.lines.filter(Boolean) : [];
  const indicators = Array.isArray(card?.indicators) ? card.indicators.filter(Boolean) : [];
  const actions = Array.isArray(card?.actions) ? card.actions.filter(Boolean) : [];

  return (
    <article
      className={cn(
        "group cursor-pointer rounded-[8px] border bg-[var(--fx-surface)] px-[12px] py-[10px] shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-colors",
        isSelected
          ? "border-[color:color-mix(in_srgb,var(--fx-primary)_34%,var(--fx-border)_66%)] bg-[color:color-mix(in_srgb,var(--fx-primary)_3%,var(--fx-surface)_97%)]"
          : "border-[color:color-mix(in_srgb,var(--fx-border)_78%,transparent)] hover:border-[color:color-mix(in_srgb,var(--fx-text-muted)_18%,var(--fx-border)_82%)] hover:bg-[var(--fx-surface)]",
      )}
      onClick={() => onSelect?.(card)}
    >
      <div className="space-y-[8px]">
        <div className="flex items-start justify-between gap-[12px]">
          <div className="min-w-0 space-y-[2px]">
            <p className="truncate text-[13px] leading-[18px] font-medium text-[var(--fx-text)]">
              {formatText(card?.title)}
            </p>
            {card?.subtitle ? (
              <p className="truncate text-[12px] leading-[16px] text-[var(--fx-text-muted)]">
                {card.subtitle}
              </p>
            ) : null}
          </div>

          <div className="flex items-start gap-[6px]">
            {card?.score ? (
              <div className="shrink-0 text-right">
                {card?.scoreLabel ? (
                  <p className="text-[10px] leading-[14px] text-[var(--fx-text-muted)]">{card.scoreLabel}</p>
                ) : null}
                <p className="text-[13px] leading-[18px] font-medium text-[var(--fx-text)]">{card.score}</p>
              </div>
            ) : null}

            {actions.length ? (
              <div className="flex items-center gap-[2px]">
                {actions.map((action) => {
                  const Icon = getCardActionIcon(action.key);

                  return (
                    <button
                      key={`${card?.id || card?.title}-${action.key}`}
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        onAction?.(card, action.key);
                      }}
                      className="inline-flex size-[24px] items-center justify-center rounded-[6px] text-[var(--fx-text-muted)] transition-colors hover:bg-[var(--fx-bg-soft)] hover:text-[var(--fx-text)]"
                      aria-label={action.label}
                    >
                      <Icon className="size-[13px]" />
                    </button>
                  );
                })}
              </div>
            ) : null}
          </div>
        </div>

        {indicators.length ? (
          <div className="flex flex-wrap items-center gap-x-[10px] gap-y-[3px]">
            {indicators.map((indicator) => (
              <span key={`${card?.id || card?.title}-${indicator}`} className="text-[11px] leading-[16px] text-[var(--fx-text-muted)]">
                {indicator}
              </span>
            ))}
          </div>
        ) : null}

        {lines.length ? (
          <div className="space-y-[3px]">
            {lines.map((line) => (
              <p key={`${card?.id || card?.title}-${line.label}`} className="text-[12px] leading-[17px] text-[var(--fx-text-muted)]">
                <span className="text-[var(--fx-text-muted)]">{line.label}:</span>{" "}
                <span className="text-[var(--fx-text)]">{line.value}</span>
              </p>
            ))}
          </div>
        ) : null}
      </div>
    </article>
  );
}

export function FxKanban({
  columns = [],
  className = "",
  emptyMessage = "No cards yet.",
  selectedCardId = null,
  onCardSelect,
  onCardAction,
  onColumnAction,
}) {
  return (
    <div className={cn("min-h-0 overflow-x-auto overflow-y-hidden", className)}>
      <div className="flex min-h-0 items-start gap-[12px] pb-[4px]">
        {columns.map((column) => {
          const cards = Array.isArray(column?.cards) ? column.cards.filter(Boolean) : [];

          return (
            <section
              key={column.key}
              className={`flex min-h-[560px] w-[320px] shrink-0 flex-col rounded-[8px] border border-[color:color-mix(in_srgb,var(--fx-border)_72%,transparent)] bg-[color:color-mix(in_srgb,var(--fx-bg-soft)_72%,var(--fx-surface)_28%)]`}
            >
              <div className={`flex items-center justify-between gap-[10px] border-b border-[color:color-mix(in_srgb,var(--fx-border)_72%,transparent)] px-[12px] py-[10px]`}>
                <div className="flex min-w-0 items-center gap-[8px]">
                  <p className="truncate text-[12px] leading-[18px] font-medium text-[var(--fx-text)]">
                    {formatText(column?.title)}
                  </p>
                  <span className="shrink-0 text-[11px] leading-[16px] font-medium text-[var(--fx-text-muted)]">
                    {cards.length}
                  </span>
                  {column?.statusIcon ? (
                    <span className="shrink-0 text-[var(--fx-text-muted)]">
                      {column.statusIcon}
                    </span>
                  ) : null}
                </div>

                <div className="flex items-center gap-[4px]">
                  {column?.allowAdd ? (
                    <button
                      type="button"
                      onClick={() => onColumnAction?.(column, "add")}
                      className="inline-flex size-[24px] items-center justify-center rounded-[6px] text-[var(--fx-text-muted)] transition-colors hover:bg-[var(--fx-surface)] hover:text-[var(--fx-text)]"
                      aria-label={`Add item to ${column.title}`}
                    >
                      <Plus className="size-[13px]" />
                    </button>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => onColumnAction?.(column, "more")}
                    className="inline-flex size-[24px] items-center justify-center rounded-[6px] text-[var(--fx-text-muted)] transition-colors hover:bg-[var(--fx-surface)] hover:text-[var(--fx-text)]"
                    aria-label={`More actions for ${column.title}`}
                  >
                    <MoreHorizontal className="size-[13px]" />
                  </button>
                </div>
              </div>

              <div className="flex min-h-0 flex-1 flex-col gap-[8px] p-[8px]">
                {cards.length ? (
                  cards.map((card) => (
                    <FxKanbanCard
                      key={card.id || card.title}
                      card={card}
                      isSelected={selectedCardId === card.id}
                      onSelect={onCardSelect}
                      onAction={onCardAction}
                    />
                  ))
                ) : (
                  <div className={`flex min-h-[120px] flex-1 items-center justify-center rounded-[8px] border border-dashed ${FX_COLORS.border} bg-[color:color-mix(in_srgb,var(--fx-surface)_88%,var(--fx-bg-soft)_12%)] px-[12px] py-[16px] text-center`}>
                    <p className={`${FX_TYPOGRAPHY.fieldHint} text-[var(--fx-text-muted)]`}>{emptyMessage}</p>
                  </div>
                )}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

export default FxKanban;
/* - - - - - - - - - - - - - - - - */
