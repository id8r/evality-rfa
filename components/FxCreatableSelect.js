/* components/FxCreatableSelect.js | Shared searchable creatable select | Sree | 2026-06-15 */

/* - - - - - - - - - - - - - - - - */

"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Loader2, Plus, Search, X } from "lucide-react";

import {
  FX_FIELD_STATES,
  FxFieldLabel,
  FxFieldMessage,
  getFieldFrameToneClassName,
} from "@/components/FxFieldState";
import { FX_CONTROL_HEIGHT, FX_RADIUS, FX_TYPOGRAPHY } from "@/lib/FxTheme";
import { cn } from "@/lib/FxUtils";

/* - - - - - - - - - - - - - - - - */

function normalizeOption(option) {
  if (typeof option === "string") {
    return {
      value: option,
      label: option,
      description: "",
      disabled: false,
    };
  }

  return {
    value: String(option?.value ?? option?.label ?? ""),
    label: String(option?.label ?? option?.value ?? ""),
    description: String(option?.description ?? ""),
    disabled: Boolean(option?.disabled),
  };
}

/* - - - - - - - - - - - - - - - - */

function useClickOutside(ref, onOutsideClick) {
  useEffect(() => {
    function handlePointerDown(event) {
      const container = ref.current;

      if (!container || container.contains(event.target)) {
        return;
      }

      onOutsideClick?.();
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
    };
  }, [onOutsideClick, ref]);
}

/* - - - - - - - - - - - - - - - - */

function splitFilterValues(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase();
}

/* - - - - - - - - - - - - - - - - */

function normalizeSelectedValues(value, multiple) {
  if (multiple) {
    return Array.isArray(value) ? value.filter(Boolean).map(String) : [];
  }

  return value ? [String(value)] : [];
}

/* - - - - - - - - - - - - - - - - */

function normalizeCreatedOption(createdValue, fallbackValue) {
  if (typeof createdValue === "string") {
    return {
      value: createdValue,
      label: createdValue,
      description: "",
      disabled: false,
    };
  }

  return {
    value: String(createdValue?.value ?? createdValue?.label ?? fallbackValue),
    label: String(createdValue?.label ?? createdValue?.value ?? fallbackValue),
    description: String(createdValue?.description ?? ""),
    disabled: Boolean(createdValue?.disabled),
  };
}

/* - - - - - - - - - - - - - - - - */

export function FxCreatableSelect({
  id,
  options = [],
  value,
  defaultValue,
  onChange,
  onCreate,
  allowCreate = true,
  createLabel = "Create new",
  placeholder = "Select an option",
  searchPlaceholder = "Search or create...",
  emptyText = "No matching options",
  clearable = false,
  disabled = false,
  loading = false,
  multiple = false,
  maxSelections = null,
  required = false,
  optional = false,
  label,
  stackClassName,
  helperText,
  validationMessage,
  state = FX_FIELD_STATES.DEFAULT,
  messageType,
  className,
  triggerClassName,
  menuClassName,
  optionClassName,
  onBlur,
  onFocus,
}) {
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState(() => defaultValue ?? (multiple ? [] : ""));
  const currentValue = isControlled ? value : internalValue;
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [createdOptions, setCreatedOptions] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const rootRef = useRef(null);
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const inputId = `${fieldId}-input`;
  const message = validationMessage ?? helperText;
  const messageState = messageType ?? state;
  const selectedValues = normalizeSelectedValues(currentValue, multiple);
  const isBusy = loading || isCreating;
  const isAtSelectionLimit = multiple && maxSelections != null && selectedValues.length >= maxSelections;

  const normalizedOptions = useMemo(
    () => options.map(normalizeOption).filter((option) => option.value || option.label),
    [options],
  );

  const allOptions = useMemo(() => {
    const optionMap = new Map();

    [...normalizedOptions, ...createdOptions].forEach((option) => {
      optionMap.set(option.value, option);
    });

    return Array.from(optionMap.values());
  }, [createdOptions, normalizedOptions]);

  const selectedOptions = useMemo(
    () =>
      selectedValues
        .map((selectedValue) => allOptions.find((option) => option.value === selectedValue))
        .filter(Boolean),
    [allOptions, selectedValues],
  );

  const trimmedQuery = query.trim();
  const normalizedQuery = splitFilterValues(trimmedQuery);

  const filteredOptions = useMemo(() => {
    if (!normalizedQuery) {
      return allOptions;
    }

    return allOptions.filter((option) => {
      const haystack = `${option.label} ${option.value} ${option.description}`.toLowerCase();
      return haystack.includes(normalizedQuery);
    });
  }, [allOptions, normalizedQuery]);

  const exactMatch = normalizedQuery
    ? allOptions.some(
        (option) =>
          option.value.toLowerCase() === normalizedQuery || option.label.toLowerCase() === normalizedQuery,
      )
    : false;

  const canCreate = allowCreate && Boolean(trimmedQuery) && !exactMatch && !isAtSelectionLimit && !disabled && !isBusy;

  const menuItems = useMemo(() => {
    const nextItems = [];

    if (canCreate) {
      nextItems.push({
        type: "create",
        key: `create-${normalizedQuery}`,
        label: `${createLabel}: "${trimmedQuery}"`,
      });
    }

    filteredOptions.forEach((option) => {
      nextItems.push({
        type: "option",
        key: option.value,
        option,
      });
    });

    return nextItems;
  }, [canCreate, createLabel, filteredOptions, normalizedQuery, trimmedQuery]);

  useClickOutside(rootRef, () => {
    setOpen(false);
    setQuery("");
  });

  useEffect(() => {
    if (!open) {
      return;
    }

    const frameId = requestAnimationFrame(() => {
      setActiveIndex(0);
      document.getElementById(inputId)?.focus();
    });

    return () => cancelAnimationFrame(frameId);
  }, [inputId, open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const frameId = requestAnimationFrame(() => {
      setActiveIndex(0);
    });

    return () => cancelAnimationFrame(frameId);
  }, [query, open]);

  function syncValue(nextValue, selectedOption) {
    if (!isControlled) {
      setInternalValue(nextValue);
    }

    onChange?.(nextValue, selectedOption);
  }

  function closeMenu() {
    setOpen(false);
    setQuery("");
    setActiveIndex(0);
  }

  function focusInput() {
    requestAnimationFrame(() => {
      document.getElementById(inputId)?.focus();
    });
  }

  function selectOption(option) {
    if (option.disabled || disabled || isBusy) {
      return;
    }

    if (multiple) {
      const alreadySelected = selectedValues.includes(option.value);
      const nextValue = alreadySelected
        ? selectedValues.filter((selectedValue) => selectedValue !== option.value)
        : [...selectedValues, option.value];

      syncValue(nextValue, option);
      setQuery("");
      focusInput();
      return;
    }

    syncValue(option.value, option);
    closeMenu();
  }

  async function createOption() {
    if (!canCreate) {
      return;
    }

    setIsCreating(true);

    try {
      const created = await Promise.resolve(onCreate?.(trimmedQuery));
      const normalizedCreatedOption = normalizeCreatedOption(created, trimmedQuery);

      setCreatedOptions((previousOptions) => {
        const nextOptions = previousOptions.filter((option) => option.value !== normalizedCreatedOption.value);
        return [normalizedCreatedOption, ...nextOptions];
      });

      if (multiple) {
        const alreadySelected = selectedValues.includes(normalizedCreatedOption.value);
        const nextValue = alreadySelected
          ? selectedValues
          : [...selectedValues, normalizedCreatedOption.value];

        syncValue(nextValue, normalizedCreatedOption);
        setQuery("");
        focusInput();
        return;
      }

      syncValue(normalizedCreatedOption.value, normalizedCreatedOption);
      closeMenu();
    } catch (error) {
      // Keep the menu open for retry. Callers can surface a toast if needed.
      console.error(error);
    } finally {
      setIsCreating(false);
    }
  }

  function handleClear(event) {
    event.stopPropagation();

    if (disabled || isBusy) {
      return;
    }

    syncValue(multiple ? [] : "", null);
    setQuery("");
    setActiveIndex(0);
    focusInput();
  }

  function handleTriggerClick() {
    if (disabled || isBusy) {
      return;
    }

    setOpen((currentOpen) => !currentOpen);
  }

  function handleInputKeyDown(event) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((currentIndex) => Math.min(currentIndex + 1, Math.max(0, menuItems.length - 1)));
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((currentIndex) => Math.max(currentIndex - 1, 0));
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();

      const activeItem = menuItems[activeIndex];

      if (activeItem?.type === "create") {
        void createOption();
        return;
      }

      if (activeItem?.option) {
        selectOption(activeItem.option);
        return;
      }

      if (canCreate) {
        void createOption();
      }

      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();

      if (trimmedQuery) {
        setQuery("");
        return;
      }

      closeMenu();
      return;
    }

    if (event.key === "Backspace" && multiple && !query && selectedValues.length) {
      event.preventDefault();
      syncValue(selectedValues.slice(0, -1), selectedOptions[selectedOptions.length - 1] ?? null);
    }
  }

  function renderTriggerValue() {
    if (!selectedOptions.length) {
      return <span className="truncate text-[var(--fx-text-disabled)]">{placeholder}</span>;
    }

    if (!multiple) {
      return <span className="truncate text-[var(--fx-text)]">{selectedOptions[0]?.label ?? placeholder}</span>;
    }

    const visibleSelections = selectedOptions.slice(0, 2);
    const remainingCount = selectedOptions.length - visibleSelections.length;

    return (
      <span className="flex min-w-0 flex-wrap items-center gap-[6px]">
        {visibleSelections.map((option) => (
          <span
            key={option.value}
            className="inline-flex max-w-[160px] items-center rounded-full bg-[var(--fx-surface-selected)] px-[8px] py-[3px] text-[var(--fx-text)]"
          >
            <span className="truncate">{option.label}</span>
          </span>
        ))}
        {remainingCount > 0 ? (
          <span className="inline-flex items-center rounded-full bg-[var(--fx-bg-soft)] px-[8px] py-[3px] text-[var(--fx-text-muted)]">
            +{remainingCount}
          </span>
        ) : null}
      </span>
    );
  }

  return (
    <label className={cn("flex w-full flex-col gap-[8px]", stackClassName)}>
      {label ? (
        <FxFieldLabel required={required} optional={optional} state={state}>
          {label}
        </FxFieldLabel>
      ) : null}
      <div ref={rootRef} className={cn("relative w-full", className)}>
        <div
          id={fieldId}
          role="button"
          tabIndex={disabled ? -1 : 0}
          onClick={handleTriggerClick}
          onKeyDown={(event) => {
            if (disabled || isBusy) {
              return;
            }

            if (event.key === "Enter" || event.key === " " || event.key === "ArrowDown") {
              event.preventDefault();
              setOpen(true);
              focusInput();
            }
          }}
          onFocus={(event) => {
            onFocus?.(event);
          }}
          className={cn(
            `flex ${FX_CONTROL_HEIGHT.md} w-full items-center justify-between gap-[12px] border ${FX_RADIUS.xs} bg-[var(--fx-bg)] px-[14px] py-0 ${FX_TYPOGRAPHY.input} text-left outline-none transition-colors focus:ring-2`,
            getFieldFrameToneClassName(state),
            disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer",
            triggerClassName,
          )}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-disabled={disabled || undefined}
        >
          <div className="min-w-0 flex-1">{renderTriggerValue()}</div>
          <div className="flex shrink-0 items-center gap-[8px]">
            {isBusy ? <Loader2 className="size-[16px] animate-spin text-[var(--fx-text-muted)]" /> : null}
            {clearable && selectedOptions.length && !disabled ? (
              <button
                type="button"
                aria-label="Clear selection"
                onClick={handleClear}
                className="inline-flex size-[20px] items-center justify-center rounded-full text-[var(--fx-text-muted)] hover:bg-[var(--fx-surface-hover)] hover:text-[var(--fx-text)]"
              >
                <X className="size-[14px]" />
              </button>
            ) : null}
            <ChevronDown className="size-[16px] shrink-0 text-[var(--fx-text-muted)]" />
          </div>
        </div>

        {open ? (
          <div
            className={cn(
              `absolute left-0 top-[calc(100%+8px)] z-[130] w-full overflow-hidden border ${FX_RADIUS.md} border-[var(--fx-border)] bg-[var(--fx-surface-raised)] shadow-[0_1px_2px_rgba(0,0,0,0.04)]`,
              menuClassName,
            )}
          >
            <div className="flex items-center gap-[10px] border-b border-[var(--fx-border)] px-[12px] py-[10px]">
              <Search className="size-[16px] shrink-0 text-[var(--fx-text-muted)]" />
              <input
                id={inputId}
                value={query}
                disabled={disabled || isBusy}
                placeholder={searchPlaceholder}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={handleInputKeyDown}
                className="w-full min-w-0 bg-transparent text-[14px] leading-[22px] font-normal text-[var(--fx-text)] outline-none placeholder:text-[var(--fx-text-disabled)] disabled:cursor-not-allowed"
              />
            </div>

            <div className="max-h-[320px] overflow-y-auto p-[6px]">
              {menuItems.length ? (
                menuItems.map((item, index) => {
                  const isActive = index === activeIndex;

                  if (item.type === "create") {
                    return (
                      <button
                        key={item.key}
                        type="button"
                        disabled={disabled || isBusy}
                        onMouseEnter={() => setActiveIndex(index)}
                        onClick={() => {
                          void createOption();
                        }}
                        className={cn(
                          "mb-[6px] flex w-full items-center justify-between rounded-[8px] border px-[12px] py-[10px] text-left transition-colors",
                          isActive
                            ? "border-[var(--fx-primary)] bg-[var(--fx-surface-selected)]"
                            : "border-[var(--fx-border)] bg-[var(--fx-bg-soft)] hover:bg-[var(--fx-surface-hover)]",
                          disabled || isBusy ? "cursor-not-allowed opacity-60" : "cursor-pointer",
                        )}
                      >
                        <span className={`${FX_TYPOGRAPHY.button} text-[var(--fx-text)]`}>{item.label}</span>
                        <Plus className="size-[16px] shrink-0 text-[var(--fx-text-muted)]" />
                      </button>
                    );
                  }

                  const option = item.option;
                  const isSelected = selectedValues.includes(option.value);

                  return (
                    <button
                      key={item.key}
                      type="button"
                      disabled={disabled || isBusy || option.disabled}
                      onMouseEnter={() => setActiveIndex(index)}
                      onClick={() => selectOption(option)}
                      className={cn(
                        "flex w-full items-start gap-[10px] rounded-[8px] px-[12px] py-[10px] text-left transition-colors",
                        isActive ? "bg-[var(--fx-surface-hover)]" : "hover:bg-[var(--fx-surface-hover)]",
                        isSelected ? "bg-[var(--fx-surface-selected)]" : "",
                        option.disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer",
                        optionClassName,
                      )}
                    >
                      {multiple ? (
                        <span
                          className={cn(
                            "mt-[2px] inline-flex size-[18px] items-center justify-center rounded-[6px] border",
                            isSelected
                              ? "border-[var(--fx-primary)] bg-[var(--fx-primary)] text-white"
                              : "border-[var(--fx-border)] bg-[var(--fx-surface)]",
                          )}
                        >
                          {isSelected ? <Check className="size-[12px]" /> : null}
                        </span>
                      ) : isSelected ? (
                        <Check className="mt-[2px] size-[16px] shrink-0 text-[var(--fx-primary)]" />
                      ) : (
                        <span className="mt-[2px] size-[16px] shrink-0" />
                      )}
                      <span className="flex min-w-0 flex-1 flex-col gap-[2px]">
                        <span className={`${FX_TYPOGRAPHY.button} truncate text-[var(--fx-text)]`}>{option.label}</span>
                        {option.description ? (
                          <span className={`${FX_TYPOGRAPHY.fieldHint} line-clamp-2 text-[var(--fx-text-muted)]`}>
                            {option.description}
                          </span>
                        ) : null}
                      </span>
                    </button>
                  );
                })
              ) : (
                <div className="px-[12px] py-[14px]">
                  <p className={`${FX_TYPOGRAPHY.body} text-[var(--fx-text-muted)]`}>{emptyText}</p>
                  {canCreate ? (
                    <button
                      type="button"
                      onClick={() => {
                        void createOption();
                      }}
                      className="mt-[8px] inline-flex items-center gap-[8px] text-[var(--fx-primary)]"
                    >
                      <Plus className="size-[14px]" />
                      <span className={FX_TYPOGRAPHY.button}>{createLabel}</span>
                    </button>
                  ) : null}
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>
      {message ? <FxFieldMessage state={messageState}>{message}</FxFieldMessage> : null}
    </label>
  );
}

/* - - - - - - - - - - - - - - - - */
