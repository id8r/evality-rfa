/* components/DesignSystemPage.js | Internal design system preview page aligned to FxDocs/Design_System.md | Sree | 2026-06-13 */

"use client";

import { FxThemeToggle } from "@/components/FxThemeToggle";
import { cn } from "@/lib/FxUtils";

const COLOR_TOKENS = [
  { name: "Primary", variable: "--fx-primary", light: "#2563EB", dark: "#3B82F6", usage: "Primary actions, active links" },
  { name: "Background", variable: "--fx-bg", light: "#FFFFFF", dark: "#1E2430", usage: "App shell, page background" },
  { name: "Surface", variable: "--fx-surface", light: "#FFFFFF", dark: "#262D3A", usage: "Cards, tables, panels" },
  { name: "Surface Raised", variable: "--fx-surface-raised", light: "#F8FAFC", dark: "#313948", usage: "Sheets, dialogs, dropdowns" },
  { name: "Surface Hover", variable: "--fx-surface-hover", light: "#F1F5F9", dark: "#394354", usage: "Hover states" },
  { name: "Surface Selected", variable: "--fx-surface-selected", light: "#E0ECFF", dark: "#445066", usage: "Selected rows, active navigation" },
  { name: "Border", variable: "--fx-border", light: "#E2E8F0", dark: "#434C5E", usage: "Dividers, outlines" },
  { name: "Text Primary", variable: "--fx-text", light: "#0F172A", dark: "#F3F4F6", usage: "Main text" },
  { name: "Text Secondary", variable: "--fx-text-muted", light: "#64748B", dark: "#A8B0BF", usage: "Secondary text" },
  { name: "Text Disabled", variable: "--fx-text-disabled", light: "#94A3B8", dark: "#6B7280", usage: "Disabled controls and text" },
  { name: "Success", variable: "--fx-success", light: "#16A34A", dark: "#22C55E", usage: "Success states" },
  { name: "Warning", variable: "--fx-warning", light: "#D97706", dark: "#F59E0B", usage: "Warning states" },
  { name: "Danger", variable: "--fx-danger", light: "#DC2626", dark: "#EF4444", usage: "Error/destructive states" }
];

const TYPE_SCALE = [
  { token: "Display", size: "36px", lh: "44px", weight: "600", sample: "High-Density AI Sourcing", usage: "Landing sections, major headers" },
  { token: "H1", size: "28px", lh: "36px", weight: "600", sample: "Job Pipeline Workspace", usage: "Page titles" },
  { token: "H2", size: "24px", lh: "32px", weight: "600", sample: "Section Title Header", usage: "Section titles" },
  { token: "H3", size: "20px", lh: "28px", weight: "600", sample: "Subsection Category", usage: "Subsections" },
  { token: "Title", size: "16px", lh: "24px", weight: "600", sample: "Recent Submissions Matrix", usage: "Card titles, dialog titles" },
  { token: "Body", size: "14px", lh: "22px", weight: "400", sample: "High density structural layers allow quick evaluation patterns across long table streams.", usage: "Default text" },
  { token: "Body Medium", size: "14px", lh: "22px", weight: "500", sample: "Clickable Data Item Row", usage: "Clickable data, emphasized body text" },
  { token: "Label", size: "13px", lh: "20px", weight: "500", sample: "Primary Field Label Input", usage: "Form labels" },
  { token: "Helper", size: "12px", lh: "18px", weight: "400", sample: "Validation verification log error description", usage: "Helper text, validation text" },
  { token: "Meta", size: "12px", lh: "18px", weight: "500", sample: "JOB-402 REFERENCE", usage: "Table headers, metadata, chips" },
  { token: "Caption", size: "11px", lh: "16px", weight: "400", sample: "Updated 2 mins ago via system channel", usage: "Tiny metadata, timestamps" }
];

export function DesignSystemPage() {
  return (
    <div className="min-h-screen bg-[var(--fx-bg)] text-[var(--fx-text)] antialiased transition-colors duration-150 select-text selection:bg-[var(--fx-surface-selected)]">
      <header className="border-b border-[var(--fx-border)] px-6 py-4 max-w-[1440px] mx-auto flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs font-bold text-[var(--fx-text)] tracking-tight">Evality AI</span>
            <span className="font-mono text-[11px] bg-[var(--fx-surface-hover)] text-[var(--fx-text-muted)] px-2 py-0.5 rounded border border-[var(--fx-border)]">Design System v1.1</span>
            <span className="font-mono text-[11px] bg-[var(--fx-success)]/10 text-[var(--fx-success)] px-2 py-0.5 rounded">Approved Spec</span>
          </div>
          <p className="font-mono text-xs text-[var(--fx-text-disabled)] mt-1 uppercase tracking-wider">Visual Token Reference & Interface Elements Sandbox</p>
        </div>
        <FxThemeToggle />
      </header>

      <main className="max-w-[1440px] mx-auto p-6 grid grid-cols-1 xl:grid-cols-4 gap-8">
        <div className="xl:col-span-1 space-y-6 font-mono text-xs text-[var(--fx-text-disabled)] tracking-normal">

          <div className="border border-[var(--fx-border)] rounded-xl p-5 space-y-4 bg-[var(--fx-surface)]">
            <div className="text-[var(--fx-text-muted)] font-bold uppercase tracking-wider">// Structural Guardrails</div>
            <div className="space-y-2">
              <p>• Max Content Width: <span className="text-[var(--fx-text)] font-semibold">1440px</span></p>
              <p>• Grid Pattern: <span className="text-[var(--fx-text)] font-semibold">8px Increments</span></p>
              <p>• Input & Button Radius: <span className="text-[var(--fx-text)] font-semibold">6px Strict</span></p>
              <p>• Container Radii: <span className="text-[var(--fx-text)] font-semibold">8px / 12px / 16px</span></p>
            </div>
          </div>

          <div className="border border-[var(--fx-border)] rounded-xl p-5 space-y-3 bg-[var(--fx-surface)]">
            <div className="text-[var(--fx-text-muted)] font-bold uppercase tracking-wider">// Philosophy Strategy</div>
            <p className="text-[var(--fx-text-muted)] leading-relaxed font-sans text-xs">
              High information density UI explicitly optimized for recruiter parsing speeds. Eliminate extraneous shadows, complex gradients, or exaggerated border roundings that delay layout rendering and workflows.
            </p>
          </div>

          <div className="border border-[var(--fx-border)] rounded-xl p-5 space-y-2 bg-[var(--fx-surface)]">
            <div className="text-[var(--fx-text-muted)] font-bold uppercase tracking-wider">// Architecture Tokens</div>
            <div className="space-y-1 text-[11px]">
              <p>📁 app/globals.css</p>
              <p>📁 lib/FxTheme.js</p>
              <p>📁 lib/FxConstants.js</p>
              <p>📁 components/FxThemeToggle.js</p>
            </div>
          </div>

        </div>

        {/* MAIN CONTROLS WORKSPACE */}
        <div className="xl:col-span-3 space-y-10">

          {/* OVERVIEW ZONE HEADER */}
          <div className="border border-[var(--fx-border)] rounded-xl p-5 bg-[var(--fx-surface)] flex justify-between items-center">
            <div className="font-mono">
              <div className="text-[var(--fx-text-disabled)] font-bold text-[11px] uppercase tracking-wider">// Internal Reference Route: /ds</div>
              <h2 className="text-sm font-semibold text-[var(--fx-text)] mt-1 tracking-tight">Visual Verification Showcase Workspace</h2>
              <p className="text-[11px] text-[var(--fx-text-muted)] mt-1 font-sans">
                Absolute single source-of-truth remains strict within <code className="font-mono text-[10px] bg-[var(--fx-surface-hover)] px-1 py-0.5 rounded">Design_System.md</code>. Visual targets here match structural layouts.
              </p>
            </div>
            <span className="font-mono text-[10px] text-[var(--fx-text-muted)] bg-[var(--fx-surface-hover)] px-2 py-0.5 rounded border border-[var(--fx-border)]">
              Token Active Environment
            </span>
          </div>

          {/* 01. COMPLETE HEX ARCHITECTURE MAPPING MATRIX */}
          <section className="space-y-4">
            <div className="font-mono">
              <span className="text-[11px] text-[var(--fx-text-disabled)] font-bold uppercase tracking-wider block">// 01 . Complete Hex Architecture Mapping Matrix</span>
              <h4 className="text-xs text-[var(--fx-text-muted)] mt-0.5">Dual circular swatches showing light and dark alignments side-by-side.</h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {COLOR_TOKENS.map((token) => (
                <div
                  key={token.variable}
                  className="flex flex-col justify-between p-4 bg-[var(--fx-surface)] border border-[var(--fx-border)] rounded-lg font-mono text-xs space-y-3"
                >
                  {/* Top: Metadata & Variables */}
                  <div className="space-y-1">
                    <div className="font-bold text-[var(--fx-text)] text-sm">{token.name}</div>
                    <div className="text-[11px] text-[var(--fx-text-disabled)] select-all">{token.variable}</div>
                    <div className="text-[11px] text-[var(--fx-text-muted)] font-sans leading-normal line-clamp-1">{token.usage}</div>
                  </div>

                  {/* Bottom: Twin Values and Split Palette Circles */}
                  <div className="flex items-center justify-between pt-2 border-t border-[var(--fx-border)]/60">
                    <div className="flex items-center gap-3 text-[11px]">
                      <div className="flex items-center gap-1">
                        <span className="text-[var(--fx-text-disabled)]">L:</span>
                        <span className="text-[var(--fx-text)] font-semibold select-all">{token.light}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-[var(--fx-text-disabled)]">D:</span>
                        <span className="text-[var(--fx-text)] font-semibold select-all">{token.dark}</span>
                      </div>
                    </div>

                    {/* Concentric Split Dual Color Circular Swatches */}
                    <div className="flex items-center shrink-0">
                      <div
                        className="w-4 h-8 rounded-l-full border-y border-l border-[var(--fx-border)]"
                        style={{ backgroundColor: token.light }}
                        title={`Light Theme: ${token.light}`}
                      />
                      <div
                        className="w-4 h-8 rounded-r-full border-y border-r border-[var(--fx-border)]"
                        style={{ backgroundColor: token.dark }}
                        title={`Dark Theme: ${token.dark}`}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 02. TYPOGRAPHY TOKEN ARCHITECTURE */}
          <section className="space-y-4">
            <div className="font-mono">
              <span className="text-[11px] text-[var(--fx-text-disabled)] font-bold uppercase tracking-wider block">// 02 . Typography Token Architecture</span>
              <h4 className="text-xs text-[var(--fx-text-muted)] mt-0.5">Scale properties map entirely onto standard application flow distributions.</h4>
            </div>

            <div className="border border-[var(--fx-border)] rounded-xl overflow-hidden bg-[var(--fx-surface)]">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[var(--fx-border)] bg-[var(--fx-surface-raised)] font-mono text-[11px] text-[var(--fx-text-muted)] h-10">
                      <th className="px-4 font-medium">Style Token</th>
                      <th className="px-4 font-medium">Size / Line Height</th>
                      <th className="px-4 font-medium">Weight</th>
                      <th className="px-4 font-medium">Visual Context Preview</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--fx-border)] text-[13px]">
                    {TYPE_SCALE.map((t) => (
                      <tr key={t.token} className="h-14 font-sans text-[var(--fx-text)]">
                        <td className="px-4 font-mono text-xs text-[var(--fx-text-muted)]">{t.token}</td>
                        <td className="px-4 font-mono text-xs text-[var(--fx-text-disabled)]">{t.size} / {t.lh}</td>
                        <td className="px-4 font-mono text-xs text-[var(--fx-text-disabled)]">{t.weight}</td>
                        <td className="px-4 pr-6 truncate max-w-xs sm:max-w-md md:max-w-xl" style={{ fontSize: t.size, lineHeight: t.lh, fontWeight: t.weight }}>
                          {t.sample}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* 03. REFINED SOURCING TABLES MATRIX */}
          <section className="space-y-4">
            <div className="font-mono">
              <span className="text-[11px] text-[var(--fx-text-disabled)] font-bold uppercase tracking-wider block">// 03 . Refined Sourcing Tables Matrix</span>
              <h4 className="text-xs text-[var(--fx-text-muted)] mt-0.5">Zebra layout footprints optimization rules under 1440px constraints.</h4>
            </div>

            <div className="border border-[var(--fx-border)] rounded-xl overflow-hidden bg-[var(--fx-surface)]">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="h-[48px] border-b border-[var(--fx-border)] bg-[var(--fx-surface-raised)] font-mono text-[11px] text-[var(--fx-text-muted)]">
                    <th className="px-4 font-medium">Job Identification</th>
                    <th className="px-4 font-medium">Target Title</th>
                    <th className="px-4 font-medium text-right">Total Applicants</th>
                  </tr>
                </thead>
                <tbody className="text-[14px] text-[var(--fx-text)]">
                  <tr className="h-[56px] border-b border-[var(--fx-border)] bg-[var(--fx-surface)]">
                    <td className="px-4 font-mono text-xs text-[var(--fx-text-muted)]">
                      <span className="inline-block w-2 h-2 rounded-full bg-[var(--fx-success)] mr-2" />JOB-402
                    </td>
                    <td className="px-4 font-medium text-[var(--fx-primary)] cursor-pointer hover:underline">Staff AI Sourcing Architect</td>
                    <td className="px-4 text-right font-mono text-xs text-[var(--fx-text-muted)]">248</td>
                  </tr>
                  <tr className="h-[56px] border-b border-[var(--fx-border)] bg-[var(--fx-surface-raised)]/40">
                    <td className="px-4 font-mono text-xs text-[var(--fx-text-muted)]">
                      <span className="inline-block w-2 h-2 rounded-full bg-[var(--fx-success)] mr-2" />JOB-193
                    </td>
                    <td className="px-4 font-medium text-[var(--fx-primary)] cursor-pointer hover:underline">Senior Infrastructure Engineer</td>
                    <td className="px-4 text-right font-mono text-xs text-[var(--fx-text-muted)]">142</td>
                  </tr>
                  <tr className="h-[56px] border-b border-[var(--fx-border)] bg-[var(--fx-surface)]">
                    <td className="px-4 font-mono text-xs text-[var(--fx-text-muted)]">
                      <span className="inline-block w-2 h-2 rounded-full bg-[var(--fx-warning)] mr-2" />JOB-082
                    </td>
                    <td className="px-4 font-medium text-[var(--fx-primary)] cursor-pointer hover:underline">Lead Frontend Architect</td>
                    <td className="px-4 text-right font-mono text-xs text-[var(--fx-text-muted)]">89</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* LIVE UI INTERACTIVE COMPONENTS PLACEHOLDER
            TODO: Once layouts, inputs, alerts, buttons, dialogs, sheets and interactive states are fully frozen
            by product guidelines, integrate components dynamically here matching the design system blueprint layers.
          */}

        </div>
      </main>
    </div>
  );
}
