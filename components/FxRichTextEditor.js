/* components/FxRichTextEditor.js | Shared rich text editor | Sree | 2026-06-15 */

/* - - - - - - - - - - - - - - - - */

"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AlignLeft, Bold, Heading1, Heading2, Italic, Link2, List, ListOrdered, Underline } from "lucide-react";

import {
  FX_FIELD_STATES,
  FxFieldLabel,
  FxFieldMessage,
  getFieldFrameToneClassName,
} from "@/components/FxFieldState";
import { FxButton } from "@/components/FxButton";
import { FX_RADIUS, FX_TYPOGRAPHY } from "@/lib/FxTheme";
import { cn } from "@/lib/FxUtils";

/* - - - - - - - - - - - - - - - - */

function normalizeEditorValue(value) {
  return typeof value === "string" ? value : "";
}

/* - - - - - - - - - - - - - - - - */

function normalizeEditorHtmlValue(value) {
  const html = normalizeEditorValue(value);
  const text = html
    .replace(/<br\s*\/?>/gi, "")
    .replace(/<\/(p|div|li|h1|h2|h3|h4|h5|h6)>/gi, " ")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .trim();

  return text ? html : "";
}

/* - - - - - - - - - - - - - - - - */

function execEditorCommand(command, commandValue = null) {
  if (typeof document === "undefined" || typeof document.execCommand !== "function") {
    return false;
  }

  return document.execCommand(command, false, commandValue);
}

/* - - - - - - - - - - - - - - - - */

export function FxRichTextEditor({
  value,
  onChange,
  label,
  helperText,
  validationMessage,
  state = FX_FIELD_STATES.DEFAULT,
  required = false,
  optional = false,
  placeholder = "Write here...",
  disabled = false,
  className,
  toolbarClassName,
  editorClassName,
  minHeight = 220,
  toolbarPlacement = "bottom",
  messageType,
  onBlur,
  onFocus,
}) {
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState(() => normalizeEditorValue(value));
  const currentValue = normalizeEditorValue(isControlled ? value : internalValue);
  const [isFocused, setIsFocused] = useState(false);
  const editorRef = useRef(null);
  const message = validationMessage ?? helperText;
  const messageState = messageType ?? state;

  const toolbarButtons = useMemo(
    () => [
      { key: "bold", label: "Bold", icon: Bold, command: "bold" },
      { key: "italic", label: "Italic", icon: Italic, command: "italic" },
      { key: "underline", label: "Underline", icon: Underline, command: "underline" },
      { key: "bullet", label: "Bullets", icon: List, command: "insertUnorderedList" },
      { key: "numbered", label: "Numbered", icon: ListOrdered, command: "insertOrderedList" },
      { key: "h1", label: "Heading 1", icon: Heading1, command: "formatBlock", value: "h1" },
      { key: "h2", label: "Heading 2", icon: Heading2, command: "formatBlock", value: "h2" },
      { key: "link", label: "Link", icon: Link2, command: "link" },
    ],
    [],
  );

  useEffect(() => {
    if (!editorRef.current || isFocused) {
      return;
    }

    const nextHtml = currentValue || "";
    if (editorRef.current.innerHTML !== nextHtml) {
      editorRef.current.innerHTML = nextHtml;
    }
  }, [currentValue, isFocused]);

  function updateValue(nextValue) {
    if (!isControlled) {
      setInternalValue(nextValue);
    }

    onChange?.(nextValue);
  }

  function handleInput() {
    updateValue(normalizeEditorHtmlValue(editorRef.current?.innerHTML ?? ""));
  }

  function focusEditor() {
    editorRef.current?.focus();
  }

  function applyCommand(command, commandValue = null) {
    if (disabled) {
      return;
    }

    focusEditor();

    if (command === "link") {
      const nextUrl = window.prompt("Enter link URL");

      if (!nextUrl) {
        return;
      }

      execEditorCommand("createLink", nextUrl);
      handleInput();
      return;
    }

    execEditorCommand(command, commandValue);
    handleInput();
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
          `overflow-hidden border ${FX_RADIUS.xs} bg-[var(--fx-surface)]`,
          getFieldFrameToneClassName(state),
          disabled ? "cursor-not-allowed opacity-60" : "",
          className,
        )}
      >
        <div className="relative">
          {!currentValue && !isFocused ? (
            <div
              aria-hidden="true"
              className={cn(
                "pointer-events-none absolute left-[12px] top-[14px] z-[1] flex items-center gap-[8px] text-[var(--fx-text-disabled)]",
                FX_TYPOGRAPHY.input,
              )}
            >
              <AlignLeft className="size-[14px] shrink-0" />
              {placeholder}
            </div>
          ) : null}
          <div
            ref={editorRef}
            role="textbox"
            aria-multiline="true"
            aria-disabled={disabled || undefined}
            dir="ltr"
            contentEditable={!disabled}
            suppressContentEditableWarning
            spellCheck
            onInput={handleInput}
            onBlur={(event) => {
              setIsFocused(false);
              onBlur?.(event);
            }}
            onFocus={(event) => {
              setIsFocused(true);
              onFocus?.(event);
            }}
            onKeyDown={(event) => {
              if (disabled) {
                event.preventDefault();
              }
            }}
            className={cn("min-h-[140px] px-[16px] pt-[14px] pb-[10px] outline-none", FX_TYPOGRAPHY.body, "text-[var(--fx-text)]", editorClassName)}
            style={{ minHeight }}
          />
        </div>
        <div
          className={cn(
            "flex flex-wrap items-center gap-[4px] border-t border-[var(--fx-border)] bg-[var(--fx-surface)] px-[10px] py-[8px]",
            toolbarPlacement === "top" ? "border-t-0 border-b border-[var(--fx-border)]" : "",
            toolbarClassName,
          )}
        >
          {toolbarButtons.map((button) => (
            <FxButton
              key={button.key}
              type="button"
              variant="ghost"
              size="sm"
              disabled={disabled}
              aria-label={button.label}
              title={button.label}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => applyCommand(button.command, button.value ?? null)}
              className="h-[28px] min-w-[28px] px-[8px] text-[var(--fx-text-muted)] hover:text-[var(--fx-text)]"
            >
              <button.icon className="size-[14px]" />
            </FxButton>
          ))}
        </div>
      </div>
      {message ? <FxFieldMessage state={messageState}>{message}</FxFieldMessage> : null}
    </label>
  );
}

/* - - - - - - - - - - - - - - - - */
