/*
components/FxTable.js | Shared dense table primitive | Sree | 2026-06-13
*/

import { FX_COLORS, FX_RADIUS, FX_TYPOGRAPHY } from "@/lib/FxTheme";
import { cn } from "@/lib/FxUtils";

export function FxTable({ columns, rows, className, stickyHeader = false, emptyMessage = "No rows to display." }) {
  return (
    <div className={cn(`overflow-hidden border ${FX_COLORS.border} ${FX_RADIUS.sm} bg-[var(--fx-surface)]`, className)}>
      <table className="w-full table-fixed border-collapse">
        <thead className={`bg-[var(--fx-bg)] ${FX_TYPOGRAPHY.tableHeader}`}>
          <tr className={FX_COLORS.border}>
            {columns.map((column) => (
              <th
                key={column.key}
                className={cn(
                  "border-b border-[var(--fx-border)] px-[16px] py-[12px] text-left text-[var(--fx-text-muted)]",
                  stickyHeader ? "sticky top-0 z-[1] bg-[var(--fx-bg)]" : "",
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
        <tbody className="divide-y divide-[var(--fx-border)]">
          {rows.length ? (
            rows.map((row, rowIndex) => (
              <tr key={row.id ?? rowIndex} className="hover:bg-[var(--fx-bg-soft)]/70">
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={cn(
                      "px-[16px] py-[12px] align-middle text-[var(--fx-text)]",
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
              <td className="px-[16px] py-[20px] text-[var(--fx-text-muted)]" colSpan={columns.length}>
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
