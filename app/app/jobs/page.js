/* app/app/jobs/page.js | Jobs workspace page | Sree | 2026-06-14 */

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import {
  ArrowRight,
  ArrowUpDown,
  Archive,
  ListChecks,
  Mail,
  MoreHorizontal,
  Plus,
  RefreshCcw,
  Sparkles,
  Trash2,
  WandSparkles,
} from "lucide-react";

import { FxButton } from "@/components/FxButton";
import { FxAiButton } from "@/components/FxAiButton";
import { FxInput } from "@/components/FxInput";
import { FxProtectedAppPage } from "@/components/FxProtectedAppPage";
import { FxTable } from "@/components/FxTable";
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
import { WORKSPACE_TYPES } from "@/lib/FxConstants";
import { PAGE_COPY } from "@/lib/FxCopy";
import { fxButtonClassName } from "@/components/FxButton";
import {
  createJobId,
  clearAllStoredState,
  ensureJobsStore,
  readStoredWorkspaceType,
  readStoredJobsPageState,
  readStoredJobsViewMode,
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

const DEFAULT_JOBS_VIEW_MODE = "table";

const JOB_SHEET_STEPS = [
  { value: "basic", label: "Basic Details" },
  { value: "description", label: "Job Description" },
  { value: "evaluation", label: "Evaluation" },
  { value: "questionnaire", label: "Questionnaire" },
  { value: "benefits", label: "Benefits" },
  { value: "settings", label: "Settings" },
];

const DEFAULT_QUESTION_SUGGESTIONS = [
  {
    id: "availability",
    label: "Availability",
    question: "How soon can you join?",
    note: "Capture near-term readiness quickly.",
  },
  {
    id: "authorization",
    label: "Work Authorization",
    question: "Do you need visa sponsorship or work authorization support?",
    note: "Keep this only when relevant for the role.",
  },
  {
    id: "salary",
    label: "Current Salary",
    question: "What is your current salary range?",
    note: "Use only when compensation alignment matters.",
  },
  {
    id: "notice",
    label: "Notice Period",
    question: "What is your current notice period?",
    note: "Useful for prioritizing candidates in motion.",
  },
];

const DEFAULT_EVALUATION_ROUNDS = [
  {
    id: "round-1",
    title: "Round 1",
    details: "Technical screen",
    note: "Confirm role-fit and baseline depth.",
  },
  {
    id: "round-2",
    title: "Round 2",
    details: "Hiring manager review",
    note: "Validate scope, collaboration, and pace.",
  },
  {
    id: "round-3",
    title: "Round 3",
    details: "Final decision",
    note: "Close the loop and decide next steps.",
  },
];

function normalizeJob(job) {
  const data = job.data ?? {};

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
      ...data,
      jobTitle: data.jobTitle ?? job.title ?? "",
      jobDescription: data.jobDescription ?? "",
      primarySkills: data.primarySkills ?? [],
      secondarySkills: data.secondarySkills ?? [],
      responsibilities: data.responsibilities ?? "",
      evaluationContext: data.evaluationContext ?? "",
      evaluationRounds: data.evaluationRounds ?? [],
      questionFormat: data.questionFormat ?? "cv_and_prescreen",
      questions: data.questions ?? [],
      benefits: data.benefits ?? [],
      preScreeningMode: data.preScreeningMode ?? "call_with_email_backup",
      callingBackup: data.callingBackup ?? "email",
      backupNotes: data.backupNotes ?? "",
      aiPrompt: data.aiPrompt ?? "",
    },
  };
}

function createQuestionSeed(question, fallbackId = "question") {
  if (!question || typeof question === "string") {
    return {
      id: fallbackId,
      label: "Question",
      question: question ?? "",
      note: "",
    };
  }

  return {
    ...question,
    id: question.id ?? fallbackId,
  };
}

function createRoundSeed(round, fallbackId = "round") {
  if (!round || typeof round === "string") {
    return {
      id: fallbackId,
      title: "Round",
      details: round ?? "",
      note: "",
    };
  }

  return {
    ...round,
    id: round.id ?? fallbackId,
  };
}

function createDefaultQuestions() {
  return DEFAULT_QUESTION_SUGGESTIONS.map((question) => createQuestionSeed(question, question.id));
}

function createDefaultRounds() {
  return DEFAULT_EVALUATION_ROUNDS.map((round) => createRoundSeed(round, round.id));
}

function toCommaList(value) {
  if (Array.isArray(value)) {
    return value.filter(Boolean).join(", ");
  }

  return value ? String(value) : "";
}

function fromCommaList(value) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  return String(value ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function createEmptyJobForm() {
  return {
    title: "",
    company: "",
    positions: "1",
    location: "",
    experience: "",
    status: "Draft",
    aiPrompt: "",
    jobDescription: "",
    primarySkills: "",
    secondarySkills: "",
    responsibilities: "",
    evaluationContext: "",
    evaluationRounds: createDefaultRounds(),
    questionFormat: "cv_and_prescreen",
    questions: createDefaultQuestions(),
    benefitsSummary: "",
    preScreeningMode: "call_with_email_backup",
    callingBackup: "email",
    backupNotes: "",
  };
}

const EMPTY_JOB_FORM = createEmptyJobForm();

function createQuestionItem(label, question, note) {
  return {
    id: `question-${Math.random().toString(36).slice(2, 8)}`,
    label,
    question,
    note,
  };
}

function createRoundItem(title, details, note) {
  return {
    id: `round-${Math.random().toString(36).slice(2, 8)}`,
    title,
    details,
    note,
  };
}

function createFormFromJob(job) {
  if (!job) {
    return createEmptyJobForm();
  }

  const data = job.data ?? {};

  return {
    ...createEmptyJobForm(),
    title: job.title ?? "",
    company: job.company ?? "",
    positions: String(job.positions ?? 1),
    location: job.location ?? "",
    experience: job.experience ?? "",
    status: job.status === "Published" ? "Published" : "Draft",
    aiPrompt: data.aiPrompt ?? "",
    jobDescription: data.jobDescription ?? "",
    primarySkills: toCommaList(data.primarySkills),
    secondarySkills: toCommaList(data.secondarySkills),
    responsibilities: data.responsibilities ?? "",
    evaluationContext: data.evaluationContext ?? "",
    evaluationRounds:
      Array.isArray(data.evaluationRounds) && data.evaluationRounds.length
        ? data.evaluationRounds.map((round, index) => createRoundSeed(round, round.id ?? `round-${index + 1}`))
        : createDefaultRounds(),
    questionFormat: data.questionFormat ?? "cv_and_prescreen",
    questions:
      Array.isArray(data.questions) && data.questions.length
        ? data.questions.map((question, index) => createQuestionSeed(question, question.id ?? `question-${index + 1}`))
        : createDefaultQuestions(),
    benefitsSummary: toCommaList(data.benefits),
    preScreeningMode: data.preScreeningMode ?? "call_with_email_backup",
    callingBackup: data.callingBackup ?? "email",
    backupNotes: data.backupNotes ?? "",
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

export default function JobsPage() {
  const router = useRouter();
  const initialPageState = readStoredJobsPageState() ?? DEFAULT_PAGE_STATE;
  const [jobsViewMode, setJobsViewMode] = useState(() => {
    const storedViewMode = readStoredJobsViewMode();
    return storedViewMode === "empty" ? "empty" : DEFAULT_JOBS_VIEW_MODE;
  });
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [jobForm, setJobForm] = useState(EMPTY_JOB_FORM);
  const [activeSheetStep, setActiveSheetStep] = useState("basic");
  const [isAiPromptExpanded, setIsAiPromptExpanded] = useState(false);
  const [formError, setFormError] = useState("");
  const [pendingAction, setPendingAction] = useState(null);
  const [searchTerm, setSearchTerm] = useState(initialPageState.searchTerm ?? DEFAULT_PAGE_STATE.searchTerm);
  const [selectedTab, setSelectedTab] = useState(initialPageState.selectedTab ?? DEFAULT_PAGE_STATE.selectedTab);
  const [sortConfig, setSortConfig] = useState(initialPageState.sortConfig ?? DEFAULT_PAGE_STATE.sortConfig);
  const [jobs, setJobs] = useState(() => ensureJobsStore().map(normalizeJob));
  const searchInputRef = useRef(null);
  const tableSurfaceRef = useRef(null);
  const baselineJobForm = editingJob ? createFormFromJob(editingJob) : EMPTY_JOB_FORM;
  const isJobFormDirty = JSON.stringify(jobForm) !== JSON.stringify(baselineJobForm);
  const workspaceType = useSyncExternalStore(subscribeToWorkspaceTypeChange, readStoredWorkspaceType, () => null);
  const showClientInfo = workspaceType === WORKSPACE_TYPES.CLIENTS || workspaceType === WORKSPACE_TYPES.BOTH;

  useEffect(() => {
    const syncJobsViewMode = () => {
      const storedViewMode = readStoredJobsViewMode();
      setJobsViewMode(storedViewMode === "empty" ? "empty" : DEFAULT_JOBS_VIEW_MODE);
    };

    syncJobsViewMode();
    window.addEventListener("storage", syncJobsViewMode);
    window.addEventListener("fx-auth-change", syncJobsViewMode);
    window.addEventListener("focus", syncJobsViewMode);
    document.addEventListener("visibilitychange", syncJobsViewMode);

    return () => {
      window.removeEventListener("storage", syncJobsViewMode);
      window.removeEventListener("fx-auth-change", syncJobsViewMode);
      window.removeEventListener("focus", syncJobsViewMode);
      document.removeEventListener("visibilitychange", syncJobsViewMode);
    };
  }, []);

  useEffect(() => {
    writeStoredJobsViewMode(jobsViewMode);
  }, [jobsViewMode]);

  useEffect(() => {
    writeStoredJobsPageState({ searchTerm, selectedTab, sortConfig });
  }, [searchTerm, selectedTab, sortConfig]);

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
    setJobForm(createEmptyJobForm());
    setActiveSheetStep("basic");
    setIsAiPromptExpanded(false);
    setFormError("");
    setIsSheetOpen(true);
  }

  function handleEditJob(job) {
    setEditingJob(job);
    setJobForm(createFormFromJob(job));
    setActiveSheetStep("basic");
    setIsAiPromptExpanded(false);
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

  function resetJobSheetState() {
    setIsSheetOpen(false);
    setEditingJob(null);
    setJobForm(createEmptyJobForm());
    setActiveSheetStep("basic");
    setIsAiPromptExpanded(false);
    setFormError("");
    setPendingAction(null);
  }

  function requestSheetClose() {
    if (isJobFormDirty) {
      setPendingAction({ type: "discard-sheet" });
      return;
    }

    resetJobSheetState();
  }

  function handleSheetOpenChange(nextOpen) {
    if (nextOpen) {
      setIsSheetOpen(true);
      return;
    }

    requestSheetClose();
  }

  function requestDeleteJob(job) {
    setPendingAction({
      type: "delete-job",
      jobId: job.id,
      title: job.title,
    });
  }

  function handleConfirmPendingAction() {
    if (!pendingAction) {
      return;
    }

    if (pendingAction.type === "delete-job") {
      handleDeleteJob(pendingAction.jobId);
    }

    if (pendingAction.type === "discard-sheet") {
      resetJobSheetState();
    } else {
      setPendingAction(null);
    }
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

  function updateQuestion(questionId, field, value) {
    setJobForm((current) => ({
      ...current,
      questions: current.questions.map((question) =>
        question.id === questionId ? { ...question, [field]: value } : question,
      ),
    }));
  }

  function addQuestion(question) {
    setJobForm((current) => ({
      ...current,
      questions: [...current.questions, createQuestionItem(question.label, question.question, question.note)],
    }));
  }

  function removeQuestion(questionId) {
    setJobForm((current) => ({
      ...current,
      questions: current.questions.filter((question) => question.id !== questionId),
    }));
  }

  function updateRound(roundId, field, value) {
    setJobForm((current) => ({
      ...current,
      evaluationRounds: current.evaluationRounds.map((round) =>
        round.id === roundId ? { ...round, [field]: value } : round,
      ),
    }));
  }

  function addRound() {
    setJobForm((current) => ({
      ...current,
      evaluationRounds: [...current.evaluationRounds, createRoundItem("Round", "", "")],
    }));
  }

  function removeRound(roundId) {
    setJobForm((current) => ({
      ...current,
      evaluationRounds: current.evaluationRounds.filter((round) => round.id !== roundId),
    }));
  }

  function autofillBasicDetails() {
    const title = jobForm.title.trim() || "the role";
    const client = showClientInfo ? jobForm.company.trim() : "";

    setJobForm((current) => ({
      ...current,
      jobDescription:
        current.jobDescription ||
        `We are hiring for ${client ? `${title} at ${client}` : title}. The role should support a practical, AI-assisted recruiting flow without unnecessary ATS overhead.`,
      primarySkills: current.primarySkills || "Communication, Collaboration, Structured Screening",
      secondarySkills: current.secondarySkills || "Candidate Experience, Workflow Coordination, Hiring Ops",
      responsibilities:
        current.responsibilities ||
        `Support ${client ? `${title} hiring for ${client}` : title} by keeping screening context current, coordinating evaluations, and helping the hiring team move quickly.`,
      evaluationContext:
        current.evaluationContext ||
        `Use concise role context for ${client ? `${title} at ${client}` : title} so the AI can screen for practical fit and generate better candidate follow-ups.`,
    }));
  }

  function autofillJobDescription() {
    const title = jobForm.title.trim() || "the role";
    const client = showClientInfo ? jobForm.company.trim() : "";

    setJobForm((current) => ({
      ...current,
      jobDescription:
        current.jobDescription ||
        `Join us as ${title}${client ? ` for ${client}` : ""}. The role will work closely with the hiring team to keep the candidate flow focused, contextual, and easy to evaluate.`,
      primarySkills: current.primarySkills || "Communication, Role Fit, Candidate Screening",
      secondarySkills: current.secondarySkills || "AI Collaboration, Reporting, Team Coordination",
      responsibilities:
        current.responsibilities ||
        "Turn hiring intent into clear screening context, keep candidate conversations aligned, and surface the best-fit people faster.",
    }));
  }

  function autofillEvaluation() {
    const title = jobForm.title.trim() || "the role";
    const client = showClientInfo ? jobForm.company.trim() : "";

    setJobForm((current) => ({
      ...current,
      evaluationContext:
        current.evaluationContext ||
        `Focus evaluation on practical fit for ${client ? `${title} at ${client}` : title}. Keep rounds lightweight, role-specific, and easy for recruiters to run.`,
      evaluationRounds:
        current.evaluationRounds.length > 0
          ? current.evaluationRounds
          : [
              createRoundItem("Round 1", "Screening", "Short AI-assisted review of baseline fit."),
              createRoundItem("Round 2", "Hiring manager", "Check role depth, communication, and ownership."),
              createRoundItem("Round 3", "Final decision", "Confirm readiness for next step."),
            ],
    }));
  }

  function autofillQuestions() {
    setJobForm((current) => ({
      ...current,
      questions: (() => {
        const existingQuestions = current.questions.map((question) => question.question.trim().toLowerCase());
        const nextSuggestion = DEFAULT_QUESTION_SUGGESTIONS.find(
          (question) => !existingQuestions.includes(question.question.trim().toLowerCase()),
        );

        if (!nextSuggestion) {
          return current.questions;
        }

        return [...current.questions, createQuestionSeed(nextSuggestion)];
      })(),
    }));
  }

  function autofillBenefits() {
    const title = jobForm.title.trim() || "the role";

    setJobForm((current) => ({
      ...current,
      benefitsSummary:
        current.benefitsSummary ||
        `Candidates for ${title} can expect a clear process, responsive feedback, and practical conversations focused on fit.`,
    }));
  }

  function autofillSettings() {
    setJobForm((current) => ({
      ...current,
      preScreeningMode: current.preScreeningMode || "call_with_email_backup",
      callingBackup: current.callingBackup || "email",
      backupNotes: current.backupNotes || "If a call fails, fall back to email and keep the candidate moving.",
    }));
  }

  function buildGeneratedJobContent(form, includeClientInfo) {
    const title = form.title.trim();
    const client = includeClientInfo ? form.company.trim() : "";
    const roleContext = client ? `${title} at ${client}` : title;

    return {
      aiPrompt: form.aiPrompt.trim(),
      jobDescription:
        form.jobDescription.trim() ||
        `We are hiring for ${roleContext}. The role should support a practical, AI-assisted recruiting flow without unnecessary ATS overhead.`,
      primarySkills: form.primarySkills.trim() || "Communication, Collaboration, Structured Screening",
      secondarySkills: form.secondarySkills.trim() || "Candidate Experience, Workflow Coordination, Hiring Ops",
      responsibilities:
        form.responsibilities.trim() ||
        `Support ${roleContext} by keeping screening context current, coordinating evaluations, and helping the hiring team move quickly.`,
      evaluationContext:
        form.evaluationContext.trim() ||
        `Use concise role context for ${roleContext} so the AI can screen for practical fit and generate better candidate follow-ups.`,
      evaluationRounds: form.evaluationRounds.length ? form.evaluationRounds : createDefaultRounds(),
      questionFormat: form.questionFormat || "cv_and_prescreen",
      questions: form.questions.length ? form.questions : createDefaultQuestions(),
      benefitsSummary:
        form.benefitsSummary.trim() ||
        `Candidates for ${title || "the role"} can expect a clear process, responsive feedback, and practical conversations focused on fit.`,
      preScreeningMode: form.preScreeningMode || "call_with_email_backup",
      callingBackup: form.callingBackup || "email",
      backupNotes: form.backupNotes || "If a call fails, fall back to email and keep the candidate moving.",
      interviewRounds: form.evaluationRounds.length ? form.evaluationRounds : createDefaultRounds(),
    };
  }

  function commitJob(nextStatus = jobForm.status) {
    const title = jobForm.title.trim();
    const company = jobForm.company.trim();

    if (!title || (showClientInfo && !company)) {
      setFormError(showClientInfo ? "Job title and client are required." : "Job title is required.");
      return;
    }

    const generatedContent = buildGeneratedJobContent(jobForm, showClientInfo);
    const nextJob = normalizeJob(
      upsertStoredJob({
        id: editingJob?.id ?? createJobId(),
        title,
        company: showClientInfo ? company : editingJob?.company ?? "",
        positions: Math.max(1, Number(jobForm.positions) || 1),
        location: jobForm.location.trim(),
        experience: jobForm.experience.trim(),
        status: nextStatus === "Published" ? "Published" : "Draft",
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
          aiPrompt: generatedContent.aiPrompt,
          jobDescription: generatedContent.jobDescription,
          primarySkills: generatedContent.primarySkills,
          secondarySkills: generatedContent.secondarySkills,
          responsibilities: generatedContent.responsibilities,
          evaluationContext: generatedContent.evaluationContext,
          evaluationRounds: generatedContent.evaluationRounds,
          questionFormat: generatedContent.questionFormat,
          questions: generatedContent.questions,
          benefits: fromCommaList(generatedContent.benefitsSummary),
          preScreeningMode: generatedContent.preScreeningMode,
          callingBackup: generatedContent.callingBackup,
          backupNotes: generatedContent.backupNotes,
          interviewRounds: generatedContent.interviewRounds,
        },
      }),
    );

    setJobs((currentJobs) => {
      const exists = currentJobs.some((job) => job.id === nextJob.id);
      return exists
        ? currentJobs.map((job) => (job.id === nextJob.id ? nextJob : job))
        : [nextJob, ...currentJobs];
    });
    resetJobSheetState();
  }

  function handleSubmitJob(event) {
    event.preventDefault();
    commitJob(jobForm.status);
  }

  function handleSaveDraft() {
    commitJob("Draft");
  }

  function handlePublishJob() {
    commitJob("Published");
  }

  function getSheetStepTabClassName(step) {
    const isActive = activeSheetStep === step;

    return `relative cursor-pointer pb-[12px] ${isActive ? "text-[var(--fx-primary)]" : "text-[var(--fx-text-muted)]"} ${FX_TYPOGRAPHY.button}`;
  }

  function renderOptionCard({ value, title, description, icon: Icon, groupValue, onSelect }) {
    const isActive = groupValue === value;

    return (
      <button
        key={value}
        type="button"
        onClick={() => onSelect(value)}
        className={`flex w-full items-start gap-[12px] rounded-[12px] border px-[16px] py-[16px] text-left transition-colors ${
          isActive
            ? "border-[var(--fx-primary)] bg-[var(--fx-surface-selected)]"
            : `border-[var(--fx-border)] bg-[var(--fx-surface)] hover:bg-[var(--fx-surface-hover)]`
        }`}
      >
        {Icon ? <Icon className="mt-[2px] size-[16px] shrink-0 text-[var(--fx-primary)]" /> : null}
        <div className="min-w-0 space-y-[4px]">
          <p className={FX_TYPOGRAPHY.button}>{title}</p>
          {description ? <p className={`${FX_TYPOGRAPHY.fieldHint} text-[var(--fx-text-muted)]`}>{description}</p> : null}
        </div>
      </button>
    );
  }

  function renderSectionHeader(title, description, action) {
    return (
      <div className="flex items-start justify-between gap-[16px]">
        <div className="space-y-[4px]">
          <h3 className={FX_TYPOGRAPHY.cardTitle}>{title}</h3>
          {description ? <p className={`${FX_TYPOGRAPHY.body} text-[var(--fx-text-muted)]`}>{description}</p> : null}
        </div>
        {action ? <div className="flex shrink-0 items-center gap-[8px]">{action}</div> : null}
      </div>
    );
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
  const showArchivedEmptyState = selectedTab === "archived" && archivedCount === 0;

  function handleResetDemoData() {
    clearAllStoredState();
    window.dispatchEvent(new Event("fx-auth-change"));
    router.replace(ROUTES.LANDING);
    router.refresh();
  }

  function toggleJobsViewMode() {
    setJobsViewMode((current) => (current === "empty" ? DEFAULT_JOBS_VIEW_MODE : "empty"));
  }

  const columns = [
    {
      key: "title",
      label: (
        <button type="button" className={fieldButtonClassName(true)} onClick={() => handleSort("title")}>
          <span>Job Title</span>
          <ArrowUpDown className="size-[14px]" />
        </button>
      ),
      width: showClientInfo ? "24%" : "28%",
      cellClassName: FX_TYPOGRAPHY.clickableData,
    },
    ...(showClientInfo
      ? [
          {
            key: "company",
            label: (
              <button type="button" className={fieldButtonClassName(true)} onClick={() => handleSort("company")}>
                <span>Client</span>
                <ArrowUpDown className="size-[14px]" />
              </button>
            ),
            width: "14%",
          },
        ]
      : []),
    {
      key: "positions",
      label: <button type="button" className={fieldButtonClassName()} disabled><span>Positions</span></button>,
      width: "7%",
    },
    {
      key: "location",
      label: <button type="button" className={fieldButtonClassName()} disabled><span>Location</span></button>,
      width: showClientInfo ? "17%" : "22%",
    },
    {
      key: "unscreenedCount",
      label: <button type="button" className={fieldButtonClassName()} disabled><span>Unscreened</span></button>,
      width: "7%",
      align: "center",
    },
    {
      key: "screenedCount",
      label: <button type="button" className={fieldButtonClassName()} disabled><span>Screened</span></button>,
      width: "7%",
      align: "center",
    },
    {
      key: "shortlistedCount",
      label: <button type="button" className={fieldButtonClassName()} disabled><span>Shortlisted</span></button>,
      width: "7%",
      align: "center",
    },
    {
      key: "sharedCount",
      label: <button type="button" className={fieldButtonClassName()} disabled><span>Shared</span></button>,
      width: "6%",
      align: "center",
    },
    {
      key: "lastActivity",
      label: (
        <button type="button" className={fieldButtonClassName(true)} onClick={() => handleSort("updatedAt")}>
          <span>Last Activity</span>
          <ArrowUpDown className="size-[14px]" />
        </button>
      ),
      width: showClientInfo ? "9%" : "10%",
    },
    {
      key: "actions",
      label: "",
      width: "64px",
      align: "right",
    },
  ];

  function renderPipelineCell(value, label) {
    return (
      <button
        type="button"
        className={`block w-full rounded-[8px] px-[4px] py-[4px] text-center ${FX_TYPOGRAPHY.tableCell} text-[var(--fx-text)] hover:bg-[var(--fx-surface-selected)] hover:text-[var(--fx-primary)]`}
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
        className={`inline-flex size-[8px] shrink-0 cursor-help rounded-full ${isDraft ? "bg-[var(--fx-warning)]" : "bg-[var(--fx-success)]"}`}
        title={isDraft ? "Draft" : "Published"}
        aria-label={isDraft ? "Draft" : "Published"}
      />
    );
  }

  const rows = filteredJobs.map((job) => ({
    id: job.id,
    title: (
      <div className="flex min-w-0 items-center gap-[10px]">
        {renderStatusDot(job)}
        {job.status === "Draft" ? (
          <button
            type="button"
            className={`block min-w-0 truncate text-left text-[var(--fx-primary)] hover:text-[var(--fx-text)] ${FX_TYPOGRAPHY.clickableData}`}
            title={job.title}
            onClick={() => handleEditJob(job)}
          >
            {job.title}
          </button>
        ) : (
          <Link
            href={ROUTES.JOB(job.id)}
            className={`block min-w-0 truncate text-[var(--fx-primary)] hover:text-[var(--fx-text)] ${FX_TYPOGRAPHY.clickableData}`}
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
                <DropdownMenuItem className="text-[var(--fx-danger)]" onClick={() => requestDeleteJob(job)}>
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
                <DropdownMenuItem className="text-[var(--fx-danger)]" onClick={() => requestDeleteJob(job)}>
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
                <DropdownMenuItem className="text-[var(--fx-danger)]" onClick={() => requestDeleteJob(job)}>
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
      <section className={`${FX_LAYOUT.contentWidthWide} flex h-full min-h-0 w-full min-w-0 flex-1 flex-col overflow-hidden`}>
        <div className="flex min-h-0 flex-1 flex-col gap-[24px] overflow-hidden">
          <div className="grid min-w-0 flex-none grid-cols-[minmax(0,1fr)_auto] items-end gap-[16px]">
            <div className="flex min-w-0 items-end gap-[24px]">
              <button
                type="button"
                className={`relative cursor-pointer pb-[8px] ${selectedTab === "active" ? "text-[var(--fx-text)]" : "text-[var(--fx-text-muted)]"} ${FX_TYPOGRAPHY.button}`}
                onClick={() => setSelectedTab("active")}
              >
                {PAGE_COPY.jobs.activeTab} ({activeCount})
                {selectedTab === "active" ? <span className="absolute bottom-0 left-[2px] right-[2px] h-[3px] rounded-full bg-[var(--fx-primary)]" /> : null}
              </button>
              <button
                type="button"
                className={`relative cursor-pointer pb-[8px] ${selectedTab === "archived" ? "text-[var(--fx-text)]" : "text-[var(--fx-text-muted)]"} ${FX_TYPOGRAPHY.button}`}
                onClick={() => setSelectedTab("archived")}
              >
                {PAGE_COPY.jobs.archivedTab} ({archivedCount})
                {selectedTab === "archived" ? <span className="absolute bottom-0 left-[2px] right-[2px] h-[3px] rounded-full bg-[var(--fx-primary)]" /> : null}
              </button>
            </div>

            <div className="flex min-w-0 shrink-0 items-center gap-[12px] justify-self-end">
              <div className="w-full max-w-[320px] min-w-0">
                <FxInput
                  ref={searchInputRef}
                  aria-label="Search jobs"
                  className="border-[color:color-mix(in_srgb,var(--fx-border)_72%,var(--fx-text)_28%)]"
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
              <FxButton className="shrink-0" onClick={handleCreateJob}>
                Create Job
              </FxButton>
            </div>
          </div>

          <div
            ref={tableSurfaceRef}
            tabIndex={0}
            className="min-h-0 flex-1 overflow-hidden outline-none focus-visible:ring-2 focus-visible:ring-[var(--fx-primary)]/20"
          >
            {showArchivedEmptyState ? (
              <div className={`flex h-full min-h-0 items-center justify-center border ${FX_COLORS.border} ${FX_RADIUS.sm} bg-[var(--fx-surface)] px-[24px] py-[24px]`}>
                <div className="max-w-[420px] space-y-[16px] text-center">
                  <div className="mx-auto flex size-[48px] items-center justify-center rounded-full bg-[var(--fx-bg-soft)] text-[var(--fx-primary)]">
                    <Archive className="size-[22px]" />
                  </div>
                  <div className="space-y-[8px]">
                    <p className={FX_TYPOGRAPHY.sectionTitle}>No archived jobs yet</p>
                    <p className={`${FX_TYPOGRAPHY.body} text-[var(--fx-text-muted)]`}>
                      Archive filled, closed, or inactive roles to keep your active workspace focused.
                    </p>
                    <p className={`${FX_TYPOGRAPHY.body} text-[var(--fx-text-muted)]`}>
                      Archived jobs can be restored later.
                    </p>
                  </div>
                </div>
              </div>
            ) : null}
            {jobsViewMode === "empty" ? (
              <div className={`flex h-full min-h-0 items-center justify-center border ${FX_COLORS.border} ${FX_RADIUS.sm} bg-[var(--fx-surface)] px-[24px] py-[24px]`}>
                <div className="max-w-[420px] space-y-[16px] text-center">
                  <div className="mx-auto flex size-[44px] items-center justify-center rounded-full bg-[var(--fx-bg-soft)] text-[var(--fx-primary)]">
                    <ListChecks className="size-[20px]" />
                  </div>
                  <div className="space-y-[8px]">
                    <p className={FX_TYPOGRAPHY.sectionTitle}>{PAGE_COPY.jobs.empty}</p>
                    <p className={`${FX_TYPOGRAPHY.body} text-[var(--fx-text-muted)]`}>{PAGE_COPY.jobs.emptyBody}</p>
                  </div>
                  <div className="flex justify-center gap-[8px]">
                    <FxButton type="button" onClick={handleCreateJob}>
                      {PAGE_COPY.jobs.createCta}
                    </FxButton>
                  </div>
                </div>
              </div>
            ) : !showArchivedEmptyState ? (
              <FxTable columns={columns} rows={rows} stickyHeader emptyMessage={PAGE_COPY.jobs.tableEmpty} />
            ) : null}
          </div>
        </div>
      </section>

      <div className="fixed bottom-[16px] right-[16px] z-20 flex items-center gap-[8px]">
        {process.env.NODE_ENV === "development" ? (
          <button
            type="button"
            aria-label="Reset demo data"
            title="Reset demo data"
            className={`flex h-[28px] w-[28px] cursor-pointer items-center justify-center rounded-full border ${FX_COLORS.border} bg-[var(--fx-surface)] ${FX_TYPOGRAPHY.caption} text-[var(--fx-text-muted)] opacity-25 transition-opacity hover:opacity-100`}
            onClick={handleResetDemoData}
          >
            <RefreshCcw className="size-[12px]" />
          </button>
        ) : null}
        {process.env.NODE_ENV === "development" ? (
          <button
            type="button"
            aria-label={jobsViewMode === "empty" ? "Show table view" : "Show empty view"}
            title={jobsViewMode === "empty" ? "Show table view" : "Show empty view"}
            className={`flex h-[28px] w-[28px] cursor-pointer items-center justify-center rounded-full border ${FX_COLORS.border} bg-[var(--fx-surface)] ${FX_TYPOGRAPHY.caption} text-[var(--fx-text-muted)] opacity-25 transition-opacity hover:opacity-100`}
            onClick={toggleJobsViewMode}
          >
            J
          </button>
        ) : null}
      </div>

      <Sheet open={isSheetOpen} onOpenChange={handleSheetOpenChange}>
        <SheetContent size="xl">
          <SheetHeader
            title={editingJob ? PAGE_COPY.jobs.editCta : PAGE_COPY.jobs.createCta}
            description={null}
          />

          <form className="flex min-h-0 flex-1 flex-col" onSubmit={handleSubmitJob}>
            <SheetBody className="space-y-[24px]">
              <div className="border-b border-[var(--fx-border)]">
                <div className="flex gap-[24px] overflow-x-auto">
                  {JOB_SHEET_STEPS.map((step) => (
                    <button
                      key={step.value}
                      type="button"
                      className={getSheetStepTabClassName(step.value)}
                      onClick={() => setActiveSheetStep(step.value)}
                    >
                      {step.label}
                      {activeSheetStep === step.value ? (
                        <span className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full bg-[var(--fx-primary)]" />
                      ) : null}
                    </button>
                  ))}
                </div>
              </div>

              {activeSheetStep === "basic" ? (
                <section className="space-y-[16px]">
                  {renderSectionHeader(
                    "Basic Details",
                    null,
                    <FxAiButton onClick={autofillBasicDetails}>
                      Generate Basics
                    </FxAiButton>,
                  )}
                  <div className="grid gap-[16px] md:grid-cols-2">
                    <FxInput
                      name="title"
                      label="Job Title"
                      placeholder="Senior Frontend Engineer"
                      value={jobForm.title}
                      onChange={handleJobFormChange}
                    />
                    {showClientInfo ? (
                      <FxInput
                        name="company"
                        label="Client"
                        placeholder="ThinkJS"
                        value={jobForm.company}
                        onChange={handleJobFormChange}
                      />
                    ) : null}
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
                  <section className="rounded-[12px] border border-[var(--fx-border)] bg-[var(--fx-surface)] px-[16px] py-[16px]">
                    <div className="flex items-start justify-between gap-[16px]">
                      <p className={FX_TYPOGRAPHY.button}>AI Prompt</p>
                      <FxButton
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsAiPromptExpanded((current) => !current)}
                      >
                        {isAiPromptExpanded ? "Collapse" : "Expand"}
                      </FxButton>
                    </div>
                    <div className="mt-[12px]">
                      {isAiPromptExpanded ? (
                        <FxInput
                          textarea
                          name="aiPrompt"
                          placeholder="e.g. Keep it direct, practical, and candidate-friendly."
                          value={jobForm.aiPrompt}
                          onChange={handleJobFormChange}
                          className="min-h-[120px]"
                        />
                      ) : (
                        <FxInput
                          name="aiPrompt"
                          placeholder="Add optional AI guidance..."
                          value={jobForm.aiPrompt}
                          onChange={handleJobFormChange}
                        />
                      )}
                    </div>
                  </section>
                </section>
              ) : null}

              {activeSheetStep === "description" ? (
                <section className="space-y-[16px]">
                  {renderSectionHeader(
                    "Job Description",
                    "Keep the JD concise. AI can expand it later.",
                    <FxAiButton icon={WandSparkles} onClick={autofillJobDescription}>
                      Rewrite with AI
                    </FxAiButton>,
                  )}
                  <FxInput
                    textarea
                    name="jobDescription"
                    label="JD Editor"
                    placeholder="Describe the role, responsibilities, and what makes it exciting."
                    value={jobForm.jobDescription}
                    onChange={handleJobFormChange}
                    helperText="This powers candidate communication and screening context."
                    className="min-h-[180px]"
                  />
                  <div className="grid gap-[16px] md:grid-cols-2">
                    <FxInput
                      textarea
                      name="primarySkills"
                      label="Primary Skills"
                      placeholder="React, Node.js, ownership"
                      value={jobForm.primarySkills}
                      onChange={handleJobFormChange}
                      helperText="Comma-separated."
                    />
                    <FxInput
                      textarea
                      name="secondarySkills"
                      label="Secondary Skills"
                      placeholder="Mentoring, stakeholder communication"
                      value={jobForm.secondarySkills}
                      onChange={handleJobFormChange}
                      helperText="Optional supporting skills."
                    />
                  </div>
                  <FxInput
                    textarea
                    name="responsibilities"
                    label="Roles & Responsibilities"
                    placeholder="List the work the person should actually own."
                    value={jobForm.responsibilities}
                    onChange={handleJobFormChange}
                    className="min-h-[160px]"
                  />
                </section>
              ) : null}

              {activeSheetStep === "evaluation" ? (
                <section className="space-y-[16px]">
                  {renderSectionHeader(
                    "Evaluation",
                    "Give the AI enough context to screen well.",
                    <FxAiButton icon={WandSparkles} onClick={autofillEvaluation}>
                      Generate Context
                    </FxAiButton>,
                  )}
                  <FxInput
                    textarea
                    name="evaluationContext"
                    label="Context for Evaluation"
                    placeholder="What should the AI pay attention to when screening candidates?"
                    value={jobForm.evaluationContext}
                    onChange={handleJobFormChange}
                    className="min-h-[160px]"
                  />
                  <div className="space-y-[12px]">
                    <div className="flex items-center justify-between gap-[16px]">
                      <div className="space-y-[4px]">
                        <h4 className={FX_TYPOGRAPHY.button}>Interview Rounds / Evaluation Setup</h4>
                        <p className={`${FX_TYPOGRAPHY.fieldHint} text-[var(--fx-text-muted)]`}>
                          Keep the setup lightweight and actionable.
                        </p>
                      </div>
                      <FxButton type="button" variant="outline" size="sm" onClick={addRound}>
                        <Plus className="size-[16px]" />
                        Add Round
                      </FxButton>
                    </div>
                    <div className="space-y-[12px]">
                      {jobForm.evaluationRounds.map((round) => (
                        <div key={round.id} className="rounded-[12px] border border-[var(--fx-border)] bg-[var(--fx-surface)] p-[16px]">
                          <div className="grid gap-[12px] md:grid-cols-[160px_minmax(0,1fr)_auto]">
                            <FxInput
                              label="Round"
                              value={round.title}
                              onChange={(event) => updateRound(round.id, "title", event.target.value)}
                              placeholder="Round 1"
                            />
                            <FxInput
                              label="Stage"
                              value={round.details}
                              onChange={(event) => updateRound(round.id, "details", event.target.value)}
                              placeholder="Technical screen"
                            />
                            <button
                              type="button"
                              className={`mt-[24px] inline-flex h-[40px] w-[40px] items-center justify-center rounded-[6px] border border-[var(--fx-border)] text-[var(--fx-text-muted)] hover:bg-[var(--fx-surface-hover)] hover:text-[var(--fx-danger)]`}
                              onClick={() => removeRound(round.id)}
                              aria-label="Remove round"
                            >
                              <Trash2 className="size-[16px]" />
                            </button>
                          </div>
                          <FxInput
                            textarea
                            label="Additional Information"
                            value={round.note}
                            onChange={(event) => updateRound(round.id, "note", event.target.value)}
                            placeholder="What should this round check?"
                            className="mt-[12px] min-h-[96px]"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              ) : null}

              {activeSheetStep === "questionnaire" ? (
                <section className="space-y-[16px]">
                  {renderSectionHeader(
                    "Questionnaire",
                    "Define the screening flow and questions.",
                    <FxAiButton icon={WandSparkles} onClick={autofillQuestions}>
                      Suggest Questions
                    </FxAiButton>,
                  )}
                  <div className="grid gap-[12px] md:grid-cols-2">
                    {renderOptionCard({
                      value: "cv_and_prescreen",
                      title: "Ask both CV related questions and pre-screening",
                      description: "Use candidate CV context first, then ask the focused screening questions below.",
                      icon: ListChecks,
                      groupValue: jobForm.questionFormat,
                      onSelect: (value) =>
                        setJobForm((current) => ({
                          ...current,
                          questionFormat: value,
                        })),
                    })}
                    {renderOptionCard({
                      value: "prescreen_only",
                      title: "Ask only pre-screening questions",
                      description: "Keep the flow shorter when the job needs quick candidate qualification.",
                      icon: Sparkles,
                      groupValue: jobForm.questionFormat,
                      onSelect: (value) =>
                        setJobForm((current) => ({
                          ...current,
                          questionFormat: value,
                        })),
                    })}
                  </div>

                  <div className="space-y-[12px]">
                    <div className="flex items-center justify-between gap-[16px]">
                      <div className="space-y-[4px]">
                        <h4 className={FX_TYPOGRAPHY.button}>Pre-Screening Questions</h4>
                        <p className={`${FX_TYPOGRAPHY.fieldHint} text-[var(--fx-text-muted)]`}>
                          Add, remove, and tune the questions the AI should ask.
                        </p>
                      </div>
                      <div className="flex items-center gap-[8px]">
                        <FxAiButton onClick={() => addQuestion(DEFAULT_QUESTION_SUGGESTIONS[0])}>
                          Add Suggested
                        </FxAiButton>
                      </div>
                    </div>

                    <div className="space-y-[12px]">
                      {jobForm.questions.map((question) => (
                        <div key={question.id} className="rounded-[12px] border border-[var(--fx-border)] bg-[var(--fx-surface)] p-[16px]">
                          <div className="flex items-start justify-between gap-[12px]">
                            <span className="inline-flex rounded-full bg-[var(--fx-surface-selected)] px-[10px] py-[4px] text-[12px] font-medium text-[var(--fx-primary)]">
                              {question.label || "Question"}
                            </span>
                            <button
                              type="button"
                              className="inline-flex items-center justify-center rounded-[6px] text-[var(--fx-text-muted)] hover:text-[var(--fx-danger)]"
                              onClick={() => removeQuestion(question.id)}
                              aria-label="Remove question"
                            >
                              <Trash2 className="size-[16px]" />
                            </button>
                          </div>
                          <div className="mt-[12px] grid gap-[12px] md:grid-cols-2">
                            <FxInput
                              label="Question"
                              value={question.question}
                              onChange={(event) => updateQuestion(question.id, "question", event.target.value)}
                              placeholder="What is your current salary?"
                            />
                            <FxInput
                              label="AI Note"
                              value={question.note}
                              onChange={(event) => updateQuestion(question.id, "note", event.target.value)}
                              placeholder="Why the AI should ask this."
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex flex-wrap gap-[8px]">
                      {DEFAULT_QUESTION_SUGGESTIONS.map((question) => (
                        <FxButton
                          key={question.id}
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => addQuestion(question)}
                        >
                          <Plus className="size-[16px]" />
                          {question.label}
                        </FxButton>
                      ))}
                    </div>
                  </div>
                </section>
              ) : null}

              {activeSheetStep === "benefits" ? (
                <section className="space-y-[16px]">
                  {renderSectionHeader(
                    "Benefits",
                    "Keep this concise and candidate-facing.",
                    <FxAiButton icon={WandSparkles} onClick={autofillBenefits}>
                      Suggest Benefits
                    </FxAiButton>,
                  )}
                  <FxInput
                    textarea
                    name="benefitsSummary"
                    label="Benefits for Candidates"
                    placeholder="Hybrid flexibility, health cover, and quick feedback loops."
                    value={jobForm.benefitsSummary}
                    onChange={handleJobFormChange}
                    className="min-h-[160px]"
                    helperText="Use a simple summary instead of a heavy ATS benefits matrix."
                  />
                </section>
              ) : null}

              {activeSheetStep === "settings" ? (
                <section className="space-y-[16px]">
                  {renderSectionHeader(
                    "Settings",
                    "Only the essentials for the AI flow.",
                    <FxAiButton icon={WandSparkles} onClick={autofillSettings}>
                      Fill Defaults
                    </FxAiButton>,
                  )}
                  <div className="grid gap-[12px] md:grid-cols-2">
                    {renderOptionCard({
                      value: "call_with_email_backup",
                      title: "Call + email backup",
                      description: "AI calls first, then uses email if the call does not connect.",
                      icon: Sparkles,
                      groupValue: jobForm.preScreeningMode,
                      onSelect: (value) =>
                        setJobForm((current) => ({
                          ...current,
                          preScreeningMode: value,
                        })),
                    })}
                    {renderOptionCard({
                      value: "email_only",
                      title: "Email backup only",
                      description: "Keep communication lighter when email is enough.",
                      icon: Mail,
                      groupValue: jobForm.preScreeningMode,
                      onSelect: (value) =>
                        setJobForm((current) => ({
                          ...current,
                          preScreeningMode: value,
                        })),
                    })}
                  </div>

                  <div className="grid gap-[16px] md:grid-cols-2">
                    <label className="flex w-full flex-col gap-[8px]" htmlFor="callingBackup">
                      <span className={`${FX_TYPOGRAPHY.fieldLabel} text-[var(--fx-text)]`}>Fallback Channel</span>
                      <select
                        id="callingBackup"
                        name="callingBackup"
                        className={`min-h-[40px] w-full border ${FX_COLORS.border} ${FX_RADIUS.xs} bg-[var(--fx-bg)] px-[16px] py-[8px] ${FX_TYPOGRAPHY.input} text-[var(--fx-text)] outline-none focus:border-[var(--fx-primary)] focus:ring-2 focus:ring-[var(--fx-primary)]/20`}
                        value={jobForm.callingBackup}
                        onChange={handleJobFormChange}
                      >
                        <option value="email">Email</option>
                        <option value="whatsapp">WhatsApp</option>
                        <option value="phone">Phone call</option>
                      </select>
                    </label>
                    <FxInput
                      textarea
                      name="backupNotes"
                      label="Backup Notes"
                      placeholder="Add any fallback instructions for the recruiting team."
                      value={jobForm.backupNotes}
                      onChange={handleJobFormChange}
                      className="min-h-[140px]"
                    />
                  </div>
                </section>
              ) : null}

              {formError ? <p className={`${FX_TYPOGRAPHY.fieldHint} text-[var(--fx-danger)]`}>{formError}</p> : null}
            </SheetBody>

            <SheetFooter
              left={<span className={`${FX_TYPOGRAPHY.fieldHint} text-muted-foreground`}>Changes update across Jobs and Workspace</span>}
              right={
                <>
                  <FxButton type="button" variant="secondary" onClick={requestSheetClose}>
                    Cancel
                  </FxButton>
                  <FxButton type="button" variant="secondary" onClick={handleSaveDraft}>
                    Save as Draft
                  </FxButton>
                  <FxButton type="button" onClick={handlePublishJob}>
                    Publish
                    <ArrowRight className="size-[16px]" />
                  </FxButton>
                </>
              }
            />
          </form>
        </SheetContent>
      </Sheet>

      <AlertDialog open={Boolean(pendingAction)} onOpenChange={(open) => { if (!open) setPendingAction(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pendingAction?.type === "delete-job" ? "Delete job?" : "Discard changes?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pendingAction?.type === "delete-job"
                ? `This will permanently delete "${pendingAction?.title ?? "this job"}".`
                : "You have unsaved changes in the sheet. Closing now will discard them."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className={fxButtonClassName({ variant: "outline" })}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className={fxButtonClassName({ variant: "destructive" })}
              onClick={handleConfirmPendingAction}
            >
              {pendingAction?.type === "delete-job" ? "Delete Job" : "Discard Changes"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </FxProtectedAppPage>
  );
}
