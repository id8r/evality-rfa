/* app/app/candidates/page.js | Candidates table backed by demo seed | Sree | 2026-06-18 */

"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";

import { FxButton } from "@/components/FxButton";
import { FxInput } from "@/components/FxInput";
import { FxProtectedAppPage } from "@/components/FxProtectedAppPage";
import { FxTable } from "@/components/FxTable";
import { showWarning } from "@/components/FxToast";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ROUTES } from "@/lib/FxConstants";
import { FX_COLORS, FX_LAYOUT, FX_RADIUS, FX_TYPOGRAPHY, TABLE_TYPOGRAPHY } from "@/lib/FxTheme";
import { findStoredJob, readStoredCandidates } from "@/lib/FxStore";
import { cn } from "@/lib/FxUtils";

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

function formatRelativeTime(value) {
  if (!value) {
    return "—";
  }

  const timestamp = new Date(value).getTime();
  if (Number.isNaN(timestamp)) {
    return "—";
  }

  const diffDays = Math.max(0, Math.floor((Date.now() - timestamp) / (24 * 60 * 60 * 1000)));
  if (diffDays === 0) {
    return "Today";
  }

  return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
}

function fieldButtonClassName(isInteractive = false) {
  return `${TABLE_TYPOGRAPHY.header} font-normal text-[var(--fx-text-muted)] ${
    isInteractive ? "inline-flex cursor-pointer items-center gap-[8px] text-left hover:text-[var(--fx-text)]" : ""
  }`;
}

function fieldHeaderLabelClassName() {
  return `${TABLE_TYPOGRAPHY.header} font-normal text-[var(--fx-text-muted)]`;
}

function renderCandidateStatusDot(candidate) {
  if (candidate.screeningOutcome !== "Failed") {
    return <span className="inline-flex size-[8px] shrink-0 rounded-full opacity-0" aria-hidden="true" />;
  }

  return <span className="inline-flex size-[8px] shrink-0 rounded-full bg-[var(--fx-danger)]" title="Failed" aria-label="Failed" />;
}

function CandidateStatusPill({ status }) {
  const tone =
    status === "shared"
      ? "bg-[color-mix(in_srgb,var(--fx-primary)_14%,var(--fx-surface)_86%)] text-[var(--fx-primary)]"
      : status === "shortlisted"
        ? "bg-[color-mix(in_srgb,var(--fx-success)_14%,var(--fx-surface)_86%)] text-[var(--fx-success)]"
        : status === "screened"
          ? "bg-[color-mix(in_srgb,var(--fx-warning)_14%,var(--fx-surface)_86%)] text-[var(--fx-warning)]"
          : "bg-[var(--fx-bg-soft)] text-[var(--fx-text-muted)]";

  const label =
    status === "shared"
      ? "Shared"
      : status === "shortlisted"
        ? "Shortlisted"
        : status === "screened"
          ? "Screened"
          : status === "rejected"
            ? "Rejected"
            : "Unscreened";

  return <span className={cn("inline-flex rounded-full px-[10px] py-[4px] text-[12px] font-medium", tone)}>{label}</span>;
}

export default function CandidatesPage() {
  const [candidateRows, setCandidateRows] = useState(() => readStoredCandidates());
  const [selectedTab, setSelectedTab] = useState("active");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: "updatedAt", direction: "desc" });
  const searchInputRef = useRef(null);
  const tableSurfaceRef = useRef(null);

  useEffect(() => {
    function syncCandidates() {
      setCandidateRows(readStoredCandidates());
    }

    syncCandidates();
    window.addEventListener("storage", syncCandidates);
    window.addEventListener("fx-storage-change", syncCandidates);

    return () => {
      window.removeEventListener("storage", syncCandidates);
      window.removeEventListener("fx-storage-change", syncCandidates);
    };
  }, []);

  useEffect(() => {
    function handleGlobalKeyDown(event) {
      const target = event.target;
      const isSearchFocused = target === searchInputRef.current;
      const isTypingField =
        target instanceof HTMLElement &&
        (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.tagName === "SELECT" || target.isContentEditable);

      if (isTypingField && !isSearchFocused) {
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
  }, [searchTerm]);

  function handleAddCandidate() {
    showWarning("Add candidate", "Candidate intake flow will be added here next.");
  }

  function handleSort(key) {
    setSortConfig((current) => {
      if (current?.key === key) {
        if (current.direction === "asc") {
          return { key, direction: "desc" };
        }

        return null;
      }

      return { key, direction: key === "updatedAt" ? "desc" : "asc" };
    });
  }

  function getSortHeaderButtonClassName(key) {
    return cn(
      fieldButtonClassName(true),
      sortConfig?.key === key ? "text-[var(--fx-primary)]" : "text-[var(--fx-text-muted)]",
    );
  }

  const counts = useMemo(() => {
    const archived = candidateRows.filter((candidate) => Boolean(candidate.archived || candidate.isArchived || candidate.status === "archived"));

    return {
      active: candidateRows.length - archived.length,
      archived: archived.length,
    };
  }, [candidateRows]);

  const visibleCandidates = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    const nextCandidates = candidateRows
      .filter((candidate) => {
        const isArchived = Boolean(candidate.archived || candidate.isArchived || candidate.status === "archived");
        return selectedTab === "archived" ? isArchived : !isArchived;
      })
      .filter((candidate) => {
        if (!query) {
          return true;
        }

        const job = candidate.jobId ? findStoredJob(candidate.jobId) : null;
        const haystack = [
          candidate.name,
          candidate.jobTitle,
          candidate.status,
          candidate.jobId,
          job?.title,
          job?.company,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return haystack.includes(query);
      });

    if (!sortConfig) {
      return [...nextCandidates];
    }

    return [...nextCandidates].sort((left, right) => {
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
        ? String(leftValue ?? "").localeCompare(String(rightValue ?? ""))
        : String(rightValue ?? "").localeCompare(String(leftValue ?? ""));
    });
  }, [candidateRows, searchTerm, selectedTab, sortConfig]);

  const rows = useMemo(
    () =>
      visibleCandidates.map((candidate) => {
        const job = candidate.jobId ? findStoredJob(candidate.jobId) : null;

        return {
          id: candidate.id,
          name: (
            <div className="flex min-w-0 items-center gap-[10px]">
              {/* Status dots are intentionally reserved for the job workspace table for now. */}
              <Link
                href={ROUTES.CANDIDATE(candidate.id)}
                className={`block min-w-0 truncate ${FX_TYPOGRAPHY.clickableData} text-[var(--fx-primary)] hover:text-[var(--fx-text)]`}
                title={candidate.name}
              >
                {candidate.name}
              </Link>
            </div>
          ),
          jobTitle: (
            <Link
              href={job ? ROUTES.JOB(job.id) : ROUTES.CANDIDATES}
              className={`block truncate ${FX_TYPOGRAPHY.tableCell} text-[var(--fx-text)] hover:text-[var(--fx-primary)]`}
              title={candidate.jobTitle || job?.title || "—"}
            >
              {candidate.jobTitle || job?.title || "—"}
            </Link>
          ),
          status: <CandidateStatusPill status={candidate.status || "unscreened"} />,
          matchScore: (
            <span className={`tabular-nums ${FX_TYPOGRAPHY.tableCell} font-medium text-[var(--fx-text)]`}>
              {candidate.matchScore != null ? `${candidate.matchScore}%` : "—"}
            </span>
          ),
          availability: <span className={`${FX_TYPOGRAPHY.tableCell} text-[var(--fx-text)]`}>{formatAvailability(candidate.availabilityDays)}</span>,
          salary: (
            <span className={`tabular-nums ${FX_TYPOGRAPHY.tableCell} text-[var(--fx-text)]`}>
              {formatCurrency(candidate.currentSalary)}
            </span>
          ),
          updatedAt: <span className={`${FX_TYPOGRAPHY.tableCell} text-[var(--fx-text-muted)]`}>{formatRelativeTime(candidate.updatedAt)}</span>,
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
                  <DropdownMenuItem asChild>
                    <Link href={ROUTES.CANDIDATE(candidate.id)}>View Candidate</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={ROUTES.CANDIDATE(candidate.id)}>Edit Candidate</Link>
                  </DropdownMenuItem>
                  {candidate.archived || candidate.isArchived || candidate.status === "archived" ? (
                    <DropdownMenuItem>Restore Candidate</DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem>Archive Candidate</DropdownMenuItem>
                  )}
                  <DropdownMenuItem className="text-[var(--fx-danger)]">Delete Candidate</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ),
        };
      }),
    [visibleCandidates],
  );

  const columns = useMemo(
    () => [
      {
        key: "name",
        label: (
          <button type="button" className={getSortHeaderButtonClassName("name")} onClick={() => handleSort("name")}>
            <span>Candidate</span>
            <ArrowUpDown className="size-[14px]" />
          </button>
        ),
        width: 240,
        minWidth: 220,
        grow: 2,
        required: true,
        locked: true,
        hideable: false,
      },
      {
        key: "jobTitle",
        label: (
          <button type="button" className={getSortHeaderButtonClassName("jobTitle")} onClick={() => handleSort("jobTitle")}>
            <span>Role</span>
            <ArrowUpDown className="size-[14px]" />
          </button>
        ),
        width: 240,
        minWidth: 200,
        grow: 2,
      },
      {
        key: "status",
        label: <span className={fieldHeaderLabelClassName()}>Screening</span>,
        width: 128,
        minWidth: 112,
        maxWidth: 140,
        align: "center",
      },
      {
        key: "matchScore",
        label: (
          <button type="button" className={getSortHeaderButtonClassName("matchScore")} onClick={() => handleSort("matchScore")}>
            <span>Fit</span>
            <ArrowUpDown className="size-[14px]" />
          </button>
        ),
        width: 96,
        minWidth: 88,
        maxWidth: 112,
        align: "center",
      },
      {
        key: "availability",
        label: <span className={fieldHeaderLabelClassName()}>Availability</span>,
        width: 112,
        minWidth: 96,
        maxWidth: 128,
        align: "center",
      },
      {
        key: "salary",
        label: <span className={fieldHeaderLabelClassName()}>Current Salary</span>,
        width: 144,
        minWidth: 128,
        maxWidth: 160,
        align: "right",
      },
      {
        key: "updatedAt",
        label: (
          <button type="button" className={getSortHeaderButtonClassName("updatedAt")} onClick={() => handleSort("updatedAt")}>
            <span>Updated</span>
            <ArrowUpDown className="size-[14px]" />
          </button>
        ),
        width: 124,
        minWidth: 112,
        maxWidth: 136,
        align: "right",
      },
      {
        key: "actions",
        label: null,
        width: 64,
        minWidth: 64,
        maxWidth: 64,
        align: "right",
        required: true,
        locked: true,
        hideable: false,
      },
    ],
    [],
  );

  return (
    <FxProtectedAppPage pageId="candidates" contentClassName="bg-[var(--fx-surface)]">
      <section className={`${FX_LAYOUT.contentWidthWide} flex h-full min-h-0 w-full min-w-0 flex-1 flex-col overflow-hidden`}>
        <div className="flex min-h-0 flex-1 flex-col gap-[24px] overflow-hidden">
          <div className="grid min-w-0 flex-none grid-cols-[minmax(0,1fr)_auto] items-end gap-[16px]">
            <div className="flex min-w-0 items-end gap-[24px]">
              <button
                type="button"
                className={`relative cursor-pointer pb-[8px] ${selectedTab === "active" ? "text-[var(--fx-text)]" : "text-[var(--fx-text-muted)]"} ${FX_TYPOGRAPHY.button}`}
                onClick={() => setSelectedTab("active")}
              >
                Active ({counts.active})
                {selectedTab === "active" ? <span className="absolute bottom-0 left-0 right-0 h-[3px] rounded-full bg-[var(--fx-primary)]" /> : null}
              </button>
              <button
                type="button"
                className={`relative cursor-pointer pb-[8px] ${selectedTab === "archived" ? "text-[var(--fx-text)]" : "text-[var(--fx-text-muted)]"} ${FX_TYPOGRAPHY.button}`}
                onClick={() => setSelectedTab("archived")}
              >
                Archived ({counts.archived})
                {selectedTab === "archived" ? <span className="absolute bottom-0 left-0 right-0 h-[3px] rounded-full bg-[var(--fx-primary)]" /> : null}
              </button>
            </div>

            <div className="flex min-w-0 shrink-0 items-center gap-[12px] justify-self-end">
              <div className="w-full min-w-0 max-w-[320px]">
                <FxInput
                  ref={searchInputRef}
                  aria-label="Search candidates"
                  className="border-[color:color-mix(in_srgb,var(--fx-border)_72%,var(--fx-text)_28%)]"
                  placeholder="Search candidates or roles..."
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  rightElement={(
                    <span className="inline-flex h-[24px] min-w-[24px] items-center justify-center rounded-[6px] border border-[var(--fx-border)] bg-[var(--fx-surface)] px-[8px] text-[12px] leading-[18px] font-medium text-[var(--fx-text-muted)]">
                      /
                    </span>
                  )}
                />
              </div>
              <FxButton className="shrink-0" onClick={handleAddCandidate}>
                Add Candidate
              </FxButton>
            </div>
          </div>

          <div
            ref={tableSurfaceRef}
            tabIndex={0}
            className="min-h-0 flex-1 overflow-hidden outline-none focus-visible:ring-2 focus-visible:ring-[var(--fx-primary)]/20"
          >
            {selectedTab === "archived" && counts.archived === 0 && !searchTerm.trim() ? (
              <div className={`flex h-full min-h-0 items-center justify-center border ${FX_COLORS.border} ${FX_RADIUS.sm} bg-[var(--fx-surface)] px-[24px] py-[24px]`}>
                <div className="max-w-[420px] space-y-[16px] text-center">
                  <p className={FX_TYPOGRAPHY.sectionTitle}>No archived candidates yet</p>
                  <p className={`${FX_TYPOGRAPHY.body} text-[var(--fx-text-muted)]`}>
                    Archive candidate records later to keep active screening focused.
                  </p>
                </div>
              </div>
            ) : null}
            {selectedTab === "active" && candidateRows.length === 0 && !searchTerm.trim() ? (
              <div className={`flex h-full min-h-0 items-center justify-center border ${FX_COLORS.border} ${FX_RADIUS.sm} bg-[var(--fx-surface)] px-[24px] py-[24px]`}>
                <div className="max-w-[420px] space-y-[16px] text-center">
                  <p className={FX_TYPOGRAPHY.sectionTitle}>No candidates yet</p>
                  <p className={`${FX_TYPOGRAPHY.body} text-[var(--fx-text-muted)]`}>
                    Add candidates to start tracking screening, match scores, and follow-up activity.
                  </p>
                </div>
              </div>
            ) : (
              <FxTable
                columns={columns}
                rows={rows}
                stickyHeader
                stickyFirstColumn
                stickyLastColumn
                scrollX
                className="h-full min-h-0"
                sortedColumnKey={sortConfig?.key ?? null}
                sortedColumnDirection={sortConfig?.direction ?? "asc"}
                emptyMessage="No candidates match the current search."
                enableColumnPicker
                storageKey="fx-candidates-table-columns"
              />
            )}
          </div>
        </div>
      </section>
    </FxProtectedAppPage>
  );
}
