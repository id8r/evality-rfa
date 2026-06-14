/* app/app/jobs/page.js | Jobs workspace page | Sree | 2026-06-14 */

"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Archive, BriefcaseBusiness, MoreHorizontal, Search, ArrowUpDown } from "lucide-react";

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
import { ensureJobsStore, readStoredJobsViewMode, writeStoredJobs, writeStoredJobsViewMode } from "@/lib/FxStore";
import { FX_COLORS, FX_LAYOUT, FX_RADIUS, FX_TYPOGRAPHY } from "@/lib/FxTheme";

function normalizeJob(job) {
  return {
    ...job,
    status: job.status === "Published" ? "Published" : "Draft",
    screenedCount: job.preScreenedCount ?? 0,
    sharedCount: job.sentToClientCount ?? 0,
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

export default function JobsPage() {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [showDemoData, setShowDemoData] = useState(() => readStoredJobsViewMode() === "table");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTab, setSelectedTab] = useState("active");
  const [sortConfig, setSortConfig] = useState({ key: "updatedAt", direction: "desc" });
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    const storedJobs = ensureJobsStore();
    setJobs(storedJobs.map(normalizeJob));
  }, []);

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
    setIsSheetOpen(true);
  }

  function handleEditJob(job) {
    setEditingJob(job);
    setIsSheetOpen(true);
  }

  function handleArchiveJob(jobId) {
    persistJobs(
      jobs.map((job) =>
        job.id === jobId ? { ...job, isArchived: true } : job,
      ),
    );
  }

  function handleRestoreJob(jobId) {
    persistJobs(
      jobs.map((job) =>
        job.id === jobId ? { ...job, isArchived: false } : job,
      ),
    );
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

  const filteredJobs = useMemo(() => {
    let nextJobs = jobs;

    nextJobs = nextJobs.filter((job) => (selectedTab === "active" ? !job.isArchived : job.isArchived));

    if (searchTerm.trim()) {
      const query = searchTerm.trim().toLowerCase();
      nextJobs = nextJobs.filter((job) =>
        [job.title, job.company, job.location].some((value) => value.toLowerCase().includes(query)),
      );
    }

    const sortedJobs = [...nextJobs].sort((left, right) => {
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

    return sortedJobs;
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

  const columns = [
    {
      key: "title",
      label: (
        <button
          type="button"
          className={`inline-flex cursor-pointer items-center gap-[8px] text-left ${FX_TYPOGRAPHY.metaLabel} font-normal text-[var(--fx-text-muted)] hover:text-[var(--fx-text)]`}
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
          className={`inline-flex cursor-pointer items-center gap-[8px] text-left ${FX_TYPOGRAPHY.metaLabel} font-normal text-[var(--fx-text-muted)] hover:text-[var(--fx-text)]`}
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
      label: (
        <button
          type="button"
          className={`${FX_TYPOGRAPHY.metaLabel} font-normal text-[var(--fx-text-muted)]`}
          disabled
        >
          <span>Positions</span>
        </button>
      ),
      width: "8%",
    },
    {
      key: "location",
      label: (
        <button
          type="button"
          className={`${FX_TYPOGRAPHY.metaLabel} font-normal text-[var(--fx-text-muted)]`}
          disabled
        >
          <span>Location</span>
        </button>
      ),
      width: "15%",
    },
    {
      key: "unscreenedCount",
      label: (
        <button
          type="button"
          className={`${FX_TYPOGRAPHY.metaLabel} font-normal text-[var(--fx-text-muted)]`}
          disabled
        >
          <span>Unscreened</span>
        </button>
      ),
      width: "8%",
      align: "center",
    },
    {
      key: "screenedCount",
      label: (
        <button
          type="button"
          className={`${FX_TYPOGRAPHY.metaLabel} font-normal text-[var(--fx-text-muted)]`}
          disabled
        >
          <span>Screened</span>
        </button>
      ),
      width: "8%",
      align: "center",
    },
    {
      key: "shortlistedCount",
      label: (
        <button
          type="button"
          className={`${FX_TYPOGRAPHY.metaLabel} font-normal text-[var(--fx-text-muted)]`}
          disabled
        >
          <span>Shortlisted</span>
        </button>
      ),
      width: "8%",
      align: "center",
    },
    {
      key: "sharedCount",
      label: (
        <button
          type="button"
          className={`${FX_TYPOGRAPHY.metaLabel} font-normal text-[var(--fx-text-muted)]`}
          disabled
        >
          <span>Shared</span>
        </button>
      ),
      width: "7%",
      align: "center",
    },
    {
      key: "lastActivity",
      label: (
        <button
          type="button"
          className={`inline-flex cursor-pointer items-center gap-[8px] text-left ${FX_TYPOGRAPHY.metaLabel} font-normal text-[var(--fx-text-muted)] hover:text-[var(--fx-text)]`}
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
        className={`block w-full rounded-[8px] px-[4px] py-[4px] text-center ${FX_TYPOGRAPHY.tableCell} text-[var(--fx-text)] hover:bg-[var(--fx-bg-soft)]/80 hover:text-[var(--fx-primary)]`}
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
        className={`mt-[4px] inline-flex size-[8px] shrink-0 rounded-full ${isDraft ? "bg-[var(--fx-warning)]" : "bg-[var(--fx-success)]"}`}
        aria-hidden="true"
      />
    );
  }

  const rows = filteredJobs.map((job) => ({
    id: job.id,
    title: (
      <div className="flex items-start gap-[10px]">
        {renderStatusDot(job)}
        {job.status === "Draft" ? (
          <button
            type="button"
            className={`block truncate text-left text-[var(--fx-primary)] hover:opacity-80 ${FX_TYPOGRAPHY.clickableData}`}
            title={job.title}
            onClick={() => handleEditJob(job)}
          >
            {job.title}
          </button>
        ) : (
          <Link
            href={ROUTES.JOB(job.id)}
            className={`block truncate text-[var(--fx-primary)] hover:opacity-80 ${FX_TYPOGRAPHY.clickableData}`}
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
          <>
            <div className="space-y-[16px]">
              <div className="flex items-center gap-[24px] border-b border-border">
                <button
                  type="button"
                  className={`relative cursor-pointer pb-[12px] ${selectedTab === "active" ? "text-[var(--fx-text)]" : "text-[var(--fx-text-muted)]"} ${FX_TYPOGRAPHY.button}`}
                  onClick={() => setSelectedTab("active")}
                >
                  Active ({activeCount})
                  {selectedTab === "active" ? <span className="absolute bottom-0 left-0 h-[2px] w-full bg-[var(--fx-primary)]" /> : null}
                </button>
                <button
                  type="button"
                  className={`relative cursor-pointer pb-[12px] ${selectedTab === "archived" ? "text-[var(--fx-text)]" : "text-[var(--fx-text-muted)]"} ${FX_TYPOGRAPHY.button}`}
                  onClick={() => setSelectedTab("archived")}
                >
                  Archived ({archivedCount})
                  {selectedTab === "archived" ? <span className="absolute bottom-0 left-0 h-[2px] w-full bg-[var(--fx-primary)]" /> : null}
                </button>
              </div>

              <div className="flex flex-wrap items-center justify-end gap-[12px]">
                <div className="relative w-full max-w-[320px]">
                  <Search className="pointer-events-none absolute left-[12px] top-1/2 size-[16px] -translate-y-1/2 text-[var(--fx-text-muted)]" />
                  <FxInput
                    aria-label="Search jobs"
                    className="pl-[40px]"
                    placeholder="Search Jobs"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                  />
                </div>
                <FxButton onClick={handleCreateJob}>Create Job</FxButton>
              </div>

              {selectedTab === "archived" && !filteredJobs.length ? (
                <FxEmptyState
                  icon={Archive}
                  title="No archived jobs"
                  body="Archive closed or discarded jobs to keep your active hiring workspace focused."
                />
              ) : (
                <FxTable columns={columns} rows={rows} stickyHeader emptyMessage="No jobs match the current search." />
              )}
            </div>
          </>
        ) : (
          <FxEmptyState
            icon={BriefcaseBusiness}
            title="No jobs yet"
            body="Create your first role to start managing candidates in one workspace."
            action={<FxButton onClick={handleCreateJob}>Create Job</FxButton>}
          />
        )}

      </section>

      {process.env.NODE_ENV !== "production" ? (
        <button
          type="button"
          aria-label="Toggle demo jobs state"
          className={`fixed bottom-[16px] right-[16px] z-20 flex h-[28px] w-[28px] cursor-pointer items-center justify-center rounded-full border ${FX_COLORS.border} bg-[var(--fx-surface)] ${FX_TYPOGRAPHY.caption} text-[var(--fx-text-muted)] opacity-35 hover:opacity-100`}
          onClick={handleToggleJobsView}
        >
          J
        </button>
      ) : null}

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent size="lg">
          <SheetHeader
            title={editingJob ? "Edit Job" : "Create Job"}
            description={
              editingJob
                ? `Temporary sheet entry for ${editingJob.title}. Full job creation flow will replace this next.`
                : "Temporary Create Job entry point while the Jobs flow is being built."
            }
          />

          <SheetBody className="space-y-[24px]">
            <section className="space-y-[8px]">
              <h2 className={FX_TYPOGRAPHY.sectionTitle}>{editingJob ? editingJob.title : "Create Job"}</h2>
              <p className={`${FX_TYPOGRAPHY.body} text-muted-foreground`}>
                This shared Sheet remains the temporary entry surface so the Jobs workspace can be validated
                before the full creation flow is rebuilt.
              </p>
            </section>
          </SheetBody>

          <SheetFooter
            left={<span className={`${FX_TYPOGRAPHY.fieldHint} text-muted-foreground`}>Temporary QA control</span>}
            right={
              <FxButton variant="secondary" onClick={() => setIsSheetOpen(false)}>
                Close
              </FxButton>
            }
          />
        </SheetContent>
      </Sheet>
    </FxProtectedAppPage>
  );
}
