/* app/app/jobs/[jobId]/page.js | Job workspace page backed by local store | Sree | 2026-06-14 */

"use client";

import Link from "next/link";
import React from "react";
import { ArrowLeft, BriefcaseBusiness } from "lucide-react";

import { FxProtectedAppPage } from "@/components/FxProtectedAppPage";
import { ROUTES, WORKSPACE_TYPES } from "@/lib/FxConstants";
import { PAGE_COPY } from "@/lib/FxCopy";
import { findStoredJob, readStoredWorkspaceType } from "@/lib/FxStore";
import { FX_COLORS, FX_LAYOUT, FX_TYPOGRAPHY } from "@/lib/FxTheme";

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

function formatDate(value) {
  if (!value) {
    return null;
  }

  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function Field({ label, value }) {
  return (
    <div className="space-y-[4px]">
      <p className={`${FX_TYPOGRAPHY.fieldHint} text-muted-foreground`}>{label}</p>
      <p className={FX_TYPOGRAPHY.body}>{value}</p>
    </div>
  );
}

function PlaceholderCard({ title, body }) {
  return (
    <section className={`rounded-[16px] border ${FX_COLORS.border} bg-[var(--fx-surface)] p-[20px]`}>
      <h2 className={FX_TYPOGRAPHY.cardTitle}>{title}</h2>
      <p className={`${FX_TYPOGRAPHY.body} mt-[8px] text-muted-foreground`}>{body}</p>
    </section>
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
  const job = normalizeJob(findStoredJob(jobId));
  const workspaceType = React.useSyncExternalStore(subscribeToWorkspaceTypeChange, readStoredWorkspaceType, () => null);
  const showClientInfo = workspaceType === WORKSPACE_TYPES.CLIENTS || workspaceType === WORKSPACE_TYPES.BOTH;
  const updatedDate = formatDate(job?.updatedAt);
  const lastUpdated = updatedDate ? `${updatedDate}` : "Not set";

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
      <section className={`${FX_LAYOUT.contentWidthMedium} space-y-[24px]`}>
        <div className={`space-y-[16px] rounded-[16px] border ${FX_COLORS.border} bg-[var(--fx-surface)] p-[24px]`}>
          <div className="space-y-[6px]">
            <p className={`${FX_TYPOGRAPHY.fieldHint} text-muted-foreground`}>Job Title</p>
            <h1 className={FX_TYPOGRAPHY.workspaceTitle}>{job?.title ?? PAGE_COPY.jobWorkspace.title}</h1>
            <p className={`${FX_TYPOGRAPHY.body} text-muted-foreground`}>
              {job
                ? PAGE_COPY.jobWorkspace.description
                : PAGE_COPY.jobWorkspace.notFoundBody}
            </p>
          </div>

          {job ? (
            <div className={`grid gap-[16px] sm:grid-cols-2 ${showClientInfo ? "lg:grid-cols-5" : "lg:grid-cols-4"}`}>
              {showClientInfo ? <Field label="Client" value={job.company || "Not set"} /> : null}
              <Field label="Location" value={job.location || "Not set"} />
              <Field label="Status" value={job.status} />
              <Field label="Positions" value={String(job.positions || 1)} />
              <Field label="Last Updated" value={lastUpdated} />
            </div>
          ) : null}
        </div>

        {job ? (
          <div className="grid gap-[16px] md:grid-cols-2">
            <PlaceholderCard
              title={PAGE_COPY.jobWorkspace.jobSummaryTitle}
              body="Core role information, stakeholders, and hiring context will live here."
            />
            <PlaceholderCard
              title={PAGE_COPY.jobWorkspace.pipelineTitle}
              body="Candidate stage counts and hiring progress will be summarized here."
            />
            <PlaceholderCard
              title={PAGE_COPY.jobWorkspace.candidatesTitle}
              body="The working candidate table and evaluation actions will live here."
            />
            <PlaceholderCard
              title={PAGE_COPY.jobWorkspace.activityTitle}
              body="Recent updates, recruiter actions, and collaboration history will live here."
            />
          </div>
        ) : (
          <section className={`rounded-[16px] border ${FX_COLORS.border} bg-[var(--fx-surface)] p-[24px]`}>
            <div className="flex items-start gap-[12px]">
              <BriefcaseBusiness className="mt-[2px] size-[18px] text-[var(--fx-text-muted)]" />
              <div className="space-y-[6px]">
                <h2 className={FX_TYPOGRAPHY.cardTitle}>{PAGE_COPY.jobWorkspace.notFoundTitle}</h2>
                <p className={`${FX_TYPOGRAPHY.body} text-muted-foreground`}>{PAGE_COPY.jobWorkspace.notFoundBody}</p>
              </div>
            </div>
          </section>
        )}
      </section>
    </FxProtectedAppPage>
  );
}
