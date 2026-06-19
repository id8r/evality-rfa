/* app/app/jobs/[jobId]/page.js | Job workspace page backed by local store | Sree | 2026-06-14 */

"use client";

import Link from "next/link";
import React, { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowUpDown,
  ArrowRight,
  Ban,
  Check,
  Circle,
  Minus,
  MoreHorizontal,
  PencilLine,
  Phone,
  PhoneCall,
  Plus,
  RotateCcw,
  Share2,
  Download,
  Sparkles,
  Trash2,
  UserX,
  Upload,
  Users,
} from "lucide-react";

import { FxAiButton } from "@/components/FxAiButton";
import { FxButton } from "@/components/FxButton";
import { FxInput } from "@/components/FxInput";
import { FxProtectedAppPage } from "@/components/FxProtectedAppPage";
import { FxTable } from "@/components/FxTable";
import { FxTabs } from "@/components/FxTabs";
import { showSuccess } from "@/components/FxToast";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Sheet, SheetBody, SheetContent, SheetFooter, SheetHeader } from "@/components/ui/sheet";
import { ROUTES, STORAGE_KEYS, WORKSPACE_TYPES } from "@/lib/FxConstants";
import { PAGE_COPY } from "@/lib/FxCopy";
import { normalizeJobRecord } from "@/lib/FxJobSchema";
import {
  findStoredCandidatesByJob,
  findStoredCandidate,
  findStoredJob,
  readStoredCandidates,
  readStoredJobs,
  readStoredWorkspaceType,
  upsertStoredJob,
  writeStoredCandidates,
  updateStoredCandidate,
} from "@/lib/FxStore";
import { FX_COLORS, FX_RADIUS, FX_TYPOGRAPHY } from "@/lib/FxTheme";
import { cn } from "@/lib/FxUtils";

const PIPELINE_STAGES = [
  // { value: "all", label: "All" },
  { value: "unscreened", label: "Unscreened" },
  { value: "screened", label: "Pre-Screened" },
  { value: "shortlisted", label: "Shortlisted" },
  { value: "shared", label: "Sent to Client" },
  { value: "rejected", label: "Rejected" },
];

const PIPELINE_STAGE_SEQUENCE = PIPELINE_STAGES.filter((stage) => stage.value !== "all").map((stage) => stage.value);
const PIPELINE_STAGE_COUNT_KEYS = {
  unscreened: "unscreenedCount",
  screened: "preScreenedCount",
  shortlisted: "shortlistedCount",
  shared: "sentToClientCount",
};

const EMPTY_STAGE_COPY = {
  // all: {
  //   title: "No candidates yet",
  //   body: "Start adding candidates to begin screening and evaluation for this role.",
  // },
  unscreened: {
    title: "No unscreened candidates yet",
    body: "Add candidates to begin AI pre-screening for this role.",
  },
  screened: {
    title: "No pre-screened candidates yet",
    body: "Move candidates through pre-screening to continue the shortlist workflow.",
  },
  shortlisted: {
    title: "No shortlisted candidates yet",
    body: "Shortlist strong candidates to prepare them for client review.",
  },
  shared: {
    title: "No candidates sent to client yet",
    body: "Candidates shared with the client will appear here.",
  },
  rejected: {
    title: "No rejected candidates yet",
    body: "Rejected candidates will be grouped here for this job.",
  },
};

const CLIENT_STATUS_OPTIONS = [
  "Feedback Awaited",
  "Shortlisted",
  "Interviewing",
  "Offered",
  "Joined",
  "Rejected",
  "On Hold",
  "Dropped Off",
];

function getClientOutcomeStage(status) {
  if (status === "Rejected" || status === "Dropped Off") {
    return "rejected";
  }

  return "shared";
}

function normalizeJob(job) {
  return normalizeJobRecord(job);
}

function getPipelineCountKey(status) {
  return PIPELINE_STAGE_COUNT_KEYS[status] ?? null;
}

function updateJobPipelineCounts(job, fromStatus, toStatus, removeFromJob = false) {
  if (!job) {
    return null;
  }

  const nextJob = {
    ...job,
    unscreenedCount: Number(job.unscreenedCount) || 0,
    preScreenedCount: Number(job.preScreenedCount ?? job.screenedCount) || 0,
    shortlistedCount: Number(job.shortlistedCount) || 0,
    sentToClientCount: Number(job.sentToClientCount ?? job.sharedCount) || 0,
    screenedCount: Number(job.preScreenedCount ?? job.screenedCount) || 0,
    sharedCount: Number(job.sentToClientCount ?? job.sharedCount) || 0,
  };

  const decrementKey = getPipelineCountKey(fromStatus);
  if (decrementKey) {
    nextJob[decrementKey] = Math.max(0, Number(nextJob[decrementKey]) - 1);
    if (decrementKey === "preScreenedCount") {
      nextJob.screenedCount = nextJob[decrementKey];
    }
    if (decrementKey === "sentToClientCount") {
      nextJob.sharedCount = nextJob[decrementKey];
    }
  }

  const incrementKey = !removeFromJob ? getPipelineCountKey(toStatus) : null;
  if (incrementKey && incrementKey !== decrementKey) {
    nextJob[incrementKey] = Number(nextJob[incrementKey]) + 1;
    if (incrementKey === "preScreenedCount") {
      nextJob.screenedCount = nextJob[incrementKey];
    }
    if (incrementKey === "sentToClientCount") {
      nextJob.sharedCount = nextJob[incrementKey];
    }
  }

  return nextJob;
}

function getNextPipelineStage(status) {
  const index = PIPELINE_STAGE_SEQUENCE.indexOf(status);

  if (index < 0) {
    return PIPELINE_STAGE_SEQUENCE[0];
  }

  return PIPELINE_STAGE_SEQUENCE[Math.min(index + 1, PIPELINE_STAGE_SEQUENCE.length - 1)];
}

function normalizeCandidate(candidate, job) {
  if (!candidate) {
    return null;
  }
  const jobContext = candidate.jobContexts?.[job?.id] ?? null;

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
    screeningOutcome: candidate.screeningOutcome ?? candidate.screeningStatus ?? candidate.callStatus ?? "",
    matchScore: candidate.matchScore != null ? Number(candidate.matchScore) : null,
    availabilityDays: candidate.availabilityDays != null ? Number(candidate.availabilityDays) : null,
    currentSalary: candidate.currentSalary != null ? Number(candidate.currentSalary) : null,
    expectedSalary: candidate.expectedSalary != null ? Number(candidate.expectedSalary) : null,
    email: candidate.email ?? "—",
    phone: candidate.phone ?? "—",
    uploadedBy: candidate.uploadedBy ?? "Manual entry",
    source: candidate.source ?? candidate.uploadedBy ?? "Direct",
    clientStatus: candidate.clientStatus ?? jobContext?.clientStatus ?? "Feedback Awaited",
    rejectionReason: candidate.rejectionReason ?? jobContext?.rejectionReason ?? "Rejected for this role",
    jobContext,
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

function WorkspaceEmptyState({ title, body, action }) {
  return (
    <div className={`flex h-full min-h-[320px] items-center justify-center border ${FX_COLORS.border} ${FX_RADIUS.sm} bg-[var(--fx-surface)] px-[24px] py-[24px]`}>
      <div className="max-w-[440px] space-y-[16px] text-center">
        <div className="mx-auto flex size-[48px] items-center justify-center rounded-full bg-[var(--fx-bg-soft)] text-[var(--fx-primary)]">
          <Users className="size-[22px]" />
        </div>
        <div className="space-y-[8px]">
          <p className={FX_TYPOGRAPHY.sectionTitle}>{title}</p>
          <p className={`${FX_TYPOGRAPHY.body} text-[var(--fx-text-muted)]`}>{body}</p>
        </div>
        {action ? <div className="flex justify-center">{action}</div> : null}
      </div>
    </div>
  );
}

function CandidateWorkspaceSheet({
  open,
  onOpenChange,
  candidate,
  job,
  onMoveToNextStage,
  onMarkNotInterested,
  onReject,
  onRemoveFromJob,
  onSetScreeningMode,
}) {
  const screeningMode = candidate?.jobContext?.screeningModeOverride ?? "ai";
  const isRejected = candidate?.status === "rejected";
  const currentStageLabel = isRejected
    ? "Rejected"
    : PIPELINE_STAGES.find((stage) => stage.value === (candidate?.status ?? "unscreened"))?.label ?? "Unscreened";
  const currentStageIndex = isRejected ? -1 : PIPELINE_STAGE_SEQUENCE.indexOf(candidate?.status ?? "unscreened");
  const nextStageLabel = currentStageIndex >= 0 && currentStageIndex < PIPELINE_STAGE_SEQUENCE.length - 1
    ? PIPELINE_STAGES.find((stage) => stage.value === PIPELINE_STAGE_SEQUENCE[currentStageIndex + 1])?.label
    : null;
  const candidateAnswers = (
    [candidate?.screeningAnswers, candidate?.answers, candidate?.responses, candidate?.jobContext?.answers].find(
      (value) => Array.isArray(value) && value.length,
    ) ?? []
  ).filter(Boolean);

  const profileDetails = [
    { label: "Current Role", value: candidate?.currentRole || candidate?.jobTitle || "—" },
    { label: "Current Company", value: candidate?.currentCompany || candidate?.client || "—" },
    { label: "Email", value: candidate?.email || "—" },
    { label: "Phone", value: candidate?.phone || "—" },
    { label: "Experience", value: candidate?.experience != null ? `${candidate.experience} years` : "—" },
    { label: "Job", value: job?.title || "—" },
  ];

  const answers = [
    { label: "Availability", value: candidate?.availabilityDays != null ? formatAvailability(candidate.availabilityDays) : "—" },
    { label: "Current Salary", value: candidate?.currentSalary != null ? formatCurrency(candidate.currentSalary) : "—" },
    { label: "Expected Salary", value: candidate?.expectedSalary != null ? formatCurrency(candidate.expectedSalary) : "—" },
    { label: "Interested", value: candidate?.interested || "—" },
    { label: "Screening Result", value: candidate?.screeningOutcome || "—" },
    { label: "Notice Period", value: candidate?.jobContext?.noticePeriod || "Not captured" },
  ];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent size="xl">
        <SheetHeader
          title={candidate?.name || "Candidate"}
          description={`${currentStageLabel} · ${candidate?.jobTitle || job?.title || "Candidate profile"} · Job-specific review and actions`}
        />
        <SheetBody>
          {candidate ? (
            <div className="space-y-[20px]">
              <div className={`rounded-[16px] border ${FX_COLORS.border} bg-[var(--fx-surface)] p-[20px]`}>
                <div className="flex flex-wrap items-start justify-between gap-[16px]">
                  <div className="min-w-0 space-y-[8px]">
                    <div className="flex flex-wrap items-center gap-[8px]">
                      <p className={FX_TYPOGRAPHY.cardTitle}>{candidate.name}</p>
                      {!candidate.jobContext?.viewedAt ? (
                        <span className="inline-flex items-center rounded-full bg-[color:color-mix(in_srgb,var(--fx-primary)_12%,var(--fx-surface)_88%)] px-[8px] py-[3px] text-[12px] font-medium text-[var(--fx-primary)]">
                          New
                        </span>
                      ) : null}
                    </div>
                    <p className={`${FX_TYPOGRAPHY.body} text-[var(--fx-text-muted)]`}>
                      {candidate.currentRole || "Candidate"}{candidate.currentCompany ? ` · ${candidate.currentCompany}` : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-[8px]">
                    <span className="inline-flex items-center rounded-full bg-[var(--fx-surface-selected)] px-[10px] py-[4px] text-[12px] font-medium text-[var(--fx-primary)]">
                      {candidate.matchScore != null ? `${candidate.matchScore}% JD match` : "Match unavailable"}
                    </span>
                    <span className="inline-flex items-center rounded-full bg-[var(--fx-bg-soft)] px-[10px] py-[4px] text-[12px] font-medium text-[var(--fx-text-muted)]">
                      {currentStageLabel}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid gap-[16px] md:grid-cols-2">
                <div className={`rounded-[16px] border ${FX_COLORS.border} bg-[var(--fx-surface)] p-[16px]`}>
                  <p className={FX_TYPOGRAPHY.cardTitle}>Resume / profile summary</p>
                  <div className="mt-[12px] grid gap-[12px] sm:grid-cols-2">
                    {profileDetails.map((item) => (
                      <MetaField key={item.label} label={item.label} value={item.value} />
                    ))}
                  </div>
                </div>

                <div className={`rounded-[16px] border ${FX_COLORS.border} bg-[var(--fx-surface)] p-[16px]`}>
                  <p className={FX_TYPOGRAPHY.cardTitle}>Screening result</p>
                  <div className="mt-[12px] grid gap-[12px] sm:grid-cols-2">
                    {answers.map((item) => (
                      <MetaField key={item.label} label={item.label} value={item.value} />
                    ))}
                  </div>
                </div>
              </div>

              <div className={`rounded-[16px] border ${FX_COLORS.border} bg-[var(--fx-surface)] p-[16px]`}>
                <p className={FX_TYPOGRAPHY.cardTitle}>Interview journey</p>
                <div className="mt-[12px] grid gap-[8px] md:grid-cols-4">
                  {PIPELINE_STAGE_SEQUENCE.map((stage, index) => {
                    const stageLabel = PIPELINE_STAGES.find((item) => item.value === stage)?.label ?? stage;
                    const isActive = candidate.status === stage;
                    const isComplete = currentStageIndex > index;

                    return (
                      <div
                        key={stage}
                        className={cn(
                          "rounded-[12px] border px-[12px] py-[12px]",
                          isActive
                            ? "border-[var(--fx-primary)] bg-[color:color-mix(in_srgb,var(--fx-primary)_8%,var(--fx-surface)_92%)]"
                            : isComplete
                              ? "border-[color:color-mix(in_srgb,var(--fx-border)_72%,transparent)] bg-[var(--fx-surface)]"
                              : "border-[var(--fx-border)] bg-[var(--fx-surface)]",
                        )}
                      >
                        <div className="flex items-center justify-between gap-[8px]">
                          <span className={cn("text-[13px] leading-[20px] font-medium", isActive ? "text-[var(--fx-primary)]" : "text-[var(--fx-text)]")}>
                            {stageLabel}
                          </span>
                          {isComplete ? <Check className="size-[14px] text-[var(--fx-success)]" /> : isActive ? <Circle className="size-[14px] text-[var(--fx-primary)]" /> : <Circle className="size-[14px] text-[var(--fx-text-disabled)]" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-[12px] text-[13px] leading-[20px] text-[var(--fx-text-muted)]">
                  Current stage: {currentStageLabel}
                  {nextStageLabel ? ` · Next: ${nextStageLabel}` : ""}
                </div>
              </div>

              <div className={`rounded-[16px] border ${FX_COLORS.border} bg-[var(--fx-surface)] p-[16px]`}>
                <div className="flex items-start justify-between gap-[16px]">
                  <div className="space-y-[4px]">
                    <p className={FX_TYPOGRAPHY.cardTitle}>Screening mode override</p>
                    <p className={`${FX_TYPOGRAPHY.fieldHint} text-[var(--fx-text-muted)]`}>
                      Workspace default comes from Settings. You can override it for this candidate.
                    </p>
                  </div>
                </div>
                <RadioGroup
                  value={screeningMode}
                  onValueChange={(value) => onSetScreeningMode?.(candidate, value)}
                  className="mt-[12px] grid gap-[8px]"
                >
                  {[
                    { value: "ai", label: "AI Screening" },
                    { value: "manual", label: "Manual Interview" },
                  ].map((option) => (
                    <label
                      key={option.value}
                      className="flex cursor-pointer items-center gap-[12px] rounded-[12px] border border-[var(--fx-border)] bg-[var(--fx-surface)] px-[12px] py-[12px]"
                    >
                      <RadioGroupItem value={option.value} />
                      <span className="text-[14px] leading-[22px] text-[var(--fx-text)]">{option.label}</span>
                    </label>
                  ))}
                </RadioGroup>
              </div>

              <div className={`rounded-[16px] border ${FX_COLORS.border} bg-[var(--fx-surface)] p-[16px]`}>
                <p className={FX_TYPOGRAPHY.cardTitle}>Candidate answers</p>
                <div className="mt-[12px] grid gap-[8px] md:grid-cols-2">
                  {candidateAnswers.length ? (
                    candidateAnswers.map((answer, index) => (
                      <div key={`${answer.question ?? index}`} className={`rounded-[12px] border ${FX_COLORS.border} bg-[var(--fx-bg-soft)] p-[12px]`}>
                        <p className={`${FX_TYPOGRAPHY.fieldHint} text-[var(--fx-text-muted)]`}>{answer.question ?? `Question ${index + 1}`}</p>
                        <p className={`${FX_TYPOGRAPHY.body} mt-[4px] text-[var(--fx-text)]`}>{answer.answer ?? answer.value ?? "—"}</p>
                      </div>
                    ))
                  ) : (
                    <div className="md:col-span-2">
                      <p className={`${FX_TYPOGRAPHY.body} text-[var(--fx-text-muted)]`}>
                        No screening answers captured yet. Review the candidate profile and move them through the job workflow first.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className={`rounded-[16px] border ${FX_COLORS.border} bg-[var(--fx-surface)] p-[16px]`}>
                <p className={FX_TYPOGRAPHY.cardTitle}>Notes / activity</p>
                <p className={`${FX_TYPOGRAPHY.body} mt-[8px] text-[var(--fx-text-muted)]`}>
                  {candidate.jobContext?.notes || candidate.notes || candidate.activity || "No notes or activity recorded yet."}
                </p>
              </div>
            </div>
          ) : null}
        </SheetBody>
        <SheetFooter
          left={
            <span className={`${FX_TYPOGRAPHY.fieldHint} text-[var(--fx-text-muted)]`}>
              Candidate actions update this job only.
            </span>
          }
          right={(
            <div className="flex flex-wrap items-center gap-[8px]">
              <FxButton variant="outline" size="sm" onClick={() => candidate && onMoveToNextStage?.(candidate)}>
                Move to Next Stage
              </FxButton>
              <FxButton variant="outline" size="sm" onClick={() => candidate && onMarkNotInterested?.(candidate)}>
                Mark as Not Interested
              </FxButton>
              <FxButton variant="destructive" size="sm" onClick={() => candidate && onReject?.(candidate)}>
                Reject Candidate
              </FxButton>
              <FxButton variant="destructive" size="sm" onClick={() => candidate && onRemoveFromJob?.(candidate)}>
                Remove from Job
              </FxButton>
            </div>
          )}
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

function AddCandidatesDrawer({
  open,
  onOpenChange,
  job,
  candidatePool,
  onPickExistingCandidate,
  onUploadFiles,
  onAddSingleCandidate,
}) {
  const fileInputRef = useRef(null);
  const [draft, setDraft] = useState({ name: "", email: "", phone: "", currentCompany: "", currentRole: "", experience: "" });
  const [isDragging, setIsDragging] = useState(false);
  const [activeMode, setActiveMode] = useState("pick");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!open) {
      setDraft({ name: "", email: "", phone: "", currentCompany: "", currentRole: "", experience: "" });
      setIsDragging(false);
      setActiveMode("pick");
      setSearchTerm("");

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }, [open]);

  function resetDraft() {
    setDraft({ name: "", email: "", phone: "", currentCompany: "", currentRole: "", experience: "" });
  }

  function handleFileSelection(event) {
    onUploadFiles(event.target.files);
    event.target.value = "";
  }

  function handleDrop(event) {
    event.preventDefault();
    setIsDragging(false);
    onUploadFiles(event.dataTransfer.files);
  }

  const filteredCandidates = (candidatePool ?? []).filter((candidate) => {
    const query = searchTerm.trim().toLowerCase();

    if (!query) {
      return true;
    }

    return [candidate.name, candidate.email, candidate.currentRole, candidate.currentCompany]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes(query);
  });

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent size="xl">
        <SheetHeader
          title="Add Candidates"
          description={`Add candidates to ${job?.title || "this job"}.`}
        />
        <SheetBody>
          <div className="space-y-[16px]">
            <FxTabs
              tabs={[
                { value: "pick", label: "From Candidates" },
                { value: "upload", label: "Upload" },
                { value: "manual", label: "Manual Entry" },
              ]}
              active={activeMode}
              onChange={setActiveMode}
              className="justify-start"
              showUnderline
            />

            {activeMode === "pick" ? (
              <section className={`rounded-[16px] border ${FX_COLORS.border} bg-[var(--fx-surface)] p-[20px]`}>
                <div className="flex items-start justify-between gap-[16px]">
                  <div className="space-y-[4px]">
                    <p className={FX_TYPOGRAPHY.cardTitle}>Pick from candidates</p>
                    <p className={`${FX_TYPOGRAPHY.body} text-[var(--fx-text-muted)]`}>
                      Add an existing candidate to this job without re-entering their details.
                    </p>
                  </div>
                  <div className="w-full max-w-[280px]">
                    <FxInput
                      placeholder="Search candidates"
                      value={searchTerm}
                      onChange={(event) => setSearchTerm(event.target.value)}
                    />
                  </div>
                </div>

                <div className="mt-[16px] space-y-[10px]">
                  {filteredCandidates.length ? (
                    filteredCandidates.map((candidate) => (
                      <div
                        key={candidate.id}
                        className={`flex items-center justify-between gap-[12px] rounded-[14px] border ${FX_COLORS.border} bg-[var(--fx-bg-soft)] px-[16px] py-[14px]`}
                      >
                        <div className="min-w-0 space-y-[4px]">
                          <p className={`${FX_TYPOGRAPHY.button} truncate text-[var(--fx-text)]`}>{candidate.name}</p>
                          <p className={`${FX_TYPOGRAPHY.fieldHint} truncate text-[var(--fx-text-muted)]`}>
                            {candidate.currentRole || candidate.jobTitle || "Candidate"}{candidate.currentCompany ? ` · ${candidate.currentCompany}` : ""}
                          </p>
                        </div>
                        <FxButton type="button" variant="outline" size="sm" onClick={() => onPickExistingCandidate(candidate)}>
                          Add to Job
                        </FxButton>
                      </div>
                    ))
                  ) : (
                    <div className={`rounded-[14px] border ${FX_COLORS.border} bg-[var(--fx-surface)] p-[20px] text-center`}>
                      <p className={FX_TYPOGRAPHY.button}>No candidates found</p>
                      <p className={`${FX_TYPOGRAPHY.fieldHint} mt-[4px] text-[var(--fx-text-muted)]`}>
                        Try another name or use upload/manual entry.
                      </p>
                    </div>
                  )}
                </div>
              </section>
            ) : null}

            {activeMode === "upload" ? (
              <section className={`rounded-[16px] border ${FX_COLORS.border} bg-[var(--fx-surface)] p-[20px]`}>
                <div
                  onDragOver={(event) => {
                    event.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  className={`flex min-h-[220px] cursor-pointer flex-col items-center justify-center rounded-[16px] border border-dashed px-[20px] py-[24px] text-center transition-colors ${
                    isDragging
                      ? "border-[var(--fx-primary)] bg-[var(--fx-surface-selected)]"
                      : "border-[var(--fx-border)] bg-[var(--fx-bg-soft)] hover:bg-[var(--fx-surface-hover)]"
                  }`}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="size-[28px] text-[var(--fx-primary)]" />
                  <p className="mt-[12px] text-[14px] leading-[22px] font-medium text-[var(--fx-text)]">
                    Upload resumes
                  </p>
                  <div className="mt-[16px] flex items-center gap-[8px]">
                    <FxButton
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        fileInputRef.current?.click();
                      }}
                    >
                      Upload
                    </FxButton>
                    <FxButton
                      variant="outline"
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        fileInputRef.current?.click();
                      }}
                    >
                      Browse
                    </FxButton>
                  </div>
                  <p className="mt-[12px] text-[13px] leading-[20px] text-[var(--fx-text-muted)]">
                    Bulk or single resume.
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx,.txt"
                    className="hidden"
                    onChange={handleFileSelection}
                  />
                </div>
              </section>
            ) : null}

            {activeMode === "manual" ? (
              <section className={`rounded-[16px] border ${FX_COLORS.border} bg-[var(--fx-surface)] p-[20px]`}>
                <div className="grid gap-[16px] md:grid-cols-2">
                  <FxInput
                    label="Full Name"
                    placeholder="Aarav Mehta"
                    value={draft.name}
                    onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))}
                  />
                  <FxInput
                    label="Email"
                    placeholder="aarav@example.com"
                    value={draft.email}
                    onChange={(event) => setDraft((current) => ({ ...current, email: event.target.value }))}
                  />
                  <FxInput
                    label="Phone"
                    placeholder="+91 98765 43210"
                    value={draft.phone}
                    onChange={(event) => setDraft((current) => ({ ...current, phone: event.target.value }))}
                  />
                  <FxInput
                    label="Current Company"
                    placeholder="ThinkJS"
                    value={draft.currentCompany || ""}
                    onChange={(event) => setDraft((current) => ({ ...current, currentCompany: event.target.value }))}
                  />
                  <FxInput
                    label="Current Role"
                    placeholder="Frontend Engineer"
                    value={draft.currentRole || ""}
                    onChange={(event) => setDraft((current) => ({ ...current, currentRole: event.target.value }))}
                  />
                  <FxInput
                    label="Experience (Years)"
                    placeholder="4"
                    type="number"
                    min="0"
                    value={draft.experience || ""}
                    onChange={(event) => setDraft((current) => ({ ...current, experience: event.target.value }))}
                  />
                </div>

                <div className="mt-[16px] flex items-center gap-[8px]">
                  <FxButton
                    type="button"
                    onClick={() => {
                      onAddSingleCandidate(draft, resetDraft);
                    }}
                    disabled={!draft.name.trim()}
                  >
                    <Plus className="size-[16px]" />
                    Add Candidate
                  </FxButton>
                  <FxButton type="button" variant="ghost" onClick={resetDraft}>
                    Clear
                  </FxButton>
                </div>
              </section>
            ) : null}
          </div>
        </SheetBody>
        <SheetFooter
          left={<span className={`${FX_TYPOGRAPHY.fieldHint} text-[var(--fx-text-muted)]`}>Bulk upload and manual entry update the current job immediately.</span>}
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

function subscribeToJobStoreChange(onStoreChange) {
  if (typeof window === "undefined") {
    return () => {};
  }

  window.addEventListener("storage", onStoreChange);
  window.addEventListener("fx-storage-change", onStoreChange);

  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener("fx-storage-change", onStoreChange);
  };
}

export default function JobDetailsPage({ params }) {
  const { jobId } = React.use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const jobSnapshot = useSyncExternalStore(
    subscribeToJobStoreChange,
    () => JSON.stringify(readStoredJobs().find((item) => item.id === jobId) ?? null),
    () => "null",
  );
  const job = useMemo(() => {
    if (!jobSnapshot || jobSnapshot === "null") {
      return null;
    }

    try {
      return normalizeJob(JSON.parse(jobSnapshot));
    } catch {
      return normalizeJob(findStoredJob(jobId));
    }
  }, [jobId, jobSnapshot]);
  const workspaceType = useSyncExternalStore(subscribeToWorkspaceTypeChange, readStoredWorkspaceType, () => null);
  const candidateSnapshot = useSyncExternalStore(
    subscribeToJobStoreChange,
    () => JSON.stringify(readStoredCandidates()),
    () => "[]",
  );
  const showClientInfo = workspaceType === WORKSPACE_TYPES.CLIENTS || workspaceType === WORKSPACE_TYPES.BOTH;

  const activeStage = PIPELINE_STAGES.some((stage) => stage.value === searchParams?.get("tab"))
    ? searchParams.get("tab")
    : "unscreened";

  const [searchTerm, setSearchTerm] = useState("");
  const [recommendedOpen, setRecommendedOpen] = useState(false);
  const [addCandidatesOpen, setAddCandidatesOpen] = useState(false);
  const [candidateSheetOpen, setCandidateSheetOpen] = useState(false);
  const [callPreviewOpen, setCallPreviewOpen] = useState(false);
  const [selectedCandidateIds, setSelectedCandidateIds] = useState([]);
  const [selectedCandidateId, setSelectedCandidateId] = useState(null);
  const [sortConfig, setSortConfig] = useState(null);
  const searchRef = useRef(null);
  const jobTitleText = job?.title || "this job";

  const candidateRows = useMemo(
    () =>
      (job ? findStoredCandidatesByJob(job.id) : [])
        .map((candidate) => normalizeCandidate(candidate, job))
        .filter(Boolean),
    [candidateSnapshot, job],
  );

  useEffect(() => {
    if (job?.status === "Draft") {
      router.replace(ROUTES.JOBS, { scroll: false });
    }
  }, [job?.status, router]);

  const candidateCounts = useMemo(
    () => getStoredPipelineCounts(candidateRows),
    [candidateRows],
  );
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

  const sortedCandidates = useMemo(() => {
    if (!sortConfig) {
      return filteredCandidates;
    }

    return [...filteredCandidates].sort((left, right) => {
      const leftValue = left[sortConfig.key];
      const rightValue = right[sortConfig.key];

      if (sortConfig.key === "updatedAt") {
        const leftTime = new Date(leftValue ?? 0).getTime();
        const rightTime = new Date(rightValue ?? 0).getTime();
        return sortConfig.direction === "asc" ? leftTime - rightTime : rightTime - leftTime;
      }

      if (typeof leftValue === "number" && typeof rightValue === "number") {
        return sortConfig.direction === "asc" ? leftValue - rightValue : rightValue - leftValue;
      }

      return sortConfig.direction === "asc"
        ? String(leftValue ?? "").localeCompare(String(rightValue ?? ""))
        : String(rightValue ?? "").localeCompare(String(leftValue ?? ""));
    });
  }, [filteredCandidates, sortConfig]);

  useEffect(() => {
    const visibleIds = new Set(filteredCandidates.map((candidate) => candidate.id));
    setSelectedCandidateIds((current) => current.filter((candidateId) => visibleIds.has(candidateId)));
  }, [filteredCandidates, activeStage]);

  const selectedCandidate = useMemo(
    () => candidateRows.find((candidate) => candidate.id === selectedCandidateId) ?? null,
    [candidateRows, selectedCandidateId],
  );
  const selectedVisibleCandidates = useMemo(
    () => filteredCandidates.filter((candidate) => selectedCandidateIds.includes(candidate.id)),
    [filteredCandidates, selectedCandidateIds],
  );
  const selectedCount = selectedVisibleCandidates.length;
  const selectedCountLabel = selectedCount === 1 ? "1 candidate selected" : `${selectedCount} candidates selected`;
  const bulkStage = activeStage;
  const tableSortedColumnKey =
    sortConfig?.key === "name"
      ? "name"
      : sortConfig?.key === "matchScore"
        ? "matchScore"
        : sortConfig?.key === "availabilityDays"
          ? "availability"
            : sortConfig?.key === "currentSalary"
              ? "currentSalary"
              : sortConfig?.key === "expectedSalary"
                ? "expectedSalary"
                : sortConfig?.key === "updatedAt"
                  ? "updatedAt"
                  : null;
  const tableSortedColumnDirection = sortConfig?.direction ?? "asc";

  const updateWorkspaceCandidate = useCallback(
    (candidateId, updater, { fromStatus, toStatus, removeFromJob = false } = {}) => {
      if (!job?.id || !candidateId) {
        return null;
      }

      const currentCandidate = findStoredCandidate(candidateId);
      if (!currentCandidate) {
        return null;
      }

      const nextCandidate = updateStoredCandidate(candidateId, updater);
      if (!nextCandidate) {
        return null;
      }

      if (toStatus != null || removeFromJob) {
        const currentJob = findStoredJob(job.id) ?? job;
        const nextJob = updateJobPipelineCounts(currentJob, fromStatus ?? currentCandidate.status, toStatus, removeFromJob);

        if (nextJob) {
          upsertStoredJob({ ...nextJob, id: currentJob.id });
        }
      }

      return nextCandidate;
    },
    [job],
  );

  const markCandidateViewed = useCallback(
    (candidateId) => {
      if (!job?.id || !candidateId) {
        return;
      }

      updateWorkspaceCandidate(candidateId, (candidate) => ({
        ...candidate,
        jobContexts: {
          ...(candidate.jobContexts ?? {}),
          [job.id]: {
            ...(candidate.jobContexts?.[job.id] ?? {}),
            viewedAt: new Date().toISOString(),
          },
        },
      }));
    },
    [job?.id, updateWorkspaceCandidate],
  );

  const handleOpenCandidateSheet = useCallback(
    (candidate) => {
      if (!candidate) {
        return;
      }

      setSelectedCandidateId(candidate.id);
      setCandidateSheetOpen(true);
      markCandidateViewed(candidate.id);
    },
    [markCandidateViewed],
  );

  const handleMoveCandidateToNextStage = useCallback(
    (candidate) => {
      if (!candidate) {
        return;
      }

      const nextStage = candidate.status === "rejected" ? "unscreened" : getNextPipelineStage(candidate.status);

      updateWorkspaceCandidate(
        candidate.id,
        (current) => ({
          ...current,
          status: nextStage,
        }),
        { fromStatus: candidate.status, toStatus: nextStage },
      );

      showSuccess("Candidate moved", `${candidate.name} moved to ${PIPELINE_STAGES.find((stage) => stage.value === nextStage)?.label ?? "next stage"}.`);
    },
    [updateWorkspaceCandidate],
  );

  const handleMarkCandidateNotInterested = useCallback(
    (candidate) => {
      if (!candidate) {
        return;
      }

      updateWorkspaceCandidate(candidate.id, (current) => ({ ...current, interested: "No" }));
      showSuccess("Candidate updated", `${candidate.name} was marked as not interested.`);
    },
    [updateWorkspaceCandidate],
  );

  const handleRejectCandidate = useCallback(
    (candidate) => {
      if (!candidate) {
        return;
      }

      updateWorkspaceCandidate(
        candidate.id,
        (current) => ({
          ...current,
          status: "rejected",
        }),
        { fromStatus: candidate.status, toStatus: "rejected" },
      );
      showSuccess("Candidate rejected", `${candidate.name} was moved to the rejected state.`);
    },
    [updateWorkspaceCandidate],
  );

  const handleRemoveCandidateFromJob = useCallback(
    (candidate) => {
      if (!candidate) {
        return;
      }

      updateWorkspaceCandidate(
        candidate.id,
        (current) => ({
          ...current,
          jobId: null,
          jobTitle: current.jobTitle ?? job?.title ?? "",
        }),
        { fromStatus: candidate.status, removeFromJob: true },
      );
      showSuccess("Candidate removed", `${candidate.name} was detached from ${jobTitleText}.`);
    },
    [job?.title, jobTitleText, updateWorkspaceCandidate],
  );

  const handleSetCandidateScreeningMode = useCallback(
    (candidate, screeningModeOverride) => {
      if (!candidate || !job?.id) {
        return;
      }

      updateWorkspaceCandidate(candidate.id, (current) => ({
        ...current,
        jobContexts: {
          ...(current.jobContexts ?? {}),
          [job.id]: {
            ...(current.jobContexts?.[job.id] ?? {}),
            screeningModeOverride,
          },
        },
      }));
    },
    [job?.id, updateWorkspaceCandidate],
  );

  const clearSelectedCandidates = useCallback(() => {
    setSelectedCandidateIds([]);
  }, []);

  const handleMoveCandidateToStage = useCallback(
    (candidate, nextStage, successLabel = null) => {
      if (!candidate || !nextStage || candidate.status === nextStage) {
        return;
      }

      updateWorkspaceCandidate(
        candidate.id,
        (current) => ({ ...current, status: nextStage }),
        { fromStatus: candidate.status, toStatus: nextStage },
      );

      showSuccess(
        "Candidate moved",
        `${candidate.name} moved to ${successLabel ?? PIPELINE_STAGES.find((stage) => stage.value === nextStage)?.label ?? nextStage}.`,
      );
    },
    [updateWorkspaceCandidate],
  );

  const handleUpdateClientStatus = useCallback(
    (candidate, nextStatus = null) => {
      if (!candidate) {
        return;
      }

      const currentIndex = CLIENT_STATUS_OPTIONS.indexOf(candidate.clientStatus || "Feedback Awaited");
      const resolvedStatus =
        nextStatus ??
        CLIENT_STATUS_OPTIONS[(currentIndex + 1 + CLIENT_STATUS_OPTIONS.length) % CLIENT_STATUS_OPTIONS.length] ??
        CLIENT_STATUS_OPTIONS[0];
      const nextStage = getClientOutcomeStage(resolvedStatus);
      const rejectionReason =
        resolvedStatus === "Rejected"
          ? "Rejected by client"
          : resolvedStatus === "Dropped Off"
            ? "Candidate dropped off after sharing"
            : candidate.rejectionReason;

      updateWorkspaceCandidate(
        candidate.id,
        (current) => ({
          ...current,
          status: nextStage,
          clientStatus: resolvedStatus,
          rejectionReason,
          jobContexts: {
            ...(current.jobContexts ?? {}),
            [job.id]: {
              ...(current.jobContexts?.[job.id] ?? {}),
              clientStatus: resolvedStatus,
            },
          },
        }),
        { fromStatus: candidate.status, toStatus: nextStage },
      );

      showSuccess(
        "Client status updated",
        nextStage === "rejected"
          ? `${candidate.name} marked as ${resolvedStatus} and moved to Rejected.`
          : `${candidate.name} marked as ${resolvedStatus}.`,
      );
    },
    [job?.id, updateWorkspaceCandidate],
  );

  const updateSelectedCandidateStatus = useCallback(
    (candidate, updater, options, message) => {
      if (!candidate) {
        return;
      }

      updateWorkspaceCandidate(candidate.id, updater, options);
      return message;
    },
    [updateWorkspaceCandidate],
  );

  const bulkSelectedVisibleCandidates = selectedVisibleCandidates;

  const bulkActionHandlers = {
    startAiPreScreening: () => {
      bulkSelectedVisibleCandidates.forEach((candidate) => {
        if (candidate.status !== "unscreened") {
          return;
        }

        updateSelectedCandidateStatus(
          candidate,
          (current) => ({ ...current, status: "screened" }),
          { fromStatus: candidate.status, toStatus: "screened" },
        );
      });
      showSuccess("Bulk action applied", `${bulkSelectedVisibleCandidates.length} candidate${bulkSelectedVisibleCandidates.length === 1 ? "" : "s"} moved to pre-screening.`);
      clearSelectedCandidates();
    },
    removeFromJob: () => {
      bulkSelectedVisibleCandidates.forEach((candidate) => {
        updateSelectedCandidateStatus(
          candidate,
          (current) => ({
            ...current,
            jobId: null,
            jobTitle: current.jobTitle ?? job?.title ?? "",
          }),
          { fromStatus: candidate.status, removeFromJob: true },
        );
      });
      showSuccess("Bulk action applied", `${bulkSelectedVisibleCandidates.length} candidate${bulkSelectedVisibleCandidates.length === 1 ? "" : "s"} removed from ${jobTitleText}.`);
      clearSelectedCandidates();
    },
    markNotInterested: () => {
      bulkSelectedVisibleCandidates.forEach((candidate) => {
        updateSelectedCandidateStatus(candidate, (current) => ({ ...current, interested: "No" }));
      });
      showSuccess("Bulk action applied", `${bulkSelectedVisibleCandidates.length} candidate${bulkSelectedVisibleCandidates.length === 1 ? "" : "s"} marked as not interested.`);
      clearSelectedCandidates();
    },
    reject: () => {
      bulkSelectedVisibleCandidates.forEach((candidate) => {
        updateSelectedCandidateStatus(
          candidate,
          (current) => ({ ...current, status: "rejected" }),
          { fromStatus: candidate.status, toStatus: "rejected" },
        );
      });
      showSuccess("Bulk action applied", `${bulkSelectedVisibleCandidates.length} candidate${bulkSelectedVisibleCandidates.length === 1 ? "" : "s"} rejected.`);
      clearSelectedCandidates();
    },
    moveToShortlisted: () => {
      bulkSelectedVisibleCandidates.forEach((candidate) => {
        if (candidate.status !== "screened") {
          return;
        }

        updateSelectedCandidateStatus(
          candidate,
          (current) => ({ ...current, status: "shortlisted" }),
          { fromStatus: candidate.status, toStatus: "shortlisted" },
        );
      });
      showSuccess("Bulk action applied", `${bulkSelectedVisibleCandidates.length} candidate${bulkSelectedVisibleCandidates.length === 1 ? "" : "s"} moved to shortlisted.`);
      clearSelectedCandidates();
    },
    moveToSentToClient: () => {
      bulkSelectedVisibleCandidates.forEach((candidate) => {
        if (!["screened", "shortlisted"].includes(candidate.status)) {
          return;
        }

        updateSelectedCandidateStatus(
          candidate,
          (current) => ({ ...current, status: "shared" }),
          { fromStatus: candidate.status, toStatus: "shared" },
        );
      });
      showSuccess("Bulk action applied", `${bulkSelectedVisibleCandidates.length} candidate${bulkSelectedVisibleCandidates.length === 1 ? "" : "s"} sent to client.`);
      clearSelectedCandidates();
    },
    moveBackToScreened: () => {
      bulkSelectedVisibleCandidates.forEach((candidate) => {
        if (candidate.status !== "shortlisted") {
          return;
        }

        updateSelectedCandidateStatus(
          candidate,
          (current) => ({ ...current, status: "screened" }),
          { fromStatus: candidate.status, toStatus: "screened" },
        );
      });
      showSuccess("Bulk action applied", `${bulkSelectedVisibleCandidates.length} candidate${bulkSelectedVisibleCandidates.length === 1 ? "" : "s"} moved back to pre-screened.`);
      clearSelectedCandidates();
    },
    moveBackToShortlisted: () => {
      bulkSelectedVisibleCandidates.forEach((candidate) => {
        if (candidate.status !== "shared") {
          return;
        }

        updateSelectedCandidateStatus(
          candidate,
          (current) => ({ ...current, status: "shortlisted" }),
          { fromStatus: candidate.status, toStatus: "shortlisted" },
        );
      });
      showSuccess("Bulk action applied", `${bulkSelectedVisibleCandidates.length} candidate${bulkSelectedVisibleCandidates.length === 1 ? "" : "s"} moved back to shortlisted.`);
      clearSelectedCandidates();
    },
    updateClientStatus: () => {
      const nextStatus = CLIENT_STATUS_OPTIONS[1] ?? "Shortlisted";
      const nextStage = getClientOutcomeStage(nextStatus);
      const rejectionReason =
        nextStatus === "Rejected"
          ? "Rejected by client"
          : nextStatus === "Dropped Off"
            ? "Candidate dropped off after sharing"
            : null;

      bulkSelectedVisibleCandidates.forEach((candidate) => {
        updateSelectedCandidateStatus(
          candidate,
          (current) => ({
            ...current,
            status: nextStage,
            clientStatus: nextStatus,
            rejectionReason: rejectionReason ?? current.rejectionReason,
            jobContexts: {
              ...(current.jobContexts ?? {}),
              [job.id]: {
                ...(current.jobContexts?.[job.id] ?? {}),
                clientStatus: nextStatus,
              },
            },
          }),
          { fromStatus: candidate.status, toStatus: nextStage },
        );
      });
      showSuccess(
        "Bulk action applied",
        nextStage === "rejected"
          ? `${bulkSelectedVisibleCandidates.length} candidate${bulkSelectedVisibleCandidates.length === 1 ? "" : "s"} updated to ${nextStatus} and moved to Rejected.`
          : `${bulkSelectedVisibleCandidates.length} candidate${bulkSelectedVisibleCandidates.length === 1 ? "" : "s"} updated to ${nextStatus}.`,
      );
      clearSelectedCandidates();
    },
    restoreToScreened: () => {
      bulkSelectedVisibleCandidates.forEach((candidate) => {
        if (candidate.status !== "rejected") {
          return;
        }

        updateSelectedCandidateStatus(
          candidate,
          (current) => ({ ...current, status: "screened" }),
          { fromStatus: candidate.status, toStatus: "screened" },
        );
      });
      showSuccess("Bulk action applied", `${bulkSelectedVisibleCandidates.length} rejected candidate${bulkSelectedVisibleCandidates.length === 1 ? "" : "s"} moved to pre-screened.`);
      clearSelectedCandidates();
    },
    restoreToShortlisted: () => {
      bulkSelectedVisibleCandidates.forEach((candidate) => {
        if (candidate.status !== "rejected") {
          return;
        }

        updateSelectedCandidateStatus(
          candidate,
          (current) => ({ ...current, status: "shortlisted" }),
          { fromStatus: candidate.status, toStatus: "shortlisted" },
        );
      });
      showSuccess("Bulk action applied", `${bulkSelectedVisibleCandidates.length} rejected candidate${bulkSelectedVisibleCandidates.length === 1 ? "" : "s"} moved to shortlisted.`);
      clearSelectedCandidates();
    },
  };

  const handleDownloadCandidateResume = useCallback((candidate) => {
    if (!candidate) {
      return;
    }

    const resumeText = [
      candidate.name,
      candidate.jobTitle || job?.title || "",
      candidate.currentRole || "",
      candidate.currentCompany || "",
      candidate.email || "—",
      candidate.phone || "—",
      `JD Match Score: ${candidate.matchScore != null ? `${candidate.matchScore}%` : "—"}`,
      `Trust Score: ${candidate.trustScore || "—"}`,
    ]
      .filter(Boolean)
      .join("\n");
    const blob = new Blob([resumeText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${candidate.name.replace(/\s+/g, "-").toLowerCase()}-resume.txt`;
    link.click();
    URL.revokeObjectURL(url);
  }, [job?.title]);

  const handleBulkDownloadResumes = useCallback(() => {
    const selectedCandidates = selectedVisibleCandidates.length ? selectedVisibleCandidates : filteredCandidates;

    if (!selectedCandidates.length) {
      return;
    }

    const blob = new Blob(
      [
        selectedCandidates
          .map(
            (candidate) =>
              [
                candidate.name,
                candidate.jobTitle || job?.title || "",
                candidate.currentRole || "",
                candidate.currentCompany || "",
                candidate.email || "—",
                candidate.phone || "—",
                `JD Match Score: ${candidate.matchScore != null ? `${candidate.matchScore}%` : "—"}`,
                `Trust Score: ${candidate.trustScore || "—"}`,
              ]
                .filter(Boolean)
                .join("\n"),
          )
          .join("\n\n---\n\n"),
      ],
      { type: "text/plain;charset=utf-8" },
    );
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${job?.id || "candidates"}-resumes.txt`;
    link.click();
    URL.revokeObjectURL(url);
  }, [filteredCandidates, job?.id, job?.title, selectedVisibleCandidates]);

  const handleStartPrescreening = useCallback(
    (candidate, screeningModeOverride) => {
      if (!candidate) {
        return;
      }

      if (screeningModeOverride) {
        handleSetCandidateScreeningMode(candidate, screeningModeOverride);
      }

      handleMoveCandidateToNextStage(candidate);
    },
    [handleMoveCandidateToNextStage, handleSetCandidateScreeningMode],
  );

  const recommendedCandidates = useMemo(() => {
    const allCandidates = readStoredCandidates();
    const attachedIds = new Set(candidateRows.map((candidate) => candidate.id));

    return allCandidates
      .filter((candidate) => candidate.jobId !== job?.id && !attachedIds.has(candidate.id))
      .map((candidate) => normalizeCandidate(candidate, findStoredJob(candidate.jobId)))
      .sort((left, right) => (right.matchScore ?? 0) - (left.matchScore ?? 0))
      .slice(0, 6);
  }, [candidateRows, candidateSnapshot, job?.id]);

  const handleAddCandidates = useCallback(() => {
    setAddCandidatesOpen(true);
  }, []);

  const normalizeUploadedCandidateName = useCallback((fileName) => {
    return String(fileName ?? "")
      .replace(/\.[^/.]+$/, "")
      .replace(/[_-]+/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .replace(/\b\w/g, (char) => char.toUpperCase()) || "Candidate";
  }, []);

  const appendCandidatesToJob = useCallback(
    (nextCandidates) => {
      if (!job?.id || !nextCandidates.length) {
        return;
      }

      const storedCandidates = readStoredCandidates();
      const currentJob = findStoredJob(job.id) ?? job;
      const nextJob = {
        ...currentJob,
        unscreenedCount: (Number(currentJob.unscreenedCount) || 0) + nextCandidates.length,
      };

      writeStoredCandidates([...storedCandidates, ...nextCandidates]);
      upsertStoredJob(nextJob);
    },
    [job],
  );

  const createCandidateRecord = useCallback(
    ({ name, email, phone, currentCompany, currentRole, experience, source, baseCandidate = null }) => {
      if (!job?.id) {
        return null;
      }

      const resolvedName = String(name ?? "").trim();
      const normalizedName = resolvedName || "Candidate";
      const slug = normalizedName.toLowerCase().replace(/[^a-z0-9]+/g, ".");
      const now = new Date().toISOString();

      return {
        id: `cand-${job.id.toLowerCase()}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        jobId: job.id,
        jobTitle: job.title ?? "",
        client: job.client ?? job.company ?? "",
        name: normalizedName,
        email: String(email ?? baseCandidate?.email ?? "").trim() || `${slug}@evality.ai`,
        phone: String(phone ?? baseCandidate?.phone ?? "").trim() || "—",
        currentCompany: String(currentCompany ?? baseCandidate?.currentCompany ?? "").trim() || "",
        currentRole: String(currentRole ?? baseCandidate?.currentRole ?? "").trim() || "",
        experience: experience != null && experience !== "" ? Number(experience) : baseCandidate?.experience ?? null,
        status: "unscreened",
        uploadedBy: source ?? baseCandidate?.uploadedBy ?? "Manual entry",
        interested: baseCandidate?.interested ?? "Maybe",
        availabilityDays: baseCandidate?.availabilityDays ?? null,
        currentSalary: baseCandidate?.currentSalary ?? null,
        expectedSalary: baseCandidate?.expectedSalary ?? null,
        screeningOutcome: "",
        jobContexts: {
          ...(baseCandidate?.jobContexts ?? {}),
          [job.id]: {
            ...(baseCandidate?.jobContexts?.[job.id] ?? {}),
            viewedAt: null,
            screeningModeOverride: baseCandidate?.jobContexts?.[job.id]?.screeningModeOverride ?? "ai",
          },
        },
        updatedAt: now,
      };
    },
    [job],
  );

  const handleAttachExistingCandidate = useCallback(
    (candidate) => {
      if (!candidate || !job) {
        return;
      }

      appendCandidatesToJob([
        createCandidateRecord({
          name: candidate.name,
          email: candidate.email,
          phone: candidate.phone,
          currentCompany: candidate.currentCompany,
          currentRole: candidate.currentRole,
          experience: candidate.experience,
          source: "From candidates",
          baseCandidate: candidate,
        }),
      ]);

      showSuccess("Candidate added", `${candidate.name} was added to ${jobTitleText}.`);
    },
    [appendCandidatesToJob, createCandidateRecord, jobTitleText],
  );

  const handleUploadCandidateFiles = useCallback(
    (files) => {
      const nextFiles = Array.from(files ?? []).filter(Boolean);

      if (!nextFiles.length) {
        return;
      }

      const nextCandidates = nextFiles
        .map((file, index) =>
          createCandidateRecord({
          name: normalizeUploadedCandidateName(file.name),
          source: "Resume upload",
          email: `${String(file.name ?? `resume-${index + 1}`)
            .replace(/\.[^/.]+$/, "")
            .replace(/[^a-z0-9]+/gi, ".")
            .toLowerCase()}@evality.ai`,
        }),
        )
        .filter(Boolean);

      appendCandidatesToJob(nextCandidates);
      showSuccess("Candidates added", `${nextCandidates.length} candidate${nextCandidates.length === 1 ? "" : "s"} added to ${jobTitleText}.`);
    },
    [appendCandidatesToJob, createCandidateRecord, jobTitleText, normalizeUploadedCandidateName],
  );

  const handleAddSingleCandidate = useCallback(
    (draft, resetDraft) => {
      const name = String(draft.name ?? "").trim();

      if (!name) {
        return;
      }

      appendCandidatesToJob([
        createCandidateRecord({
          name,
          email: draft.email,
          phone: draft.phone,
          currentCompany: draft.currentCompany,
          currentRole: draft.currentRole,
          experience: draft.experience,
          source: "Manual entry",
        }),
      ]);

      resetDraft();
      showSuccess("Candidate added", `${name} was added to ${jobTitleText}.`);
    },
    [appendCandidatesToJob, createCandidateRecord, jobTitleText],
  );

  function handleStageChange(nextStage) {
    router.replace(`${ROUTES.JOB(jobId)}?tab=${nextStage}`, { scroll: false });
  }

  function handleSort(key) {
    setSortConfig((current) => {
      if (current?.key === key) {
        if (current.direction === "asc") {
          return { key, direction: "desc" };
        }

        return null;
      }

      return { key, direction: key === "matchScore" ? "desc" : "asc" };
    });
  }

  function getSortHeaderButtonClassName(key) {
    return cn(
      "inline-flex cursor-pointer items-center gap-[8px] whitespace-nowrap text-left",
      sortConfig?.key === key ? "text-[var(--fx-primary)]" : "text-[var(--fx-text-muted)]",
    );
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

  function renderStageActionButton(candidate) {
    const className =
      "inline-flex size-[32px] items-center justify-center rounded-[6px] border-0 bg-[var(--fx-surface-raised)] text-[var(--fx-text)] transition-colors duration-150 hover:bg-[color-mix(in_srgb,var(--fx-primary)_10%,var(--fx-surface-raised)_90%)] hover:text-[var(--fx-primary)]";

    if (activeStage === "unscreened") {
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="inline-flex">
              <button type="button" className={className} aria-label={`Start AI pre-screening for ${candidate.name}`} onClick={() => handleStartPrescreening(candidate, "ai")}>
                <Sparkles className="size-[14px]" />
              </button>
            </span>
          </TooltipTrigger>
          <TooltipContent side="bottom" sideOffset={8}>Start AI Pre-Screening</TooltipContent>
        </Tooltip>
      );
    }

    if (activeStage === "screened") {
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="inline-flex">
              <button type="button" className={className} aria-label={`Shortlist ${candidate.name}`} onClick={() => handleMoveCandidateToStage(candidate, "shortlisted", "Shortlisted")}>
                <ArrowRight className="size-[14px]" />
              </button>
            </span>
          </TooltipTrigger>
          <TooltipContent side="bottom" sideOffset={8}>Shortlist</TooltipContent>
        </Tooltip>
      );
    }

    if (activeStage === "shortlisted") {
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="inline-flex">
              <button type="button" className={className} aria-label={`Send ${candidate.name} to client`} onClick={() => handleMoveCandidateToStage(candidate, "shared", "Sent to Client")}>
                <Share2 className="size-[14px]" />
              </button>
            </span>
          </TooltipTrigger>
          <TooltipContent side="bottom" sideOffset={8}>Send to Client</TooltipContent>
        </Tooltip>
      );
    }

    if (activeStage === "shared") {
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="inline-flex">
              <button type="button" className={className} aria-label={`Update client status for ${candidate.name}`} onClick={() => handleUpdateClientStatus(candidate)}>
                <Check className="size-[14px]" />
              </button>
            </span>
          </TooltipTrigger>
          <TooltipContent side="bottom" sideOffset={8}>Update Client Status</TooltipContent>
        </Tooltip>
      );
    }

    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-flex">
            <button type="button" className={className} aria-label={`Move ${candidate.name} to pre-screened`} onClick={() => handleMoveCandidateToStage(candidate, "screened", "Pre-Screened")}>
              <RotateCcw className="size-[14px]" />
            </button>
          </span>
        </TooltipTrigger>
        <TooltipContent side="bottom" sideOffset={8}>Move to Pre-Screened</TooltipContent>
      </Tooltip>
    );
  }

  function renderClientStatusChip(status) {
    const toneClassName =
      status === "Joined"
        ? "bg-[color-mix(in_srgb,var(--fx-success)_14%,var(--fx-surface)_86%)] text-[var(--fx-success)]"
        : status === "Rejected" || status === "Dropped Off"
          ? "bg-[color-mix(in_srgb,var(--fx-danger)_12%,var(--fx-surface)_88%)] text-[var(--fx-danger)]"
          : status === "On Hold"
            ? "bg-[color-mix(in_srgb,var(--fx-warning)_12%,var(--fx-surface)_88%)] text-[var(--fx-warning)]"
            : "bg-[var(--fx-surface-selected)] text-[var(--fx-primary)]";

    return <span className={cn("inline-flex min-w-[96px] items-center justify-center rounded-full px-[10px] py-[4px] text-[12px] leading-[18px] font-medium", toneClassName)}>{status}</span>;
  }

  const tableColumns = useMemo(() => {
    const sortLabel = (key, label) => (
      <button type="button" className={getSortHeaderButtonClassName(key)} onClick={() => handleSort(key)}>
        <span>{label}</span>
        <ArrowUpDown className="size-[14px]" />
      </button>
    );

    const columnsByKey = {
      name: { key: "name", label: sortLabel("name", "Candidate Name"), width: 220, minWidth: 200, maxWidth: 260, grow: 1, cellClassName: "text-[14px] leading-[22px] font-medium", required: true, locked: true, hideable: false },
      matchScore: { key: "matchScore", label: sortLabel("matchScore", "JD Match Score"), width: 160, minWidth: 148, maxWidth: 168, align: "center" },
      interested: { key: "interested", label: "Interested", width: 112, minWidth: 104, maxWidth: 124, align: "center" },
      availability: { key: "availability", label: sortLabel("availabilityDays", "Availability"), width: 132, minWidth: 120, maxWidth: 148, align: "center" },
      currentSalary: { key: "currentSalary", label: sortLabel("currentSalary", "Current Salary"), width: 144, minWidth: 130, maxWidth: 156, align: "right" },
      expectedSalary: { key: "expectedSalary", label: sortLabel("expectedSalary", "Expectation"), width: 136, minWidth: 124, maxWidth: 148, align: "right" },
      screeningOutcome: { key: "screeningOutcome", label: "Pre-Screen", width: 132, minWidth: 120, maxWidth: 148, align: "center" },
      currentStage: { key: "currentStage", label: "Current Stage", width: 140, minWidth: 128, maxWidth: 156, align: "center" },
      clientStatus: { key: "clientStatus", label: "Client Status", width: 156, minWidth: 144, maxWidth: 172, align: "center" },
      rejectionReason: { key: "rejectionReason", label: "Rejection Reason", width: 188, minWidth: 172, maxWidth: 220 },
      actions: { key: "actions", label: "Actions", width: 88, minWidth: 80, maxWidth: 96, align: "left", required: true, locked: true, hideable: false },
      menuActions: { key: "menuActions", label: null, width: 56, minWidth: 56, maxWidth: 56, align: "center", cellClassName: "px-0 pr-0", required: true, locked: true, hideable: false },
    };

    const commonKeys = ["name", "matchScore", "interested", "availability", "currentSalary", "expectedSalary", "screeningOutcome", "currentStage"];
    const keysByStage = {
      unscreened: [...commonKeys, "actions", "menuActions"],
      screened: [...commonKeys, "actions", "menuActions"],
      shortlisted: [...commonKeys, "actions", "menuActions"],
      shared: [...commonKeys, "clientStatus", "actions", "menuActions"],
      rejected: [...commonKeys, "rejectionReason", "actions", "menuActions"],
    };

    return (keysByStage[activeStage] ?? keysByStage.unscreened).map((key) => columnsByKey[key]);
  }, [activeStage, sortConfig]);

  const rows = sortedCandidates.map((candidate) => ({
    id: candidate.id,
    __fxRowSelectionMeta: {
      // Fresh/unviewed candidates get a subtle left-edge cue in the selection column.
      isNew:
        !candidate.jobContext?.viewedAt &&
        (candidate.createdAt || candidate.updatedAt) &&
        Date.now() - new Date(candidate.createdAt || candidate.updatedAt).getTime() <= 2 * 24 * 60 * 60 * 1000,
    },
    name: (
      <button
          type="button"
          className="block min-w-0 truncate text-left text-[14px] leading-[22px] font-medium text-[var(--fx-primary)] hover:text-[color-mix(in_srgb,var(--fx-primary)_82%,black_18%)]"
          onClick={() => handleOpenCandidateSheet(candidate)}
        >
          {candidate.name}
        </button>
    ),
    matchScore: (
      <button
        type="button"
        onClick={() => handleOpenCandidateSheet(candidate)}
        className="inline-flex min-w-[64px] items-center justify-center rounded-full bg-[var(--fx-surface-selected)] px-[10px] py-[4px] text-[14px] leading-[22px] font-medium text-[var(--fx-text)] transition-colors hover:bg-[color-mix(in_srgb,var(--fx-primary)_16%,var(--fx-surface-selected)_84%)]"
      >
        {candidate.matchScore != null ? `${candidate.matchScore}%` : "—"}
      </button>
    ),
    phone: <span className="truncate text-[14px] leading-[22px] text-[var(--fx-text)]">{candidate.phone || "—"}</span>,
    email: <span className="truncate text-[14px] leading-[22px] text-[var(--fx-text)]">{candidate.email || "—"}</span>,
    uploadedBy: <span className="truncate text-[14px] leading-[22px] text-[var(--fx-text)]">{candidate.uploadedBy || "—"}</span>,
    source: <span className="truncate text-[14px] leading-[22px] text-[var(--fx-text)]">{candidate.source || "—"}</span>,
    interested: (
      <span className="inline-flex min-w-[56px] items-center justify-center px-[4px] py-0 text-[14px] leading-[22px] font-normal text-[var(--fx-text)]">
        {candidate.interested ?? "—"}
      </span>
    ),
    availability: (
      <span className="inline-flex min-w-[64px] items-center justify-center px-[4px] py-0 text-[14px] leading-[22px] font-normal text-[var(--fx-text)]">
        {formatAvailability(candidate.availabilityDays)}
      </span>
    ),
    currentSalary: (
      <span className="tabular-nums text-[14px] leading-[22px] font-medium text-[var(--fx-text)]">
        {formatCurrency(candidate.currentSalary)}
      </span>
    ),
    expectedSalary: (
      <span className="tabular-nums text-[14px] leading-[22px] font-medium text-[var(--fx-text)]">
        {formatCurrency(candidate.expectedSalary)}
      </span>
    ),
    screeningOutcome: (
      <span className="inline-flex min-w-[88px] items-center justify-center rounded-full bg-[var(--fx-bg-soft)] px-[10px] py-[4px] text-[12px] leading-[18px] font-medium text-[var(--fx-text)]">
        {candidate.screeningOutcome || "Pending"}
      </span>
    ),
    currentStage: (
      <span className="inline-flex min-w-[96px] items-center justify-center rounded-full bg-[var(--fx-surface-selected)] px-[10px] py-[4px] text-[12px] leading-[18px] font-medium text-[var(--fx-primary)]">
        {PIPELINE_STAGES.find((stage) => stage.value === candidate.status)?.label ?? "Unscreened"}
      </span>
    ),
    clientStatus: renderClientStatusChip(candidate.clientStatus || "Feedback Awaited"),
    rejectionReason: <span className="truncate text-[14px] leading-[22px] text-[var(--fx-text)]">{candidate.rejectionReason || "Rejected for this role"}</span>,
    actions: (
      <div className="flex items-center justify-start gap-[8px]">
        {renderStageActionButton(candidate)}
      </div>
    ),
    menuActions: (
      <div className="flex flex-col items-center justify-center gap-[4px]">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="inline-flex size-[28px] items-center justify-center rounded-[6px] text-[var(--fx-text-muted)] transition-colors hover:bg-[var(--fx-surface-hover)] hover:text-[var(--fx-text)]"
              aria-label={`Open actions for ${candidate.name}`}
            >
              <MoreHorizontal className="size-[16px]" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[280px]">
            <DropdownMenuItem
              onSelect={(event) => {
                event.preventDefault();
                handleOpenCandidateSheet(candidate);
              }}
            >
              Open Candidate
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={(event) => {
                event.preventDefault();
                handleOpenCandidateSheet(candidate);
              }}
            >
              View Resume
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={(event) => {
                event.preventDefault();
                handleDownloadCandidateResume(candidate);
              }}
            >
              Download Resume
            </DropdownMenuItem>
            {activeStage === "shortlisted" ? (
              <DropdownMenuItem
                onSelect={(event) => {
                  event.preventDefault();
                  handleMoveCandidateToStage(candidate, "screened", "Pre-Screened");
                }}
              >
                Move back to Pre-Screened
              </DropdownMenuItem>
            ) : null}
            {activeStage === "shared" ? (
              <DropdownMenuItem
                onSelect={(event) => {
                  event.preventDefault();
                  handleMoveCandidateToStage(candidate, "shortlisted", "Shortlisted");
                }}
              >
                Move back to Shortlisted
              </DropdownMenuItem>
            ) : null}
            {activeStage === "rejected" ? (
              <>
                <DropdownMenuItem
                  onSelect={(event) => {
                    event.preventDefault();
                    handleMoveCandidateToStage(candidate, "screened", "Pre-Screened");
                  }}
                >
                  Move to Pre-Screened
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={(event) => {
                    event.preventDefault();
                    handleMoveCandidateToStage(candidate, "shortlisted", "Shortlisted");
                  }}
                >
                  Move to Shortlisted
                </DropdownMenuItem>
              </>
            ) : null}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={async (event) => {
                event.preventDefault();
                handleRemoveCandidateFromJob(candidate);
              }}
            >
              Remove from Job
            </DropdownMenuItem>
            {activeStage !== "rejected" ? (
              <DropdownMenuItem
                onSelect={(event) => {
                  event.preventDefault();
                  handleRejectCandidate(candidate);
                }}
              >
                Reject Candidate
              </DropdownMenuItem>
            ) : null}
          </DropdownMenuContent>
        </DropdownMenu>
        {activeStage !== "unscreened" ? renderScreeningFailureDot(candidate) : <span className="inline-flex size-[8px] shrink-0 rounded-full opacity-0" aria-hidden="true" />}
      </div>
    ),
  }));

  const jobIdLabel = job?.id ?? jobId;

  function renderWorkspaceStatusDot() {
    const isMissingEvaluationContext = job?.status === "Published" && !String(job?.evaluationContext ?? "").trim();
    const toneClassName = isMissingEvaluationContext ? "bg-[var(--fx-danger)]" : "bg-[var(--fx-success)]";
    const label = isMissingEvaluationContext ? "Published\nEvaluation context missing" : "Published";

    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            aria-label={label}
            className={`inline-flex size-[10px] shrink-0 rounded-full ring-2 ring-[var(--fx-surface)] ${toneClassName}`}
          />
        </TooltipTrigger>
        <TooltipContent side="top" sideOffset={6} className="whitespace-pre-line">
          {isMissingEvaluationContext ? (
            <div className="space-y-[2px]">
              <div>Published</div>
              <div className="text-[var(--fx-danger)]">Evaluation context missing</div>
            </div>
          ) : (
            label
          )}
        </TooltipContent>
      </Tooltip>
    );
  }

  function renderScreeningFailureDot(candidate) {
    if (candidate.screeningOutcome !== "Failed") {
      return <span className="inline-flex size-[8px] shrink-0 rounded-full opacity-0" aria-hidden="true" />;
    }

    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            aria-label="Failed"
            onClick={() => handleOpenCandidateSheet(candidate)}
            className="inline-flex size-[8px] shrink-0 rounded-full bg-[var(--fx-danger)]"
          />
        </TooltipTrigger>
        <TooltipContent side="top" sideOffset={6} className="whitespace-pre-line">
          <div className="space-y-[2px]">
            <div>Failed</div>
            <div className="text-[var(--fx-danger)]">Screening outcome did not pass</div>
          </div>
        </TooltipContent>
      </Tooltip>
    );
  }

  const renderBulkButton = (key, Icon, label, onClick, tone = "neutral") => {
    const buttonClassName = cn(
      "inline-flex size-[36px] items-center justify-center rounded-[8px] border-0 shadow-none transition-colors disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-100",
      tone === "accent"
        ? "bg-transparent text-[var(--fx-primary)] hover:bg-[var(--fx-surface-hover)] disabled:bg-transparent disabled:text-[var(--fx-text-disabled)] disabled:hover:bg-transparent"
        : tone === "danger"
          ? "bg-transparent text-[var(--fx-danger)] hover:bg-[var(--fx-surface-hover)] disabled:bg-transparent disabled:text-[var(--fx-text-disabled)] disabled:hover:bg-transparent"
          : "bg-transparent text-[var(--fx-text)] hover:bg-[var(--fx-surface-hover)] disabled:bg-transparent disabled:text-[var(--fx-text-disabled)] disabled:hover:bg-transparent",
    );

    return (
      <Tooltip key={key}>
        <TooltipTrigger asChild>
          <span className="inline-flex">
            <button type="button" disabled={selectedCount === 0} onClick={onClick} className={buttonClassName} aria-label={label}>
              {Icon ? <Icon className="size-[16px]" /> : null}
            </button>
          </span>
        </TooltipTrigger>
        <TooltipContent side="top" sideOffset={6}>
          {label}
        </TooltipContent>
      </Tooltip>
    );
  };

  const bulkToolbarButtons = (() => {
    if (bulkStage === "unscreened") {
      return [
        renderBulkButton("ai-pre-screen", Sparkles, "Start AI Pre-Screening", bulkActionHandlers.startAiPreScreening, "accent"),
        renderBulkButton("remove-from-job", Trash2, "Remove from Job", bulkActionHandlers.removeFromJob),
        renderBulkButton("mark-not-interested", UserX, "Mark Not Interested", bulkActionHandlers.markNotInterested),
        renderBulkButton("reject", Ban, "Reject", bulkActionHandlers.reject, "danger"),
        renderBulkButton("download-resumes", Download, "Download Resume", handleBulkDownloadResumes, "accent"),
      ];
    }

    if (bulkStage === "screened") {
      return [
        renderBulkButton("shortlisted", ArrowRight, "Move to Shortlisted", bulkActionHandlers.moveToShortlisted, "accent"),
        renderBulkButton("sent-to-client", Share2, "Move to Sent to Client", bulkActionHandlers.moveToSentToClient),
        renderBulkButton("mark-not-interested", UserX, "Mark Not Interested", bulkActionHandlers.markNotInterested),
        renderBulkButton("reject", Ban, "Reject", bulkActionHandlers.reject, "danger"),
        renderBulkButton("download-resumes", Download, "Download Resume", handleBulkDownloadResumes, "accent"),
      ];
    }

    if (bulkStage === "shortlisted") {
      return [
        renderBulkButton("sent-to-client", Share2, "Send to Client", bulkActionHandlers.moveToSentToClient, "accent"),
        renderBulkButton("back-to-screened", RotateCcw, "Move back to Pre-Screened", bulkActionHandlers.moveBackToScreened),
        renderBulkButton("reject", Ban, "Reject", bulkActionHandlers.reject, "danger"),
        renderBulkButton("download-resumes", Download, "Download Resume", handleBulkDownloadResumes, "accent"),
      ];
    }

    if (bulkStage === "shared") {
      return [
        renderBulkButton("client-status", Check, "Update Client Status", bulkActionHandlers.updateClientStatus, "accent"),
        renderBulkButton("back-to-shortlisted", ArrowLeft, "Move back to Shortlisted", bulkActionHandlers.moveBackToShortlisted),
        renderBulkButton("reject", Ban, "Reject", bulkActionHandlers.reject, "danger"),
        renderBulkButton("download-resumes", Download, "Download Resume", handleBulkDownloadResumes, "accent"),
      ];
    }

    if (bulkStage === "rejected") {
      return [
        renderBulkButton("move-to-screened", RotateCcw, "Move to Pre-Screened", bulkActionHandlers.restoreToScreened, "accent"),
        renderBulkButton("move-to-shortlisted", ArrowRight, "Move to Shortlisted", bulkActionHandlers.restoreToShortlisted),
        renderBulkButton("remove-from-job", Trash2, "Remove from Job", bulkActionHandlers.removeFromJob, "danger"),
        renderBulkButton("download-resumes", Download, "Download Resume", handleBulkDownloadResumes, "accent"),
      ];
    }

    return [];
  })();

  if (job?.status === "Draft") {
    return null;
  }

  return (
    <TooltipProvider delayDuration={0}>
      <FxProtectedAppPage
        pageId="jobWorkspace"
        title={false}
        navbarLeading={
          <Link href={ROUTES.JOBS} className={`inline-flex items-center gap-[8px] ${FX_TYPOGRAPHY.button} text-foreground hover:text-[var(--fx-text)]`}>
            <ArrowLeft className="size-[16px]" />
            All Jobs
          </Link>
        }
      >
        <section className="flex h-full min-h-0 w-full min-w-0 flex-1 flex-col gap-[24px]">
        {job ? (
          <>
            <div className={`rounded-[16px] border ${FX_COLORS.border} bg-[var(--fx-surface)] p-[24px]`}>
              <div className="flex flex-col gap-[20px] lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0 space-y-[12px]">
                  <div className="space-y-[6px]">
                    <div className="flex flex-wrap items-center gap-[10px]">
                      {renderWorkspaceStatusDot()}
                      <h1 className={`${FX_TYPOGRAPHY.h3} text-[var(--fx-text)]`}>{job.title}</h1>
                    </div>
                    {showClientInfo && job.client ? (
                      <p className={`${FX_TYPOGRAPHY.body} text-[var(--fx-text-muted)]`}>{job.client}</p>
                    ) : null}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-[8px]">
                  <FxAiButton onClick={() => setRecommendedOpen(true)}>Recommend Candidates</FxAiButton>
                  <FxButton variant="outline" size="sm" onClick={() => setCallPreviewOpen(true)}>
                    <PhoneCall className="size-[16px]" />
                    Call Preview
                  </FxButton>
                  <FxButton variant="secondary" size="sm" onClick={handleShareJob}>
                    <Share2 className="size-[16px]" />
                    Share Job
                  </FxButton>
                  <FxButton
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const returnTo = encodeURIComponent(`${ROUTES.JOB(jobId)}?tab=${activeStage}`);
                      router.push(`${ROUTES.JOBS}?edit=${job.id}&returnTo=${returnTo}`);
                    }}
                  >
                    <PencilLine className="size-[16px]" />
                    Edit Job
                  </FxButton>
                </div>
              </div>

              <div className="mt-[20px] flex flex-wrap gap-x-[48px] gap-y-[12px]">
                {showClientInfo && job.client ? <MetaField label="Client" value={job.client} /> : null}
                <MetaField label="Domain / Department" value={`${job.domain} / ${job.department}`} />
                <MetaField label="Experience" value={job.experience || "—"} />
                <MetaField label="Employment Type" value={job.employmentType || "Full-time"} />
                <MetaField label="Salary Range" value={job.salaryRange || "—"} />
                <MetaField label="Positions" value={String(job.positions || 1)} />
                <MetaField label="Location" value={job.location || "—"} />
                <MetaField label="Publish Date" value={job.publishDate ? formatDate(job.publishDate) : "Draft"} />
                <MetaField label="Question Format" value={job.questionFormat || "CV + AI pre-screening"} />
              </div>
            </div>

            <div className="flex min-h-0 flex-1 flex-col gap-[16px]">
              <div className="flex flex-col gap-[12px]">
                <div className="min-w-0">
                  <FxTabs
                    tabs={PIPELINE_STAGES.map((stage) => ({
                      value: stage.value,
                      label: `${stage.label} (${candidateCounts[stage.value] || 0})`,
                    }))}
                    active={activeStage}
                    onChange={handleStageChange}
                    className="w-full justify-start"
                    showUnderline
                    showBorder={false}
                  />
                </div>

                <div className="flex flex-wrap items-center justify-end gap-[12px]">
                  <div className="flex flex-wrap items-center justify-end gap-[8px]">{bulkToolbarButtons}</div>
                  <div className="w-full min-w-0 sm:w-[240px] sm:flex-none">
                    <div className={`flex h-[40px] items-center rounded-[6px] border border-[color:color-mix(in_srgb,var(--fx-text)_18%,var(--fx-border)_82%)] bg-[var(--fx-bg)] px-[16px]`}>
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
                  <FxButton type="button" onClick={handleAddCandidates} className="shrink-0">
                    Add Candidates
                  </FxButton>
                </div>
              </div>

              <div className="min-h-0 flex-1 overflow-hidden">
                {filteredCandidates.length ? (
                  <div className="flex h-full min-h-0 flex-col gap-[12px]">
                    {/* <div className={`flex min-h-[64px] flex-wrap items-center justify-between gap-[12px] rounded-[8px] border ${FX_COLORS.border} bg-[var(--fx-surface)] px-[16px] py-[12px]`}>
                      <div className="text-[14px] leading-[22px] font-medium text-[var(--fx-text-muted)]">
                        {selectedCountLabel}
                      </div>
                      <div className="flex flex-wrap items-center gap-[8px]">
                        {bulkToolbarButtons}
                      </div>
                    </div> */}

                    <FxTable
                      columns={tableColumns}
                      rows={rows}
                      sortedColumnKey={tableSortedColumnKey}
                      sortedColumnDirection={tableSortedColumnDirection}
                      stickyHeader
                      stickyFirstColumn
                      stickyLastColumn
                      scrollX
                      emptyMessage="No candidates in this stage yet."
                      enableColumnPicker
                      storageKey={`${STORAGE_KEYS.JOB_WORKSPACE_COLUMNS}:${activeStage}`}
                      enableRowSelection
                      selectedRowKeys={selectedCandidateIds}
                      onSelectedRowKeysChange={setSelectedCandidateIds}
                    />
                  </div>
                ) : (
                  <WorkspaceEmptyState
                    title={getStageCopy(activeStage, searchTerm).title}
                    body={getStageCopy(activeStage, searchTerm).body}
                    action={searchTerm.trim() ? null : (
                      <FxButton type="button" onClick={handleAddCandidates}>
                        Add Candidates
                      </FxButton>
                    )}
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
      <AddCandidatesDrawer
        open={addCandidatesOpen}
        onOpenChange={setAddCandidatesOpen}
        job={job}
        candidatePool={recommendedCandidates}
        onPickExistingCandidate={handleAttachExistingCandidate}
        onUploadFiles={handleUploadCandidateFiles}
        onAddSingleCandidate={handleAddSingleCandidate}
      />
        <CandidateWorkspaceSheet
          open={candidateSheetOpen}
          onOpenChange={setCandidateSheetOpen}
          candidate={selectedCandidate}
          job={job}
          onMoveToNextStage={handleMoveCandidateToNextStage}
          onMarkNotInterested={handleMarkCandidateNotInterested}
          onReject={handleRejectCandidate}
          onRemoveFromJob={handleRemoveCandidateFromJob}
          onSetScreeningMode={handleSetCandidateScreeningMode}
        />
        <CallPreviewDrawer open={callPreviewOpen} onOpenChange={setCallPreviewOpen} job={job} />
      </FxProtectedAppPage>
    </TooltipProvider>
  );
}
