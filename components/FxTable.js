/* components/FxTable.js | Shared dense table primitive | Sree | 2026-06-13 */

import { FX_TABLE, FX_TYPOGRAPHY } from "@/lib/FxTheme";
import { cn } from "@/lib/FxUtils";

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
}) {
  const densityClasses = TABLE_DENSITY[density] ?? TABLE_DENSITY.comfortable;

  function renderColGroup() {
    return (
      <colgroup>
        {columns.map((column) => (
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
          {columns.map((column, columnIndex) => {
            const stickyPosition = getColumnStickyPosition(column, columnIndex, columns.length, stickyFirstColumn, stickyLastColumn);

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
              {columns.map((column, columnIndex) => {
                const stickyPosition = getColumnStickyPosition(column, columnIndex, columns.length, stickyFirstColumn, stickyLastColumn);

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
            <td className={cn(FX_TABLE.emptyCell, emptyClassName)} colSpan={columns.length}>
              {emptyMessage}
            </td>
          </tr>
        )}
      </tbody>
    );
  }
  /* - - - - - - - - - - - - - - - - */

  return (
    <div
      className={cn(
        FX_TABLE.container,
        scrollX ? "overflow-auto" : "overflow-hidden",
        className,
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
  );
}
/* - - - - - - - - - - - - - - - - */
