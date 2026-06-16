/* components/FxTable.js | Shared dense table primitive | Sree | 2026-06-13 */

import { useEffect, useMemo, useState } from "react";

import { FxColumnPicker } from "@/components/FxColumnPicker";
import { FX_TABLE, FX_TYPOGRAPHY } from "@/lib/FxTheme";
import { cn, readStoredJSON, writeStoredJSON } from "@/lib/FxUtils";

const TABLE_DENSITY = {
  comfortable: {
    bodyCell: "px-[16px] py-[12px]",
    row: "min-h-[56px]",
  },
  compact: {
    bodyCell: "px-[16px] py-[8px]",
    row: "min-h-[48px]",
  },
};
/* - - - - - - - - - - - - - - - - */

function normalizeColumnKeys(columns, keys) {
  const columnKeySet = new Set(columns.map((column) => column.key));
  const requiredKeys = columns.filter((column) => column.required || column.locked || column.hideable === false).map((column) => column.key);

  const visibleKeys = Array.isArray(keys) ? keys : [];
  const filteredKeys = visibleKeys.filter((key) => columnKeySet.has(key));
  const nextKeys = Array.from(new Set([...requiredKeys, ...filteredKeys]));

  if (!nextKeys.length && columns.length) {
    return [columns[0].key];
  }

  return nextKeys;
}
/* - - - - - - - - - - - - - - - - */

function getDefaultVisibleColumnKeys(columns, defaultVisibleColumnKeys) {
  const requiredKeys = columns.filter((column) => column.required || column.locked || column.hideable === false).map((column) => column.key);

  if (Array.isArray(defaultVisibleColumnKeys) && defaultVisibleColumnKeys.length) {
    return normalizeColumnKeys(columns, defaultVisibleColumnKeys);
  }

  const defaultKeys = columns.filter((column) => column.defaultVisible !== false).map((column) => column.key);
  return normalizeColumnKeys(columns, [...requiredKeys, ...defaultKeys]);
}
/* - - - - - - - - - - - - - - - - */

function getColumnStickyPosition(column, columnIndex, columnsLength, stickyFirstColumn, stickyLastColumn) {
  if (column.sticky === "left" || (stickyFirstColumn && columnIndex === 0)) {
    return "left";
  }

  if (column.sticky === "right" || (stickyLastColumn && columnIndex === columnsLength - 1)) {
    return "right";
  }

  return null;
}
/* - - - - - - - - - - - - - - - - */

function getStickyClassName(stickyPosition, isHeader) {
  if (!stickyPosition) {
    return "";
  }

  const base = isHeader
    ? "sticky z-[30] bg-[var(--fx-bg-soft)]"
    : "sticky z-[20] bg-inherit";

  if (stickyPosition === "left") {
    return `${base} left-0 shadow-[1px_0_0_var(--fx-border)]`;
  }

  return `${base} right-0 shadow-[-1px_0_0_var(--fx-border)]`;
}
/* - - - - - - - - - - - - - - - - */

export function FxTable({
  columns,
  rows,
  className,
  stickyHeader = false,
  stickyFirstColumn = false,
  stickyLastColumn = false,
  scrollX = true,
  minTableWidth,
  density = "comfortable",
  emptyMessage = "No rows to display.",
  headerClassName,
  bodyClassName,
  rowClassName,
  headerCellClassName,
  bodyCellClassName,
  emptyClassName,
  visibleColumnKeys,
  defaultVisibleColumnKeys,
  onVisibleColumnKeysChange,
  enableColumnPicker = false,
  columnPickerProps = {},
  storageKey = null,
}) {
  const densityClasses = TABLE_DENSITY[density] ?? TABLE_DENSITY.comfortable;
  const controlledVisibleColumnKeys = Array.isArray(visibleColumnKeys) ? visibleColumnKeys : null;
  const [internalVisibleColumnKeys, setInternalVisibleColumnKeys] = useState(() =>
    getDefaultVisibleColumnKeys(columns, defaultVisibleColumnKeys),
  );
  const [isHydrated, setIsHydrated] = useState(!storageKey);

  useEffect(() => {
    if (controlledVisibleColumnKeys) {
      return;
    }

    const storedVisibleColumnKeys = storageKey ? readStoredJSON(storageKey) : null;
    const nextKeys = normalizeColumnKeys(
      columns,
      Array.isArray(storedVisibleColumnKeys) ? storedVisibleColumnKeys : getDefaultVisibleColumnKeys(columns, defaultVisibleColumnKeys),
    );

    setInternalVisibleColumnKeys(nextKeys);
    setIsHydrated(true);
  }, [columns, controlledVisibleColumnKeys, defaultVisibleColumnKeys, storageKey]);

  const visibleColumnKeysState = controlledVisibleColumnKeys ?? internalVisibleColumnKeys;

  const visibleColumns = useMemo(
    () => columns.filter((column) => visibleColumnKeysState.includes(column.key)),
    [columns, visibleColumnKeysState],
  );

  useEffect(() => {
    if (!isHydrated || controlledVisibleColumnKeys) {
      return;
    }

    if (storageKey) {
      writeStoredJSON(storageKey, visibleColumnKeysState);
    }
  }, [controlledVisibleColumnKeys, isHydrated, storageKey, visibleColumnKeysState]);

  function updateVisibleColumnKeys(nextKeys) {
    const normalizedKeys = normalizeColumnKeys(columns, nextKeys);

    if (!controlledVisibleColumnKeys) {
      setInternalVisibleColumnKeys(normalizedKeys);
    }

    onVisibleColumnKeysChange?.(normalizedKeys);
  }

  function renderColGroup() {
    return (
      <colgroup>
        {visibleColumns.map((column) => (
          <col key={column.key} style={column.width ? { width: column.width } : undefined} />
        ))}
      </colgroup>
    );
  }
  /* - - - - - - - - - - - - - - - - */

  function renderHeader() {
    return (
      <thead className={cn("bg-[var(--fx-bg-soft)]", FX_TYPOGRAPHY.tableHeader, headerClassName)}>
        <tr className={FX_TABLE.headerRowHeight}>
          {visibleColumns.map((column, columnIndex) => {
            const stickyPosition = getColumnStickyPosition(column, columnIndex, visibleColumns.length, stickyFirstColumn, stickyLastColumn);

            return (
              <th
                key={column.key}
                className={cn(
                  FX_TABLE.headerCell,
                  stickyHeader ? "sticky top-0" : "",
                  getStickyClassName(stickyPosition, true),
                  column.align === "right" ? "text-right" : "",
                  column.align === "center" ? "text-center" : "",
                  headerCellClassName,
                )}
                style={column.width ? { width: column.width } : undefined}
              >
                {column.label}
              </th>
            );
          })}
        </tr>
      </thead>
    );
  }
  /* - - - - - - - - - - - - - - - - */

  function renderBody() {
    return (
      <tbody className={cn("divide-y divide-[var(--fx-border)]", bodyClassName)}>
        {rows.length ? (
          rows.map((row, rowIndex) => (
            <tr key={row.id ?? rowIndex} className={cn(FX_TABLE.row, densityClasses.row, rowClassName)}>
              {visibleColumns.map((column, columnIndex) => {
                const stickyPosition = getColumnStickyPosition(column, columnIndex, visibleColumns.length, stickyFirstColumn, stickyLastColumn);

                return (
                  <td
                    key={column.key}
                    className={cn(
                      FX_TABLE.bodyCell,
                      FX_TYPOGRAPHY.tableCell,
                      densityClasses.bodyCell,
                      getStickyClassName(stickyPosition, false),
                      column.align === "right" ? "text-right" : "",
                      column.align === "center" ? "text-center" : "",
                      column.cellClassName,
                      bodyCellClassName,
                    )}
                  >
                    {row[column.key]}
                  </td>
                );
              })}
            </tr>
          ))
        ) : (
          <tr>
            <td className={cn(FX_TABLE.emptyCell, emptyClassName)} colSpan={visibleColumns.length}>
              {emptyMessage}
            </td>
          </tr>
        )}
      </tbody>
    );
  }
  /* - - - - - - - - - - - - - - - - */

  return (
    <div className={cn("flex min-h-0 flex-col gap-[12px]", className)}>
      {enableColumnPicker ? (
        <div className="flex justify-end">
          <FxColumnPicker
            columns={columns}
            visibleColumnKeys={visibleColumnKeysState}
            onVisibleColumnKeysChange={updateVisibleColumnKeys}
            {...columnPickerProps}
          />
        </div>
      ) : null}
      <div
        className={cn(
          FX_TABLE.container,
          "min-h-0 flex-1",
          stickyHeader ? "h-full" : "",
          scrollX ? "overflow-auto" : "overflow-hidden",
        )}
      >
        <table
          className={cn("w-full min-w-full table-fixed border-collapse", stickyHeader ? "relative" : "")}
          style={minTableWidth ? { minWidth: minTableWidth } : undefined}
        >
          {renderColGroup()}
          {renderHeader()}
          {renderBody()}
        </table>
      </div>
    </div>
  );
}
/* - - - - - - - - - - - - - - - - */
