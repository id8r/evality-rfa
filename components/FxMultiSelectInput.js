/* components/FxMultiSelectInput.js | Shared tokenized multi-select input | Sree | 2026-06-16 */

"use client";

import { useMemo, useState } from "react";
import { Check, X } from "lucide-react";

import {
  FX_FIELD_STATES,
  FxFieldLabel,
  FxFieldMessage,
  getFieldFrameToneClassName,
} from "@/components/FxFieldState";
import { FX_CONTROL_HEIGHT, FX_RADIUS, FX_TYPOGRAPHY } from "@/lib/FxTheme";
import { cn } from "@/lib/FxUtils";

function normalizeValue(value) {
  return String(value ?? "").trim();
}

function dedupeValues(values) {
  const seen = new Set();

  return values
    .map(normalizeValue)
    .filter(Boolean)
    .filter((value) => {
      const key = value.toLowerCase();
      if (seen.has(key)) {
        return false;
      }

      seen.add(key);
      return true;
    });
}

function filterSuggestions(options, query, selectedValues) {
  const normalizedQuery = query.trim().toLowerCase();
  const selectedLookup = new Set(selectedValues.map((value) => value.toLowerCase()));

  return options.filter((option) => {
    const normalizedOption = normalizeValue(option);
    if (!normalizedOption || selectedLookup.has(normalizedOption.toLowerCase())) {
      return false;
    }

    if (!normalizedQuery) {
      return true;
    }

    return normalizedOption.toLowerCase().includes(normalizedQuery);
  });
}

export function FxMultiSelectInput({
  label,
  value = [],
  onChange,
  options = [],
  placeholder = "Search or add industries...",
  helperText,
  validationMessage,
  messageType,
  state = FX_FIELD_STATES.DEFAULT,
  required = false,
  optional = false,
  disabled = false,
  className,
  chipClassName,
  menuClassName,
}) {
  const [draft, setDraft] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const selectedValues = useMemo(() => dedupeValues(Array.isArray(value) ? value : []), [value]);
  const message = validationMessage ?? helperText;
  const messageState = messageType ?? state;

  const visibleSuggestions = useMemo(
    () => filterSuggestions(options, draft, selectedValues),
    [draft, options, selectedValues],
  );

  function commitValues(nextValues) {
    onChange?.(dedupeValues(nextValues));
  }

  function addValue(nextValue) {
    if (disabled) {
      return;
    }

    const normalized = normalizeValue(nextValue);
    if (!normalized) {
      return;
    }

    const exists = selectedValues.some((item) => item.toLowerCase() === normalized.toLowerCase());
    if (exists) {
      setDraft("");
      return;
    }

    commitValues([...selectedValues, normalized]);
    setDraft("");
  }

  function removeValue(valueToRemove) {
    if (disabled) {
      return;
    }

    commitValues(selectedValues.filter((item) => item.toLowerCase() !== valueToRemove.toLowerCase()));
  }

  return (
    <div className="flex w-full flex-col gap-[8px]">
      {label ? (
        <FxFieldLabel required={required} optional={optional} state={state}>
          {label}
        </FxFieldLabel>
      ) : null}
      <div className="relative">
        <div
          className={cn(
            `flex min-h-[40px] w-full flex-wrap items-center gap-[8px] border ${FX_RADIUS.xs} bg-[var(--fx-bg)] px-[16px] py-[8px] ${FX_TYPOGRAPHY.input} text-[var(--fx-text)] outline-none focus-within:ring-2`,
            getFieldFrameToneClassName(state),
            disabled ? "cursor-not-allowed opacity-60" : "",
            className,
          )}
        >
          {selectedValues.map((item) => (
            <span
              key={item}
              className={cn(
                "inline-flex items-center gap-[6px] rounded-full border border-[color:color-mix(in_srgb,var(--fx-primary)_30%,var(--fx-border)_70%)] bg-[var(--fx-surface)] px-[10px] py-[4px] text-[13px] leading-[20px] text-[var(--fx-primary)]",
                chipClassName,
              )}
            >
              <span className="max-w-[180px] truncate">{item}</span>
              <button
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => removeValue(item)}
                disabled={disabled}
                className="inline-flex size-[16px] items-center justify-center rounded-full text-[var(--fx-text-muted)] hover:text-[var(--fx-text)] disabled:cursor-not-allowed"
                aria-label={`Remove ${item}`}
              >
                <X className="size-[12px]" />
              </button>
            </span>
          ))}
          <input
            value={draft}
            disabled={disabled}
            onFocus={() => setIsFocused(true)}
            onBlur={() => {
              window.requestAnimationFrame(() => setIsFocused(false));
            }}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (disabled) {
                return;
              }

              if (event.key === "Enter") {
                event.preventDefault();
                addValue(draft);
                return;
              }

              if (event.key === "Backspace" && !draft && selectedValues.length) {
                event.preventDefault();
                removeValue(selectedValues[selectedValues.length - 1]);
              }
            }}
            placeholder={selectedValues.length ? "" : placeholder}
            className="min-w-[180px] flex-1 bg-transparent py-0 leading-[22px] outline-none placeholder:text-[var(--fx-text-disabled)] disabled:cursor-not-allowed"
          />
        </div>

        {isFocused && draft.trim() && visibleSuggestions.length ? (
          <div
            className={cn(
              "absolute left-0 right-0 top-[calc(100%+8px)] z-[20] overflow-hidden rounded-[12px] border border-[var(--fx-border)] bg-[var(--fx-surface-raised)] p-[4px] shadow-[0_1px_2px_rgba(0,0,0,0.04)]",
              menuClassName,
            )}
          >
            {visibleSuggestions.map((option) => (
              <button
                key={option}
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => addValue(option)}
                className="flex w-full items-center justify-between rounded-[8px] px-[10px] py-[8px] text-left text-[14px] leading-[22px] text-[var(--fx-text)] hover:bg-[var(--fx-surface-hover)]"
              >
                <span className="truncate">{option}</span>
                <Check className="size-[14px] shrink-0 text-[var(--fx-primary)]" />
              </button>
            ))}
          </div>
        ) : null}
      </div>
      {message ? <FxFieldMessage state={messageState}>{message}</FxFieldMessage> : null}
    </div>
  );
}
