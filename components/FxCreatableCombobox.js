/* components/FxCreatableCombobox.js | Shared creatable search combobox | Sree | 2026-06-14
Supported props: options, value, placeholder, onChange, onCreate, allowCreate, createLabel.
Expected behavior: filters options as you type, allows selecting existing values, and can create a new option from the typed text.
Created for: Welcome screen role selector. */

"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Plus, Search } from "lucide-react";

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { FX_COLORS, FX_CONTROL_HEIGHT, FX_RADIUS, FX_TYPOGRAPHY } from "@/lib/FxTheme";
import { cn } from "@/lib/FxUtils";

function normalizeOption(option) {
  if (typeof option === "string") {
    return {
      value: option,
      label: option,
      description: "",
    };
  }

  return {
    value: String(option?.value ?? option?.label ?? ""),
    label: String(option?.label ?? option?.value ?? ""),
    description: String(option?.description ?? ""),
  };
}

export function FxCreatableCombobox({
  options = [],
  value = "",
  placeholder = "Select an option",
  onChange,
  onCreate,
  allowCreate = true,
  createLabel = "Create new",
  className,
  contentClassName,
}) {
  const normalizedOptions = useMemo(() => options.map(normalizeOption).filter((option) => option.value || option.label), [options]);
  const [createdOptions, setCreatedOptions] = useState([]);
  const allOptions = useMemo(() => {
    const optionMap = new Map();

    for (const option of normalizedOptions) {
      optionMap.set(option.value, option);
    }

    for (const option of createdOptions) {
      optionMap.set(option.value, option);
    }

    return Array.from(optionMap.values());
  }, [createdOptions, normalizedOptions]);

  const selectedOption = allOptions.find((option) => option.value === value) ?? null;
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef(null);

  const triggerLabel = selectedOption?.label || placeholder;
  const filteredOptions = useMemo(() => {
    const trimmedQuery = query.trim().toLowerCase();

    if (!trimmedQuery) {
      return allOptions;
    }

    return allOptions.filter((option) => {
      const haystack = `${option.label} ${option.value} ${option.description}`.toLowerCase();
      return haystack.includes(trimmedQuery);
    });
  }, [allOptions, query]);

  const trimmedQuery = query.trim();
  const exactMatch = trimmedQuery
    ? normalizedOptions.some(
        (option) =>
          option.value.toLowerCase() === trimmedQuery.toLowerCase() || option.label.toLowerCase() === trimmedQuery.toLowerCase(),
      )
      : false;
  const canCreate = allowCreate && Boolean(trimmedQuery) && !exactMatch;

  useEffect(() => {
    if (!open) {
      return;
    }

    requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
  }, [open]);

  function closeMenu() {
    setOpen(false);
    setQuery("");
  }

  function handleSelect(option) {
    onChange?.(option.value, option);
    closeMenu();
  }

  async function handleCreateValue() {
    if (!canCreate) {
      return;
    }

    const nextValue = trimmedQuery;
    const createdValue = await Promise.resolve(onCreate?.(nextValue));
    const normalizedCreatedValue =
      typeof createdValue === "string"
        ? createdValue
        : String(createdValue?.value ?? createdValue?.label ?? nextValue);
    const normalizedCreatedOption = {
      value: normalizedCreatedValue,
      label: createdValue?.label ?? nextValue,
      description: String(createdValue?.description ?? ""),
    };

    setCreatedOptions((previousOptions) => {
      const nextOptions = previousOptions.filter((option) => option.value !== normalizedCreatedOption.value);
      nextOptions.unshift(normalizedCreatedOption);
      return nextOptions;
    });

    onChange?.(normalizedCreatedValue, normalizedCreatedOption);
    closeMenu();
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            `flex ${FX_CONTROL_HEIGHT.md} w-full items-center justify-between gap-[12px] border ${FX_COLORS.border} ${FX_RADIUS.xs} bg-[var(--fx-bg)] px-[14px] ${FX_TYPOGRAPHY.input} text-left text-[var(--fx-text)] outline-none transition-colors hover:bg-[var(--fx-bg-soft)] focus:border-[var(--fx-primary)] focus:ring-2 focus:ring-[var(--fx-primary)]/20`,
            !selectedOption ? "text-[var(--fx-text-muted)]" : "",
            className,
          )}
          aria-label={placeholder}
        >
          <span className="min-w-0 flex-1 truncate">{triggerLabel}</span>
          <ChevronDown className="size-[16px] shrink-0 text-[var(--fx-text-muted)]" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="start"
        sideOffset={8}
        onOpenAutoFocus={(event) => {
          event.preventDefault();
          requestAnimationFrame(() => {
            inputRef.current?.focus();
          });
        }}
        onCloseAutoFocus={(event) => {
          event.preventDefault();
        }}
        className={cn(`w-[320px] overflow-hidden p-[8px]`, contentClassName)}
      >
        <div className="space-y-[8px]">
          <div className={`flex ${FX_CONTROL_HEIGHT.md} items-center gap-[10px] rounded-[8px] border ${FX_COLORS.border} bg-[var(--fx-surface)] px-[12px]`}>
            <Search className="size-[16px] shrink-0 text-[var(--fx-text-muted)]" />
              <input
              ref={inputRef}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => {
                event.stopPropagation();

                if (event.key === "Escape") {
                  event.preventDefault();

                  if (query) {
                    setQuery("");
                    return;
                  }

                  closeMenu();
                }

                if (event.key === "Enter") {
                  event.preventDefault();

                  if (canCreate) {
                    handleCreateValue();
                    return;
                  }

                  if (filteredOptions[0]) {
                    handleSelect(filteredOptions[0]);
                  }
                }
              }}
              placeholder={placeholder}
              className="h-full w-full min-w-0 bg-transparent text-[14px] leading-[22px] font-normal text-[var(--fx-text)] outline-none placeholder:text-[var(--fx-text-disabled)]"
            />
          </div>

          <div className="max-h-[320px] overflow-y-auto pr-[2px]">
            {canCreate ? (
              <DropdownMenuItem
                onSelect={(event) => {
                  event.preventDefault();
                  void handleCreateValue();
                }}
                className={`mb-[8px] flex items-center justify-between rounded-[8px] border ${FX_COLORS.border} bg-[var(--fx-bg-soft)] px-[12px] py-[10px] transition-colors hover:bg-[var(--fx-surface-hover)]`}
              >
                <span className={`${FX_TYPOGRAPHY.button} truncate text-[var(--fx-text)]`}>
                  {createLabel}: &quot;{trimmedQuery}&quot;
                </span>
                <Plus className="size-[16px] shrink-0 text-[var(--fx-text-muted)]" />
              </DropdownMenuItem>
            ) : null}

            <div className="space-y-[4px]">
              {filteredOptions.length ? (
                filteredOptions.map((option) => {
                  const isSelected = option.value === value;

                  return (
                    <DropdownMenuItem
                      key={option.value || option.label}
                      onSelect={(event) => {
                        event.preventDefault();
                        handleSelect(option);
                      }}
                      className={cn(
                        "flex items-start gap-[10px] rounded-[8px] px-[12px] py-[10px]",
                        isSelected ? "bg-[var(--fx-surface-selected)]" : "hover:bg-[var(--fx-surface-hover)]",
                      )}
                    >
                      <span className="flex min-w-0 flex-1 flex-col gap-[2px]">
                        <span className={`${FX_TYPOGRAPHY.button} truncate text-[var(--fx-text)]`}>{option.label}</span>
                        {option.description ? (
                          <span className={`${FX_TYPOGRAPHY.fieldHint} line-clamp-2 text-[var(--fx-text-muted)]`}>
                            {option.description}
                          </span>
                        ) : null}
                      </span>
                      {isSelected ? <Check className="mt-[2px] size-[16px] shrink-0 text-[var(--fx-primary)]" /> : null}
                    </DropdownMenuItem>
                  );
                })
              ) : (
                <div className={`rounded-[8px] border border-dashed ${FX_COLORS.border} px-[12px] py-[14px]`}>
                  <p className={`${FX_TYPOGRAPHY.body} text-[var(--fx-text-muted)]`}>No matching options</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
