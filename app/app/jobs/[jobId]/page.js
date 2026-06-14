/* app/app/jobs/[jobId]/page.js | Job workspace placeholder route | Sree | 2026-06-13 */

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { FxProtectedAppPage } from "@/components/FxProtectedAppPage";
import { ensureJobsStore } from "@/lib/FxStore";
import { ROUTES } from "@/lib/FxConstants";
import { FX_COLORS, FX_LAYOUT, FX_TYPOGRAPHY } from "@/lib/FxTheme";

function normalizeJob(job) {
  return {
    ...job,
    status: job.status === "Published" ? "Published" : "Draft",
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

export default async function JobDetailsPage({ params }) {
  const resolvedParams = await params;
  const jobId = resolvedParams?.jobId;
  const jobs = ensureJobsStore().map(normalizeJob);
  const job = jobs.find((item) => item.id === jobId);
  const jobTitle = job?.title ?? "Job Workspace";
  const createdDate = formatDate(job?.createdAt);
  const updatedDate = formatDate(job?.updatedAt);
  const jobContext = job
    ? [job.company, job.location, job.status, `${job.positions} Position${job.positions > 1 ? "s" : ""}`]
        .filter(Boolean)
        .join(" • ")
    : "Selected job summary and recruiting pipeline.";
  const jobMeta = job
    ? [createdDate ? `Created ${createdDate}` : null, updatedDate ? `Last updated ${updatedDate}` : null].filter(Boolean).join(" • ")
    : null;

  return (
    <FxProtectedAppPage
      pageId="jobWorkspace"
      title={false}
      navbarLeading={
        <Link href={ROUTES.JOBS} className={`inline-flex items-center gap-[8px] ${FX_TYPOGRAPHY.button} text-foreground hover:text-primary`}>
          <ArrowLeft className="size-[16px]" />
          Jobs
        </Link>
      }
    >
      <section className={`${FX_LAYOUT.contentWidthMedium} space-y-[24px]`}>
        <div className={`space-y-[10px] rounded-[16px] border ${FX_COLORS.border} bg-[var(--fx-surface)] p-[24px]`}>
          <div className="space-y-[6px]">
            <h1 className={FX_TYPOGRAPHY.workspaceTitle}>{jobTitle}</h1>
            <p className={`${FX_TYPOGRAPHY.body} text-muted-foreground`}>{jobContext}</p>
            {jobMeta ? <p className={`${FX_TYPOGRAPHY.fieldHint} text-muted-foreground`}>{jobMeta}</p> : null}
          </div>
        </div>

        <div className="grid gap-[16px] md:grid-cols-2">
          <section className={`rounded-[16px] border ${FX_COLORS.border} bg-[var(--fx-surface)] p-[20px]`}>
            <h2 className={FX_TYPOGRAPHY.cardTitle}>Job Summary</h2>
            <p className={`${FX_TYPOGRAPHY.body} mt-[8px] text-muted-foreground`}>
              Core role information, stakeholders, and hiring context will live here.
            </p>
          </section>

          <section className={`rounded-[16px] border ${FX_COLORS.border} bg-[var(--fx-surface)] p-[20px]`}>
            <h2 className={FX_TYPOGRAPHY.cardTitle}>Pipeline Overview</h2>
            <p className={`${FX_TYPOGRAPHY.body} mt-[8px] text-muted-foreground`}>
              Candidate stage counts and hiring progress will be summarized here.
            </p>
          </section>

          <section className={`rounded-[16px] border ${FX_COLORS.border} bg-[var(--fx-surface)] p-[20px]`}>
            <h2 className={FX_TYPOGRAPHY.cardTitle}>Candidates</h2>
            <p className={`${FX_TYPOGRAPHY.body} mt-[8px] text-muted-foreground`}>
              The working candidate table and evaluation actions will live here.
            </p>
          </section>

          <section className={`rounded-[16px] border ${FX_COLORS.border} bg-[var(--fx-surface)] p-[20px]`}>
            <h2 className={FX_TYPOGRAPHY.cardTitle}>Activity</h2>
            <p className={`${FX_TYPOGRAPHY.body} mt-[8px] text-muted-foreground`}>
              Recent updates, recruiter actions, and collaboration history will live here.
            </p>
          </section>
        </div>
      </section>
    </FxProtectedAppPage>
  );
}
