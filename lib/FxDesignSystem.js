/*
lib/FxDesignSystem.js | Shared design-system showcase data | Sree | 2026-06-16
*/

import { FX_TYPOGRAPHY } from "@/lib/FxTheme";

export const DESIGN_SYSTEM_COLORS = [
  { name: "Background", label: "Background", variable: "--fx-bg", token: "--fx-bg", light: "#FFFFFF", dark: "#1E2430", usage: "App shell, page background", className: "bg-[var(--fx-bg)]" },
  { name: "Background Soft", label: "Background Soft", variable: "--fx-bg-soft", token: "--fx-bg-soft", light: "#F5F7FA", dark: "#262D3A", usage: "Outer app canvas, low-emphasis page background", className: "bg-[var(--fx-bg-soft)]" },
  { name: "Surface", label: "Surface", variable: "--fx-surface", token: "--fx-surface", light: "#FFFFFF", dark: "#262D3A", usage: "Cards, tables, panels", className: "bg-[var(--fx-surface)]" },
  { name: "Surface Subtle", label: "Surface Subtle", variable: "--fx-surface-subtle", token: "--fx-surface-subtle", light: "#F7F9FC", dark: "#283140", usage: "Soft helper surfaces and secondary grouping", className: "bg-[var(--fx-surface-subtle)]" },
  { name: "Surface Raised", label: "Surface Raised", variable: "--fx-surface-raised", token: "--fx-surface-raised", light: "#FAFBFD", dark: "#313948", usage: "Sheets, dialogs, dropdowns", className: "bg-[var(--fx-surface-raised)]" },
  { name: "Table Header", label: "Table Header", variable: "--fx-table-header", token: "--fx-table-header", light: "#F6F8FB", dark: "#2D3544", usage: "Table header rows", className: "bg-[var(--fx-table-header)]" },
  { name: "Table Row Alt", label: "Table Row Alt", variable: "--fx-table-row-alt", token: "--fx-table-row-alt", light: "#F9FBFD", dark: "#293140", usage: "Alternate table rows", className: "bg-[var(--fx-table-row-alt)]" },
  { name: "Surface Hover", label: "Surface Hover", variable: "--fx-surface-hover", token: "--fx-surface-hover", light: "#EEF2F7", dark: "#394354", usage: "Hover states", className: "bg-[var(--fx-surface-hover)]" },
  { name: "Surface Selected", label: "Surface Selected", variable: "--fx-surface-selected", token: "--fx-surface-selected", light: "#E0ECFF", dark: "#445066", usage: "Selected rows, active navigation", className: "bg-[var(--fx-surface-selected)]" },
  { name: "Text", label: "Text", variable: "--fx-text", token: "--fx-text", light: "#0F172A", dark: "#F3F4F6", usage: "Main text", className: "bg-[var(--fx-text)]" },
  { name: "Text Muted", label: "Text Muted", variable: "--fx-text-muted", token: "--fx-text-muted", light: "#64748B", dark: "#A8B0BF", usage: "Secondary text", className: "bg-[var(--fx-text-muted)]" },
  { name: "Border", label: "Border", variable: "--fx-border", token: "--fx-border", light: "#D6DEE8", dark: "#546173", usage: "Dividers, outlines", className: "bg-[var(--fx-border)]" },
  { name: "Primary", label: "Primary", variable: "--fx-primary", token: "--fx-primary", light: "#2563EB", dark: "#3B82F6", usage: "Primary actions, active links", className: "bg-[var(--fx-primary)]" },
  { name: "Success", label: "Success", variable: "--fx-success", token: "--fx-success", light: "#16A34A", dark: "#22C55E", usage: "Success states", className: "bg-[var(--fx-success)]" },
  { name: "Warning", label: "Warning", variable: "--fx-warning", token: "--fx-warning", light: "#D97706", dark: "#F59E0B", usage: "Warning states", className: "bg-[var(--fx-warning)]" },
  { name: "Danger", label: "Danger", variable: "--fx-danger", token: "--fx-danger", light: "#DC2626", dark: "#EF4444", usage: "Error/destructive states", className: "bg-[var(--fx-danger)]" },
];

export const DESIGN_SYSTEM_TYPOGRAPHY = [
  { name: "Page Title", sample: "Design System", token: FX_TYPOGRAPHY.pageTitle, source: "FX_TYPOGRAPHY.pageTitle" },
  { name: "Section Title", sample: "Visual primitives", token: FX_TYPOGRAPHY.sectionTitle, source: "FX_TYPOGRAPHY.sectionTitle" },
  { name: "Card Title", sample: "Active jobs", token: FX_TYPOGRAPHY.cardTitle, source: "FX_TYPOGRAPHY.cardTitle" },
  { name: "Body", sample: "Shared components for scanning and repeated action.", token: FX_TYPOGRAPHY.body, source: "FX_TYPOGRAPHY.body" },
  { name: "Field Label", sample: "Company Name", token: FX_TYPOGRAPHY.fieldLabel, source: "FX_TYPOGRAPHY.fieldLabel" },
  { name: "Field Hint", sample: "Used below forms and controls.", token: FX_TYPOGRAPHY.fieldHint, source: "FX_TYPOGRAPHY.fieldHint" },
  { name: "Button", sample: "Primary action", token: FX_TYPOGRAPHY.button, source: "FX_TYPOGRAPHY.button" },
  { name: "Table Header", sample: "Job Title", token: FX_TYPOGRAPHY.tableHeader, source: "FX_TYPOGRAPHY.tableHeader" },
  { name: "Table Cell", sample: "Senior Frontend Engineer", token: FX_TYPOGRAPHY.tableCell, source: "FX_TYPOGRAPHY.tableCell" },
];
