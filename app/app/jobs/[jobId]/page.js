/* app/app/jobs/[jobId]/page.js | Job workspace page backed by local store | Sree | 2026-06-14 */

"use client";

import Link from "next/link";
import React, { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  MoreHorizontal,
  PencilLine,
  Users,
} from "lucide-react";

import { FxAiButton } from "@/components/FxAiButton";
import { FxButton } from "@/components/FxButton";
import { FxProtectedAppPage } from "@/components/FxProtectedAppPage";
import { FxTable } from "@/components/FxTable";
import { FxTabs } from "@/components/FxTabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetBody, SheetContent, SheetFooter, SheetHeader } from "@/components/ui/sheet";
import { ROUTES, STORAGE_KEYS, WORKSPACE_TYPES } from "@/lib/FxConstants";
import { PAGE_COPY } from "@/lib/FxCopy";
import { normalizeJobRecord } from "@/lib/FxJobSchema";
import {
  findStoredCandidatesByJob,
  findStoredJob,
  readStoredCandidates,
  readStoredWorkspaceType,
} from "@/lib/FxStore";
import { FX_COLORS, FX_LAYOUT, FX_RADIUS, FX_TYPOGRAPHY } from "@/lib/FxTheme";
import { cn } from "@/lib/FxUtils";

const PIPELINE_STAGES = [
  { value: "unscreened", label: "Unscreened" },
  { value: "screened", label: "Pre-Screened" },
  { value: "shortlisted", label: "Shortlisted" },
  { value: "shared", label: "Sent to Client" },
  { value: "rejected", label: "Rejected" },
];

const EMPTY_STAGE_COPY = {
  unscreened: {
    title: "No unscreened candidates yet",
    body: "Candidates enter this stage when fresh profiles land on the job.",
  },
  screened: {
    title: "No pre-screened candidates yet",
    body: "Move candidates from Unscreened after AI or recruiter screening.",
  },
  shortlisted: {
    title: "No shortlisted candidates yet",
    body: "Promote strong fits here once the screening pass is complete.",
  },
  shared: {
    title: "No candidates sent to client yet",
    body: "Share shortlisted candidates with the client from this stage.",
  },
  rejected: {
    title: "No rejected candidates yet",
    body: "Rejected candidates appear here after review or client feedback.",
  },
};

function normalizeJob(job) {
  return normalizeJobRecord(job);
}

function normalizeCandidate(candidate, job) {
  if (!candidate) {
    return null;
  }

  const trustScore =
    candidate.trustScore ||
    (candidate.status === "shared" || candidate.status === "shortlisted"
      ? "High"
      : candidate.status === "screened"
        ? "Medium"
        : candidate.status === "rejected"
          ? "Low"
          : job?.status === "Published"
            ? "Medium"
            : "Low");

  return {
    ...candidate,
    jobId: candidate.jobId ?? job?.id ?? null,
    jobTitle: candidate.jobTitle ?? job?.title ?? "",
    client: candidate.client ?? job?.client ?? job?.company ?? "",
    status: candidate.status ?? "unscreened",
    trustScore,
    matchScore: candidate.matchScore != null ? Number(candidate.matchScore) : null,
    availabilityDays: candidate.availabilityDays != null ? Number(candidate.availabilityDays) : null,
    currentSalary: candidate.currentSalary != null ? Number(candidate.currentSalary) : null,
    expectedSalary: candidate.expectedSalary != null ? Number(candidate.expectedSalary) : null,
    email: candidate.email ?? "—",
    phone: candidate.phone ?? "—",
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

function formatDate(value) {
  if (!value) {
    return "—";
  }

  const timestamp = new Date(value).getTime();

  if (Number.isNaN(timestamp)) {
    return "—";
  }

  return new Date(timestamp).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
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

function getStoredPipelineCounts(candidateRows) {
  return candidateRows.reduce(
    (counts, candidate) => {
      counts[candidate.status] = (counts[candidate.status] || 0) + 1;
      return counts;
    },
    { unscreened: 0, screened: 0, shortlisted: 0, shared: 0, rejected: 0 },
  );
}

function getStageCopy(stage, query) {
  const copy = EMPTY_STAGE_COPY[stage] ?? EMPTY_STAGE_COPY.unscreened;

  if (!query) {
    return copy;
  }

  return {
    title: `No results for "${query}"`,
    body: `Search only applies to the current stage. Try a different name, email, or phone inside ${PIPELINE_STAGES.find((item) => item.value === stage)?.label ?? "this stage"}.`,
  };
}

function isEditableTarget(target) {
  const tag = target?.tagName?.toLowerCase();
  return tag === "input" || tag === "textarea" || target?.isContentEditable;
}

function MetaField({ label, value, valueClassName }) {
  return (
    <div className="min-w-0 space-y-[4px]">
      <p className={`${FX_TYPOGRAPHY.fieldHint} text-[var(--fx-text-muted)]`}>{label}</p>
      <p className={cn(FX_TYPOGRAPHY.body, "min-w-0 truncate text-[var(--fx-text)]", valueClassName)}>{value}</p>
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

function CandidateMatchDrawer({ candidate, open, onOpenChange }) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent size="xl">
        <SheetHeader
          title="Match Analysis"
          description="Fast AI context for why this candidate is worth a closer look."
        />
        <SheetBody>
          {candidate ? (
            <div className="space-y-[20px]">
              <div className={`rounded-[16px] border ${FX_COLORS.border} bg-[var(--fx-bg-soft)] p-[20px]`}>
                <div className="flex flex-wrap items-start justify-between gap-[16px]">
                  <div className="space-y-[6px]">
                    <p className={`${FX_TYPOGRAPHY.fieldHint} text-[var(--fx-text-muted)]`}>Candidate</p>
                    <h3 className={FX_TYPOGRAPHY.sectionTitle}>{candidate.name}</h3>
                    <p className={`${FX_TYPOGRAPHY.body} text-[var(--fx-text-muted)]`}>{candidate.email}</p>
                  </div>
                  <span className="rounded-full bg-[var(--fx-surface-selected)] px-[12px] py-[6px] text-[13px] font-medium text-[var(--fx-primary)]">
                    {candidate.matchScore != null ? `${candidate.matchScore}% match` : "Match unavailable"}
                  </span>
                </div>
              </div>

              <div className="grid gap-[16px] md:grid-cols-2">
                <div className={`rounded-[16px] border ${FX_COLORS.border} bg-[var(--fx-surface)] p-[16px]`}>
                  <p className={FX_TYPOGRAPHY.cardTitle}>Matching skills</p>
                  <p className={`${FX_TYPOGRAPHY.body} mt-[8px] text-[var(--fx-text-muted)]`}>
                    Strong signal on role-aligned skills, screening readiness, and likely interview fit.
                  </p>
                </div>
                <div className={`rounded-[16px] border ${FX_COLORS.border} bg-[var(--fx-surface)] p-[16px]`}>
                  <p className={FX_TYPOGRAPHY.cardTitle}>Missing skills</p>
                  <p className={`${FX_TYPOGRAPHY.body} mt-[8px] text-[var(--fx-text-muted)]`}>
                    Use this drawer later to surface gaps that matter for the job context.
                  </p>
                </div>
                <div className={`rounded-[16px] border ${FX_COLORS.border} bg-[var(--fx-surface)] p-[16px]`}>
                  <p className={FX_TYPOGRAPHY.cardTitle}>Experience fit</p>
                  <p className={`${FX_TYPOGRAPHY.body} mt-[8px] text-[var(--fx-text-muted)]`}>
                    {candidate.availabilityDays != null ? `Available in ${formatAvailability(candidate.availabilityDays)}.` : "Availability not captured."}
                  </p>
                </div>
                <div className={`rounded-[16px] border ${FX_COLORS.border} bg-[var(--fx-surface)] p-[16px]`}>
                  <p className={FX_TYPOGRAPHY.cardTitle}>Location fit</p>
                  <p className={`${FX_TYPOGRAPHY.body} mt-[8px] text-[var(--fx-text-muted)]`}>
                    {candidate.phone !== "—" ? "No location mismatch signal captured in demo data." : "Location context will appear here."}
                  </p>
                </div>
              </div>

              <div className={`rounded-[16px] border ${FX_COLORS.border} bg-[var(--fx-surface)] p-[16px]`}>
                <p className={FX_TYPOGRAPHY.cardTitle}>AI reasoning</p>
                <p className={`${FX_TYPOGRAPHY.body} mt-[8px] text-[var(--fx-text-muted)]`}>
                  This drawer will later explain why the candidate was recommended, what the model matched, and which
                  screening signals influenced the score.
                </p>
              </div>
            </div>
          ) : null}
        </SheetBody>
        <SheetFooter
          left={<span className={`${FX_TYPOGRAPHY.fieldHint} text-[var(--fx-text-muted)]`}>Future drawer content for match analysis.</span>}
          right={<FxButton variant="outline" size="sm" onClick={() => onOpenChange(false)}>Close</FxButton>}
        />
      </SheetContent>
    </Sheet>
  );
}

function CandidateActionDrawer({ open, onOpenChange, candidate, action }) {
  const titleMap = {
    resume: "View Resume",
    questions: "Generate Interview Questions",
    edit: "Edit Candidate Details",
    notInterested: "Mark as Not Interested",
    reject: "Reject Candidate",
  };

  const bodyMap = {
    resume: "Resume preview for recruiter review.",
    questions: "AI-generated interview questions for this candidate.",
    edit: "Candidate details can be tuned here later.",
    notInterested: "Capture this recruiter action for the demo flow.",
    reject: "Capture this recruiter action for the demo flow.",
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent size="lg">
        <SheetHeader title={titleMap[action] ?? "Candidate Action"} description={bodyMap[action] ?? ""} />
        <SheetBody>
          {candidate ? (
            <div className="space-y-[16px]">
              <div className={`rounded-[16px] border ${FX_COLORS.border} bg-[var(--fx-bg-soft)] p-[16px]`}>
                <p className={`${FX_TYPOGRAPHY.fieldHint} text-[var(--fx-text-muted)]`}>Candidate</p>
                <p className={FX_TYPOGRAPHY.sectionTitle}>{candidate.name}</p>
                <p className={`${FX_TYPOGRAPHY.body} text-[var(--fx-text-muted)]`}>{candidate.email}</p>
                <p className={`${FX_TYPOGRAPHY.body} text-[var(--fx-text-muted)]`}>{candidate.phone}</p>
              </div>

              {action === "resume" ? (
                <div className={`space-y-[12px] rounded-[16px] border ${FX_COLORS.border} bg-[var(--fx-surface)] p-[16px]`}>
                  <p className={FX_TYPOGRAPHY.cardTitle}>Resume preview</p>
                  <p className={`${FX_TYPOGRAPHY.body} text-[var(--fx-text-muted)]`}>
                    Senior recruiting teams will see a compact resume summary here, including skills, experience, and role fit.
                  </p>
                </div>
              ) : null}

              {action === "questions" ? (
                <div className="space-y-[12px]">
                  {["Tell me about your recent role.", "What makes you a fit for this job?", "How soon can you join?"].map(
                    (question) => (
                      <div key={question} className={`rounded-[14px] border ${FX_COLORS.border} bg-[var(--fx-surface)] p-[14px]`}>
                        <p className={FX_TYPOGRAPHY.body}>{question}</p>
                      </div>
                    ),
                  )}
                </div>
              ) : null}

              {(action === "edit" || action === "notInterested" || action === "reject") ? (
                <div className={`rounded-[16px] border ${FX_COLORS.border} bg-[var(--fx-surface)] p-[16px]`}>
                  <p className={FX_TYPOGRAPHY.cardTitle}>Demo action</p>
                  <p className={`${FX_TYPOGRAPHY.body} mt-[8px] text-[var(--fx-text-muted)]`}>
                    This action will be wired to state updates later. For now it keeps the recruiter menu complete.
                  </p>
                </div>
              ) : null}
            </div>
          ) : null}
        </SheetBody>
        <SheetFooter
          left={<span className={`${FX_TYPOGRAPHY.fieldHint} text-[var(--fx-text-muted)]`}>Recruiter action surface.</span>}
          right={<FxButton variant="outline" size="sm" onClick={() => onOpenChange(false)}>Close</FxButton>}
        />
      </SheetContent>
    </Sheet>
  );
}

function RecommendedCandidatesDrawer({ open, onOpenChange, candidates }) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent size="xl">
        <SheetHeader
          title="Recommend Candidates"
          description="Candidates who are not yet attached to this job, surfaced from the current demo pool."
          actions={
            <span className="rounded-full bg-[var(--fx-surface-selected)] px-[10px] py-[4px] text-[12px] font-medium text-[var(--fx-primary)]">
              {candidates.length} ready
            </span>
          }
        />
        <SheetBody>
          <div className="space-y-[12px]">
            {candidates.length ? (
              candidates.map((candidate) => (
                <div key={`${candidate.id}-recommendation`} className={`rounded-[14px] border ${FX_COLORS.border} bg-[var(--fx-surface)] p-[16px]`}>
                  <div className="flex items-start justify-between gap-[12px]">
                    <div className="min-w-0 space-y-[4px]">
                      <p className={`${FX_TYPOGRAPHY.button} truncate text-[var(--fx-text)]`}>{candidate.name}</p>
                      <p className={`${FX_TYPOGRAPHY.fieldHint} truncate text-[var(--fx-text-muted)]`}>
                        {candidate.email} {candidate.phone !== "—" ? `· ${candidate.phone}` : ""}
                      </p>
                      <p className={`${FX_TYPOGRAPHY.fieldHint} text-[var(--fx-text-muted)]`}>
                        From {candidate.jobTitle || "another job"} · {candidate.status}
                      </p>
                    </div>
                    <span className="rounded-full bg-[var(--fx-surface-selected)] px-[10px] py-[4px] text-[12px] font-medium text-[var(--fx-primary)]">
                      {candidate.matchScore != null ? `${candidate.matchScore}%` : "—"}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <WorkspaceEmptyState
                title="No recommendations yet"
                body="Add more demo candidates or keep seeding jobs to populate this panel."
              />
            )}
          </div>
        </SheetBody>
        <SheetFooter
          left={<span className={`${FX_TYPOGRAPHY.fieldHint} text-[var(--fx-text-muted)]`}>AI recommendations will become attachable later.</span>}
          right={<FxButton variant="outline" size="sm" onClick={() => onOpenChange(false)}>Close</FxButton>}
        />
      </SheetContent>
    </Sheet>
  );
}

function CallPreviewDrawer({ open, onOpenChange, job }) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent size="lg">
        <SheetHeader title="Call Preview" description="A quick preview of how pre-screening will sound on this job." />
        <SheetBody>
          <div className={`space-y-[16px] rounded-[16px] border ${FX_COLORS.border} bg-[var(--fx-surface)] p-[16px]`}>
            <p className={FX_TYPOGRAPHY.cardTitle}>{job?.title ?? "Job"} screening flow</p>
            <ul className="space-y-[8px] text-[var(--fx-text-muted)]">
              <li>1. Confirm role interest and availability.</li>
              <li>2. Validate experience and compensation fit.</li>
              <li>3. Capture response and move the candidate forward.</li>
            </ul>
          </div>
        </SheetBody>
        <SheetFooter
          left={<span className={`${FX_TYPOGRAPHY.fieldHint} text-[var(--fx-text-muted)]`}>Placeholder for the call preview workflow.</span>}
          right={<FxButton variant="outline" size="sm" onClick={() => onOpenChange(false)}>Close</FxButton>}
        />
      </SheetContent>
    </Sheet>
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

  const activeStage = PIPELINE_STAGES.some((stage) => stage.value === searchParams?.get("tab"))
    ? searchParams.get("tab")
    : "unscreened";

  const [searchTerm, setSearchTerm] = useState("");
  const [recommendedOpen, setRecommendedOpen] = useState(false);
  const [analysisOpen, setAnalysisOpen] = useState(false);
  const [callPreviewOpen, setCallPreviewOpen] = useState(false);
  const [candidateActionOpen, setCandidateActionOpen] = useState(false);
  const [candidateAction, setCandidateAction] = useState(null);
  const [selectedCandidateId, setSelectedCandidateId] = useState(null);
  const searchRef = useRef(null);

  const candidateRows = useMemo(
    () =>
      (job ? findStoredCandidatesByJob(job.id) : [])
        .map((candidate) => normalizeCandidate(candidate, job))
        .filter(Boolean),
    [job],
  );

  const candidateCounts = useMemo(() => getStoredPipelineCounts(candidateRows), [candidateRows]);
  const pipelineCandidates = useMemo(
    () => candidateRows.filter((candidate) => candidate.status === activeStage),
    [candidateRows, activeStage],
  );

  const filteredCandidates = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    if (!query) {
      return pipelineCandidates;
    }

    return pipelineCandidates.filter((candidate) => {
      const haystack = [candidate.name, candidate.email, candidate.phone].join(" ").toLowerCase();
      return haystack.includes(query);
    });
  }, [pipelineCandidates, searchTerm]);

  const selectedCandidate = useMemo(
    () => candidateRows.find((candidate) => candidate.id === selectedCandidateId) ?? null,
    [candidateRows, selectedCandidateId],
  );

  const recommendedCandidates = useMemo(() => {
    const allCandidates = readStoredCandidates();
    const attachedIds = new Set(candidateRows.map((candidate) => candidate.id));

    return allCandidates
      .filter((candidate) => candidate.jobId !== job?.id && !attachedIds.has(candidate.id))
      .map((candidate) => normalizeCandidate(candidate, findStoredJob(candidate.jobId)))
      .sort((left, right) => (right.matchScore ?? 0) - (left.matchScore ?? 0))
      .slice(0, 6);
  }, [candidateRows, job?.id]);

  function handleStageChange(nextStage) {
    router.replace(`${ROUTES.JOB(jobId)}?tab=${nextStage}`, { scroll: false });
  }

  function handleOpenMatchAnalysis(candidate) {
    setSelectedCandidateId(candidate.id);
    setAnalysisOpen(true);
  }

  function handleOpenCandidateAction(candidate, action) {
    setSelectedCandidateId(candidate.id);
    setCandidateAction(action);
    setCandidateActionOpen(true);
  }

  function handleDownloadResume(candidate) {
    const resumeText = [
      candidate.name,
      candidate.email,
      candidate.phone,
      `JD Match Score: ${candidate.matchScore != null ? `${candidate.matchScore}%` : "—"}`,
      `Trust Score: ${candidate.trustScore || "—"}`,
    ].join("\n");
    const blob = new Blob([resumeText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${candidate.name.replace(/\s+/g, "-").toLowerCase()}-resume.txt`;
    link.click();
    URL.revokeObjectURL(url);
  }

  async function handleShareJob() {
    const shareUrl = `${window.location.origin}${ROUTES.JOB(jobId)}`;

    try {
      await navigator.clipboard.writeText(shareUrl);
    } catch {
      window.prompt("Copy job link", shareUrl);
    }
  }

  useEffect(() => {
    function handleKeydown(event) {
      if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey) {
        return;
      }

      if (event.key === "/" && !isEditableTarget(event.target)) {
        event.preventDefault();
        searchRef.current?.focus();
      }
    }

    window.addEventListener("keydown", handleKeydown);

    return () => window.removeEventListener("keydown", handleKeydown);
  }, []);

  const tableColumns = [
    {
      key: "name",
      label: "Candidate Name",
      width: 300,
      minWidth: 240,
      grow: 2,
      cellClassName: "text-[13px] leading-[20px] font-medium",
      required: true,
      locked: true,
      hideable: false,
    },
    {
      key: "matchScore",
      label: "JD Match Score",
      width: 136,
      minWidth: 120,
      maxWidth: 152,
      align: "center",
      defaultVisible: true,
    },
    {
      key: "trustScore",
      label: "Trust Score",
      width: 128,
      minWidth: 112,
      maxWidth: 144,
      align: "center",
      defaultVisible: true,
    },
    {
      key: "interested",
      label: "Interested",
      width: 112,
      minWidth: 104,
      maxWidth: 128,
      align: "center",
      defaultVisible: true,
    },
    {
      key: "availability",
      label: "Availability",
      width: 136,
      minWidth: 120,
      maxWidth: 152,
      align: "center",
      defaultVisible: true,
    },
    {
      key: "currentSalary",
      label: "Current Salary",
      width: 144,
      minWidth: 128,
      maxWidth: 160,
      align: "right",
      defaultVisible: true,
    },
    {
      key: "expectedSalary",
      label: "Expectation",
      width: 136,
      minWidth: 120,
      maxWidth: 152,
      align: "right",
      defaultVisible: true,
    },
    {
      key: "actions",
      label: null,
      width: 56,
      minWidth: 56,
      maxWidth: 56,
      align: "center",
      cellClassName: "px-0 pr-0",
      required: true,
      locked: true,
      hideable: false,
    },
  ];

  const rows = filteredCandidates.map((candidate) => ({
    id: candidate.id,
    name: (
      <Link
        href={ROUTES.CANDIDATE(candidate.id)}
        className="block truncate text-[13px] leading-[20px] font-medium text-[var(--fx-primary)] hover:text-[color-mix(in_srgb,var(--fx-primary)_82%,black_18%)]"
      >
        {candidate.name}
      </Link>
    ),
    matchScore: (
      <button
        type="button"
        onClick={() => handleOpenMatchAnalysis(candidate)}
        className="inline-flex min-w-[64px] items-center justify-center rounded-full bg-[var(--fx-surface-selected)] px-[10px] py-[4px] text-[13px] leading-[20px] font-medium text-[var(--fx-text)] transition-colors hover:bg-[color-mix(in_srgb,var(--fx-primary)_16%,var(--fx-surface-selected)_84%)]"
      >
        {candidate.matchScore != null ? `${candidate.matchScore}%` : "—"}
      </button>
    ),
    trustScore: (
      <span
        className={`inline-flex min-w-[64px] items-center justify-center rounded-full px-[8px] py-[3px] text-[12px] leading-[18px] font-medium ${
          candidate.trustScore === "High"
            ? "bg-[color-mix(in_srgb,var(--fx-success)_14%,var(--fx-surface)_86%)] text-[var(--fx-success)]"
            : candidate.trustScore === "Low"
              ? "bg-[color-mix(in_srgb,var(--fx-warning)_12%,var(--fx-surface)_88%)] text-[var(--fx-warning)]"
              : "bg-[var(--fx-bg-soft)] text-[var(--fx-text)]"
        }`}
      >
        {candidate.trustScore || "—"}
      </span>
    ),
    interested: (
      <span className="inline-flex min-w-[56px] items-center justify-center px-[4px] py-0 text-[13px] leading-[20px] font-normal text-[var(--fx-text)]">
        {candidate.interested ?? "—"}
      </span>
    ),
    availability: (
      <span className="inline-flex min-w-[64px] items-center justify-center px-[4px] py-0 text-[13px] leading-[20px] font-normal text-[var(--fx-text)]">
        {formatAvailability(candidate.availabilityDays)}
      </span>
    ),
    currentSalary: (
      <span className="tabular-nums text-[13px] leading-[20px] font-medium text-[var(--fx-text)]">
        {formatCurrency(candidate.currentSalary)}
      </span>
    ),
    expectedSalary: (
      <span className="tabular-nums text-[13px] leading-[20px] font-medium text-[var(--fx-text)]">
        {formatCurrency(candidate.expectedSalary)}
      </span>
    ),
    actions: (
      <div className="flex justify-center">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="inline-flex size-[32px] items-center justify-center rounded-[8px] text-[var(--fx-text-muted)] transition-colors hover:bg-[var(--fx-surface-hover)] hover:text-[var(--fx-text)]"
              aria-label={`Open actions for ${candidate.name}`}
            >
              <MoreHorizontal className="size-[16px]" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[280px]">
            <DropdownMenuItem
              onSelect={(event) => {
                event.preventDefault();
                handleOpenCandidateAction(candidate, "resume");
              }}
            >
              View Resume
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={(event) => {
                event.preventDefault();
                handleOpenMatchAnalysis(candidate);
              }}
            >
              View Screening Results / View Match Analysis
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={(event) => {
                event.preventDefault();
                handleOpenCandidateAction(candidate, "questions");
              }}
            >
              Generate Interview Questions
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={(event) => {
                event.preventDefault();
                handleOpenCandidateAction(candidate, "edit");
              }}
            >
              Edit Candidate Details
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={(event) => {
                event.preventDefault();
                handleOpenCandidateAction(candidate, "notInterested");
              }}
            >
              Mark as Not Interested
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={(event) => {
                event.preventDefault();
                handleOpenCandidateAction(candidate, "reject");
              }}
            >
              Reject Candidate
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={async (event) => {
                event.preventDefault();
                handleDownloadResume(candidate);
              }}
            >
              Download Resume
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    ),
  }));

  const jobIdLabel = job?.id ?? jobId;
  const jobStatusTone =
    job?.status === "Published"
      ? "bg-[color-mix(in_srgb,var(--fx-success)_16%,var(--fx-surface)_84%)] text-[var(--fx-success)]"
      : "bg-[color-mix(in_srgb,var(--fx-warning)_14%,var(--fx-surface)_86%)] text-[var(--fx-warning)]";

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
        {job ? (
          <>
            <div className={`rounded-[16px] border ${FX_COLORS.border} bg-[var(--fx-surface)] p-[24px]`}>
              <div className="flex flex-col gap-[20px] lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0 space-y-[12px]">
                  <div className="flex flex-wrap items-center gap-[8px]">
                    <span className="rounded-full bg-[var(--fx-bg-soft)] px-[10px] py-[4px] text-[12px] font-medium text-[var(--fx-text-muted)]">
                      Job ID {jobIdLabel}
                    </span>
                    <span className={`rounded-full px-[10px] py-[4px] text-[12px] font-medium ${jobStatusTone}`}>
                      {job.status}
                    </span>
                    <span className="rounded-full bg-[var(--fx-surface-selected)] px-[10px] py-[4px] text-[12px] font-medium text-[var(--fx-primary)]">
                      {job.priority}
                    </span>
                  </div>

                  <div className="space-y-[6px]">
                    <h1 className={`${FX_TYPOGRAPHY.h3} text-[var(--fx-text)]`}>{job.title}</h1>
                    <p className={`${FX_TYPOGRAPHY.body} text-[var(--fx-text-muted)]`}>
                      {showClientInfo && job.client ? `${job.client} · ` : ""}
                      {job.domain} · {job.department} · {job.location || "Location not set"}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-[8px]">
                  <FxAiButton onClick={() => setRecommendedOpen(true)}>Recommend Candidates</FxAiButton>
                  <FxButton variant="outline" size="sm" onClick={() => setCallPreviewOpen(true)}>
                    Call Preview
                  </FxButton>
                  <FxButton variant="secondary" size="sm" onClick={handleShareJob}>
                    Share Job
                  </FxButton>
                  <FxButton
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push(`${ROUTES.JOBS}?edit=${job.id}`)}
                  >
                    <PencilLine className="size-[16px]" />
                    Edit Job
                  </FxButton>
                  <FxButton variant="ghost" size="sm" onClick={() => router.push(ROUTES.SETTINGS)}>
                    Job Settings
                  </FxButton>
                </div>
              </div>

              <div className="mt-[20px] grid gap-[16px] sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                <MetaField label="Job ID" value={jobIdLabel} valueClassName="font-mono text-[13px]" />
                {showClientInfo && job.client ? <MetaField label="Client" value={job.client} /> : null}
                <MetaField label="Domain / Department" value={`${job.domain} / ${job.department}`} />
                <MetaField label="Experience" value={job.experience || "—"} />
                <MetaField label="Employment Type" value={job.employmentType || "Full-time"} />
                <MetaField label="Salary Range" value={job.salaryRange || "—"} />
                <MetaField label="Positions" value={String(job.positions || 1)} />
                <MetaField label="Location" value={job.location || "—"} />
                <MetaField label="Publish Date" value={job.publishDate ? formatDate(job.publishDate) : "Draft"} />
                <MetaField label="Question Format" value={job.questionFormat || "CV + AI pre-screening"} />
                <MetaField label="Last Activity" value={formatRelativeTime(job.updatedAt)} />
              </div>
            </div>

            <div className="flex min-h-0 flex-1 flex-col gap-[16px]">
              <div className="flex flex-col gap-[16px] lg:flex-row lg:items-end lg:justify-between">
                <FxTabs
                  tabs={PIPELINE_STAGES.map((stage) => ({
                    value: stage.value,
                    label: `${stage.label} (${candidateCounts[stage.value] || 0})`,
                  }))}
                  active={activeStage}
                  onChange={handleStageChange}
                  className="flex-1 justify-start"
                  showUnderline
                  showBorder={false}
                />

                <div className="w-full max-w-[256px] shrink-0">
                  <div className={`flex h-[40px] items-center rounded-[8px] border border-[color:color-mix(in_srgb,var(--fx-text)_18%,var(--fx-border)_82%)] bg-[var(--fx-bg)] px-[16px]`}>
                    <input
                      ref={searchRef}
                      value={searchTerm}
                      onChange={(event) => setSearchTerm(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Escape") {
                          event.preventDefault();

                          if (searchTerm) {
                            setSearchTerm("");
                            return;
                          }

                          event.currentTarget.blur();
                        }
                      }}
                      placeholder="Search candidates"
                      className="h-full w-full min-w-0 bg-transparent text-[14px] leading-[22px] font-normal text-[var(--fx-text)] outline-none placeholder:text-[var(--fx-text-disabled)]"
                    />
                    <kbd className="ml-[12px] inline-flex h-[24px] items-center justify-center rounded-[6px] border border-[var(--fx-border)] bg-[var(--fx-surface)] px-[8px] text-[12px] font-medium text-[var(--fx-text-muted)]">
                      /
                    </kbd>
                  </div>
                </div>
              </div>

              <div className="min-h-0 flex-1 overflow-hidden">
                {filteredCandidates.length ? (
                  <FxTable
                    columns={tableColumns}
                    rows={rows}
                    stickyHeader
                    stickyFirstColumn
                    stickyLastColumn
                    scrollX
                    density="compact"
                    emptyMessage="No candidates in this stage yet."
                    enableColumnPicker
                    storageKey={STORAGE_KEYS.JOB_WORKSPACE_COLUMNS}
                  />
                ) : (
                  <WorkspaceEmptyState
                    title={getStageCopy(activeStage, searchTerm).title}
                    body={getStageCopy(activeStage, searchTerm).body}
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

      <RecommendedCandidatesDrawer
        open={recommendedOpen}
        onOpenChange={setRecommendedOpen}
        candidates={recommendedCandidates}
      />
      <CandidateMatchDrawer open={analysisOpen} onOpenChange={setAnalysisOpen} candidate={selectedCandidate} />
      <CandidateActionDrawer
        open={candidateActionOpen}
        onOpenChange={setCandidateActionOpen}
        candidate={selectedCandidate}
        action={candidateAction}
      />
      <CallPreviewDrawer open={callPreviewOpen} onOpenChange={setCallPreviewOpen} job={job} />
    </FxProtectedAppPage>
  );
}
