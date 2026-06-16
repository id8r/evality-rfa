/* app/app/jobs/page.js | Jobs workspace page | Sree | 2026-06-14 */

"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import {
  ArrowRight,
  ArrowUpDown,
  Archive,
  Baby,
  Banknote,
  BadgeCheck,
  Brain,
  BusFront,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronUp,
  Coffee,
  Dumbbell,
  Gift,
  GraduationCap,
  HeartPulse,
  House,
  Laptop,
  ListChecks,
  Mail,
  MoreHorizontal,
  PiggyBank,
  Plus,
  Plane,
  RefreshCcw,
  Sparkles,
  Trash2,
  Upload,
  UtensilsCrossed,
  Users,
  WandSparkles,
  Clock3,
  Globe,
  ShieldPlus,
} from "lucide-react";

import { FxButton } from "@/components/FxButton";
import { FxAiButton } from "@/components/FxAiButton";
import { FxCreatableSelect } from "@/components/FxCreatableSelect";
import { FX_FIELD_STATES } from "@/components/FxFieldState";
import { FxInput } from "@/components/FxInput";
import { FxProtectedAppPage } from "@/components/FxProtectedAppPage";
import { FxRichTextEditor } from "@/components/FxRichTextEditor";
import { FxSelect } from "@/components/FxSelect";
import { FxTagInput } from "@/components/FxTagInput";
import { FxTable } from "@/components/FxTable";
import { showWarning } from "@/components/FxToast";
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
  Sheet,
  SheetBody,
  SheetContent,
  SheetFooter,
  SheetHeader,
} from "@/components/ui/sheet";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DEMO_EXPERIENCE_MODES, ROUTES, STORAGE_KEYS, WORKSPACE_TYPES } from "@/lib/FxConstants";
import { PAGE_COPY } from "@/lib/FxCopy";
import {
  createEmptyJobForm as createJobEmptyForm,
  createJobFormFromJob as createJobFormFromSchema,
  DEFAULT_JOB_QUESTION_SUGGESTIONS,
  DEFAULT_JOB_SHEET_ROUNDS,
  normalizeJobRecord,
  serializeJobFormToRecord,
  validateJobForm,
} from "@/lib/FxJobSchema";
import { fxButtonClassName } from "@/components/FxButton";
import {
  createJobId,
  ensureJobsStore,
  readStoredDemoExperience,
  readStoredCollection,
  readStoredWorkspaceType,
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

const DEFAULT_JOBS_VIEW_MODE = "table";
const SHOW_DEMO_CONTROLS = process.env.NEXT_PUBLIC_SHOW_DEMO_CONTROLS !== "false";

const JOB_SHEET_STEPS = [
  { value: "basic", label: "Basic Details" },
  { value: "description", label: "Job Description" },
  { value: "evaluation", label: "Evaluation" },
  { value: "questionnaire", label: "Questionnaire" },
  { value: "benefits", label: "Benefits" },
  { value: "settings", label: "Settings" },
];

const EVALUATION_CONTEXT_PROMPTS = [
  {
    id: "evaluation_focus",
    title: "What matters most when evaluating this role?",
    options: [
      "Hands-on role fit and practical problem solving",
      "Communication, clarity, and stakeholder handling",
      "Ownership, pace, and execution under pressure",
      "Systematic thinking and structured decision-making",
    ],
  },
  {
    id: "evaluation_signal",
    title: "Which signals should the AI prioritize?",
    options: [
      "Relevant experience and domain alignment",
      "Confidence in the candidate's screening answers",
      "Consistency between profile and conversation",
      "Evidence of impact, ownership, and follow-through",
    ],
  },
];

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
  return createJobEmptyForm();
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
  return createJobFormFromSchema(job);
}

const EMPLOYMENT_TYPE_OPTIONS = ["Full-time", "Part-time", "Contract", "Internship"];
const WORKPLACE_TYPE_OPTIONS = ["Remote", "Hybrid", "On-site"];
const CURRENCY_OPTIONS = ["INR", "USD", "EUR"];
const PRIORITY_OPTIONS = ["Low", "Medium", "High"];
const BASIC_FORM_FIELD_STACK_CLASS = "gap-[8px]";
const BASIC_FORM_CONTROL_CLASS = "min-h-[48px]";
const DEFAULT_BENEFIT_SELECTIONS = [
  "Cafeteria",
  "Health Insurance",
  "Performance Bonus",
  "Reimbursement for Courses",
  "Maternity & Paternity Leave",
];

const BENEFITS_GROUPS = [
  {
    title: "Office",
    items: [
      { label: "Cafeteria", icon: Coffee },
      { label: "Free Meal", icon: UtensilsCrossed },
      { label: "Office Transportation", icon: BusFront },
      { label: "Office Gym", icon: Dumbbell },
      { label: "Recreational Activities", icon: Users },
      { label: "Work From Home", icon: House },
    ],
  },
  {
    title: "Health Benefits",
    items: [
      { label: "Health Insurance", icon: HeartPulse },
      { label: "Life Insurance", icon: ShieldPlus },
      { label: "Mental Health", icon: Brain },
      { label: "Gym Membership", icon: Dumbbell },
    ],
  },
  {
    title: "Financial Benefits",
    items: [
      { label: "Performance Bonus", icon: Gift },
      { label: "Joining Bonus", icon: PiggyBank },
      { label: "Stock Options / Equity", icon: Banknote },
      { label: "Relocation Expenses", icon: Plane },
      { label: "Mobile Bill Reimbursement", icon: Laptop },
    ],
  },
  {
    title: "Professional Benefits",
    items: [
      { label: "Reimbursement for Courses", icon: GraduationCap },
      { label: "Job Training", icon: GraduationCap },
      { label: "Rewards and Recognition", icon: BadgeCheck },
      { label: "Onsite / International Work", icon: Globe },
    ],
  },
  {
    title: "Leaves",
    items: [
      { label: "Maternity & Paternity Leave", icon: Baby },
      { label: "Sick Leave", icon: CalendarDays },
      { label: "Flexible Hours", icon: Clock3 },
      { label: "Paid Time Off", icon: Plane },
    ],
  },
];

function toCreatableOptions(values) {
  return values.map((value) => ({ value, label: value }));
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

function fieldHeaderLabelClassName() {
  return `${FX_TYPOGRAPHY.metaLabel} font-normal text-[var(--fx-text-muted)]`;
}

function toggleListValue(list, value) {
  const normalizedList = Array.isArray(list) ? list : [];
  if (normalizedList.includes(value)) {
    return normalizedList.filter((item) => item !== value);
  }

  return [...normalizedList, value];
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
  const initialPageState = readStoredJobsPageState() ?? DEFAULT_PAGE_STATE;
  const [jobsViewMode, setJobsViewMode] = useState(() => {
    const demoExperience = readStoredDemoExperience();
    const storedViewMode = readStoredJobsViewMode();

    if (demoExperience === DEMO_EXPERIENCE_MODES.GET_STARTED) {
      return "empty";
    }

    if (demoExperience === DEMO_EXPERIENCE_MODES.LOGIN) {
      return DEFAULT_JOBS_VIEW_MODE;
    }

    return storedViewMode === "empty" ? "empty" : DEFAULT_JOBS_VIEW_MODE;
  });
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [jobForm, setJobForm] = useState(EMPTY_JOB_FORM);
  const [activeSheetStep, setActiveSheetStep] = useState("basic");
  const [validationErrors, setValidationErrors] = useState({});
  const [pendingAction, setPendingAction] = useState(null);
  const [isUploadJdOpen, setIsUploadJdOpen] = useState(false);
  const [isEvaluationContextOpen, setIsEvaluationContextOpen] = useState(false);
  const [isEvaluationLeaveGuardOpen, setIsEvaluationLeaveGuardOpen] = useState(false);
  const [pendingEvaluationNextStep, setPendingEvaluationNextStep] = useState(null);
  const [evaluationContextStep, setEvaluationContextStep] = useState(0);
  const [evaluationContextAnswers, setEvaluationContextAnswers] = useState({});
  const [isBenefitsBriefOpen, setIsBenefitsBriefOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState(initialPageState.searchTerm ?? DEFAULT_PAGE_STATE.searchTerm);
  const [selectedTab, setSelectedTab] = useState(initialPageState.selectedTab ?? DEFAULT_PAGE_STATE.selectedTab);
  const [sortConfig, setSortConfig] = useState(initialPageState.sortConfig ?? DEFAULT_PAGE_STATE.sortConfig);
  const [jobs, setJobs] = useState(() => ensureJobsStore().map(normalizeJobRecord).filter(Boolean));
  const searchInputRef = useRef(null);
  const tableSurfaceRef = useRef(null);
  const handledEditJobIdRef = useRef(null);
  const baselineJobForm = editingJob ? createFormFromJob(editingJob) : EMPTY_JOB_FORM;
  const isJobFormDirty = JSON.stringify(jobForm) !== JSON.stringify(baselineJobForm);
  const workspaceType = useSyncExternalStore(subscribeToWorkspaceTypeChange, readStoredWorkspaceType, () => null);
  const showClientInfo = workspaceType === WORKSPACE_TYPES.CLIENTS || workspaceType === WORKSPACE_TYPES.BOTH;
  const clientOptions = useMemo(() => {
    const storedClients = readStoredCollection(STORAGE_KEYS.CLIENTS) ?? [];
    return storedClients.map((client) => ({ value: client.name ?? client.company ?? client.label ?? "", label: client.name ?? client.company ?? client.label ?? "" })).filter((option) => option.value);
  }, []);
  const assigneeOptions = useMemo(() => {
    const storedRecruiters = readStoredCollection(STORAGE_KEYS.RECRUITERS) ?? [];
    const normalized = storedRecruiters.map((recruiter) => ({ value: recruiter.name ?? recruiter.label ?? "", label: recruiter.name ?? recruiter.label ?? "" })).filter((option) => option.value);
    return normalized.length ? normalized : toCreatableOptions(["John Doe", "Ayush Singh"]);
  }, []);
  const jobLocationType = String(jobForm.workplaceType || "").toLowerCase();
  const isRemote = jobLocationType === "remote";
  const isCityRequired = !isRemote;
  const hasJobDescription = Boolean(
    String(jobForm.jobDescription || "")
      .replace(/<br\s*\/?>/gi, "")
      .replace(/<\/(p|div|li|h1|h2|h3|h4|h5|h6)>/gi, " ")
      .replace(/<[^>]+>/g, "")
      .replace(/&nbsp;/gi, " ")
      .trim(),
  );
  const selectedBenefitLabels = useMemo(() => new Set(jobForm.benefitSelections ?? []), [jobForm.benefitSelections]);
  const fieldState = (fieldName) => (validationErrors[fieldName] ? FX_FIELD_STATES.ERROR : FX_FIELD_STATES.DEFAULT);
  const clearValidationErrors = (...fieldNames) => {
    setValidationErrors((current) => {
      const cleanedFields = fieldNames.filter(Boolean);

      if (!cleanedFields.length) {
        return current;
      }

      const nextErrors = { ...current };
      cleanedFields.forEach((fieldName) => {
        delete nextErrors[fieldName];
      });
      return nextErrors;
    });
  };

  function focusField(fieldName) {
    if (typeof window === "undefined") {
      return;
    }

    const field = document.querySelector(`[name="${fieldName}"]`) || document.getElementById(fieldName);

    if (field && typeof field.focus === "function") {
      field.focus();

      if (typeof field.select === "function") {
        field.select();
      }
    }
  }

  useEffect(() => {
    const syncJobsViewMode = () => {
      const demoExperience = readStoredDemoExperience();
      const storedViewMode = readStoredJobsViewMode();
      if (demoExperience === DEMO_EXPERIENCE_MODES.GET_STARTED) {
        setJobsViewMode("empty");
        return;
      }

      if (demoExperience === DEMO_EXPERIENCE_MODES.LOGIN) {
        setJobsViewMode(DEFAULT_JOBS_VIEW_MODE);
        return;
      }

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
    if (typeof window === "undefined") {
      return;
    }

    const editJobId = new URLSearchParams(window.location.search).get("edit");

    if (!editJobId || handledEditJobIdRef.current === editJobId) {
      return;
    }

    const jobToEdit = jobs.find((job) => job.id === editJobId);
    if (jobToEdit) {
      handledEditJobIdRef.current = editJobId;
      handleEditJob(jobToEdit);
    }
  }, [jobs]);

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
    const normalizedJobs = nextJobs.map((job) => normalizeJobRecord(job)).filter(Boolean);

    setJobs(normalizedJobs);
    writeStoredJobs(normalizedJobs);
  }

  function handleCreateJob() {
    setEditingJob(null);
    setJobForm(createEmptyJobForm());
    setActiveSheetStep("basic");
    setValidationErrors({});
    setIsSheetOpen(true);
  }

  function handleEditJob(job) {
    setEditingJob(job);
    setJobForm(createFormFromJob(job));
    setActiveSheetStep("basic");
    setValidationErrors({});
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
    setValidationErrors({});
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
    clearValidationErrors(name);
  }

  function handleSelectFieldChange(name, value) {
    setJobForm((current) => ({
      ...current,
      [name]: value,
    }));

    clearValidationErrors(name, name === "workplaceType" ? "city" : null, name === "workplaceType" ? "locality" : null);
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

  function autofillJobDescription() {
    const title = jobForm.title.trim() || "the role";
    const client = showClientInfo ? jobForm.client.trim() : "";

    setJobForm((current) => ({
      ...current,
      jobDescription:
        current.jobDescription ||
        `<h1>About the Role</h1><p>Join us as ${title}${client ? ` for ${client}` : ""}. This role keeps the candidate flow focused, contextual, and easy to evaluate.</p><h2>Overview</h2><ul><li>Shape screening context for the hiring team</li><li>Keep recruiter conversations tight and useful</li><li>Surface strong-fit candidates faster</li></ul>`,
      primarySkills: current.primarySkills || "Communication, Role Fit, Candidate Screening",
      secondarySkills: current.secondarySkills || "AI Collaboration, Reporting, Team Coordination",
      responsibilities:
        current.responsibilities ||
        `<ul><li>Turn hiring intent into clear screening context.</li><li>Keep candidate conversations aligned.</li><li>Surface the best-fit people faster.</li></ul>`,
    }));
  }

  function autofillEvaluation() {
    const title = jobForm.title.trim() || "the role";
    const client = showClientInfo ? jobForm.client.trim() : "";

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

  function applyEvaluationContextDraft() {
    const selectedAnswers = EVALUATION_CONTEXT_PROMPTS.flatMap((prompt) => evaluationContextAnswers[prompt.id] ?? []);
    const title = jobForm.title.trim() || "the role";
    const client = showClientInfo ? jobForm.client.trim() : "";
    const summary = selectedAnswers.length
      ? selectedAnswers.join("; ")
      : "Role fit, communication, and readiness to move quickly.";

    setJobForm((current) => ({
      ...current,
      evaluationContext:
        current.evaluationContext ||
        `Evaluate ${title}${client ? ` for ${client}` : ""} with focus on ${summary}. Keep the screening context practical, compact, and easy for recruiters to run.`,
      evaluationRounds:
        current.evaluationRounds.length > 0
          ? current.evaluationRounds
          : [
              createRoundItem("Round 1", "Screening", "AI-assisted baseline fit"),
              createRoundItem("Round 2", "Hiring Manager", "Ownership and communication"),
              createRoundItem("Round 3", "Final Discussion", "Decision readiness"),
            ],
    }));

    setIsEvaluationContextOpen(false);
    setEvaluationContextStep(0);
  }

  function autofillQuestions() {
    setJobForm((current) => ({
      ...current,
      questions: (() => {
        const existingQuestions = current.questions.map((question) => question.question.trim().toLowerCase());
        const nextSuggestion = DEFAULT_JOB_QUESTION_SUGGESTIONS.find(
          (question) => !existingQuestions.includes(question.question.trim().toLowerCase()),
        );

        if (!nextSuggestion) {
          return current.questions;
        }

        return [...current.questions, createQuestionItem(nextSuggestion.label, nextSuggestion.question, nextSuggestion.note)];
      })(),
    }));
  }

  function autofillBenefits() {
    const title = jobForm.title.trim() || "the role";

    setJobForm((current) => ({
      ...current,
      companyBrief:
        current.companyBrief ||
        `At ${title}, candidates can expect a clear process, responsive feedback, and a practical conversation focused on fit.`,
      benefitSelections: current.benefitSelections?.length ? current.benefitSelections : DEFAULT_BENEFIT_SELECTIONS,
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

  function commitJob(nextStatus = jobForm.status) {
    const validation = validateJobForm(jobForm, { includeClientInfo: showClientInfo });

    if (!validation.valid) {
      setValidationErrors(validation.errors);
      setActiveSheetStep("basic");
      return;
    }

    const nextJob = serializeJobFormToRecord({
      form: {
        ...jobForm,
        status: nextStatus === "Published" ? "Published" : "Draft",
      },
      existingJob: editingJob,
      includeClientInfo: showClientInfo,
      updatedBy: "John Doe",
    });

    const storedJob = upsertStoredJob({
      ...nextJob,
      id: editingJob?.id ?? createJobId(),
    });

    setJobs((currentJobs) => {
      const exists = currentJobs.some((job) => job.id === storedJob.id);
      return exists
        ? currentJobs.map((job) => (job.id === storedJob.id ? storedJob : job))
        : [storedJob, ...currentJobs];
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

  function validateBasicDetailsStep() {
    const validation = validateJobForm(jobForm, { includeClientInfo: showClientInfo });
    const relevantFields = ["title", "experience", "employmentType", "workplaceType", "positions"];

    if (isCityRequired) {
      relevantFields.push("city");
    }

    if (showClientInfo) {
      relevantFields.push("client");
    }

    const nextErrors = Object.fromEntries(
      Object.entries(validation.errors).filter(([fieldName]) => relevantFields.includes(fieldName)),
    );

    if (!Object.keys(nextErrors).length) {
      return true;
    }

    const firstMissingField = relevantFields.find((fieldName) => nextErrors[fieldName]);
    setValidationErrors((current) => ({
      ...current,
      ...nextErrors,
    }));
    showWarning("Complete basic details", "Fill the required fields before moving to the next step.");
    if (firstMissingField) {
      requestAnimationFrame(() => focusField(firstMissingField));
    }
    return false;
  }

  function canLeaveCurrentStep(nextStep) {
    if (activeSheetStep === nextStep) {
      return true;
    }

    if (activeSheetStep === "basic" && nextStep !== "basic") {
      return validateBasicDetailsStep();
    }

    if (activeSheetStep === "evaluation" && nextStep === "questionnaire") {
      if (!String(jobForm.evaluationContext || "").trim()) {
        setPendingEvaluationNextStep(nextStep);
        setIsEvaluationLeaveGuardOpen(true);
        return false;
      }
    }

    return true;
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

  function renderBenefitItem(groupTitle, item) {
    const Icon = item.icon;
    const isActive = selectedBenefitLabels.has(item.label);

    return (
      <button
        key={`${groupTitle}-${item.label}`}
        type="button"
        onClick={() =>
          setJobForm((current) => ({
            ...current,
            benefitSelections: toggleListValue(current.benefitSelections, item.label),
          }))
        }
        className={`flex w-full items-center gap-[10px] rounded-[10px] border px-[12px] py-[10px] text-left transition-colors ${
          isActive
            ? "border-[var(--fx-primary)] bg-[var(--fx-surface-selected)]"
            : "border-[var(--fx-border)] bg-[var(--fx-surface)] hover:bg-[var(--fx-surface-hover)]"
        }`}
      >
        <span
          className={`inline-flex size-[16px] shrink-0 items-center justify-center rounded-[4px] border ${
            isActive ? "border-[var(--fx-primary)] bg-[var(--fx-primary)] text-white" : "border-[var(--fx-border)] text-transparent"
          }`}
        >
          <Check className="size-[12px]" />
        </span>
        {Icon ? <Icon className="size-[16px] shrink-0 text-[var(--fx-primary)]" /> : null}
        <span className={`${FX_TYPOGRAPHY.body} font-medium text-[var(--fx-text)]`}>{item.label}</span>
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

  function renderEvaluationContextPromptCard() {
    const prompt = EVALUATION_CONTEXT_PROMPTS[evaluationContextStep];
    const selectedValues = evaluationContextAnswers[prompt.id] ?? [];

    return (
      <div className="space-y-[16px] rounded-[16px] border border-[var(--fx-border)] bg-[var(--fx-bg-soft)] p-[20px]">
        <div className="space-y-[4px]">
          <h3 className="text-[16px] leading-[24px] font-medium text-[var(--fx-text)]">{prompt.title}</h3>
          <p className="text-[13px] leading-[20px] text-[var(--fx-text-muted)]">
            Select all that apply. Evality will use these answers to generate the evaluation context.
          </p>
        </div>
        <div className="space-y-[8px]">
          {prompt.options.map((option) => {
            const isSelected = selectedValues.includes(option);

            return (
              <button
                key={option}
                type="button"
                className={`flex w-full items-start gap-[12px] rounded-[12px] border px-[14px] py-[12px] text-left transition-colors ${
                  isSelected
                    ? "border-[var(--fx-primary)] bg-[var(--fx-surface-selected)]"
                    : "border-[var(--fx-border)] bg-[var(--fx-surface)] hover:bg-[var(--fx-surface-hover)]"
                }`}
                onClick={() =>
                  setEvaluationContextAnswers((current) => ({
                    ...current,
                    [prompt.id]: isSelected
                      ? selectedValues.filter((value) => value !== option)
                      : [...selectedValues, option],
                  }))
                }
              >
                <span
                  className={`mt-[2px] inline-flex size-[16px] shrink-0 items-center justify-center rounded-[4px] border ${
                    isSelected
                      ? "border-[var(--fx-primary)] bg-[var(--fx-primary)] text-white"
                      : "border-[var(--fx-border)] bg-[var(--fx-surface)] text-transparent"
                  }`}
                />
                <span className="text-[14px] leading-[22px] text-[var(--fx-text)]">{option}</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  function handleGenerateBasicDetails() {}

  const sheetSummaryLocation = isRemote
    ? "Remote"
    : [jobForm.locality, jobForm.city].filter(Boolean).join(", ") || "—";
  const sheetSummaryItems = [
    { label: "Job Title", value: jobForm.title || "New Job" },
    ...(showClientInfo ? [{ label: "Client", value: jobForm.client || "—" }] : []),
    { label: "Experience", value: jobForm.experience || "—" },
    { label: "Employment Type", value: jobForm.employmentType || "—" },
    { label: "Workplace Type", value: jobForm.workplaceType || "—" },
    { label: "Location", value: sheetSummaryLocation },
    { label: "Status", value: editingJob?.status ?? "Draft" },
    { label: "Positions", value: jobForm.positions || "1" },
  ];

  const currentSheetStepIndex = JOB_SHEET_STEPS.findIndex((step) => step.value === activeSheetStep);
  const hasPreviousSheetStep = currentSheetStepIndex > 0;
  const hasNextSheetStep = currentSheetStepIndex >= 0 && currentSheetStepIndex < JOB_SHEET_STEPS.length - 1;

  function handlePreviousSheetStep() {
    if (!hasPreviousSheetStep) {
      requestSheetClose();
      return;
    }

    setActiveSheetStep(JOB_SHEET_STEPS[currentSheetStepIndex - 1].value);
  }

  function handleNextSheetStep() {
    if (!hasNextSheetStep) {
      return;
    }

    const nextStep = JOB_SHEET_STEPS[currentSheetStepIndex + 1].value;

    if (!canLeaveCurrentStep(nextStep)) {
      return;
    }

    setActiveSheetStep(nextStep);
  }

  const filteredJobs = useMemo(() => {
    let nextJobs = jobs;

    nextJobs = nextJobs.filter((job) => (selectedTab === "active" ? !job.isArchived : job.isArchived));

    if (searchTerm.trim()) {
      const query = searchTerm.trim().toLowerCase();
      nextJobs = nextJobs.filter((job) =>
        [job.title, job.client, job.location].some((value) => value.toLowerCase().includes(query)),
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
  const showJobsEmptyState = selectedTab === "active" && jobs.length === 0 && !searchTerm.trim();

  function handleResetDemoData() {
    resetDemoStore();
    setJobs(ensureJobsStore());
    setSearchTerm("");
    setSelectedTab("active");
    setSortConfig(DEFAULT_PAGE_STATE.sortConfig);
    setJobsViewMode(DEFAULT_JOBS_VIEW_MODE);
    setEditingJob(null);
    setJobForm(EMPTY_JOB_FORM);
    setActiveSheetStep("basic");
    setValidationErrors({});
  }

  function getJobWorkspaceHref(jobId, tab = "unscreened") {
    return `${ROUTES.JOB(jobId)}?tab=${tab}`;
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
      width: showClientInfo ? 260 : 320,
      minWidth: 240,
      grow: 2,
      cellClassName: FX_TYPOGRAPHY.clickableData,
      required: true,
      locked: true,
      hideable: false,
    },
    ...(showClientInfo
      ? [
          {
            key: "client",
            label: (
              <button type="button" className={fieldButtonClassName(true)} onClick={() => handleSort("client")}>
                <span>Client</span>
                <ArrowUpDown className="size-[14px]" />
              </button>
            ),
            width: 180,
            minWidth: 160,
            grow: 1,
          },
        ]
      : []),
    {
      key: "positions",
      label: <span className={fieldHeaderLabelClassName()}>Positions</span>,
      width: 96,
      minWidth: 88,
      maxWidth: 112,
      defaultVisible: true,
    },
    {
      key: "location",
      label: <span className={fieldHeaderLabelClassName()}>Location</span>,
      width: showClientInfo ? 200 : 240,
      minWidth: 180,
      grow: 1,
    },
    {
      key: "unscreenedCount",
      label: <span className={fieldHeaderLabelClassName()}>Unscreened</span>,
      width: 104,
      minWidth: 96,
      maxWidth: 112,
      align: "center",
    },
    {
      key: "screenedCount",
      label: <span className={fieldHeaderLabelClassName()}>Screened</span>,
      width: 96,
      minWidth: 88,
      maxWidth: 104,
      align: "center",
    },
    {
      key: "shortlistedCount",
      label: <span className={fieldHeaderLabelClassName()}>Shortlisted</span>,
      width: 112,
      minWidth: 104,
      maxWidth: 120,
      align: "center",
    },
    {
      key: "sharedCount",
      label: <span className={fieldHeaderLabelClassName()}>Shared</span>,
      width: 88,
      minWidth: 80,
      maxWidth: 96,
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
      width: 136,
      minWidth: 128,
    },
    {
      key: "actions",
      label: "",
      width: 64,
      minWidth: 64,
      maxWidth: 64,
      align: "right",
      required: true,
      locked: true,
      hideable: false,
    },
  ];

  function renderPipelineCell(value, label, href) {
    const content = (
      <span
        className={`inline-flex min-w-[56px] items-center justify-center rounded-[8px] px-[8px] py-[4px] text-center ${FX_TYPOGRAPHY.tableCell} text-[var(--fx-text)]`}
      >
        {value}
      </span>
    );

    if (href) {
      return (
        <Link
          href={href}
          className="inline-flex w-full items-center justify-center rounded-[8px] text-[var(--fx-text)] hover:bg-[var(--fx-bg-soft)] hover:text-[var(--fx-text)]"
          title={`Open ${label} candidates`}
        >
          {content}
        </Link>
      );
    }

    return (
      <span title={`${label}: ${value}`}>{content}</span>
    );
  }

  function renderStatusDot(job) {
    const isDraft = job.status === "Draft";

    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className={`inline-flex size-[8px] shrink-0 cursor-default rounded-full ${isDraft ? "bg-[var(--fx-warning)]" : "bg-[var(--fx-success)]"}`}
            aria-label={isDraft ? "Draft" : "Published"}
          />
        </TooltipTrigger>
        <TooltipContent side="top" sideOffset={10}>
          {isDraft ? "Draft" : "Published"}
        </TooltipContent>
      </Tooltip>
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
            href={getJobWorkspaceHref(job.id, "unscreened")}
            className={`block min-w-0 truncate text-[var(--fx-primary)] hover:text-[var(--fx-text)] ${FX_TYPOGRAPHY.clickableData}`}
            title={job.title}
          >
            {job.title}
          </Link>
        )}
      </div>
    ),
    client: <span className={`block truncate ${FX_TYPOGRAPHY.tableCell}`}>{job.client}</span>,
    positions: <span className={FX_TYPOGRAPHY.tableCell}>{job.positions}</span>,
    location: <span className={`block truncate ${FX_TYPOGRAPHY.tableCell}`}>{job.location}</span>,
    unscreenedCount: renderPipelineCell(job.unscreenedCount, "Unscreened", getJobWorkspaceHref(job.id, "unscreened")),
    screenedCount: renderPipelineCell(job.screenedCount, "Screened", getJobWorkspaceHref(job.id, "screened")),
    shortlistedCount: renderPipelineCell(job.shortlistedCount, "Shortlisted", getJobWorkspaceHref(job.id, "shortlisted")),
    sharedCount: renderPipelineCell(job.sharedCount, "Shared", getJobWorkspaceHref(job.id, "shared")),
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
                  <Link href={getJobWorkspaceHref(job.id, "unscreened")}>View Candidates</Link>
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
                  <Link href={getJobWorkspaceHref(job.id, "unscreened")}>View Candidates</Link>
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
      <TooltipProvider delayDuration={0}>
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
            {showJobsEmptyState || jobsViewMode === "empty" ? (
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
              <FxTable
                columns={columns}
                rows={rows}
                stickyHeader
                stickyFirstColumn
                stickyLastColumn
                scrollX
                className="h-full min-h-0"
                emptyMessage={PAGE_COPY.jobs.tableEmpty}
                enableColumnPicker
                storageKey={STORAGE_KEYS.JOBS_TABLE_COLUMNS}
              />
            ) : null}
          </div>
        </div>
        </section>
      </TooltipProvider>

      <div className="fixed bottom-[16px] right-[16px] z-20 flex items-center gap-[8px]">
        {SHOW_DEMO_CONTROLS ? (
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
        {SHOW_DEMO_CONTROLS ? (
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
            actions={(
              <>
                <FxButton
                  type="button"
                  variant="ghost"
                  className="text-[var(--fx-text-muted)] hover:bg-transparent hover:text-[var(--fx-text)]"
                  onClick={handleSaveDraft}
                >
                  Save as Draft
                </FxButton>
                <FxButton type="button" onClick={handlePublishJob}>
                  Publish
                </FxButton>
              </>
            )}
          />

          <form className="flex min-h-0 flex-1 flex-col" onSubmit={handleSubmitJob}>
            <SheetBody className="space-y-[24px]">
              <div className={`grid gap-[20px] rounded-[20px] border border-[color:color-mix(in_srgb,var(--fx-primary)_24%,var(--fx-border)_76%)] bg-[color:color-mix(in_srgb,var(--fx-primary)_4%,var(--fx-surface)_96%)] p-[20px] md:grid-cols-2 xl:grid-cols-4`}>
                {sheetSummaryItems.map((item) => (
                  <div key={item.label} className="space-y-[6px]">
                    <p className={`${FX_TYPOGRAPHY.metaLabel} font-normal text-[var(--fx-text-muted)]`}>{item.label}</p>
                    <p className={`${FX_TYPOGRAPHY.button} text-[var(--fx-text)]`}>{item.value}</p>
                  </div>
                ))}
              </div>

              <div className="border-b border-[var(--fx-border)]">
                <div className="flex gap-[24px] overflow-x-auto">
                  {JOB_SHEET_STEPS.map((step) => (
                    <button
                      key={step.value}
                      type="button"
                      className={getSheetStepTabClassName(step.value)}
                      onClick={() => {
                        if (!canLeaveCurrentStep(step.value)) {
                          return;
                        }

                        setActiveSheetStep(step.value);
                      }}
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
                  <div className="rounded-[16px] border border-[var(--fx-border)] bg-[var(--fx-surface)] p-[20px]">
                    <div className="space-y-[24px]">
                      <div className="grid gap-[16px] xl:grid-cols-[minmax(0,1fr)_176px] xl:items-center">
                        <div>
                          <FxInput
                            name="aiPrompt"
                            placeholder='Describe the role. Example: Senior React Developer, Bangalore, 5+ years, immediate joiners.'
                            value={jobForm.aiPrompt}
                            onChange={handleJobFormChange}
                            className={BASIC_FORM_CONTROL_CLASS}
                          />
                        </div>

                        <div className="xl:justify-self-end">
                          <FxAiButton
                            type="button"
                            onClick={handleGenerateBasicDetails}
                            disabled={!jobForm.aiPrompt?.trim()}
                            className="w-full justify-center xl:w-[176px]"
                          >
                            Auto Generate
                          </FxAiButton>
                        </div>
                      </div>

                      <div className="grid gap-[24px] xl:grid-cols-12">
                        <div className="xl:col-span-12">
                          <FxInput
                            name="title"
                            label="Job Title"
                            placeholder="Senior Frontend Engineer"
                            value={jobForm.title}
                            onChange={handleJobFormChange}
                            required
                            state={fieldState("title")}
                            validationMessage={validationErrors.title}
                            className={BASIC_FORM_CONTROL_CLASS}
                            stackClassName={BASIC_FORM_FIELD_STACK_CLASS}
                          />
                        </div>

                        <div className="xl:col-span-3">
                          <FxInput
                            name="experience"
                            label="Experience"
                            placeholder="3 - 5 yrs"
                            value={jobForm.experience}
                            onChange={handleJobFormChange}
                            required
                            state={fieldState("experience")}
                            validationMessage={validationErrors.experience}
                            className={BASIC_FORM_CONTROL_CLASS}
                            stackClassName={BASIC_FORM_FIELD_STACK_CLASS}
                          />
                        </div>

                        <div className="xl:col-span-3">
                          <FxSelect
                            name="employmentType"
                            options={EMPLOYMENT_TYPE_OPTIONS}
                            value={jobForm.employmentType}
                            onChange={(event) => handleSelectFieldChange("employmentType", event.target.value)}
                            label="Employment Type"
                            placeholder="Employment type"
                            required
                            state={fieldState("employmentType")}
                            validationMessage={validationErrors.employmentType}
                            className={BASIC_FORM_CONTROL_CLASS}
                            stackClassName={BASIC_FORM_FIELD_STACK_CLASS}
                          />
                        </div>

                        <div className="xl:col-span-3">
                          <FxSelect
                            name="workplaceType"
                            options={WORKPLACE_TYPE_OPTIONS}
                            value={jobForm.workplaceType}
                            onChange={(event) => handleSelectFieldChange("workplaceType", event.target.value)}
                            label="Workplace Type"
                            placeholder="Workplace type"
                            required
                            state={fieldState("workplaceType")}
                            validationMessage={validationErrors.workplaceType}
                            className={BASIC_FORM_CONTROL_CLASS}
                            stackClassName={BASIC_FORM_FIELD_STACK_CLASS}
                          />
                        </div>

                        <div className="xl:col-span-3">
                          <FxInput
                            name="positions"
                            label="Number of Positions"
                            min="1"
                            type="number"
                            value={jobForm.positions}
                            onChange={handleJobFormChange}
                            required
                            state={fieldState("positions")}
                            validationMessage={validationErrors.positions}
                            className={BASIC_FORM_CONTROL_CLASS}
                            stackClassName={BASIC_FORM_FIELD_STACK_CLASS}
                          />
                        </div>
                      </div>

                      <div className="space-y-[16px]">
                        <h3 className="text-[16px] leading-[24px] font-normal text-[var(--fx-text-muted)]">Location & Assignment</h3>
                        <div className="grid gap-[24px] xl:grid-cols-12">
                          <div className="xl:col-span-3">
                            <FxInput
                              name="city"
                              label="City"
                              placeholder="Bengaluru"
                              value={jobForm.city}
                              onChange={handleJobFormChange}
                              required={isCityRequired}
                              optional={!isCityRequired}
                              state={fieldState("city")}
                              validationMessage={validationErrors.city}
                              className={BASIC_FORM_CONTROL_CLASS}
                              stackClassName={BASIC_FORM_FIELD_STACK_CLASS}
                            />
                          </div>

                          <div className="xl:col-span-3">
                            <FxInput
                              name="locality"
                              label="Locality"
                              placeholder={isRemote ? "Optional for remote roles" : "HSR Layout"}
                              value={jobForm.locality}
                              onChange={handleJobFormChange}
                              optional
                              disabled={isRemote}
                              className={BASIC_FORM_CONTROL_CLASS}
                              stackClassName={BASIC_FORM_FIELD_STACK_CLASS}
                            />
                          </div>

                          {showClientInfo ? (
                            <div className="xl:col-span-3">
                              <FxCreatableSelect
                                id="client"
                                options={clientOptions}
                                value={jobForm.client}
                                onChange={(value) => handleSelectFieldChange("client", value)}
                                onCreate={(value) => handleSelectFieldChange("client", value)}
                                allowCreate
                                createLabel="Create new client"
                                label="Client"
                                placeholder="Select or create client"
                                searchPlaceholder="Search clients"
                                required
                                state={fieldState("client")}
                                validationMessage={validationErrors.client}
                                triggerClassName={BASIC_FORM_CONTROL_CLASS}
                                stackClassName={BASIC_FORM_FIELD_STACK_CLASS}
                              />
                            </div>
                          ) : null}

                          <div className={showClientInfo ? "xl:col-span-3" : "xl:col-span-6"}>
                            <FxSelect
                              name="assignee"
                              options={assigneeOptions}
                              value={jobForm.assignee}
                              onChange={(event) => handleSelectFieldChange("assignee", event.target.value)}
                              label="Job Assignee"
                              placeholder="Assign to recruiter"
                              optional
                              className={BASIC_FORM_CONTROL_CLASS}
                              stackClassName={BASIC_FORM_FIELD_STACK_CLASS}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-[16px]">
                        <h3 className="text-[16px] leading-[24px] font-normal text-[var(--fx-text-muted)]">Compensation</h3>
                        <div className="grid gap-[24px] xl:grid-cols-12">
                          <div className="xl:col-span-3">
                            <FxInput
                              name="salaryMin"
                              label="Salary Min"
                              type="number"
                              placeholder="1000000"
                              value={jobForm.salaryMin}
                              onChange={handleJobFormChange}
                              optional
                              className={BASIC_FORM_CONTROL_CLASS}
                              stackClassName={BASIC_FORM_FIELD_STACK_CLASS}
                            />
                          </div>

                          <div className="xl:col-span-3">
                            <FxInput
                              name="salaryMax"
                              label="Salary Max"
                              type="number"
                              placeholder="1500000"
                              value={jobForm.salaryMax}
                              onChange={handleJobFormChange}
                              optional
                              className={BASIC_FORM_CONTROL_CLASS}
                              stackClassName={BASIC_FORM_FIELD_STACK_CLASS}
                            />
                          </div>

                          <div className="xl:col-span-3">
                            <FxSelect
                              name="currency"
                              options={CURRENCY_OPTIONS}
                              value={jobForm.currency}
                              onChange={(event) => handleSelectFieldChange("currency", event.target.value)}
                              label="Currency"
                              placeholder="Currency"
                              optional
                              className={BASIC_FORM_CONTROL_CLASS}
                              stackClassName={BASIC_FORM_FIELD_STACK_CLASS}
                            />
                          </div>

                          <div className="xl:col-span-3">
                            <FxSelect
                              name="priority"
                              options={PRIORITY_OPTIONS}
                              value={jobForm.priority}
                              onChange={(event) => handleSelectFieldChange("priority", event.target.value)}
                              label="Priority"
                              placeholder="Priority"
                              optional
                              className={BASIC_FORM_CONTROL_CLASS}
                              stackClassName={BASIC_FORM_FIELD_STACK_CLASS}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              ) : null}

              {activeSheetStep === "description" ? (
                <section className="space-y-[32px]">
                  <div className="flex items-start justify-between gap-[16px]">
                    <div className="space-y-[4px]">
                      <h3 className="text-[16px] leading-[24px] font-normal text-[var(--fx-text)]">Job Description</h3>
                      <p className="text-[13px] leading-[20px] text-[var(--fx-text-muted)]">
                        Upload an existing JD or write one with AI.
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center justify-end gap-[10px]">
                      <FxButton type="button" variant="outline" className="gap-[8px]" onClick={() => setIsUploadJdOpen(true)}>
                        <Upload className="size-[16px]" />
                        Upload JD
                      </FxButton>
                      <FxAiButton icon={WandSparkles} onClick={autofillJobDescription}>
                        Write JD with AI
                      </FxAiButton>
                    </div>
                  </div>
                  <div className="space-y-[12px]">
                    <FxRichTextEditor
                      value={jobForm.jobDescription}
                      onChange={(nextValue) => handleSelectFieldChange("jobDescription", nextValue)}
                      placeholder="Add job description"
                      minHeight={280}
                    />
                  </div>

                  <div className="space-y-[12px]">
                    <div className="flex flex-wrap items-center justify-end gap-[12px]">
                      <FxAiButton icon={WandSparkles} onClick={autofillJobDescription} disabled={!hasJobDescription}>
                        Retrieve Primary Skills from JD
                      </FxAiButton>
                    </div>
                    <FxTagInput
                      value={fromCommaList(jobForm.primarySkills)}
                      onChange={(nextValue) => handleSelectFieldChange("primarySkills", toCommaList(nextValue))}
                      placeholder="Add primary skills"
                    />
                  </div>

                  <div className="space-y-[12px]">
                    <div className="flex flex-wrap items-center justify-end gap-[12px]">
                      <FxAiButton icon={WandSparkles} onClick={autofillJobDescription} disabled={!hasJobDescription}>
                        Retrieve Secondary Skills from JD
                      </FxAiButton>
                    </div>
                    <FxTagInput
                      value={fromCommaList(jobForm.secondarySkills)}
                      onChange={(nextValue) => handleSelectFieldChange("secondarySkills", toCommaList(nextValue))}
                      placeholder="Add secondary skills"
                    />
                  </div>

                  <div className="space-y-[12px]">
                    <div className="flex flex-wrap items-center justify-end gap-[12px]">
                      <FxAiButton icon={WandSparkles} onClick={autofillJobDescription} disabled={!hasJobDescription}>
                        Write Responsibilities with AI
                      </FxAiButton>
                    </div>
                    <FxRichTextEditor
                      value={jobForm.responsibilities}
                      onChange={(nextValue) => handleSelectFieldChange("responsibilities", nextValue)}
                      placeholder="Add roles and responsibilities"
                      minHeight={240}
                    />
                  </div>
                </section>
              ) : null}

              {activeSheetStep === "evaluation" ? (
                <section className="space-y-[16px]">
                  {renderSectionHeader(
                    "Evaluation Context",
                    "Define what matters most when evaluating candidates for this role.",
                    <FxAiButton
                      icon={WandSparkles}
                      onClick={() => {
                        setEvaluationContextStep(0);
                        setIsEvaluationContextOpen(true);
                      }}
                    >
                      Generate Context
                    </FxAiButton>,
                  )}
                  <FxInput
                    textarea
                    name="evaluationContext"
                    placeholder="What should the AI pay attention to when screening candidates?"
                    value={jobForm.evaluationContext}
                    onChange={handleJobFormChange}
                    className="min-h-[152px]"
                    stackClassName="gap-[4px]"
                  />
                  <p className={`${FX_TYPOGRAPHY.fieldHint} text-[var(--fx-text-muted)]`}>
                    Evality.ai will try to generate questions based on the Context provided for evaluation and the resume being uploaded by the candidate.
                  </p>
                  <div className="space-y-[12px]">
                    <div className="flex items-center justify-between gap-[16px]">
                      <div className="space-y-[4px]">
                        <h4 className="text-[16px] leading-[24px] font-normal text-[var(--fx-text-muted)]">
                          Interview Rounds / Evaluation Setup
                        </h4>
                      </div>
                      <FxButton type="button" variant="outline" size="sm" onClick={addRound}>
                        <Plus className="size-[16px]" />
                        Add Round
                      </FxButton>
                    </div>
                    <FxTable
                      density="compact"
                      stickyHeader={false}
                      scrollX={false}
                      columns={[
                        {
                          key: "round",
                          label: "Round",
                          width: 180,
                          minWidth: 160,
                          cellClassName: "align-top",
                        },
                        {
                          key: "stage",
                          label: "Stage",
                          width: 220,
                          minWidth: 180,
                          cellClassName: "align-top",
                        },
                        {
                          key: "info",
                          label: "Additional Information",
                          minWidth: 280,
                          grow: 1,
                          cellClassName: "align-top",
                        },
                      ]}
                      rows={jobForm.evaluationRounds.map((round, index) => ({
                        id: round.id,
                        round: (
                          <input
                            value={round.title}
                            onChange={(event) => updateRound(round.id, "title", event.target.value)}
                            placeholder={`Round ${index + 1}`}
                            className="h-[40px] w-full rounded-[8px] border border-[var(--fx-border)] bg-[var(--fx-surface)] px-[12px] py-0 text-[14px] leading-[22px] text-[var(--fx-text)] outline-none focus:border-[var(--fx-primary)] focus:ring-2 focus:ring-[var(--fx-primary)]/20"
                          />
                        ),
                        stage: (
                          <input
                            value={round.details}
                            onChange={(event) => updateRound(round.id, "details", event.target.value)}
                            placeholder="Screening"
                            className="h-[40px] w-full rounded-[8px] border border-[var(--fx-border)] bg-[var(--fx-surface)] px-[12px] py-0 text-[14px] leading-[22px] text-[var(--fx-text)] outline-none focus:border-[var(--fx-primary)] focus:ring-2 focus:ring-[var(--fx-primary)]/20"
                          />
                        ),
                        info: (
                          <div className="flex items-center gap-[12px]">
                            <input
                              value={round.note}
                              onChange={(event) => updateRound(round.id, "note", event.target.value)}
                              placeholder="AI-assisted baseline fit"
                              className="h-[40px] min-w-0 flex-1 rounded-[8px] border border-[var(--fx-border)] bg-[var(--fx-surface)] px-[12px] py-0 text-[14px] leading-[22px] text-[var(--fx-text)] outline-none focus:border-[var(--fx-primary)] focus:ring-2 focus:ring-[var(--fx-primary)]/20"
                            />
                            <button
                              type="button"
                              className="inline-flex h-[40px] w-[40px] shrink-0 items-center justify-center rounded-[6px] border border-[var(--fx-border)] text-[var(--fx-text-muted)] hover:bg-[var(--fx-surface-hover)] hover:text-[var(--fx-danger)]"
                              onClick={() => removeRound(round.id)}
                              aria-label="Remove round"
                            >
                              <Trash2 className="size-[16px]" />
                            </button>
                          </div>
                        ),
                      }))}
                    />
                  </div>
                </section>
              ) : null}

              {activeSheetStep === "questionnaire" ? (
                <section className="space-y-[16px]">
                  {renderSectionHeader(
                    "Questionnaire",
                    "Our AI Agent will collect answers for these questions.",
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
                          Keep these broad and recruiter-facing. The AI will collect answers for them.
                        </p>
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
                          <div className="mt-[12px] grid gap-[12px]">
                            <FxInput
                              label="Question"
                              className="min-h-[40px]"
                              value={question.question}
                              onChange={(event) => updateQuestion(question.id, "question", event.target.value)}
                              placeholder="How soon can you join?"
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex flex-wrap gap-[8px]">
                      {DEFAULT_JOB_QUESTION_SUGGESTIONS.map((question) => (
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
                <section className="space-y-[24px]">
                  {renderSectionHeader(
                    "Benefits",
                    null,
                    <FxAiButton icon={WandSparkles} onClick={autofillBenefits}>
                      Suggest Benefits
                    </FxAiButton>,
                  )}

                  <div className={`rounded-[16px] border border-[var(--fx-border)] bg-[var(--fx-bg-soft)]`}>
                    <button
                      type="button"
                      onClick={() => setIsBenefitsBriefOpen((current) => !current)}
                      className="flex w-full items-center justify-between gap-[16px] px-[16px] py-[14px] text-left"
                    >
                      <div className="space-y-[2px]">
                        <h4 className={FX_TYPOGRAPHY.cardTitle}>Company Information in Brief</h4>
                        <p className={`${FX_TYPOGRAPHY.fieldHint} text-[var(--fx-text-muted)]`}>
                          Keep the recruiter-facing message short and candidate-friendly.
                        </p>
                      </div>
                      {isBenefitsBriefOpen ? (
                        <ChevronUp className="size-[16px] shrink-0 text-[var(--fx-text-muted)]" />
                      ) : (
                        <ChevronDown className="size-[16px] shrink-0 text-[var(--fx-text-muted)]" />
                      )}
                    </button>
                    {isBenefitsBriefOpen ? (
                      <div className="border-t border-[var(--fx-border)] px-[16px] py-[16px]">
                        <FxInput
                          textarea
                          name="companyBrief"
                          label="Brief"
                          placeholder="At Jobhotspot, we keep hiring practical, responsive, and focused on fit."
                          value={jobForm.companyBrief}
                          onChange={handleJobFormChange}
                          className="min-h-[120px]"
                        />
                      </div>
                    ) : null}
                  </div>

                  <div className="space-y-[12px]">
                    <div className="flex items-center justify-between gap-[16px]">
                      <h4 className={FX_TYPOGRAPHY.cardTitle}>Benefits</h4>
                    </div>
                    <div className="grid gap-[16px] lg:grid-cols-2 xl:grid-cols-3">
                      {BENEFITS_GROUPS.map((group) => (
                        <div key={group.title} className="space-y-[12px] rounded-[16px] border border-[var(--fx-border)] bg-[var(--fx-surface)] p-[16px]">
                          <h5 className={`${FX_TYPOGRAPHY.button} text-[var(--fx-text)]`}>{group.title}</h5>
                          <div className="space-y-[8px]">
                            {group.items.map((item) => renderBenefitItem(group.title, item))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
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
                        className={`h-[40px] w-full border ${FX_COLORS.border} ${FX_RADIUS.xs} bg-[var(--fx-bg)] px-[16px] py-0 ${FX_TYPOGRAPHY.input} text-[var(--fx-text)] outline-none focus:border-[var(--fx-primary)] focus:ring-2 focus:ring-[var(--fx-primary)]/20`}
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

            </SheetBody>

            <SheetFooter
              right={
                <>
                  <FxButton type="button" variant="outline" onClick={handlePreviousSheetStep}>
                    Back
                  </FxButton>
                  <FxButton
                    type="button"
                    variant="secondary"
                    className="gap-[8px]"
                    onClick={handleNextSheetStep}
                    disabled={!hasNextSheetStep}
                  >
                    Next
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

      <AlertDialog open={isEvaluationLeaveGuardOpen} onOpenChange={setIsEvaluationLeaveGuardOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Evaluation context is empty</AlertDialogTitle>
            <AlertDialogDescription>
              Candidates&apos; AI scoring and the questionnaire flow may be impacted if you continue without
              defining evaluation context.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              className={fxButtonClassName({ variant: "outline" })}
              onClick={() => setIsEvaluationLeaveGuardOpen(false)}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className={fxButtonClassName({ variant: "primary" })}
              onClick={() => {
                setIsEvaluationLeaveGuardOpen(false);
                if (pendingEvaluationNextStep) {
                  setActiveSheetStep(pendingEvaluationNextStep);
                }
                setPendingEvaluationNextStep(null);
              }}
            >
              Continue anyway
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={isUploadJdOpen} onOpenChange={setIsUploadJdOpen}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>Upload Job Description</DialogTitle>
            <DialogDescription>Drop a JD file here or upload one to extract role content.</DialogDescription>
          </DialogHeader>
          <div className="rounded-[20px] border border-dashed border-[var(--fx-border)] bg-[var(--fx-bg-soft)] p-[24px] text-center">
            <div className="mx-auto flex size-[56px] items-center justify-center rounded-full bg-[color:color-mix(in_srgb,var(--fx-primary)_10%,white_90%)] text-[var(--fx-primary)]">
              <Upload className="size-[24px]" />
            </div>
            <div className="mt-[16px] text-[16px] leading-[24px] font-medium text-[var(--fx-text)]">
              Drag and drop PDF or DOCX here
            </div>
            <div className="mt-[8px] text-[14px] leading-[22px] text-[var(--fx-text-muted)]">or</div>
            <div className="mt-[16px] flex justify-center">
              <FxButton type="button" variant="primary" onClick={() => setIsUploadJdOpen(false)}>
                Upload JD
              </FxButton>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isEvaluationContextOpen} onOpenChange={setIsEvaluationContextOpen}>
        <DialogContent className="sm:max-w-[720px]">
          <DialogHeader>
            <DialogTitle>Auto Generate Context</DialogTitle>
            <DialogDescription>
              Select applicable questions and provide answers. Evality will generate the evaluation context from them.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-[16px]">
            {renderEvaluationContextPromptCard()}
            <div className="flex items-center justify-between gap-[12px]">
              <FxButton
                type="button"
                variant="outline"
                disabled={evaluationContextStep === 0}
                onClick={() => setEvaluationContextStep((current) => Math.max(0, current - 1))}
              >
                Back
              </FxButton>
              <div className="flex items-center gap-[8px]">
                <span className="text-[13px] leading-[20px] text-[var(--fx-text-muted)]">
                  {evaluationContextStep + 1} / {EVALUATION_CONTEXT_PROMPTS.length}
                </span>
                {evaluationContextStep < EVALUATION_CONTEXT_PROMPTS.length - 1 ? (
                  <FxButton
                    type="button"
                    variant="secondary"
                    onClick={() =>
                      setEvaluationContextStep((current) => Math.min(EVALUATION_CONTEXT_PROMPTS.length - 1, current + 1))
                    }
                  >
                    Next
                  </FxButton>
                ) : (
                  <FxButton type="button" onClick={applyEvaluationContextDraft}>
                    Save & Generate Context
                  </FxButton>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </FxProtectedAppPage>
  );
}
/* - - - - - - - - - - - - - - - - */
