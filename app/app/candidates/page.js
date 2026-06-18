/* app/app/candidates/page.js | Candidates table backed by demo seed | Sree | 2026-06-18 */

"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, Users } from "lucide-react";

import { FxButton } from "@/components/FxButton";
import { FxInput } from "@/components/FxInput";
import { FxProtectedAppPage } from "@/components/FxProtectedAppPage";
import { FxTable } from "@/components/FxTable";
import { showWarning } from "@/components/FxToast";
import { ROUTES } from "@/lib/FxConstants";
import { FX_LAYOUT, FX_TYPOGRAPHY } from "@/lib/FxTheme";
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

function CandidateStatusPill({ status }) {
  const tone =
    status === "shared"
      ? "bg-[color-mix(in_srgb,var(--fx-primary)_14%,var(--fx-surface)_86%)] text-[var(--fx-primary)]"
      : status === "shortlisted"
        ? "bg-[color-mix(in_srgb,var(--fx-success)_14%,var(--fx-surface)_86%)] text-[var(--fx-success)]"
        : status === "screened"
          ? "bg-[color-mix(in_srgb,var(--fx-warning)_14%,var(--fx-surface)_86%)] text-[var(--fx-warning)]"
          : "bg-[var(--fx-bg-soft)] text-[var(--fx-text-muted)]";

  return <span className={cn("inline-flex rounded-full px-[10px] py-[4px] text-[12px] font-medium", tone)}>{status}</span>;
}

export default function CandidatesPage() {
  const [candidateRows, setCandidateRows] = useState(() => readStoredCandidates());
  const [selectedTab, setSelectedTab] = useState("active");
  const [searchTerm, setSearchTerm] = useState("");
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

  const counts = useMemo(() => {
    const archived = candidateRows.filter((candidate) => Boolean(candidate.archived || candidate.isArchived || candidate.status === "archived"));

    return {
      active: candidateRows.length - archived.length,
      archived: archived.length,
    };
  }, [candidateRows]);

  const visibleCandidates = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return candidateRows
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
      })
      .sort((left, right) => new Date(right.updatedAt ?? 0) - new Date(left.updatedAt ?? 0));
  }, [candidateRows, searchTerm, selectedTab]);

  const rows = useMemo(
    () =>
      visibleCandidates.map((candidate) => {
        const job = candidate.jobId ? findStoredJob(candidate.jobId) : null;

        return {
          id: candidate.id,
          name: (
            <Link
              href={ROUTES.CANDIDATE(candidate.id)}
              className="block truncate text-[13px] leading-[20px] font-medium text-[var(--fx-primary)] hover:text-[var(--fx-text)]"
              title={candidate.name}
            >
              {candidate.name}
            </Link>
          ),
          jobTitle: (
            <Link
              href={job ? ROUTES.JOB(job.id) : ROUTES.CANDIDATES}
              className="block truncate text-[13px] leading-[20px] text-[var(--fx-text)] hover:text-[var(--fx-primary)]"
              title={candidate.jobTitle || job?.title || "—"}
            >
              {candidate.jobTitle || job?.title || "—"}
            </Link>
          ),
          status: <CandidateStatusPill status={candidate.status || "unscreened"} />,
          matchScore: (
            <span className="tabular-nums text-[13px] leading-[20px] font-medium text-[var(--fx-text)]">
              {candidate.matchScore != null ? `${candidate.matchScore}%` : "—"}
            </span>
          ),
          availability: <span className="text-[13px] leading-[20px] text-[var(--fx-text)]">{formatAvailability(candidate.availabilityDays)}</span>,
          salary: (
            <span className="tabular-nums text-[13px] leading-[20px] text-[var(--fx-text)]">
              {formatCurrency(candidate.currentSalary)}
            </span>
          ),
          updatedAt: <span className="text-[13px] leading-[20px] text-[var(--fx-text-muted)]">{formatRelativeTime(candidate.updatedAt)}</span>,
          actions: (
            <div className="flex items-center justify-end gap-[8px]">
              <Link href={ROUTES.CANDIDATE(candidate.id)} className={FX_TYPOGRAPHY.button + " text-[var(--fx-primary)] hover:text-[var(--fx-text)]"}>
                Open
              </Link>
              <ArrowRight className="size-[14px] text-[var(--fx-text-muted)]" />
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
        label: "Candidate",
        width: 240,
        minWidth: 220,
        grow: 2,
        required: true,
        locked: true,
        hideable: false,
      },
      {
        key: "jobTitle",
        label: "Job",
        width: 240,
        minWidth: 200,
        grow: 2,
      },
      {
        key: "status",
        label: "Status",
        width: 128,
        minWidth: 112,
        maxWidth: 140,
        align: "center",
      },
      {
        key: "matchScore",
        label: "Match",
        width: 96,
        minWidth: 88,
        maxWidth: 112,
        align: "center",
      },
      {
        key: "availability",
        label: "Availability",
        width: 112,
        minWidth: 96,
        maxWidth: 128,
        align: "center",
      },
      {
        key: "salary",
        label: "Current Salary",
        width: 144,
        minWidth: 128,
        maxWidth: 160,
        align: "right",
      },
      {
        key: "updatedAt",
        label: "Updated",
        width: 124,
        minWidth: 112,
        maxWidth: 136,
        align: "right",
      },
      {
        key: "actions",
        label: null,
        width: 92,
        minWidth: 92,
        maxWidth: 92,
        align: "right",
        required: true,
        locked: true,
        hideable: false,
      },
    ],
    [],
  );

  return (
    <FxProtectedAppPage pageId="candidates">
      <section className={`${FX_LAYOUT.contentWidthWide} flex h-full min-h-0 w-full min-w-0 flex-1 flex-col overflow-hidden`}>
        <div className="flex min-h-0 flex-1 flex-col gap-[24px] overflow-hidden">
          <div className="space-y-[6px]">
            <div className="flex items-center gap-[10px]">
              <div className="flex size-[40px] items-center justify-center rounded-[12px] bg-[var(--fx-bg-soft)] text-[var(--fx-primary)]">
                <Users className="size-[18px]" />
              </div>
              <div className="space-y-[2px]">
                <h1 className={FX_TYPOGRAPHY.pageTitle}>Candidates</h1>
                <p className={`${FX_TYPOGRAPHY.body} text-[var(--fx-text-muted)]`}>
                  Manage candidate records, screening progress, and archived profiles from one table.
                </p>
              </div>
            </div>
          </div>

          <div className="grid min-w-0 flex-none grid-cols-[minmax(0,1fr)_auto] items-end gap-[16px]">
            <div className="flex min-w-0 items-end gap-[24px]">
              <button
                type="button"
                className={`relative cursor-pointer pb-[8px] ${selectedTab === "active" ? "text-[var(--fx-text)]" : "text-[var(--fx-text-muted)]"} ${FX_TYPOGRAPHY.button}`}
                onClick={() => setSelectedTab("active")}
              >
                Active ({counts.active})
                {selectedTab === "active" ? <span className="absolute bottom-0 left-[2px] right-[2px] h-[3px] rounded-full bg-[var(--fx-primary)]" /> : null}
              </button>
              <button
                type="button"
                className={`relative cursor-pointer pb-[8px] ${selectedTab === "archived" ? "text-[var(--fx-text)]" : "text-[var(--fx-text-muted)]"} ${FX_TYPOGRAPHY.button}`}
                onClick={() => setSelectedTab("archived")}
              >
                Archived ({counts.archived})
                {selectedTab === "archived" ? <span className="absolute bottom-0 left-[2px] right-[2px] h-[3px] rounded-full bg-[var(--fx-primary)]" /> : null}
              </button>
            </div>

            <div className="flex min-w-0 shrink-0 items-center gap-[12px] justify-self-end">
              <div className="w-full min-w-0 max-w-[320px]">
                <FxInput
                  ref={searchInputRef}
                  aria-label="Search candidates"
                  className="border-[color:color-mix(in_srgb,var(--fx-border)_72%,var(--fx-text)_28%)]"
                  placeholder="Search candidates or jobs..."
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
              <div className="flex h-full min-h-0 items-center justify-center rounded-[12px] border border-[var(--fx-border)] bg-[var(--fx-surface)] px-[24px] py-[24px]">
                <div className="max-w-[420px] space-y-[12px] text-center">
                  <p className={FX_TYPOGRAPHY.sectionTitle}>No archived candidates yet</p>
                  <p className={`${FX_TYPOGRAPHY.body} text-[var(--fx-text-muted)]`}>
                    Archive candidate records later to keep active screening focused.
                  </p>
                </div>
              </div>
            ) : null}
            {selectedTab === "active" && candidateRows.length === 0 && !searchTerm.trim() ? (
              <div className="flex h-full min-h-0 items-center justify-center rounded-[12px] border border-[var(--fx-border)] bg-[var(--fx-surface)] px-[24px] py-[24px]">
                <div className="max-w-[420px] space-y-[12px] text-center">
                  <p className={FX_TYPOGRAPHY.sectionTitle}>No candidates yet</p>
                  <p className={`${FX_TYPOGRAPHY.body} text-[var(--fx-text-muted)]`}>
                    Add candidates to start tracking screening, match scores, and follow-up activity.
                  </p>
                </div>
              </div>
            ) : null}
            <FxTable
              columns={columns}
              rows={rows}
              stickyHeader
              stickyFirstColumn
              stickyLastColumn
              scrollX
              density="compact"
              emptyMessage="No candidates match the current search."
              enableColumnPicker
              storageKey="fx-candidates-table-columns"
            />
          </div>
        </div>
      </section>
    </FxProtectedAppPage>
  );
}
