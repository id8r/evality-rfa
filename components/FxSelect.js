/* components/FxSelect.js | Shared styled select primitive | Sree | 2026-06-15 */
/* - - - - - - - - - - - - - - - - */

"use client";

import { useMemo } from "react";
import { Check, ChevronDown } from "lucide-react";

import {
  FX_FIELD_STATES,
  FxFieldLabel,
  FxFieldMessage,
  getFieldFrameToneClassName,
} from "@/components/FxFieldState";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FX_CONTROL_HEIGHT, FX_RADIUS, FX_TYPOGRAPHY } from "@/lib/FxTheme";
import { cn } from "@/lib/FxUtils";

/* - - - - - - - - - - - - - - - - */

function normalizeOption(option) {
  if (typeof option === "string") {
    return {
      value: option,
      label: option,
      disabled: false,
    };
  }

  return {
    value: String(option?.value ?? option?.label ?? ""),
    label: String(option?.label ?? option?.value ?? ""),
    disabled: Boolean(option?.disabled),
  };
}

/* - - - - - - - - - - - - - - - - */

export function FxSelect({
  id,
  name,
  label,
  stackClassName,
  value,
  onChange,
  options = [],
  placeholder = "Select an option",
  required = false,
  optional = false,
  disabled = false,
  helperText,
  validationMessage,
  messageType,
  state = FX_FIELD_STATES.DEFAULT,
  className,
  menuClassName,
  optionClassName,
}) {
  const fieldId = id ?? name;
  const fieldMessage = validationMessage ?? helperText;
  const fieldMessageState = messageType ?? state;
  const normalizedOptions = useMemo(
    () => options.map(normalizeOption).filter((option) => option.value),
    [options],
  );
  const selectedOption = normalizedOptions.find((option) => option.value === value) ?? null;

  function handleSelect(nextOption) {
    onChange?.(
      {
        target: { name, value: nextOption.value, id: fieldId },
        currentTarget: { name, value: nextOption.value, id: fieldId },
      },
      nextOption,
    );
  }

  return (
    <label className={cn("flex w-full flex-col gap-[8px]", stackClassName)} htmlFor={fieldId}>
      {label ? (
        <FxFieldLabel required={required} optional={optional} state={state}>
          {label}
        </FxFieldLabel>
      ) : null}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            id={fieldId}
            type="button"
            disabled={disabled}
            className={cn(
              `flex ${FX_CONTROL_HEIGHT.md} w-full items-center justify-between gap-[12px] border ${FX_RADIUS.xs} bg-[var(--fx-bg)] px-[16px] py-0 text-left outline-none focus:ring-2 disabled:cursor-not-allowed disabled:bg-[var(--fx-bg-soft)] disabled:text-[var(--fx-text-disabled)]`,
              getFieldFrameToneClassName(state),
              className,
            )}
          >
            <span
              className={cn(
                "min-w-0 flex-1 truncate",
                FX_TYPOGRAPHY.input,
                selectedOption ? "text-[var(--fx-text)]" : "text-[var(--fx-text-disabled)]",
              )}
            >
              {selectedOption?.label ?? placeholder}
            </span>
            <ChevronDown className="size-[16px] shrink-0 text-[var(--fx-text-muted)]" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className={cn("w-[var(--radix-dropdown-menu-trigger-width)]", menuClassName)}>
          {normalizedOptions.map((option) => {
            const isSelected = selectedOption?.value === option.value;

            return (
              <DropdownMenuItem
                key={option.value}
                disabled={option.disabled}
                onSelect={() => handleSelect(option)}
                className={cn("justify-between", optionClassName)}
              >
                <span className="truncate">{option.label}</span>
                {isSelected ? <Check className="size-[14px] shrink-0 text-[var(--fx-primary)]" /> : null}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
      {fieldMessage ? <FxFieldMessage state={fieldMessageState}>{fieldMessage}</FxFieldMessage> : null}
    </label>
  );
}

/* - - - - - - - - - - - - - - - - */
