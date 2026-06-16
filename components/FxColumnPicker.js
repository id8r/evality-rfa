/* components/FxColumnPicker.js | Shared table column picker | Sree | 2026-06-16 */

/* - - - - - - - - - - - - - - - - */

"use client";

import { useId } from "react";
import { Columns3 } from "lucide-react";

import { FxButton } from "@/components/FxButton";
import {
  DropdownMenu,
  DropdownMenuContent,
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
  const visibleKeySet = new Set(visibleColumnKeys ?? []);
  const optionalColumns = columns.filter((column) => !isRequiredColumn(column));

  function toggleColumn(column) {
    if (isRequiredColumn(column)) {
      return;
    }

    const nextKeys = visibleKeySet.has(column.key)
      ? (visibleColumnKeys ?? []).filter((key) => key !== column.key)
      : [...(visibleColumnKeys ?? []), column.key];

    onVisibleColumnKeysChange?.(nextKeys);
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <FxButton
          type="button"
          variant="outline"
          size="sm"
          className={cn("!w-[30px] !px-0", buttonLabel ? "!w-auto !px-[12px] gap-[8px]" : "", className)}
          {...buttonProps}
        >
          <Columns3 className="size-[16px]" />
          {buttonLabel ? <span>{buttonLabel}</span> : null}
        </FxButton>
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
              <div
                key={column.key}
                className={cn(
                  "flex min-h-[40px] select-none items-center gap-[10px] rounded-[6px] px-[8px] py-[8px] text-[14px] leading-[20px] text-[var(--fx-text)] outline-none hover:bg-accent",
                  itemClassName,
                )}
              >
                <Checkbox
                  id={checkboxId}
                  checked={isChecked}
                  onCheckedChange={() => toggleColumn(column)}
                  aria-label={columnLabel}
                />
                <label htmlFor={checkboxId} className="min-w-0 flex-1 cursor-pointer truncate">
                  {columnLabel}
                </label>
              </div>
            );
          })}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
/* - - - - - - - - - - - - - - - - */
