/* app/app/jobs/[jobId]/page.js | Job workspace page backed by local store | Sree | 2026-06-14 */

"use client";

import Link from "next/link";
import React, { useMemo, useSyncExternalStore } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Users } from "lucide-react";

import { FxProtectedAppPage } from "@/components/FxProtectedAppPage";
import { FxTabs } from "@/components/FxTabs";
import { FxTable } from "@/components/FxTable";
import { ROUTES, WORKSPACE_TYPES } from "@/lib/FxConstants";
import { PAGE_COPY } from "@/lib/FxCopy";
import { findStoredCandidatesByJob, findStoredJob, readStoredWorkspaceType } from "@/lib/FxStore";
import { FX_COLORS, FX_LAYOUT, FX_RADIUS, FX_TYPOGRAPHY } from "@/lib/FxTheme";

const PIPELINE_TABS = [
  { value: "unscreened", label: "Unscreened" },
  { value: "screened", label: "Screened" },
  { value: "shortlisted", label: "Shortlisted" },
  { value: "shared", label: "Shared" },
  { value: "rejected", label: "Rejected" },
];

function normalizeJob(job) {
  if (!job) {
    return null;
  }

  return {
    ...job,
    status: job.status === "Published" ? "Published" : "Draft",
    positions: Number(job.positions) || 1,
  };
}

function normalizeCandidate(candidate) {
  if (!candidate) {
    return null;
  }

  return {
    ...candidate,
    status: candidate.status ?? "unscreened",
    matchScore: Number(candidate.matchScore) || null,
    availabilityDays: candidate.availabilityDays != null ? Number(candidate.availabilityDays) : null,
    currentSalary: candidate.currentSalary != null ? Number(candidate.currentSalary) : null,
    expectedSalary: candidate.expectedSalary != null ? Number(candidate.expectedSalary) : null,
  };
}

function formatRelativeTime(value) {
  if (!value) {
    return "Not set";
  }

  const timestamp = new Date(value).getTime();
  if (Number.isNaN(timestamp)) {
    return "Not set";
  }

  const diffMinutes = Math.max(0, Math.floor((Date.now() - timestamp) / 60000));

  if (diffMinutes < 60) {
    return `${Math.max(1, diffMinutes)} min ago`;
  }

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
  }

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
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

function Field({ label, value }) {
  return (
    <div className="space-y-[4px]">
      <p className={`${FX_TYPOGRAPHY.fieldHint} text-[var(--fx-text-muted)]`}>{label}</p>
      <p className={FX_TYPOGRAPHY.body}>{value}</p>
    </div>
  );
}

function WorkspaceEmptyState({ title, body }) {
  return (
    <div className={`flex h-full min-h-[320px] items-center justify-center border ${FX_COLORS.border} ${FX_RADIUS.sm} bg-[var(--fx-surface)] px-[24px] py-[24px]`}>
      <div className="max-w-[420px] space-y-[16px] text-center">
        <div className="mx-auto flex size-[48px] items-center justify-center rounded-full bg-[var(--fx-bg-soft)] text-[var(--fx-primary)]">
          <Users className="size-[22px]" />
        </div>
        <div className="space-y-[8px]">
          <p className={FX_TYPOGRAPHY.sectionTitle}>{title}</p>
          <p className={`${FX_TYPOGRAPHY.body} text-[var(--fx-text-muted)]`}>{body}</p>
        </div>
      </div>
    </div>
  );
}

function subscribeToWorkspaceTypeChange(onStoreChange) {
  if (typeof window === "undefined") {
    return () => {};
  }

  window.addEventListener("storage", onStoreChange);
  window.addEventListener("fx-auth-change", onStoreChange);

  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener("fx-auth-change", onStoreChange);
  };
}

export default function JobDetailsPage({ params }) {
  const { jobId } = React.use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const job = normalizeJob(findStoredJob(jobId));
  const workspaceType = useSyncExternalStore(subscribeToWorkspaceTypeChange, readStoredWorkspaceType, () => null);
  const showClientInfo = workspaceType === WORKSPACE_TYPES.CLIENTS || workspaceType === WORKSPACE_TYPES.BOTH;

  const activeTab = PIPELINE_TABS.some((tab) => tab.value === searchParams?.get("tab")) ? searchParams.get("tab") : "unscreened";

  const candidateRows = useMemo(
    () =>
      (job ? findStoredCandidatesByJob(job.id) : []).map((candidate) => normalizeCandidate(candidate)).filter(Boolean),
    [job],
  );

  const candidateCounts = useMemo(
    () =>
      candidateRows.reduce(
        (counts, candidate) => {
          counts[candidate.status] = (counts[candidate.status] || 0) + 1;
          return counts;
        },
        { unscreened: 0, screened: 0, shortlisted: 0, shared: 0, rejected: 0 },
      ),
    [candidateRows],
  );

  const filteredCandidates = candidateRows.filter((candidate) => candidate.status === activeTab);
  const lastActivity = formatRelativeTime(job?.updatedAt);

  function handleTabChange(nextTab) {
    router.replace(`${ROUTES.JOB(jobId)}?tab=${nextTab}`, { scroll: false });
  }

  const tableColumns = [
    {
      key: "name",
      label: <span className={FX_TYPOGRAPHY.metaLabel}>Candidate Name</span>,
      width: "19%",
      cellClassName: FX_TYPOGRAPHY.clickableData,
    },
    {
      key: "matchScore",
      label: <span className={FX_TYPOGRAPHY.metaLabel}>JD Match Score</span>,
      width: "12%",
      align: "center",
    },
    {
      key: "uploadedBy",
      label: <span className={FX_TYPOGRAPHY.metaLabel}>Uploaded By</span>,
      width: "16%",
    },
    {
      key: "interested",
      label: <span className={FX_TYPOGRAPHY.metaLabel}>Interested</span>,
      width: "10%",
      align: "center",
    },
    {
      key: "availability",
      label: <span className={FX_TYPOGRAPHY.metaLabel}>Availability</span>,
      width: "10%",
      align: "center",
    },
    {
      key: "currentSalary",
      label: <span className={FX_TYPOGRAPHY.metaLabel}>Current Salary</span>,
      width: "13%",
      align: "center",
    },
    {
      key: "expectedSalary",
      label: <span className={FX_TYPOGRAPHY.metaLabel}>Expectation</span>,
      width: "13%",
      align: "center",
    },
    {
      key: "lastActivity",
      label: <span className={FX_TYPOGRAPHY.metaLabel}>Last Activity</span>,
      width: "7%",
      align: "center",
    },
  ];

  const rows = filteredCandidates.map((candidate) => ({
    id: candidate.id,
    name: <span className={`block truncate ${FX_TYPOGRAPHY.clickableData} text-[var(--fx-primary)]`}>{candidate.name}</span>,
    matchScore: (
      <span className="inline-flex min-w-[64px] justify-center rounded-full bg-[var(--fx-surface-selected)] px-[10px] py-[4px] text-[var(--fx-text)]">
        {candidate.matchScore != null ? `${candidate.matchScore}%` : "—"}
      </span>
    ),
    uploadedBy: <span className={`block truncate ${FX_TYPOGRAPHY.tableCell}`}>{candidate.uploadedBy ?? "—"}</span>,
    interested: <span className={FX_TYPOGRAPHY.tableCell}>{candidate.interested ?? "—"}</span>,
    availability: <span className={FX_TYPOGRAPHY.tableCell}>{formatAvailability(candidate.availabilityDays)}</span>,
    currentSalary: <span className={FX_TYPOGRAPHY.tableCell}>{formatCurrency(candidate.currentSalary)}</span>,
    expectedSalary: <span className={FX_TYPOGRAPHY.tableCell}>{formatCurrency(candidate.expectedSalary)}</span>,
    lastActivity: (
      <span className={`block truncate ${FX_TYPOGRAPHY.tableCell} text-[var(--fx-text-muted)]`}>
        {formatRelativeTime(candidate.updatedAt)}
      </span>
    ),
  }));

  return (
    <FxProtectedAppPage
      pageId="jobWorkspace"
      title={false}
      navbarLeading={
        <Link href={ROUTES.JOBS} className={`inline-flex items-center gap-[8px] ${FX_TYPOGRAPHY.button} text-foreground hover:text-[var(--fx-text)]`}>
          <ArrowLeft className="size-[16px]" />
          Jobs
        </Link>
      }
    >
      <section className={`${FX_LAYOUT.contentWidthWide} flex h-full min-h-0 w-full min-w-0 flex-1 flex-col gap-[24px]`}>
        <Link href={ROUTES.JOBS} className={`inline-flex items-center gap-[8px] ${FX_TYPOGRAPHY.button} text-[var(--fx-text-muted)] hover:text-[var(--fx-text)]`}>
          <ArrowLeft className="size-[16px]" />
          Back to Jobs
        </Link>

        {job ? (
          <>
            <div className={`space-y-[20px] rounded-[16px] border ${FX_COLORS.border} bg-[var(--fx-surface)] p-[24px]`}>
              <div className="space-y-[6px]">
                <p className={`${FX_TYPOGRAPHY.fieldHint} text-[var(--fx-text-muted)]`}>Job Title</p>
                <h1 className={FX_TYPOGRAPHY.workspaceTitle}>{job.title}</h1>
              </div>

              <div className={`grid gap-[16px] sm:grid-cols-2 lg:grid-cols-4 ${showClientInfo ? "xl:grid-cols-5" : ""}`}>
                {showClientInfo && job.company ? <Field label="Client" value={job.company} /> : null}
                <Field label="Location" value={job.location || "Not set"} />
                <Field label="Status" value={job.status} />
                <Field label="Positions" value={String(job.positions || 1)} />
                <Field label="Last Activity" value={lastActivity} />
              </div>
            </div>

            <div className="flex min-h-0 flex-1 flex-col gap-[16px]">
              <FxTabs
                tabs={PIPELINE_TABS.map((tab) => ({
                  value: tab.value,
                  label: `${tab.label} (${candidateCounts[tab.value] || 0})`,
                }))}
                active={activeTab}
                onChange={handleTabChange}
                className="w-full justify-start"
              />

              <div className="min-h-0 flex-1 overflow-hidden">
                {filteredCandidates.length ? (
                  <FxTable
                    columns={tableColumns}
                    rows={rows}
                    stickyHeader
                    emptyMessage="No candidates in this stage yet."
                  />
                ) : (
                  <WorkspaceEmptyState
                    title={`No ${PIPELINE_TABS.find((tab) => tab.value === activeTab)?.label.toLowerCase() ?? "candidates"} yet`}
                    body="Move candidates through the pipeline to see them here."
                  />
                )}
              </div>
            </div>
          </>
        ) : (
          <section className={`rounded-[16px] border ${FX_COLORS.border} bg-[var(--fx-surface)] p-[24px]`}>
            <div className="flex items-start gap-[12px]">
              <Users className="mt-[2px] size-[18px] text-[var(--fx-text-muted)]" />
              <div className="space-y-[6px]">
                <h2 className={FX_TYPOGRAPHY.cardTitle}>{PAGE_COPY.jobWorkspace.notFoundTitle}</h2>
                <p className={`${FX_TYPOGRAPHY.body} text-[var(--fx-text-muted)]`}>{PAGE_COPY.jobWorkspace.notFoundBody}</p>
              </div>
            </div>
          </section>
        )}
      </section>
    </FxProtectedAppPage>
  );
}
