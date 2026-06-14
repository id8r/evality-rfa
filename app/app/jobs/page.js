/* app/app/jobs/page.js | Jobs workspace page | Sree | 2026-06-14 */

"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { Archive, ArrowUpDown, BriefcaseBusiness, MoreHorizontal, RefreshCcw, Search } from "lucide-react";

import { FxButton } from "@/components/FxButton";
import { FxEmptyState } from "@/components/FxEmptyState";
import { FxInput } from "@/components/FxInput";
import { FxProtectedAppPage } from "@/components/FxProtectedAppPage";
import { FxTable } from "@/components/FxTable";
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetFooter,
  SheetHeader,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ROUTES } from "@/lib/FxConstants";
import { PAGE_COPY } from "@/lib/FxCopy";
import {
  createJobId,
  ensureJobsStore,
  readStoredJobsPageState,
  readStoredJobsViewMode,
  resetDemoStore,
  upsertStoredJob,
  writeStoredJobs,
  writeStoredJobsPageState,
  writeStoredJobsViewMode,
} from "@/lib/FxStore";
import { FX_COLORS, FX_LAYOUT, FX_RADIUS, FX_TYPOGRAPHY } from "@/lib/FxTheme";

const DEFAULT_PAGE_STATE = {
  searchTerm: "",
  selectedTab: "active",
  sortConfig: { key: "updatedAt", direction: "desc" },
};

const EMPTY_JOB_FORM = {
  title: "",
  company: "",
  positions: "1",
  location: "",
  experience: "",
  status: "Draft",
};

function normalizeJob(job) {
  return {
    ...job,
    status: job.status === "Published" ? "Published" : "Draft",
    positions: Number(job.positions) || 1,
    unscreenedCount: Number(job.unscreenedCount) || 0,
    screenedCount: Number(job.preScreenedCount ?? job.screenedCount) || 0,
    shortlistedCount: Number(job.shortlistedCount) || 0,
    sharedCount: Number(job.sentToClientCount ?? job.sharedCount) || 0,
    createdBy: job.createdBy ?? "John Doe",
    updatedBy: job.updatedBy ?? "John Doe",
    data: {
      ...(job.data ?? {}),
      jobTitle: job.data?.jobTitle ?? job.title ?? "",
    },
  };
}

function createFormFromJob(job) {
  if (!job) {
    return EMPTY_JOB_FORM;
  }

  return {
    title: job.title ?? "",
    company: job.company ?? "",
    positions: String(job.positions ?? 1),
    location: job.location ?? "",
    experience: job.experience ?? "",
    status: job.status === "Published" ? "Published" : "Draft",
  };
}

function formatRelativeTime(value) {
  const timestamp = new Date(value).getTime();
  const now = Date.now();
  const diffMs = Math.max(0, now - timestamp);
  const diffMinutes = Math.floor(diffMs / 60000);

  if (diffMinutes < 60) {
    return `${Math.max(1, diffMinutes)} min ago`;
  }

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  }

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
}

function fieldButtonClassName(isInteractive = false) {
  return `${FX_TYPOGRAPHY.metaLabel} font-normal text-[var(--fx-text-muted)] ${
    isInteractive ? "inline-flex cursor-pointer items-center gap-[8px] text-left hover:text-[var(--fx-text)]" : ""
  }`;
}

export default function JobsPage() {
  const initialPageState = readStoredJobsPageState() ?? DEFAULT_PAGE_STATE;
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [jobForm, setJobForm] = useState(EMPTY_JOB_FORM);
  const [formError, setFormError] = useState("");
  const [showDemoData, setShowDemoData] = useState(() => readStoredJobsViewMode() === "table");
  const [searchTerm, setSearchTerm] = useState(initialPageState.searchTerm ?? DEFAULT_PAGE_STATE.searchTerm);
  const [selectedTab, setSelectedTab] = useState(initialPageState.selectedTab ?? DEFAULT_PAGE_STATE.selectedTab);
  const [sortConfig, setSortConfig] = useState(initialPageState.sortConfig ?? DEFAULT_PAGE_STATE.sortConfig);
  const [jobs, setJobs] = useState(() => ensureJobsStore().map(normalizeJob));
  const searchInputRef = useRef(null);
  const tableSurfaceRef = useRef(null);

  useEffect(() => {
    writeStoredJobsPageState({ searchTerm, selectedTab, sortConfig });
  }, [searchTerm, selectedTab, sortConfig]);

  useEffect(() => {
    function handleGlobalKeyDown(event) {
      const target = event.target;
      const isSearchFocused = target === searchInputRef.current;

      if (!showDemoData) {
        return;
      }

      if (event.key === "/" && !event.metaKey && !event.ctrlKey && !event.altKey && !event.shiftKey && !isSearchFocused) {
        event.preventDefault();
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
        return;
      }

      if (event.key === "Escape" && isSearchFocused) {
        if (searchTerm) {
          setSearchTerm("");
          searchInputRef.current?.focus();
          event.preventDefault();
          return;
        }

        if (tableSurfaceRef.current) {
          tableSurfaceRef.current.focus();
          event.preventDefault();
        }
      }
    }

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [searchTerm, showDemoData]);

  function persistJobs(nextJobs) {
    setJobs(nextJobs);
    writeStoredJobs(
      nextJobs.map((job) => ({
        ...job,
        preScreenedCount: job.screenedCount,
        sentToClientCount: job.sharedCount,
      })),
    );
  }

  function handleCreateJob() {
    setEditingJob(null);
    setJobForm(EMPTY_JOB_FORM);
    setFormError("");
    setIsSheetOpen(true);
  }

  function handleEditJob(job) {
    setEditingJob(job);
    setJobForm(createFormFromJob(job));
    setFormError("");
    setIsSheetOpen(true);
  }

  function handleArchiveJob(jobId) {
    persistJobs(jobs.map((job) => (job.id === jobId ? { ...job, isArchived: true } : job)));
  }

  function handleRestoreJob(jobId) {
    persistJobs(jobs.map((job) => (job.id === jobId ? { ...job, isArchived: false } : job)));
  }

  function handleDeleteJob(jobId) {
    persistJobs(jobs.filter((job) => job.id !== jobId));
  }

  function handleSort(key) {
    setSortConfig((current) => {
      if (current.key === key) {
        return { key, direction: current.direction === "asc" ? "desc" : "asc" };
      }

      return { key, direction: key === "updatedAt" ? "desc" : "asc" };
    });
  }

  function handleJobFormChange(event) {
    const { name, value } = event.target;

    setJobForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function handleSubmitJob(event) {
    event.preventDefault();

    const title = jobForm.title.trim();
    const company = jobForm.company.trim();

    if (!title || !company) {
      setFormError("Job title and client are required.");
      return;
    }

    const nextJob = normalizeJob(
      upsertStoredJob({
        id: editingJob?.id ?? createJobId(),
        title,
        company,
        positions: Math.max(1, Number(jobForm.positions) || 1),
        location: jobForm.location.trim(),
        experience: jobForm.experience.trim(),
        status: jobForm.status === "Published" ? "Published" : "Draft",
        isArchived: editingJob?.isArchived ?? false,
        unscreenedCount: editingJob?.unscreenedCount ?? 0,
        preScreenedCount: editingJob?.screenedCount ?? 0,
        shortlistedCount: editingJob?.shortlistedCount ?? 0,
        sentToClientCount: editingJob?.sharedCount ?? 0,
        createdBy: editingJob?.createdBy ?? "John Doe",
        updatedBy: "John Doe",
        data: {
          ...(editingJob?.data ?? {}),
          jobTitle: title,
        },
      }),
    );

    setJobs((currentJobs) => {
      const exists = currentJobs.some((job) => job.id === nextJob.id);
      return exists
        ? currentJobs.map((job) => (job.id === nextJob.id ? nextJob : job))
        : [nextJob, ...currentJobs];
    });

    setIsSheetOpen(false);
    setEditingJob(null);
    setJobForm(EMPTY_JOB_FORM);
    setFormError("");
    setShowDemoData(true);
    writeStoredJobsViewMode("table");
  }

  const filteredJobs = useMemo(() => {
    let nextJobs = jobs;

    nextJobs = nextJobs.filter((job) => (selectedTab === "active" ? !job.isArchived : job.isArchived));

    if (searchTerm.trim()) {
      const query = searchTerm.trim().toLowerCase();
      nextJobs = nextJobs.filter((job) =>
        [job.title, job.company, job.location].some((value) => value.toLowerCase().includes(query)),
      );
    }

    return [...nextJobs].sort((left, right) => {
      const leftValue = left[sortConfig.key];
      const rightValue = right[sortConfig.key];

      if (typeof leftValue === "number" && typeof rightValue === "number") {
        return sortConfig.direction === "asc" ? leftValue - rightValue : rightValue - leftValue;
      }

      if (sortConfig.key === "updatedAt") {
        const leftDate = new Date(left.updatedAt).getTime();
        const rightDate = new Date(right.updatedAt).getTime();
        return sortConfig.direction === "asc" ? leftDate - rightDate : rightDate - leftDate;
      }

      return sortConfig.direction === "asc"
        ? String(leftValue).localeCompare(String(rightValue))
        : String(rightValue).localeCompare(String(leftValue));
    });
  }, [jobs, searchTerm, sortConfig, selectedTab]);

  const activeCount = useMemo(() => jobs.filter((job) => !job.isArchived).length, [jobs]);
  const archivedCount = useMemo(() => jobs.filter((job) => job.isArchived).length, [jobs]);

  function handleToggleJobsView() {
    setShowDemoData((current) => {
      const next = !current;
      writeStoredJobsViewMode(next ? "table" : "empty");
      return next;
    });
  }

  function handleResetDemoData() {
    resetDemoStore();
    const nextJobs = ensureJobsStore().map(normalizeJob);

    setJobs(nextJobs);
    setJobForm(EMPTY_JOB_FORM);
    setEditingJob(null);
    setFormError("");
    setIsSheetOpen(false);
    setShowDemoData(false);
    setSearchTerm(DEFAULT_PAGE_STATE.searchTerm);
    setSelectedTab(DEFAULT_PAGE_STATE.selectedTab);
    setSortConfig(DEFAULT_PAGE_STATE.sortConfig);

    writeStoredJobsPageState(DEFAULT_PAGE_STATE);
  }

  const columns = [
    {
      key: "title",
      label: (
        <button
          type="button"
          className={fieldButtonClassName(true)}
          onClick={() => handleSort("title")}
        >
          <span>Job Title</span>
          <ArrowUpDown className="size-[14px]" />
        </button>
      ),
      width: "24%",
      cellClassName: FX_TYPOGRAPHY.clickableData,
    },
    {
      key: "company",
      label: (
        <button
          type="button"
          className={fieldButtonClassName(true)}
          onClick={() => handleSort("company")}
        >
          <span>Client</span>
          <ArrowUpDown className="size-[14px]" />
        </button>
      ),
      width: "14%",
    },
    {
      key: "positions",
      label: <button type="button" className={fieldButtonClassName()} disabled><span>Positions</span></button>,
      width: "8%",
    },
    {
      key: "location",
      label: <button type="button" className={fieldButtonClassName()} disabled><span>Location</span></button>,
      width: "15%",
    },
    {
      key: "unscreenedCount",
      label: <button type="button" className={fieldButtonClassName()} disabled><span>Unscreened</span></button>,
      width: "8%",
      align: "center",
    },
    {
      key: "screenedCount",
      label: <button type="button" className={fieldButtonClassName()} disabled><span>Screened</span></button>,
      width: "8%",
      align: "center",
    },
    {
      key: "shortlistedCount",
      label: <button type="button" className={fieldButtonClassName()} disabled><span>Shortlisted</span></button>,
      width: "8%",
      align: "center",
    },
    {
      key: "sharedCount",
      label: <button type="button" className={fieldButtonClassName()} disabled><span>Shared</span></button>,
      width: "7%",
      align: "center",
    },
    {
      key: "lastActivity",
      label: (
        <button
          type="button"
          className={fieldButtonClassName(true)}
          onClick={() => handleSort("updatedAt")}
        >
          <span>Last Activity</span>
          <ArrowUpDown className="size-[14px]" />
        </button>
      ),
      width: "12%",
    },
    {
      key: "actions",
      label: "",
      width: "6%",
      align: "right",
    },
  ];

  function renderPipelineCell(value, label) {
    return (
      <button
        type="button"
        className={`block w-full rounded-[8px] px-[4px] py-[4px] text-center ${FX_TYPOGRAPHY.tableCell} text-[var(--fx-text)] hover:bg-[var(--fx-surface-hover)] hover:text-[var(--fx-primary)]`}
        title={`${label}: ${value}`}
      >
        {value}
      </button>
    );
  }

  function renderStatusDot(job) {
    const isDraft = job.status === "Draft";

    return (
      <span
        className={`inline-flex size-[8px] shrink-0 rounded-full ${isDraft ? "bg-[var(--fx-warning)]" : "bg-[var(--fx-success)]"}`}
        title={isDraft ? "Draft" : "Published"}
        aria-label={isDraft ? "Draft" : "Published"}
        aria-hidden="true"
      />
    );
  }

  const rows = filteredJobs.map((job) => ({
    id: job.id,
    title: (
      <div className="flex items-center gap-[10px]">
        {renderStatusDot(job)}
        {job.status === "Draft" ? (
          <button
            type="button"
            className={`block truncate text-left text-[var(--fx-primary)] hover:text-[var(--fx-text)] ${FX_TYPOGRAPHY.clickableData}`}
            title={job.title}
            onClick={() => handleEditJob(job)}
          >
            {job.title}
          </button>
        ) : (
          <Link
            href={ROUTES.JOB(job.id)}
            className={`block truncate text-[var(--fx-primary)] hover:text-[var(--fx-text)] ${FX_TYPOGRAPHY.clickableData}`}
            title={job.title}
          >
            {job.title}
          </Link>
        )}
      </div>
    ),
    company: <span className={`block truncate ${FX_TYPOGRAPHY.tableCell}`}>{job.company}</span>,
    positions: <span className={FX_TYPOGRAPHY.tableCell}>{job.positions}</span>,
    location: <span className={`block truncate ${FX_TYPOGRAPHY.tableCell}`}>{job.location}</span>,
    unscreenedCount: renderPipelineCell(job.unscreenedCount, "Unscreened"),
    screenedCount: renderPipelineCell(job.screenedCount, "Screened"),
    shortlistedCount: renderPipelineCell(job.shortlistedCount, "Shortlisted"),
    sharedCount: renderPipelineCell(job.sharedCount, "Shared"),
    lastActivity: (
      <span className={`block truncate ${FX_TYPOGRAPHY.tableCell} text-[var(--fx-text-muted)]`} title={new Date(job.updatedAt).toLocaleString()}>
        {formatRelativeTime(job.updatedAt)}
      </span>
    ),
    actions: (
      <div className="flex justify-end">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className={`inline-flex h-[32px] w-[32px] cursor-pointer items-center justify-center ${FX_RADIUS.xs} text-[var(--fx-text-muted)] hover:bg-[var(--fx-bg-soft)] hover:text-[var(--fx-text)]`}
            >
              <MoreHorizontal className="size-[16px]" />
              <span className="sr-only">Open actions</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-[200px]">
            {job.status === "Draft" ? (
              <>
                <DropdownMenuItem onClick={() => handleEditJob(job)}>Edit Job</DropdownMenuItem>
                <DropdownMenuItem className="text-[var(--fx-danger)]" onClick={() => handleDeleteJob(job.id)}>
                  Delete Job
                </DropdownMenuItem>
              </>
            ) : selectedTab === "archived" ? (
              <>
                <DropdownMenuItem asChild>
                  <Link href={ROUTES.JOB(job.id)}>View Candidates</Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleEditJob(job)}>Edit Job</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleRestoreJob(job.id)}>Restore Job</DropdownMenuItem>
                <DropdownMenuItem className="text-[var(--fx-danger)]" onClick={() => handleDeleteJob(job.id)}>
                  Delete Job
                </DropdownMenuItem>
              </>
            ) : (
              <>
                <DropdownMenuItem asChild>
                  <Link href={ROUTES.JOB(job.id)}>View Candidates</Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleEditJob(job)}>Edit Job</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleArchiveJob(job.id)}>Archive Job</DropdownMenuItem>
                <DropdownMenuItem className="text-[var(--fx-danger)]" onClick={() => handleDeleteJob(job.id)}>
                  Delete Job
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    ),
  }));

  return (
    <FxProtectedAppPage pageId="jobs">
      <section className={`${FX_LAYOUT.contentWidthWide} space-y-[24px]`}>
        {showDemoData ? (
          <div className="space-y-[16px]">
            <div className={`rounded-[16px] border ${FX_COLORS.border} bg-[var(--fx-surface)] p-[16px]`}>
              <div className="flex flex-col gap-[16px] lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-wrap items-end gap-[24px]">
                  <button
                    type="button"
                    className={`relative cursor-pointer pb-[8px] ${selectedTab === "active" ? "text-[var(--fx-text)]" : "text-[var(--fx-text-muted)]"} ${FX_TYPOGRAPHY.button}`}
                    onClick={() => setSelectedTab("active")}
                  >
                    {PAGE_COPY.jobs.activeTab} ({activeCount})
                    {selectedTab === "active" ? <span className="absolute bottom-0 left-[4px] right-[4px] h-[3px] rounded-full bg-[var(--fx-primary)]" /> : null}
                  </button>
                  <button
                    type="button"
                    className={`relative cursor-pointer pb-[8px] ${selectedTab === "archived" ? "text-[var(--fx-text)]" : "text-[var(--fx-text-muted)]"} ${FX_TYPOGRAPHY.button}`}
                    onClick={() => setSelectedTab("archived")}
                  >
                    {PAGE_COPY.jobs.archivedTab} ({archivedCount})
                    {selectedTab === "archived" ? <span className="absolute bottom-0 left-[4px] right-[4px] h-[3px] rounded-full bg-[var(--fx-primary)]" /> : null}
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-[12px] lg:justify-end">
                  <div className="relative w-full max-w-[320px]">
                    <Search className="pointer-events-none absolute left-[12px] top-1/2 size-[16px] -translate-y-1/2 text-[var(--fx-text-muted)]" />
                    <FxInput
                      ref={searchInputRef}
                      aria-label="Search jobs"
                      className="pl-[40px]"
                      placeholder={PAGE_COPY.jobs.searchPlaceholder}
                      value={searchTerm}
                      onChange={(event) => setSearchTerm(event.target.value)}
                      rightElement={(
                        <span className="inline-flex h-[24px] min-w-[24px] items-center justify-center rounded-[6px] border border-[var(--fx-border)] bg-[var(--fx-surface)] px-[8px] text-[12px] leading-[18px] font-medium text-[var(--fx-text-muted)]">
                          /
                        </span>
                      )}
                    />
                  </div>
                  <FxButton onClick={handleCreateJob}>Create Job</FxButton>
                </div>
              </div>
            </div>

            {selectedTab === "archived" && !filteredJobs.length ? (
              <FxEmptyState
                icon={Archive}
                title={PAGE_COPY.jobs.archivedEmptyTitle}
                body={PAGE_COPY.jobs.archivedEmptyBody}
              />
            ) : (
              <div ref={tableSurfaceRef} tabIndex={0} className="outline-none focus-visible:ring-2 focus-visible:ring-[var(--fx-primary)]/20">
                <FxTable columns={columns} rows={rows} stickyHeader emptyMessage={PAGE_COPY.jobs.tableEmpty} />
              </div>
            )}
          </div>
        ) : (
          <FxEmptyState
            icon={BriefcaseBusiness}
            title={PAGE_COPY.jobs.empty}
            body={PAGE_COPY.jobs.emptyBody}
            action={<FxButton onClick={handleCreateJob}>{PAGE_COPY.jobs.createCta}</FxButton>}
          />
        )}
      </section>

      <div className="fixed bottom-[16px] right-[16px] z-20 flex items-center gap-[8px]">
        {process.env.NODE_ENV === "development" ? (
          <button
            type="button"
            aria-label="Reset demo data"
            title="Reset demo data"
            className={`flex h-[28px] w-[28px] cursor-pointer items-center justify-center rounded-full border ${FX_COLORS.border} bg-[var(--fx-surface)] ${FX_TYPOGRAPHY.caption} text-[var(--fx-text-muted)] opacity-0 transition-opacity hover:opacity-100`}
            onClick={handleResetDemoData}
          >
            <RefreshCcw className="size-[12px]" />
          </button>
        ) : null}

        <button
          type="button"
          aria-label="Toggle demo jobs state"
          className={`flex h-[28px] w-[28px] cursor-pointer items-center justify-center rounded-full border ${FX_COLORS.border} bg-[var(--fx-surface)] ${FX_TYPOGRAPHY.caption} text-[var(--fx-text-muted)] opacity-25 hover:opacity-100`}
          onClick={handleToggleJobsView}
        >
          J
        </button>
      </div>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent size="lg">
          <SheetHeader
            title={editingJob ? PAGE_COPY.jobs.editCta : PAGE_COPY.jobs.createCta}
            description={editingJob ? PAGE_COPY.jobs.sheetEditDescription : PAGE_COPY.jobs.sheetCreateDescription}
          />

          <form className="flex min-h-0 flex-1 flex-col" onSubmit={handleSubmitJob}>
            <SheetBody className="space-y-[24px]">
              <section className="space-y-[8px]">
                  <h2 className={FX_TYPOGRAPHY.sectionTitle}>{editingJob ? editingJob.id : "New Job"}</h2>
                  <p className={`${FX_TYPOGRAPHY.body} text-muted-foreground`}>
                    Core job details now persist through `FxStore` so the list view and the workspace share one local source of truth.
                  </p>
              </section>

              <div className="grid gap-[16px] md:grid-cols-2">
                <FxInput
                  name="title"
                  label="Job Title"
                  placeholder="Senior Frontend Engineer"
                  value={jobForm.title}
                  onChange={handleJobFormChange}
                />
                <FxInput
                  name="company"
                  label="Client"
                  placeholder="ThinkJS"
                  value={jobForm.company}
                  onChange={handleJobFormChange}
                />
                <FxInput
                  name="positions"
                  label="Positions"
                  min="1"
                  type="number"
                  value={jobForm.positions}
                  onChange={handleJobFormChange}
                />
                <label className="flex w-full flex-col gap-[8px]" htmlFor="status">
                  <span className={`${FX_TYPOGRAPHY.fieldLabel} text-[var(--fx-text)]`}>Status</span>
                  <select
                    id="status"
                    name="status"
                    className={`min-h-[40px] w-full border ${FX_COLORS.border} ${FX_RADIUS.xs} bg-[var(--fx-bg)] px-[16px] py-[8px] ${FX_TYPOGRAPHY.input} text-[var(--fx-text)] outline-none focus:border-[var(--fx-primary)] focus:ring-2 focus:ring-[var(--fx-primary)]/20`}
                    value={jobForm.status}
                    onChange={handleJobFormChange}
                  >
                    <option value="Draft">Draft</option>
                    <option value="Published">Published</option>
                  </select>
                </label>
                <FxInput
                  name="location"
                  label="Location"
                  placeholder="HSR Layout, Bengaluru"
                  value={jobForm.location}
                  onChange={handleJobFormChange}
                />
                <FxInput
                  name="experience"
                  label="Experience"
                  placeholder="3 - 5 yrs"
                  value={jobForm.experience}
                  onChange={handleJobFormChange}
                />
              </div>

              {formError ? <p className={`${FX_TYPOGRAPHY.fieldHint} text-[var(--fx-danger)]`}>{formError}</p> : null}
            </SheetBody>

            <SheetFooter
              left={<span className={`${FX_TYPOGRAPHY.fieldHint} text-muted-foreground`}>Local-first Jobs CRUD</span>}
              right={
                <>
                  <FxButton variant="secondary" onClick={() => setIsSheetOpen(false)}>
                    Cancel
                  </FxButton>
                  <FxButton type="submit">{editingJob ? "Save Changes" : "Create Job"}</FxButton>
                </>
              }
            />
          </form>
        </SheetContent>
      </Sheet>
    </FxProtectedAppPage>
  );
}
