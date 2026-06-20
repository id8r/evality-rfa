/*
lib/FxDesignSystem.js | Shared design-system showcase data | Sree | 2026-06-16
*/

import { FX_TYPOGRAPHY } from "@/lib/FxTheme";

export const DESIGN_SYSTEM_COLORS = [
  { name: "Background", label: "Background", variable: "--fx-bg", token: "--fx-bg", light: "#FFFFFF", dark: "#1E2430", usage: "App shell background", className: "bg-[var(--fx-bg)]" },
  { name: "Background Soft", label: "Background Soft", variable: "--fx-bg-soft", token: "--fx-bg-soft", light: "#F5F7FA", dark: "#202735", usage: "Outer app canvas, page background", className: "bg-[var(--fx-bg-soft)]" },
  { name: "Surface", label: "Surface", variable: "--fx-surface", token: "--fx-surface", light: "#FFFFFF", dark: "#262D3A", usage: "Cards, tables, panels, chrome", className: "bg-[var(--fx-surface)]" },
  { name: "Surface Subtle", label: "Surface Subtle", variable: "--fx-surface-subtle", token: "--fx-surface-subtle", light: "#F7F9FC", dark: "#283140", usage: "Soft helper surfaces and secondary grouping", className: "bg-[var(--fx-surface-subtle)]" },
  { name: "Surface Raised", label: "Surface Raised", variable: "--fx-surface-raised", token: "--fx-surface-raised", light: "#FAFBFD", dark: "#2B3443", usage: "Sheets, dialogs, dropdowns", className: "bg-[var(--fx-surface-raised)]" },
  { name: "Table Header", label: "Table Header", variable: "--fx-table-header", token: "--fx-table-header", light: "#F6F8FB", dark: "#2D3544", usage: "Table header rows", className: "bg-[var(--fx-table-header)]" },
  { name: "Table Row Alt", label: "Table Row Alt", variable: "--fx-table-row-alt", token: "--fx-table-row-alt", light: "#F9FBFD", dark: "#293140", usage: "Alternate table rows", className: "bg-[var(--fx-table-row-alt)]" },
  { name: "Surface Hover", label: "Surface Hover", variable: "--fx-surface-hover", token: "--fx-surface-hover", light: "#EEF2F7", dark: "#343F52", usage: "Hover states", className: "bg-[var(--fx-surface-hover)]" },
  { name: "Surface Selected", label: "Surface Selected", variable: "--fx-surface-selected", token: "--fx-surface-selected", light: "#E0ECFF", dark: "#334B73", usage: "Selected rows, active navigation", className: "bg-[var(--fx-surface-selected)]" },
  { name: "Text", label: "Text", variable: "--fx-text", token: "--fx-text", light: "#0F172A", dark: "#F3F4F6", usage: "Main text", className: "bg-[var(--fx-text)]" },
  { name: "Text Muted", label: "Text Muted", variable: "--fx-text-muted", token: "--fx-text-muted", light: "#64748B", dark: "#A8B0BF", usage: "Secondary text", className: "bg-[var(--fx-text-muted)]" },
  { name: "Border", label: "Border", variable: "--fx-border", token: "--fx-border", light: "#D6DEE8", dark: "#465366", usage: "Dividers, outlines", className: "bg-[var(--fx-border)]" },
  { name: "Primary", label: "Primary", variable: "--fx-primary", token: "--fx-primary", light: "#2060E8", dark: "#6C98FF", usage: "Primary actions, active links", className: "bg-[var(--fx-primary)]" },
  { name: "AI", label: "AI", variable: "--fx-ai", token: "--fx-ai", light: "#C737F0", dark: "#D06AF4", usage: "AI-specific accents and cues", className: "bg-[var(--fx-ai)]" },
  { name: "Success", label: "Success", variable: "--fx-success", token: "--fx-success", light: "#16A34A", dark: "#22C55E", usage: "Success states", className: "bg-[var(--fx-success)]" },
  { name: "Warning", label: "Warning", variable: "--fx-warning", token: "--fx-warning", light: "#D97706", dark: "#F59E0B", usage: "Warning states", className: "bg-[var(--fx-warning)]" },
  { name: "Danger", label: "Danger", variable: "--fx-danger", token: "--fx-danger", light: "#DC2626", dark: "#EF4444", usage: "Error/destructive states", className: "bg-[var(--fx-danger)]" },
];

export const DESIGN_SYSTEM_TYPOGRAPHY = [
  { name: "Nav Title", sample: "Jobs Workspace", token: FX_TYPOGRAPHY.navTitle, source: "FX_TYPOGRAPHY.navTitle", size: "24px", lh: "36px", weight: 600 },
  { name: "Page Title", sample: "Design System", token: FX_TYPOGRAPHY.pageTitle, source: "FX_TYPOGRAPHY.pageTitle", size: "28px", lh: "36px", weight: 600 },
  { name: "Workspace Title", sample: "Senior Frontend Engineer", token: FX_TYPOGRAPHY.workspaceTitle, source: "FX_TYPOGRAPHY.workspaceTitle", size: "24px", lh: "32px", weight: 600 },
  { name: "Workspace Subtitle", sample: "CV Match Score - DevOps Engineer", token: FX_TYPOGRAPHY.workspaceSubtitle, source: "FX_TYPOGRAPHY.workspaceSubtitle", size: "14px", lh: "22px", weight: 400 },
  { name: "Section Title", sample: "Visual primitives", token: FX_TYPOGRAPHY.sectionTitle, source: "FX_TYPOGRAPHY.sectionTitle", size: "20px", lh: "28px", weight: 600 },
  { name: "Card Title", sample: "Active jobs", token: FX_TYPOGRAPHY.cardTitle, source: "FX_TYPOGRAPHY.cardTitle", size: "16px", lh: "24px", weight: 600 },
  { name: "Sheet Title", sample: "Email Pre-Screening", token: FX_TYPOGRAPHY.sheetTitle, source: "FX_TYPOGRAPHY.sheetTitle", size: "16px", lh: "24px", weight: 600 },
  { name: "Sheet Subtitle", sample: "Candidate review and next-step workflow", token: FX_TYPOGRAPHY.sheetSubtitle, source: "FX_TYPOGRAPHY.sheetSubtitle", size: "13px", lh: "20px", weight: 400 },
  { name: "Dialog Title", sample: "Reject Candidate", token: FX_TYPOGRAPHY.dialogTitle, source: "FX_TYPOGRAPHY.dialogTitle", size: "20px", lh: "32px", weight: 600 },
  { name: "Dialog Subtitle", sample: "Add a short note before confirming this action.", token: FX_TYPOGRAPHY.dialogSubtitle, source: "FX_TYPOGRAPHY.dialogSubtitle", size: "14px", lh: "22px", weight: 400 },
  { name: "Body", sample: "Shared components for scanning and repeated action.", token: FX_TYPOGRAPHY.body, source: "FX_TYPOGRAPHY.body", size: "14px", lh: "22px", weight: 400 },
  { name: "Field Label", sample: "Company Name", token: FX_TYPOGRAPHY.fieldLabel, source: "FX_TYPOGRAPHY.fieldLabel", size: "13px", lh: "20px", weight: 400 },
  { name: "Field Hint", sample: "Used below forms and controls.", token: FX_TYPOGRAPHY.fieldHint, source: "FX_TYPOGRAPHY.fieldHint", size: "13px", lh: "20px", weight: 400 },
  { name: "Button", sample: "Primary action", token: FX_TYPOGRAPHY.button, source: "FX_TYPOGRAPHY.button", size: "14px", lh: "22px", weight: 500 },
  { name: "Meta Label", sample: "PUBLISHED", token: FX_TYPOGRAPHY.metaLabel, source: "FX_TYPOGRAPHY.metaLabel", size: "12px", lh: "18px", weight: 500 },
  { name: "Table Header", sample: "Job Title", token: FX_TYPOGRAPHY.tableHeader, source: "FX_TYPOGRAPHY.tableHeader", size: "13px", lh: "20px", weight: 500 },
  { name: "Table Cell", sample: "Senior Frontend Engineer", token: FX_TYPOGRAPHY.tableCell, source: "FX_TYPOGRAPHY.tableCell", size: "14px", lh: "22px", weight: 400 },
  { name: "Caption", sample: "Updated 2h ago", token: FX_TYPOGRAPHY.caption, source: "FX_TYPOGRAPHY.caption", size: "11px", lh: "16px", weight: 400 },
];
