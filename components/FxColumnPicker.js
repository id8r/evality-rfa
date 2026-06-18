/* components/FxColumnPicker.js | Shared table column picker | Sree | 2026-06-16 */

/* - - - - - - - - - - - - - - - - */

"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Columns2 } from "lucide-react";

import { fxButtonClassName, fxIconButtonClassName } from "@/components/FxButton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { FX_TYPOGRAPHY } from "@/lib/FxTheme";
import { cn } from "@/lib/FxUtils";

function isRequiredColumn(column) {
  return Boolean(column.required || column.locked || column.hideable === false);
}

function getTextFromNode(node) {
  if (typeof node === "string" || typeof node === "number") {
    return String(node);
  }

  if (Array.isArray(node)) {
    return node.map(getTextFromNode).filter(Boolean).join(" ");
  }

  if (node?.props?.children) {
    return getTextFromNode(node.props.children);
  }

  return "";
}

function getColumnMenuLabel(column) {
  return column.menuLabel ?? getTextFromNode(column.label) ?? "";
}

export function FxColumnPicker({
  columns,
  visibleColumnKeys,
  onVisibleColumnKeysChange,
  className,
  buttonLabel = "",
  buttonProps = {},
  menuClassName = "",
  itemClassName = "",
}) {
  const pickerId = useId();
  const triggerRef = useRef(null);
  const [open, setOpen] = useState(false);
  const suppressCloseRef = useRef(false);
  const visibleKeySet = new Set(visibleColumnKeys ?? []);
  const optionalColumns = columns.filter((column) => !isRequiredColumn(column));

  useEffect(() => {
    if (open) {
      return;
    }

    const frameId = requestAnimationFrame(() => {
      triggerRef.current?.blur();
    });

    return () => cancelAnimationFrame(frameId);
  }, [open]);

  function handleOpenChange(nextOpen) {
    if (!nextOpen && suppressCloseRef.current) {
      setOpen(true);
      requestAnimationFrame(() => {
        suppressCloseRef.current = false;
      });
      return;
    }

    setOpen(nextOpen);
  }

  function toggleColumn(column) {
    if (isRequiredColumn(column)) {
      return;
    }

    suppressCloseRef.current = true;
    const nextKeys = visibleKeySet.has(column.key)
      ? (visibleColumnKeys ?? []).filter((key) => key !== column.key)
      : [...(visibleColumnKeys ?? []), column.key];

    onVisibleColumnKeysChange?.(nextKeys);
    requestAnimationFrame(() => {
      suppressCloseRef.current = false;
    });
  }

  return (
    <DropdownMenu open={open} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        {buttonLabel ? (
          <button
            ref={triggerRef}
            type="button"
            className={cn(
              fxButtonClassName({ variant: "outline", size: "sm" }),
              "rounded-[4px]",
              className,
            )}
            {...buttonProps}
          >
            <Columns2 className="size-[16px]" />
            <span>{buttonLabel}</span>
          </button>
        ) : (
          <button
            ref={triggerRef}
            type="button"
            className={cn(
              fxIconButtonClassName({
                variant: "ghost",
                size: "sm",
                className:
                  "!h-[32px] !w-[32px] !rounded-[4px] !border-0 !bg-transparent !p-0 !text-[var(--fx-text-muted)] !shadow-none focus-visible:!ring-0 focus-visible:!ring-offset-0 hover:!bg-[var(--fx-surface-hover)] hover:!text-[var(--fx-text)] data-[state=open]:!bg-[var(--fx-surface-hover)] data-[state=open]:!text-[var(--fx-text)]",
              }),
              className,
            )}
            {...buttonProps}
          >
            <Columns2 className="size-[16px]" />
          </button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className={cn("w-[260px] p-[4px]", menuClassName)}>
        <div className="px-[8px] py-[8px]">
          <p className={FX_TYPOGRAPHY.dropdownHeader}>Show Columns</p>
        </div>
        <DropdownMenuSeparator />
        <div className="max-h-[320px] overflow-auto py-[4px]">
          {optionalColumns.map((column) => {
            const isChecked = visibleKeySet.has(column.key);
            const columnLabel = getColumnMenuLabel(column);
            const checkboxId = `${pickerId}-${column.key}`;

            return (
              <DropdownMenuItem
                key={column.key}
                onSelect={(event) => event.preventDefault()}
                className={cn(
                  "min-h-[40px] gap-[10px] px-[8px] py-[8px] text-[14px] leading-[20px] text-[var(--fx-text)] outline-none hover:bg-accent focus:bg-accent",
                  itemClassName,
                )}
              >
                <Checkbox
                  id={checkboxId}
                  checked={isChecked}
                  onCheckedChange={() => toggleColumn(column)}
                  aria-label={columnLabel}
                  onClick={(event) => event.stopPropagation()}
                />
                <label htmlFor={checkboxId} className="min-w-0 flex-1 cursor-pointer truncate">
                  {columnLabel}
                </label>
              </DropdownMenuItem>
            );
          })}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
/* - - - - - - - - - - - - - - - - */
