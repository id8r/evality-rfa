/*
components/FxColumnPicker.js | Shared table column picker | Sree | 2026-06-16
*/

/* - - - - - - - - - - - - - - - - */

"use client";

import { Columns3 } from "lucide-react";

import { FxButton } from "@/components/FxButton";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FX_TYPOGRAPHY } from "@/lib/FxTheme";
import { cn } from "@/lib/FxUtils";

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
  const visibleKeySet = new Set(visibleColumnKeys ?? []);

  function toggleColumn(column) {
    if (column.required || column.locked || column.hideable === false) {
      return;
    }

    const visibleHideableCount = (visibleColumnKeys ?? []).filter((key) => {
      const visibleColumn = columns.find((item) => item.key === key);
      return visibleColumn && visibleColumn.hideable !== false && !visibleColumn.required && !visibleColumn.locked;
    }).length;

    if (visibleKeySet.has(column.key) && visibleHideableCount <= 1) {
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
          className={cn("gap-[8px]", className)}
          {...buttonProps}
        >
          <Columns3 className="size-[16px]" />
          {buttonLabel ? <span>{buttonLabel}</span> : null}
        </FxButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className={cn("w-[260px] p-[4px]", menuClassName)}>
        <div className="px-[8px] py-[8px]">
          <p className={FX_TYPOGRAPHY.dropdownHeader}>Visible columns</p>
        </div>
        <DropdownMenuSeparator />
        <div className="max-h-[320px] overflow-auto py-[4px]">
          {columns.map((column) => {
            const isChecked = visibleKeySet.has(column.key);
            const isLocked = Boolean(column.required || column.locked || column.hideable === false);
            const columnLabel = typeof column.label === "string" ? column.label : column.menuLabel ?? column.key;

            return (
              <DropdownMenuCheckboxItem
                key={column.key}
                checked={isChecked}
                disabled={isLocked}
                onCheckedChange={() => toggleColumn(column)}
                className={cn("px-[12px] py-[10px]", itemClassName)}
              >
                <div className="flex min-w-0 flex-1 items-center justify-between gap-[12px]">
                  <span className="truncate">{columnLabel}</span>
                  {isLocked ? <span className="text-[11px] font-normal text-[var(--fx-text-muted)]">Required</span> : null}
                </div>
              </DropdownMenuCheckboxItem>
            );
          })}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
/* - - - - - - - - - - - - - - - - */
