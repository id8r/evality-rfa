/* components/FxTable.js | Shared dense table primitive | Sree | 2026-06-13 */

import { useEffect, useMemo, useState } from "react";

import { FxColumnPicker } from "@/components/FxColumnPicker";
import { FX_TABLE, TABLE_TYPOGRAPHY } from "@/lib/FxTheme";
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

function toCssSize(value) {
  return typeof value === "number" ? `${value}px` : value;
}

function toPixelValue(value) {
  if (typeof value === "number") {
    return value;
  }

  if (typeof value === "string" && value.trim().endsWith("px")) {
    return Number.parseFloat(value);
  }

  return null;
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

function isActionColumn(column) {
  const labelText = getTextFromNode(column.label).toLowerCase();

  return column.key === "actions" || column.key === "__fx_column_picker__" || labelText === "";
}

function isPrimaryTextColumn(column) {
  const key = String(column.key ?? "").toLowerCase();
  const labelText = getTextFromNode(column.label).toLowerCase();

  return key.includes("title") || key.includes("name") || labelText.includes("job title") || labelText.includes("candidate name");
}

function isCompactCountColumn(column) {
  const key = String(column.key ?? "").toLowerCase();
  const labelText = getTextFromNode(column.label).toLowerCase();

  return key.endsWith("count") || labelText === "positions" || labelText === "status" || labelText === "stage";
}

function getFallbackColumnDimensions(column) {
  if (isActionColumn(column)) {
    return {
      width: 64,
      minWidth: 64,
      maxWidth: 64,
    };
  }

  if (isPrimaryTextColumn(column)) {
    return {
      width: 280,
      minWidth: 240,
      maxWidth: 360,
    };
  }

  if (isCompactCountColumn(column) || column.align === "center") {
    return {
      width: 96,
      minWidth: 80,
      maxWidth: 120,
    };
  }

  if (column.grow || column.flexible) {
    return {
      width: 180,
      minWidth: 140,
      maxWidth: 260,
    };
  }

  return {
    width: 160,
    minWidth: 140,
    maxWidth: 220,
  };
}

function getResolvedColumnStyle(column) {
  const fallbackDimensions = getFallbackColumnDimensions(column);

  return {
    width: toCssSize(column.width ?? fallbackDimensions.width),
    minWidth: toCssSize(column.minWidth ?? fallbackDimensions.minWidth),
    maxWidth: toCssSize(column.maxWidth ?? fallbackDimensions.maxWidth),
  };
}

function getColumnMinimumWidth(column) {
  const resolvedDimensions = getResolvedColumnStyle(column);

  return toPixelValue(resolvedDimensions.minWidth) ?? toPixelValue(resolvedDimensions.width) ?? 120;
}

function getTableMinimumWidth(visibleColumns, minTableWidth) {
  const visibleMinimumWidth = visibleColumns.reduce((total, column) => total + getColumnMinimumWidth(column), 0);
  const fallbackMinimumWidth = toPixelValue(minTableWidth);

  return `${Math.max(visibleMinimumWidth, fallbackMinimumWidth ?? 0)}px`;
}
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

function getStickyHeaderClassName(stickyPosition, stickyHeader) {
  if (!stickyHeader && !stickyPosition) {
    return "";
  }

  const base = cn(
    "bg-[var(--fx-table-header)]",
    stickyHeader ? "sticky top-0 z-[50]" : "",
    stickyPosition ? "z-[60]" : "",
  );

  if (stickyPosition === "left") {
    return `${base} left-0`;
  }

  if (stickyPosition === "right") {
    return `${base} right-0`;
  }

  return base;
}

function getStickyBodyClassName(stickyPosition) {
  if (!stickyPosition) {
    return "";
  }

  const base = "sticky z-[20] bg-inherit";

  if (stickyPosition === "left") {
    return `${base} left-0`;
  }

  return `${base} right-0`;
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
  sortedColumnKey = null,
  sortedColumnDirection = "asc",
  emptyMessage = "No rows to display.",
  headerClassName,
  bodyClassName,
  rowClassName,
  headerCellClassName,
  bodyCellClassName,
  emptyClassName,
  headerTextClassName,
  bodyTextClassName,
  emptyTextClassName,
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
  const visibleColumnsKey = useMemo(() => visibleColumns.map((column) => column.key).join(","), [visibleColumns]);
  const tableMinWidth = useMemo(
    () => getTableMinimumWidth(visibleColumns, minTableWidth),
    [minTableWidth, visibleColumns],
  );
  const columnStylesByKey = useMemo(() => {
    const nextStyles = new Map();

    visibleColumns.forEach((column) => {
      nextStyles.set(column.key, getResolvedColumnStyle(column));
    });

    return nextStyles;
  }, [visibleColumns]);

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
      <colgroup key={visibleColumnsKey}>
        {visibleColumns.map((column) => (
          <col key={column.key} style={columnStylesByKey.get(column.key)} />
        ))}
      </colgroup>
    );
  }
  /* - - - - - - - - - - - - - - - - */

  function renderHeader() {
    const columnPicker = enableColumnPicker ? (
      <FxColumnPicker
        columns={columns}
        visibleColumnKeys={visibleColumnKeysState}
        onVisibleColumnKeysChange={updateVisibleColumnKeys}
        {...columnPickerProps}
      />
    ) : null;

    return (
      <thead className={cn("bg-[var(--fx-table-header)]", TABLE_TYPOGRAPHY.header, headerClassName)}>
        <tr className={FX_TABLE.headerRowHeight}>
          {visibleColumns.map((column, columnIndex) => {
            const stickyPosition = getColumnStickyPosition(column, columnIndex, visibleColumns.length, stickyFirstColumn, stickyLastColumn);
            const isLastColumn = columnIndex === visibleColumns.length - 1;
            const isSortedColumn = sortedColumnKey === column.key;

            return (
              <th
                key={column.key}
                aria-sort={isSortedColumn ? (sortedColumnDirection === "desc" ? "descending" : "ascending") : "none"}
                className={cn(
                  FX_TABLE.headerCell,
                  "relative bg-[var(--fx-table-header)]",
                  isSortedColumn ? "relative bg-[color:color-mix(in_srgb,var(--fx-surface-hover)_28%,var(--fx-table-header)_72%)] text-[var(--fx-text)] after:pointer-events-none after:absolute after:inset-x-[12px] after:bottom-0 after:h-[2px] after:rounded-full after:bg-[var(--fx-primary)]" : "",
                  getStickyHeaderClassName(stickyPosition, stickyHeader),
                  column.align === "right" ? "text-right" : "",
                  column.align === "center" ? "text-center" : "",
                  headerCellClassName,
                )}
                style={columnStylesByKey.get(column.key)}
              >
                <div className={cn("min-w-0", TABLE_TYPOGRAPHY.header, headerTextClassName, isLastColumn && columnPicker ? "pr-[40px]" : "")}>
                  {column.label}
                </div>
                {isLastColumn && columnPicker ? (
                  <div className="pointer-events-auto absolute right-[8px] top-1/2 -translate-y-1/2">
                    {columnPicker}
                  </div>
                ) : null}
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
      <tbody className={cn(bodyClassName)}>
        {rows.length ? (
          rows.map((row, rowIndex) => (
            <tr key={row.id ?? rowIndex} className={cn("relative z-0", FX_TABLE.row, densityClasses.row, rowClassName)}>
              {visibleColumns.map((column, columnIndex) => {
                const stickyPosition = getColumnStickyPosition(column, columnIndex, visibleColumns.length, stickyFirstColumn, stickyLastColumn);

                return (
                  <td
                    key={column.key}
                className={cn(
                  FX_TABLE.bodyCell,
                  densityClasses.bodyCell,
                  isPrimaryTextColumn(column) ? TABLE_TYPOGRAPHY.primary : "",
                  getStickyBodyClassName(stickyPosition),
                  column.align === "right" ? "text-right" : "",
                  column.align === "center" ? "text-center" : "",
                  column.cellClassName,
                  bodyCellClassName,
                    )}
                    style={columnStylesByKey.get(column.key)}
                  >
                    <div
                      className={cn(
                        "min-w-0",
                        TABLE_TYPOGRAPHY.cell,
                        isPrimaryTextColumn(column) ? TABLE_TYPOGRAPHY.primary : "",
                        bodyTextClassName,
                      )}
                    >
                      {row[column.key]}
                    </div>
                  </td>
                );
              })}
            </tr>
          ))
        ) : (
          <tr>
            <td className={cn(FX_TABLE.emptyCell, emptyClassName)} colSpan={visibleColumns.length}>
              <div className={cn(TABLE_TYPOGRAPHY.empty, emptyTextClassName)}>{emptyMessage}</div>
            </td>
          </tr>
        )}
      </tbody>
    );
  }
  /* - - - - - - - - - - - - - - - - */

  return (
    <div className={cn("flex min-h-0 flex-col", className)}>
      <div
        className={cn(
          FX_TABLE.container,
          "relative min-h-0 flex-1",
          stickyHeader ? "h-full" : "",
          scrollX ? "overflow-auto" : "overflow-hidden",
        )}
      >
        <table
          className={cn("w-full min-w-full table-fixed border-separate border-spacing-0 relative isolate", stickyHeader ? "relative" : "")}
          style={{ minWidth: tableMinWidth }}
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
