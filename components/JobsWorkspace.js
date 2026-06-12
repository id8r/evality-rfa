/*
components/JobsWorkspace.js | Jobs list workspace and create/edit sheet | Sree | 2026-06-12
*/

"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Archive, ArrowUpDown, Briefcase, Filter, MoreHorizontal, Plus, Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

import { CreateJobForm } from "@/components/CreateJobForm";
import { fxButtonClassName } from "@/components/FxButton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Sheet, SheetBody, SheetContent, SheetHeader, SheetFooter } from "@/components/ui/sheet";
import { Toast, ToastAction, ToastClose, ToastDescription, ToastTitle } from "@/components/ui/toast";
import { ROUTES, STORAGE_KEYS, CONTENT_WIDTH_WIDE_CLASS, DEMO_USER } from "@/lib/FxConstants";
import { ensureJobsStore } from "@/lib/demo-store";
import { FX_TYPOGRAPHY } from "@/lib/FxTheme";
import { readStoredJSON, readStoredValue, writeStoredJSON, writeStoredValue } from "@/lib/FxUtils";

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
    positions: Number(draft.positions || 1),
    createdBy: draft.assignee || DEMO_USER.name,
    location: draft.location || (draft.workplaceType === "Remote" ? "Remote" : "—"),
    experience: `${draft.experienceMin || "0"} - ${draft.experienceMax || "0"} yrs`,
    unscreenedCount: 0,
    preScreenedCount: 0,
    shortlistedCount: 0,
    sentToClientCount: 0,
    status,
    isArchived: false,
    createdAt: existingCreatedAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    updatedBy: draft.assignee || DEMO_USER.name,
    data: {
      ...draft,
      id: draft.id || `job-${Date.now()}`,
      assignee: draft.assignee || DEMO_USER.name,
    },
  };
}

function SortableHeader({ label, sortKey, sortConfig, onSort }) {
  const isActive = sortConfig.key === sortKey;

  return (
    <button
      type="button"
      className={`group inline-flex cursor-pointer items-center gap-[6px] rounded-[8px] px-[2px] py-[2px] text-left ${FX_TYPOGRAPHY.metaLabel} normal-case tracking-normal transition-colors ${
        isActive ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
      }`}
      onClick={() => onSort(sortKey)}
    >
      <span>{label}</span>
      <ArrowUpDown
        className={`size-[12px] transition-colors ${isActive ? "text-foreground" : "text-muted-foreground/70"} group-hover:text-foreground`}
      />
    </button>
  );
}

function StatusDot({ status }) {
  const isDraft = String(status || "").toLowerCase() === "draft";

  if (isDraft) {
    return <span className="inline-block size-[9px] rounded-full border border-[#F59E0B] bg-transparent" aria-hidden="true" />;
  }

  return <span className="inline-block size-[9px] rounded-full bg-[#22C55E]" aria-hidden="true" />;
}

const JOBS_TABLE_HEADER_CLASS = `${FX_TYPOGRAPHY.metaLabel} normal-case tracking-normal`;

export function JobsWorkspace({ initialCreateOpen = false }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editJobId = searchParams.get("jobId");

  const [jobs, setJobs] = useState([]);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [activeTab, setActiveTab] = useState("active");
  const [search, setSearch] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: "updatedAt", direction: "desc" });
  const [isSheetOpen, setIsSheetOpen] = useState(initialCreateOpen || Boolean(editJobId));
  const [editingJob, setEditingJob] = useState(null);
  const [sheetState, setSheetState] = useState(null);
  const [isDiscardAlertOpen, setIsDiscardAlertOpen] = useState(false);
  const [deleteJobTarget, setDeleteJobTarget] = useState(null);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [toastState, setToastState] = useState({
    open: false,
    title: "",
    description: "",
    actionLabel: "",
    actionHref: "",
  });
  const formRef = useRef(null);
  const hydratedEditIdRef = useRef(null);

  useEffect(() => {
    async function loadJobs() {
      const storedJobs = await ensureJobsStore();
      setJobs(Array.isArray(storedJobs) ? storedJobs : []);
      setIsDemoMode(readStoredValue(STORAGE_KEYS.JOBS_DEMO_MODE) === "true");
    }

    loadJobs();
  }, []);

  useEffect(() => {
    function handleKeydown(event) {
      const isMetaJ =
        (event.metaKey || event.ctrlKey) &&
        (event.key.toLowerCase() === "j" || event.code === "KeyJ");

      if (!isMetaJ || event.altKey || event.shiftKey) {
        return;
      }

      if (typeof document !== "undefined") {
        const activeTag = document.activeElement?.tagName?.toLowerCase();
        if (activeTag && ["input", "textarea", "select"].includes(activeTag)) {
          return;
        }
      }

      event.preventDefault();
      setIsDemoMode((currentValue) => {
        const nextValue = !currentValue;
        writeStoredValue(STORAGE_KEYS.JOBS_DEMO_MODE, String(nextValue));
        return nextValue;
      });
    }

    window.addEventListener("keydown", handleKeydown, true);

    return () => window.removeEventListener("keydown", handleKeydown, true);
  }, []);

  useEffect(() => {
    setIsSheetOpen(initialCreateOpen || Boolean(editJobId));
  }, [initialCreateOpen, editJobId]);

  useEffect(() => {
    if (!editJobId || hydratedEditIdRef.current === editJobId) {
      return;
    }

    const match = jobs.find((job) => job.id === editJobId);
    if (!match) {
      return;
    }

    hydratedEditIdRef.current = editJobId;
    setEditingJob(match);
    setIsSheetOpen(true);
  }, [editJobId, jobs]);

  const sortedJobs = useMemo(() => {
    const directionFactor = sortConfig.direction === "asc" ? 1 : -1;

    return [...jobs].sort((leftJob, rightJob) => {
      if (sortConfig.key === "jobId") {
        return leftJob.id.localeCompare(rightJob.id, undefined, { numeric: true, sensitivity: "base" }) * directionFactor;
      }

      if (sortConfig.key === "jobTitle") {
        return leftJob.title.localeCompare(rightJob.title, undefined, { numeric: true, sensitivity: "base" }) * directionFactor;
      }

      if (sortConfig.key === "company") {
        return leftJob.company.localeCompare(rightJob.company, undefined, { numeric: true, sensitivity: "base" }) * directionFactor;
      }

      const leftTime = new Date(leftJob.updatedAt || leftJob.createdAt || 0).getTime();
      const rightTime = new Date(rightJob.updatedAt || rightJob.createdAt || 0).getTime();
      return (rightTime - leftTime) * directionFactor * -1;
    });
  }, [jobs, sortConfig]);

  const activeJobsCount = useMemo(
    () => jobs.filter((job) => !job.isArchived).length,
    [jobs],
  );

  const archivedJobsCount = useMemo(
    () => jobs.filter((job) => job.isArchived).length,
    [jobs],
  );

  const scopedJobs = useMemo(() => {
    if (isDemoMode) {
      return [];
    }

    return sortedJobs.filter((job) => (activeTab === "archived" ? job.isArchived : !job.isArchived));
  }, [activeTab, isDemoMode, sortedJobs]);

  const filteredJobs = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return scopedJobs;
    }

    return scopedJobs.filter((job) => {
      return [job.id, job.title, job.company, job.location, job.experience, job.status]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query));
    });
  }, [search, scopedJobs]);

  const hasJobsInTab = !isDemoMode && scopedJobs.length > 0;
  const showEmptyState = !hasJobsInTab;

  function persistJobs(nextJobs) {
    writeStoredJSON(STORAGE_KEYS.JOBS, nextJobs);
    setJobs(nextJobs);
  }

  function toggleSort(key) {
    setSortConfig((currentSort) => {
      if (currentSort.key === key) {
        return {
          key,
          direction: currentSort.direction === "asc" ? "desc" : "asc",
        };
      }

      return {
        key,
        direction: "asc",
      };
    });
  }

  function openCreateSheet() {
    setEditingJob(null);
    hydratedEditIdRef.current = null;
    setIsSheetOpen(true);
  }

  function openWorkspace(job) {
    router.push(ROUTES.JOB(job.id));
  }

  function openJobEditor(job) {
    setEditingJob(job);
    hydratedEditIdRef.current = job.id;
    setIsSheetOpen(true);
  }

  function showToast({ title, description, actionLabel, actionHref }) {
    setToastState({
      open: true,
      title,
      description,
      actionLabel,
      actionHref,
    });
  }

  function closeSheet() {
    setIsSheetOpen(false);
    setEditingJob(null);
    setSheetState(null);
    setIsDiscardAlertOpen(false);
  }

  function confirmDiscardAndClose() {
    if (sheetState?.isDirty) {
      setIsDiscardAlertOpen(true);
      return false;
    }

    closeSheet();
    return true;
  }

  async function handlePersistDraft(draft, status) {
    const existingJobs = jobs;
    const existingMatch = existingJobs.find((job) => job.id === draft.id) || editingJob;
    const nextJobId = draft.id || existingMatch?.id || `job-${Date.now()}`;
    const nextJob = {
      ...buildJobPayload({ ...draft, id: nextJobId }, status, existingMatch?.createdAt),
      id: nextJobId,
      positions: Number(draft.positions || existingMatch?.positions || 1),
      createdBy: draft.assignee || existingMatch?.createdBy || DEMO_USER.name,
      unscreenedCount: existingMatch?.unscreenedCount ?? 0,
      preScreenedCount: existingMatch?.preScreenedCount ?? 0,
      shortlistedCount: existingMatch?.shortlistedCount ?? 0,
      sentToClientCount: existingMatch?.sentToClientCount ?? 0,
      isArchived: existingMatch?.isArchived ?? false,
      updatedBy: draft.assignee || existingMatch?.updatedBy || DEMO_USER.name,
    };

    const updatedJobs = [nextJob, ...existingJobs.filter((job) => job.id !== nextJob.id)];
    persistJobs(updatedJobs);
    closeSheet();
  }

  function duplicateJob(job) {
    const existingJobs = jobs;
    const now = new Date().toISOString();
    const duplicateId = `job-${Date.now()}`;
    const duplicateData = {
      ...(job.data || {}),
      id: duplicateId,
      assignee: job.data?.assignee || DEMO_USER.name,
    };

    delete duplicateData.candidates;
    delete duplicateData.notes;
    delete duplicateData.history;
    delete duplicateData.analytics;
    delete duplicateData.metrics;

    const duplicate = {
      id: duplicateId,
      title: `${job.title} Copy`,
      company: job.company,
      positions: job.positions || 1,
      createdBy: DEMO_USER.name,
      location: job.location,
      experience: job.experience,
      unscreenedCount: 0,
      preScreenedCount: 0,
      shortlistedCount: 0,
      sentToClientCount: 0,
      status: "Draft",
      isArchived: false,
      createdAt: now,
      updatedAt: now,
      updatedBy: DEMO_USER.name,
      data: duplicateData,
    };

    const updatedJobs = [duplicate, ...existingJobs];
    persistJobs(updatedJobs);
    showToast({
      title: "Draft copy created",
      description: "A draft copy was added to the Jobs table.",
      actionLabel: "Open Draft",
      actionHref: ROUTES.JOB(duplicateId),
    });
  }

  function archiveJob(job) {
    const existingJobs = jobs;
    const updatedJobs = existingJobs.map((currentJob) =>
      currentJob.id === job.id
        ? { ...currentJob, isArchived: true, updatedAt: new Date().toISOString(), updatedBy: DEMO_USER.name }
        : currentJob,
    );

    persistJobs(updatedJobs);
  }

  function restoreJob(job) {
    const existingJobs = jobs;
    const updatedJobs = existingJobs.map((currentJob) =>
      currentJob.id === job.id
        ? { ...currentJob, isArchived: false, updatedAt: new Date().toISOString(), updatedBy: DEMO_USER.name }
        : currentJob,
    );

    persistJobs(updatedJobs);
  }

  function deleteJob() {
    if (!deleteJobTarget) {
      return;
    }

    const existingJobs = jobs;
    const updatedJobs = existingJobs.filter((job) => job.id !== deleteJobTarget.id);

    persistJobs(updatedJobs);
    setDeleteJobTarget(null);
    setIsDeleteAlertOpen(false);
  }

  return (
    <div className={`mx-auto w-full ${CONTENT_WIDTH_WIDE_CLASS} space-y-[16px]`}>
      {process.env.NODE_ENV === "development" ? (
        <button
          type="button"
          aria-label="Toggle demo state"
          title="Toggle demo state"
          className="fixed right-[16px] bottom-[16px] z-[60] h-[24px] w-[24px] rounded-full border border-border bg-background/90 text-[10px] text-muted-foreground opacity-20 shadow-sm transition-opacity hover:opacity-100"
          onClick={() => {
            setIsDemoMode((currentValue) => {
              const nextValue = !currentValue;
              writeStoredValue(STORAGE_KEYS.JOBS_DEMO_MODE, String(nextValue));
              return nextValue;
            });
          }}
        >
          J
        </button>
      ) : null}

      <div className="flex flex-col gap-[12px] md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-[20px]">
          <button
            type="button"
            className={`cursor-pointer border-b-[3px] pb-[8px] ${FX_TYPOGRAPHY.button} transition-colors ${
              activeTab === "active"
                ? "border-primary font-medium text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => setActiveTab("active")}
          >
            Active ({isDemoMode ? 0 : activeJobsCount})
          </button>
          <button
            type="button"
            className={`cursor-pointer border-b-[3px] pb-[8px] ${FX_TYPOGRAPHY.button} transition-colors ${
              activeTab === "archived"
                ? "border-primary font-medium text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => setActiveTab("archived")}
          >
            Archived ({isDemoMode ? 0 : archivedJobsCount})
          </button>
        </div>

        <div className="flex flex-col gap-[8px] md:flex-row md:items-center">
          <div className="relative">
            <Search className="pointer-events-none absolute left-[12px] top-1/2 size-[16px] -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search jobs"
              className={`h-[40px] w-full rounded-[8px] border border-border bg-background pl-[36px] pr-[12px] ${FX_TYPOGRAPHY.input} text-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring md:w-[240px]`}
            />
          </div>

          <button
            type="button"
            className={fxButtonClassName({ variant: "outline", size: "md", className: "rounded-[8px]" })}
          >
            <Filter className="size-[16px]" />
            Filter
          </button>

          <button
            type="button"
            className={fxButtonClassName({ size: "md", className: "w-fit self-start rounded-[8px]" })}
            onClick={openCreateSheet}
          >
            <Plus className="size-[16px]" />
            Create Job
          </button>
        </div>
      </div>

      {showEmptyState ? (
        <div className="rounded-[16px] border border-border bg-card p-[40px] text-center">
          <div className="mx-auto max-w-[480px] space-y-[12px]">
            <div className="mx-auto flex h-[44px] w-[44px] items-center justify-center rounded-full bg-[var(--fx-bg-soft)] text-muted-foreground">
              {activeTab === "archived" ? <Archive className="size-[18px]" /> : <Briefcase className="size-[18px]" />}
            </div>
            {activeTab === "archived" ? (
              <>
                <h2 className={`${FX_TYPOGRAPHY.cardTitle} text-foreground`}>No jobs archived yet</h2>
                <p className={`${FX_TYPOGRAPHY.cardSubtitle} text-muted-foreground`}>
                  Archive completed or inactive roles to keep your active workspace clean.
                </p>
              </>
            ) : (
              <>
                <h2 className={`${FX_TYPOGRAPHY.cardTitle} text-foreground`}>No jobs yet</h2>
                <p className={`${FX_TYPOGRAPHY.cardSubtitle} text-muted-foreground`}>
                  Create your first job to start sourcing and evaluating candidates.
                </p>
                <div className="pt-[8px]">
                  <button
                    type="button"
                    className={fxButtonClassName({ size: "md", className: "w-fit rounded-[8px]" })}
                    onClick={openCreateSheet}
                  >
                    Create Job
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="overflow-hidden rounded-[16px] border border-border bg-card">
          <div className="overflow-x-auto">
            <table className="min-w-full table-fixed">
              <thead className="border-b border-border bg-[var(--fx-bg-soft)]">
                <tr className="text-left">
                  <th className={`w-[128px] px-[12px] py-[14px] ${JOBS_TABLE_HEADER_CLASS} text-muted-foreground`}>
                    <SortableHeader label="Job ID" sortKey="jobId" sortConfig={sortConfig} onSort={toggleSort} />
                  </th>
                  <th className={`w-[200px] px-[12px] py-[14px] ${JOBS_TABLE_HEADER_CLASS} text-muted-foreground`}>
                    <SortableHeader label="Job Title" sortKey="jobTitle" sortConfig={sortConfig} onSort={toggleSort} />
                  </th>
                  <th className={`w-[168px] px-[12px] py-[14px] ${JOBS_TABLE_HEADER_CLASS} text-muted-foreground`}>
                    <SortableHeader label="Client Name" sortKey="company" sortConfig={sortConfig} onSort={toggleSort} />
                  </th>
                  <th className={`w-[180px] px-[12px] py-[14px] ${JOBS_TABLE_HEADER_CLASS} text-muted-foreground`}>Location</th>
                  <th className={`w-[80px] px-[12px] py-[14px] ${JOBS_TABLE_HEADER_CLASS} text-muted-foreground`}>Positions</th>
                  <th className={`w-[92px] px-[12px] py-[14px] ${JOBS_TABLE_HEADER_CLASS} text-muted-foreground`}>Unscreened</th>
                  <th className={`w-[108px] px-[12px] py-[14px] ${JOBS_TABLE_HEADER_CLASS} text-muted-foreground`}>Pre-Screened</th>
                  <th className={`w-[92px] px-[12px] py-[14px] ${JOBS_TABLE_HEADER_CLASS} text-muted-foreground`}>Shortlisted</th>
                  <th className={`w-[116px] px-[12px] py-[14px] ${JOBS_TABLE_HEADER_CLASS} text-muted-foreground`}>Sent to Client</th>
                  <th className={`w-[132px] px-[12px] py-[14px] ${JOBS_TABLE_HEADER_CLASS} text-muted-foreground`}>Created By</th>
                  <th className={`w-[140px] px-[12px] py-[14px] ${JOBS_TABLE_HEADER_CLASS} text-muted-foreground`}>Last Updated</th>
                  <th className="w-[44px] px-[8px] py-[14px]" aria-hidden="true" />
                </tr>
              </thead>
              <tbody>
                {filteredJobs.map((job) => (
                  <tr key={job.id} className="group border-b border-border last:border-b-0 transition-colors hover:bg-accent/40">
                    <td className={`px-[12px] py-[12px] ${FX_TYPOGRAPHY.tableCell} text-foreground`}>
                      <div className="flex items-center gap-[8px]">
                        <StatusDot status={job.status} />
                        <button
                          type="button"
                          className={`inline-flex min-w-0 cursor-pointer items-center gap-[6px] text-left ${FX_TYPOGRAPHY.tableCell} text-foreground transition-colors`}
                          onClick={() => openWorkspace(job)}
                        >
                          <span className="truncate">{job.id}</span>
                        </button>
                      </div>
                    </td>
                    <td className={`px-[12px] py-[12px] ${FX_TYPOGRAPHY.tableCell} text-primary`}>
                      <button
                        type="button"
                        className={`inline-flex min-w-0 cursor-pointer items-center gap-[6px] text-left ${FX_TYPOGRAPHY.clickableData} text-primary transition-colors hover:text-foreground`}
                        onClick={() => openWorkspace(job)}
                      >
                        <span className="block max-w-[180px] truncate">{job.title}</span>
                      </button>
                    </td>
                    <td className={`px-[12px] py-[12px] ${FX_TYPOGRAPHY.tableCell} text-muted-foreground`}>
                      <div className="max-w-[148px] truncate">{job.company}</div>
                    </td>
                    <td className={`px-[12px] py-[12px] ${FX_TYPOGRAPHY.tableCell} text-muted-foreground`}>
                      <div className="max-w-[160px] truncate">{job.location}</div>
                    </td>
                    <td className={`px-[12px] py-[12px] ${FX_TYPOGRAPHY.tableCell} text-foreground`}>{job.positions ?? 1}</td>
                    <td className={`px-[12px] py-[12px] ${FX_TYPOGRAPHY.tableCell}`}>
                    <button
                      type="button"
                      className="flex w-full cursor-pointer justify-center rounded-[6px] px-[4px] py-[4px] text-center text-primary transition-colors hover:bg-primary/10 hover:text-foreground"
                      onClick={() => openWorkspace(job)}
                    >
                      {job.unscreenedCount ?? 0}
                    </button>
                  </td>
                  <td className={`px-[12px] py-[12px] ${FX_TYPOGRAPHY.tableCell}`}>
                    <button
                      type="button"
                      className="flex w-full cursor-pointer justify-center rounded-[6px] px-[4px] py-[4px] text-center text-primary transition-colors hover:bg-primary/10 hover:text-foreground"
                      onClick={() => openWorkspace(job)}
                    >
                      {job.preScreenedCount ?? 0}
                    </button>
                  </td>
                  <td className={`px-[12px] py-[12px] ${FX_TYPOGRAPHY.tableCell}`}>
                    <button
                      type="button"
                      className="flex w-full cursor-pointer justify-center rounded-[6px] px-[4px] py-[4px] text-center text-primary transition-colors hover:bg-primary/10 hover:text-foreground"
                      onClick={() => openWorkspace(job)}
                    >
                      {job.shortlistedCount ?? 0}
                    </button>
                  </td>
                  <td className={`px-[12px] py-[12px] ${FX_TYPOGRAPHY.tableCell}`}>
                    <button
                      type="button"
                      className="flex w-full cursor-pointer justify-center rounded-[6px] px-[4px] py-[4px] text-center text-primary transition-colors hover:bg-primary/10 hover:text-foreground"
                      onClick={() => openWorkspace(job)}
                    >
                      {job.sentToClientCount ?? 0}
                    </button>
                  </td>
                    <td className={`px-[12px] py-[12px] ${FX_TYPOGRAPHY.tableCell} text-muted-foreground`}>
                      <div className="max-w-[124px] truncate">{job.createdBy || DEMO_USER.name}</div>
                    </td>
                    <td className={`px-[12px] py-[12px] ${FX_TYPOGRAPHY.tableCell} text-muted-foreground`}>
                      <div className="max-w-[124px] truncate">{job.updatedBy || "—"}</div>
                      <div className={FX_TYPOGRAPHY.caption}>{formatDate(job.updatedAt)}</div>
                    </td>
                    <td className="px-[8px] py-[12px]" onClick={(event) => event.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            type="button"
                            className="flex h-[32px] w-[32px] cursor-pointer items-center justify-center rounded-[6px] text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                            aria-label="Job actions"
                          >
                            <MoreHorizontal className="size-[16px]" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[220px]">
                          <DropdownMenuItem onClick={() => openJobEditor(job)}>
                            Edit Job
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openWorkspace(job)}>View Candidates</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => duplicateJob(job)}>Duplicate Job</DropdownMenuItem>
                          {job.isArchived ? (
                            <DropdownMenuItem onClick={() => restoreJob(job)}>Restore Job</DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem onClick={() => archiveJob(job)}>Archive Job</DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            className="text-[var(--fx-danger)] focus:text-[var(--fx-danger)]"
                            onClick={() => {
                              setDeleteJobTarget(job);
                              setIsDeleteAlertOpen(true);
                            }}
                          >
                            Delete Job
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Sheet
        open={isSheetOpen}
        onOpenChange={(open) => {
          if (open) {
            setIsSheetOpen(true);
            return;
          }

          confirmDiscardAndClose();
        }}
      >
        <SheetContent
          side="right"
          size="xl"
          className="h-full max-w-none"
          onEscapeKeyDown={(event) => {
            if (sheetState?.isDirty) {
              event.preventDefault();
              setIsDiscardAlertOpen(true);
              return;
            }

            closeSheet();
          }}
        >
          <SheetHeader
            title={editingJob ? "Edit Job" : "Create Job"}
            description="Fill the essentials, use AI helpers where useful, then save as draft or publish."
            actions={
              <>
                <button
                  type="button"
                  className={fxButtonClassName({ variant: "outline", size: "sm", className: "rounded-[8px]" })}
                  onClick={() => formRef.current?.saveDraft()}
                >
                  Save Draft
                </button>
                <button
                  type="button"
                  className={fxButtonClassName({ size: "sm", className: "rounded-[8px]" })}
                  onClick={() => formRef.current?.publish()}
                >
                  Publish Job
                </button>
              </>
            }
          />

          <SheetBody>
            <CreateJobForm
              ref={formRef}
              initialDraft={editingJob?.data || null}
              onSaveDraft={(draft) => handlePersistDraft(draft, "Draft")}
              onPublishJob={(draft) => handlePersistDraft(draft, "Published")}
              onStateChange={setSheetState}
            />
          </SheetBody>

          <SheetFooter
            left={
              <div className="space-y-[2px]">
                <div className={`${FX_TYPOGRAPHY.metaLabel} uppercase tracking-[0.08em] text-muted-foreground`}>
                  Workflow
                </div>
                <div className={`${FX_TYPOGRAPHY.small} text-foreground`}>
                  Step {sheetState?.currentStepIndex + 1 || 1} of {sheetState?.steps?.length || 6}
                </div>
              </div>
            }
            right={
              <>
                <button
                  type="button"
                  className={fxButtonClassName({
                    variant: "outline",
                    size: "sm",
                    className: "rounded-[8px]",
                  })}
                  onClick={() => formRef.current?.back()}
                  disabled={!sheetState?.canGoBack}
                >
                  Back
                </button>
                <button
                  type="button"
                  className={fxButtonClassName({ size: "sm", className: "rounded-[8px]" })}
                  onClick={() => formRef.current?.next()}
                  disabled={!sheetState?.canGoNext}
                >
                  Next
                </button>
              </>
            }
          />
        </SheetContent>
      </Sheet>

      <AlertDialog
        open={isDiscardAlertOpen}
        onOpenChange={(open) => {
          setIsDiscardAlertOpen(open);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard changes?</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes in this job draft. Closing now will discard them.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className={fxButtonClassName({ variant: "outline", size: "sm", className: "rounded-[8px]" })}>
              Keep editing
            </AlertDialogCancel>
            <AlertDialogAction
              className={fxButtonClassName({ size: "sm", className: "rounded-[8px]" })}
              onClick={() => closeSheet()}
            >
              Discard changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={isDeleteAlertOpen}
        onOpenChange={(open) => {
          setIsDeleteAlertOpen(open);
          if (!open) {
            setDeleteJobTarget(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete job?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove {deleteJobTarget?.title || "this job"} from the Jobs table.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className={fxButtonClassName({ variant: "outline", size: "sm", className: "rounded-[8px]" })}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className={fxButtonClassName({ variant: "primary", size: "sm", className: "rounded-[8px]" })}
              onClick={deleteJob}
            >
              Delete Job
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Toast
        open={toastState.open}
        onOpenChange={(open) => setToastState((currentToast) => ({ ...currentToast, open }))}
      >
        <div className="space-y-[4px]">
          <ToastTitle>{toastState.title}</ToastTitle>
          <ToastDescription>{toastState.description}</ToastDescription>
        </div>
        {toastState.actionLabel ? (
          <ToastAction
            altText={toastState.actionLabel}
            onClick={() => {
              if (toastState.actionHref) {
                router.push(toastState.actionHref);
              }
            }}
          >
            {toastState.actionLabel}
          </ToastAction>
        ) : null}
        <ToastClose />
      </Toast>
    </div>
  );
}
