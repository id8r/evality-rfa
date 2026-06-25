/* components/FxTable.js | Shared dense table primitive | Sree | 2026-06-19 */

import { useEffect, useMemo, useRef, useState } from "react";

import { FxColumnPicker } from "@/components/FxColumnPicker";
import { Checkbox } from "@/components/ui/checkbox";
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

/* 1. Structural Columns: Enforce absolute invariant sizing */
const ROW_SELECTION_COLUMN = {
  key: "__fx_row_selection__",
  label: null,
  width: 48,
  minWidth: 48,
  maxWidth: 48,
  required: true,
  locked: true,
  hideable: false,
  align: "center",
  cellClassName: "px-0",
};

function toCssSize(value) {
  return typeof value === "number" ? `${value}px` : value;
}

function toPixelValue(value) {
  if (typeof value === "number") return value;
  if (typeof value === "string" && value.trim().endsWith("px")) {
    return Number.parseFloat(value);
  }
  return null;
}

function getTextFromNode(node) {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(getTextFromNode).filter(Boolean).join(" ");
  if (node?.props?.children) return getTextFromNode(node.props.children);
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

/* 2. Principled Width Architecting: Differentiate structural vs content rules */
function getResolvedColumnStyle(column) {
  // Absolute Fixed Structural Utility columns
  if (isActionColumn(column) || column.key === ROW_SELECTION_COLUMN.key) {
    const size = column.width ?? 56;
    return {
      width: toCssSize(size),
      minWidth: toCssSize(size),
      maxWidth: toCssSize(size),
    };
  }

  // Content Columns: Supply minWidth for honest scrolling, but omit hard "width" to allow fluid growth
  if (isPrimaryTextColumn(column)) {
    return { minWidth: "200px" };
  }

  if (column.grow || column.flexible) {
    return { minWidth: "120px" };
  }

  return { minWidth: toCssSize(column.minWidth ?? 140) };
}

function getColumnStickyWidth(column) {
  const style = getResolvedColumnStyle(column);
  return toPixelValue(style.width) ?? toPixelValue(style.minWidth) ?? 140;
}

function getTableMinimumWidth(visibleColumns, minTableWidth) {
  const visibleMinimumWidth = visibleColumns.reduce((total, column) => {
    const style = getResolvedColumnStyle(column);
    const min = toPixelValue(style.minWidth) ?? toPixelValue(style.width) ?? 140;
    return total + min;
  }, 0);
  return `${Math.max(visibleMinimumWidth, toPixelValue(minTableWidth) ?? 0)}px`;
}

/* - - - - - - - - - - - - - - - - */

function normalizeColumnKeys(columns, keys) {
  const columnKeySet = new Set(columns.map((column) => column.key));
  const requiredKeys = columns.filter((column) => column.required || column.locked || column.hideable === false).map((column) => column.key);
  const visibleKeys = Array.isArray(keys) ? keys : [];
  const filteredKeys = visibleKeys.filter((key) => columnKeySet.has(key));
  return Array.from(new Set([...requiredKeys, ...filteredKeys]));
}

function getDefaultVisibleColumnKeys(columns, defaultVisibleColumnKeys) {
  const requiredKeys = columns.filter((column) => column.required || column.locked || column.hideable === false).map((column) => column.key);
  if (Array.isArray(defaultVisibleColumnKeys) && defaultVisibleColumnKeys.length) {
    return normalizeColumnKeys(columns, defaultVisibleColumnKeys);
  }
  const defaultKeys = columns.filter((column) => column.defaultVisible !== false).map((column) => column.key);
  return normalizeColumnKeys(columns, [...requiredKeys, ...defaultKeys]);
}

function getColumnStickyPosition(column, columnIndex, columnsLength, stickyFirstColumn, stickyLastColumn) {
  if (column.sticky === "left" || (stickyFirstColumn && columnIndex === 0)) return "left";
  if (column.sticky === "right" || (stickyLastColumn && columnIndex === columnsLength - 1)) return "right";
  return null;
}

function buildStickyOffsets(renderColumns, stickyFirstColumn, stickyLastColumn) {
  const leftOffsets = new Map();
  const rightOffsets = new Map();
  let accumulatedLeft = 0;
  let accumulatedRight = 0;

  renderColumns.forEach((column, index) => {
    const isStickyLeft = column.sticky === "left" || (stickyFirstColumn && index === 0);
    if (isStickyLeft) {
      leftOffsets.set(column.key, accumulatedLeft);
      accumulatedLeft += getColumnStickyWidth(column);
    }
  });

  for (let i = renderColumns.length - 1; i >= 0; i--) {
    const column = renderColumns[i];
    const isStickyRight = column.sticky === "right" || (stickyLastColumn && i === renderColumns.length - 1);
    if (isStickyRight) {
      rightOffsets.set(column.key, accumulatedRight);
      accumulatedRight += getColumnStickyWidth(column);
    }
  }

  return { leftOffsets, rightOffsets };
}

export function FxTable({
  columns,
  rows,
  className,
  surfaceClassName,
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
  enableRowSelection = false,
  selectedRowKeys,
  defaultSelectedRowKeys = [],
  onSelectedRowKeysChange,
}) {
  const densityClasses = TABLE_DENSITY[density] ?? TABLE_DENSITY.comfortable;
  const controlledVisibleColumnKeys = Array.isArray(visibleColumnKeys) ? visibleColumnKeys : null;
  const [internalVisibleColumnKeys, setInternalVisibleColumnKeys] = useState(() =>
    getDefaultVisibleColumnKeys(columns, defaultVisibleColumnKeys),
  );
  const controlledSelectedRowKeys = Array.isArray(selectedRowKeys) ? selectedRowKeys : null;
  const [internalSelectedRowKeys, setInternalSelectedRowKeys] = useState(() => defaultSelectedRowKeys ?? []);
  const [isHydrated, setIsHydrated] = useState(!storageKey);
  const [hasOverflowLeft, setHasOverflowLeft] = useState(false);
  const [hasOverflowRight, setHasOverflowRight] = useState(false);
  const scrollContainerRef = useRef(null);

  useEffect(() => {
    if (controlledVisibleColumnKeys) return;
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

  const renderColumns = useMemo(
    () => (enableRowSelection ? [ROW_SELECTION_COLUMN, ...visibleColumns] : visibleColumns),
    [enableRowSelection, visibleColumns],
  );

  const visibleColumnsKey = useMemo(() => renderColumns.map((column) => column.key).join(","), [renderColumns]);
  const tableMinWidth = useMemo(() => getTableMinimumWidth(renderColumns, minTableWidth), [minTableWidth, renderColumns]);

  const columnStylesByKey = useMemo(() => {
    const nextStyles = new Map();
    renderColumns.forEach((column) => {
      nextStyles.set(column.key, getResolvedColumnStyle(column));
    });
    return nextStyles;
  }, [renderColumns]);

  const stickyOffsets = useMemo(
    () => buildStickyOffsets(renderColumns, stickyFirstColumn, stickyLastColumn),
    [renderColumns, stickyFirstColumn, stickyLastColumn],
  );

  const selectedRowKeysState = controlledSelectedRowKeys ?? internalSelectedRowKeys;
  const selectedRowKeySet = useMemo(() => new Set(selectedRowKeysState), [selectedRowKeysState]);
  const visibleRowKeys = useMemo(() => rows.map((row) => row.id).filter((key) => key != null), [rows]);
  const allVisibleSelected = visibleRowKeys.length > 0 && visibleRowKeys.every((key) => selectedRowKeySet.has(key));
  const someVisibleSelected = visibleRowKeys.some((key) => selectedRowKeySet.has(key));

  useEffect(() => {
    if (!isHydrated || controlledVisibleColumnKeys) return;
    if (storageKey) writeStoredJSON(storageKey, visibleColumnKeysState);
  }, [controlledVisibleColumnKeys, isHydrated, storageKey, visibleColumnKeysState]);

  useEffect(() => {
    if (!scrollX) {
      setHasOverflowLeft(false);
      setHasOverflowRight(false);
      return;
    }
    const container = scrollContainerRef.current;
    if (!container) return;

    function updateScrollIndicators() {
      const maxScrollLeft = container.scrollWidth - container.clientWidth;
      setHasOverflowLeft(container.scrollLeft > 4);
      setHasOverflowRight(maxScrollLeft > 4 && container.scrollLeft < maxScrollLeft - 4);
    }

    updateScrollIndicators();
    container.addEventListener("scroll", updateScrollIndicators, { passive: true });
    const resizeObserver = new ResizeObserver(() => updateScrollIndicators());
    resizeObserver.observe(container);

    return () => {
      container.removeEventListener("scroll", updateScrollIndicators);
      resizeObserver.disconnect();
    };
  }, [rows, scrollX, tableMinWidth, visibleColumnsKey]);

  function updateVisibleColumnKeys(nextKeys) {
    const normalizedKeys = normalizeColumnKeys(columns, nextKeys);
    if (!controlledVisibleColumnKeys) setInternalVisibleColumnKeys(normalizedKeys);
    onVisibleColumnKeysChange?.(normalizedKeys);
  }

  function updateSelectedRowKeys(nextKeys) {
    const normalizedKeys = Array.from(new Set(nextKeys.filter((key) => key != null)));
    if (!controlledSelectedRowKeys) setInternalSelectedRowKeys(normalizedKeys);
    onSelectedRowKeysChange?.(normalizedKeys);
  }

  function toggleVisibleRowSelection() {
    if (allVisibleSelected) {
      updateSelectedRowKeys(selectedRowKeysState.filter((key) => !visibleRowKeys.includes(key)));
      return;
    }
    updateSelectedRowKeys(Array.from(new Set([...selectedRowKeysState, ...visibleRowKeys])));
  }

  /* 3. Drop explicit <colgroup> fixed styling. We style <th> and <td> natively directly. */
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
          {renderColumns.map((column, columnIndex) => {
            const resolvedStyle = columnStylesByKey.get(column.key);
            const stickyPosition = getColumnStickyPosition(column, columnIndex, renderColumns.length, stickyFirstColumn, stickyLastColumn);

            const stickyOffset = stickyPosition === "left"
              ? stickyOffsets.leftOffsets.get(column.key)
              : stickyPosition === "right"
                ? stickyOffsets.rightOffsets.get(column.key)
                : 0;

            if (column.key === ROW_SELECTION_COLUMN.key) {
              return (
                <th
                  key={column.key}
                  className={cn(FX_TABLE.headerCell, "sticky left-0 top-0 z-[70] bg-[var(--fx-table-header)] px-0", headerCellClassName)}
                  style={{ ...resolvedStyle, left: 0 }}
                >
                  <div className="flex h-full items-center justify-center">
                    <Checkbox
                      checked={allVisibleSelected ? true : someVisibleSelected ? "indeterminate" : false}
                      onCheckedChange={toggleVisibleRowSelection}
                      aria-label="Selection state"
                    />
                  </div>
                </th>
              );
            }

            const isLastColumn = columnIndex === renderColumns.length - 1;
            const isSortedColumn = sortedColumnKey === column.key;
            const isLastUtilityColumn = isLastColumn && columnPicker && isActionColumn(column);

            return (
              <th
                key={column.key}
                aria-sort={isSortedColumn ? (sortedColumnDirection === "desc" ? "descending" : "ascending") : "none"}
                className={cn(
                  FX_TABLE.headerCell,
                  "bg-[var(--fx-table-header)] transition-colors",
                  stickyHeader ? "sticky top-0 z-[50]" : "",
                  stickyPosition === "left" ? "sticky left-0 z-[60]" : "",
                  stickyPosition === "right" ? "sticky right-0 z-[60]" : "",
                  isLastUtilityColumn ? "px-0" : "",
                  column.align === "right" ? "text-right" : column.align === "center" ? "text-center" : "",
                  headerCellClassName,
                )}
                style={{
                  ...resolvedStyle,
                  ...(stickyPosition === "left" ? { left: `${stickyOffset}px` } : {}),
                  ...(stickyPosition === "right" ? { right: `${stickyOffset}px` } : {}),
                }}
              >
                <div className={cn("min-w-0 truncate", TABLE_TYPOGRAPHY.header, headerTextClassName, isSortedColumn ? "text-[var(--fx-primary)]" : "text-[var(--fx-text-muted)]", isLastColumn && columnPicker && !isLastUtilityColumn ? "pr-[40px]" : "")}>
                  {column.label}
                </div>
                {isLastColumn && columnPicker && (
                  <div className={cn("absolute top-1/2 -translate-y-1/2", isLastUtilityColumn ? "left-1/2 -translate-x-1/2" : "right-[8px]")}>
                    {columnPicker}
                  </div>
                )}
              </th>
            );
          })}
        </tr>
      </thead>
    );
  }

  function renderBody() {
    return (
      <tbody className={cn(bodyClassName)}>
        {rows.length ? (
          rows.map((row, rowIndex) => {
            const isSelected = selectedRowKeySet.has(row.id);

            return (
              <tr
                key={row.id ?? rowIndex}
                className={cn(
                  "relative z-0 group",
                  FX_TABLE.row,
                  densityClasses.row,
                  rowClassName,
                  isSelected ? "bg-[color:color-mix(in_srgb,var(--fx-primary)_6%,var(--fx-surface)_94%)]" : "hover:bg-[var(--fx-bg-muted)] bg-[var(--fx-surface)]",
                )}
              >
                {renderColumns.map((column, columnIndex) => {
                  const resolvedStyle = columnStylesByKey.get(column.key);
                  const stickyPosition = getColumnStickyPosition(column, columnIndex, renderColumns.length, stickyFirstColumn, stickyLastColumn);

                  const stickyOffset = stickyPosition === "left"
                    ? stickyOffsets.leftOffsets.get(column.key)
                    : stickyPosition === "right"
                      ? stickyOffsets.rightOffsets.get(column.key)
                      : 0;

                  if (column.key === ROW_SELECTION_COLUMN.key) {
                    const selectionMeta = row.__fxRowSelectionMeta ?? {};

                    return (
                      <td
                        key={column.key}
                        className={cn(
                          FX_TABLE.bodyCell,
                          densityClasses.bodyCell,
                          "sticky left-0 z-[30] bg-inherit text-center px-0",
                          selectionMeta.isNew
                            ? "border-l-[3px] border-l-[color:color-mix(in_srgb,var(--fx-primary)_72%,white_28%)]"
                            : "",
                          column.cellClassName,
                          bodyCellClassName,
                        )}
                        style={{ ...resolvedStyle, left: 0 }}
                      >
                        <div className="flex h-full items-center justify-center">
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => {
                              updateSelectedRowKeys(
                                isSelected ? selectedRowKeysState.filter((key) => key !== row.id) : [...selectedRowKeysState, row.id],
                              );
                            }}
                            aria-label={`Select row ${row.id}`}
                          />
                        </div>
                      </td>
                    );
                  }

                  return (
                    <td
                      key={column.key}
                      className={cn(
                        FX_TABLE.bodyCell,
                        densityClasses.bodyCell,
                        stickyPosition === "left" ? "sticky left-0 z-[20] bg-inherit" : stickyPosition === "right" ? "sticky right-0 z-[20] bg-inherit" : "",
                        column.align === "right" ? "text-right" : column.align === "center" ? "text-center" : "",
                        column.cellClassName,
                        bodyCellClassName,
                      )}
                      style={{
                        ...resolvedStyle,
                        ...(stickyPosition === "left" ? { left: `${stickyOffset}px` } : {}),
                        ...(stickyPosition === "right" ? { right: `${stickyOffset}px` } : {}),
                      }}
                    >
                      <div className={cn("min-w-0", TABLE_TYPOGRAPHY.cell, isPrimaryTextColumn(column) ? TABLE_TYPOGRAPHY.primary : "", bodyTextClassName)}>
                        {row[column.key]}
                      </div>
                    </td>
                  );
                })}
              </tr>
            );
          })
        ) : (
          <tr>
            <td className={cn(FX_TABLE.emptyCell, emptyClassName)} colSpan={renderColumns.length}>
              <div className={cn(TABLE_TYPOGRAPHY.empty, emptyTextClassName)}>{emptyMessage}</div>
            </td>
          </tr>
        )}
      </tbody>
    );
  }

  return (
    <div className={cn("flex min-h-0 flex-col w-full", className)}>
      <div
        ref={scrollContainerRef}
        className={cn(
          FX_TABLE.container,
          surfaceClassName,
          "relative min-h-0 flex-1 overflow-y-auto",
          stickyHeader ? "h-full" : "",
          scrollX ? "overflow-x-auto" : "overflow-x-hidden",
        )}
      >
        <table
          className="w-full min-w-full table-fixed border-separate border-spacing-0 relative isolate"
          style={{ minWidth: tableMinWidth }}
        >
          {renderHeader()}
          {renderBody()}
        </table>

        {scrollX && (
          <>
            <div aria-hidden="true" className={cn("pointer-events-none absolute inset-y-0 left-0 w-[16px] bg-gradient-to-r from-[black]/5 to-transparent transition-opacity duration-150 z-[80]", hasOverflowLeft ? "opacity-100" : "opacity-0")} />
            <div aria-hidden="true" className={cn("pointer-events-none absolute inset-y-0 right-0 w-[16px] bg-gradient-to-l from-[black]/5 to-transparent transition-opacity duration-150 z-[80]", hasOverflowRight ? "opacity-100" : "opacity-0")} />
          </>
        )}
      </div>
    </div>
  );
}
/* - - - - - - - - - - - - - - - - */
