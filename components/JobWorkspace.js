/*
components/JobWorkspace.js | Dedicated job workspace route with candidate pipeline | Sree | 2026-06-12
*/

"use client";

import { useEffect, useMemo, useState } from "react";
import { ExternalLink } from "lucide-react";
import { useRouter } from "next/navigation";

import { fxButtonClassName } from "@/components/FxButton";
import { ROUTES } from "@/lib/FxConstants";
import { ensureJobsStore } from "@/lib/demo-store";
import { FX_TYPOGRAPHY } from "@/lib/FxTheme";

function formatDate(value) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function JobBadge({ children }) {
  return (
    <span className={`inline-flex items-center rounded-full bg-[var(--fx-bg-soft)] px-[10px] py-[4px] ${FX_TYPOGRAPHY.metaLabel} text-foreground`}>
      {children}
    </span>
  );
}

function PipelineStage({ title, count, description }) {
  return (
    <div className="rounded-[16px] border border-border bg-card p-[16px]">
      <div className="flex items-start justify-between gap-[12px]">
        <div className="space-y-[4px]">
          <p className={`${FX_TYPOGRAPHY.cardTitle} text-foreground`}>{title}</p>
          <p className={`${FX_TYPOGRAPHY.caption} text-muted-foreground`}>{description}</p>
        </div>
        <span className={`inline-flex h-[28px] min-w-[28px] items-center justify-center rounded-full bg-primary/10 px-[8px] ${FX_TYPOGRAPHY.metaLabel} text-primary`}>
          {count}
        </span>
      </div>
      <div className="mt-[12px] h-[6px] rounded-full bg-[var(--fx-bg-soft)]">
        <div className="h-full w-[18%] rounded-full bg-primary/70" />
      </div>
    </div>
  );
}

function getCandidateStageLabel(status) {
  const stageMap = {
    new: "Unscreened",
    unscreened: "Unscreened",
    prescreened: "Pre-Screened",
    "pre-screened": "Pre-Screened",
    shortlisted: "Shortlisted",
    "sent to client": "Sent To Client",
    s2c: "Sent To Client",
    rejected: "Rejected",
  };

  const key = String(status || "").trim().toLowerCase();
  return stageMap[key] || "Unscreened";
}

export function JobWorkspace({ jobId }) {
  const router = useRouter();
  const [jobs, setJobs] = useState([]);
  const [candidates, setCandidates] = useState([]);

  useEffect(() => {
    async function loadJobs() {
      const storedJobs = await ensureJobsStore();
      setJobs(Array.isArray(storedJobs) ? storedJobs : []);
    }

    loadJobs();
  }, []);

  useEffect(() => {
    async function loadCandidates() {
      const response = await fetch("/data/candidates.json");
      if (!response.ok) {
        return;
      }

      const seedCandidates = await response.json();
      setCandidates(Array.isArray(seedCandidates) ? seedCandidates : []);
    }

    loadCandidates();
  }, []);

  const job = useMemo(() => jobs.find((currentJob) => currentJob.id === jobId) || null, [jobId, jobs]);

  const jobCandidates = useMemo(
    () => candidates.filter((candidate) => candidate.jobId === jobId),
    [candidates, jobId],
  );

  const stageCounts = useMemo(
    () => {
      const counts = {
        "Unscreened": 0,
        "Pre-Screened": 0,
        "Shortlisted": 0,
        "Sent To Client": 0,
        "Rejected": 0,
      };

      jobCandidates.forEach((candidate) => {
        const stage = getCandidateStageLabel(candidate.status);
        if (counts[stage] !== undefined) {
          counts[stage] += 1;
        }
      });

      return counts;
    },
    [jobCandidates],
  );

  function openEditJob() {
    router.push(`${ROUTES.CREATE_JOB}?jobId=${jobId}`);
  }

  if (!job) {
    return (
      <div className="mx-auto w-full max-w-[1200px] space-y-[24px]">
        <div className="space-y-[24px] rounded-[16px] border border-border bg-card p-[32px]">
          <div className="space-y-[8px]">
            <h1 className={`${FX_TYPOGRAPHY.workspaceTitle} text-foreground`}>Job not found</h1>
            <p className={`${FX_TYPOGRAPHY.workspaceSubtitle} text-muted-foreground`}>
              The job you opened is no longer available in this workspace.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1200px] space-y-[24px]">
        <div className="flex items-center justify-between gap-[16px]">
          <button
            type="button"
            className={fxButtonClassName({ variant: "outline", size: "md", className: "rounded-[8px]" })}
            onClick={openEditJob}
          >
            <ExternalLink className="size-[16px]" />
            Edit Job
          </button>
        </div>

      <div className="space-y-[24px] rounded-[16px] border border-border bg-card p-[24px]">
        <div className="flex flex-col gap-[16px] md:flex-row md:items-start md:justify-between">
          <div className="space-y-[8px]">
            <div className="flex flex-wrap items-center gap-[8px]">
              <h1 className={`${FX_TYPOGRAPHY.workspaceTitle} text-foreground`}>{job.title}</h1>
              <JobBadge>{job.status}</JobBadge>
            </div>
            <p className={`${FX_TYPOGRAPHY.workspaceSubtitle} text-muted-foreground`}>
              {job.company} · {job.location} · {formatDate(job.createdAt)}
            </p>
          </div>
        </div>

        <div className="grid gap-[16px] md:grid-cols-5">
          <PipelineStage title="Unscreened" count={stageCounts["Unscreened"]} description="New candidates" />
          <PipelineStage title="Pre-Screened" count={stageCounts["Pre-Screened"]} description="Qualified by recruiter" />
          <PipelineStage title="Shortlisted" count={stageCounts["Shortlisted"]} description="Ready for review" />
          <PipelineStage title="Sent To Client" count={stageCounts["Sent To Client"]} description="Shared externally" />
          <PipelineStage title="Rejected" count={stageCounts["Rejected"]} description="Closed out" />
        </div>

        <div className="space-y-[16px]">
          <div className="space-y-[4px]">
            <h2 className={`${FX_TYPOGRAPHY.sectionTitle} text-foreground`}>Candidates</h2>
            <p className={`${FX_TYPOGRAPHY.sectionSubtitle} text-muted-foreground`}>
              Current candidates for this job.
            </p>
          </div>

          <div className="overflow-hidden rounded-[16px] border border-border bg-background">
            <table className="min-w-full">
              <thead className="border-b border-border bg-[var(--fx-bg-soft)]">
                <tr className="text-left">
                  <th className={`px-[16px] py-[14px] ${FX_TYPOGRAPHY.tableHeader} text-muted-foreground`}>Candidate</th>
                  <th className={`px-[16px] py-[14px] ${FX_TYPOGRAPHY.tableHeader} text-muted-foreground`}>Stage</th>
                  <th className={`px-[16px] py-[14px] ${FX_TYPOGRAPHY.tableHeader} text-muted-foreground`}>Status</th>
                </tr>
              </thead>
              <tbody>
                {jobCandidates.length ? (
                  jobCandidates.map((candidate) => (
                    <tr key={candidate.id} className="border-b border-border last:border-b-0">
                      <td className={`px-[16px] py-[16px] ${FX_TYPOGRAPHY.clickableData} text-foreground`}>
                        {candidate.name}
                      </td>
                      <td className={`px-[16px] py-[16px] ${FX_TYPOGRAPHY.tableCell} text-muted-foreground`}>
                        {getCandidateStageLabel(candidate.status)}
                      </td>
                      <td className={`px-[16px] py-[16px] ${FX_TYPOGRAPHY.tableCell} text-muted-foreground`}>
                        {candidate.status}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className={`px-[16px] py-[32px] text-center ${FX_TYPOGRAPHY.tableCell} text-muted-foreground`}>
                      No candidates yet for this job.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
