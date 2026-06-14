/*
components/FxTable.js | Shared dense table primitive | Sree | 2026-06-13
*/

import { FX_COLORS, FX_RADIUS, FX_TYPOGRAPHY } from "@/lib/FxTheme";
import { cn } from "@/lib/FxUtils";

export function FxTable({ columns, rows, className, stickyHeader = false, emptyMessage = "No rows to display." }) {
  function renderHeader() {
    return (
      <thead className={`bg-[var(--fx-bg-soft)] ${FX_TYPOGRAPHY.tableHeader}`}>
        <tr className={FX_COLORS.border}>
          {columns.map((column) => (
            <th
              key={column.key}
              className={cn(
                "border-b border-[var(--fx-border)] px-[16px] py-[16px] text-left text-[var(--fx-text-muted)]",
                column.align === "right" ? "text-right" : "",
                column.align === "center" ? "text-center" : "",
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
              className="odd:bg-[var(--fx-surface)] even:bg-[var(--fx-bg-soft)]/70 hover:bg-[var(--fx-surface-hover)]"
            >
              {columns.map((column) => (
                <td
                  key={column.key}
                  className={cn(
                    "px-[16px] py-[8px] align-middle text-[var(--fx-text)]",
                    column.align === "right" ? "text-right" : "",
                    column.align === "center" ? "text-center" : "",
                    column.cellClassName,
                  )}
                >
                  {row[column.key]}
                </td>
              ))}
            </tr>
          ))
        ) : (
          <tr>
            <td className="px-[16px] py-[16px] text-[var(--fx-text-muted)]" colSpan={columns.length}>
              {emptyMessage}
            </td>
          </tr>
        )}
      </tbody>
    );
  }

  if (stickyHeader) {
    return (
      <div className={cn(`flex h-full min-h-0 w-full min-w-0 flex-col overflow-hidden border ${FX_COLORS.border} ${FX_RADIUS.sm} bg-[var(--fx-surface)]`, className)}>
        <div className="shrink-0 overflow-hidden">
          <table className="w-full table-fixed border-collapse">
            {renderHeader()}
          </table>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
          <table className="w-full table-fixed border-collapse">
            {renderBody()}
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(`w-full min-w-0 overflow-hidden border ${FX_COLORS.border} ${FX_RADIUS.sm} bg-[var(--fx-surface)]`, className)}>
      <table className="w-full table-fixed border-collapse">
        {renderHeader()}
        {renderBody()}
      </table>
    </div>
  );
}
