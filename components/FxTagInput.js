/* components/FxTagInput.js | Shared tokenized tag input | Sree | 2026-06-15 */

/* - - - - - - - - - - - - - - - - */

"use client";

import { forwardRef, useMemo, useState } from "react";
import { X } from "lucide-react";

import {
  FX_FIELD_STATES,
  FxFieldLabel,
  FxFieldMessage,
  getFieldFrameToneClassName,
} from "@/components/FxFieldState";
import { FX_RADIUS, FX_TYPOGRAPHY } from "@/lib/FxTheme";
import { cn } from "@/lib/FxUtils";

/* - - - - - - - - - - - - - - - - */

function splitTagValues(input) {
  return String(input ?? "")
    .split(/[\n,;]+/g)
    .map((item) => item.trim())
    .filter(Boolean);
}

/* - - - - - - - - - - - - - - - - */

function dedupeTags(tags) {
  return Array.from(new Set(tags.map((tag) => tag.trim()).filter(Boolean)));
}

/* - - - - - - - - - - - - - - - - */

export const FxTagInput = forwardRef(function FxTagInput(
  {
    value = [],
    onChange,
    label,
    helperText,
    validationMessage,
    state = FX_FIELD_STATES.DEFAULT,
    required = false,
    optional = false,
    placeholder = "Add a tag",
    maxTags = null,
    disabled = false,
    className,
    chipClassName,
    inputClassName,
    messageType,
    onBlur,
    onFocus,
  },
  ref,
) {
  const [draft, setDraft] = useState("");
  const tags = useMemo(() => dedupeTags(Array.isArray(value) ? value : []), [value]);
  const message = validationMessage ?? helperText;
  const messageState = messageType ?? state;

  function commitTags(nextTags) {
    onChange?.(dedupeTags(nextTags).slice(0, maxTags ?? undefined));
  }

  function addTags(nextDraft) {
    if (disabled) {
      return;
    }

    const incomingTags = splitTagValues(nextDraft);

    if (!incomingTags.length) {
      return;
    }

    const nextTags = [...tags];
    incomingTags.forEach((tag) => {
      const exists = nextTags.some((existingTag) => existingTag.toLowerCase() === tag.toLowerCase());
      if (!exists && (maxTags == null || nextTags.length < maxTags)) {
        nextTags.push(tag);
      }
    });

    commitTags(nextTags);
    setDraft("");
  }

  function removeTag(tagToRemove) {
    if (disabled) {
      return;
    }

    commitTags(tags.filter((tag) => tag.toLowerCase() !== tagToRemove.toLowerCase()));
  }

  return (
    <label className="flex w-full flex-col gap-[8px]">
      {label ? (
        <FxFieldLabel required={required} optional={optional} state={state}>
          {label}
        </FxFieldLabel>
      ) : null}
      <div
        className={cn(
          `flex min-h-[34px] w-full flex-wrap items-center gap-[8px] border ${FX_RADIUS.xs} bg-[var(--fx-surface)] px-[12px] py-[7px] ${FX_TYPOGRAPHY.input} text-[var(--fx-text)] outline-none focus-within:ring-2`,
          getFieldFrameToneClassName(state),
          disabled ? "cursor-not-allowed opacity-60" : "",
          className,
        )}
      >
        {tags.map((tag) => (
          <span
            key={tag}
            className={cn(
              "inline-flex max-w-full items-center gap-[8px] rounded-full border border-[color:color-mix(in_srgb,var(--fx-primary)_28%,var(--fx-border)_72%)] bg-[var(--fx-bg)] px-[10px] py-[4px] text-[var(--fx-primary)] shadow-[0_1px_0_rgba(37,99,235,0.02)]",
              FX_TYPOGRAPHY.small,
              chipClassName,
            )}
          >
            <span className="max-w-[180px] truncate">{tag}</span>
            <button
              type="button"
              onClick={() => removeTag(tag)}
              disabled={disabled}
              className="inline-flex size-[16px] items-center justify-center rounded-full text-[var(--fx-text-muted)] hover:text-[var(--fx-text)] disabled:cursor-not-allowed"
              aria-label={`Remove ${tag}`}
            >
              <X className="size-[12px]" />
            </button>
          </span>
        ))}
        <input
          ref={ref}
          value={draft}
          disabled={disabled || (maxTags != null && tags.length >= maxTags)}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (disabled) {
              return;
            }

            if (event.key === "Enter" || event.key === ",") {
              event.preventDefault();
              addTags(draft);
              return;
            }

            if (event.key === "Backspace" && !draft && tags.length) {
              event.preventDefault();
              removeTag(tags[tags.length - 1]);
            }
          }}
          onPaste={(event) => {
            if (disabled) {
              return;
            }

            const pastedText = event.clipboardData.getData("text");
            if (!pastedText) {
              return;
            }

            event.preventDefault();
            addTags(`${draft}${draft ? "," : ""}${pastedText}`);
          }}
          onBlur={onBlur}
          onFocus={onFocus}
          placeholder={placeholder}
          className={cn(
            "min-w-[120px] flex-1 self-center bg-transparent py-0 leading-[22px] outline-none placeholder:text-[var(--fx-text-disabled)] disabled:cursor-not-allowed",
            inputClassName,
          )}
        />
      </div>
      {message ? <FxFieldMessage state={messageState}>{message}</FxFieldMessage> : null}
    </label>
  );
});

/* - - - - - - - - - - - - - - - - */
