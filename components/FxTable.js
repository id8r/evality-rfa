/*
components/FxTable.js | Shared dense table primitive | Sree | 2026-06-13
*/

import { FX_TABLE, FX_TYPOGRAPHY } from "@/lib/FxTheme";
import { cn } from "@/lib/FxUtils";

export function FxTable({
  columns,
  rows,
  className,
  stickyHeader = false,
  emptyMessage = "No rows to display.",
  headerClassName,
  bodyClassName,
  rowClassName,
  headerCellClassName,
  bodyCellClassName,
  emptyClassName,
}) {
  function renderColGroup() {
    return (
      <colgroup>
        {columns.map((column) => (
          <col key={column.key} style={column.width ? { width: column.width } : undefined} />
        ))}
      </colgroup>
    );
  }

  function renderHeader() {
    return (
      <thead className={`bg-[var(--fx-bg-soft)] ${FX_TYPOGRAPHY.tableHeader}`}>
        <tr className={FX_TABLE.headerRowHeight}>
          {columns.map((column) => (
            <th
              key={column.key}
              className={cn(
                FX_TABLE.headerCell,
                column.align === "right" ? "text-right" : "",
                column.align === "center" ? "text-center" : "",
                headerCellClassName,
              )}
              style={column.width ? { width: column.width } : undefined}
            >
              {column.label}
            </th>
          ))}
        </tr>
      </thead>
    );
  }

  function renderBody() {
    return (
      <tbody className="divide-y divide-[var(--fx-border)]">
        {rows.length ? (
          rows.map((row, rowIndex) => (
            <tr
              key={row.id ?? rowIndex}
              className={cn(FX_TABLE.row, rowClassName)}
            >
              {columns.map((column) => (
                <td
                  key={column.key}
                  className={cn(
                    FX_TABLE.bodyCell,
                    column.align === "right" ? "text-right" : "",
                    column.align === "center" ? "text-center" : "",
                    column.cellClassName,
                    bodyCellClassName,
                  )}
                >
                  {row[column.key]}
                </td>
              ))}
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

  if (stickyHeader) {
    return (
      <div className={cn(FX_TABLE.stickyContainer, className)}>
        <div className={cn(FX_TABLE.headerWrap, headerClassName)}>
          <table className={FX_TABLE.headerTable}>
            {renderColGroup()}
            {renderHeader()}
          </table>
        </div>
        <div className={cn(FX_TABLE.bodyWrap, bodyClassName)}>
          <table className={FX_TABLE.bodyTable}>
            {renderColGroup()}
            {renderBody()}
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(FX_TABLE.container, className)}>
      <table className={FX_TABLE.headerTable}>
        {renderColGroup()}
        {renderHeader()}
        {renderBody()}
      </table>
    </div>
  );
}
