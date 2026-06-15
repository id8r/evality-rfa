/*
components/FxLandingPage.js | Landing page auth surface | Sree | 2026-06-13
*/

/* - - - - - - - - - - - - - - - - */

"use client";

import { useState } from "react";

import { FxAuthDialog } from "@/components/FxAuthDialog";
import { FxButton } from "@/components/FxButton";
import { FxHeader } from "@/components/FxHeader";
import { LANDING_COPY } from "@/lib/FxCopy";
import { FX_COLORS, FX_LAYOUT, FX_RADIUS, FX_SHADOW, FX_SPACE, FX_SURFACE, FX_TYPOGRAPHY } from "@/lib/FxTheme";

function SectionTitle({ eyebrow, title, body, align = "center" }) {
  const alignClass = align === "left" ? "items-start text-left" : "items-center text-center";

  return (
    <div className={`flex flex-col ${FX_SPACE.GAP_8} ${alignClass}`}>
      <span className={`${FX_TYPOGRAPHY.metaLabel} uppercase tracking-[0.16em] ${FX_COLORS.primaryText}`}>{eyebrow}</span>
      <h2 className={`${FX_TYPOGRAPHY.sectionTitle} text-[var(--fx-text)]`}>{title}</h2>
      {body ? <p className={`${FX_TYPOGRAPHY.sectionSubtitle} max-w-[720px] ${FX_SURFACE.mutedText}`}>{body}</p> : null}
    </div>
  );
}

function ProductFrame({ children, className = "" }) {
  return (
    <div className={`overflow-hidden ${FX_SURFACE.card} ${FX_RADIUS.lg} ${FX_SHADOW.card} ${className}`}>
      {children}
    </div>
  );
}

function SectionShell({ alt = false, children, className = "", ...props }) {
  return (
    <section className={`${alt ? "bg-[var(--fx-bg-soft)]/70" : "bg-[var(--fx-bg)]"} py-[96px]`} {...props}>
      <div className={`mx-auto w-full ${FX_LAYOUT.siteContainer} ${className}`}>{children}</div>
    </section>
  );
}

function MockWindowHeader({ label, status }) {
  return (
    <div className={`flex items-center justify-between border-b ${FX_COLORS.border} ${FX_SURFACE.raised} px-[16px] py-[12px]`}>
      <div className="flex items-center gap-[12px]">
        <div className="flex items-center gap-[6px]">
          <span className="h-[10px] w-[10px] rounded-full bg-[var(--fx-danger)]/70" />
          <span className="h-[10px] w-[10px] rounded-full bg-[var(--fx-warning)]/70" />
          <span className="h-[10px] w-[10px] rounded-full bg-[var(--fx-success)]/70" />
        </div>
        <span className={`${FX_TYPOGRAPHY.caption} tracking-[0.08em] uppercase ${FX_SURFACE.mutedText}`}>{label}</span>
      </div>
      <span className={`${FX_TYPOGRAPHY.metaLabel} rounded-full bg-[var(--fx-bg-soft)] px-[10px] py-[4px] text-[var(--fx-text-muted)]`}>{status}</span>
    </div>
  );
}

function JobsPreview() {
  const rows = LANDING_COPY.product.jobs.rows;
  const sidebarItems = LANDING_COPY.product.jobs.sidebarItems;

  return (
    <div className="grid gap-[16px] lg:grid-cols-[minmax(0,1.55fr)_minmax(280px,0.7fr)]">
      <div className="space-y-[16px]">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-[4px]">
            <span className={`${FX_TYPOGRAPHY.caption} uppercase tracking-[0.16em] ${FX_SURFACE.mutedText}`}>{LANDING_COPY.product.jobs.title}</span>
            <span className={`${FX_TYPOGRAPHY.cardTitle} text-[var(--fx-text)]`}>Jobs</span>
          </div>
          <span className={`${FX_TYPOGRAPHY.button} ${FX_COLORS.primaryText}`}>{LANDING_COPY.product.jobs.cta}</span>
        </div>

        <div className={`overflow-hidden border ${FX_COLORS.border} ${FX_RADIUS.lg}`}>
          <div className={`grid grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)_minmax(0,0.8fr)] ${FX_SURFACE.raised} border-b ${FX_COLORS.border} px-[16px] py-[12px]`}>
            <span className={`${FX_TYPOGRAPHY.tableHeader} normal-case tracking-[0.04em] text-[var(--fx-text-muted)]`}>Job</span>
            <span className={`${FX_TYPOGRAPHY.tableHeader} normal-case tracking-[0.04em] text-[var(--fx-text-muted)]`}>Candidates</span>
            <span className={`${FX_TYPOGRAPHY.tableHeader} normal-case tracking-[0.04em] text-[var(--fx-text-muted)] text-right`}>Status</span>
          </div>
          <div className="divide-y divide-[var(--fx-border)]">
            {rows.map((row) => (
              <div key={row.title} className="grid grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)_minmax(0,0.8fr)] px-[16px] py-[14px] hover:bg-[var(--fx-bg-soft)]/70 transition-colors">
                <div className="min-w-0">
                  <div className={`${FX_TYPOGRAPHY.clickableData} truncate text-[var(--fx-text)]`}>{row.title}</div>
                  <div className={`${FX_TYPOGRAPHY.caption} truncate ${FX_SURFACE.mutedText}`}>{row.count}</div>
                </div>
                <div className="min-w-0">
                  <div className={`${FX_TYPOGRAPHY.tableCell} truncate text-[var(--fx-text)]`}>{row.detail}</div>
                  <div className={`${FX_TYPOGRAPHY.caption} truncate ${FX_SURFACE.mutedText}`}>Shared with client teams</div>
                </div>
                <div className="flex items-center justify-end">
                  <span className={`${FX_TYPOGRAPHY.metaLabel} rounded-full border border-[var(--fx-border)] bg-[var(--fx-bg-soft)] px-[10px] py-[4px] text-[var(--fx-text)]`}>
                    {row.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <aside className={`flex flex-col justify-between gap-[16px] border ${FX_COLORS.border} ${FX_RADIUS.lg} ${FX_SURFACE.raised} p-[16px]`}>
        <div className={`flex items-center justify-between border-b ${FX_COLORS.border} pb-[12px]`}>
          <span className={`${FX_TYPOGRAPHY.dropdownHeader} normal-case tracking-[0.04em] text-[var(--fx-text-muted)]`}>
            {LANDING_COPY.product.jobs.sidebarTitle}
          </span>
          <span className={`${FX_TYPOGRAPHY.metaLabel} rounded-full bg-[var(--fx-primary)]/10 px-[10px] py-[4px] text-[var(--fx-primary)]`}>
            {LANDING_COPY.product.jobs.sidebarBadge}
          </span>
        </div>

        <div className="space-y-[12px]">
          {sidebarItems.map((item) => (
            <div key={item.label} className={`rounded-[12px] border ${FX_COLORS.border} bg-[var(--fx-surface)] p-[12px]`}>
              <div className="flex items-center justify-between gap-[12px]">
                <span className={`${FX_TYPOGRAPHY.metaLabel} uppercase tracking-[0.12em] ${item.accent === "amber" ? "text-[var(--fx-warning)]" : "text-[var(--fx-primary)]"}`}>
                  {item.label}
                </span>
                <span className={`${FX_TYPOGRAPHY.caption} ${FX_SURFACE.mutedText}`}>{item.meta}</span>
              </div>
              <p className={`${FX_TYPOGRAPHY.small} mt-[8px] ${FX_COLORS.text}`}>{item.body}</p>
            </div>
          ))}
        </div>

        <div className={`rounded-[12px] border ${FX_COLORS.border} bg-[var(--fx-bg-soft)] px-[12px] py-[10px]`}>
          <p className={`${FX_TYPOGRAPHY.caption} ${FX_SURFACE.mutedText}`}>{LANDING_COPY.product.jobs.footer}</p>
        </div>
      </aside>
    </div>
  );
}

function CandidatesPreview() {
  return (
    <div className="space-y-[12px]">
      <span className={`${FX_TYPOGRAPHY.caption} uppercase tracking-[0.16em] ${FX_SURFACE.mutedText}`}>{LANDING_COPY.product.candidates.title}</span>
      <div className="space-y-[12px]">
        {LANDING_COPY.product.candidates.rows.map((row) => (
          <div key={row.name} className={`flex items-center justify-between gap-[16px] rounded-[12px] border ${FX_COLORS.border} bg-[var(--fx-surface)] p-[14px]`}>
            <div className="min-w-0">
              <div className={`${FX_TYPOGRAPHY.clickableData} truncate text-[var(--fx-text)]`}>{row.name}</div>
              <div className={`${FX_TYPOGRAPHY.caption} truncate ${FX_SURFACE.mutedText}`}>{row.meta}</div>
            </div>
            <span className={`${FX_TYPOGRAPHY.button} whitespace-nowrap ${FX_COLORS.primaryText}`}>{row.action}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function WorkspacePreview() {
  return (
    <div className="grid gap-[12px] sm:grid-cols-3">
      {LANDING_COPY.product.workspace.cards.map((card) => (
        <div key={card.name} className={`rounded-[12px] border ${FX_COLORS.border} bg-[var(--fx-surface)] p-[16px]`}>
          <div className={`${FX_TYPOGRAPHY.cardTitle} text-[var(--fx-text)]`}>{card.name}</div>
          <p className={`${FX_TYPOGRAPHY.cardSubtitle} mt-[6px] ${FX_SURFACE.mutedText}`}>{card.body}</p>
        </div>
      ))}
    </div>
  );
}

function ActionCenterPreview() {
  return (
    <div className="space-y-[12px]">
      {LANDING_COPY.product.actionCenter.items.map((item) => (
        <div
          key={item.body}
          className={`flex items-center justify-between gap-[16px] rounded-[12px] border ${FX_COLORS.border} ${
            item.tone === "amber" ? "bg-[var(--fx-warning)]/[0.08]" : "bg-[var(--fx-primary)]/[0.08]"
          } p-[14px]`}
        >
          <p className={`${FX_TYPOGRAPHY.body} min-w-0 flex-1 ${FX_COLORS.text}`}>{item.body}</p>
          <span className={`${FX_TYPOGRAPHY.button} whitespace-nowrap ${FX_COLORS.primaryText}`}>{item.action}</span>
        </div>
      ))}
    </div>
  );
}

export function FxLandingPage() {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authIntent, setAuthIntent] = useState("signup");
  const [activeTab, setActiveTab] = useState("jobs");

  function handleAuthOpen(intent = "signup") {
    setAuthIntent(intent);
    setIsAuthOpen(true);
  }

  return (
    <div className={`min-h-screen ${FX_SURFACE.page}`}>
      <FxHeader onAuthOpen={handleAuthOpen} />

      <main className="flex flex-col pt-[96px] pb-[96px]">
        <SectionShell className="grid items-center gap-[48px] lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
          <div className="space-y-[24px]">
            <div className={`inline-flex items-center rounded-full border ${FX_COLORS.border} bg-[var(--fx-bg-soft)] px-[12px] py-[6px]`}>
              <span className={`${FX_TYPOGRAPHY.metaLabel} uppercase tracking-[0.16em] ${FX_COLORS.primaryText}`}>{LANDING_COPY.hero.eyebrow}</span>
            </div>

            <h1 className={`${FX_TYPOGRAPHY.hero} max-w-[10ch] whitespace-pre-line text-[var(--fx-text)]`}>
              {LANDING_COPY.hero.headline}
            </h1>

            <p className={`${FX_TYPOGRAPHY.bodyLg} max-w-[56ch] ${FX_SURFACE.mutedText}`}>{LANDING_COPY.hero.tagline}</p>

            <div className="flex flex-wrap items-center gap-[16px] pt-[8px]">
              <FxButton className="rounded-full px-[28px]" size="lg" onClick={() => handleAuthOpen("signup")}>
                {LANDING_COPY.hero.cta}
              </FxButton>
            </div>

            <p className={`${FX_TYPOGRAPHY.small} ${FX_SURFACE.mutedText}`}>{LANDING_COPY.hero.trust}</p>
          </div>

          <ProductFrame className="bg-[var(--fx-surface)]">
            <MockWindowHeader label="Evality Workspace Preview" status="Live workspace" />
            <div className="p-[20px]">
              <div className="grid gap-[16px] lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
                <div className="space-y-[16px]">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-[4px]">
                      <span className={`${FX_TYPOGRAPHY.caption} uppercase tracking-[0.16em] ${FX_SURFACE.mutedText}`}>Jobs</span>
                      <span className={`${FX_TYPOGRAPHY.cardTitle} text-[var(--fx-text)]`}>Senior Frontend Engineer</span>
                    </div>
                    <span className={`${FX_TYPOGRAPHY.metaLabel} rounded-full bg-[var(--fx-primary)]/10 px-[10px] py-[4px] text-[var(--fx-primary)]`}>
                      Published
                    </span>
                  </div>

                  <div className={`overflow-hidden rounded-[12px] border ${FX_COLORS.border}`}>
                    <div className={`grid grid-cols-[1.1fr_0.9fr] border-b ${FX_COLORS.border} bg-[var(--fx-bg-soft)] px-[14px] py-[10px]`}>
                      <span className={`${FX_TYPOGRAPHY.tableHeader} normal-case tracking-[0.04em] text-[var(--fx-text-muted)]`}>Pipeline</span>
                      <span className={`${FX_TYPOGRAPHY.tableHeader} normal-case tracking-[0.04em] text-[var(--fx-text-muted)] text-right`}>Count</span>
                    </div>
                    {[
                      ["Unscreened", "12"],
                      ["Pre-Screened", "8"],
                      ["Shortlisted", "4"],
                      ["Sent to Client", "2"],
                    ].map(([label, value]) => (
                      <div key={label} className="grid grid-cols-[1.1fr_0.9fr] px-[14px] py-[10px]">
                        <span className={`${FX_TYPOGRAPHY.tableCell} text-[var(--fx-text)]`}>{label}</span>
                        <span className={`${FX_TYPOGRAPHY.clickableData} text-right text-[var(--fx-text)]`}>{value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <aside className={`space-y-[12px] rounded-[12px] border ${FX_COLORS.border} bg-[var(--fx-bg-soft)] p-[16px]`}>
                  <div className="flex items-center justify-between">
                    <span className={`${FX_TYPOGRAPHY.dropdownHeader} normal-case tracking-[0.04em] text-[var(--fx-text-muted)]`}>
                      {LANDING_COPY.product.jobs.sidebarTitle}
                    </span>
                    <span className={`${FX_TYPOGRAPHY.metaLabel} text-[var(--fx-primary)]`}>{LANDING_COPY.product.jobs.sidebarBadge}</span>
                  </div>
                  <div className="space-y-[10px]">
                    {LANDING_COPY.product.jobs.sidebarItems.map((item) => (
                      <div key={item.label} className={`rounded-[10px] border ${FX_COLORS.border} bg-[var(--fx-surface)] p-[12px]`}>
                        <div className="flex items-center justify-between gap-[12px]">
                          <span
                            className={`${FX_TYPOGRAPHY.metaLabel} uppercase tracking-[0.12em] ${
                              item.accent === "amber" ? "text-[var(--fx-warning)]" : "text-[var(--fx-primary)]"
                            }`}
                          >
                            {item.label}
                          </span>
                          <span className={`${FX_TYPOGRAPHY.caption} ${FX_SURFACE.mutedText}`}>{item.meta}</span>
                        </div>
                        <p className={`${FX_TYPOGRAPHY.small} mt-[8px] ${FX_COLORS.text}`}>{item.body}</p>
                      </div>
                    ))}
                  </div>
                </aside>
              </div>
            </div>
          </ProductFrame>
        </SectionShell>

        <SectionShell id="problem" alt>
          <SectionTitle
            align="center"
            eyebrow={LANDING_COPY.problem.eyebrow}
            title={LANDING_COPY.problem.title}
            body={LANDING_COPY.problem.body}
          />

          <div className="mt-[32px] flex flex-wrap justify-center gap-[12px]">
            {LANDING_COPY.problem.chips.map((chip) => (
              <span
                key={chip}
                className={`rounded-full border ${FX_COLORS.border} bg-[var(--fx-surface)] px-[16px] py-[10px] ${FX_TYPOGRAPHY.button} text-[var(--fx-text-muted)]`}
              >
                {chip}
              </span>
            ))}
          </div>
        </SectionShell>

        <SectionShell id="workflow">
          <SectionTitle
            align="center"
            eyebrow={LANDING_COPY.workflow.eyebrow}
            title={LANDING_COPY.workflow.title}
            body={LANDING_COPY.workflow.body}
          />

          <div className="mt-[40px] grid gap-[12px] sm:grid-cols-2 xl:grid-cols-7">
            {LANDING_COPY.workflow.steps.map((step) => (
              <div
                key={step.id}
                className={`rounded-[12px] border p-[16px] text-center ${
                  step.featured ? `border-[var(--fx-primary)] bg-[var(--fx-primary)]/[0.08]` : `${FX_COLORS.border} bg-[var(--fx-surface)]`
                }`}
              >
                <div className={`${FX_TYPOGRAPHY.stepCounter} ${step.featured ? "text-[var(--fx-primary)]" : FX_SURFACE.mutedText}`}>
                  {step.featured ? "07" : `0${LANDING_COPY.workflow.steps.indexOf(step) + 1}`}
                </div>
                <div className={`${FX_TYPOGRAPHY.cardTitle} mt-[8px] text-[var(--fx-text)]`}>{step.label}</div>
              </div>
            ))}
          </div>
        </SectionShell>

        <SectionShell id="product" alt>
            <SectionTitle
              align="center"
              eyebrow={LANDING_COPY.product.eyebrow}
              title={LANDING_COPY.product.title}
            />

            <div className="mt-[32px]">
              <div className={`mx-auto flex w-full max-w-[720px] items-center justify-center overflow-hidden rounded-full border ${FX_COLORS.border} bg-[var(--fx-surface)] p-[4px]`}>
                {Object.entries(LANDING_COPY.product.tabs).map(([key, label]) => {
                  const active = activeTab === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setActiveTab(key)}
                      className={`flex-1 rounded-full px-[16px] py-[8px] ${FX_TYPOGRAPHY.button} transition-colors ${
                        active ? `bg-[var(--fx-primary)] text-[var(--fx-primary-foreground)]` : `${FX_SURFACE.mutedText} hover:text-[var(--fx-text)]`
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>

              <ProductFrame className="mt-[20px] bg-[var(--fx-surface)]">
                <MockWindowHeader label="Evality Product Sandbox" status={`${LANDING_COPY.product.breadcrumbPrefix} ${activeTab}`} />
                <div className="p-[20px]">
                  {activeTab === "jobs" ? (
                    <JobsPreview />
                  ) : null}
                  {activeTab === "candidates" ? (
                    <CandidatesPreview />
                  ) : null}
                  {activeTab === "workspace" ? (
                    <WorkspacePreview />
                  ) : null}
                  {activeTab === "actionCenter" ? (
                    <ActionCenterPreview />
                  ) : null}
                </div>
              </ProductFrame>
            </div>
        </SectionShell>

        <SectionShell>
            <SectionTitle
              align="center"
              eyebrow={LANDING_COPY.ai.eyebrow}
              title={LANDING_COPY.ai.title}
            />

            <div className="mt-[32px] grid gap-[16px] md:grid-cols-2">
              {LANDING_COPY.ai.cards.map((card) => (
                <div key={card.title} className={`rounded-[12px] border ${FX_COLORS.border} bg-[var(--fx-surface)] p-[20px]`}>
                  <div className={`${FX_TYPOGRAPHY.cardTitle} text-[var(--fx-text)]`}>{card.title}</div>
                  <p className={`${FX_TYPOGRAPHY.cardSubtitle} mt-[8px] ${FX_SURFACE.mutedText}`}>{card.body}</p>
                </div>
              ))}
            </div>
        </SectionShell>

        <SectionShell id="audience" alt>
            <SectionTitle
              align="center"
              eyebrow={LANDING_COPY.audience.eyebrow}
              title={LANDING_COPY.audience.title}
            />

            <div className="mt-[32px] grid gap-[16px] md:grid-cols-3">
              {LANDING_COPY.audience.cards.map((card) => (
                <div key={card.title} className={`rounded-[12px] border ${FX_COLORS.border} bg-[var(--fx-surface)] p-[20px]`}>
                  <div className={`${FX_TYPOGRAPHY.cardTitle} text-[var(--fx-text)]`}>{card.title}</div>
                  <p className={`${FX_TYPOGRAPHY.cardSubtitle} mt-[8px] ${FX_SURFACE.mutedText}`}>{card.body}</p>
                </div>
              ))}
            </div>
        </SectionShell>

        <SectionShell>
            <SectionTitle
              align="center"
              eyebrow={LANDING_COPY.outcomes.eyebrow}
              title={LANDING_COPY.outcomes.title}
            />

            <div className="mt-[32px] grid gap-[16px] md:grid-cols-2">
              {LANDING_COPY.outcomes.items.map((item) => (
                <div key={item.title} className={`rounded-[12px] border ${FX_COLORS.border} bg-[var(--fx-surface)] p-[18px]`}>
                  <div className={`${FX_TYPOGRAPHY.cardTitle} text-[var(--fx-text)]`}>{item.title}</div>
                  <p className={`${FX_TYPOGRAPHY.cardSubtitle} mt-[8px] ${FX_SURFACE.mutedText}`}>{item.body}</p>
                </div>
              ))}
            </div>
        </SectionShell>

        <SectionShell id="pricing" alt>
            <SectionTitle
              align="center"
              eyebrow={LANDING_COPY.pricing.eyebrow}
              title={LANDING_COPY.pricing.title}
            />

            <div className="mt-[32px] grid gap-[16px] md:grid-cols-2">
              {LANDING_COPY.pricing.plans.map((plan, index) => (
                <div
                  key={plan.name}
                  className={`rounded-[16px] border p-[24px] ${
                    index === 1 ? "border-[var(--fx-primary)] bg-[var(--fx-primary)]/[0.04]" : `${FX_COLORS.border} bg-[var(--fx-surface)]`
                  }`}
                >
                  <div className="flex items-start justify-between gap-[16px]">
                    <div>
                      <div className={`${FX_TYPOGRAPHY.cardTitle} text-[var(--fx-text)]`}>{plan.name}</div>
                      <p className={`${FX_TYPOGRAPHY.caption} mt-[6px] ${FX_SURFACE.mutedText}`}>{plan.description}</p>
                    </div>
                    <span className={`${FX_TYPOGRAPHY.metaLabel} rounded-full border border-[var(--fx-border)] bg-[var(--fx-bg-soft)] px-[10px] py-[4px] text-[var(--fx-text-muted)]`}>
                      {plan.badge}
                    </span>
                  </div>

                  <div className="mt-[24px] flex items-end gap-[8px]">
                    <span className={`${FX_TYPOGRAPHY.display} text-[var(--fx-text)]`}>{plan.price}</span>
                    <span className={`${FX_TYPOGRAPHY.caption} pb-[6px] ${FX_SURFACE.mutedText}`}>{plan.footnote}</span>
                  </div>

                  <div className="mt-[24px]">
                    <FxButton className="w-full" size="md" variant={index === 1 ? "primary" : "outline"}>
                      {plan.cta}
                    </FxButton>
                  </div>
                </div>
              ))}
            </div>
        </SectionShell>

        <footer className={`${FX_LAYOUT.siteContainer} border-t ${FX_COLORS.border} pt-[24px]`}>
            <div className="flex flex-col gap-[16px] md:flex-row md:items-center md:justify-between">
              <p className={`${FX_TYPOGRAPHY.caption} ${FX_SURFACE.mutedText}`}>{LANDING_COPY.footer.copyright}</p>
              <div className="flex flex-wrap items-center gap-[16px]">
                {LANDING_COPY.footer.links.map((link) => (
                  <a
                    key={link}
                    href={link === "LinkedIn" ? "https://www.linkedin.com" : "#"}
                    className={`${FX_TYPOGRAPHY.button} ${FX_SURFACE.mutedText} transition-colors hover:text-[var(--fx-text)]`}
                    target={link === "LinkedIn" ? "_blank" : undefined}
                    rel={link === "LinkedIn" ? "noreferrer" : undefined}
                  >
                    {link}
                  </a>
                ))}
              </div>
            </div>
        </footer>
      </main>

      <FxAuthDialog open={isAuthOpen} onOpenChange={setIsAuthOpen} showTrigger={false} intent={authIntent} />
    </div>
  );
}

/* - - - - - - - - - - - - - - - - */
