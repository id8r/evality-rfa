/* app/app/candidates/[candidateId]/page.js | Candidate workspace shell | Sree | 2026-06-14 */

"use client";

import Link from "next/link";
import React from "react";
import { ArrowLeft } from "lucide-react";

import { fxButtonClassName } from "@/components/FxButton";
import { FxProtectedAppPage } from "@/components/FxProtectedAppPage";
import { ROUTES } from "@/lib/FxConstants";
import { findStoredCandidate, findStoredJob } from "@/lib/FxStore";
import { FX_COLORS, FX_LAYOUT, FX_TYPOGRAPHY } from "@/lib/FxTheme";

function MetaField({ label, value }) {
  return (
    <div className="space-y-[4px]">
      <p className={`${FX_TYPOGRAPHY.fieldHint} text-[var(--fx-text-muted)]`}>{label}</p>
      <p className={FX_TYPOGRAPHY.body}>{value}</p>
    </div>
  );
}

function formatCurrency(value) {
  if (value == null || value === "") {
    return "—";
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);
  }

  return String(value);
}

function formatAvailability(value) {
  if (value == null || value === "") {
    return "—";
  }

  const dayCount = Number(value);

  if (Number.isNaN(dayCount)) {
    return String(value);
  }

  return `${dayCount} day${dayCount === 1 ? "" : "s"}`;
}

export default function CandidateWorkspacePage({ params }) {
  const { candidateId } = React.use(params);
  const candidate = findStoredCandidate(candidateId);
  const job = candidate?.jobId ? findStoredJob(candidate.jobId) : null;

  return (
    <FxProtectedAppPage
      pageId="candidates"
      title={false}
      navbarLeading={
        <Link href={ROUTES.CANDIDATES} className={`inline-flex items-center gap-[8px] ${FX_TYPOGRAPHY.button} text-foreground hover:text-[var(--fx-text)]`}>
          <ArrowLeft className="size-[16px]" />
          All Candidates
        </Link>
      }
    >
      <section className={`${FX_LAYOUT.contentWidthWide} flex h-full min-h-0 w-full min-w-0 flex-1 flex-col gap-[24px]`}>
        {candidate ? (
          <>
            <div className={`rounded-[16px] border ${FX_COLORS.border} bg-[var(--fx-surface)] p-[24px]`}>
              <div className="flex flex-col gap-[16px] lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-[8px]">
                  <p className={`${FX_TYPOGRAPHY.fieldHint} text-[var(--fx-text-muted)]`}>Candidate Workspace</p>
                  <h1 className={FX_TYPOGRAPHY.h3}>{candidate.name}</h1>
                  <p className={`${FX_TYPOGRAPHY.body} text-[var(--fx-text-muted)]`}>
                    {candidate.email} · {candidate.phone}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-[8px]">
                  <span className="rounded-full bg-[var(--fx-surface-selected)] px-[10px] py-[4px] text-[12px] font-medium text-[var(--fx-primary)]">
                    {candidate.matchScore != null ? `${candidate.matchScore}% match` : "Match unavailable"}
                  </span>
                  {job ? (
                    <Link href={ROUTES.JOB(job.id)} className={fxButtonClassName({ variant: "ghost", size: "sm" })}>
                      Open Job
                    </Link>
                  ) : null}
                </div>
              </div>

              <div className="mt-[20px] grid gap-[16px] sm:grid-cols-2 lg:grid-cols-4">
                <MetaField label="Job" value={candidate.jobTitle || job?.title || "—"} />
                <MetaField label="Status" value={candidate.status} />
                <MetaField label="Availability" value={formatAvailability(candidate.availabilityDays)} />
                <MetaField label="Current Salary" value={formatCurrency(candidate.currentSalary)} />
                <MetaField label="Expected Salary" value={formatCurrency(candidate.expectedSalary)} />
                <MetaField label="Source" value={candidate.uploadedBy || "—"} />
              </div>
            </div>

            <div className="grid gap-[16px] lg:grid-cols-3">
              <section className={`rounded-[16px] border ${FX_COLORS.border} bg-[var(--fx-surface)] p-[20px]`}>
                <h2 className={FX_TYPOGRAPHY.cardTitle}>Profile</h2>
                <p className={`${FX_TYPOGRAPHY.body} mt-[8px] text-[var(--fx-text-muted)]`}>
                  Candidate context, resume summary, and recruiter notes will live here.
                </p>
              </section>
              <section className={`rounded-[16px] border ${FX_COLORS.border} bg-[var(--fx-surface)] p-[20px]`}>
                <h2 className={FX_TYPOGRAPHY.cardTitle}>Match Summary</h2>
                <p className={`${FX_TYPOGRAPHY.body} mt-[8px] text-[var(--fx-text-muted)]`}>
                  Skill fit, missing signals, and AI reasoning will be shown here.
                </p>
              </section>
              <section className={`rounded-[16px] border ${FX_COLORS.border} bg-[var(--fx-surface)] p-[20px]`}>
                <h2 className={FX_TYPOGRAPHY.cardTitle}>Activity</h2>
                <p className={`${FX_TYPOGRAPHY.body} mt-[8px] text-[var(--fx-text-muted)]`}>
                  Candidate movement, comments, and screening history will appear here.
                </p>
              </section>
            </div>
          </>
        ) : (
          <section className={`rounded-[16px] border ${FX_COLORS.border} bg-[var(--fx-surface)] p-[24px]`}>
            <h1 className={FX_TYPOGRAPHY.h3}>Candidate not found</h1>
            <p className={`${FX_TYPOGRAPHY.body} mt-[8px] text-[var(--fx-text-muted)]`}>
              The requested candidate is not available in the current demo store.
            </p>
          </section>
        )}
      </section>
    </FxProtectedAppPage>
  );
}
