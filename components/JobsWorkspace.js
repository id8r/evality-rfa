/*
components/JobsWorkspace.js | Jobs workspace with contextual Create Job sheet | Sree | 2026-06-11
*/

"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";

import { CreateJobForm } from "@/components/CreateJobForm";
import { fxButtonClassName } from "@/components/FxButton";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { CONTENT_WIDTH_MEDIUM_CLASS, DEMO_USER, STORAGE_KEYS } from "@/lib/FxConstants";
import { readStoredCollection, writeStoredCollection } from "@/lib/demo-store";

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

function buildJobPayload(draft, status, existingCreatedAt) {
  return {
    id: draft.id || `job-${Date.now()}`,
    title: draft.jobTitle || "Untitled job",
    company: draft.clientCompany || "My Company",
    location: draft.location || (draft.workplaceType === "Remote" ? "Remote" : "—"),
    experience: `${draft.experienceMin || "0"} - ${draft.experienceMax || "0"} yrs`,
    status,
    createdAt: existingCreatedAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    data: {
      ...draft,
      id: draft.id || `job-${Date.now()}`,
      assignee: draft.assignee || DEMO_USER.name,
    },
  };
}

export function JobsWorkspace({ initialCreateOpen = false }) {
  const [jobs, setJobs] = useState([]);
  const [isSheetOpen, setIsSheetOpen] = useState(initialCreateOpen);
  const [editingJob, setEditingJob] = useState(null);

  useEffect(() => {
    const storedJobs = readStoredCollection(STORAGE_KEYS.JOBS) || [];
    setJobs(storedJobs);
  }, []);

  useEffect(() => {
    setIsSheetOpen(initialCreateOpen);
  }, [initialCreateOpen]);

  const hasJobs = jobs.length > 0;

  const sortedJobs = useMemo(
    () =>
      [...jobs].sort((leftJob, rightJob) => {
        const leftTime = new Date(leftJob.updatedAt || leftJob.createdAt || 0).getTime();
        const rightTime = new Date(rightJob.updatedAt || rightJob.createdAt || 0).getTime();
        return rightTime - leftTime;
      }),
    [jobs],
  );

  function openCreateSheet() {
    setEditingJob(null);
    setIsSheetOpen(true);
  }

  function openEditSheet(job) {
    setEditingJob(job);
    setIsSheetOpen(true);
  }

  function closeSheet() {
    setIsSheetOpen(false);
    setEditingJob(null);
  }

  async function handlePersistDraft(draft, status) {
    const existingJobs = readStoredCollection(STORAGE_KEYS.JOBS) || [];
    const existingMatch = existingJobs.find((job) => job.id === draft.id) || editingJob;
    const nextJobId = draft.id || existingMatch?.id || `job-${Date.now()}`;
    const nextJob = {
      ...buildJobPayload({ ...draft, id: nextJobId }, status, existingMatch?.createdAt),
      id: nextJobId,
    };

    const updatedJobs = [nextJob, ...existingJobs.filter((job) => job.id !== nextJob.id)];
    writeStoredCollection(STORAGE_KEYS.JOBS, updatedJobs);
    setJobs(updatedJobs);
    closeSheet();
  }

  return (
    <div className={`mx-auto mt-[32px] w-full ${CONTENT_WIDTH_MEDIUM_CLASS} space-y-[24px]`}>
      <div className="flex flex-col gap-[16px] md:flex-row md:items-start md:justify-between">
        <div className="space-y-[4px]">
          <h1 className="text-[30px] leading-[36px] font-medium text-foreground">Jobs</h1>
          <p className="text-[14px] leading-[22px] text-muted-foreground">
            Track drafts, published roles, and quick edits from one place.
          </p>
        </div>

        <button
          type="button"
          className={fxButtonClassName({ size: "md", className: "rounded-[8px]" })}
          onClick={openCreateSheet}
        >
          <Plus className="size-[16px]" />
          Create Job
        </button>
      </div>

      {!hasJobs ? (
        <div className="rounded-[16px] border border-border bg-card p-[40px] text-center">
          <div className="mx-auto max-w-[480px] space-y-[12px]">
            <h2 className="text-[24px] leading-[32px] font-medium text-foreground">No jobs yet</h2>
            <p className="text-[14px] leading-[22px] text-muted-foreground">
              Create your first job to start sourcing and evaluating candidates.
            </p>
            <div className="pt-[8px]">
              <button
                type="button"
                className={fxButtonClassName({ size: "md", className: "rounded-[8px]" })}
                onClick={openCreateSheet}
              >
                Create Job
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="overflow-hidden rounded-[16px] border border-border bg-card">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="border-b border-border bg-[var(--fx-bg-soft)]">
                <tr className="text-left">
                  <th className="px-[16px] py-[14px] text-[12px] font-medium uppercase tracking-[0.06em] text-muted-foreground">Job Title</th>
                  <th className="px-[16px] py-[14px] text-[12px] font-medium uppercase tracking-[0.06em] text-muted-foreground">Client / Company</th>
                  <th className="px-[16px] py-[14px] text-[12px] font-medium uppercase tracking-[0.06em] text-muted-foreground">Location</th>
                  <th className="px-[16px] py-[14px] text-[12px] font-medium uppercase tracking-[0.06em] text-muted-foreground">Experience</th>
                  <th className="px-[16px] py-[14px] text-[12px] font-medium uppercase tracking-[0.06em] text-muted-foreground">Status</th>
                  <th className="px-[16px] py-[14px] text-[12px] font-medium uppercase tracking-[0.06em] text-muted-foreground">Created Date</th>
                  <th className="px-[16px] py-[14px] text-[12px] font-medium uppercase tracking-[0.06em] text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedJobs.map((job) => (
                  <tr key={job.id} className="border-b border-border last:border-b-0">
                    <td className="px-[16px] py-[16px] text-[14px] font-medium text-foreground">{job.title}</td>
                    <td className="px-[16px] py-[16px] text-[14px] text-muted-foreground">{job.company}</td>
                    <td className="px-[16px] py-[16px] text-[14px] text-muted-foreground">{job.location}</td>
                    <td className="px-[16px] py-[16px] text-[14px] text-muted-foreground">{job.experience}</td>
                    <td className="px-[16px] py-[16px]">
                      <span className="inline-flex rounded-full bg-primary/10 px-[10px] py-[4px] text-[12px] font-medium text-primary">
                        {job.status}
                      </span>
                    </td>
                    <td className="px-[16px] py-[16px] text-[14px] text-muted-foreground">{formatDate(job.createdAt)}</td>
                    <td className="px-[16px] py-[16px]">
                      <button
                        type="button"
                        className="cursor-pointer rounded-[8px] border border-border px-[10px] py-[8px] text-[13px] font-medium text-foreground hover:bg-accent"
                        onClick={() => openEditSheet(job)}
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Sheet open={isSheetOpen} onOpenChange={(open) => !open && closeSheet()}>
        <SheetContent side="right" className="w-[78vw] sm:max-w-[78vw]">
          <SheetHeader>
            <SheetTitle>{editingJob ? "Edit Job" : "Create Job"}</SheetTitle>
            <SheetDescription>
              Fill the essentials, use AI helpers where useful, then save as draft or publish.
            </SheetDescription>
          </SheetHeader>

          <div className="min-h-0 flex-1 overflow-auto pr-[4px]">
            <CreateJobForm
              embedded
              initialDraft={editingJob?.data || null}
              onSaveDraft={(draft) => handlePersistDraft(draft, "Draft")}
              onPublishJob={(draft) => handlePersistDraft(draft, "Published")}
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
