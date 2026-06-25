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
  CalendarDays,
  Check,
  Circle,
  CheckCheck,
  Eye,
  Copy,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Minus,
  MoreHorizontal,
  Mail,
  PencilLine,
  MessageSquareMore,
  PhoneCall,
  PanelLeftClose,
  PanelLeftOpen,
  Play,
  Plus,
  Send,
  RotateCcw,
  Share2,
  Download,
  Sparkles,
  Trash2,
  UserRoundX,
  Upload,
  Users,
  ArrowUpRight,
  ScanSearch,
  X,
} from "lucide-react";

import { FxAiButton } from "@/components/FxAiButton";
import { FxButton } from "@/components/FxButton";
import { FxCandidateCard } from "@/src/components/fx/FxCandidateCard";
import { FxInput } from "@/components/FxInput";
import { FxProtectedAppPage } from "@/components/FxProtectedAppPage";
import { FxRichTextEditor } from "@/components/FxRichTextEditor";
import { FxTable } from "@/components/FxTable";
import { FxTabs } from "@/components/FxTabs";
import { showSuccess } from "@/components/FxToast";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Sheet, SheetBody, SheetContent, SheetFooter, SheetHeader } from "@/components/ui/sheet";
import { ROUTES, STORAGE_KEYS, WORKSPACE_TYPES } from "@/lib/FxConstants";
import { PAGE_COPY } from "@/lib/FxCopy";
import {
  DEFAULT_JOB_QUESTION_SUGGESTIONS,
  formatCurrencyInputValue,
  formatCurrencyValue as formatCurrencyDisplay,
  normalizeJobRecord,
  parseCurrencyInputValue,
} from "@/lib/FxJobSchema";
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
  { value: "shared", label: "Interviewing" },
  { value: "offered", label: "Offered" },
  { value: "joined", label: "Joined" },
  { value: "dropped", label: "Dropped" },
  { value: "rejected", label: "Rejected" },
];

const PIPELINE_STAGE_SEQUENCE = PIPELINE_STAGES.filter((stage) => stage.value !== "all").map((stage) => stage.value);
const PIPELINE_STAGE_COUNT_KEYS = {
  unscreened: "unscreenedCount",
  screened: "preScreenedCount",
  shortlisted: "shortlistedCount",
  shared: "sentToClientCount",
};
const CLIENT_PROGRESS_STAGE_STATUS = {
  shared: "Interviewing",
  offered: "Offered",
  joined: "Joined",
  dropped: "Candidate Dropped Off",
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
    title: "No interviewing candidates yet",
    body: "Candidates moved to interviewing will appear here.",
  },
  offered: {
    title: "No offered candidates yet",
    body: "Candidates marked as offered will appear here.",
  },
  joined: {
    title: "No joined candidates yet",
    body: "Candidates marked as joined will appear here.",
  },
  dropped: {
    title: "No dropped candidates yet",
    body: "Candidates who dropped after client sharing will appear here.",
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
  "Candidate Dropped Off",
];

const PRE_SCREENED_FILTERS = [
  { key: "all", label: "All" },
  { key: "ai_call", label: "AI Call Screened" },
  { key: "manual", label: "Manual Screen" },
  { key: "email", label: "Email Screened" },
  { key: "no_fit_score", label: "No Fit Score" },
];
const SHARED_FILTERS = [
  { key: "all", label: "All" },
  { key: "Feedback Awaited", label: "Feedback Awaited" },
  { key: "Shortlisted", label: "Shortlisted" },
  { key: "Interviewing", label: "Interviewing" },
  { key: "Offered", label: "Offered" },
  { key: "Joined", label: "Joined" },
  { key: "Rejected", label: "Rejected" },
  { key: "On Hold", label: "On Hold" },
  { key: "Candidate Dropped Off", label: "Candidate Dropped Off" },
];
/* - - - - - - - - - - - - - - - - */

const JOB_WORKSPACE_TABLE_HEADERS = {
  base: {
    name: "Name",
    matchScore: "CV Match Score",
    experience: "Experience",
    phone: "Phone",
    email: "Email",
    availability: "Availability",
    currentSalary: "Current CTC",
    expectedSalary: "Expected CTC",
    strengthsGaps: "Relevance",
    clientStatus: "Status",
    updatedAt: "Last Updated",
    rejectionReason: "Rejection Reason",
    actions: "Actions",
  },
  unscreened: {
    matchScore: "Match Score",
  },
  screened: {
    matchScore: "Fit Score",
  },
  shortlisted: {
    matchScore: "Fit Score",
  },
  shared: {
    matchScore: "Fit Score",
  },
  rejected: {
    matchScore: "Fit Score",
  },
};
/* - - - - - - - - - - - - - - - - */

const CV_MATCH_BREAKDOWN_SECTIONS = [
  { key: "jdMatch", label: "JD Match" },
  { key: "companyTierDomain", label: "Company Tier & Domain" },
  { key: "education", label: "Education" },
  { key: "communicationLanguage", label: "Communication & Language" },
  { key: "culturalSoftSkills", label: "Cultural & Soft Skills" },
  { key: "bonusAttributes", label: "Bonus Attributes" },
];

function getClientOutcomeStage(status) {
  if (status === "Rejected" || status === "Candidate Dropped Off") {
    return "rejected";
  }

  return "shared";
}

function normalizeUnscreenedFilterStatus(candidate, jobContext) {
  const explicitStatus = String(candidate.unscreenedFilterStatus ?? jobContext?.unscreenedFilterStatus ?? "").trim().toLowerCase();

  if (explicitStatus) {
    return explicitStatus;
  }

  if (String(candidate.screeningOutcome ?? "").trim().toLowerCase() === "failed") {
    return "failed";
  }

  return "pending";
}

function normalizeJob(job) {
  return normalizeJobRecord(job);
}
/* - - - - - - - - - - - - - - - - */

function isClientProgressStage(stage) {
  return ["shared", "offered", "joined", "dropped"].includes(stage);
}
/* - - - - - - - - - - - - - - - - */

function matchesPipelineStage(candidate, stage) {
  if (!candidate) {
    return false;
  }

  if (stage === "shared" || stage === "offered" || stage === "joined") {
    return candidate.status === "shared" && (candidate.clientStatus || "Feedback Awaited") === CLIENT_PROGRESS_STAGE_STATUS[stage];
  }

  if (stage === "dropped") {
    return candidate.status === "rejected" && (candidate.clientStatus || "") === CLIENT_PROGRESS_STAGE_STATUS.dropped;
  }

  if (stage === "rejected") {
    return candidate.status === "rejected" && (candidate.clientStatus || "") !== CLIENT_PROGRESS_STAGE_STATUS.dropped;
  }

  return candidate.status === stage;
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
  const toFiniteNumber = (value) => {
    if (value == null || value === "") {
      return null;
    }

    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  };

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
    jobCurrency: candidate.jobCurrency ?? job?.currency ?? "INR",
    client: candidate.client ?? job?.client ?? job?.company ?? "",
    status: candidate.status ?? "unscreened",
    trustScore,
    screeningOutcome: candidate.screeningOutcome ?? candidate.screeningStatus ?? candidate.callStatus ?? "",
    matchScore: toFiniteNumber(candidate.matchScore),
    availabilityDays: toFiniteNumber(candidate.availabilityDays),
    currentSalary: toFiniteNumber(candidate.currentSalary),
    expectedSalary: toFiniteNumber(candidate.expectedSalary),
    experience: toFiniteNumber(candidate.experience),
    email: candidate.email ?? "—",
    phone: candidate.phone ?? "—",
    uploadedBy: candidate.uploadedBy ?? "Manual entry",
    source: candidate.source ?? candidate.uploadedBy ?? "Direct",
    clientStatus: candidate.clientStatus ?? jobContext?.clientStatus ?? "Feedback Awaited",
    rejectionReason: candidate.rejectionReason ?? jobContext?.rejectionReason ?? "Rejected for this role",
    unscreenedFilterStatus: normalizeUnscreenedFilterStatus(candidate, jobContext),
    noticePeriodSortValue: toFiniteNumber(candidate.noticePeriodSortValue ?? jobContext?.noticePeriod ?? candidate.availabilityDays),
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
/* - - - - - - - - - - - - - - - - */

function formatCompactDate(value) {
  if (!value) {
    return "—";
  }

  const timestamp = new Date(value).getTime();

  if (Number.isNaN(timestamp)) {
    return "—";
  }

  return new Date(timestamp).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "2-digit",
    timeZone: "UTC",
  });
}
/* - - - - - - - - - - - - - - - - */

function formatTime(value) {
  if (!value) {
    return "—";
  }

  const timestamp = new Date(value).getTime();
  if (Number.isNaN(timestamp)) {
    return "—";
  }

  return new Date(timestamp).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatCurrency(value, currency = "INR") {
  const formattedValue = formatCurrencyDisplay(value, currency);
  return formattedValue || "—";
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

function ResumePanelShell({ children, className = "" }) {
  return (
    <div className={cn(`flex min-h-0 flex-1 flex-col overflow-hidden rounded-[12px] border ${FX_COLORS.border} bg-[var(--fx-surface)]`, className)}>
      <div className={`shrink-0 border-b ${FX_COLORS.border} bg-[var(--fx-bg-soft)] px-[16px] py-[12px]`}>
        <p className={FX_TYPOGRAPHY.button}>Resume</p>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto bg-[var(--fx-surface)] p-[16px]">
        {children}
      </div>
    </div>
  );
}
/* - - - - - - - - - - - - - - - - */

function formatNoticePeriod(candidate) {
  const rawNoticePeriod = candidate?.jobContext?.noticePeriod || candidate?.noticePeriod || "";
  const availabilityDate = candidate?.jobContext?.availabilityDate || "";

  if (rawNoticePeriod) {
    return rawNoticePeriod;
  }

  if (availabilityDate) {
    return formatDate(availabilityDate);
  }

  if (candidate?.availabilityDays != null) {
    return formatAvailability(candidate.availabilityDays);
  }

  return "—";
}
/* - - - - - - - - - - - - - - - - */

function formatContactValue(value) {
  const normalizedValue = String(value ?? "").trim();

  if (!normalizedValue || normalizedValue === "—") {
    return "N/A";
  }

  return normalizedValue;
}
/* - - - - - - - - - - - - - - - - */

function buildEmailScreeningTemplate(candidate, job) {
  return `Hi ${candidate?.name || "{{CandidateName}"}},\n\nThank you for your interest in ${job?.title || "{{JobTitle}}"}. Please reply to this email with your updated details so we can continue evaluating your profile.\n\nRegards,\n${job?.company || "{{Company}}"}`;
}
/* - - - - - - - - - - - - - - - - */

function buildShareForReviewEmailTemplate(candidates, job, options = {}) {
  const candidateList = Array.isArray(candidates) ? candidates.filter(Boolean) : [candidates].filter(Boolean);
  const candidateNames = candidateList.map((candidate) => candidate.name).filter(Boolean);
  const {
    shareMode = "cv_only",
    includePhone = false,
    includeEmail = false,
    includeCompensation = false,
    includeScreening = true,
  } = options;
  const roleLabel = job?.title || "the role";
  const companyLabel = job?.company || "the team";
  const candidateLabel =
    candidateNames.length <= 2
      ? candidateNames.join(" and ")
      : `${candidateNames.slice(0, 2).join(", ")}, and ${candidateNames.length - 2} more candidates`;
  const detailSummary = shareMode === "custom"
    ? [
        includePhone ? "phone number" : null,
        includeEmail ? "email address" : null,
        includeCompensation ? "CTC details" : null,
        includeScreening ? "screening summary" : null,
      ].filter(Boolean)
    : [];

  return [
    `Hi,`,
    "",
    `Sharing ${candidateLabel || "the shortlisted candidates"} for your review against ${roleLabel} at ${companyLabel}.`,
    shareMode === "custom" && detailSummary.length
      ? `Included details: ${detailSummary.join(", ")}.`
      : "Included details: CVs only.",
    "",
    "Please review and share your feedback on whom we should move forward with.",
    "",
    "Regards,",
    "Recruiting Team",
  ].join("\n");
}
/* - - - - - - - - - - - - - - - - */

function buildResumePreview(candidate, job, options = {}) {
  const {
    includeContact = true,
    includeFooter = true,
  } = options;
  const roleLabel = candidate?.currentRole || candidate?.jobTitle || "Current Role";
  const companyLabel = candidate?.currentCompany ? ` at ${candidate.currentCompany}` : "";
  const locationLabel = candidate?.location || candidate?.city || job?.location || "Remote / Flexible";
  const experienceLabel = candidate?.experience != null ? `${candidate.experience}+ years` : "Relevant experience";
  const skills = candidate?.skills?.length
    ? candidate.skills.slice(0, 4).join(" · ")
    : [job?.title, candidate?.currentRole || candidate?.jobTitle, candidate?.currentCompany]
        .filter(Boolean)
        .slice(0, 4)
        .join(" · ") || "Recruiting · Coordination · Screening";
  const educationLabel = candidate?.education || "Bachelor's degree or equivalent";

  return [
    `${candidate?.name || "Candidate"}`,
    `${roleLabel}${companyLabel}`,
    locationLabel,
    includeContact && (candidate?.email || candidate?.phone)
      ? `${candidate?.email || "—"}${candidate?.phone && candidate.phone !== "—" ? ` · ${candidate.phone}` : ""}`
      : null,
    "",
    "Professional Summary",
    `${candidate?.name || "This candidate"} brings ${experienceLabel.toLowerCase()} and a background aligned to ${job?.title || "the role"}.`,
    "",
    "Experience",
    `Current role: ${roleLabel}${companyLabel}`,
    `Focus areas: ${candidate?.jobTitle || job?.title || "target role"} delivery, stakeholder coordination, and execution.`,
    "",
    "Skills",
    skills,
    "",
    "Education",
    educationLabel,
    includeFooter ? "" : null,
    includeFooter ? "Preview rendered from seeded candidate data." : null,
  ].filter((line) => line !== null).join("\n");
}
/* - - - - - - - - - - - - - - - - */

function getMatchScoreToneClass(score) {
  if (score == null || Number.isNaN(Number(score))) {
    return "text-[var(--fx-text-muted)]";
  }

  if (Number(score) >= 80) {
    return "text-[var(--fx-success)]";
  }

  if (Number(score) >= 60) {
    return "text-[var(--fx-warning)]";
  }

  return "text-[var(--fx-danger)]";
}
/* - - - - - - - - - - - - - - - - */

function getMatchScoreFillClass(score) {
  if (score == null || Number.isNaN(Number(score))) {
    return "bg-[var(--fx-surface-hover)]";
  }

  if (Number(score) >= 80) {
    return "bg-[color:color-mix(in_srgb,var(--fx-success)_16%,white_84%)]";
  }

  if (Number(score) >= 60) {
    return "bg-[color:color-mix(in_srgb,var(--fx-warning)_18%,white_82%)]";
  }

  return "bg-[color:color-mix(in_srgb,var(--fx-danger)_14%,white_86%)]";
}
/* - - - - - - - - - - - - - - - - */

function getPreScreeningType(candidate) {
  const mode = String(candidate?.jobContext?.screeningModeOverride ?? "").trim().toLowerCase();
  const hasEmailScreening = Boolean(candidate?.jobContext?.emailScreeningStartedAt || candidate?.jobContext?.emailScreeningMessage);

  if (mode === "manual") {
    return {
      key: "manual",
      detailLabel: "Manual Screen",
      icon: Users,
    };
  }

  if (hasEmailScreening) {
    return {
      key: "email",
      detailLabel: "AI Screening",
      icon: Sparkles,
    };
  }

  if (mode === "ai") {
    return {
      key: "ai_call",
      detailLabel: "AI Screening",
      icon: Sparkles,
    };
  }

  return {
    key: "manual",
    detailLabel: "Manual Screen",
    icon: Users,
  };
}
/* - - - - - - - - - - - - - - - - */

function getPreScreeningSourceLabel(candidate) {
  return getPreScreeningType(candidate).detailLabel;
}
/* - - - - - - - - - - - - - - - - */

function getPreScreeningDetailLabel(candidate) {
  return getPreScreeningType(candidate).detailLabel;
}
/* - - - - - - - - - - - - - - - - */

function getPreScreeningFilterKey(candidate) {
  return getPreScreeningType(candidate).key;
}
/* - - - - - - - - - - - - - - - - */

function generateMockPreScreenInsights(candidate, job) {
  const score = Number(candidate?.matchScore) || 0;
  const roleKeyword = job?.title || candidate?.jobTitle || "the role";
  const currentRole = candidate?.currentRole || "current role";
  const currentCompany = candidate?.currentCompany || "recent company";
  const workplaceType = job?.workplaceType || "On-site";
  const location = job?.location || "the job location";

  const strengths = [];
  const gaps = [];

  if (score >= 70) {
    strengths.push(`Strong alignment with ${roleKeyword}`);
  } else if (score >= 55) {
    strengths.push(`Relevant overlap with ${roleKeyword}`);
  } else {
    gaps.push(`Role fit for ${roleKeyword} needs deeper validation`);
  }

  if (candidate?.experience != null) {
    strengths.push(`${candidate.experience} years of relevant experience`);
  } else {
    gaps.push("Experience depth still needs validation");
  }

  if (candidate?.interested === "Yes") {
    strengths.push("Interested in exploring the role");
  } else if (candidate?.interested === "No") {
    gaps.push("Interest level is low");
  }

  if (candidate?.jobContext?.commuteComfortable === "No") {
    gaps.push(`${workplaceType} commute to ${location} may be a blocker`);
  } else if (candidate?.jobContext?.commuteComfortable === "Yes" && workplaceType !== "Remote") {
    strengths.push(`Comfortable with ${workplaceType.toLowerCase()} setup`);
  }

  if ((candidate?.jobContext?.manualScreeningNotes || "").trim()) {
    strengths.push("Recruiter conversation notes captured");
  }

  if (!strengths.length) {
    strengths.push(`Experience in ${currentRole} at ${currentCompany}`);
  }

  if (!gaps.length) {
    gaps.push("No major gaps flagged during pre-screening");
  }

  return {
    strengths: strengths.slice(0, 3),
    gaps: gaps.slice(0, 3),
    source: getPreScreeningSourceLabel(candidate),
  };
}
/* - - - - - - - - - - - - - - - - */

function getStrengthGapSummary(candidate, job) {
  const insights = generateMockPreScreenInsights(candidate, job);
  const strengthText = insights.strengths.slice(0, 2).map((item) => item.replace(/^Strong alignment with /, "").replace(/^Relevant overlap with /, "")).join(", ");
  const gapText = insights.gaps[0] ? insights.gaps[0].replace(/^No major gaps flagged during pre-screening$/, "No major gaps") : "—";

  return {
    strengths: strengthText || "—",
    gaps: gapText || "—",
  };
}
/* - - - - - - - - - - - - - - - - */

function getPreScreenResultSummary(candidate) {
  const source = getPreScreeningDetailLabel(candidate);
  const outcome = String(candidate?.screeningOutcome ?? "").trim();

  if (!outcome || outcome.toLowerCase() === "passed") {
    return source;
  }

  return `${source} · ${outcome}`;
}
/* - - - - - - - - - - - - - - - - */

function getPreScreeningIcon(candidate) {
  return getPreScreeningType(candidate).icon;
}
/* - - - - - - - - - - - - - - - - */

function getPreScreeningTableLabel(candidate, stage) {
  const type = getPreScreeningType(candidate);

  if (stage === "screened") {
    if (type.key === "manual") {
      return "Manual Call";
    }

    if (type.key === "ai_call") {
      return "AI Call";
    }

    return "Email Screened";
  }

  if (type.key === "ai_call") {
    return "AI Call";
  }

  return "Manual Screen";
}
/* - - - - - - - - - - - - - - - - */

function getDialablePhoneHref(value) {
  const formattedValue = formatContactValue(value);
  const normalizedValue = formattedValue.replace(/[^\d+]/g, "");

  if (!normalizedValue || normalizedValue === "+") {
    return null;
  }

  return `tel:${normalizedValue}`;
}

function getStoredPipelineCounts(candidateRows) {
  return candidateRows.reduce(
    (counts, candidate) => {
      if (candidate.status === "shared") {
        const clientStatus = candidate.clientStatus || "Feedback Awaited";

        if (clientStatus === CLIENT_PROGRESS_STAGE_STATUS.shared) {
          counts.shared += 1;
        }

        if (clientStatus === CLIENT_PROGRESS_STAGE_STATUS.offered) {
          counts.offered += 1;
        }

        if (clientStatus === CLIENT_PROGRESS_STAGE_STATUS.joined) {
          counts.joined += 1;
        }
      } else if (candidate.status === "rejected" && (candidate.clientStatus || "") === CLIENT_PROGRESS_STAGE_STATUS.dropped) {
        counts.dropped += 1;
      } else {
        counts[candidate.status] = (counts[candidate.status] || 0) + 1;
      }

      return counts;
    },
    { unscreened: 0, screened: 0, shortlisted: 0, shared: 0, offered: 0, joined: 0, dropped: 0, rejected: 0 },
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
    <div className="flex h-full min-h-[320px] items-center justify-center bg-[var(--fx-surface)] px-[24px] py-[24px]">
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
/* - - - - - - - - - - - - - - - - */

function getJobScreeningQuestions(job) {
  const source = Array.isArray(job?.questions) && job.questions.length
    ? job.questions
    : DEFAULT_JOB_QUESTION_SUGGESTIONS;

  return source.map((question, index) => ({
    id: question.id ?? `screening-question-${index + 1}`,
    label: question.label ?? `Question ${index + 1}`,
    question: question.question ?? question.title ?? question.label ?? `Question ${index + 1}`,
  }));
}
/* - - - - - - - - - - - - - - - - */

function generateMockCvMatchBreakdown(candidate) {
  const baseScore = Math.max(52, Math.min(96, Number(candidate?.matchScore) || 72));
  const nameSeed = String(candidate?.id || candidate?.name || "candidate")
    .split("")
    .reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const offsets = [4, -3, 2, -2, 1, 3];
  const maxScores = [30, 15, 10, 15, 15, 15];

  const sections = CV_MATCH_BREAKDOWN_SECTIONS.map((section, index) => {
    const maxScore = maxScores[index];
    const ratio = Math.max(0.45, Math.min(0.98, (baseScore + offsets[index] + ((nameSeed + index * 7) % 5) - 2) / 100));
    const score = Math.max(1, Math.min(maxScore, Math.round(maxScore * ratio)));

    return {
      key: section.key,
      label: section.label,
      score,
      maxScore,
      summary:
        section.key === "jdMatch"
          ? "This candidate meets some of the role requirements, but key skills or experience areas may need further validation during screening."
          : section.key === "companyTierDomain"
            ? "Measures alignment between the candidate's industry, domain experience, and the hiring context."
            : section.key === "education"
              ? "Evaluates academic background and relevance to the role requirements."
              : section.key === "communicationLanguage"
                ? "Assesses written and verbal communication indicators available from the profile and resume."
                : section.key === "culturalSoftSkills"
                  ? "Estimates alignment with collaboration, ownership, adaptability, and workplace expectations."
                  : "Additional strengths that may provide an advantage beyond the core role requirements.",
    };
  });

  return {
    overallScore: baseScore,
    sections,
  };
}
/* - - - - - - - - - - - - - - - - */

function CvMatchBreakdownSheet({ open, onOpenChange, candidate }) {
  const breakdown = candidate?.cvMatchBreakdown;
  const formatBreakdownPercentage = (value, maxValue) => {
    if (!maxValue) {
      return "—";
    }

    const percentValue = (Number(value) / Number(maxValue)) * 100;
    if (!Number.isFinite(percentValue)) {
      return "—";
    }

    const roundedPercent = Number(percentValue.toFixed(2));
    return `${Number.isInteger(roundedPercent) ? roundedPercent : roundedPercent.toFixed(2)}%`;
  };
  const getBreakdownToneClassName = (value, maxValue) => {
    if (!maxValue) {
      return "bg-[var(--fx-primary)]";
    }

    const percentValue = (Number(value) / Number(maxValue)) * 100;
    if (!Number.isFinite(percentValue)) {
      return "bg-[var(--fx-primary)]";
    }

    if (percentValue >= 80) {
      return "bg-[color:color-mix(in_srgb,var(--fx-success)_68%,white_32%)]";
    }

    if (percentValue >= 60) {
      return "bg-[color:color-mix(in_srgb,var(--fx-primary)_68%,white_32%)]";
    }

    if (percentValue >= 40) {
      return "bg-[color:color-mix(in_srgb,var(--fx-warning)_70%,white_30%)]";
    }

    return "bg-[color:color-mix(in_srgb,var(--fx-danger)_62%,white_38%)]";
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent size="sm">
        <SheetHeader
          title={(
            <div className="space-y-[2px]">
              <p className="text-[15px] leading-[22px] font-semibold text-[var(--fx-text)]">
                {candidate?.name || "Candidate"}
              </p>
              <p className="text-[13px] leading-[18px] font-medium text-[var(--fx-text)]">
                {candidate?.jobTitle || "Job"}
              </p>
            </div>
          )}
        />
        <SheetBody>
          {candidate && breakdown ? (
            <div className="space-y-[12px]">
              <div className="rounded-[8px] px-[12px] py-[12px]">
                <div className="flex items-center justify-between gap-[16px]">
                  <p className="text-[15px] leading-[22px] font-semibold text-[var(--fx-text)]">Overall CV Match Score</p>
                  <span className="text-[15px] leading-[22px] font-semibold text-[var(--fx-text)]">
                    {breakdown.overallScore}%
                  </span>
                </div>
              </div>

              <div className="space-y-[8px]">
                {breakdown.sections.map((section) => {
                  const progressWidth = `${Math.max(6, Math.min(100, (section.score / section.maxScore) * 100))}%`;
                  const progressToneClassName = getBreakdownToneClassName(section.score, section.maxScore);

                  return (
                    <div key={section.key} className={`rounded-[8px] border ${FX_COLORS.border} bg-[var(--fx-surface)] p-[12px]`}>
                      <div className="flex items-center justify-between gap-[12px]">
                        <p className="text-[14px] leading-[20px] font-medium text-[var(--fx-text)]">{section.label}</p>
                        <span className="text-[14px] leading-[20px] font-semibold text-[var(--fx-text)]">
                          {formatBreakdownPercentage(section.score, section.maxScore)}
                        </span>
                      </div>
                      <div className="mt-[8px] h-[8px] overflow-hidden rounded-full bg-[var(--fx-bg-soft)]">
                        <div className={cn("h-full rounded-full", progressToneClassName)} style={{ width: progressWidth }} />
                      </div>
                      <p className="mt-[8px] text-[13px] leading-[18px] text-[var(--fx-text-muted)]">
                        {section.summary}
                      </p>
                    </div>
                  );
                })}
              </div>

              <p className="text-[13px] leading-[18px] text-[var(--fx-text-muted)]">
                Scores are intended to support recruiter decisions and should be considered alongside screening outcomes and candidate interactions.
              </p>
            </div>
          ) : null}
        </SheetBody>
      </SheetContent>
    </Sheet>
  );
}
/* - - - - - - - - - - - - - - - - */

function ScheduleInterviewSheet({ open, onOpenChange, candidate, job, onSubmit }) {
  const [showResumePane, setShowResumePane] = useState(true);
  const [includedInviteExpanded, setIncludedInviteExpanded] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [activePopoverDateKey, setActivePopoverDateKey] = useState(null);
  const [draftFromTime, setDraftFromTime] = useState("14:00");
  const [draftToTime, setDraftToTime] = useState("15:00");
  const [draftNotes, setDraftNotes] = useState("");
  const [appliedSlot, setAppliedSlot] = useState(null);
  const [monthOffset, setMonthOffset] = useState(0);
  const salaryCurrency = job?.currency || candidate?.jobCurrency || "INR";
  const resumePreview = useMemo(() => (candidate ? buildResumePreview(candidate, job, { includeFooter: false }) : ""), [candidate, job]);
  const screeningQuestions = useMemo(() => getJobScreeningQuestions(job), [job]);
  const screeningAnswers = Array.isArray(candidate?.screeningAnswers) ? candidate.screeningAnswers : [];
  const answerMap = useMemo(() => new Map(screeningAnswers.map((item) => [item.id, item.answer || "Not answered"])), [screeningAnswers]);
  const screeningResponseCount = Math.max(
    screeningAnswers.filter((item) => String(item?.answer ?? "").trim()).length,
    screeningQuestions.length,
  );
  const timeOptions = [
    "09:00",
    "09:30",
    "10:00",
    "10:30",
    "11:00",
    "11:30",
    "12:00",
    "12:30",
    "13:00",
    "13:30",
    "14:00",
    "14:30",
    "15:00",
    "15:30",
    "16:00",
    "16:30",
    "17:00",
    "17:30",
  ];
  const timeToMinutes = useCallback((time24) => {
    const [hours, minutes] = String(time24 ?? "").split(":").map((value) => Number.parseInt(value, 10));
    return ((hours || 0) * 60) + (minutes || 0);
  }, []);
  const isDraftTimeRangeValid = timeToMinutes(draftToTime) > timeToMinutes(draftFromTime);
  const draftSlot = useMemo(() => {
    if (!selectedDate || !isDraftTimeRangeValid) {
      return null;
    }

    return {
      date: selectedDate,
      fromTime: draftFromTime,
      toTime: draftToTime,
      notes: draftNotes,
      timezone: "Asia/Kolkata",
    };
  }, [draftFromTime, draftNotes, draftToTime, isDraftTimeRangeValid, selectedDate]);
  const resolvedSlot = activePopoverDateKey ? draftSlot : appliedSlot;
  const canSchedule = Boolean(candidate && resolvedSlot);

  useEffect(() => {
    if (!open) {
      return;
    }

    setShowResumePane(true);
    setIncludedInviteExpanded(false);
    setSelectedDate(null);
    setActivePopoverDateKey(null);
    setDraftFromTime("14:00");
    setDraftToTime("15:00");
    setDraftNotes("");
    setAppliedSlot(null);
    setMonthOffset(0);
  }, [candidate?.id, open]);

  const formatDateLabel = (date) => {
    if (!date) {
      return "—";
    }

    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatDisplayTime = (time24, timezone = "Asia/Kolkata") => {
    if (!time24) {
      return "—";
    }

    const [hours, minutes] = String(time24).split(":").map((value) => Number.parseInt(value, 10));
    const date = new Date();
    date.setHours(hours || 0, minutes || 0, 0, 0);
    return date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone: timezone,
    });
  };

  const today = useMemo(() => {
    const value = new Date();
    value.setHours(0, 0, 0, 0);
    return value;
  }, []);

  const monthStart = useMemo(() => {
    const base = new Date(today.getFullYear(), today.getMonth() + monthOffset, 1);
    base.setHours(0, 0, 0, 0);
    return base;
  }, [monthOffset, today]);

  const monthLabel = useMemo(
    () => monthStart.toLocaleDateString("en-GB", { month: "long", year: "numeric" }),
    [monthStart],
  );

  const monthDays = useMemo(() => {
    const start = new Date(monthStart);
    const startDay = start.getDay();
    const gridStart = new Date(start);
    gridStart.setDate(start.getDate() - startDay);
    gridStart.setHours(0, 0, 0, 0);

    return Array.from({ length: 42 }, (_, index) => {
      const nextDate = new Date(gridStart);
      nextDate.setDate(gridStart.getDate() + index);
      nextDate.setHours(0, 0, 0, 0);
      return nextDate;
    });
  }, [monthStart]);

  const weekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const getSlotDateKey = useCallback((date) => {
    if (!(date instanceof Date)) {
      return "";
    }

    return date.toISOString().slice(0, 10);
  }, []);

  const previewCalendarEvents = useMemo(() => {
    const baseEvents = [
      { date: new Date(monthStart.getFullYear(), monthStart.getMonth(), 5), title: "Hiring Manager", fromTime: "11:00", toTime: "11:30" },
      { date: new Date(monthStart.getFullYear(), monthStart.getMonth(), 12), title: "Panel Round", fromTime: "15:00", toTime: "16:00" },
      { date: new Date(monthStart.getFullYear(), monthStart.getMonth(), 12), title: "Culture Round", fromTime: "17:00", toTime: "17:30" },
      { date: new Date(monthStart.getFullYear(), monthStart.getMonth(), 18), title: "Founder Sync", fromTime: "10:00", toTime: "10:30" },
      { date: new Date(monthStart.getFullYear(), monthStart.getMonth(), 18), title: "Tech Debrief", fromTime: "12:00", toTime: "12:45" },
      { date: new Date(monthStart.getFullYear(), monthStart.getMonth(), 18), title: "Client Review", fromTime: "16:00", toTime: "16:30" },
      { date: new Date(monthStart.getFullYear(), monthStart.getMonth(), 18), title: "Wrap Up", fromTime: "18:00", toTime: "18:15" },
    ]
      .filter((item) => item.date.getMonth() === monthStart.getMonth())
      .map((item, index) => ({
        ...item,
        key: `preview-${index}`,
      }));

    if (!appliedSlot?.date) {
      return baseEvents;
    }

    return [
      ...baseEvents,
      {
        key: "applied-slot",
        date: appliedSlot.date,
        title: job?.title || candidate?.jobTitle || "Interview",
        fromTime: appliedSlot.fromTime,
        toTime: appliedSlot.toTime,
      },
    ];
  }, [appliedSlot, candidate?.jobTitle, job?.title, monthStart]);

  const eventsByDateKey = useMemo(() => {
    const nextMap = new Map();

    previewCalendarEvents.forEach((item) => {
      const key = getSlotDateKey(item.date);
      const current = nextMap.get(key) ?? [];
      current.push(item);
      nextMap.set(key, current);
    });

    return nextMap;
  }, [getSlotDateKey, previewCalendarEvents]);

  const handleApplySchedule = useCallback(() => {
    if (!selectedDate) {
      return;
    }

    setAppliedSlot({
      date: selectedDate,
      fromTime: draftFromTime,
      toTime: draftToTime,
      notes: draftNotes,
      timezone: "Asia/Kolkata",
    });
    setActivePopoverDateKey(null);
  }, [draftFromTime, draftNotes, draftToTime, selectedDate]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent size="xl" widthPx={showResumePane ? 1180 : 780}>
        <SheetHeader
          title="Schedule Interview"
          actions={(
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={() => setShowResumePane((current) => !current)}
                  className="flex h-[32px] w-[32px] items-center justify-center rounded-[6px] text-[var(--fx-text-muted)] hover:bg-[var(--fx-surface-hover)] hover:text-[var(--fx-text)]"
                  aria-label={showResumePane ? "Collapse" : "Expand"}
                >
                  {showResumePane ? <PanelLeftClose className="size-[16px]" /> : <PanelLeftOpen className="size-[16px]" />}
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" sideOffset={8}>{showResumePane ? "Collapse" : "Expand"}</TooltipContent>
            </Tooltip>
          )}
        />
        <SheetBody className="bg-[var(--fx-surface)] px-[24px] py-[32px]">
          {candidate ? (
            <div className={cn("grid h-full min-h-0", showResumePane ? "grid-cols-[minmax(0,1.15fr)_24px_minmax(0,1fr)]" : "grid-cols-1")}>
              {showResumePane ? (
                <>
                  <div className="grid min-h-0 gap-[12px] xl:grid-rows-[auto_minmax(0,1fr)_auto]">
                    <FxCandidateCard
                      candidate={candidate}
                      variant="default"
                      layout="vertical"
                      currency={salaryCurrency}
                    />
                    <ResumePanelShell className="rounded-[8px]">
                      <pre className="h-full overflow-auto whitespace-pre-wrap break-words text-[14px] leading-[22px] text-[var(--fx-text)]">
                        {resumePreview}
                      </pre>
                    </ResumePanelShell>
                    <div className={`rounded-[8px] border ${FX_COLORS.border} bg-[var(--fx-surface)]`}>
                      <button
                        type="button"
                        onClick={() => setIncludedInviteExpanded((current) => !current)}
                        className="flex w-full items-center justify-between gap-[12px] px-[14px] py-[10px] text-left"
                      >
                        <p className="min-w-0 truncate text-[14px] leading-[20px] text-[var(--fx-text)]">
                          Resume &amp; {screeningResponseCount} Screening Responses Included with Invite
                        </p>
                        {includedInviteExpanded ? (
                          <ChevronUp className="size-[16px] shrink-0 text-[var(--fx-primary)]" />
                        ) : (
                          <ChevronDown className="size-[16px] shrink-0 text-[var(--fx-primary)]" />
                        )}
                      </button>
                      {includedInviteExpanded ? (
                        <div className={`border-t ${FX_COLORS.border} px-[14px] py-[12px]`}>
                          <div className={`rounded-[8px] border ${FX_COLORS.border} bg-[var(--fx-bg-soft)] px-[12px] py-[10px]`}>
                            <p className="text-[14px] leading-[20px] font-medium text-[var(--fx-text)]">💬 Screening Responses ({screeningResponseCount})</p>
                            <div className="mt-[8px] max-h-[220px] space-y-[8px] overflow-y-auto pr-[4px]">
                              {screeningQuestions.map((item, index) => (
                                <div key={item.id} className="space-y-[2px]">
                                  <p className="text-[13px] leading-[18px] font-medium text-[var(--fx-text)]">Q{index + 1}. {item.question}</p>
                                  <p className="text-[13px] leading-[18px] text-[var(--fx-text-muted)]">
                                    Ans. {answerMap.get(item.id) || answerMap.get(item.label?.toLowerCase?.()) || "Not answered"}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </div>
                  <div className="relative flex items-stretch justify-center pt-[32px]">
                    <div className={`absolute inset-y-0 left-1/2 w-px -translate-x-1/2 ${FX_COLORS.border}`} />
                  </div>
                </>
              ) : null}

              <div className="flex min-h-0 flex-col gap-[16px]">
                  <div className={`flex min-h-0 flex-1 flex-col rounded-[8px] border ${FX_COLORS.border} bg-[var(--fx-surface)] p-[16px]`}>
                    <div className="shrink-0">
                      <div className="space-y-[10px]">
                        <div>
                          <p className={FX_TYPOGRAPHY.cardTitle}>Select Interview Date</p>
                          <p className="mt-[2px] text-[13px] leading-[20px] text-[var(--fx-text-muted)]">Pick a day and set the interview time.</p>
                        </div>
                        <div className="flex items-center justify-between gap-[12px]">
                          <div className="inline-flex items-center gap-[8px] rounded-[8px] border border-[color:color-mix(in_srgb,var(--fx-border)_72%,transparent)] bg-[var(--fx-bg-soft)] px-[8px] py-[6px]">
                            <button
                              type="button"
                              className="inline-flex h-[28px] w-[28px] items-center justify-center rounded-[6px] text-[var(--fx-text-muted)] transition-colors hover:bg-[var(--fx-surface)] hover:text-[var(--fx-text)]"
                              onClick={() => setMonthOffset((current) => current - 1)}
                              aria-label="Previous month"
                            >
                              <ArrowLeft className="size-[16px]" />
                            </button>
                            <span className="min-w-[140px] text-center text-[13px] leading-[20px] font-medium text-[var(--fx-text)]">{monthLabel}</span>
                            <button
                              type="button"
                              className="inline-flex h-[28px] w-[28px] items-center justify-center rounded-[6px] text-[var(--fx-text-muted)] transition-colors hover:bg-[var(--fx-surface)] hover:text-[var(--fx-text)]"
                              onClick={() => setMonthOffset((current) => current + 1)}
                              aria-label="Next month"
                            >
                              <ArrowRight className="size-[16px]" />
                            </button>
                          </div>
                          <div className="inline-flex items-center gap-[8px] text-[12px] leading-[18px] text-[var(--fx-text-muted)]">
                            <CalendarDays className="size-[14px]" />
                            Dots show scheduled interviews
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-[14px] flex min-h-0 flex-1 flex-col">
                      <div className="grid grid-cols-7 gap-[8px] pb-[8px]">
                        {weekdayLabels.map((label) => (
                          <div key={label} className="px-[6px] py-[4px] text-center text-[11px] leading-[16px] font-medium uppercase tracking-[0.04em] text-[var(--fx-text-muted)]">
                            {label}
                          </div>
                        ))}
                      </div>
                      <div className="grid grid-cols-7 gap-[8px] content-start">
                        {monthDays.map((day) => {
                          const dayKey = getSlotDateKey(day);
                          const isSelected = Boolean(selectedDate && day.toDateString() === selectedDate.toDateString());
                          const isCurrentMonth = day.getMonth() === monthStart.getMonth();
                          const dayEvents = eventsByDateKey.get(dayKey) ?? [];
                          const visibleDots = dayEvents.slice(0, 3);
                          const hiddenCount = Math.max(0, dayEvents.length - visibleDots.length);

                          return (
                            <Popover
                              key={dayKey}
                              modal
                              open={activePopoverDateKey === dayKey}
                              onOpenChange={(nextOpen) => {
                                setActivePopoverDateKey(nextOpen ? dayKey : null);
                                if (!nextOpen && selectedDate && day.toDateString() === selectedDate.toDateString()) {
                                  setSelectedDate(null);
                                }
                              }}
                            >
                              <PopoverTrigger asChild>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedDate(day);
                                    const primaryEvent = dayEvents[dayEvents.length - 1] ?? null;
                                    if (primaryEvent?.key === "applied-slot" && appliedSlot) {
                                      setDraftFromTime(appliedSlot.fromTime);
                                      setDraftToTime(appliedSlot.toTime);
                                      setDraftNotes(appliedSlot.notes || "");
                                    } else {
                                      setDraftFromTime("14:00");
                                      setDraftToTime("15:00");
                                      setDraftNotes("");
                                    }
                                    setActivePopoverDateKey(dayKey);
                                  }}
                                  className={cn(
                                    "flex min-h-[92px] w-full flex-col justify-between rounded-[10px] border p-[8px] text-left transition-colors",
                                    isSelected
                                      ? "border-[color:color-mix(in_srgb,var(--fx-primary)_42%,var(--fx-border)_58%)] bg-[color:color-mix(in_srgb,var(--fx-primary)_10%,var(--fx-surface)_90%)]"
                                      : `border ${FX_COLORS.border} bg-[var(--fx-bg-soft)] hover:bg-[var(--fx-surface-hover)]`,
                                    isCurrentMonth ? "text-[var(--fx-text)]" : "text-[var(--fx-text-disabled)]",
                                  )}
                                >
                                  <div className="space-y-[2px]">
                                    <p className={cn("text-[18px] leading-[22px] font-semibold", isCurrentMonth ? "text-[var(--fx-text)]" : "text-[var(--fx-text-disabled)]")}>
                                      {day.getDate()}
                                    </p>
                                  </div>
                                  <div className="min-h-[24px] space-y-[4px]">
                                    <div className="flex flex-wrap items-end gap-[4px]">
                                      {visibleDots.map((item) => (
                                        <span
                                          key={item.key}
                                          className="inline-flex h-[6px] w-[6px] rounded-full bg-[var(--fx-primary)]"
                                        />
                                      ))}
                                      {hiddenCount ? (
                                        <span className="text-[10px] leading-[14px] font-medium text-[var(--fx-text-muted)]">+{hiddenCount} more</span>
                                      ) : null}
                                    </div>
                                  </div>
                                </button>
                              </PopoverTrigger>
                              <PopoverContent
                                align="start"
                                className="w-[280px] p-[16px]"
                                onOpenAutoFocus={(event) => event.preventDefault()}
                                onCloseAutoFocus={(event) => event.preventDefault()}
                                onInteractOutside={(event) => event.preventDefault()}
                                onEscapeKeyDown={(event) => {
                                  event.preventDefault();
                                  event.stopPropagation();
                                  setActivePopoverDateKey(null);
                                  setSelectedDate(null);
                                }}
                              >
                                <div className="space-y-[14px]">
                                  <div className="space-y-[6px]">
                                    <p className="text-[14px] leading-[20px] font-medium text-[var(--fx-text)]">Schedule Interview</p>
                                    {dayEvents.length ? (
                                      <div className={`rounded-[8px] border ${FX_COLORS.border} bg-[var(--fx-bg-soft)] p-[10px]`}>
                                        <div className="space-y-[6px]">
                                          {dayEvents.map((item) => (
                                            <div key={item.key} className="flex items-center justify-between gap-[12px]">
                                              <p className="truncate text-[12px] leading-[18px] font-medium text-[var(--fx-text)]">{item.title}</p>
                                              <p className="shrink-0 text-[12px] leading-[18px] text-[var(--fx-text-muted)]">
                                                {formatDisplayTime(item.fromTime)} - {formatDisplayTime(item.toTime)}
                                              </p>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    ) : null}
                                  </div>

                                  <div className="space-y-[6px]">
                                    <p className="text-[13px] leading-[18px] font-medium text-[var(--fx-text-muted)]">Date</p>
                                    <div className={`rounded-[8px] border ${FX_COLORS.border} bg-[var(--fx-bg-soft)] px-[12px] py-[10px] text-[14px] leading-[20px] text-[var(--fx-text)]`}>
                                      {formatDateLabel(day)}
                                    </div>
                                  </div>

                                  <div className="space-y-[6px]">
                                    <p className="text-[13px] leading-[18px] font-medium text-[var(--fx-text-muted)]">From</p>
                                    <select
                                      value={draftFromTime}
                                      onChange={(event) => {
                                        const nextFrom = event.target.value;
                                        setDraftFromTime(nextFrom);
                                        if (timeToMinutes(draftToTime) <= timeToMinutes(nextFrom)) {
                                          const nextIndex = Math.min(timeOptions.indexOf(nextFrom) + 2, timeOptions.length - 1);
                                          setDraftToTime(timeOptions[nextIndex]);
                                        }
                                      }}
                                      className={`h-[40px] w-full rounded-[8px] border ${FX_COLORS.border} bg-[var(--fx-surface)] px-[12px] text-[14px] leading-[20px] text-[var(--fx-text)] outline-none`}
                                    >
                                      {timeOptions.map((time) => (
                                        <option key={time} value={time}>{formatDisplayTime(time)}</option>
                                      ))}
                                    </select>
                                  </div>

                                  <div className="space-y-[6px]">
                                    <p className="text-[13px] leading-[18px] font-medium text-[var(--fx-text-muted)]">To</p>
                                    <select
                                      value={draftToTime}
                                      onChange={(event) => setDraftToTime(event.target.value)}
                                      className={`h-[40px] w-full rounded-[8px] border ${FX_COLORS.border} bg-[var(--fx-surface)] px-[12px] text-[14px] leading-[20px] text-[var(--fx-text)] outline-none`}
                                    >
                                      {timeOptions.map((time) => (
                                        <option key={time} value={time}>{formatDisplayTime(time)}</option>
                                      ))}
                                    </select>
                                  </div>

                                  <div className="space-y-[6px]">
                                    <p className="text-[13px] leading-[18px] font-medium text-[var(--fx-text-muted)]">Notes</p>
                                    <textarea
                                      value={draftNotes}
                                      onChange={(event) => setDraftNotes(event.target.value)}
                                      placeholder="Optional"
                                      className={`min-h-[96px] w-full resize-none rounded-[8px] border ${FX_COLORS.border} bg-[var(--fx-surface)] px-[12px] py-[10px] text-[14px] leading-[20px] text-[var(--fx-text)] outline-none placeholder:text-[var(--fx-text-disabled)]`}
                                    />
                                  </div>

                                  <div className="flex items-center justify-end gap-[8px]">
                                    <FxButton
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {
                                        setActivePopoverDateKey(null);
                                        setSelectedDate(null);
                                      }}
                                    >
                                      Cancel
                                    </FxButton>
                                    <FxButton size="sm" disabled={!isDraftTimeRangeValid} onClick={handleApplySchedule}>
                                      Save &amp; Send
                                    </FxButton>
                                  </div>
                                </div>
                              </PopoverContent>
                            </Popover>
                          );
                        })}
                      </div>
                    </div>
                  </div>
              </div>
            </div>
          ) : null}
        </SheetBody>
        <SheetFooter
          left={(
            <FxButton variant="outline" size="sm" onClick={() => onOpenChange(false)}>
              Cancel
            </FxButton>
          )}
          right={(
            <FxButton
              size="sm"
              disabled={!canSchedule}
              onClick={() => {
                if (!candidate || !resolvedSlot) {
                  return;
                }

                onSubmit?.(candidate, resolvedSlot);
              }}
            >
              Schedule Interview
            </FxButton>
          )}
        />
      </SheetContent>
    </Sheet>
  );
}
/* - - - - - - - - - - - - - - - - */

function EmailScreeningSheet({
  open,
  onOpenChange,
  candidates,
  selectedCandidateId,
  onSelectCandidate,
  onRemoveCandidate,
  onOpenCandidatePool,
  job,
  onStart,
}) {
  const [showResumePane, setShowResumePane] = useState(true);
  const [candidatePendingRemoval, setCandidatePendingRemoval] = useState(null);
  const [emailDrafts, setEmailDrafts] = useState({});
  const [subjectDrafts, setSubjectDrafts] = useState({});
  const [messageDrafts, setMessageDrafts] = useState({});
  const candidateList = useMemo(() => candidates ?? [], [candidates]);
  const activeCandidate = useMemo(
    () => candidateList.find((candidate) => candidate.id === selectedCandidateId) ?? candidateList[0] ?? null,
    [candidateList, selectedCandidateId],
  );
  const activeEmailValue = activeCandidate ? (emailDrafts[activeCandidate.id] ?? "") : "";
  const activeSubjectValue = activeCandidate ? (subjectDrafts[activeCandidate.id] ?? "") : "";
  const activeMessageValue = activeCandidate ? (messageDrafts[activeCandidate.id] ?? "") : "";
  const activeCandidateIndex = useMemo(
    () => candidateList.findIndex((candidate) => candidate.id === activeCandidate?.id),
    [activeCandidate?.id, candidateList],
  );
  const hasCandidateEmail = Boolean(activeCandidate?.email && activeCandidate.email !== "—");
  const isBulkMode = candidateList.length > 1;
  const hasPreviousCandidate = isBulkMode && activeCandidateIndex > 0;
  const hasNextCandidate = isBulkMode && activeCandidateIndex >= 0 && activeCandidateIndex < candidateList.length - 1;
  const resumePreview = useMemo(() => {
    return activeCandidate ? buildResumePreview(activeCandidate, job, { includeFooter: false }) : "";
  }, [activeCandidate, job?.title]);

  useEffect(() => {
    const nextEmailDrafts = {};
    const nextSubjectDrafts = {};
    const nextMessageDrafts = {};

    candidateList.forEach((candidate) => {
      nextEmailDrafts[candidate.id] = candidate?.email && candidate.email !== "—" ? candidate.email : "";
      nextSubjectDrafts[candidate.id] = `Pre-Screening Questions for ${job?.title || "the role"}`;
      nextMessageDrafts[candidate.id] = candidate?.jobContext?.emailScreeningMessage || buildEmailScreeningTemplate(candidate, job);
    });

    setEmailDrafts(nextEmailDrafts);
    setSubjectDrafts(nextSubjectDrafts);
    setMessageDrafts(nextMessageDrafts);
    setShowResumePane(true);
  }, [candidateList, job]);

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent size="xl" widthPx={showResumePane ? 1160 : 780}>
          <SheetHeader
            title={<span className="text-[var(--fx-text-muted)]">Email Pre-Screening</span>}
          actions={(
            <>
              {isBulkMode ? (
                <>
                    <button
                      type="button"
                      onClick={() => {
                        if (!hasPreviousCandidate) {
                          return;
                        }

                        onSelectCandidate?.(candidateList[activeCandidateIndex - 1]?.id);
                      }}
                      disabled={!hasPreviousCandidate}
                      className="flex h-[32px] items-center justify-center rounded-[6px] px-[8px] text-[13px] font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
                    >
                      Previous
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (!hasNextCandidate) {
                          return;
                        }

                        onSelectCandidate?.(candidateList[activeCandidateIndex + 1]?.id);
                      }}
                      disabled={!hasNextCandidate}
                      className="flex h-[32px] items-center justify-center rounded-[6px] px-[8px] text-[13px] font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
                    >
                      Next
                    </button>
                  </>
                ) : null}
                {activeCandidate && onOpenCandidatePool ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        aria-label="Open in Candidate Pool"
                        className="inline-flex h-[32px] w-[32px] items-center justify-center rounded-[6px] text-[var(--fx-text-muted)] transition-colors hover:bg-[var(--fx-surface-hover)] hover:text-[var(--fx-primary)]"
                        onClick={() => onOpenCandidatePool(activeCandidate)}
                      >
                        <ArrowUpRight className="size-[16px]" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" sideOffset={6}>
                      Open in Candidate Pool
                    </TooltipContent>
                  </Tooltip>
                ) : null}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={() => setShowResumePane((current) => !current)}
                      className="flex h-[32px] w-[32px] cursor-pointer items-center justify-center rounded-[6px] text-muted-foreground hover:bg-accent hover:text-foreground"
                      aria-label={showResumePane ? "Collapse" : "Expand"}
                    >
                      {showResumePane ? <PanelLeftClose className="size-[16px]" /> : <PanelLeftOpen className="size-[16px]" />}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" sideOffset={8}>{showResumePane ? "Collapse" : "Expand"}</TooltipContent>
                </Tooltip>
              </>
            )}
          />
          <SheetBody className="bg-[var(--fx-surface)] px-[24px] py-[32px]">
          {activeCandidate ? (
            <div className={cn("grid h-full min-h-0", showResumePane ? "grid-cols-[minmax(0,1.3fr)_24px_minmax(0,1fr)]" : "grid-cols-1")}>
                {showResumePane ? (
                  <>
                    <div className={cn("grid min-h-0 gap-[16px]", isBulkMode ? "grid-cols-[196px_minmax(0,1fr)]" : "grid-cols-1")}>
                    {isBulkMode ? (
                      <div className="min-h-0 overflow-auto rounded-[8px] bg-[var(--fx-bg-soft)] p-[6px]">
                        <div className="space-y-[8px]">
                          {candidateList.map((candidate) => (
                            <div
                              key={candidate.id}
                              className={cn(
                                "flex w-full items-start justify-between gap-[8px] rounded-[8px] px-[10px] py-[8px] text-left transition-colors",
                                candidate.id === activeCandidate.id
                                  ? "bg-[var(--fx-surface)] text-[var(--fx-text)] shadow-sm"
                                  : "bg-transparent text-[var(--fx-text)] hover:bg-[var(--fx-surface-hover)]",
                              )}
                            >
                              <button type="button" onClick={() => onSelectCandidate?.(candidate.id)} className="flex min-w-0 flex-1 flex-col items-start text-left">
                                <span className="w-full truncate text-[13px] leading-[18px] font-medium text-[var(--fx-text)]">{candidate.name}</span>
                                <span className={cn("text-[12px] leading-[16px] font-medium", getMatchScoreToneClass(candidate.matchScore))}>
                                  {candidate.matchScore != null ? `${candidate.matchScore}%` : "—"}
                                </span>
                              </button>
                              <button
                                type="button"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  setCandidatePendingRemoval(candidate);
                                }}
                                className="inline-flex size-[20px] shrink-0 items-center justify-center rounded-[4px] text-[var(--fx-text-muted)] transition-colors hover:bg-[var(--fx-surface-hover)] hover:text-[var(--fx-danger)]"
                                aria-label={`Remove ${candidate.name}`}
                              >
                                <X className="size-[14px]" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}
                    <ResumePanelShell className="rounded-[8px]">
                      <pre className="h-full overflow-auto whitespace-pre-wrap break-words text-[14px] leading-[22px] text-[var(--fx-text)]">
                        {resumePreview}
                      </pre>
                    </ResumePanelShell>
                  </div>
                  <div className="relative flex items-stretch justify-center pt-[32px]">
                    <div className={`absolute inset-y-0 left-1/2 w-px -translate-x-1/2 ${FX_COLORS.border}`} />
                  </div>
                </>
              ) : (
                <div />
              )}

              <div className="flex min-h-0 flex-col">
                {!showResumePane ? (
                  <div className="mb-[16px] flex items-center justify-between gap-[16px]">
                    <p className="truncate text-[15px] leading-[24px] font-medium text-[var(--fx-text)]">{activeCandidate.name}</p>
                    <p className={cn("shrink-0 text-[16px] leading-[24px] font-medium", getMatchScoreToneClass(activeCandidate.matchScore))}>
                      {activeCandidate.matchScore != null ? `CV Match ${activeCandidate.matchScore}%` : "CV Match unavailable"}
                    </p>
                  </div>
                ) : null}

                <div className={cn("flex min-h-0 w-full flex-1", showResumePane ? "justify-center" : "justify-start")}>
                  <div className={cn("flex min-h-0 w-full flex-1 flex-col", showResumePane ? "max-w-[560px]" : "")}>
                <div className="space-y-[14px]">
                  <FxInput
                    label="To"
                    value={activeEmailValue}
                    onChange={(event) => {
                      const value = event.target.value;
                      setEmailDrafts((current) => ({ ...current, [activeCandidate.id]: value }));
                    }}
                    placeholder="candidate@company.com"
                    helperText={hasCandidateEmail ? null : "Email is missing. Add it before sending."}
                  />
                  <FxInput
                    label="Subject"
                    value={activeSubjectValue}
                    onChange={(event) => {
                      const value = event.target.value;
                      setSubjectDrafts((current) => ({ ...current, [activeCandidate.id]: value }));
                    }}
                    placeholder="Pre-screening questions"
                  />
                </div>

                <div className="mt-[14px] min-h-0 flex-1 overflow-auto">
                  <div className="mb-[8px] flex items-center justify-end">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <FxAiButton
                          type="button"
                          size="sm"
                          onClick={() => {
                            setMessageDrafts((current) => ({
                              ...current,
                              [activeCandidate.id]: buildEmailScreeningTemplate(activeCandidate, job),
                            }));
                          }}
                        >
                          Generate Using AI
                        </FxAiButton>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" sideOffset={6}>
                        Resets your edited content.
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <FxRichTextEditor
                    value={activeMessageValue}
                    onChange={(value) => {
                      setMessageDrafts((current) => ({ ...current, [activeCandidate.id]: value }));
                    }}
                    placeholder="Write email template"
                    className="min-h-0 flex-1"
                    minHeight={showResumePane ? 620 : 720}
                  />
                </div>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
          </SheetBody>
          <SheetFooter
          left={(
            <FxButton variant="outline" size="sm" onClick={() => onOpenChange(false)}>
              Cancel
            </FxButton>
          )}
          right={(
            <FxButton
              size="sm"
              onClick={() => {
                if (!candidateList.length) {
                  return;
                }

                onStart?.(
                  candidateList,
                  candidateList.reduce((accumulator, candidate) => {
                    accumulator[candidate.id] = {
                      email: emailDrafts[candidate.id] ?? "",
                      subject: subjectDrafts[candidate.id] ?? `Pre-Screening Questions for ${job?.title || "the role"}`,
                      message: messageDrafts[candidate.id] ?? buildEmailScreeningTemplate(candidate, job),
                    };
                    return accumulator;
                  }, {}),
                );
              }}
            >
              Send
            </FxButton>
          )}
        />
        </SheetContent>
      </Sheet>
      <AlertDialog open={Boolean(candidatePendingRemoval)} onOpenChange={(open) => !open && setCandidatePendingRemoval(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove candidate?</AlertDialogTitle>
            <AlertDialogDescription>
              {candidatePendingRemoval ? `Remove ${candidatePendingRemoval.name} from this email screening batch?` : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (candidatePendingRemoval) {
                  onRemoveCandidate?.(candidatePendingRemoval.id);
                }
                setCandidatePendingRemoval(null);
              }}
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
/* - - - - - - - - - - - - - - - - */

function ManualScreeningSheet({
  open,
  onOpenChange,
  candidate,
  job,
  onSubmit,
  onReject,
  onOpenCandidatePool,
  onPrevious,
  onNext,
  hasPrevious = false,
  hasNext = false,
}) {
  const [activeStep, setActiveStep] = useState("interview");
  const [showResumePane, setShowResumePane] = useState(true);
  const salaryCurrency = job?.currency || "INR";
  const [formState, setFormState] = useState({
    interested: "Yes",
    availabilityMode: "date",
    availabilityDays: "",
    availabilityDate: "",
    commuteComfortable: "Yes",
    fitScore: "",
    currentSalary: "",
    expectedSalary: "",
    notes: "",
  });
  const standardScreeningQuestions = useMemo(() => getJobScreeningQuestions(job), [job]);
  const shouldShowCommuteQuestion = job?.workplaceType === "On-site" || job?.workplaceType === "Hybrid";
  const commuteQuestion = useMemo(() => {
    if (job?.workplaceType === "Hybrid") {
      return `The job role is hybrid and based out of ${job?.location || "the listed location"}. Is the candidate comfortable commuting when required?`;
    }

    return `The job role is on-site based out of ${job?.location || "the listed location"}. Is the candidate comfortable commuting?`;
  }, [job?.location, job?.workplaceType]);
  const interviewQuestions = useMemo(
    () => [
      {
        question: `Walk me through your experience most relevant to ${job?.title || "this role"}.`,
        guidance: "Listen for depth of ownership, tools used, and how closely the work matches the target role.",
      },
      {
        question: "What kind of projects have you handled end-to-end in your current or recent role?",
        guidance: "Look for practical scope, collaboration signals, and delivery responsibility.",
      },
      {
        question: "What would make you interested in exploring this opportunity further?",
        guidance: "Use this to gauge role fit, motivation, and whether the opportunity is aligned to candidate intent.",
      },
    ],
    [job?.title],
  );
  const resumePreview = useMemo(() => {
    return candidate ? buildResumePreview(candidate, job, { includeFooter: false }) : "";
  }, [candidate, job?.title]);

  useEffect(() => {
    setActiveStep("interview");
    setShowResumePane(true);
      setFormState({
      interested: candidate?.interested || "Yes",
      availabilityMode: candidate?.jobContext?.availabilityMode || (candidate?.jobContext?.availabilityDate ? "date" : "date"),
      availabilityDays: candidate?.availabilityDays != null ? String(candidate.availabilityDays) : "",
      availabilityDate: candidate?.jobContext?.availabilityDate || "",
      commuteComfortable: candidate?.jobContext?.commuteComfortable || "Yes",
      fitScore: candidate?.matchScore != null ? String(candidate.matchScore) : "",
      currentSalary: candidate?.currentSalary != null ? String(candidate.currentSalary) : "",
      expectedSalary: candidate?.expectedSalary != null ? String(candidate.expectedSalary) : "",
      notes: candidate?.jobContext?.manualScreeningNotes || candidate?.notes || "",
    });
  }, [candidate]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent size="xl" widthPx={showResumePane ? 1100 : 760}>
        <SheetHeader
          className="bg-[var(--fx-surface)]"
          title={<span className="text-[var(--fx-text-muted)]">Manual Pre-Screening</span>}
          actions={candidate ? (
            <div className="flex items-center gap-[8px]">
              <FxButton type="button" variant="ghost" size="sm" onClick={() => onPrevious?.(candidate)} disabled={!hasPrevious}>
                <ArrowLeft className="size-[16px]" />
                Previous
              </FxButton>
              <FxButton type="button" variant="ghost" size="sm" onClick={() => onNext?.(candidate)} disabled={!hasNext}>
                Next
                <ArrowRight className="size-[16px]" />
              </FxButton>
              {onOpenCandidatePool ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      aria-label="Open in Candidate Pool"
                      className="inline-flex h-[32px] w-[32px] items-center justify-center rounded-[6px] text-[var(--fx-text-muted)] transition-colors hover:bg-[var(--fx-surface-hover)] hover:text-[var(--fx-primary)]"
                      onClick={() => onOpenCandidatePool(candidate)}
                    >
                      <ArrowUpRight className="size-[16px]" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" sideOffset={6}>
                    Open in Candidate Pool
                  </TooltipContent>
                </Tooltip>
              ) : null}
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={() => setShowResumePane((current) => !current)}
                    className="flex h-[32px] w-[32px] items-center justify-center rounded-[6px] text-[var(--fx-text-muted)] hover:bg-[var(--fx-surface-hover)] hover:text-[var(--fx-text)]"
                    aria-label={showResumePane ? "Collapse resume pane" : "Expand resume pane"}
                  >
                    {showResumePane ? <PanelLeftClose className="size-[16px]" /> : <PanelLeftOpen className="size-[16px]" />}
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom" sideOffset={8}>{showResumePane ? "Collapse" : "Expand"}</TooltipContent>
              </Tooltip>
            </div>
          ) : null}
        />
        <SheetBody className="bg-[var(--fx-bg-soft)] px-[24px] py-[32px]">
          {candidate ? (
            <div
              className={cn(
                "grid h-full min-h-0 gap-[16px]",
                showResumePane ? "xl:grid-cols-[minmax(0,1.08fr)_minmax(0,1fr)]" : "xl:grid-cols-1",
              )}
            >
              {showResumePane ? (
                <div className="flex min-h-0 flex-col gap-[12px]">
                  <FxCandidateCard
                    candidate={candidate}
                    variant="default"
                    layout="vertical"
                    currency={salaryCurrency}
                  />
                  <ResumePanelShell>
                    <pre className="whitespace-pre-wrap break-words text-[14px] leading-[22px] text-[var(--fx-text)]">
                      {resumePreview}
                    </pre>
                  </ResumePanelShell>
                </div>
              ) : null}

              <div className={cn("flex min-h-0 flex-col", showResumePane ? `border-l ${FX_COLORS.border} pl-[16px]` : "")}>
                <div className={`flex min-h-0 flex-1 flex-col overflow-hidden rounded-[12px] border ${FX_COLORS.border} bg-[var(--fx-surface)]`}>
                  <div className={`shrink-0 border-b ${FX_COLORS.border} bg-[var(--fx-bg-soft)] px-[16px] py-[12px]`}>
                    <FxTabs
                      variant="underlined"
                      value={activeStep}
                      onValueChange={setActiveStep}
                      items={[
                        { value: "interview", label: "AI Generated Questions" },
                        { value: "prescreen", label: "Standard Screening Questions" },
                      ]}
                      itemClassName="text-[12px] leading-[18px]"
                    />
                  </div>

                  <div className="min-h-0 flex-1 overflow-y-auto bg-[var(--fx-surface)] p-[16px]">
                    {activeStep === "interview" ? (
                      <div className="space-y-[12px]">
                        {interviewQuestions.map((item, index) => (
                          <div key={item.question} className={`rounded-[8px] border ${FX_COLORS.border} bg-[var(--fx-bg-soft)] p-[12px]`}>
                            <p className={`${FX_TYPOGRAPHY.fieldHint} text-[var(--fx-text-muted)]`}>Question {index + 1}</p>
                            <p className={`${FX_TYPOGRAPHY.body} mt-[4px] text-[var(--fx-text)]`}>{item.question}</p>
                            <p className="mt-[8px] text-[13px] leading-[20px] text-[var(--fx-text-muted)]">{item.guidance}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-[16px]">
                        <div className={`space-y-[16px] rounded-[8px] border ${FX_COLORS.border} bg-[var(--fx-bg-soft)] p-[12px]`}>
                          <div className="space-y-[8px]">
                            <p className="text-[13px] leading-[20px] font-medium text-[var(--fx-text-muted)]">Is the candidate interested in the role?</p>
                            <RadioGroup
                              value={formState.interested}
                              onValueChange={(value) => setFormState((current) => ({ ...current, interested: value }))}
                              className="flex flex-wrap items-center gap-[20px]"
                            >
                              {["Yes", "No"].map((value) => (
                                <label key={value} className="flex cursor-pointer items-center gap-[8px]">
                                  <RadioGroupItem value={value} />
                                  <span className="text-[14px] leading-[22px] text-[var(--fx-text)]">{value}</span>
                                </label>
                              ))}
                            </RadioGroup>
                          </div>

                          <div className="space-y-[10px]">
                            <p className="text-[13px] leading-[20px] font-medium text-[var(--fx-text-muted)]">By when can the candidate join?</p>
                            <RadioGroup
                              value={formState.availabilityMode}
                              onValueChange={(value) => setFormState((current) => ({ ...current, availabilityMode: value }))}
                              className="flex flex-wrap items-center gap-[20px]"
                            >
                              <label className="flex cursor-pointer items-center gap-[8px]">
                                <RadioGroupItem value="date" />
                                <span className="text-[14px] leading-[22px] text-[var(--fx-text)]">Specific Date</span>
                              </label>
                              <label className="flex cursor-pointer items-center gap-[8px]">
                                <RadioGroupItem value="days" />
                                <span className="text-[14px] leading-[22px] text-[var(--fx-text)]">Availability in Days</span>
                              </label>
                            </RadioGroup>

                            {formState.availabilityMode === "date" ? (
                              <div className="w-[168px]">
                                <FxInput
                                  type="date"
                                  value={formState.availabilityDate}
                                  onChange={(event) => setFormState((current) => ({ ...current, availabilityDate: event.target.value }))}
                                />
                              </div>
                            ) : (
                              <div className="flex items-center gap-[8px]">
                                <div className="w-[72px]">
                                  <FxInput
                                    value={formState.availabilityDays}
                                    onChange={(event) => setFormState((current) => ({ ...current, availabilityDays: event.target.value }))}
                                    placeholder="30"
                                    inputMode="numeric"
                                    className="text-center"
                                  />
                                </div>
                                <span className="text-[14px] leading-[22px] text-[var(--fx-text-muted)]">Days</span>
                              </div>
                            )}
                          </div>

                          {shouldShowCommuteQuestion ? (
                            <div className="space-y-[8px]">
                              <p className="text-[13px] leading-[20px] font-medium text-[var(--fx-text-muted)]">{commuteQuestion}</p>
                              <RadioGroup
                                value={formState.commuteComfortable}
                                onValueChange={(value) => setFormState((current) => ({ ...current, commuteComfortable: value }))}
                                className="flex flex-wrap items-center gap-[20px]"
                              >
                                {["Yes", "No"].map((value) => (
                                  <label key={value} className="flex cursor-pointer items-center gap-[8px]">
                                    <RadioGroupItem value={value} />
                                    <span className="text-[14px] leading-[22px] text-[var(--fx-text)]">{value}</span>
                                  </label>
                                ))}
                              </RadioGroup>
                            </div>
                          ) : null}

                          <div className="grid gap-[16px] md:grid-cols-2">
                            <FxInput
                              label="Current Salary"
                              type="text"
                              inputMode="numeric"
                              value={formatCurrencyInputValue(formState.currentSalary, salaryCurrency)}
                              onChange={(event) => setFormState((current) => ({
                                ...current,
                                currentSalary: parseCurrencyInputValue(event.target.value),
                              }))}
                              placeholder={`Enter current CTC in ${salaryCurrency}`}
                              className="text-right"
                            />
                            <FxInput
                              label="Salary Expectation"
                              type="text"
                              inputMode="numeric"
                              value={formatCurrencyInputValue(formState.expectedSalary, salaryCurrency)}
                              onChange={(event) => setFormState((current) => ({
                                ...current,
                                expectedSalary: parseCurrencyInputValue(event.target.value),
                              }))}
                              placeholder={`Enter expected CTC in ${salaryCurrency}`}
                              className="text-right"
                            />
                            <FxInput
                              label="Fit Score"
                              type="text"
                              inputMode="numeric"
                              value={formState.fitScore}
                              onChange={(event) => setFormState((current) => ({ ...current, fitScore: event.target.value }))}
                              placeholder="Enter fit score"
                              className="text-right"
                            />
                          </div>
                          <FxInput
                            textarea
                            label="Recruiter Notes"
                            value={formState.notes}
                            onChange={(event) => setFormState((current) => ({ ...current, notes: event.target.value }))}
                            placeholder="Add notes from the conversation"
                            className="min-h-[120px]"
                          />
                        </div>

                        <div className={`space-y-[10px] rounded-[8px] border ${FX_COLORS.border} bg-[var(--fx-surface)] p-[12px]`}>
                          <div className="space-y-[10px]">
                            {standardScreeningQuestions.map((item, index) => (
                              <div key={item.id} className={`rounded-[8px] border ${FX_COLORS.border} bg-[var(--fx-bg-soft)] p-[12px]`}>
                                <p className="text-[12px] leading-[16px] font-medium text-[var(--fx-text-muted)]">Question {index + 1}</p>
                                <p className="mt-[4px] text-[14px] leading-[22px] text-[var(--fx-text)]">{item.question}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </SheetBody>
        <SheetFooter
          className="bg-[var(--fx-bg-soft)]"
          left={(
            <FxButton variant="destructive" size="sm" onClick={() => candidate && onReject?.(candidate)}>
              Reject
            </FxButton>
          )}
          right={(
            <FxButton size="sm" onClick={() => candidate && onSubmit?.(candidate, formState)}>Move to Prescreen</FxButton>
          )}
        />
      </SheetContent>
    </Sheet>
  );
}
/* - - - - - - - - - - - - - - - - */

function PreScreenResultSheet({
  open,
  onOpenChange,
  candidate,
  job,
  onShortlist,
  onReject,
  onDownloadResume,
  onEditCandidate,
  initialStep = "details",
}) {
  const [activeStep, setActiveStep] = useState("details");
  const [activeRecordingMarker, setActiveRecordingMarker] = useState("Q1");
  const salaryCurrency = job?.currency || candidate?.jobCurrency || "INR";
  const screeningMethod = getPreScreeningType(candidate);
  const isManualScreening = screeningMethod.key === "manual";
  const RESULT_STEPS = isManualScreening
    ? [
        { key: "details", label: "Details Retrieved" },
      ]
    : [
        { key: "details", label: "Details Retrieved" },
        { key: "analysis", label: "AI Call Analysis" },
        { key: "transcript", label: "Transcript" },
        { key: "recording", label: "Voice Recording" },
        { key: "resume", label: "Resume" },
      ];
  const screeningSummary = isManualScreening
    ? [
        { label: "Fit Score", value: candidate?.matchScore != null ? `${candidate.matchScore}%` : "Not Entered" },
        { label: "Recruiter Notes", value: candidate?.jobContext?.manualScreeningNotes || candidate?.notes || "Not Entered" },
      ]
    : [
        { label: "Interested", value: candidate?.interested || "Not Answered" },
        { label: "Notice Period", value: formatNoticePeriod(candidate) !== "—" ? formatNoticePeriod(candidate) : "Not Answered" },
        { label: "Location Preference", value: candidate?.jobContext?.commuteComfortable || "Not Answered" },
        { label: "Current CTC", value: candidate?.currentSalary != null ? formatCurrency(candidate.currentSalary, salaryCurrency) : "Not Answered" },
        { label: "Expected CTC", value: candidate?.expectedSalary != null ? formatCurrency(candidate.expectedSalary, salaryCurrency) : "Not Answered" },
        { label: "Current Company", value: candidate?.currentCompany || "Not Answered" },
        { label: "Recruiter Notes", value: candidate?.jobContext?.manualScreeningNotes || candidate?.notes || "Not Answered" },
      ];
  const activeIndex = RESULT_STEPS.findIndex((step) => step.key === activeStep);
  const screeningTimestamp = candidate?.jobContext?.manualScreeningCompletedAt || candidate?.updatedAt || candidate?.createdAt;
  const screeningScore = candidate?.matchScore != null ? `${candidate.matchScore}%` : "—";
  const screeningMethodLabel = screeningMethod.detailLabel;
  const ScreeningMethodIcon = screeningMethod.icon;
  const screeningStatus = (() => {
    const outcome = String(candidate?.screeningOutcome ?? "").trim().toLowerCase();

    if (outcome === "failed") {
      return "Failed";
    }

    if (outcome === "passed") {
      return "Passed";
    }

    return "Completed";
  })();
  const aiAnalysisSections = [
    {
      key: "communication",
      title: "Communication",
      score: "4.2",
      summary: "Candidate communicated clearly, stayed concise, and answered screening prompts without hesitation.",
    },
    {
      key: "confidence",
      title: "Confidence",
      score: "4.0",
      summary: "Candidate appeared comfortable discussing prior work, ownership, and decision-making in a recruiter call setting.",
    },
    {
      key: "domain-knowledge",
      title: "Domain Knowledge",
      score: "4.4",
      summary: "Candidate demonstrated a strong working understanding of the role’s technology stack and day-to-day workflows.",
    },
    {
      key: "resume-to-reality",
      title: "Resume to Reality",
      score: "4.1",
      summary: "Screening responses were largely consistent with the resume, with no major credibility gaps surfaced during the call.",
    },
    {
      key: "summary",
      title: "Summary",
      score: "4.2",
      summary: "Strong candidate for further evaluation. Signals across communication, confidence, and domain understanding were consistently positive.",
    },
  ];
  const transcriptItems = [
    {
      id: "q1",
      question: `Hello, this is Shreya, an AI recruiter. Am I speaking with ${candidate?.name || "the candidate"}?`,
      answer: "Yes, where are you calling from?",
    },
    {
      id: "q2",
      question: `I'm calling from ${job?.company || "the hiring company"}. We're hiring for ${job?.title || "this role"}. Is this a good time to speak?`,
      answer: candidate?.interested === "No" ? "No, thank you. I'm not interested." : "Yes, this works for me.",
    },
    {
      id: "q3",
      question: `Can you describe a recent example of work that best matches the ${job?.title || "role"} requirements?`,
      answer: "No answer found for this question.",
    },
    {
      id: "q4",
      question: "What is your current notice period?",
      answer: formatNoticePeriod(candidate) !== "—" ? formatNoticePeriod(candidate) : "No answer found for this question.",
    },
    {
      id: "q5",
      question: "What is your current annual compensation and expected compensation for your next role?",
      answer: candidate?.currentSalary != null || candidate?.expectedSalary != null
        ? `Current: ${candidate?.currentSalary != null ? formatCurrency(candidate.currentSalary, salaryCurrency) : "Not shared"} · Expected: ${candidate?.expectedSalary != null ? formatCurrency(candidate.expectedSalary, salaryCurrency) : "Not shared"}`
        : "No answer found for this question.",
    },
    {
      id: "q6",
      question: `Are you comfortable with the ${job?.location || "job"} location and work model?`,
      answer: candidate?.jobContext?.commuteComfortable || "No answer found for this question.",
    },
  ];
  const recordingMarkers = [
    { id: "Q1", timestamp: "00:00" },
    { id: "Q2", timestamp: "00:21" },
    { id: "Q3", timestamp: "00:52" },
    { id: "Q4", timestamp: "01:29" },
    { id: "Q5", timestamp: "02:02" },
    { id: "Q6", timestamp: "02:31" },
  ];
  const recordingProgress = {
    Q1: "0%",
    Q2: "18%",
    Q3: "37%",
    Q4: "58%",
    Q5: "79%",
    Q6: "92%",
  };
  const resumePreview = candidate ? [
    `${candidate.name || "Candidate"}`,
    `${candidate.currentRole || candidate.jobTitle || "Current Role"}${candidate.currentCompany ? ` · ${candidate.currentCompany}` : ""}`,
    "",
    "Summary",
    `Resume preview for ${candidate.name || "this candidate"} aligned to ${job?.title || "this role"}.`,
    "",
    "Highlights",
    `• Fit Score: ${candidate.matchScore != null ? `${candidate.matchScore}%` : "—"}`,
    `• Experience: ${candidate.experience != null ? `${candidate.experience} years` : "—"}`,
    `• Current Company: ${candidate.currentCompany || "—"}`,
  ].join("\n") : "";

  useEffect(() => {
    if (open) {
      const allowedStepKeys = new Set(RESULT_STEPS.map((step) => step.key));
      setActiveStep(allowedStepKeys.has(initialStep) ? initialStep : "details");
      setActiveRecordingMarker("Q1");
    }
  }, [candidate?.id, initialStep, isManualScreening, open]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent size="xl">
        <SheetHeader
          title="Pre-Screening Result"
          description={`${candidate?.name || "Candidate"} · ${RESULT_STEPS[activeIndex]?.label || "Details Retrieved"}`}
          actions={(
            <button
              type="button"
              className="inline-flex cursor-pointer items-center gap-[6px] rounded-[6px] px-[10px] py-[6px] text-[13px] leading-[18px] font-medium text-[var(--fx-text-muted)] transition-colors hover:bg-[var(--fx-surface-hover)] hover:text-[var(--fx-text)]"
              aria-label={`Open candidate details for ${candidate?.name || "candidate"}`}
              onClick={() => candidate && onEditCandidate?.(candidate)}
            >
              <span>Candidate Details</span>
              <ArrowUpRight className="size-[14px]" />
            </button>
          )}
        />
        <SheetBody>
          {candidate ? (
            <div className="space-y-[16px]">
              <div className={`rounded-[8px] border ${FX_COLORS.border} bg-[var(--fx-surface)] p-[16px]`}>
                <div className="space-y-[14px]">
                  <div className="space-y-[8px]">
                    <p className="text-[16px] leading-[24px] font-semibold text-[var(--fx-text)]">{candidate.name || "—"}</p>
                  </div>
                  <div className="grid gap-[16px] md:grid-cols-2">
                    <MetaField
                      label="Screening Type"
                      value={(
                        <span className="inline-flex items-center gap-[8px] text-[14px] leading-[20px] font-medium text-[var(--fx-text)]">
                          <ScreeningMethodIcon className="size-[14px] text-[var(--fx-primary)]" />
                          {screeningMethodLabel}
                        </span>
                      )}
                    />
                    <MetaField label="Screening Score" value={screeningScore} />
                    <MetaField label="Screening Status" value={screeningStatus} />
                    <MetaField label="Screening Date" value={screeningTimestamp ? formatDate(screeningTimestamp) : "—"} />
                    {!isManualScreening ? <MetaField label="Screening Time" value={screeningTimestamp ? formatTime(screeningTimestamp) : "—"} /> : null}
                  </div>
                </div>
              </div>

              <FxTabs
                variant="compact"
                value={activeStep}
                onValueChange={setActiveStep}
                items={RESULT_STEPS.map((step) => ({
                  value: step.key,
                  label: step.label,
                }))}
                className="w-fit"
              />

              {activeStep === "details" ? (
                <div className={`rounded-[8px] border ${FX_COLORS.border} bg-[var(--fx-surface)] p-[16px]`}>
                  <div className="grid gap-[16px] md:grid-cols-2">
                    {screeningSummary.map((item) => (
                      <MetaField key={item.label} label={item.label} value={item.value} />
                    ))}
                  </div>
                </div>
              ) : null}

              {!isManualScreening && activeStep === "analysis" ? (
                <div className="space-y-[12px]">
                  {aiAnalysisSections.map((section) => (
                    <div key={section.key} className={`rounded-[8px] border ${FX_COLORS.border} bg-[var(--fx-surface)] p-[16px]`}>
                      <div className="flex items-start justify-between gap-[12px]">
                        <div className="space-y-[4px]">
                          <p className={FX_TYPOGRAPHY.cardTitle}>{section.title}</p>
                        </div>
                        <p className="text-[13px] leading-[20px] font-medium text-[var(--fx-text-muted)]">
                          {section.title === "Summary" ? `Overall Score: ${section.score}` : `Score: ${section.score}`}
                        </p>
                      </div>
                      <p className="mt-[10px] text-[13px] leading-[20px] font-medium text-[var(--fx-text-muted)]">
                        {section.title === "Summary" ? "Summary" : "Justification"}
                      </p>
                      <p className="mt-[4px] text-[14px] leading-[22px] text-[var(--fx-text)]">
                        {section.summary}
                      </p>
                    </div>
                  ))}
                </div>
              ) : null}

              {!isManualScreening && activeStep === "transcript" ? (
                <div className={`rounded-[8px] border ${FX_COLORS.border} bg-[var(--fx-surface)] p-[16px]`}>
                  <div className="max-h-[560px] space-y-[14px] overflow-y-auto pr-[4px]">
                    {transcriptItems.map((item, index) => (
                      <div key={item.id} className="space-y-[8px]">
                        <div className="space-y-[4px]">
                          <p className="text-[12px] leading-[18px] font-semibold uppercase tracking-[0.04em] text-[var(--fx-text-muted)]">
                            Q{index + 1}
                          </p>
                          <p className="max-w-[68ch] text-[14px] leading-[22px] text-[var(--fx-text)]">
                            {item.question}
                          </p>
                        </div>
                        <div className="space-y-[4px] pl-[16px]">
                          <p className="text-[12px] leading-[18px] font-semibold uppercase tracking-[0.04em] text-[var(--fx-text-muted)]">
                            A{index + 1}
                          </p>
                          <p className={cn(
                            "max-w-[68ch] text-[14px] leading-[22px]",
                            item.answer === "No answer found for this question."
                              ? "text-[var(--fx-danger)]"
                              : "text-[var(--fx-text-muted)]",
                          )}>
                            {item.answer}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              {!isManualScreening && activeStep === "recording" ? (
                <div className={`rounded-[8px] border ${FX_COLORS.border} bg-[var(--fx-surface)] p-[16px]`}>
                  <p className={FX_TYPOGRAPHY.cardTitle}>Voice Recording</p>
                  <div className={`mt-[12px] rounded-[8px] border ${FX_COLORS.border} bg-[var(--fx-bg-soft)] p-[16px]`}>
                    <div className="space-y-[12px]">
                      <div className="flex items-center justify-between gap-[12px]">
                        <div className="flex items-center gap-[10px]">
                          <button
                            type="button"
                            className="inline-flex size-[32px] items-center justify-center rounded-full bg-[var(--fx-surface)] text-[var(--fx-text)] shadow-sm transition-colors hover:bg-[var(--fx-surface-hover)]"
                          >
                            <Play className="size-[14px] fill-current" />
                          </button>
                          <div className="space-y-[2px]">
                            <p className="text-[14px] leading-[20px] font-medium text-[var(--fx-text)]">AI Screening Call</p>
                            <p className="text-[12px] leading-[18px] text-[var(--fx-text-muted)]">Recorded screening conversation</p>
                          </div>
                        </div>
                        <span className="text-[13px] leading-[20px] text-[var(--fx-text-muted)]">02:46</span>
                      </div>
                      <div className="h-[8px] rounded-full bg-[var(--fx-border)]">
                        <div className="h-full rounded-full bg-[var(--fx-primary)] transition-all duration-200" style={{ width: recordingProgress[activeRecordingMarker] || "0%" }} />
                      </div>
                      <div className="flex flex-wrap gap-[8px]">
                        {recordingMarkers.map((marker) => (
                          <button
                            key={marker.id}
                            type="button"
                            onClick={() => setActiveRecordingMarker(marker.id)}
                            className={cn(
                              "inline-flex cursor-pointer items-center justify-center rounded-full border px-[10px] py-[4px] text-[12px] leading-[18px] font-medium transition-colors",
                              activeRecordingMarker === marker.id
                                ? "border-[var(--fx-primary)] bg-[var(--fx-surface-selected)] text-[var(--fx-primary)]"
                                : "border-[var(--fx-border)] bg-[var(--fx-surface)] text-[var(--fx-text-muted)] hover:bg-[var(--fx-surface-hover)] hover:text-[var(--fx-text)]",
                            )}
                          >
                            {marker.id}
                          </button>
                        ))}
                      </div>
                      <p className="text-[13px] leading-[20px] text-[var(--fx-text-muted)]">
                        {activeRecordingMarker} marker selected at {recordingMarkers.find((marker) => marker.id === activeRecordingMarker)?.timestamp || "00:00"}
                      </p>
                    </div>
                  </div>
                </div>
              ) : null}

              {activeStep === "resume" ? (
                <ResumePanelShell className="rounded-[8px]">
                  <div className="flex items-center justify-end gap-[12px]">
                    <FxButton type="button" variant="outline" size="sm" onClick={() => candidate && onDownloadResume?.(candidate)}>
                      Download Resume
                    </FxButton>
                  </div>
                  <div className={`mt-[12px] rounded-[8px] border ${FX_COLORS.border} bg-[var(--fx-bg-soft)] p-[16px]`}>
                    <pre className="whitespace-pre-wrap break-words text-[14px] leading-[22px] text-[var(--fx-text)]">
                      {resumePreview}
                    </pre>
                  </div>
                </ResumePanelShell>
              ) : null}
            </div>
          ) : null}
        </SheetBody>
        <SheetFooter
          left={null}
          right={(
            <div className="flex items-center gap-[8px]">
              <FxButton variant="destructive" size="sm" onClick={() => candidate && onReject?.(candidate)}>
                Reject
              </FxButton>
              <FxButton size="sm" onClick={() => candidate && onShortlist?.(candidate)}>
                Shortlist
              </FxButton>
            </div>
          )}
        />
      </SheetContent>
    </Sheet>
  );
}
/* - - - - - - - - - - - - - - - - */

function ShareForReviewSheet({ open, onOpenChange, candidates, job, onRemoveCandidate, onOpenCandidatePool, onSubmitShare }) {
  const [emailValue, setEmailValue] = useState("");
  const [messageValue, setMessageValue] = useState("");
  const [shareMode, setShareMode] = useState("cv_only");
  const [includePhone, setIncludePhone] = useState(false);
  const [includeEmail, setIncludeEmail] = useState(false);
  const [includeCompensation, setIncludeCompensation] = useState(false);
  const [includeScreening, setIncludeScreening] = useState(true);
  const [showCandidatePane, setShowCandidatePane] = useState(true);
  const [selectedCandidateId, setSelectedCandidateId] = useState(null);
  const [candidatePendingRemoval, setCandidatePendingRemoval] = useState(null);
  const candidateList = Array.isArray(candidates) ? candidates.filter(Boolean) : [];
  const salaryCurrency = job?.currency || "INR";
  const isBulkMode = candidateList.length > 1;
  const activeCandidate = useMemo(
    () => candidateList.find((candidate) => candidate.id === selectedCandidateId) ?? candidateList[0] ?? null,
    [candidateList, selectedCandidateId],
  );
  const handleRemoveCandidate = useCallback(() => {
    if (!candidatePendingRemoval) {
      return;
    }

    onRemoveCandidate?.(candidatePendingRemoval);
    setSelectedCandidateId((currentId) => {
      if (currentId === candidatePendingRemoval.id) {
        const nextCandidate = candidateList.find((candidate) => candidate.id !== candidatePendingRemoval.id) ?? null;
        return nextCandidate?.id ?? null;
      }

      return currentId;
    });
    setCandidatePendingRemoval(null);
  }, [candidateList, candidatePendingRemoval, onRemoveCandidate]);
  const handleSheetOpenChange = (nextOpen) => {
    if (!nextOpen) {
      setEmailValue("");
      setMessageValue("");
      setShareMode("cv_only");
      setIncludePhone(false);
      setIncludeEmail(false);
      setIncludeCompensation(false);
      setIncludeScreening(true);
      setShowCandidatePane(true);
      setSelectedCandidateId(null);
      setCandidatePendingRemoval(null);
    }

    onOpenChange(nextOpen);
  };
  const handleGenerateEmail = useCallback(() => {
    setMessageValue(
      buildShareForReviewEmailTemplate(candidateList, job, {
        shareMode,
        includePhone,
        includeEmail,
        includeCompensation,
        includeScreening,
      }),
    );
  }, [candidateList, includeCompensation, includeEmail, includePhone, includeScreening, job, shareMode]);

  return (
    <Sheet open={open} onOpenChange={handleSheetOpenChange}>
      <SheetContent size="xl" widthPx={showCandidatePane ? 1160 : 780}>
        <SheetHeader
          title="Share Candidate for Review"
          actions={(
            <div className="flex items-center gap-[8px]">
              {activeCandidate && onOpenCandidatePool ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      aria-label="Open in Candidate Pool"
                      className="inline-flex h-[32px] w-[32px] items-center justify-center rounded-[6px] text-[var(--fx-text-muted)] transition-colors hover:bg-[var(--fx-surface-hover)] hover:text-[var(--fx-primary)]"
                      onClick={() => onOpenCandidatePool(activeCandidate)}
                    >
                      <ArrowUpRight className="size-[16px]" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" sideOffset={6}>
                    Open in Candidate Pool
                  </TooltipContent>
                </Tooltip>
              ) : null}
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={() => setShowCandidatePane((current) => !current)}
                    className="flex h-[32px] w-[32px] items-center justify-center rounded-[6px] text-[var(--fx-text-muted)] hover:bg-[var(--fx-surface-hover)] hover:text-[var(--fx-text)]"
                    aria-label={showCandidatePane ? "Collapse candidate pane" : "Expand candidate pane"}
                  >
                    {showCandidatePane ? <PanelLeftClose className="size-[16px]" /> : <PanelLeftOpen className="size-[16px]" />}
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom" sideOffset={8}>{showCandidatePane ? "Collapse" : "Expand"}</TooltipContent>
              </Tooltip>
            </div>
          )}
        />
        <SheetBody className="bg-[var(--fx-surface)] px-[24px] py-[32px]">
          {activeCandidate ? (
            <div className={cn("grid h-full min-h-0", showCandidatePane ? "grid-cols-[minmax(0,1.3fr)_24px_minmax(0,1fr)]" : "grid-cols-1")}>
              {showCandidatePane ? (
                <>
                  <div className={cn("grid min-h-0 gap-[16px]", isBulkMode ? "grid-cols-[196px_minmax(0,1fr)]" : "grid-cols-1")}>
                    {isBulkMode ? (
                      <div className="min-h-0 overflow-auto rounded-[8px] bg-[var(--fx-bg-soft)] p-[6px]">
                        <div className="space-y-[8px]">
                          {candidateList.map((candidate) => (
                            <div
                              key={candidate.id}
                              className={cn(
                                "flex w-full items-start justify-between gap-[8px] rounded-[8px] px-[10px] py-[8px] text-left transition-colors",
                                candidate.id === activeCandidate.id
                                  ? "bg-[var(--fx-surface)] text-[var(--fx-text)] shadow-sm"
                                  : "bg-transparent text-[var(--fx-text)] hover:bg-[var(--fx-surface-hover)]",
                              )}
                            >
                              <button
                                type="button"
                                onClick={() => setSelectedCandidateId(candidate.id)}
                                className="flex min-w-0 flex-1 flex-col items-start text-left"
                              >
                                <span className="w-full truncate text-[13px] leading-[18px] font-medium text-[var(--fx-text)]">{candidate.name}</span>
                                <span className={cn("text-[12px] leading-[16px] font-medium", getMatchScoreToneClass(candidate.matchScore))}>
                                  {candidate.matchScore != null ? `${candidate.matchScore}%` : "—"}
                                </span>
                              </button>
                              <button
                                type="button"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  setCandidatePendingRemoval(candidate);
                                }}
                                className="inline-flex size-[20px] shrink-0 items-center justify-center rounded-[4px] text-[var(--fx-text-muted)] transition-colors hover:bg-[var(--fx-surface-hover)] hover:text-[var(--fx-danger)]"
                                aria-label={`Remove ${candidate.name}`}
                              >
                                <X className="size-[14px]" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}
                    <div className={`min-h-0 rounded-[8px] border ${FX_COLORS.border} bg-[var(--fx-surface)] p-[16px]`}>
                      <div className="space-y-[14px]">
                        <div className="space-y-[8px]">
                          <p className="text-[16px] leading-[24px] font-semibold text-[var(--fx-text)]">{activeCandidate.name || "—"}</p>
                          <p className="text-[13px] leading-[20px] text-[var(--fx-text-muted)]">
                            {getPreScreeningSourceLabel(activeCandidate)} · {formatNoticePeriod(activeCandidate)}
                          </p>
                        </div>
                        <div className="grid gap-[16px] md:grid-cols-2">
                          <MetaField label="Fit Score" value={activeCandidate.matchScore != null ? `${activeCandidate.matchScore}%` : "—"} />
                          <MetaField label="Experience" value={activeCandidate.experience != null ? `${activeCandidate.experience}y` : "—"} />
                          <MetaField label="Phone" value={activeCandidate.phone || "—"} />
                          <MetaField label="Expected CTC" value={formatCurrency(activeCandidate.expectedSalary, salaryCurrency)} />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="relative flex items-stretch justify-center pt-[32px]">
                    <div className={`absolute inset-y-0 left-1/2 w-px -translate-x-1/2 ${FX_COLORS.border}`} />
                  </div>
                </>
              ) : null}

              <div className="flex min-h-0 flex-col">
                {!showCandidatePane ? (
                  <div className="mb-[16px] flex items-center justify-between gap-[16px]">
                    <p className="truncate text-[15px] leading-[24px] font-medium text-[var(--fx-text)]">{activeCandidate.name}</p>
                    <p className={cn("shrink-0 text-[16px] leading-[24px] font-medium", getMatchScoreToneClass(activeCandidate.matchScore))}>
                      {activeCandidate.matchScore != null ? `Fit Score ${activeCandidate.matchScore}%` : "Fit Score unavailable"}
                    </p>
                  </div>
                ) : null}

                <div className={cn("flex min-h-0 w-full flex-1", showCandidatePane ? "justify-center" : "justify-start")}>
                  <div className={cn("flex min-h-0 w-full flex-1 flex-col", showCandidatePane ? "max-w-[560px]" : "")}>
                    <div className="space-y-[14px]">
                      <FxInput
                        label="To"
                        value={emailValue}
                        onChange={(event) => setEmailValue(event.target.value)}
                        placeholder="reviewer@company.com, hiring.manager@company.com"
                      />
                      <div className={`rounded-[8px] border ${FX_COLORS.border} bg-[var(--fx-surface)] p-[16px]`}>
                        <div className="flex items-center justify-between gap-[12px]">
                          <p className={`${FX_TYPOGRAPHY.fieldLabel} text-[var(--fx-text)]`}>What should be shared?</p>
                        </div>
                        <div className="mt-[12px] space-y-[12px]">
                          <RadioGroup value={shareMode} onValueChange={setShareMode} className="grid gap-[10px]">
                            <label className={`flex cursor-pointer items-start gap-[10px] rounded-[8px] border ${FX_COLORS.border} px-[12px] py-[10px]`}>
                              <RadioGroupItem value="cv_only" className="mt-[2px]" />
                              <div className="space-y-[2px]">
                                <p className="text-[14px] leading-[20px] font-medium text-[var(--fx-text)]">CV only</p>
                                <p className="text-[13px] leading-[20px] text-[var(--fx-text-muted)]">Share candidate resumes and names only.</p>
                              </div>
                            </label>
                            <label className={`flex cursor-pointer items-start gap-[10px] rounded-[8px] border ${FX_COLORS.border} px-[12px] py-[10px]`}>
                              <RadioGroupItem value="custom" className="mt-[2px]" />
                              <div className="space-y-[2px]">
                                <p className="text-[14px] leading-[20px] font-medium text-[var(--fx-text)]">CV + selected details</p>
                                <p className="text-[13px] leading-[20px] text-[var(--fx-text-muted)]">Choose which contact and screening details the hiring manager can see.</p>
                              </div>
                            </label>
                          </RadioGroup>

                          {shareMode === "custom" ? (
                            <div className="grid gap-[10px] sm:grid-cols-2">
                              {[
                                { checked: includePhone, onChange: setIncludePhone, label: "Include phone number" },
                                { checked: includeEmail, onChange: setIncludeEmail, label: "Include email address" },
                                { checked: includeCompensation, onChange: setIncludeCompensation, label: "Include CTC details" },
                                { checked: includeScreening, onChange: setIncludeScreening, label: "Include screening summary" },
                              ].map((item) => (
                                <label key={item.label} className="flex items-center gap-[10px] rounded-[8px] border border-[color:color-mix(in_srgb,var(--fx-border)_70%,transparent)] px-[12px] py-[10px]">
                                  <input
                                    type="checkbox"
                                    checked={item.checked}
                                    onChange={(event) => item.onChange(event.target.checked)}
                                    className="size-[16px] rounded border-[var(--fx-border)]"
                                  />
                                  <span className="text-[14px] leading-[20px] text-[var(--fx-text)]">{item.label}</span>
                                </label>
                              ))}
                            </div>
                          ) : null}
                        </div>
                      </div>
                      <div className="space-y-[8px]">
                        <div className="flex items-center justify-between gap-[12px]">
                          <p className={`${FX_TYPOGRAPHY.fieldLabel} text-[var(--fx-text)]`}>Email</p>
                          <FxAiButton type="button" size="sm" onClick={handleGenerateEmail}>
                            Generate Email
                          </FxAiButton>
                        </div>
                        <FxInput
                          textarea
                          value={messageValue}
                          onChange={(event) => setMessageValue(event.target.value)}
                          placeholder={`Sharing ${candidateList.length === 1 ? candidateList[0]?.name || "this candidate" : `${candidateList.length} candidates`} for review.`}
                          className="min-h-[160px]"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </SheetBody>
        <SheetFooter
          left={(
            <FxButton variant="outline" size="sm" onClick={() => onOpenChange(false)}>
              Cancel
            </FxButton>
          )}
          right={(
            <FxButton
              size="sm"
              onClick={() => {
                onSubmitShare?.(candidateList, {
                  recipients: emailValue,
                  message: messageValue,
                  shareMode,
                  includePhone,
                  includeEmail,
                  includeCompensation,
                  includeScreening,
                });
              }}
            >
              Send
            </FxButton>
          )}
        />
      </SheetContent>
      <AlertDialog open={Boolean(candidatePendingRemoval)} onOpenChange={(open) => !open && setCandidatePendingRemoval(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove candidate?</AlertDialogTitle>
            <AlertDialogDescription>
              {candidatePendingRemoval ? `Remove ${candidatePendingRemoval.name} from this review batch?` : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveCandidate}
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Sheet>
  );
}
/* - - - - - - - - - - - - - - - - */

function WhatsAppBrandIcon({ className = "size-[32px]" }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={className}>
      <path fill="#25D366" d="M20.52 3.48A11.87 11.87 0 0 0 12.05 0C5.48 0 .13 5.35.13 11.92c0 2.1.55 4.15 1.59 5.96L0 24l6.3-1.65a11.86 11.86 0 0 0 5.75 1.46h.01c6.57 0 11.92-5.35 11.92-11.92 0-3.18-1.24-6.17-3.46-8.4Z" />
      <path fill="#fff" d="M17.06 13.72c-.27-.14-1.6-.79-1.85-.88-.25-.09-.43-.14-.61.14-.18.27-.7.88-.86 1.06-.16.18-.31.2-.58.07-.27-.14-1.13-.42-2.16-1.34-.8-.71-1.35-1.59-1.5-1.86-.16-.27-.02-.42.12-.56.12-.12.27-.31.41-.47.14-.16.18-.27.27-.45.09-.18.05-.34-.02-.47-.07-.14-.61-1.48-.84-2.03-.22-.52-.45-.45-.61-.46h-.52c-.18 0-.47.07-.72.34-.25.27-.95.93-.95 2.27s.98 2.63 1.11 2.82c.14.18 1.92 2.92 4.66 4.1.65.28 1.16.45 1.56.57.65.21 1.25.18 1.72.11.52-.08 1.6-.65 1.82-1.27.23-.63.23-1.16.16-1.27-.07-.11-.25-.18-.52-.32Z" />
    </svg>
  );
}
/* - - - - - - - - - - - - - - - - */

function LinkedInBrandIcon({ className = "size-[32px]" }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={className}>
      <path fill="#0A66C2" d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.95v5.66H9.34V8.98h3.42v1.57h.05c.48-.9 1.64-1.85 3.37-1.85 3.61 0 4.27 2.38 4.27 5.47v6.28zM5.32 7.41a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.1 20.45H3.54V8.98H7.1v11.47zM22.23 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.46c.98 0 1.77-.77 1.77-1.72V1.72C24 .77 23.21 0 22.23 0z" />
    </svg>
  );
}
/* - - - - - - - - - - - - - - - - */

function NaukriBrandIcon({ className = "size-[32px]" }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={className}>
      <rect width="24" height="24" rx="6" fill="#0B5BD3" />
      <path fill="#fff" d="M6 17V7h2.3l5.1 6.2V7H16v10h-2.2l-5.2-6.3V17z" />
    </svg>
  );
}
/* - - - - - - - - - - - - - - - - */

function IndeedBrandIcon({ className = "size-[32px]" }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={className}>
      <rect width="24" height="24" rx="6" fill="#2557A7" />
      <circle cx="8" cy="8" r="2" fill="#fff" />
      <path fill="#fff" d="M7 11h2v6H7zm4-2h2v8h-2zm4 2h2c1.38 0 2.5 1.12 2.5 2.5V17H17v-3.1c0-.5-.4-.9-.9-.9H15V17h-2z" />
    </svg>
  );
}
/* - - - - - - - - - - - - - - - - */

function ShineBrandIcon({ className = "size-[32px]" }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={className}>
      <rect width="24" height="24" rx="6" fill="#6D28D9" />
      <path fill="#fff" d="M8.2 7.2h7.6v2H10.4v1.8h4.6v2h-4.6v1.8H16v2H8.2z" />
    </svg>
  );
}
/* - - - - - - - - - - - - - - - - */

function GlassdoorBrandIcon({ className = "size-[32px]" }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={className}>
      <rect width="24" height="24" rx="6" fill="#0CAA41" />
      <path fill="#fff" d="M7 7h2.2v7.8H13V17H7zm7.2 4.2h2.2V17h-2.2z" />
    </svg>
  );
}
/* - - - - - - - - - - - - - - - - */

function InstagramBrandIcon({ className = "size-[32px]" }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={className}>
      <defs>
        <linearGradient id="igGradient" x1="0%" x2="100%" y1="100%" y2="0%">
          <stop offset="0%" stopColor="#F58529" />
          <stop offset="45%" stopColor="#DD2A7B" />
          <stop offset="100%" stopColor="#515BD4" />
        </linearGradient>
      </defs>
      <rect width="24" height="24" rx="6" fill="url(#igGradient)" />
      <rect x="6.2" y="6.2" width="11.6" height="11.6" rx="3.2" fill="none" stroke="#fff" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="2.8" fill="none" stroke="#fff" strokeWidth="1.8" />
      <circle cx="16.4" cy="7.8" r="1" fill="#fff" />
    </svg>
  );
}
/* - - - - - - - - - - - - - - - - */

function ShareJobSheet({ open, onOpenChange, job, shareUrl, onCopyLink, onCopyChannelLink }) {
  const shareChannels = [
    { key: "whatsapp", label: "WhatsApp", icon: WhatsAppBrandIcon, src: "1" },
    { key: "linkedin", label: "LinkedIn", icon: LinkedInBrandIcon, src: "2" },
    { key: "naukri", label: "Naukri", icon: NaukriBrandIcon, src: "3" },
    { key: "indeed", label: "Indeed", icon: IndeedBrandIcon, src: "4" },
    { key: "shine", label: "Shine", icon: ShineBrandIcon, src: "5" },
    { key: "glassdoor", label: "Glassdoor", icon: GlassdoorBrandIcon, src: "6" },
    { key: "instagram", label: "Instagram", icon: InstagramBrandIcon, src: "7" },
  ];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent size="md">
        <SheetHeader title="Share Job" />
        <SheetBody>
            <div className="space-y-[20px]">
              <div className={`rounded-[8px] border ${FX_COLORS.border} bg-[var(--fx-surface)] p-[16px]`}>
                <div className="space-y-[6px]">
                  <p className={FX_TYPOGRAPHY.cardTitle}>{job?.title || "—"}</p>
                  <p className="text-[14px] leading-[22px] text-[var(--fx-text)]">
                    {job?.location || "—"}{" • "}
                    {job?.experience || "—"}{" • "}
                    {Number(job?.positions) === 1 ? "1 Position" : `${job?.positions || 0} Positions`}
                  </p>
                </div>
              </div>

            <div className="space-y-[10px]">
              <div className="flex items-center justify-between gap-[12px]">
                <p className={`${FX_TYPOGRAPHY.fieldLabel} text-[var(--fx-text-muted)]`}>Job Link</p>
                <FxButton type="button" variant="outline" size="sm" onClick={onCopyLink}>
                  <Copy className="size-[16px]" />
                  Copy URL
                </FxButton>
              </div>
              <FxInput readOnly value={shareUrl} className="w-full" />
            </div>

            <div className="space-y-[10px]">
              <p className={`${FX_TYPOGRAPHY.fieldLabel} text-[var(--fx-text-muted)]`}>Click a channel below to copy its share link.</p>
              <div className="grid grid-cols-2 gap-[12px] sm:grid-cols-3">
                {shareChannels.map((channel) => {
                  const Icon = channel.icon;

                  return (
                    <button
                      key={channel.key}
                      type="button"
                      onClick={() => onCopyChannelLink?.(channel)}
                      className={`flex flex-col items-center gap-[10px] rounded-[8px] border ${FX_COLORS.border} bg-[var(--fx-surface)] px-[12px] py-[14px] text-center transition-colors hover:bg-[var(--fx-surface-hover)]`}
                    >
                      <Icon className="size-[32px]" />
                      <span className="text-[13px] leading-[18px] font-medium text-[var(--fx-text)]">{channel.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </SheetBody>
      </SheetContent>
    </Sheet>
  );
}
/* - - - - - - - - - - - - - - - - */

function SendToClientConfirmSheet({
  open,
  onOpenChange,
  job,
  candidates,
  onMarkSent,
  onGenerateDraft,
}) {
  const candidateList = Array.isArray(candidates) ? candidates : [];
  const salaryCurrency = job?.currency || "INR";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent size="lg">
        <SheetHeader title="Send to Client" />
        <SheetBody className="overflow-hidden">
          <div className="flex h-full min-h-0 flex-col gap-[12px]">
            <div className={`rounded-[8px] border ${FX_COLORS.border} bg-[var(--fx-surface)] p-[16px]`}>
              <p className="text-[14px] leading-[22px] text-[var(--fx-text-muted)]">
                Before sending, review the candidate details. You can either mark the candidate as already sent to the client or generate an email draft to share.
              </p>
            </div>

            <div className={`overflow-hidden rounded-[8px] border ${FX_COLORS.border} bg-[var(--fx-surface)]`}>
              <div className="grid grid-cols-[minmax(180px,1.4fr)_110px_minmax(220px,1.6fr)_120px_140px_140px] gap-[16px] border-b border-[var(--fx-border)] px-[16px] py-[12px] text-[13px] leading-[20px] font-medium text-[var(--fx-text-muted)]">
                <span>Name</span>
                <span className="text-center">Fit Score</span>
                <span>Phone / Email</span>
                <span className="text-center">Availability</span>
                <span className="text-right">Current CTC</span>
                <span className="text-right">Expected CTC</span>
              </div>
              <div className="max-h-[360px] overflow-y-auto">
                {candidateList.map((candidate) => (
                  <div key={candidate.id} className="grid grid-cols-[minmax(180px,1.4fr)_110px_minmax(220px,1.6fr)_120px_140px_140px] gap-[16px] border-b border-[color:color-mix(in_srgb,var(--fx-border)_65%,transparent)] px-[16px] py-[14px] text-[14px] leading-[22px] text-[var(--fx-text)] last:border-b-0">
                    <span className="truncate font-medium">{candidate.name}</span>
                    <span className="text-center">{candidate.matchScore != null ? `${candidate.matchScore}%` : "—"}</span>
                    <div className="min-w-0">
                      <div className="truncate">{candidate.phone || "—"}</div>
                      <div className="truncate text-[var(--fx-text-muted)]">{candidate.email || "—"}</div>
                    </div>
                    <span className="text-center">{formatAvailability(candidate.availabilityDays)}</span>
                    <span className="text-right tabular-nums">{formatCurrency(candidate.currentSalary, salaryCurrency)}</span>
                    <span className="text-right tabular-nums">{formatCurrency(candidate.expectedSalary, salaryCurrency)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </SheetBody>
        <SheetFooter
          left={(
            <FxButton variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
              Cancel
            </FxButton>
          )}
          right={(
            <div className="flex items-center gap-[8px]">
              <FxButton variant="outline" size="sm" onClick={() => onMarkSent?.(candidateList)}>
                Mark as Sent to Client
              </FxButton>
              <FxButton size="sm" onClick={() => onGenerateDraft?.(candidateList, "client")}>
                Generate Email Draft
              </FxButton>
            </div>
          )}
        />
      </SheetContent>
    </Sheet>
  );
}
/* - - - - - - - - - - - - - - - - */

function SendToClientDraftSheet({
  open,
  onOpenChange,
  job,
  candidates,
  mode = "client",
  onSwitchToReview,
  onCopySubject,
  onCopyContent,
  onCopyDetailedContent,
  onViewResume,
  onDownloadZip,
  onDownloadResumes,
}) {
  const candidateList = Array.isArray(candidates) ? candidates : [];
  const salaryCurrency = job?.currency || "INR";
  const candidateCount = candidateList.length;
  const recruiterName = job?.updatedBy || "Recruiter";
  const isReviewMode = mode === "review";
  const subject = isReviewMode
    ? `Candidate Profiles for Review - ${job?.title || "Role"}`
    : `Shortlisted Candidate Profiles for ${job?.title || "Role"}`;
  const body = isReviewMode
    ? [
        "Hi,",
        "",
        `Please review ${candidateCount} shortlisted candidate profile${candidateCount === 1 ? "" : "s"} for the position of ${job?.title || "this role"}.`,
        "",
        "These profiles have been pre-screened and represent the strongest candidates currently available for review.",
        "",
        "Please share your feedback on the candidates you would like to take forward or any adjustments you would like in the search.",
        "",
        "Best regards,",
        recruiterName,
      ].join("\n")
    : [
        "Hi,",
        "",
        `Please find attached ${candidateCount} shortlisted candidate profile${candidateCount === 1 ? "" : "s"} for the position of ${job?.title || "this role"}.`,
        "",
        "These candidates have been evaluated against the job requirements and represent the most relevant profiles from the applicant pool.",
        "",
        "Kindly review the attached resumes at your convenience. Please let me know if you would like to arrange discussions with any of the candidates or refine the search further.",
        "",
        "Looking forward to your feedback.",
        "",
        "Best regards,",
        recruiterName,
      ].join("\n");
  const detailedContent = [
    body,
    "",
    "Candidate Snapshot",
    ...candidateList.flatMap((candidate) => [
      `- ${candidate.name} | ${candidate.matchScore != null ? `${candidate.matchScore}% Fit Score` : "Fit Score —"} | ${formatAvailability(candidate.availabilityDays)} | Current ${formatCurrency(candidate.currentSalary, salaryCurrency)} | Expected ${formatCurrency(candidate.expectedSalary, salaryCurrency)}`,
      `  Resume: https://www.evalityjobs.com/resume/${candidate.id}`,
    ]),
  ].join("\n");

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent size="xl">
        <SheetHeader title="Send to Client" />
        <SheetBody>
          <div className="space-y-[16px]">
            <div className={`rounded-[8px] border ${FX_COLORS.border} bg-[var(--fx-surface)] p-[16px]`}>
              <div className="flex items-center justify-between gap-[12px]">
                <p className={FX_TYPOGRAPHY.cardTitle}>Email Template</p>
                <FxButton variant="ghost" size="sm" onClick={() => onSwitchToReview?.()}>
                  Share for Review
                </FxButton>
              </div>
              <div className="mt-[12px] space-y-[12px]">
                <div className="space-y-[6px]">
                  <div className="flex items-center justify-between gap-[12px]">
                    <p className={`${FX_TYPOGRAPHY.fieldHint} text-[var(--fx-text-muted)]`}>Subject</p>
                    <FxButton variant="outline" size="sm" onClick={() => onCopySubject?.(subject)}>
                      Copy Email Subject
                    </FxButton>
                  </div>
                  <div className={`rounded-[8px] border ${FX_COLORS.border} bg-[var(--fx-bg-soft)] px-[12px] py-[10px] text-[14px] leading-[22px] text-[var(--fx-text)]`}>
                    {subject}
                  </div>
                </div>
                <div className="space-y-[6px]">
                  <div className="flex items-center justify-between gap-[12px]">
                    <p className={`${FX_TYPOGRAPHY.fieldHint} text-[var(--fx-text-muted)]`}>Body</p>
                    <div className="flex items-center gap-[8px]">
                      <FxButton variant="outline" size="sm" onClick={() => onCopyContent?.(body)}>
                        Copy Email Content
                      </FxButton>
                      {/* <FxButton variant="outline" size="sm" onClick={() => onCopyDetailedContent?.(detailedContent)}>
                        Copy Detailed Content
                      </FxButton> */}
                    </div>
                  </div>
                  <textarea
                    readOnly
                    value={body}
                    className={`min-h-[220px] w-full resize-none rounded-[8px] border ${FX_COLORS.border} bg-[var(--fx-surface)] px-[12px] py-[10px] text-[14px] leading-[22px] text-[var(--fx-text)] outline-none`}
                  />
                </div>
              </div>
            </div>

            <div className={`overflow-hidden rounded-[8px] border ${FX_COLORS.border} bg-[var(--fx-surface)]`}>
              <div className="grid grid-cols-[minmax(180px,1.3fr)_minmax(220px,1.5fr)_110px_120px_140px_140px_80px] gap-[16px] border-b border-[var(--fx-border)] px-[16px] py-[12px] text-[13px] leading-[20px] font-medium text-[var(--fx-text-muted)]">
                <span>Candidate Name</span>
                <span>Email &amp; Phone Number</span>
                <span className="text-center">Fit Score</span>
                <span className="text-center">Availability</span>
                <span className="text-right">Current CTC</span>
                <span className="text-right">Expected CTC</span>
                <span className="text-center">Resume</span>
              </div>
              <div className="max-h-[320px] overflow-y-auto">
                {candidateList.map((candidate) => (
                  <div key={candidate.id} className="grid grid-cols-[minmax(180px,1.3fr)_minmax(220px,1.5fr)_110px_120px_140px_140px_80px] gap-[16px] border-b border-[color:color-mix(in_srgb,var(--fx-border)_65%,transparent)] px-[16px] py-[14px] text-[14px] leading-[22px] text-[var(--fx-text)] last:border-b-0">
                    <span className="truncate font-medium">{candidate.name}</span>
                    <div className="min-w-0">
                      <div className="truncate">{candidate.email || "—"}</div>
                      <div className="truncate text-[var(--fx-text-muted)]">{candidate.phone || "—"}</div>
                    </div>
                    <span className="text-center">{candidate.matchScore != null ? `${candidate.matchScore}%` : "—"}</span>
                    <span className="text-center">{formatAvailability(candidate.availabilityDays)}</span>
                    <span className="text-right tabular-nums">{formatCurrency(candidate.currentSalary, salaryCurrency)}</span>
                    <span className="text-right tabular-nums">{formatCurrency(candidate.expectedSalary, salaryCurrency)}</span>
                    <button
                      type="button"
                      className="text-center text-[var(--fx-primary)] hover:text-[color-mix(in_srgb,var(--fx-primary)_82%,black_18%)]"
                      onClick={() => onViewResume?.(candidate)}
                    >
                      View
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className={`rounded-[8px] border ${FX_COLORS.border} bg-[var(--fx-bg-soft)] px-[14px] py-[12px]`}>
              <p className="text-[13px] leading-[20px] text-[var(--fx-text-muted)]">
                Some companies do not accept emails with zip files. If needed, unzip and attach the resumes individually, or use Download Resumes.
              </p>
            </div>
          </div>
        </SheetBody>
        <SheetFooter
          left={null}
          right={(
            <div className="flex items-center gap-[8px]">
              <FxButton variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
                Cancel
              </FxButton>
              <FxButton variant="outline" size="sm" onClick={() => onDownloadZip?.(candidateList)}>
                Download as Zip
              </FxButton>
              <FxButton size="sm" onClick={() => onDownloadResumes?.(candidateList)}>
                Download Resumes
              </FxButton>
            </div>
          )}
        />
      </SheetContent>
    </Sheet>
  );
}
/* - - - - - - - - - - - - - - - - */

function ClientStatusUpdateSheet({
  open,
  onOpenChange,
  candidate,
  pendingStatus,
  mode = "status",
  onSave,
  onOpenResume,
}) {
  const [commentValue, setCommentValue] = useState("");
  const commentRef = useRef(null);
  const salaryCurrency = candidate?.jobCurrency || "INR";

  useEffect(() => {
    setCommentValue("");
  }, [candidate?.id, candidate?.clientStatus, open, pendingStatus, mode]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const timer = window.setTimeout(() => {
      commentRef.current?.focus?.();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [open, pendingStatus, mode]);

  const activityHistory = useMemo(() => {
    const clientActivity = Array.isArray(candidate?.jobContext?.clientActivity) ? candidate.jobContext.clientActivity : [];
    const legacyComments = Array.isArray(candidate?.jobContext?.clientComments)
      ? candidate.jobContext.clientComments.map((entry) => ({
          ...entry,
          type: "note",
          text: entry.text || "Recruiter note",
        }))
      : [];

    return [...clientActivity, ...legacyComments]
      .filter(Boolean)
      .sort((left, right) => new Date(left.timestamp || 0).getTime() - new Date(right.timestamp || 0).getTime());
  }, [candidate?.jobContext?.clientActivity, candidate?.jobContext?.clientComments]);
  const currentStatus = candidate?.clientStatus || "Feedback Awaited";
  const newStatus = pendingStatus || currentStatus;
  const trimmedComment = String(commentValue ?? "").trim();
  const canSave = Boolean(trimmedComment);
  const isStatusChange = Boolean(pendingStatus);
  const sheetDescription = isStatusChange ? `${currentStatus} → ${newStatus}` : `Current status: ${currentStatus}`;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent size="xl">
        <SheetHeader
          title={candidate?.name || "Candidate Activity"}
          description={sheetDescription}
        />
        <SheetBody>
          {candidate ? (
            <div className="space-y-[16px]">
              <div className={`space-y-[14px] rounded-[8px] border ${FX_COLORS.border} bg-[var(--fx-surface)] p-[16px]`}>
                <div className="flex items-start justify-between gap-[16px]">
                  <div className="space-y-[4px]">
                    <p className={`${FX_TYPOGRAPHY.cardTitle} text-[var(--fx-text-muted)]`}>Activity</p>
                    <p className="text-[14px] leading-[22px] text-[var(--fx-text)]">
                      {isStatusChange
                        ? `Add a recruiter comment before saving ${newStatus}.`
                        : "Review the status timeline and add a recruiter note if needed."}
                    </p>
                  </div>
                  {isStatusChange ? (
                    <span className="inline-flex items-center rounded-full border border-[color-mix(in_srgb,var(--fx-primary)_24%,var(--fx-border)_76%)] bg-[color-mix(in_srgb,var(--fx-primary)_8%,var(--fx-surface)_92%)] px-[10px] py-[4px] text-[12px] leading-[18px] font-medium text-[var(--fx-primary)]">
                      {newStatus}
                    </span>
                  ) : null}
                </div>

                <textarea
                  ref={commentRef}
                  value={commentValue}
                  onChange={(event) => setCommentValue(event.target.value)}
                  placeholder={isStatusChange ? "Recruiter comment required to save status change" : "Add recruiter note"}
                  className={`min-h-[108px] w-full resize-none rounded-[8px] border ${FX_COLORS.border} bg-[var(--fx-surface)] px-[12px] py-[10px] text-[14px] leading-[22px] text-[var(--fx-text)] outline-none placeholder:text-[var(--fx-text-disabled)]`}
                />

                <div className="space-y-[12px]">
                  <div className="flex items-center justify-between gap-[12px]">
                    <p className={FX_TYPOGRAPHY.cardTitle}>Timeline</p>
                    <span className="text-[13px] leading-[20px] text-[var(--fx-text-muted)]">
                      {activityHistory.length ? `${activityHistory.length} item${activityHistory.length === 1 ? "" : "s"}` : "No activity yet"}
                    </span>
                  </div>
                  {activityHistory.length ? (
                    <div className="space-y-[10px]">
                      {activityHistory.map((entry) => (
                        <div key={entry.id} className={`rounded-[8px] border ${FX_COLORS.border} bg-[var(--fx-bg-soft)] p-[12px]`}>
                          <div className="flex items-center justify-between gap-[12px]">
                            <div className="flex items-center gap-[8px]">
                              <span className={`inline-flex size-[8px] shrink-0 rounded-full ${entry.type === "status" ? "bg-[var(--fx-primary)]" : "bg-[var(--fx-text-muted)]"}`} aria-hidden="true" />
                              <p className="text-[14px] leading-[20px] font-medium text-[var(--fx-text)]">{entry.author || "Recruiter"}</p>
                            </div>
                            <p className="text-[12px] leading-[18px] text-[var(--fx-text-muted)]">{entry.timestamp ? `${formatCompactDate(entry.timestamp)} · ${formatTime(entry.timestamp)}` : "—"}</p>
                          </div>
                          <p className="mt-[6px] text-[14px] leading-[22px] text-[var(--fx-text)]">
                            {entry.type === "status"
                              ? `Status updated to ${entry.status || "Feedback Awaited"}`
                              : entry.text || "Recruiter note"}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[14px] leading-[22px] text-[var(--fx-text-muted)]">No activity yet.</p>
                  )}
                </div>
              </div>

              <div className={`space-y-[12px] rounded-[8px] border ${FX_COLORS.border} bg-[var(--fx-surface)] p-[16px]`}>
                <p className={FX_TYPOGRAPHY.cardTitle}>Candidate Snapshot</p>
                <div className="grid gap-[16px] md:grid-cols-2">
                  <MetaField label="Email" value={candidate.email || "—"} />
                  <MetaField label="Phone" value={candidate.phone || "—"} />
                  <MetaField label="Resume" value={(
                    <button type="button" className="text-[var(--fx-primary)] hover:text-[color-mix(in_srgb,var(--fx-primary)_82%,black_18%)]" onClick={() => onOpenResume?.(candidate)}>
                      View Resume
                    </button>
                  )} />
                  <MetaField label="Availability" value={formatAvailability(candidate.availabilityDays)} />
                  <MetaField label="Current CTC" value={formatCurrency(candidate.currentSalary, salaryCurrency)} />
                  <MetaField label="Expected CTC" value={formatCurrency(candidate.expectedSalary, salaryCurrency)} />
                  <MetaField label="Current Stage" value={candidate.clientStatus || "Feedback Awaited"} />
                  <MetaField label="Last Updated" value={candidate.updatedAt ? formatCompactDate(candidate.updatedAt) : "—"} />
                </div>
              </div>
            </div>
          ) : null}
        </SheetBody>
        <SheetFooter
          left={(
            <FxButton variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
              Cancel
            </FxButton>
          )}
          right={(
            <FxButton size="sm" disabled={!canSave} onClick={() => candidate && onSave?.(candidate, pendingStatus, trimmedComment)}>
              {isStatusChange ? "Save Status" : "Save Note"}
            </FxButton>
          )}
        />
      </SheetContent>
    </Sheet>
  );
}
/* - - - - - - - - - - - - - - - - */

function CandidateWorkspaceSheet({
  open,
  onOpenChange,
  candidate,
  job,
  onSaveNote,
  onDeleteNote,
  onOpenCandidatePool,
  onPrevious,
  onNext,
  hasPrevious = false,
  hasNext = false,
  onDownloadResume,
  onUpdateField,
}) {
  const [showResumePane, setShowResumePane] = useState(true);
  const [noteDraft, setNoteDraft] = useState("");
  const salaryCurrency = job?.currency || candidate?.jobCurrency || "INR";
  const isRejected = candidate?.status === "rejected";
  const activeFlowStage = isRejected ? null : (candidate?.status ?? "unscreened");
  const currentStageIndex = isRejected ? -1 : PIPELINE_STAGE_SEQUENCE.indexOf(candidate?.status ?? "unscreened");
  const workflowStages = [
    { value: "unscreened", label: "Unscreened" },
    { value: "screened", label: "Pre-Screened" },
    { value: "shortlisted", label: "Shortlisted" },
    { value: "shared", label: "Interviewing" },
    { value: "offered", label: "Offered" },
    { value: "joined", label: "Joined" },
  ];
  const appliedDate = candidate?.appliedAt || candidate?.createdAt || candidate?.updatedAt || "";
  const stageTimeline = [
    {
      value: "unscreened",
      date: appliedDate,
    },
    {
      value: "screened",
      date: candidate?.jobContext?.screeningCompletedAt || candidate?.jobContext?.manualScreeningCompletedAt || candidate?.jobContext?.emailScreeningStartedAt || "",
    },
    {
      value: "shortlisted",
      date: candidate?.jobContext?.shortlistedAt || "",
    },
    {
      value: "shared",
      date: candidate?.jobContext?.reviewSharedAt || candidate?.jobContext?.sharedAt || "",
    },
    {
      value: "offered",
      date: candidate?.jobContext?.offeredAt || "",
    },
    {
      value: "joined",
      date: candidate?.jobContext?.joinedAt || "",
    },
  ];
  const screeningResult = candidate?.screeningOutcome || candidate?.jobContext?.screeningResult || "—";
  const resumeText = candidate?.resumeText || candidate?.jobContext?.resumeText || candidate?.resume || "";
  const effectiveResumePreview = resumeText || buildResumePreview(candidate, job, { includeFooter: true });

  useEffect(() => {
    setShowResumePane(true);
    setNoteDraft(candidate?.jobContext?.notes || candidate?.notes || "");
  }, [candidate?.id, open]);

  const noteItems = useMemo(() => {
    const jobContextNotes = Array.isArray(candidate?.jobContext?.notesList) ? candidate.jobContext.notesList : [];
    if (jobContextNotes.length) {
      return jobContextNotes;
    }

    const existingNote = candidate?.jobContext?.notes || candidate?.notes;
    if (existingNote) {
      return [{
        id: "legacy-note",
        author: "Renny",
        text: existingNote,
        timestamp: candidate?.updatedAt || candidate?.createdAt,
      }];
    }

    return [];
  }, [candidate]);

  return (
    <Sheet open={open} onOpenChange={(nextOpen) => {
      if (!nextOpen) {
        setShowResumePane(true);
      }

      onOpenChange(nextOpen);
    }}>
      <SheetContent size="xl" widthPx={showResumePane ? 1180 : 860}>
        <SheetHeader
          title="Candidate Details"
          actions={(
            <div className="flex items-center gap-[8px]">
              {hasPrevious && onPrevious ? (
                <FxButton type="button" variant="ghost" size="sm" onClick={() => onPrevious(candidate)}>
                  <ArrowLeft className="size-[16px]" />
                  Previous
                </FxButton>
              ) : null}
              {hasNext && onNext ? (
                <FxButton type="button" variant="ghost" size="sm" onClick={() => onNext(candidate)}>
                  Next
                  <ArrowRight className="size-[16px]" />
                </FxButton>
              ) : null}
              {onOpenCandidatePool ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      aria-label="Open in Candidate Pool"
                      className="inline-flex h-[32px] w-[32px] items-center justify-center rounded-[6px] text-[var(--fx-text-muted)] transition-colors hover:bg-[var(--fx-surface-hover)] hover:text-[var(--fx-primary)]"
                      onClick={() => candidate && onOpenCandidatePool(candidate)}
                    >
                      <ArrowUpRight className="size-[16px]" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" sideOffset={6}>
                    Open in Candidate Pool
                  </TooltipContent>
                </Tooltip>
              ) : null}
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={() => setShowResumePane((current) => !current)}
                    className="flex h-[32px] w-[32px] items-center justify-center rounded-[6px] text-[var(--fx-text-muted)] hover:bg-[var(--fx-surface-hover)] hover:text-[var(--fx-text)]"
                    aria-label={showResumePane ? "Collapse resume pane" : "Expand resume pane"}
                  >
                    {showResumePane ? <PanelLeftClose className="size-[16px]" /> : <PanelLeftOpen className="size-[16px]" />}
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom" sideOffset={8}>{showResumePane ? "Collapse" : "Expand"}</TooltipContent>
              </Tooltip>
            </div>
          )}
        />
        <SheetBody className="bg-[var(--fx-surface)] px-[24px] py-[32px]">
          {candidate ? (
            <div className="flex min-h-0 h-full flex-col gap-[16px]">
              <div className={`rounded-[4px] border ${FX_COLORS.border} bg-[var(--fx-surface)] p-[16px]`}>
                <div className="flex items-start justify-between gap-[16px]">
                  <div className="space-y-[2px]">
                    <p className="text-[11px] leading-[16px] font-semibold uppercase tracking-[0.08em] text-[var(--fx-text-muted)]">Candidate Progress</p>
                  </div>
                </div>
                <div className="mt-[14px] overflow-x-auto overflow-y-hidden">
                  <div className="min-w-[760px] px-[4px]">
                    <div className="flex items-start">
                      {workflowStages.map((stage, index) => {
                        const isCurrent = activeFlowStage === stage.value;
                        const isPast = currentStageIndex > index;
                        const isFilled = isPast || isCurrent;
                        const dateLabel = formatCompactDate(stageTimeline[index]?.date);

                        return (
                          <React.Fragment key={stage.value}>
                            <div className="flex min-w-[104px] flex-1 flex-col items-center gap-[8px] text-center">
                              <div
                                className={cn(
                                  "inline-flex min-h-[30px] min-w-[92px] items-center justify-center rounded-[4px] border px-[12px] text-[11px] leading-[16px] font-medium transition-colors",
                                  isCurrent
                                    ? "border-[var(--fx-disabled-text)] bg-[var(--fx-disabled-text)] text-white shadow-[0_0_0_0px_color-mix(in_srgb,var(--fx-primary)_12%,transparent)]"
                                    : isFilled
                                      ? "border-[color:color-mix(in_srgb,var(--fx-primary)_48%,var(--fx-border)_52%)] bg-[color:color-mix(in_srgb,var(--fx-primary)_14%,var(--fx-surface)_86%)] text-[var(--fx-primary)]"
                                      : "border-[color:color-mix(in_srgb,var(--fx-border)_86%,var(--fx-text)_14%)] bg-[var(--fx-surface)] text-[var(--fx-text-muted)]",
                                )}
                              >
                                {stage.label}
                              </div>
                              <p className="text-[11px] leading-[16px] text-[var(--fx-text-muted)]">
                                {dateLabel}
                              </p>
                            </div>
                            {index < workflowStages.length - 1 ? (
                              <div
                                className={cn(
                                  "mt-[14px] h-px min-w-[18px] flex-1 self-start rounded-full",
                                  isCurrent || isPast
                                    ? "bg-[var(--fx-primary)]"
                                    : "bg-[color:color-mix(in_srgb,var(--fx-border)_76%,transparent)]",
                                )}
                              />
                            ) : null}
                          </React.Fragment>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              <div className={cn("grid min-h-0 flex-1 gap-[12px]", showResumePane ? "xl:grid-cols-[minmax(0,1.08fr)_minmax(0,1fr)]" : "xl:grid-cols-1")}>
                {showResumePane ? (
                  <>
                    <div className="flex min-h-0 flex-col">
                      <div className={`flex min-h-0 flex-1 flex-col overflow-hidden rounded-[12px] border ${FX_COLORS.border} bg-[var(--fx-surface)]`}>
                        <div className="min-h-0 flex-1 overflow-y-auto bg-[var(--fx-bg-soft)] p-[16px]">
                          <pre className="whitespace-pre-wrap break-words text-[14px] leading-[22px] text-[var(--fx-text)]">
                            {effectiveResumePreview}
                          </pre>
                        </div>
                      </div>
                    </div>
                  </>
                ) : null}

                <div className={cn("flex min-h-0 flex-col gap-[16px]", showResumePane ? `border-l ${FX_COLORS.border} pl-[16px]` : "")}>
                  <FxCandidateCard
                    candidate={candidate}
                    variant="compact"
                    layout="horizontal"
                    currency={salaryCurrency}
                    onUpdateField={onUpdateField}
                    editableFields={{
                      email: true,
                      phone: true,
                      currentCTC: true,
                      expectedCTC: true,
                    }}
                  />

                  <div className="flex min-h-0 flex-1 flex-col gap-[12px]">
                    <FxInput
                      textarea
                      value={noteDraft}
                      onChange={(event) => setNoteDraft(event.target.value)}
                      placeholder="Add recruiter note..."
                      className="min-h-[120px]"
                    />
                    <div className="flex justify-end">
                      <FxButton
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => candidate && onSaveNote?.(candidate, noteDraft)}
                      >
                        Save Note
                      </FxButton>
                    </div>
                    <div className="min-h-0 flex-1 overflow-y-auto">
                      <div className="space-y-[12px] pr-[4px]">
                        {noteItems.length ? (
                          noteItems.map((item, index) => (
                            <div key={`${item.text}-${index}`} className={`rounded-[8px] border ${FX_COLORS.border} bg-[var(--fx-bg-soft)] p-[12px]`}>
                              <div className="flex items-start justify-between gap-[12px]">
                                <div className="min-w-0">
                                  <p className="text-[13px] leading-[20px] font-medium text-[var(--fx-text)]">{item.author || "Renny"}</p>
                                  <p className="text-[13px] leading-[20px] text-[var(--fx-text-muted)]">{formatRelativeTime(item.timestamp)}</p>
                                  <p className="mt-[8px] text-[14px] leading-[22px] text-[var(--fx-text)]">{item.text}</p>
                                </div>
                                <button
                                  type="button"
                                  className="inline-flex h-[28px] w-[28px] shrink-0 items-center justify-center rounded-[6px] text-[var(--fx-text-muted)] transition-colors hover:bg-[var(--fx-surface-hover)] hover:text-[var(--fx-danger)]"
                                  onClick={() => item.id && onDeleteNote?.(candidate, item.id)}
                                  aria-label="Delete note"
                                >
                                  <Trash2 className="size-[14px]" />
                                </button>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className={`${FX_TYPOGRAPHY.body} text-[var(--fx-text-muted)]`}>
                            No notes added yet.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </SheetBody>
      </SheetContent>
    </Sheet>
  );
}

function RecommendedCandidatesDrawer({ candidates, ...props }) {
  return <AddCandidatesDrawer {...props} candidatePool={candidates} mode="recommend" initialMode="pick" />;
}

function AddCandidatesDrawer({
  open,
  onOpenChange,
  job,
  candidatePool,
  onPickExistingCandidate,
  onUploadFiles,
  onOpenCandidatePool,
  mode = "add",
  initialMode = "upload",
}) {
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const allowUpload = mode === "add";
  const drawerTitle = mode === "recommend" ? "Recommend Candidates" : "Add Candidates";
  const candidateTabLabel = mode === "recommend" ? "Recommended Candidates" : "Candidates";
  const resolvedInitialMode = initialMode === "upload" && allowUpload ? "upload" : "pick";
  const [activeMode, setActiveMode] = useState(resolvedInitialMode);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCandidateId, setSelectedCandidateId] = useState(null);
  const [showResumePane, setShowResumePane] = useState(true);
  const [hiddenCandidateIds, setHiddenCandidateIds] = useState([]);
  const [activePreviewTab, setActivePreviewTab] = useState("background");

  useEffect(() => {
    if (!open) {
      setIsDragging(false);
      setActiveMode(resolvedInitialMode);
      setSearchTerm("");
      setSelectedCandidateId(null);
      setShowResumePane(true);
      setHiddenCandidateIds([]);
      setActivePreviewTab("background");

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    setActiveMode(resolvedInitialMode);
  }, [open, resolvedInitialMode]);

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
  const visibleCandidates = filteredCandidates.filter((candidate) => !hiddenCandidateIds.includes(candidate.id));
  const selectedCandidate = visibleCandidates.find((candidate) => candidate.id === selectedCandidateId) ?? visibleCandidates[0] ?? null;
  const salaryCurrency = job?.currency || selectedCandidate?.jobCurrency || "INR";
  const selectedCandidateIndex = visibleCandidates.findIndex((candidate) => candidate.id === selectedCandidate?.id);
  const hasPreviousCandidate = visibleCandidates.length > 1 && selectedCandidateIndex > 0;
  const hasNextCandidate = visibleCandidates.length > 1 && selectedCandidateIndex >= 0 && selectedCandidateIndex < visibleCandidates.length - 1;
  const selectedCandidateResumePreview = selectedCandidate?.resumeText || selectedCandidate?.jobContext?.resumeText || selectedCandidate?.resume || buildResumePreview(selectedCandidate, job, { includeFooter: true });
  const selectedCandidateBackground = useMemo(() => {
    if (!selectedCandidate) {
      return [];
    }

    const currentJobId = job?.id;
    const linkedJobIds = Object.keys(selectedCandidate.jobContexts ?? {}).filter((jobId) => jobId !== currentJobId);
    const notes = [
      selectedCandidate.notes,
      selectedCandidate.jobContext?.manualScreeningNotes,
      selectedCandidate.jobContext?.notes,
    ]
      .map((value) => String(value ?? "").trim())
      .filter(Boolean);

    const items = [
      {
        label: "Current",
        value: [selectedCandidate.currentRole, selectedCandidate.currentCompany].filter(Boolean).join(" at ") || "No current role captured yet.",
      },
      {
        label: "Experience",
        value: selectedCandidate.experience ? `${selectedCandidate.experience} years` : "Experience not captured.",
      },
      {
        label: "Source",
        value: selectedCandidate.source || selectedCandidate.jobTitle || "Existing candidate pool",
      },
    ];

    if (linkedJobIds.length) {
      items.push({
        label: "Prior Job Links",
        value: linkedJobIds.join(", "),
      });
    }

    if (notes.length) {
      items.push({
        label: "Notes",
        value: notes[0],
      });
    }

    return items;
  }, [job?.id, selectedCandidate]);

  useEffect(() => {
    if (!visibleCandidates.length) {
      setSelectedCandidateId(null);
      return;
    }

    if (!visibleCandidates.some((candidate) => candidate.id === selectedCandidateId)) {
      setSelectedCandidateId(visibleCandidates[0].id);
    }
  }, [selectedCandidateId, visibleCandidates]);

  useEffect(() => {
    setActivePreviewTab("background");
  }, [selectedCandidate?.id]);

  const handleHideCandidate = useCallback((candidateId) => {
    setHiddenCandidateIds((current) => {
      if (current.includes(candidateId)) {
        return current;
      }

      if (selectedCandidateId === candidateId) {
        const nextCandidate = visibleCandidates.find((candidate) => candidate.id !== candidateId) ?? null;
        setSelectedCandidateId(nextCandidate?.id ?? null);
      }

      return [...current, candidateId];
    });
  }, [selectedCandidateId, visibleCandidates]);

  return (
    <Sheet open={open} onOpenChange={(nextOpen) => {
      if (!nextOpen) {
        setShowResumePane(true);
        setHiddenCandidateIds([]);
        setSelectedCandidateId(null);
      }

      onOpenChange(nextOpen);
    }}>
      <SheetContent size="xl" widthPx={showResumePane ? 1160 : 780}>
        <SheetHeader
          title={drawerTitle}
          actions={selectedCandidate ? (
            <>
              {visibleCandidates.length > 1 ? (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      if (!hasPreviousCandidate) {
                        return;
                      }

                      setSelectedCandidateId(visibleCandidates[selectedCandidateIndex - 1]?.id);
                    }}
                    disabled={!hasPreviousCandidate}
                    className="flex h-[32px] items-center justify-center rounded-[6px] px-[8px] text-[13px] font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!hasNextCandidate) {
                        return;
                      }

                      setSelectedCandidateId(visibleCandidates[selectedCandidateIndex + 1]?.id);
                    }}
                    disabled={!hasNextCandidate}
                    className="flex h-[32px] items-center justify-center rounded-[6px] px-[8px] text-[13px] font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
                  >
                    Next
                  </button>
                </>
              ) : null}
              {selectedCandidate && onOpenCandidatePool ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      aria-label="Open in Candidate Pool"
                      className="inline-flex h-[32px] w-[32px] items-center justify-center rounded-[6px] text-[var(--fx-text-muted)] transition-colors hover:bg-[var(--fx-surface-hover)] hover:text-[var(--fx-primary)]"
                      onClick={() => onOpenCandidatePool(selectedCandidate)}
                    >
                      <ArrowUpRight className="size-[16px]" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" sideOffset={6}>
                    Open in Candidate Pool
                  </TooltipContent>
                </Tooltip>
              ) : null}
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={() => setShowResumePane((current) => !current)}
                    className="flex h-[32px] w-[32px] cursor-pointer items-center justify-center rounded-[6px] text-muted-foreground hover:bg-accent hover:text-foreground"
                    aria-label={showResumePane ? "Collapse" : "Expand"}
                  >
                    {showResumePane ? <PanelLeftClose className="size-[16px]" /> : <PanelLeftOpen className="size-[16px]" />}
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom" sideOffset={8}>{showResumePane ? "Collapse" : "Expand"}</TooltipContent>
              </Tooltip>
            </>
          ) : null}
        />
        <SheetBody>
          <div className="space-y-[16px]">
            {allowUpload ? (
              <FxTabs
                tabs={[
                  { value: "pick", label: candidateTabLabel },
                  { value: "upload", label: "Upload" },
                ]}
                active={activeMode}
                onChange={setActiveMode}
                className="justify-start"
                showBorder={false}
              />
            ) : null}

            {activeMode === "upload" ? (
              <section className={`flex h-full min-h-0 flex-1 flex-col rounded-[16px] border ${FX_COLORS.border} bg-[var(--fx-surface)] p-[20px]`}>
                <div
                  onDragOver={(event) => {
                    event.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  className={`mx-auto flex w-full max-w-[420px] min-h-[280px] cursor-pointer flex-col items-center justify-center rounded-[16px] border border-dashed px-[24px] py-[28px] text-center transition-colors ${
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
                  </div>
                  <p className="mt-[12px] text-[13px] leading-[20px] text-[var(--fx-text-muted)]">
                    Drag and drop is supported in the final flow.
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

            {activeMode === "pick" ? (
              <section className="flex h-full min-h-0 flex-1 flex-col">
                {visibleCandidates.length ? (
                  <div className={cn("grid min-h-0 flex-1 gap-[8px]", showResumePane ? "lg:grid-cols-[minmax(0,300px)_1px_minmax(0,1fr)]" : "lg:grid-cols-1")}>
                    {showResumePane ? (
                      <div className="flex min-h-0 flex-col rounded-[12px] border border-[var(--fx-border)] bg-[var(--fx-bg-soft)]">
                        <div className="border-b border-[color:color-mix(in_srgb,var(--fx-border)_72%,transparent)] p-[8px]">
                          <FxInput
                            placeholder={`Search ${visibleCandidates.length} Candidates`}
                            value={searchTerm}
                            onChange={(event) => setSearchTerm(event.target.value)}
                          />
                        </div>
                        <div className="min-h-0 flex-1 overflow-y-auto p-[8px]">
                          <div className="space-y-[8px]">
                            {visibleCandidates.map((candidate) => {
                              const isSelected = selectedCandidate?.id === candidate.id;

                              return (
                                <div
                                  key={candidate.id}
                                  className={cn(
                                    "flex w-full items-start justify-between gap-[8px] rounded-[10px] px-[12px] py-[12px] text-left transition-colors",
                                    isSelected ? "bg-[var(--fx-surface)] shadow-sm" : "bg-transparent hover:bg-[var(--fx-surface)]",
                                  )}
                                >
                                  <button
                                    type="button"
                                    onClick={() => setSelectedCandidateId(candidate.id)}
                                    className="flex min-w-0 flex-1 flex-col items-start text-left"
                                  >
                                    <span className="w-full truncate text-[13px] leading-[18px] font-medium text-[var(--fx-text)]">{candidate.name}</span>
                                    <span className="truncate text-[12px] leading-[16px] text-[var(--fx-text-muted)]">{candidate.experience ? `${candidate.experience} years` : "Experience not captured"}</span>
                                  </button>
                                  <div className="flex items-center gap-[6px]">
                                    <button
                                      type="button"
                                      onClick={() => handleHideCandidate(candidate.id)}
                                      className="inline-flex size-[20px] shrink-0 items-center justify-center rounded-[4px] text-[var(--fx-text-muted)] transition-colors hover:bg-[var(--fx-surface-hover)] hover:text-[var(--fx-danger)]"
                                      aria-label={`Remove ${candidate.name}`}
                                    >
                                      <X className="size-[14px]" />
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    ) : null}

                    {showResumePane ? (
                      <div className="flex min-h-0 items-stretch justify-center">
                        <div className="h-full w-px bg-[var(--fx-border)] opacity-90" />
                      </div>
                    ) : null}

                    <div className="flex min-h-0 flex-col gap-[8px]">
                      {selectedCandidate ? (
                        <FxCandidateCard
                          candidate={selectedCandidate}
                          variant="default"
                          layout="horizontal"
                          currency={salaryCurrency}
                        />
                      ) : null}

                      <div className={`flex min-h-0 flex-1 flex-col overflow-hidden rounded-[12px] border ${FX_COLORS.border} bg-[var(--fx-surface)]`}>
                        {selectedCandidate ? (
                          <>
                            <div className={`border-b ${FX_COLORS.border} px-[16px] py-[12px]`}>
                              <div className="flex items-center justify-between gap-[16px]">
                                <FxTabs
                                  tabs={[
                                    { value: "background", label: "Background" },
                                    { value: "resume", label: "Resume" },
                                  ]}
                                  active={activePreviewTab}
                                  onChange={setActivePreviewTab}
                                  variant="compact"
                                  showBorder={false}
                                />
                              </div>
                            </div>
                            <div className="min-h-0 flex-1 overflow-y-auto bg-[var(--fx-bg-soft)] p-[12px]">
                              {activePreviewTab === "background" ? (
                                <div className={`overflow-hidden rounded-[12px] border ${FX_COLORS.border} bg-[var(--fx-surface)]`}>
                                  <div className="space-y-[10px] p-[14px]">
                                    {selectedCandidateBackground.length ? (
                                      selectedCandidateBackground.map((item) => (
                                        <div key={`${selectedCandidate.id}-${item.label}`} className="space-y-[2px]">
                                          <p className="text-[12px] font-medium uppercase tracking-[0.04em] text-[var(--fx-text-muted)]">{item.label}</p>
                                          <p className="text-[13px] leading-[20px] text-[var(--fx-text)]">{item.value}</p>
                                        </div>
                                      ))
                                    ) : (
                                      <p className="text-[13px] leading-[20px] text-[var(--fx-text-muted)]">No prior background captured for this candidate yet.</p>
                                    )}
                                  </div>
                                </div>
                              ) : (
                                <div className={`overflow-hidden rounded-[12px] border ${FX_COLORS.border} bg-[var(--fx-surface)]`}>
                                  <div className="p-[14px]">
                                    <pre className="whitespace-pre-wrap break-words text-[14px] leading-[22px] text-[var(--fx-text)]">
                                      {selectedCandidateResumePreview}
                                    </pre>
                                  </div>
                                </div>
                              )}
                            </div>
                          </>
                        ) : null}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className={`mt-[16px] rounded-[14px] border ${FX_COLORS.border} bg-[var(--fx-surface)] p-[20px] text-center`}>
                    <p className={FX_TYPOGRAPHY.button}>No candidates found</p>
                    <p className={`${FX_TYPOGRAPHY.fieldHint} mt-[4px] text-[var(--fx-text-muted)]`}>
                      Try another name or switch to upload.
                    </p>
                  </div>
                )}
              </section>
            ) : null}
          </div>
        </SheetBody>
        <SheetFooter
          left={(
            <FxButton variant="outline" size="sm" onClick={() => onOpenChange(false)}>
              Close
            </FxButton>
          )}
          right={(
            <>
              <FxButton
                type="button"
                variant="destructiveOutline"
                size="sm"
                disabled={!selectedCandidate}
                onClick={() => {
                  if (!selectedCandidate) {
                    return;
                  }

                  handleHideCandidate(selectedCandidate.id);
                }}
              >
                Ignore
              </FxButton>
              <FxButton
                type="button"
                size="sm"
                className="min-w-[116px]"
                disabled={!selectedCandidate}
                onClick={() => {
                  if (!selectedCandidate) {
                    return;
                  }

                  onPickExistingCandidate(selectedCandidate);
                  handleHideCandidate(selectedCandidate.id);
                }}
              >
                Add to Job
              </FxButton>
            </>
          )}
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
  const salaryCurrency = job?.currency || "INR";
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
  const [addCandidatesInitialMode, setAddCandidatesInitialMode] = useState("upload");
  const [candidateSheetOpen, setCandidateSheetOpen] = useState(false);
  const [cvMatchSheetOpen, setCvMatchSheetOpen] = useState(false);
  const [preScreenResultOpen, setPreScreenResultOpen] = useState(false);
  const [scheduleInterviewOpen, setScheduleInterviewOpen] = useState(false);
  const [preScreenResultInitialStep, setPreScreenResultInitialStep] = useState("details");
  const [shareForReviewOpen, setShareForReviewOpen] = useState(false);
  const [shareForReviewCandidateIds, setShareForReviewCandidateIds] = useState([]);
  const [shareJobOpen, setShareJobOpen] = useState(false);
  const [sendToClientConfirmOpen, setSendToClientConfirmOpen] = useState(false);
  const [sendToClientDraftOpen, setSendToClientDraftOpen] = useState(false);
  const [sendToClientDraftMode, setSendToClientDraftMode] = useState("client");
  const [sendToClientCandidates, setSendToClientCandidates] = useState([]);
  const [emailScreeningOpen, setEmailScreeningOpen] = useState(false);
  const [emailScreeningCandidateIds, setEmailScreeningCandidateIds] = useState([]);
  const [manualScreeningOpen, setManualScreeningOpen] = useState(false);
  const [callPreviewOpen, setCallPreviewOpen] = useState(false);
  const [clientStatusSheetOpen, setClientStatusSheetOpen] = useState(false);
  const [clientStatusPendingStatus, setClientStatusPendingStatus] = useState(null);
  const [clientStatusSheetMode, setClientStatusSheetMode] = useState("status");
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [candidateToReject, setCandidateToReject] = useState(null);
  const [rejectReasonDraft, setRejectReasonDraft] = useState("");
  const [preScreenedFilter, setPreScreenedFilter] = useState("all");
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
  const shareUrl = useMemo(() => `https://www.evalityjobs.com/job/E791DB78CC38/${jobId}?ref=29541`, [jobId]);

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
    () => candidateRows.filter((candidate) => matchesPipelineStage(candidate, activeStage)),
    [candidateRows, activeStage],
  );
  const preScreenedFilterCounts = useMemo(() => {
    const stageCandidates = candidateRows.filter((candidate) => candidate.status === "screened");

    return {
      all: stageCandidates.length,
      ai_call: stageCandidates.filter((candidate) => getPreScreeningFilterKey(candidate) === "ai_call").length,
      manual: stageCandidates.filter((candidate) => getPreScreeningFilterKey(candidate) === "manual").length,
      email: stageCandidates.filter((candidate) => getPreScreeningFilterKey(candidate) === "email").length,
      no_fit_score: stageCandidates.filter((candidate) => candidate.matchScore == null || candidate.matchScore === "").length,
    };
  }, [candidateRows]);
/* - - - - - - - - - - - - - - - - */

  const filteredCandidates = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    const stageFilteredCandidates =
      activeStage === "screened" && preScreenedFilter !== "all"
          ? pipelineCandidates.filter((candidate) => {
              if (preScreenedFilter === "no_fit_score") {
                return candidate.matchScore == null || candidate.matchScore === "";
              }

              return getPreScreeningFilterKey(candidate) === preScreenedFilter;
            })
        : pipelineCandidates;

    if (!query) {
      return stageFilteredCandidates;
    }

    return stageFilteredCandidates.filter((candidate) => {
      const haystack = [candidate.name, candidate.email, candidate.phone].join(" ").toLowerCase();
      return haystack.includes(query);
    });
  }, [activeStage, pipelineCandidates, preScreenedFilter, searchTerm]);

  const sortedCandidates = useMemo(() => {
    if (!sortConfig) {
      if (activeStage === "screened") {
        return [...filteredCandidates].sort((left, right) => (Number(right.matchScore) || 0) - (Number(left.matchScore) || 0));
      }

      if (activeStage === "shortlisted") {
        return [...filteredCandidates].sort((left, right) => (Number(right.matchScore) || 0) - (Number(left.matchScore) || 0));
      }

      return filteredCandidates;
    }

    return [...filteredCandidates].sort((left, right) => {
      const leftValue = left[sortConfig.key];
      const rightValue = right[sortConfig.key];
      const numericSortKeys = new Set(["matchScore", "experience", "availabilityDays", "currentSalary", "expectedSalary", "noticePeriodSortValue"]);

      if (sortConfig.key === "interested") {
        const order = { yes: 0, no: 1, "not answered": 2, "": 2 };
        const leftRank = order[String(leftValue ?? "").trim().toLowerCase()] ?? 2;
        const rightRank = order[String(rightValue ?? "").trim().toLowerCase()] ?? 2;
        return sortConfig.direction === "asc" ? leftRank - rightRank : rightRank - leftRank;
      }

      if (sortConfig.key === "updatedAt") {
        const leftTime = new Date(leftValue ?? 0).getTime();
        const rightTime = new Date(rightValue ?? 0).getTime();
        return sortConfig.direction === "asc" ? leftTime - rightTime : rightTime - leftTime;
      }

      if (numericSortKeys.has(sortConfig.key)) {
        const leftNumber = leftValue == null ? null : Number(leftValue);
        const rightNumber = rightValue == null ? null : Number(rightValue);

        if (leftNumber == null && rightNumber == null) {
          return 0;
        }

        if (leftNumber == null) {
          return 1;
        }

        if (rightNumber == null) {
          return -1;
        }

        return sortConfig.direction === "asc" ? leftNumber - rightNumber : rightNumber - leftNumber;
      }

      return sortConfig.direction === "asc"
        ? String(leftValue ?? "").localeCompare(String(rightValue ?? ""))
        : String(rightValue ?? "").localeCompare(String(leftValue ?? ""));
    });
  }, [activeStage, filteredCandidates, sortConfig]);

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
  const emailScreeningCandidates = useMemo(
    () => candidateRows.filter((candidate) => emailScreeningCandidateIds.includes(candidate.id)),
    [candidateRows, emailScreeningCandidateIds],
  );
  const shareForReviewCandidates = useMemo(
    () => candidateRows.filter((candidate) => shareForReviewCandidateIds.includes(candidate.id)),
    [candidateRows, shareForReviewCandidateIds],
  );
  const manualScreeningCandidates = useMemo(
    () => sortedCandidates.filter((candidate) => candidate.status === "unscreened"),
    [sortedCandidates],
  );
  const selectedManualScreeningCandidateIndex = useMemo(
    () => manualScreeningCandidates.findIndex((candidate) => candidate.id === selectedCandidateId),
    [manualScreeningCandidates, selectedCandidateId],
  );
  const selectedCount = selectedVisibleCandidates.length;
  const selectedCountLabel = selectedCount === 1 ? "1 candidate selected" : `${selectedCount} candidates selected`;
  const bulkStage = activeStage;
  const activeFilterItems =
    activeStage === "screened" ? PRE_SCREENED_FILTERS : null;
  const activeFilterCounts =
    activeStage === "screened" ? preScreenedFilterCounts : null;
  const activeFilterValue = activeStage === "screened" ? preScreenedFilter : null;
  const activeFilterLabel = activeFilterItems?.find((item) => item.key === activeFilterValue)?.label ?? "Filter";
  const tableSortedColumnKey =
    sortConfig?.key === "name"
      ? "name"
      : sortConfig?.key === "matchScore"
        ? "matchScore"
        : sortConfig?.key === "experience"
          ? "experience"
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
/* - - - - - - - - - - - - - - - - */

  const handleSaveCandidateNote = useCallback(
    (candidate, nextNote) => {
      const trimmedNote = String(nextNote ?? "").trim();
      if (!candidate?.id || !job?.id) {
        return;
      }

      if (!trimmedNote) {
        return;
      }

      updateWorkspaceCandidate(candidate.id, (current) => {
        const currentNotesList = Array.isArray(current.jobContexts?.[job.id]?.notesList)
          ? current.jobContexts[job.id].notesList
          : [];
        const noteEntry = {
          id: `note-${Date.now()}`,
          author: "Renny",
          text: trimmedNote,
          timestamp: new Date().toISOString(),
        };

        return {
          ...current,
          notes: trimmedNote,
          jobContexts: {
            ...(current.jobContexts ?? {}),
            [job.id]: {
              ...(current.jobContexts?.[job.id] ?? {}),
              notes: trimmedNote,
              notesList: [...currentNotesList, noteEntry],
            },
          },
          updatedAt: new Date().toISOString(),
        };
      });

      showSuccess("Note saved", `${candidate.name}'s note was updated.`);
    },
    [job?.id, updateWorkspaceCandidate],
  );

  const handleOpenCandidatePool = useCallback(
    (candidate) => {
      showSuccess("Candidate Pool", `${candidate?.name || "Candidate"} will open in Candidate Pool later.`);
    },
    [],
  );
/* - - - - - - - - - - - - - - - - */

  const handleEditCandidateFromResult = useCallback(
    (candidate) => {
      setPreScreenResultOpen(false);
      handleOpenCandidateSheet(candidate);
    },
    [handleOpenCandidateSheet],
  );

  const handleDeleteCandidateNote = useCallback(
    (candidate, noteId) => {
      if (!candidate?.id || !job?.id || !noteId) {
        return;
      }

      updateWorkspaceCandidate(candidate.id, (current) => {
        const currentNotesList = Array.isArray(current.jobContexts?.[job.id]?.notesList)
          ? current.jobContexts[job.id].notesList
          : [];
        const nextNotesList = currentNotesList.filter((item) => item.id !== noteId);
        const latestNote = nextNotesList.length ? nextNotesList[nextNotesList.length - 1].text : "";

        return {
          ...current,
          notes: latestNote,
          jobContexts: {
            ...(current.jobContexts ?? {}),
            [job.id]: {
              ...(current.jobContexts?.[job.id] ?? {}),
              notes: latestNote,
              notesList: nextNotesList,
            },
          },
          updatedAt: new Date().toISOString(),
        };
      });

      showSuccess("Note removed", `${candidate.name}'s note was deleted.`);
    },
    [job?.id, updateWorkspaceCandidate],
  );
/* - - - - - - - - - - - - - - - - */

  const handleOpenCvMatchBreakdown = useCallback(
    (candidate) => {
      if (!candidate) {
        return;
      }

      if (!candidate.cvMatchBreakdown) {
        updateWorkspaceCandidate(candidate.id, (current) => ({
          ...current,
          cvMatchBreakdown: generateMockCvMatchBreakdown({
            ...current,
            matchScore: current.matchScore ?? candidate.matchScore,
          }),
        }));
      }

      setSelectedCandidateId(candidate.id);
      setCvMatchSheetOpen(true);
    },
    [updateWorkspaceCandidate],
  );
/* - - - - - - - - - - - - - - - - */

  const handleOpenPreScreenResult = useCallback(
    (candidate, initialStep = "details") => {
      if (!candidate) {
        return;
      }

      setPreScreenResultInitialStep(initialStep);
      setSelectedCandidateId(candidate.id);
      setPreScreenResultOpen(true);
      markCandidateViewed(candidate.id);
    },
    [markCandidateViewed],
  );
/* - - - - - - - - - - - - - - - - */

  const handleOpenShareForReview = useCallback(
    (candidates) => {
      const nextCandidates = Array.isArray(candidates) ? candidates.filter(Boolean) : [candidates].filter(Boolean);

      if (!nextCandidates.length) {
        return;
      }

      setSelectedCandidateId(nextCandidates[0].id);
      setShareForReviewCandidateIds(nextCandidates.map((candidate) => candidate.id));
      setShareForReviewOpen(true);
      nextCandidates.forEach((candidate) => markCandidateViewed(candidate.id));
    },
    [markCandidateViewed],
  );

  const handleRemoveShareForReviewCandidate = useCallback((candidate) => {
    if (!candidate?.id) {
      return;
    }

    setShareForReviewCandidateIds((currentIds) => {
      const nextIds = currentIds.filter((candidateId) => candidateId !== candidate.id);

      if (!nextIds.length) {
        setShareForReviewOpen(false);
      }

      return nextIds;
    });
  }, []);

  const handleSubmitShareForReview = useCallback(
    (candidatesToShare, payload = {}) => {
      if (!job?.id) {
        return;
      }

      const nextCandidates = Array.isArray(candidatesToShare) ? candidatesToShare.filter(Boolean) : [candidatesToShare].filter(Boolean);
      if (!nextCandidates.length) {
        return;
      }

      const sharedAt = new Date().toISOString();

      nextCandidates.forEach((candidate) => {
        updateWorkspaceCandidate(candidate.id, (current) => ({
          ...current,
          jobContexts: {
            ...(current.jobContexts ?? {}),
            [job.id]: {
              ...(current.jobContexts?.[job.id] ?? {}),
              reviewShareRecipients: payload.recipients ?? current.jobContexts?.[job.id]?.reviewShareRecipients ?? "",
              reviewShareMessage: payload.message ?? current.jobContexts?.[job.id]?.reviewShareMessage ?? "",
              reviewShareMode: payload.shareMode ?? current.jobContexts?.[job.id]?.reviewShareMode ?? "cv_only",
              reviewShareIncludes: {
                phone: Boolean(payload.includePhone),
                email: Boolean(payload.includeEmail),
                compensation: Boolean(payload.includeCompensation),
                screening: payload.includeScreening !== false,
              },
              reviewSharedAt: sharedAt,
              reviewShareCount: Math.max(1, Number(current.jobContexts?.[job.id]?.reviewShareCount || 0) + 1),
            },
          },
        }));
      });

      setShareForReviewOpen(false);
      setShareForReviewCandidateIds([]);
      clearSelectedCandidates();
      showSuccess(
        "Review shared",
        nextCandidates.length === 1
          ? `${nextCandidates[0]?.name || "Candidate"} was shared for review.`
          : `${nextCandidates.length} candidates were shared for review.`,
      );
    },
    [clearSelectedCandidates, job?.id, updateWorkspaceCandidate],
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

  const handleOpenRejectDialog = useCallback((candidate) => {
    if (!candidate) {
      return;
    }

    setCandidateToReject(candidate);
    setRejectReasonDraft(candidate.rejectionReason && candidate.rejectionReason !== "Rejected for this role" ? candidate.rejectionReason : "");
    setRejectDialogOpen(true);
  }, []);

  const handleCloseRejectDialog = useCallback((nextOpen) => {
    setRejectDialogOpen(nextOpen);

    if (!nextOpen) {
      setCandidateToReject(null);
      setRejectReasonDraft("");
    }
  }, []);

  const handleRejectCandidate = useCallback(
    (candidate, rejectionReason = "") => {
      if (!candidate) {
        return;
      }

      const resolvedReason = String(rejectionReason ?? "").trim() || "Rejected for this role";

      updateWorkspaceCandidate(
        candidate.id,
        (current) => ({
          ...current,
          status: "rejected",
          rejectionReason: resolvedReason,
        }),
        { fromStatus: candidate.status, toStatus: "rejected" },
      );
      showSuccess("Candidate rejected", `${candidate.name} was moved to the rejected state.`);
    },
    [updateWorkspaceCandidate],
  );

  const handleConfirmRejectCandidate = useCallback(() => {
    if (!candidateToReject) {
      return;
    }

    handleRejectCandidate(candidateToReject, rejectReasonDraft);
    handleCloseRejectDialog(false);
  }, [candidateToReject, handleCloseRejectDialog, handleRejectCandidate, rejectReasonDraft]);

  const handleRejectCandidateFromManualScreening = useCallback(
    (candidate) => {
      if (!candidate) {
        return;
      }

      const nextCandidate =
        selectedManualScreeningCandidateIndex >= 0
          ? (manualScreeningCandidates[selectedManualScreeningCandidateIndex + 1] ?? manualScreeningCandidates[selectedManualScreeningCandidateIndex - 1] ?? null)
          : null;

      handleRejectCandidate(candidate);

      if (nextCandidate) {
        setSelectedCandidateId(nextCandidate.id);
        markCandidateViewed(nextCandidate.id);
      } else {
        setManualScreeningOpen(false);
        setSelectedCandidateId(null);
      }
    },
    [handleRejectCandidate, manualScreeningCandidates, markCandidateViewed, selectedManualScreeningCandidateIndex],
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

  const handleSetUnscreenedFilterStatus = useCallback(
    (candidate, nextFilterStatus) => {
      if (!candidate || !job?.id) {
        return;
      }

      updateWorkspaceCandidate(candidate.id, (current) => ({
        ...current,
        unscreenedFilterStatus: nextFilterStatus,
        jobContexts: {
          ...(current.jobContexts ?? {}),
          [job.id]: {
            ...(current.jobContexts?.[job.id] ?? {}),
            unscreenedFilterStatus: nextFilterStatus,
          },
        },
      }));
    },
    [job?.id, updateWorkspaceCandidate],
  );
/* - - - - - - - - - - - - - - - - */

  const handleUpdateCandidateField = useCallback(
    (candidateId, field, value) => {
      if (!candidateId) {
        return;
      }

      if (field === "email" || field === "phone") {
        updateWorkspaceCandidate(candidateId, (current) => ({
          ...current,
          [field]: String(value ?? "").trim() || "",
        }));
        return;
      }

      if (field === "currentSalary" || field === "expectedSalary") {
        const parsedValue = parseCurrencyInputValue(value);

        updateWorkspaceCandidate(candidateId, (current) => ({
          ...current,
          [field]: parsedValue ?? null,
        }));
      }
    },
    [updateWorkspaceCandidate],
  );
/* - - - - - - - - - - - - - - - - */

  const handleOpenEmailScreening = useCallback(
    (candidates) => {
      const nextCandidates = Array.isArray(candidates) ? candidates.filter(Boolean) : [candidates].filter(Boolean);
      if (!nextCandidates.length) {
        return;
      }

      setEmailScreeningCandidateIds(nextCandidates.map((candidate) => candidate.id));
      setSelectedCandidateId(nextCandidates[0].id);
      setEmailScreeningOpen(true);
      nextCandidates.forEach((candidate) => {
        markCandidateViewed(candidate.id);
        handleSetCandidateScreeningMode(candidate, "ai");
      });
    },
    [handleSetCandidateScreeningMode, markCandidateViewed],
  );
/* - - - - - - - - - - - - - - - - */

  const handleRemoveCandidateFromEmailScreening = useCallback(
    (candidateId) => {
      setEmailScreeningCandidateIds((current) => {
        const nextIds = current.filter((id) => id !== candidateId);

        if (!nextIds.length) {
          setEmailScreeningOpen(false);
          return [];
        }

        if (selectedCandidateId === candidateId) {
          setSelectedCandidateId(nextIds[0]);
        }

        return nextIds;
      });
    },
    [selectedCandidateId],
  );
/* - - - - - - - - - - - - - - - - */

  const handleOpenManualScreening = useCallback(
    (candidate) => {
      if (!candidate) {
        return;
      }

      setSelectedCandidateId(candidate.id);
      setManualScreeningOpen(true);
      markCandidateViewed(candidate.id);
      handleSetCandidateScreeningMode(candidate, "manual");
    },
    [handleSetCandidateScreeningMode, markCandidateViewed],
  );
/* - - - - - - - - - - - - - - - - */

  const handlePreviousManualScreeningCandidate = useCallback(() => {
    if (selectedManualScreeningCandidateIndex <= 0) {
      return;
    }

    const previousCandidate = manualScreeningCandidates[selectedManualScreeningCandidateIndex - 1];
    if (!previousCandidate) {
      return;
    }

    setSelectedCandidateId(previousCandidate.id);
    markCandidateViewed(previousCandidate.id);
  }, [manualScreeningCandidates, markCandidateViewed, selectedManualScreeningCandidateIndex]);

  const handleNextManualScreeningCandidate = useCallback(() => {
    if (selectedManualScreeningCandidateIndex < 0 || selectedManualScreeningCandidateIndex >= manualScreeningCandidates.length - 1) {
      return;
    }

    const nextCandidate = manualScreeningCandidates[selectedManualScreeningCandidateIndex + 1];
    if (!nextCandidate) {
      return;
    }

    setSelectedCandidateId(nextCandidate.id);
    markCandidateViewed(nextCandidate.id);
  }, [manualScreeningCandidates, markCandidateViewed, selectedManualScreeningCandidateIndex]);
/* - - - - - - - - - - - - - - - - */

  function clearSelectedCandidates() {
    setSelectedCandidateIds([]);
  }
/* - - - - - - - - - - - - - - - - */

  const handleStartEmailScreening = useCallback(
    (candidates, payloadById = {}) => {
      const nextCandidates = Array.isArray(candidates) ? candidates.filter(Boolean) : [candidates].filter(Boolean);
      if (!nextCandidates.length || !job?.id) {
        return;
      }

      const startedAt = new Date().toISOString();

      nextCandidates.forEach((candidate) => {
        const payload = payloadById?.[candidate.id] ?? {};
        updateWorkspaceCandidate(candidate.id, (current) => ({
          ...current,
          email: payload.email || current.email,
          screeningOutcome: "In Progress",
          jobContexts: {
            ...(current.jobContexts ?? {}),
            [job.id]: {
              ...(current.jobContexts?.[job.id] ?? {}),
              screeningModeOverride: "ai",
              unscreenedFilterStatus: "in_progress",
              emailScreeningMessage: payload.message ?? current.jobContexts?.[job.id]?.emailScreeningMessage ?? "",
              emailScreeningStartedAt: startedAt,
              emailScreeningAttemptCount: Math.max(1, Number(current.jobContexts?.[job.id]?.emailScreeningAttemptCount || 0) + 1),
            },
          },
        }));

        handleSetUnscreenedFilterStatus(candidate, "in_progress");
      });

      setEmailScreeningOpen(false);
      setEmailScreeningCandidateIds([]);
      clearSelectedCandidates();
      showSuccess(
        "Email sent",
        nextCandidates.length === 1
          ? `Email sent to ${nextCandidates[0].name}.`
          : `Emails sent to ${nextCandidates.length} candidates.`,
      );
    },
    [clearSelectedCandidates, handleSetUnscreenedFilterStatus, job?.id, updateWorkspaceCandidate],
  );
/* - - - - - - - - - - - - - - - - */

  const handleSubmitManualScreening = useCallback(
    (candidate, formState) => {
      if (!candidate || !job?.id) {
        return;
      }

      const availabilityMode = formState?.availabilityMode === "date" ? "date" : "days";
      const availabilityDays = String(formState?.availabilityDays ?? "").trim();
      const availabilityDate = String(formState?.availabilityDate ?? "").trim();
      const noticePeriod = availabilityMode === "date" ? (availabilityDate ? formatDate(availabilityDate) : "") : (availabilityDays ? `${availabilityDays} days` : "");
      const commuteComfortable = String(formState?.commuteComfortable ?? "").trim() || "Yes";
      const fitScore = String(formState?.fitScore ?? "").trim();
      const currentSalary = String(formState?.currentSalary ?? "").trim();
      const expectedSalary = String(formState?.expectedSalary ?? "").trim();
      const notes = String(formState?.notes ?? "").trim();
      const interested = String(formState?.interested ?? "").trim() || "Yes";
      const normalizedAnswers = [
        {
          id: "interest",
          label: "Interest",
          question: "Is the candidate interested in the role?",
          answer: interested,
        },
        {
          id: "availability",
          label: "Availability",
          question: "By when can the candidate join?",
          answer: availabilityMode === "date" ? (availabilityDate || "—") : (availabilityDays ? `${availabilityDays} days` : "—"),
        },
        ...(job?.workplaceType === "On-site" || job?.workplaceType === "Hybrid"
          ? [{
              id: "commute",
              label: "Commute",
              question:
                job?.workplaceType === "Hybrid"
                  ? `The job role is hybrid and based out of ${job?.location || "the listed location"}. Is the candidate comfortable commuting when required?`
                  : `The job role is on-site based out of ${job?.location || "the listed location"}. Is the candidate comfortable commuting?`,
              answer: commuteComfortable,
            }]
          : []),
        {
          id: "current_salary",
          label: "Current Salary",
          question: "Current Salary",
          answer: currentSalary || "—",
        },
        {
          id: "expected_salary",
          label: "Salary Expectation",
          question: "Salary Expectation",
          answer: expectedSalary || "—",
        },
      ];

      updateWorkspaceCandidate(
        candidate.id,
        (current) => ({
          ...current,
          status: "screened",
          interested,
          availabilityDays:
            availabilityMode === "days"
              ? (availabilityDays ? Number.parseInt(availabilityDays, 10) || current.availabilityDays || null : current.availabilityDays ?? null)
              : current.availabilityDays ?? null,
          matchScore: fitScore ? Number.parseInt(fitScore, 10) || current.matchScore || null : current.matchScore ?? null,
          currentSalary: currentSalary ? Number.parseInt(currentSalary, 10) || null : current.currentSalary ?? null,
          expectedSalary: expectedSalary ? Number.parseInt(expectedSalary, 10) || null : current.expectedSalary ?? null,
          screeningOutcome: "Passed",
          screeningAnswers: normalizedAnswers,
          notes: notes || current.notes || "",
          jobContexts: {
            ...(current.jobContexts ?? {}),
            [job.id]: {
              ...(current.jobContexts?.[job.id] ?? {}),
              answers: normalizedAnswers,
              screeningModeOverride: "manual",
              unscreenedFilterStatus: "processing",
              noticePeriod,
              availabilityDate: availabilityMode === "date" ? availabilityDate : "",
              availabilityMode,
              commuteComfortable: job?.workplaceType === "On-site" || job?.workplaceType === "Hybrid" ? commuteComfortable : "",
              manualScreeningNotes: notes,
              manualScreeningCompletedAt: new Date().toISOString(),
              notes: notes || current.jobContexts?.[job.id]?.notes || "",
            },
          },
        }),
        { fromStatus: candidate.status, toStatus: "screened" },
      );

      showSuccess("Pre-screening submitted", `${candidate.name} moved to Pre-Screened.`);

      const nextCandidate =
        selectedManualScreeningCandidateIndex >= 0
          ? (manualScreeningCandidates[selectedManualScreeningCandidateIndex + 1] ?? manualScreeningCandidates[selectedManualScreeningCandidateIndex - 1] ?? null)
          : null;

      if (nextCandidate) {
        setSelectedCandidateId(nextCandidate.id);
        markCandidateViewed(nextCandidate.id);
      } else {
        setManualScreeningOpen(false);
        setSelectedCandidateId(null);
      }
    },
    [job, job?.id, manualScreeningCandidates, markCandidateViewed, selectedManualScreeningCandidateIndex, updateWorkspaceCandidate],
  );

  const handleFailEmailScreening = useCallback(
    (candidate) => {
      if (!candidate) {
        return;
      }

      updateWorkspaceCandidate(candidate.id, (current) => ({
        ...current,
        screeningOutcome: "Failed",
      }));
      handleSetUnscreenedFilterStatus(candidate, "failed");
      showSuccess("Candidate updated", `${candidate.name} moved to Failed.`);
    },
    [handleSetUnscreenedFilterStatus, updateWorkspaceCandidate],
  );

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
/* - - - - - - - - - - - - - - - - */

  const handleShortlistCandidate = useCallback(
    (candidate) => {
      if (!candidate) {
        return;
      }

      handleMoveCandidateToStage(candidate, "shortlisted", "Shortlisted");
      setPreScreenResultOpen(false);
    },
    [handleMoveCandidateToStage],
  );
/* - - - - - - - - - - - - - - - - */

  const handleRejectCandidateFromResults = useCallback(
    (candidate) => {
      if (!candidate) {
        return;
      }

      handleRejectCandidate(candidate);
      setPreScreenResultOpen(false);
    },
    [handleRejectCandidate],
  );

  const handleCommitClientStatus = useCallback(
    (candidate, nextStatus = null, recruiterComment = "") => {
      if (!candidate) {
        return;
      }

      const resolvedStatus = CLIENT_STATUS_OPTIONS.includes(nextStatus)
        ? nextStatus
        : CLIENT_STATUS_OPTIONS[0];
      const trimmedComment = String(recruiterComment ?? "").trim();
      const commentEntry = trimmedComment
        ? {
            id: `client-comment-${Date.now()}`,
            author: "Renny",
            text: trimmedComment,
            timestamp: new Date().toISOString(),
          }
        : null;
      const now = new Date().toISOString();
      const historyEntries = [
        {
          id: `client-status-${Date.now()}`,
          type: "status",
          status: resolvedStatus,
          author: "Renny",
          timestamp: now,
        },
        ...(commentEntry
          ? [{
              id: `client-comment-${Date.now()}`,
              type: "note",
              author: "Renny",
              text: trimmedComment,
              timestamp: now,
            }]
          : []),
      ];

      updateWorkspaceCandidate(
        candidate.id,
        (current) => ({
          ...current,
          clientStatus: resolvedStatus,
          updatedAt: now,
          activityUpdatedAt: now,
          jobContexts: {
            ...(current.jobContexts ?? {}),
            [job.id]: {
              ...(current.jobContexts?.[job.id] ?? {}),
              clientStatus: resolvedStatus,
              clientActivity: [
                ...(Array.isArray(current.jobContexts?.[job.id]?.clientActivity) ? current.jobContexts[job.id].clientActivity : []),
                ...historyEntries,
              ],
              clientComments: commentEntry
                ? [...(Array.isArray(current.jobContexts?.[job.id]?.clientComments) ? current.jobContexts[job.id].clientComments : []), commentEntry]
                : (Array.isArray(current.jobContexts?.[job.id]?.clientComments) ? current.jobContexts[job.id].clientComments : []),
            },
          },
        }),
        { fromStatus: candidate.status, toStatus: candidate.status },
      );

      setClientStatusSheetOpen(false);
      setClientStatusPendingStatus(null);

      showSuccess("Client status updated", `${candidate.name} marked as ${resolvedStatus}.`);
    },
    [job?.id, updateWorkspaceCandidate],
  );
/* - - - - - - - - - - - - - - - - */

  const handleOpenClientStatusSheet = useCallback((candidate, nextStatus = null) => {
    if (!candidate) {
      return;
    }

    setSelectedCandidateId(candidate.id);
    setClientStatusPendingStatus(nextStatus || null);
    setClientStatusSheetMode("status");
    setClientStatusSheetOpen(true);
  }, []);

  const handleOpenClientActivitySheet = useCallback((candidate) => {
    if (!candidate) {
      return;
    }

    setSelectedCandidateId(candidate.id);
    setClientStatusPendingStatus(null);
    setClientStatusSheetMode("activity");
    setClientStatusSheetOpen(true);
  }, []);

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
      handleOpenEmailScreening(bulkSelectedVisibleCandidates.filter((candidate) => candidate.status === "unscreened"));
    },
    shareForReview: () => {
      handleOpenShareForReview(bulkSelectedVisibleCandidates);
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
    dropCandidate: () => {
      bulkSelectedVisibleCandidates.forEach((candidate) => {
        updateSelectedCandidateStatus(
          candidate,
          (current) => ({
            ...current,
            status: "rejected",
            clientStatus: "Candidate Dropped Off",
            rejectionReason: current.rejectionReason || "Candidate dropped off",
            jobContexts: {
              ...(current.jobContexts ?? {}),
              [job.id]: {
                ...(current.jobContexts?.[job.id] ?? {}),
                clientStatus: "Candidate Dropped Off",
              },
            },
          }),
          { fromStatus: candidate.status, toStatus: "rejected" },
        );
      });
      showSuccess("Bulk action applied", `${bulkSelectedVisibleCandidates.length} candidate${bulkSelectedVisibleCandidates.length === 1 ? "" : "s"} dropped.`);
      clearSelectedCandidates();
    },
    onHold: () => {
      bulkSelectedVisibleCandidates.forEach((candidate) => {
        updateSelectedCandidateStatus(
          candidate,
          (current) => ({
            ...current,
            clientStatus: "On Hold",
            jobContexts: {
              ...(current.jobContexts ?? {}),
              [job.id]: {
                ...(current.jobContexts?.[job.id] ?? {}),
                clientStatus: "On Hold",
              },
            },
          }),
          { fromStatus: null, toStatus: null },
        );
      });
      showSuccess("Bulk action applied", `${bulkSelectedVisibleCandidates.length} candidate${bulkSelectedVisibleCandidates.length === 1 ? "" : "s"} moved to On Hold.`);
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
/* - - - - - - - - - - - - - - - - */

  const handleDownloadResumesForCandidates = useCallback((candidates) => {
    const nextCandidates = Array.isArray(candidates) ? candidates.filter(Boolean) : [];

    if (!nextCandidates.length) {
      return;
    }

    const blob = new Blob(
      [
        nextCandidates
          .map(
            (candidate) =>
              [
                candidate.name,
                candidate.jobTitle || job?.title || "",
                candidate.currentRole || "",
                candidate.currentCompany || "",
                candidate.email || "—",
                candidate.phone || "—",
                `Fit Score: ${candidate.matchScore != null ? `${candidate.matchScore}%` : "—"}`,
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
    link.download = `${job?.id || "shortlisted"}-resumes.txt`;
    link.click();
    URL.revokeObjectURL(url);
  }, [job?.id, job?.title]);
/* - - - - - - - - - - - - - - - - */

  const handleCopyText = useCallback((text, label) => {
    const nextText = String(text ?? "").trim();

    if (!nextText || typeof navigator === "undefined" || !navigator.clipboard?.writeText) {
      return;
    }

    navigator.clipboard.writeText(nextText);
    showSuccess(`${label} copied`);
  }, []);
/* - - - - - - - - - - - - - - - - */

  const handleOpenSendToClientConfirm = useCallback((candidates) => {
    const nextCandidates = (Array.isArray(candidates) ? candidates : [candidates]).filter(Boolean);

    if (!nextCandidates.length) {
      return;
    }

    setSendToClientCandidates(nextCandidates);
    setSendToClientConfirmOpen(true);
  }, []);
/* - - - - - - - - - - - - - - - - */

  const handleGenerateSendToClientDraft = useCallback((candidates, mode = "client") => {
    const nextCandidates = (Array.isArray(candidates) ? candidates : [candidates]).filter(Boolean);

    if (!nextCandidates.length) {
      return;
    }

    setSendToClientCandidates(nextCandidates);
    setSendToClientDraftMode(mode);
    setSendToClientConfirmOpen(false);
    setSendToClientDraftOpen(true);
    showSuccess("Email draft generated for client review.");
  }, []);
/* - - - - - - - - - - - - - - - - */

  const handleMarkCandidatesSentToClient = useCallback((candidates) => {
    const nextCandidates = (Array.isArray(candidates) ? candidates : [candidates]).filter(Boolean);

    if (!nextCandidates.length) {
      return;
    }

    nextCandidates.forEach((candidate) => {
      updateWorkspaceCandidate(
        candidate.id,
        (current) => ({
          ...current,
          status: "shared",
          clientStatus: "Feedback Awaited",
          updatedAt: new Date().toISOString(),
          jobContexts: {
            ...(current.jobContexts ?? {}),
            [job.id]: {
              ...(current.jobContexts?.[job.id] ?? {}),
              clientStatus: "Feedback Awaited",
            },
          },
        }),
        { fromStatus: candidate.status, toStatus: "shared" },
      );
    });

    setSendToClientConfirmOpen(false);
    setSendToClientDraftOpen(false);
    setSendToClientCandidates([]);
    clearSelectedCandidates();
    showSuccess("Candidates sent to client", `${nextCandidates.length} candidate${nextCandidates.length === 1 ? "" : "s"} moved to Sent to Client.`);
  }, [clearSelectedCandidates, updateWorkspaceCandidate]);
/* - - - - - - - - - - - - - - - - */

  const handleScheduleCandidate = useCallback(
    (candidate, slot = null) => {
      if (!candidate || !job?.id) {
        return;
      }

      if (!slot) {
        setSelectedCandidateId(candidate.id);
        setScheduleInterviewOpen(true);
        markCandidateViewed(candidate.id);
        return;
      }

      updateWorkspaceCandidate(
        candidate.id,
        (current) => ({
          ...current,
          status: "shared",
          clientStatus: "Interviewing",
          updatedAt: new Date().toISOString(),
          jobContexts: {
            ...(current.jobContexts ?? {}),
            [job.id]: {
              ...(current.jobContexts?.[job.id] ?? {}),
              clientStatus: "Interviewing",
              interviewSchedule: {
                date: slot.date instanceof Date ? slot.date.toISOString() : slot.date,
                fromTime: slot.fromTime,
                toTime: slot.toTime,
                notes: slot.notes || "",
                timezone: slot.timezone,
                scheduledAt: new Date().toISOString(),
              },
            },
          },
        }),
        { fromStatus: candidate.status, toStatus: "shared" },
      );

      setScheduleInterviewOpen(false);
      showSuccess("Interview scheduled", `${candidate.name} moved to Interviewing.`);
    },
    [job?.id, markCandidateViewed, updateWorkspaceCandidate],
  );
/* - - - - - - - - - - - - - - - - */

  const handleDropCandidate = useCallback(
    (candidate) => {
      if (!candidate || !job?.id) {
        return;
      }

      updateWorkspaceCandidate(
        candidate.id,
        (current) => ({
          ...current,
          status: "rejected",
          clientStatus: "Candidate Dropped Off",
          rejectionReason: current.rejectionReason || "Candidate dropped off",
          updatedAt: new Date().toISOString(),
          jobContexts: {
            ...(current.jobContexts ?? {}),
            [job.id]: {
              ...(current.jobContexts?.[job.id] ?? {}),
              clientStatus: "Candidate Dropped Off",
            },
          },
        }),
        { fromStatus: candidate.status, toStatus: "rejected" },
      );

      showSuccess("Candidate dropped", `${candidate.name} moved to Dropped.`);
    },
    [job?.id, updateWorkspaceCandidate],
  );
/* - - - - - - - - - - - - - - - - */

  const handleDownloadZipForCandidates = useCallback((candidates) => {
    const nextCandidates = Array.isArray(candidates) ? candidates.filter(Boolean) : [];

    if (!nextCandidates.length) {
      return;
    }

    showSuccess("ZIP package prepared", "Demo package ready for shortlisted profiles.");
  }, []);

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
    const attachedSourceIds = new Set(candidateRows.map((candidate) => candidate.sourceCandidateId).filter(Boolean));

    return allCandidates
      .filter((candidate) => candidate.jobId !== job?.id && !attachedIds.has(candidate.id) && !attachedSourceIds.has(candidate.id))
      .map((candidate) => normalizeCandidate(candidate, findStoredJob(candidate.jobId)))
      .sort((left, right) => (right.matchScore ?? 0) - (left.matchScore ?? 0))
      .slice(0, 6);
  }, [candidateRows, candidateSnapshot, job?.id]);

  const handleAddCandidates = useCallback(() => {
    setAddCandidatesInitialMode("upload");
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
        sourceCandidateId: baseCandidate?.id ?? null,
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

  function handleShareJob() {
    setShareJobOpen(true);
  }
/* - - - - - - - - - - - - - - - - */

  async function handleCopyJobLink() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      showSuccess("Job link copied", "Job link copied");
    } catch {
      window.prompt("Copy job link", shareUrl);
    }
  }
/* - - - - - - - - - - - - - - - - */

  async function handleCopyChannelJobLink(channel) {
    const channelUrl = `${shareUrl}&src=${channel?.src || "1"}`;

    try {
      await navigator.clipboard.writeText(channelUrl);
      showSuccess(`${channel?.label || "Channel"} link copied`);
    } catch {
      window.prompt("Copy job link", channelUrl);
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
      const emailStartedAt = candidate.jobContext?.emailScreeningStartedAt || "";
      const emailAttemptCount = Math.max(0, Number(candidate.jobContext?.emailScreeningAttemptCount || 0));
      const hasEmailSent = (Boolean(emailStartedAt) || emailAttemptCount > 0) && candidate.unscreenedFilterStatus !== "failed";

      return (
        <>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="inline-flex">
                <button
                  type="button"
                  className={cn(
                    "relative",
                    className,
                    hasEmailSent
                      ? "bg-[color-mix(in_srgb,var(--fx-success)_10%,var(--fx-surface-raised)_90%)] text-[var(--fx-success)] hover:bg-[color-mix(in_srgb,var(--fx-success)_16%,var(--fx-surface-raised)_84%)] hover:text-[var(--fx-success)]"
                      : null,
                  )}
                  aria-label={`Start email pre-screening for ${candidate.name}`}
                  onClick={() => {
                    handleOpenEmailScreening([candidate]);
                  }}
                >
                  <Mail className="size-[14px]" />
                  {hasEmailSent && emailAttemptCount > 0 ? (
                    <span className="absolute -right-[5px] -top-[5px] inline-flex min-w-[16px] items-center justify-center rounded-full bg-[var(--fx-success)] px-[4px] text-[10px] leading-[14px] font-semibold text-white">
                      {emailAttemptCount}
                    </span>
                  ) : null}
                </button>
              </span>
            </TooltipTrigger>
            <TooltipContent side="bottom" sideOffset={8}>
              {hasEmailSent
                ? `Email sent${emailAttemptCount > 0 ? ` ${emailAttemptCount} ${emailAttemptCount === 1 ? "time" : "times"}` : ""}`
                : "Email Pre-Screening"}
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="inline-flex">
                <button
                  type="button"
                  className={className}
                  aria-label={`Start manual screening for ${candidate.name}`}
                  onClick={() => {
                    handleOpenManualScreening(candidate);
                  }}
                >
                  <Users className="size-[14px]" />
                </button>
              </span>
            </TooltipTrigger>
            <TooltipContent side="bottom" sideOffset={8}>Manual Screen</TooltipContent>
          </Tooltip>
        </>
      );
    }

    if (activeStage === "screened") {
      const reviewShareCount = Math.max(0, Number(candidate.jobContext?.reviewShareCount || 0));
      const hasBeenSharedForReview = reviewShareCount > 0;

      return (
        <>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="inline-flex">
                <button
                  type="button"
                  className={cn(
                    "relative",
                    className,
                    hasBeenSharedForReview
                      ? "bg-[color-mix(in_srgb,var(--fx-success)_10%,var(--fx-surface-raised)_90%)] text-[var(--fx-success)] hover:bg-[color-mix(in_srgb,var(--fx-success)_16%,var(--fx-surface-raised)_84%)] hover:text-[var(--fx-success)]"
                      : null,
                  )}
                  aria-label={`Share ${candidate.name} for review`}
                  onClick={() => handleOpenShareForReview(candidate)}
                >
                  <Share2 className="size-[14px]" />
                  {hasBeenSharedForReview ? (
                    <span className="absolute -right-[5px] -top-[5px] inline-flex min-w-[16px] items-center justify-center rounded-full bg-[var(--fx-success)] px-[4px] text-[10px] leading-[14px] font-semibold text-white">
                      {reviewShareCount}
                    </span>
                  ) : null}
                </button>
              </span>
            </TooltipTrigger>
            <TooltipContent side="bottom" sideOffset={8}>
              {hasBeenSharedForReview ? `Shared ${reviewShareCount} ${reviewShareCount === 1 ? "time" : "times"}` : "Share for Review"}
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="inline-flex">
                <button type="button" className={className} aria-label={`Shortlist ${candidate.name}`} onClick={() => handleMoveCandidateToStage(candidate, "shortlisted", "Shortlisted")}>
                  <Check className="size-[14px]" />
                </button>
              </span>
            </TooltipTrigger>
            <TooltipContent side="bottom" sideOffset={8}>Shortlist</TooltipContent>
          </Tooltip>
        </>
      );
    }

    if (activeStage === "shortlisted") {
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="inline-flex">
              <button type="button" className={className} aria-label={`Schedule ${candidate.name}`} onClick={() => handleScheduleCandidate(candidate)}>
                <CalendarDays className="size-[14px]" />
              </button>
            </span>
          </TooltipTrigger>
          <TooltipContent side="bottom" sideOffset={8}>Schedule</TooltipContent>
        </Tooltip>
      );
    }

    if (isClientProgressStage(activeStage)) {
      return null;
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

  function getClientStatusToneClasses(status) {
    if (status === "Feedback Awaited") {
      return "border-[color-mix(in_srgb,var(--fx-primary)_30%,var(--fx-border)_70%)] bg-[color-mix(in_srgb,var(--fx-primary)_10%,var(--fx-surface)_90%)] text-[var(--fx-primary)]";
    }

    if (status === "Shortlisted") {
      return "border-[color-mix(in_srgb,var(--fx-success)_28%,var(--fx-border)_72%)] bg-[color-mix(in_srgb,var(--fx-success)_10%,var(--fx-surface)_90%)] text-[var(--fx-success)]";
    }

    if (status === "Interviewing") {
      return "border-[color-mix(in_srgb,var(--fx-warning)_30%,var(--fx-border)_70%)] bg-[color-mix(in_srgb,var(--fx-warning)_10%,var(--fx-surface)_90%)] text-[var(--fx-warning)]";
    }

    if (status === "Offered") {
      return "border-[color-mix(in_srgb,var(--fx-warning)_44%,var(--fx-border)_56%)] bg-[color-mix(in_srgb,var(--fx-warning)_14%,var(--fx-surface)_86%)] text-[var(--fx-warning)]";
    }

    if (status === "Joined") {
      return "border-[color-mix(in_srgb,var(--fx-success)_36%,var(--fx-border)_64%)] bg-[color-mix(in_srgb,var(--fx-success)_14%,var(--fx-surface)_86%)] text-[var(--fx-success)]";
    }

    if (status === "On Hold") {
      return "border-[color-mix(in_srgb,var(--fx-text-muted)_26%,var(--fx-border)_74%)] bg-[color-mix(in_srgb,var(--fx-text-muted)_10%,var(--fx-surface)_90%)] text-[var(--fx-text-muted)]";
    }

    if (status === "Rejected") {
      return "border-[color-mix(in_srgb,var(--fx-danger)_34%,var(--fx-border)_66%)] bg-[color-mix(in_srgb,var(--fx-danger)_10%,var(--fx-surface)_90%)] text-[var(--fx-danger)]";
    }

    if (status === "Candidate Dropped Off") {
      return "border-[color-mix(in_srgb,var(--fx-danger)_20%,var(--fx-border)_80%)] bg-[color-mix(in_srgb,var(--fx-danger)_8%,var(--fx-surface)_92%)] text-[color-mix(in_srgb,var(--fx-danger)_84%,var(--fx-text-muted)_16%)]";
    }

    return "border-[var(--fx-border)] bg-[var(--fx-surface)] text-[var(--fx-text)]";
  }

  function getClientStatusDotClasses(status) {
    if (status === "Feedback Awaited") {
      return "bg-[var(--fx-primary)]";
    }

    if (status === "Shortlisted" || status === "Joined") {
      return "bg-[var(--fx-success)]";
    }

    if (status === "Interviewing") {
      return "bg-[var(--fx-warning)]";
    }

    if (status === "Offered") {
      return "bg-[var(--fx-warning)]";
    }

    if (status === "On Hold") {
      return "bg-[var(--fx-text-muted)]";
    }

    if (status === "Rejected") {
      return "bg-[var(--fx-danger)]";
    }

    if (status === "Candidate Dropped Off") {
      return "bg-[color-mix(in_srgb,var(--fx-danger)_70%,var(--fx-text-muted)_30%)]";
    }

    return "bg-[var(--fx-border)]";
  }

  function renderClientStatusChip(status) {
    return <span className={cn("inline-flex min-w-[96px] items-center justify-center rounded-full border px-[10px] py-[4px] text-[12px] leading-[18px] font-medium", getClientStatusToneClasses(status))}>{status}</span>;
  }
/* - - - - - - - - - - - - - - - - */

  function renderClientStatusDot(status) {
    return <span className={cn("inline-flex size-[8px] shrink-0 rounded-full", getClientStatusDotClasses(status))} aria-hidden="true" />;
  }
/* - - - - - - - - - - - - - - - - */

  function renderClientStatusControl(candidate) {
    const value = candidate.clientStatus || "Feedback Awaited";

    return (
      <div className="flex items-center gap-[8px]">
        <select
          value={value}
          onChange={(event) => handleOpenClientStatusSheet(candidate, event.target.value)}
          className={cn(
            "h-[34px] min-w-[190px] rounded-[8px] border px-[10px] text-[13px] leading-[20px] outline-none",
            getClientStatusToneClasses(value),
          )}
        >
          {CLIENT_STATUS_OPTIONS.map((status) => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              className="inline-flex size-[28px] items-center justify-center rounded-[6px] text-[var(--fx-text-muted)] transition-colors hover:bg-[var(--fx-surface-hover)] hover:text-[var(--fx-text)]"
              aria-label={`Open activity history for ${candidate.name}`}
              onClick={() => handleOpenClientActivitySheet(candidate)}
            >
              <MessageSquareMore className="size-[14px]" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom" sideOffset={8}>Activity History</TooltipContent>
        </Tooltip>
      </div>
    );
  }

  function renderCandidateMenuButton(candidate) {
    return (
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
          <DropdownMenuItem onClick={() => handleOpenCandidateSheet(candidate)}>
            {activeStage === "screened" ? "View Candidate" : "Open Candidate"}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleOpenCandidateSheet(candidate)}>
            View Resume
          </DropdownMenuItem>
          {activeStage === "screened" || activeStage === "shortlisted" ? (
            <DropdownMenuItem onClick={() => handleOpenPreScreenResult(candidate)}>
              View Pre-Screen Result
            </DropdownMenuItem>
          ) : null}
          {activeStage === "screened" ? (
            <DropdownMenuItem onClick={() => handleOpenShareForReview(candidate)}>
              Share For Review
            </DropdownMenuItem>
          ) : null}
          {activeStage === "shortlisted" ? (
            <DropdownMenuItem onClick={() => handleScheduleCandidate(candidate)}>
              Schedule
            </DropdownMenuItem>
          ) : null}
          <DropdownMenuItem onClick={() => handleDownloadCandidateResume(candidate)}>
            Download Resume
          </DropdownMenuItem>
          {activeStage === "screened" || activeStage === "shortlisted" ? (
            <DropdownMenuItem className="text-[var(--fx-danger)] focus:text-[var(--fx-danger)]" onClick={() => handleDropCandidate(candidate)}>
              Drop Candidate
            </DropdownMenuItem>
          ) : null}
          {activeStage === "shortlisted" ? (
            <DropdownMenuItem onClick={() => handleMoveCandidateToStage(candidate, "screened", "Pre-Screened")}>
              Move back to Pre-Screened
            </DropdownMenuItem>
          ) : null}
          {isClientProgressStage(activeStage) ? (
            <DropdownMenuItem onClick={() => handleMoveCandidateToStage(candidate, "shortlisted", "Shortlisted")}>
              Move back to Shortlisted
            </DropdownMenuItem>
          ) : null}
          {activeStage === "rejected" ? (
            <>
              <DropdownMenuItem onClick={() => handleMoveCandidateToStage(candidate, "screened", "Pre-Screened")}>
                Move to Pre-Screened
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleMoveCandidateToStage(candidate, "shortlisted", "Shortlisted")}>
                Move to Shortlisted
              </DropdownMenuItem>
            </>
          ) : null}
          <DropdownMenuSeparator />
          {isClientProgressStage(activeStage) ? (
            <DropdownMenuItem className="text-[var(--fx-danger)] focus:text-[var(--fx-danger)]" onClick={() => handleOpenRejectDialog(candidate)}>
              Reject Candidate
            </DropdownMenuItem>
          ) : activeStage !== "rejected" ? (
            <DropdownMenuItem className="text-[var(--fx-danger)] focus:text-[var(--fx-danger)]" onClick={() => handleOpenRejectDialog(candidate)}>
              Reject Candidate
            </DropdownMenuItem>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  const tableColumns = useMemo(() => {
    const sortLabel = (key, label) => (
      <button type="button" className={getSortHeaderButtonClassName(key)} onClick={() => handleSort(key)}>
        <span>{label}</span>
        <ArrowUpDown className="size-[14px]" />
      </button>
    );

    const stageHeaderLabels = {
      ...JOB_WORKSPACE_TABLE_HEADERS.base,
      ...(JOB_WORKSPACE_TABLE_HEADERS[activeStage] ?? {}),
    };

    const columnsByKey = {
      name: {
        key: "name",
        label: sortLabel("name", stageHeaderLabels.name),
        width: 220,
        minWidth: 200,
        maxWidth: 260,
        grow: 1,
        defaultVisible: true,
        cellClassName: "text-[14px] leading-[22px] font-medium",
        required: true,
        locked: true,
        hideable: false,
      },
      matchScore: { key: "matchScore", label: sortLabel("matchScore", stageHeaderLabels.matchScore), width: 160, minWidth: 148, maxWidth: 168, align: "center", defaultVisible: true },
      experience: { key: "experience", label: sortLabel("experience", stageHeaderLabels.experience), width: 104, minWidth: 92, maxWidth: 120, align: "center", defaultVisible: true },
      phone: { key: "phone", label: stageHeaderLabels.phone, width: 176, minWidth: 156, maxWidth: 184, grow: 1, defaultVisible: true },
      email: { key: "email", label: stageHeaderLabels.email, width: 240, minWidth: 220, maxWidth: 260, grow: 2, defaultVisible: activeStage === "shortlisted" },
      availability: { key: "availability", label: sortLabel("availabilityDays", stageHeaderLabels.availability), width: 132, minWidth: 120, maxWidth: 148, align: "center", defaultVisible: activeStage === "shortlisted" },
      currentSalary: { key: "currentSalary", label: sortLabel("currentSalary", stageHeaderLabels.currentSalary), width: 144, minWidth: 132, maxWidth: 160, align: "right", defaultVisible: true },
      expectedSalary: { key: "expectedSalary", label: sortLabel("expectedSalary", stageHeaderLabels.expectedSalary), width: 150, minWidth: 136, maxWidth: 168, align: "right", defaultVisible: true },
      strengthsGaps: { key: "strengthsGaps", label: stageHeaderLabels.strengthsGaps, width: 280, minWidth: 248, maxWidth: 320, grow: 1, defaultVisible: false },
      clientStatus: { key: "clientStatus", label: stageHeaderLabels.clientStatus, width: 248, minWidth: 236, maxWidth: 272, align: "left", defaultVisible: false },
      updatedAt: { key: "updatedAt", label: sortLabel("updatedAt", stageHeaderLabels.updatedAt), width: 146, minWidth: 136, maxWidth: 160, align: "center", defaultVisible: false },
      rejectionReason: { key: "rejectionReason", label: stageHeaderLabels.rejectionReason, width: 188, minWidth: 172, maxWidth: 220, defaultVisible: false },
      actions: { key: "actions", label: stageHeaderLabels.actions, width: 104, minWidth: 104, maxWidth: 104, align: "left", sticky: "right", required: true, locked: true, hideable: false },
      menuActions: { key: "menuActions", label: null, width: 56, minWidth: 56, maxWidth: 56, align: "center", sticky: "right", cellClassName: "px-0 pr-0", required: true, locked: true, hideable: false },
    };

    const orderedColumns = [
      columnsByKey.name,
      columnsByKey.phone,
      columnsByKey.matchScore,
      columnsByKey.experience,
      columnsByKey.currentSalary,
      columnsByKey.expectedSalary,
      columnsByKey.email,
      columnsByKey.availability,
      columnsByKey.actions,
      columnsByKey.menuActions,
    ];

    return orderedColumns;
  }, [activeStage, sortConfig]);

  const rows = sortedCandidates.map((candidate) => ({
    id: candidate.id,
    __fxRowSelectionMeta: {
      // Fresh/unviewed candidates get a subtle left-edge cue in the selection column.
      isNew:
        !candidate.jobContext?.viewedAt ||
        (
          (candidate.createdAt || candidate.updatedAt) &&
          Date.now() - new Date(candidate.createdAt || candidate.updatedAt).getTime() <= 2 * 24 * 60 * 60 * 1000
        ),
    },
    name: (
      <div className="flex min-w-0 items-center gap-[10px]">
        {isClientProgressStage(activeStage) ? renderClientStatusDot(candidate.clientStatus || "Feedback Awaited") : null}
        <button
          type="button"
          className="block min-w-0 truncate text-left text-[14px] leading-[22px] font-medium text-[var(--fx-primary)] hover:text-[color-mix(in_srgb,var(--fx-primary)_82%,black_18%)]"
          onClick={() => handleOpenCandidateSheet(candidate)}
        >
          {candidate.name}
        </button>
      </div>
    ),
    matchScore: activeStage === "unscreened" ? (
      <button
        type="button"
        onClick={() => handleOpenCvMatchBreakdown(candidate)}
        className={cn(
          "inline-flex h-[28px] min-w-[68px] items-center justify-center rounded-[4px] px-[10px] text-[13px] leading-[18px] font-medium whitespace-nowrap transition-colors hover:opacity-90",
          getMatchScoreFillClass(candidate.matchScore),
          getMatchScoreToneClass(candidate.matchScore),
        )}
      >
        {candidate.matchScore != null ? `${candidate.matchScore}%` : "—"}
      </button>
    ) : (
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            onClick={() => {
              if (activeStage === "screened" && getPreScreeningFilterKey(candidate) === "manual") {
                handleOpenPreScreenResult(candidate, "details");
                return;
              }

              handleOpenPreScreenResult(candidate);
            }}
            className={cn(
              "inline-flex h-[28px] min-w-[98px] items-center justify-center gap-[8px] rounded-[4px] px-[10px] text-[13px] leading-[18px] font-medium whitespace-nowrap text-[var(--fx-primary)] transition-colors hover:opacity-90",
              getMatchScoreFillClass(candidate.matchScore),
            )}
            aria-label={`Open ${getPreScreeningTableLabel(candidate, activeStage)}`}
          >
            {React.createElement(getPreScreeningIcon(candidate), { className: "size-[14px] shrink-0 text-[var(--fx-primary)]" })}
            <span>{candidate.matchScore != null ? `${candidate.matchScore}%` : "—"}</span>
          </button>
        </TooltipTrigger>
        <TooltipContent side="bottom" sideOffset={8}>
          {getPreScreeningTableLabel(candidate, activeStage)}
        </TooltipContent>
      </Tooltip>
    ),
    experience: (
      <span className="inline-flex min-w-[64px] items-center justify-center px-[4px] py-0 text-[14px] leading-[22px] font-normal text-[var(--fx-text)]">
        {candidate.experience != null && candidate.experience !== "" ? `${candidate.experience}y` : "—"}
      </span>
    ),
    phone: (
      getDialablePhoneHref(candidate.phone) ? (
        <a
          href={getDialablePhoneHref(candidate.phone)}
          className="truncate text-[14px] leading-[22px] text-[var(--fx-primary)] hover:text-[color-mix(in_srgb,var(--fx-primary)_82%,black_18%)]"
        >
          {formatContactValue(candidate.phone)}
        </a>
      ) : (
        <span className="truncate text-[14px] leading-[22px] text-[var(--fx-text)]">{formatContactValue(candidate.phone)}</span>
      )
    ),
    email: <span className="truncate text-[14px] leading-[22px] text-[var(--fx-text)]">{formatContactValue(candidate.email)}</span>,
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
        {formatCurrency(candidate.currentSalary, salaryCurrency)}
      </span>
    ),
    expectedSalary: (
      <span className="tabular-nums text-[14px] leading-[22px] font-medium text-[var(--fx-text)]">
        {formatCurrency(candidate.expectedSalary, salaryCurrency)}
      </span>
    ),
    strengthsGaps: (
      <button
        type="button"
        onClick={() => handleOpenPreScreenResult(candidate)}
        className="block min-w-0 text-left"
      >
        <div className="truncate text-[13px] leading-[20px] font-medium text-[var(--fx-text)]">
          {getStrengthGapSummary(candidate, job).strengths}
        </div>
        <div className="truncate text-[13px] leading-[20px] text-[var(--fx-text-muted)]">
          Missing: {getStrengthGapSummary(candidate, job).gaps}
        </div>
      </button>
    ),
    clientStatus: isClientProgressStage(activeStage) ? renderClientStatusControl(candidate) : renderClientStatusChip(candidate.clientStatus || "Feedback Awaited"),
    updatedAt: (
      <span className="inline-flex min-w-[96px] items-center justify-center px-[4px] py-0 text-[14px] leading-[22px] font-normal text-[var(--fx-text)]">
        {formatCompactDate(candidate.updatedAt)}
      </span>
    ),
    rejectionReason: <span className="truncate text-[14px] leading-[22px] text-[var(--fx-text)]">{candidate.rejectionReason || "Rejected for this role"}</span>,
    actions: (
        <div className="flex items-center justify-start gap-[8px]">
        {isClientProgressStage(activeStage) ? null : renderStageActionButton(candidate)}
      </div>
    ),
    menuActions: (
      <div className="flex flex-col items-center justify-center gap-[4px]">
        {renderCandidateMenuButton(candidate)}
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
        renderBulkButton("ai-pre-screen", Mail, "Start Pre-Screening", bulkActionHandlers.startAiPreScreening, "accent"),
        renderBulkButton("reject", Ban, "Reject", bulkActionHandlers.reject, "danger"),
        renderBulkButton("download-resumes", Download, "Download Resume", handleBulkDownloadResumes, "accent"),
      ];
    }

    if (bulkStage === "screened") {
      return [
        renderBulkButton("share-for-review", Share2, "Share for Review", bulkActionHandlers.shareForReview, "accent"),
        renderBulkButton("shortlisted", Check, "Shortlist", bulkActionHandlers.moveToShortlisted, "accent"),
        renderBulkButton("drop-candidate", UserRoundX, "Drop Candidate", bulkActionHandlers.dropCandidate, "danger"),
        renderBulkButton("reject", Ban, "Reject", bulkActionHandlers.reject, "danger"),
      ];
    }

    if (bulkStage === "shortlisted") {
      return [
        renderBulkButton("on-hold", Minus, "On Hold", bulkActionHandlers.onHold),
        renderBulkButton("drop-candidate", UserRoundX, "Drop Candidate", bulkActionHandlers.dropCandidate, "danger"),
        renderBulkButton("reject", Ban, "Reject", bulkActionHandlers.reject, "danger"),
      ];
    }

    if (bulkStage === "shared") {
      return [];
    }

    if (bulkStage === "rejected") {
      return [
        renderBulkButton("move-to-screened", RotateCcw, "Move to Pre-Screened", bulkActionHandlers.restoreToScreened, "accent"),
        renderBulkButton("move-to-shortlisted", ArrowRight, "Move to Shortlisted", bulkActionHandlers.restoreToShortlisted),
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
                  <FxButton variant="ghost" size="sm" onClick={() => setCallPreviewOpen(true)}>
                    <PhoneCall className="size-[16px]" />
                    Call Preview
                  </FxButton>
                  <FxButton variant="ghost" size="sm" onClick={handleShareJob}>
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
                <MetaField label="Experience" value={job.experience || "—"} />
                <MetaField label="Employment Type" value={job.employmentType || "Full-time"} />
                <MetaField label="Salary Range" value={job.salaryRange || "—"} />
                <MetaField label="Positions" value={String(job.positions || 1)} />
                <MetaField label="Location" value={job.location || "—"} />
                <MetaField label="Publish Date" value={job.publishDate ? formatDate(job.publishDate) : "Draft"} />
                <MetaField label="Question Format" value={job.questionFormat || "CV + AI pre-screening"} />
              </div>
            </div>

            <div className="flex min-h-0 flex-1 flex-col gap-[12px]">
              <div className="flex min-h-0 flex-1 flex-col gap-[12px]">
                <div className="min-w-0">
                  <FxTabs
                    variant="stage"
                    items={PIPELINE_STAGES.map((stage) => ({
                      value: stage.value,
                      label: stage.label,
                      count: candidateCounts[stage.value] || 0,
                    }))}
                    value={activeStage}
                    onValueChange={handleStageChange}
                    className="w-full"
                    showBorder={false}
                  />
                </div>

                <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[8px] border border-[var(--fx-border)] bg-[var(--fx-surface)]">
                  <div className="grid min-h-[64px] items-center gap-[12px] border-b border-[var(--fx-border)] px-[12px] py-[10px] lg:grid-cols-[minmax(0,1fr)_auto]">
                    <div className="min-w-0">
                      {activeFilterItems ? (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <FxButton variant="outline" size="sm">
                              {activeFilterLabel} ({activeFilterCounts?.[activeFilterValue] ?? 0})
                              <ChevronDown className="size-[14px]" />
                            </FxButton>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start" className="w-[240px]">
                            {activeFilterItems.map((filter) => (
                              <DropdownMenuItem
                                key={filter.key}
                                onClick={() => setPreScreenedFilter(filter.key)}
                              >
                                <span className="flex min-w-0 flex-1 items-center justify-between gap-[12px]">
                                  <span>{filter.label}</span>
                                  <span className="text-[var(--fx-text-muted)]">{activeFilterCounts?.[filter.key] ?? 0}</span>
                                </span>
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      ) : null}
                    </div>

                    <div className="flex min-w-0 flex-wrap items-center justify-end gap-[12px]">
                      <div className="flex flex-wrap items-center justify-end gap-[8px]">{bulkToolbarButtons}</div>
                      <div className="w-full min-w-0 sm:w-[200px] sm:flex-none">
                        <div className={`flex h-[34px] items-center rounded-[6px] border border-[color:color-mix(in_srgb,var(--fx-text)_18%,var(--fx-border)_82%)] bg-[var(--fx-bg)] px-[12px]`}>
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
                          <kbd className="ml-[10px] inline-flex h-[20px] items-center justify-center rounded-[4px] border border-[var(--fx-border)] bg-[var(--fx-surface)] px-[6px] text-[12px] font-medium text-[var(--fx-text-muted)]">
                            /
                          </kbd>
                        </div>
                      </div>
                      {activeStage === "unscreened" ? (
                        <FxButton type="button" onClick={handleAddCandidates} className="shrink-0">
                          Add Candidates
                        </FxButton>
                      ) : null}
                    </div>
                  </div>

                  <div className="min-h-0 flex-1 overflow-hidden">
                    {filteredCandidates.length ? (
                      <div className="flex h-full min-h-0 flex-col">
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
                        className="h-full min-h-0"
                        surfaceClassName="rounded-none border-0 bg-transparent"
                        sortedColumnKey={tableSortedColumnKey}
                        sortedColumnDirection={tableSortedColumnDirection}
                        stickyHeader
                        stickyFirstColumn
                        stickyLastColumn
                        scrollX
                        emptyMessage="No candidates in this stage yet."
                        enableColumnPicker
                        storageKey={`${STORAGE_KEYS.JOB_WORKSPACE_COLUMNS}:v2:${activeStage}`}
                        enableRowSelection={!isClientProgressStage(activeStage)}
                        selectedRowKeys={!isClientProgressStage(activeStage) ? selectedCandidateIds : []}
                        onSelectedRowKeysChange={!isClientProgressStage(activeStage) ? setSelectedCandidateIds : undefined}
                      />
                    </div>
                  ) : (
                    <WorkspaceEmptyState
                      title={getStageCopy(activeStage, searchTerm).title}
                      body={getStageCopy(activeStage, searchTerm).body}
                      action={searchTerm.trim() || activeStage !== "unscreened" ? null : (
                        <FxButton type="button" onClick={handleAddCandidates}>
                          Add Candidates
                        </FxButton>
                      )}
                    />
                  )}
                  </div>
                </div>
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
          job={job}
          onPickExistingCandidate={handleAttachExistingCandidate}
          onUploadFiles={handleUploadCandidateFiles}
          onOpenCandidatePool={handleOpenCandidatePool}
        />
      <AddCandidatesDrawer
        open={addCandidatesOpen}
        onOpenChange={setAddCandidatesOpen}
        job={job}
        candidatePool={recommendedCandidates}
        onPickExistingCandidate={handleAttachExistingCandidate}
        onUploadFiles={handleUploadCandidateFiles}
        onOpenCandidatePool={handleOpenCandidatePool}
        initialMode={addCandidatesInitialMode}
        onViewResume={(candidate) => {
          setAddCandidatesOpen(false);
          handleOpenCandidateSheet(candidate);
        }}
      />
        <CandidateWorkspaceSheet
          open={candidateSheetOpen}
          onOpenChange={setCandidateSheetOpen}
          candidate={selectedCandidate}
          job={job}
          onSaveNote={handleSaveCandidateNote}
          onDeleteNote={handleDeleteCandidateNote}
          onOpenCandidatePool={handleOpenCandidatePool}
          onDownloadResume={handleDownloadCandidateResume}
          onUpdateField={handleUpdateCandidateField}
        />
        <ShareJobSheet
          open={shareJobOpen}
          onOpenChange={setShareJobOpen}
          job={job}
          shareUrl={shareUrl}
          onCopyLink={handleCopyJobLink}
          onCopyChannelLink={handleCopyChannelJobLink}
        />
        <SendToClientConfirmSheet
          open={sendToClientConfirmOpen}
          onOpenChange={setSendToClientConfirmOpen}
          job={job}
          candidates={sendToClientCandidates}
          onMarkSent={handleMarkCandidatesSentToClient}
          onGenerateDraft={handleGenerateSendToClientDraft}
        />
        <SendToClientDraftSheet
          open={sendToClientDraftOpen}
          onOpenChange={setSendToClientDraftOpen}
          job={job}
          candidates={sendToClientCandidates}
          mode={sendToClientDraftMode}
          onSwitchToReview={() => setSendToClientDraftMode("review")}
          onCopySubject={(text) => handleCopyText(text, "Email subject")}
          onCopyContent={(text) => handleCopyText(text, "Email content")}
          onCopyDetailedContent={(text) => handleCopyText(text, "Detailed content")}
          onViewResume={(candidate) => {
            setSendToClientDraftOpen(false);
            handleOpenCandidateSheet(candidate);
          }}
          onDownloadZip={handleDownloadZipForCandidates}
          onDownloadResumes={handleDownloadResumesForCandidates}
        />
        <ClientStatusUpdateSheet
          open={clientStatusSheetOpen}
          onOpenChange={setClientStatusSheetOpen}
          candidate={selectedCandidate}
          pendingStatus={clientStatusPendingStatus}
          mode={clientStatusSheetMode}
          onSave={handleCommitClientStatus}
          onOpenResume={(candidate) => {
            setClientStatusSheetOpen(false);
            handleOpenCandidateSheet(candidate);
          }}
        />
        <PreScreenResultSheet
          open={preScreenResultOpen}
          onOpenChange={setPreScreenResultOpen}
          candidate={selectedCandidate}
          job={job}
          initialStep={preScreenResultInitialStep}
          onShortlist={handleShortlistCandidate}
          onReject={handleRejectCandidateFromResults}
          onDownloadResume={handleDownloadCandidateResume}
          onEditCandidate={handleEditCandidateFromResult}
        />
        <ShareForReviewSheet
          open={shareForReviewOpen}
          onOpenChange={(nextOpen) => {
            setShareForReviewOpen(nextOpen);
            if (!nextOpen) {
              setShareForReviewCandidateIds([]);
            }
          }}
          candidates={shareForReviewCandidates}
          job={job}
          onRemoveCandidate={handleRemoveShareForReviewCandidate}
          onOpenCandidatePool={handleOpenCandidatePool}
          onSubmitShare={handleSubmitShareForReview}
        />
        <ScheduleInterviewSheet
          open={scheduleInterviewOpen}
          onOpenChange={setScheduleInterviewOpen}
          candidate={selectedCandidate}
          job={job}
          onSubmit={handleScheduleCandidate}
        />
        <CvMatchBreakdownSheet
          open={cvMatchSheetOpen}
          onOpenChange={setCvMatchSheetOpen}
          candidate={selectedCandidate}
        />
        <EmailScreeningSheet
          open={emailScreeningOpen}
          onOpenChange={(nextOpen) => {
            setEmailScreeningOpen(nextOpen);
            if (!nextOpen) {
              setEmailScreeningCandidateIds([]);
            }
          }}
          candidates={emailScreeningCandidates}
          selectedCandidateId={selectedCandidateId}
          onSelectCandidate={setSelectedCandidateId}
          onRemoveCandidate={handleRemoveCandidateFromEmailScreening}
          onOpenCandidatePool={handleOpenCandidatePool}
          job={job}
          onStart={handleStartEmailScreening}
        />
        <ManualScreeningSheet
          open={manualScreeningOpen}
          onOpenChange={setManualScreeningOpen}
          candidate={selectedCandidate}
          job={job}
          onSubmit={handleSubmitManualScreening}
          onReject={handleRejectCandidateFromManualScreening}
          onDownloadResume={handleDownloadCandidateResume}
          onOpenCandidatePool={handleOpenCandidatePool}
          onPrevious={handlePreviousManualScreeningCandidate}
          onNext={handleNextManualScreeningCandidate}
          hasPrevious={selectedManualScreeningCandidateIndex > 0}
          hasNext={selectedManualScreeningCandidateIndex >= 0 && selectedManualScreeningCandidateIndex < manualScreeningCandidates.length - 1}
        />
        <CallPreviewDrawer open={callPreviewOpen} onOpenChange={setCallPreviewOpen} job={job} />
        <Dialog open={rejectDialogOpen} onOpenChange={handleCloseRejectDialog}>
          <DialogContent className="max-w-[520px]">
            <DialogHeader className="text-left">
              <DialogTitle>Reject Candidate</DialogTitle>
              <DialogDescription>
                Add a note for why {candidateToReject?.name || "this candidate"} is being rejected for this job.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-[10px]">
              <p className={`${FX_TYPOGRAPHY.fieldLabel} text-[var(--fx-text)]`}>Rejection Notes</p>
              <FxInput
                textarea
                value={rejectReasonDraft}
                onChange={(event) => setRejectReasonDraft(event.target.value)}
                placeholder="Leave notes about the rejection reason..."
                className="min-h-[120px]"
              />
            </div>

            <div className="flex items-center justify-end gap-[8px]">
              <FxButton variant="ghost" onClick={() => handleCloseRejectDialog(false)}>
                Cancel
              </FxButton>
              <FxButton variant="destructive" onClick={handleConfirmRejectCandidate}>
                Save and Reject
              </FxButton>
            </div>
          </DialogContent>
        </Dialog>
      </FxProtectedAppPage>
    </TooltipProvider>
  );
}
