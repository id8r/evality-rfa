/* app/app/jobs/page.js | Jobs workspace page | Sree | 2026-06-14 */

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpDown,
  Archive,
  Baby,
  Banknote,
  BadgeCheck,
  Brain,
  BusFront,
  CalendarDays,
  Coffee,
  Circle,
  Dumbbell,
  Gift,
  GraduationCap,
  HeartPulse,
  House,
  Laptop,
  ListChecks,
  Mail,
  MoreHorizontal,
  Pencil,
  PiggyBank,
  Plus,
  Plane,
  RefreshCcw,
  GripVertical,
  Save,
  Sparkles,
  Trash2,
  Upload,
  UtensilsCrossed,
  Users,
  Clock3,
  Globe,
  ShieldPlus,
} from "lucide-react";

import { FxButton } from "@/components/FxButton";
import { FxAiButton } from "@/components/FxAiButton";
import { FX_FIELD_STATES, FxFieldLabel } from "@/components/FxFieldState";
import { FxInput } from "@/components/FxInput";
import { FxProtectedAppPage } from "@/components/FxProtectedAppPage";
import { FxRichTextEditor } from "@/components/FxRichTextEditor";
import { FxSelect } from "@/components/FxSelect";
import { FxTagInput } from "@/components/FxTagInput";
import { FxTable } from "@/components/FxTable";
import { FxTabs } from "@/components/FxTabs";
import { showSuccess, showWarning } from "@/components/FxToast";
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
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
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
import { DEMO_EXPERIENCE_MODES, ROUTES, STORAGE_KEYS, WORKSPACE_TYPES } from "@/lib/FxConstants";
import { PAGE_COPY } from "@/lib/FxCopy";
import {
  createEmptyJobForm as createJobEmptyForm,
  createJobFormFromJob as createJobFormFromSchema,
  DEFAULT_COMPANY_BRIEF,
  DEFAULT_JOB_QUESTION_SUGGESTIONS,
  DEFAULT_JOB_SHEET_ROUNDS,
  buildSalaryRangeLabel,
  normalizeJobRecord,
  serializeJobFormToRecord,
  validateJobForm,
} from "@/lib/FxJobSchema";
import { fxButtonClassName } from "@/components/FxButton";
import {
  createJobId,
  ensureJobsStore,
  readStoredDemoExperience,
  readStoredWorkspaceType,
  readStoredJobsPageState,
  readStoredJobsViewMode,
  resetDemoStore,
  upsertStoredJob,
  writeStoredJobs,
  writeStoredJobsPageState,
  writeStoredJobsViewMode,
} from "@/lib/FxStore";
import { FX_COLORS, FX_LAYOUT, FX_RADIUS, FX_TYPOGRAPHY, TABLE_TYPOGRAPHY } from "@/lib/FxTheme";
import { cn } from "@/lib/FxUtils";

const DEFAULT_PAGE_STATE = {
  searchTerm: "",
  selectedTab: "active",
  sortConfig: { key: "updatedAt", direction: "desc" },
};

const DEFAULT_JOBS_VIEW_MODE = "table";
const SHOW_DEMO_CONTROLS = process.env.NEXT_PUBLIC_SHOW_DEMO_CONTROLS !== "false";
const CURRENCY_FORMAT_LOCALES = {
  INR: "en-IN",
  USD: "en-US",
  EUR: "de-DE",
};

const JOB_SHEET_STEPS = [
  { value: "basic", label: "Basic Details" },
  { value: "description", label: "Job Description" },
  { value: "questionnaire", label: "Screening Method" },
  { value: "benefits", label: "Benefits" },
  { value: "evaluation", label: "Evaluation" },
  { value: "review", label: "Review" },
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

function stripHtmlContent(value) {
  return String(value ?? "")
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<\/(p|div|li|h1|h2|h3|h4|h5|h6)>/gi, " ")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .trim();
}
/* - - - - - - - - - - - - - - - - */

function getCurrencyFormattingLocale(currency = "INR") {
  return CURRENCY_FORMAT_LOCALES[currency] || "en-US";
}
/* - - - - - - - - - - - - - - - - */

function formatCurrencyInputValue(value, currency = "INR") {
  const digitsOnly = String(value ?? "").replace(/[^\d]/g, "");

  if (!digitsOnly) {
    return "";
  }

  const numericValue = Number(digitsOnly);

  if (!Number.isFinite(numericValue)) {
    return digitsOnly;
  }

  return new Intl.NumberFormat(getCurrencyFormattingLocale(currency), {
    maximumFractionDigits: 0,
    useGrouping: true,
  }).format(numericValue);
}

function hasRichTextContent(value) {
  return Boolean(stripHtmlContent(value));
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

function normalizeQuestionKey(value) {
  return String(value ?? "").trim().toLowerCase();
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
const SCREENING_METHOD_OPTIONS = [
  { value: "manual", title: "Manual", description: "Review and qualify candidates manually." },
  { value: "form", title: "Form Based", description: "Collect structured responses using a questionnaire." },
  { value: "web_call", title: "Web Call (AI)", description: "Run AI-led web screening with editable questions." },
  { value: "phone", title: "AI Phone Call", description: "Run AI-led phone screening with the same question flow." },
];
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

function formatExperienceSummary(fromValue, toValue) {
  const from = String(fromValue ?? "").trim();
  const to = String(toValue ?? "").trim();

  if (!from && !to) {
    return "—";
  }

  if (from && to) {
    return `${from} - ${to} years`;
  }

  return `${from || to} years`;
}

function formatReviewExperienceSummary(fromValue, toValue) {
  const from = String(fromValue ?? "").trim();
  const to = String(toValue ?? "").trim();

  if (!from && !to) {
    return "—";
  }

  if (from && to) {
    return `${from}–${to} Years`;
  }

  return `${from || to} Year${String(from || to) === "1" ? "" : "s"}`;
}

function formatQuestionFormatLabel(value) {
  if (value === "prescreen_only") {
    return "Pre-Screening Only";
  }

  return "CV + Pre-Screening";
}

function fieldButtonClassName(isInteractive = false) {
  return `${TABLE_TYPOGRAPHY.header} font-normal text-[var(--fx-text-muted)] ${
    isInteractive ? "inline-flex cursor-pointer items-center gap-[8px] text-left hover:text-[var(--fx-text)]" : ""
  }`;
}

function fieldHeaderLabelClassName() {
  return `${TABLE_TYPOGRAPHY.header} font-normal text-[var(--fx-text-muted)]`;
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
  const router = useRouter();
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
  const [evaluationContextStep, setEvaluationContextStep] = useState(0);
  const [evaluationContextAnswers, setEvaluationContextAnswers] = useState({});
  const [evaluationContextPromptInclusions, setEvaluationContextPromptInclusions] = useState({});
  const [isCustomQuestionComposerOpen, setIsCustomQuestionComposerOpen] = useState(false);
  const [customQuestionDraft, setCustomQuestionDraft] = useState("");
  const [customQuestionSuggestion, setCustomQuestionSuggestion] = useState("");
  const [removedPresetQuestionLabels, setRemovedPresetQuestionLabels] = useState([]);
  const [editingQuestionId, setEditingQuestionId] = useState(null);
  const [editingQuestionDraft, setEditingQuestionDraft] = useState(null);
  const [draggedQuestionId, setDraggedQuestionId] = useState(null);
  const [searchTerm, setSearchTerm] = useState(initialPageState.searchTerm ?? DEFAULT_PAGE_STATE.searchTerm);
  const [selectedTab, setSelectedTab] = useState(initialPageState.selectedTab ?? DEFAULT_PAGE_STATE.selectedTab);
  const [sortConfig, setSortConfig] = useState(initialPageState.sortConfig ?? DEFAULT_PAGE_STATE.sortConfig);
  const [jobs, setJobs] = useState(() => ensureJobsStore().map(normalizeJobRecord).filter(Boolean));
  const [sheetReturnTo, setSheetReturnTo] = useState("");
  const searchInputRef = useRef(null);
  const jobTitleInputRef = useRef(null);
  const customQuestionInputRef = useRef(null);
  const tableSurfaceRef = useRef(null);
  const handledEditJobIdRef = useRef(null);
  const [shouldFocusJobTitleOnOpen, setShouldFocusJobTitleOnOpen] = useState(false);
  const baselineJobForm = editingJob ? createFormFromJob(editingJob) : EMPTY_JOB_FORM;
  const isJobFormDirty = JSON.stringify(jobForm) !== JSON.stringify(baselineJobForm);
  const workspaceType = useSyncExternalStore(subscribeToWorkspaceTypeChange, readStoredWorkspaceType, () => null);
  const showClientInfo = workspaceType === WORKSPACE_TYPES.CLIENTS || workspaceType === WORKSPACE_TYPES.BOTH;
  const jobLocationType = String(jobForm.workplaceType || "").toLowerCase();
  const isRemote = jobLocationType === "remote";
  const isCityRequired = !isRemote;
  const [isBenefitsBriefExpanded, setIsBenefitsBriefExpanded] = useState(false);
  const evaluationContextMissing = !stripHtmlContent(jobForm.evaluationContext);
  const selectedBenefitLabels = useMemo(() => new Set(jobForm.benefitSelections ?? []), [jobForm.benefitSelections]);
  const selectedQuestionKeys = useMemo(() => {
    const keys = new Set();

    (jobForm.questions ?? []).forEach((question) => {
      const labelKey = normalizeQuestionKey(question.label);
      const questionKey = normalizeQuestionKey(question.question);

      if (labelKey) {
        keys.add(labelKey);
      }

      if (questionKey) {
        keys.add(questionKey);
      }
    });

    return keys;
  }, [jobForm.questions]);
  const availableDefaultQuestions = useMemo(
    () =>
      DEFAULT_JOB_QUESTION_SUGGESTIONS.filter((question) => {
        const labelKey = normalizeQuestionKey(question.label);
        const questionKey = normalizeQuestionKey(question.question);

        return !selectedQuestionKeys.has(labelKey) && !selectedQuestionKeys.has(questionKey);
      }).sort((left, right) => {
        const leftKey = normalizeQuestionKey(left.label);
        const rightKey = normalizeQuestionKey(right.label);
        const leftIndex = removedPresetQuestionLabels.indexOf(leftKey);
        const rightIndex = removedPresetQuestionLabels.indexOf(rightKey);

        if (leftIndex === -1 && rightIndex === -1) {
          return 0;
        }

        if (leftIndex === -1) {
          return -1;
        }

        if (rightIndex === -1) {
          return 1;
        }

        return leftIndex - rightIndex;
      }),
    [removedPresetQuestionLabels, selectedQuestionKeys],
  );
  const primarySkillTags = useMemo(() => fromCommaList(jobForm.primarySkills), [jobForm.primarySkills]);
  const secondarySkillTags = useMemo(() => fromCommaList(jobForm.secondarySkills), [jobForm.secondarySkills]);
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

    setSheetReturnTo(new URLSearchParams(window.location.search).get("returnTo") ?? "");
  }, []);

  useEffect(() => {
    if (!isSheetOpen || !shouldFocusJobTitleOnOpen) {
      return;
    }

    window.requestAnimationFrame(() => {
      jobTitleInputRef.current?.focus?.();
      jobTitleInputRef.current?.select?.();
    });

    setShouldFocusJobTitleOnOpen(false);
  }, [isSheetOpen, shouldFocusJobTitleOnOpen]);

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
    setShouldFocusJobTitleOnOpen(true);
    setIsSheetOpen(true);
  }

  function handleEditJob(job) {
    setEditingJob(job);
    setJobForm(createFormFromJob(job));
    setActiveSheetStep("basic");
    setValidationErrors({});
    setShouldFocusJobTitleOnOpen(false);
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

  function resetJobSheetState({ navigateBack = false } = {}) {
    setIsSheetOpen(false);
    setEditingJob(null);
    setJobForm(createEmptyJobForm());
    setActiveSheetStep("basic");
    setValidationErrors({});
    setPendingAction(null);
    setShouldFocusJobTitleOnOpen(false);

    if (navigateBack && sheetReturnTo) {
      router.replace(sheetReturnTo, { scroll: false });
    }
  }

  function requestSheetClose() {
    if (isJobFormDirty) {
      setPendingAction({ type: "discard-sheet" });
      return;
    }

    resetJobSheetState({ navigateBack: Boolean(sheetReturnTo) });
  }

  function handleSheetOpenChange(nextOpen) {
    if (nextOpen) {
      setIsSheetOpen(true);
      return;
    }

    requestSheetClose();
  }

  function requestDeleteJob(job, { navigateToJobsTable = false } = {}) {
    setPendingAction({
      type: "delete-job",
      jobId: job.id,
      title: job.title,
      navigateToJobsTable,
    });
  }

  function handleConfirmPendingAction() {
    if (!pendingAction) {
      return;
    }

    if (pendingAction.type === "delete-job") {
      handleDeleteJob(pendingAction.jobId);
      if (pendingAction.navigateToJobsTable) {
        resetJobSheetState();
        router.replace(ROUTES.JOBS, { scroll: false });
      }
    }

    if (pendingAction.type === "discard-sheet") {
      resetJobSheetState({ navigateBack: Boolean(sheetReturnTo) });
    } else {
      setPendingAction(null);
    }
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
/* - - - - - - - - - - - - - - - - */

  function handleCurrencyAmountFieldChange(fieldName, value) {
    const numericValue = String(value ?? "").replace(/[^\d]/g, "");

    setJobForm((current) => ({
      ...current,
      [fieldName]: numericValue,
    }));

    clearValidationErrors(fieldName);
  }

  function clearSkillsField(fieldName) {
    setJobForm((current) => ({
      ...current,
      [fieldName]: "",
    }));
  }

  function handleExperienceFieldChange(fieldName, value) {
    const nextFrom = fieldName === "experienceFrom" ? value : jobForm.experienceFrom;
    const nextTo = fieldName === "experienceTo" ? value : jobForm.experienceTo;

    setJobForm((current) => {
      const nextForm = {
        ...current,
        [fieldName]: value,
      };

      nextForm.experience = [nextForm.experienceFrom, nextForm.experienceTo].filter(Boolean).join(" - ");
      return nextForm;
    });

    clearValidationErrors(fieldName, "experience", "experienceTo");

    if (String(nextFrom).trim() && String(nextTo).trim()) {
      const fromValue = Number(nextFrom);
      const toValue = Number(nextTo);

      if (!Number.isNaN(fromValue) && !Number.isNaN(toValue) && fromValue > toValue) {
        setValidationErrors((current) => ({
          ...current,
          experienceTo: "Check range",
        }));
      }
    }
  }

  function addQuestion(question) {
    const questionLabelKey = normalizeQuestionKey(question.label);

    setJobForm((current) => ({
      ...current,
      questions: [...current.questions, createQuestionItem(question.label, question.question, question.note)],
    }));

    if (questionLabelKey) {
      setRemovedPresetQuestionLabels((current) => current.filter((label) => label !== questionLabelKey));
    }
  }

  function removeQuestion(questionId) {
    const removedQuestion = jobForm.questions.find((question) => question.id === questionId);
    if (removedQuestion) {
      const removedLabelKey = normalizeQuestionKey(removedQuestion.label);
      const isPresetQuestion = DEFAULT_JOB_QUESTION_SUGGESTIONS.some(
        (question) =>
          normalizeQuestionKey(question.label) === removedLabelKey ||
          normalizeQuestionKey(question.question) === normalizeQuestionKey(removedQuestion.question),
      );

      if (isPresetQuestion && removedLabelKey) {
        setRemovedPresetQuestionLabels((currentLabels) => {
          const nextLabels = currentLabels.filter((label) => label !== removedLabelKey);
          nextLabels.push(removedLabelKey);
          return nextLabels;
        });
      }
    }

    setJobForm((current) => ({
      ...current,
      questions: current.questions.filter((question) => question.id !== questionId),
    }));
  }

  function updateQuestion(questionId, field, value) {
    setJobForm((current) => ({
      ...current,
      questions: current.questions.map((question) =>
        question.id === questionId
          ? {
              ...question,
              [field]: value,
            }
          : question,
      ),
    }));
  }

  function beginQuestionEdit(question) {
    setEditingQuestionId(question.id);
    setEditingQuestionDraft({
      label: question.label,
      question: question.question,
    });
  }

  function cancelQuestionEdit() {
    setEditingQuestionId(null);
    setEditingQuestionDraft(null);
  }

  function saveQuestionEdit(questionId) {
    if (!editingQuestionDraft) {
      setEditingQuestionId(null);
      return;
    }

    setJobForm((current) => ({
      ...current,
      questions: current.questions.map((question) =>
        question.id === questionId
          ? {
              ...question,
              label: editingQuestionDraft.label,
              question: editingQuestionDraft.question,
            }
          : question,
      ),
    }));

    setEditingQuestionId(null);
    setEditingQuestionDraft(null);
  }

  function moveQuestion(questionId, direction) {
    setJobForm((current) => {
      const currentIndex = current.questions.findIndex((question) => question.id === questionId);
      if (currentIndex === -1) {
        return current;
      }

      const nextIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
      if (nextIndex < 0 || nextIndex >= current.questions.length) {
        return current;
      }

      const nextQuestions = [...current.questions];
      const [question] = nextQuestions.splice(currentIndex, 1);
      nextQuestions.splice(nextIndex, 0, question);

      return {
        ...current,
        questions: nextQuestions,
      };
    });
  }

  function moveQuestionToIndex(questionId, targetIndex) {
    setJobForm((current) => {
      const currentIndex = current.questions.findIndex((question) => question.id === questionId);
      if (currentIndex === -1 || targetIndex < 0 || targetIndex >= current.questions.length || currentIndex === targetIndex) {
        return current;
      }

      const nextQuestions = [...current.questions];
      const [question] = nextQuestions.splice(currentIndex, 1);
      nextQuestions.splice(targetIndex, 0, question);

      return {
        ...current,
        questions: nextQuestions,
      };
    });
  }

  function handleQuestionCountChange(event) {
    const rawValue = event.target.value;
    const nextCount = Math.max(0, Number.parseInt(rawValue || "0", 10) || 0);

    setJobForm((current) => {
      const currentQuestions = Array.isArray(current.questions) ? current.questions : [];

      if (nextCount <= currentQuestions.length) {
        return {
          ...current,
          questions: currentQuestions.slice(0, nextCount),
        };
      }

      const nextQuestions = [...currentQuestions];
      const usedKeys = new Set(
        nextQuestions.flatMap((question) => [
          normalizeQuestionKey(question.label),
          normalizeQuestionKey(question.question),
        ]),
      );

      const availableQuestions = DEFAULT_JOB_QUESTION_SUGGESTIONS.filter((question) => {
        const labelKey = normalizeQuestionKey(question.label);
        const questionKey = normalizeQuestionKey(question.question);

        return !usedKeys.has(labelKey) && !usedKeys.has(questionKey);
      });

      while (nextQuestions.length < nextCount) {
        const template = availableQuestions.shift();

        if (template) {
          nextQuestions.push(createQuestionItem(template.label, template.question, template.note));
          continue;
        }

        const index = nextQuestions.length + 1;
        nextQuestions.push(createQuestionItem(`Custom ${index}`, `Question ${index}`, ""));
      }

      return {
        ...current,
        questions: nextQuestions,
      };
    });
  }

  function suggestCustomQuestion(nextValue) {
    const text = String(nextValue ?? "").toLowerCase().trim();

    if (!text) {
      return "";
    }

    if (/(availability|join|start|immediately|notice)/.test(text)) {
      return "We must fill this role immediately, how soon can you join us?";
    }

    if (/(salary|compensation|pay|ctc|package)/.test(text)) {
      return "What are your salary expectations for this role?";
    }

    if (/(remote|onsite|on-site|hybrid|location|relocate|relocation)/.test(text)) {
      return "Are you comfortable with the expected work setup and location?";
    }

    if (/(experience|background|hands-on|project|skills)/.test(text)) {
      return "What relevant experience do you have for this role?";
    }

    if (/(team|collaboration|stakeholder|communication)/.test(text)) {
      return "Can you describe a time you worked closely with a team to deliver a result?";
    }

    return "Tell us about your most relevant experience for this role.";
  }

  function readQuestionValue(nextValue) {
    if (typeof nextValue === "string" || typeof nextValue === "number") {
      return String(nextValue);
    }

    if (nextValue && typeof nextValue === "object") {
      const resolvedValue = nextValue.target?.value ?? nextValue.currentTarget?.value ?? nextValue.value;
      if (resolvedValue != null) {
        return String(resolvedValue);
      }
    }

    return "";
  }

  function handleCustomQuestionChange(nextValue) {
    const resolvedValue = readQuestionValue(nextValue);
    setCustomQuestionDraft(resolvedValue);
    setCustomQuestionSuggestion(suggestCustomQuestion(resolvedValue));
  }

  function acceptCustomQuestionSuggestion() {
    if (!customQuestionSuggestion) {
      return;
    }

    setCustomQuestionDraft(customQuestionSuggestion);
  }

  function commitCustomQuestion(nextQuestion = customQuestionDraft) {
    const resolvedQuestion = readQuestionValue(nextQuestion) || customQuestionDraft;
    const trimmedQuestion = String(resolvedQuestion ?? "").trim();

    if (!trimmedQuestion) {
      return;
    }

    addQuestion({
      label: "Custom",
      question: trimmedQuestion,
      note: "",
    });

    setCustomQuestionDraft("");
    setCustomQuestionSuggestion("");
    setIsCustomQuestionComposerOpen(false);
  }

  function updateRound(roundId, field, value) {
    setJobForm((current) => ({
      ...current,
      evaluationRounds: current.evaluationRounds.map((round, index, rounds) => {
        const isLockedRound = index === 0 || index === rounds.length - 1;

        if (round.id !== roundId || isLockedRound) {
          return round;
        }

        return { ...round, [field]: value };
      }),
    }));
  }

  function addRound() {
    setJobForm((current) => ({
      ...current,
      evaluationRounds:
        current.evaluationRounds.length >= 2
          ? [
              ...current.evaluationRounds.slice(0, -1),
              createRoundItem("Round", "", ""),
              current.evaluationRounds[current.evaluationRounds.length - 1],
            ]
          : [...current.evaluationRounds, createRoundItem("Round", "", "")],
    }));
  }

  function removeRound(roundId) {
    setJobForm((current) => ({
      ...current,
      evaluationRounds: current.evaluationRounds.filter((round, index, rounds) => {
        const isLockedRound = index === 0 || index === rounds.length - 1;
        return round.id !== roundId || isLockedRound;
      }),
    }));
  }

  function autofillJobDescription() {
    const title = jobForm.title.trim() || "the role";
    const client = showClientInfo ? jobForm.client.trim() : "";
    const roleIntro = `Join us as ${title}${client ? ` for ${client}` : ""}. This role helps recruiters keep hiring structured, practical, and easy to evaluate.`;
    const coreResponsibilities = [
      "Translate hiring intent into a clear candidate-facing brief.",
      "Partner with recruiters and hiring managers to keep screening aligned.",
      "Surface strong-fit candidates with less manual effort and clearer signals.",
    ];
    const successSignals = [
      "The job story is easy to read and reflects the real day-to-day work.",
      "Screening questions and evaluation criteria are aligned to the role.",
      "Candidates understand expectations, growth, and what success looks like.",
    ];
    const candidateProfile = [
      "Strong communication and ownership.",
      "Relevant hands-on experience for the role.",
      "Comfort with a structured hiring process and practical next steps.",
    ];
    const primarySkills = [
      "Communication",
      "Role Fit",
      "Candidate Screening",
      "Stakeholder Management",
      title,
      client || null,
    ]
      .filter(Boolean)
      .join(", ");
    const secondarySkills = [
      "AI Collaboration",
      "Reporting",
      "Team Coordination",
      "Process Design",
      title,
    ]
      .filter(Boolean)
      .join(", ");
    const responsibilities = `<h2><strong>Roles and Responsibilities</strong></h2><ul><li><strong>Shape the role:</strong> Turn hiring intent into a clear candidate-facing brief.</li><li><strong>Guide screening:</strong> Keep recruiter conversations aligned to the role.</li><li><strong>Improve signal:</strong> Surface high-fit candidates faster with a structured workflow.</li></ul>`;
    const interviewRounds =
      jobForm.evaluationRounds.length > 0
        ? jobForm.evaluationRounds
        : [
            createRoundItem("Round 1", "Screening", "Short AI-assisted review of baseline fit."),
            createRoundItem("Round 2", "Hiring manager", "Check role depth, communication, and ownership."),
            createRoundItem("Round 3", "Final decision", "Confirm readiness for next step."),
          ];

    setJobForm((current) => ({
      ...current,
      jobDescription: [
        `<h1>${title}</h1>`,
        `<p>${roleIntro}</p>`,
        `<h2>Role Overview</h2>`,
        `<p>Build a clear, recruiter-friendly description that helps the team move quickly without losing signal.</p>`,
        `<blockquote><p><strong>Why this matters:</strong> A readable job story helps recruiters, hiring managers, and candidates stay aligned from the first screen.</p></blockquote>`,
        `<h2>Core Responsibilities</h2>`,
        `<ul>${coreResponsibilities.map((item) => `<li>${item}</li>`).join("")}</ul>`,
        `<h2>What Success Looks Like</h2>`,
        `<ol>${successSignals.map((item) => `<li>${item}</li>`).join("")}</ol>`,
        `<h3>Candidate Profile</h3>`,
        `<ul>${candidateProfile.map((item) => `<li>${item}</li>`).join("")}</ul>`,
        `<h3>Hiring Notes</h3>`,
        `<p>Use this as a clean starting draft and tailor it to the specific role, team structure, and market context.</p>`,
      ].join(""),
      primarySkills,
      secondarySkills,
      responsibilities,
      evaluationRounds: interviewRounds,
    }));
  }

  function autofillPrimarySkills() {
    const title = jobForm.title.trim() || "the role";
    const client = showClientInfo ? jobForm.client.trim() : "";
    setJobForm((current) => ({
      ...current,
      primarySkills: [
        "Communication",
        "Role Fit",
        "Candidate Screening",
        title,
        client || null,
      ]
        .filter(Boolean)
        .join(", "),
    }));
  }

  function autofillSecondarySkills() {
    const title = jobForm.title.trim() || "the role";
    setJobForm((current) => ({
      ...current,
      secondarySkills: ["AI Collaboration", "Reporting", "Team Coordination", `${title} Execution`].join(", "),
    }));
  }

  function autofillResponsibilities() {
    const title = jobForm.title.trim() || "the role";
    const client = showClientInfo ? jobForm.client.trim() : "";
    setJobForm((current) => ({
      ...current,
      responsibilities: `<h2><strong>Responsibilities</strong></h2><ul><li><strong>Own the brief:</strong> Translate hiring intent for ${title}${client ? ` at ${client}` : ""} into a clear recruiting workflow.</li><li><strong>Guide the team:</strong> Keep screening and interview conversations aligned.</li><li><strong>Improve outcomes:</strong> Surface better-fit candidates with less manual effort.</li></ul>`,
    }));
  }

  function applyEvaluationContextDraft() {
    const selectedAnswers = EVALUATION_CONTEXT_PROMPTS.flatMap((prompt) =>
      evaluationContextPromptInclusions[prompt.id] === false ? [] : evaluationContextAnswers[prompt.id] ?? [],
    );
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
    setEvaluationContextPromptInclusions({});
  }

  function autofillQuestions() {
    setJobForm((current) => ({
      ...current,
      questions: (() => {
        const existingQuestionKeys = new Set(
          current.questions.flatMap((question) => [normalizeQuestionKey(question.label), normalizeQuestionKey(question.question)]),
        );
        const nextSuggestions = DEFAULT_JOB_QUESTION_SUGGESTIONS.filter((question) => {
          const labelKey = normalizeQuestionKey(question.label);
          const questionKey = normalizeQuestionKey(question.question);

          return !existingQuestionKeys.has(labelKey) && !existingQuestionKeys.has(questionKey);
        });

        if (!nextSuggestions.length) {
          return current.questions;
        }

        const nextSuggestionLabels = nextSuggestions.map((question) => normalizeQuestionKey(question.label));
        setRemovedPresetQuestionLabels((currentLabels) =>
          currentLabels.filter((label) => !nextSuggestionLabels.includes(label)),
        );

        return [
          ...current.questions,
          ...nextSuggestions.map((question) => createQuestionItem(question.label, question.question, question.note)),
        ];
      })(),
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

  function commitJob(nextStatus = jobForm.status, { navigateToWorkspace = false, navigateToJobsTable = false } = {}) {
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

    if (navigateToJobsTable) {
      resetJobSheetState();
      router.replace(ROUTES.JOBS, { scroll: false });
      return storedJob;
    }

    if (navigateToWorkspace) {
      if (nextStatus === "Published") {
        showSuccess("Job published", `${storedJob.title || "This job"} is now live.`);
      }
      router.replace(`${ROUTES.JOB(storedJob.id)}?tab=all`, { scroll: false });
      return storedJob;
    }

    resetJobSheetState({ navigateBack: Boolean(sheetReturnTo) });
    return storedJob;
  }

  function handleSubmitJob(event) {
    event.preventDefault();
    commitJob(jobForm.status);
  }

  function handleSaveDraft() {
    commitJob("Draft", { navigateToJobsTable: true });
  }

  function handlePublishJob() {
    commitJob("Published", { navigateToWorkspace: true });
  }

  function validateBasicDetailsStep() {
    const validation = validateJobForm(jobForm, { includeClientInfo: false });
    const relevantFields = ["title", "experienceFrom", "experienceTo", "employmentType", "workplaceType", "positions"];

    if (isCityRequired) {
      relevantFields.push("city");
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

    return true;
  }

  function formatDisplayLabel(value) {
    return String(value ?? "")
      .split(/\s+/)
      .filter(Boolean)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
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
    const isActive = selectedBenefitLabels.has(item.label);
    const inputId = `benefit-${groupTitle}-${item.label}`.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const Icon = item.icon;

    return (
      <label
        key={`${groupTitle}-${item.label}`}
        htmlFor={inputId}
        className={`flex w-full cursor-pointer items-start gap-[8px] rounded-[8px] px-[4px] py-[4px] transition-colors hover:bg-[var(--fx-surface-hover)] ${
          isActive ? "text-[var(--fx-text)]" : "text-[var(--fx-text-muted)]"
        }`}
      >
        <Checkbox
          id={inputId}
          checked={isActive}
          onCheckedChange={() =>
            setJobForm((current) => ({
              ...current,
              benefitSelections: toggleListValue(current.benefitSelections, item.label),
            }))
          }
          className="mt-[2px] size-[16px] shrink-0 self-start border-[color:color-mix(in_srgb,var(--fx-border)_84%,var(--fx-text)_16%)] data-[state=checked]:border-[var(--fx-primary)] data-[state=checked]:bg-[var(--fx-primary)]"
        />
        {Icon ? <Icon className="mt-[2px] size-[16px] shrink-0 self-start text-[var(--fx-primary)]" /> : null}
        <span className={`${FX_TYPOGRAPHY.body} min-w-0 font-medium leading-[22px]`}>{item.label}</span>
      </label>
    );
  }

  function renderBenefitsBrief() {
    const briefText = jobForm.companyBrief || DEFAULT_COMPANY_BRIEF;

    return (
      <div className="rounded-[16px] border border-[var(--fx-border)] bg-[var(--fx-surface)] p-[16px]">
        <div className="space-y-[8px]">
          <h4 className={FX_TYPOGRAPHY.cardTitle}>Company Information in Brief</h4>
          <div className="relative">
            <p
              className="text-[14px] leading-[22px] text-[var(--fx-text-muted)]"
              style={
                isBenefitsBriefExpanded
                  ? undefined
                  : {
                      display: "-webkit-box",
                      WebkitLineClamp: 4,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }
              }
            >
              {briefText}
            </p>
            {!isBenefitsBriefExpanded ? (
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[32px] bg-gradient-to-t from-[var(--fx-surface)] to-transparent" />
            ) : null}
          </div>
          <button
            type="button"
            onClick={() => setIsBenefitsBriefExpanded((current) => !current)}
            className="inline-flex text-[13px] leading-[20px] font-medium text-[var(--fx-primary)] hover:text-[var(--fx-primary)]"
          >
            {isBenefitsBriefExpanded ? "Show less" : "Read more..."}
          </button>
        </div>
      </div>
    );
  }

  function renderSectionHeader(title, description, action, titleClassName = "") {
    return (
      <div className="flex items-start justify-between gap-[16px]">
        <div className="space-y-[4px]">
          <h3 className={cn(FX_TYPOGRAPHY.cardTitle, titleClassName)}>{title}</h3>
          {description ? <p className={`${FX_TYPOGRAPHY.body} text-[var(--fx-text-muted)]`}>{description}</p> : null}
        </div>
        {action ? <div className="flex shrink-0 items-center gap-[8px]">{action}</div> : null}
      </div>
    );
  }

  function goToSheetStep(step) {
    setActiveSheetStep(step);
  }

  function renderReviewSectionCard({ title, step, children }) {
    return (
      <div className="space-y-[12px] rounded-[8px] border border-[var(--fx-border)] bg-[var(--fx-surface)] p-[16px]">
        <div className="flex items-start justify-between gap-[12px]">
          <h4 className={`${FX_TYPOGRAPHY.button} text-[var(--fx-text-muted)]`}>{title}</h4>
          <FxButton type="button" variant="ghost" size="sm" className="text-[var(--fx-text-muted)] hover:bg-[var(--fx-surface-hover)] hover:text-[var(--fx-text)]" onClick={() => goToSheetStep(step)}>
            Edit
          </FxButton>
        </div>
        <div className="space-y-[4px]">{children}</div>
      </div>
    );
  }

  function renderReviewInlineSegments(segments, className = "") {
    return (
      <div className={`flex flex-wrap items-center gap-x-[8px] gap-y-[4px] ${className}`}>
        {segments.map((segment, index) => (
          <span key={index} className="flex items-center gap-[8px]">
            {index > 0 ? <span className="text-[var(--fx-text-muted)]">|</span> : null}
            {typeof segment === "string" ? (
              <span className="text-[14px] leading-[22px] text-[var(--fx-text)]">{segment}</span>
            ) : (
              segment
            )}
          </span>
        ))}
      </div>
    );
  }

  function renderReviewStatusIndicator(isComplete) {
    const label = isComplete ? "Complete" : "Needs review";

    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            aria-label={label}
            className={`inline-flex size-[16px] shrink-0 items-center justify-center rounded-full ${
              isComplete
                ? "text-[var(--fx-success)]"
                : "text-[var(--fx-warning)]"
            }`}
          >
            {isComplete ? <BadgeCheck className="size-[14px]" /> : <Circle className="size-[8px] fill-current" />}
          </span>
        </TooltipTrigger>
        <TooltipContent side="top" sideOffset={6}>
          {label}
        </TooltipContent>
      </Tooltip>
    );
  }

  function renderReviewSummaryRow({ title, step, lines, complete, children }) {
    const inlineSummary = lines.length ? lines.join(" ") : null;

    return (
      <div className="space-y-[8px] py-[8px]">
        <div className="flex items-center justify-between gap-[12px]">
          <div className="flex min-w-0 items-center gap-[8px]">
            {renderReviewStatusIndicator(complete)}
            <div className="min-w-0">
              <h4 className={`${FX_TYPOGRAPHY.button} flex min-w-0 items-center gap-[6px] text-[var(--fx-text-muted)]`}>
                <span className="truncate">{title}</span>
                {inlineSummary ? (
                  <span className="min-w-0 truncate text-[var(--fx-text)]">
                    - {inlineSummary}
                  </span>
                ) : null}
              </h4>
            </div>
          </div>

          <FxButton type="button" variant="ghost" size="sm" className="text-[var(--fx-text-muted)] hover:bg-[var(--fx-surface-hover)] hover:text-[var(--fx-text)]" onClick={() => goToSheetStep(step)}>
            Edit
          </FxButton>
        </div>

        {!inlineSummary && lines.length ? (
          <div className="space-y-[6px] text-[14px] leading-[22px] text-[var(--fx-text)]">
            {lines.map((line, index) => (
              <div key={index} className="text-[14px] leading-[22px] text-[var(--fx-text)]">
                {line}
              </div>
            ))}
          </div>
        ) : null}

        {children ? <div>{children}</div> : null}
      </div>
    );
  }

  function renderEvaluationMissingCard() {
    return (
      <div className="rounded-[8px] border border-[color:color-mix(in_srgb,var(--fx-warning)_32%,var(--fx-border)_68%)] bg-[color:color-mix(in_srgb,var(--fx-warning)_8%,var(--fx-surface)_92%)] p-[16px]">
        <div className="space-y-[12px]">
          <div className="flex items-start justify-between gap-[12px]">
            <div className="space-y-[4px]">
              <h4 className={`${FX_TYPOGRAPHY.button} text-[var(--fx-text-muted)]`}>Evaluation</h4>
              <p className="text-[14px] leading-[22px] font-medium text-[var(--fx-text)]">
                Evaluation Context Missing
              </p>
              <p className="text-[13px] leading-[20px] text-[var(--fx-text-muted)]">
                Add context before publishing, or finish it later.
              </p>
            </div>
            <FxButton type="button" variant="ghost" size="sm" className="text-[var(--fx-text-muted)] hover:bg-[var(--fx-surface-hover)] hover:text-[var(--fx-text)]" onClick={() => goToSheetStep("evaluation")}>
              Edit
            </FxButton>
          </div>
          <div className="flex flex-wrap justify-end gap-[8px]">
            <FxButton
              type="button"
              variant="outline"
              className="border-[var(--fx-primary)] text-[var(--fx-primary)] hover:bg-[color-mix(in_srgb,var(--fx-primary)_8%,var(--fx-surface)_92%)]"
              onClick={() => goToSheetStep("evaluation")}
            >
              Go to Evaluation
            </FxButton>
            <FxButton type="button" variant="destructive" onClick={handlePublishJob}>
              Publish Anyway
            </FxButton>
          </div>
        </div>
      </div>
    );
  }

  function renderQuestionCard(question) {
    const questionIndex = jobForm.questions.findIndex((item) => item.id === question.id);
    const isEditing = editingQuestionId === question.id;
    const draft = isEditing && editingQuestionDraft
      ? editingQuestionDraft
      : { label: question.label, question: question.question };

    return (
      <div
        key={question.id}
        draggable
        onDragStart={() => setDraggedQuestionId(question.id)}
        onDragOver={(event) => event.preventDefault()}
        onDrop={() => {
          if (draggedQuestionId) {
            moveQuestionToIndex(draggedQuestionId, questionIndex);
          }
          setDraggedQuestionId(null);
        }}
        onDragEnd={() => setDraggedQuestionId(null)}
        className={cn(
          "rounded-[10px] border border-[var(--fx-border)] bg-[var(--fx-surface)] px-[14px] py-[12px]",
          draggedQuestionId === question.id ? "opacity-60" : "",
        )}
      >
        <div className="flex items-start gap-[12px]">
          <button
            type="button"
            aria-label="Reorder question"
            className="mt-[2px] inline-flex shrink-0 cursor-grab items-center justify-center rounded-[6px] p-[6px] text-[var(--fx-text-muted)] hover:bg-[var(--fx-surface-hover)] hover:text-[var(--fx-text)] active:cursor-grabbing"
          >
            <GripVertical className="size-[16px]" />
          </button>

          <div className="min-w-0 flex-1 space-y-[6px]">
            {isEditing ? (
              <>
                <FxInput
                  label="Question Type"
                  value={draft.label}
                  onChange={(event) =>
                    setEditingQuestionDraft((current) => ({
                      ...(current ?? { label: question.label, question: question.question }),
                      label: event.target.value,
                    }))
                  }
                  onKeyDown={(event) => {
                    if (event.key === "Escape") {
                      event.preventDefault();
                      event.stopPropagation();
                      cancelQuestionEdit();
                    }
                  }}
                  stackClassName="gap-[6px]"
                  className="h-[40px]"
                />
                <FxInput
                  label="Question"
                  value={draft.question}
                  onChange={(event) =>
                    setEditingQuestionDraft((current) => ({
                      ...(current ?? { label: question.label, question: question.question }),
                      question: event.target.value,
                    }))
                  }
                  onKeyDown={(event) => {
                    if (event.key === "Escape") {
                      event.preventDefault();
                      event.stopPropagation();
                      cancelQuestionEdit();
                    }
                  }}
                  stackClassName="gap-[6px]"
                  className="h-[40px]"
                />
              </>
            ) : (
              <>
                <span className="block text-[12px] leading-[18px] font-medium text-[var(--fx-text-muted)]">
                  {formatDisplayLabel(question.label || "General")}
                </span>
                <p className="text-[13px] leading-[20px] font-medium text-[var(--fx-text)]">
                  {question.question}
                </p>
              </>
            )}
          </div>

          <div className={cn("flex shrink-0 items-start gap-[4px]", isEditing ? "pt-[29px]" : "pt-[20px]")}>
            {isEditing ? (
              <>
                <button
                  type="button"
                  className="inline-flex items-center justify-center rounded-[6px] p-[6px] text-[var(--fx-text-muted)] hover:bg-[var(--fx-surface-hover)] hover:text-[var(--fx-text)]"
                  onClick={cancelQuestionEdit}
                  aria-label="Cancel question edit"
                >
                  <span className="text-[12px] leading-none font-medium">Cancel</span>
                </button>
                <button
                  type="button"
                  className="inline-flex items-center justify-center rounded-[6px] p-[6px] text-[var(--fx-text-muted)] hover:bg-[var(--fx-surface-hover)] hover:text-[var(--fx-text)]"
                  onClick={() => saveQuestionEdit(question.id)}
                  aria-label="Save question"
                >
                  <Save className="size-[15px]" />
                </button>
              </>
            ) : (
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-[6px] p-[6px] text-[var(--fx-text-muted)] hover:bg-[var(--fx-surface-hover)] hover:text-[var(--fx-text)]"
                onClick={() => beginQuestionEdit(question)}
                aria-label="Edit question"
              >
                <Pencil className="size-[15px]" />
              </button>
            )}
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-[6px] p-[6px] text-[var(--fx-text-muted)] hover:bg-[var(--fx-surface-hover)] hover:text-[var(--fx-danger)]"
              onClick={() => removeQuestion(question.id)}
              aria-label="Remove question"
            >
              <Trash2 className="size-[16px]" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  function renderInterviewProcessSection() {
    const rounds = jobForm.evaluationRounds;

    return (
      <div className="space-y-[12px]">
        <div className="flex items-center justify-between gap-[16px]">
          <div className="space-y-[4px]">
            <h4 className={`text-[16px] leading-[24px] font-normal text-[var(--fx-text-muted)]`}>
              Interview Process for this Role
            </h4>
            <p className={`${FX_TYPOGRAPHY.fieldHint} text-[var(--fx-text-muted)]`}>
              Keep the interview flow compact and role-specific.
            </p>
          </div>
          <FxButton type="button" variant="outline" size="sm" onClick={addRound}>
            <Plus className="size-[16px]" />
            Add Round
          </FxButton>
        </div>
        <div className="overflow-hidden rounded-[14px] border border-[var(--fx-border)] bg-[var(--fx-surface)]">
          {rounds.map((round, index) => {
            const isLockedRound = index === 0 || index === rounds.length - 1;

            return (
            <div
              key={round.id}
              className={`grid gap-[10px] px-[12px] py-[10px] md:grid-cols-[92px_minmax(0,1.2fr)_minmax(0,1fr)_auto] md:items-center ${
                index > 0 ? "border-t border-[var(--fx-border)]" : ""
              }`}
            >
              <div className="flex items-center">
                <span className={`${FX_TYPOGRAPHY.fieldHint} whitespace-nowrap text-[var(--fx-text-muted)]`}>
                  Round {index + 1}
                </span>
              </div>
              <div className="flex items-center">
                {isLockedRound ? (
                  <span className="block min-w-0 truncate text-[14px] leading-[22px] text-[var(--fx-text)]">
                    {round.details || "Details"}
                  </span>
                ) : (
                  <input
                    value={round.details}
                    onChange={(event) => updateRound(round.id, "details", event.target.value)}
                    placeholder="Details"
                    className="h-[40px] w-full rounded-[8px] border border-[var(--fx-border)] bg-[var(--fx-surface)] px-[12px] py-0 text-[14px] leading-[22px] text-[var(--fx-text)] outline-none focus:border-[var(--fx-primary)] focus:ring-2 focus:ring-[var(--fx-primary)]/20"
                  />
                )}
              </div>
              <div className="flex items-center">
                {isLockedRound ? (
                  <span className="block min-w-0 truncate text-[14px] leading-[22px] text-[var(--fx-text-muted)]">
                    {round.note || "Additional Info"}
                  </span>
                ) : (
                  <input
                    value={round.note}
                    onChange={(event) => updateRound(round.id, "note", event.target.value)}
                    placeholder="Additional Info"
                    className="h-[40px] w-full rounded-[8px] border border-[var(--fx-border)] bg-[var(--fx-surface)] px-[12px] py-0 text-[14px] leading-[22px] text-[var(--fx-text)] outline-none focus:border-[var(--fx-primary)] focus:ring-2 focus:ring-[var(--fx-primary)]/20"
                  />
                )}
              </div>
              <div className="flex items-center md:justify-end">
                {!isLockedRound ? (
                  <button
                    type="button"
                    className="inline-flex h-[36px] w-[36px] shrink-0 items-center justify-center rounded-[6px] text-[var(--fx-text-muted)] hover:bg-[var(--fx-surface-hover)] hover:text-[var(--fx-danger)]"
                    onClick={() => removeRound(round.id)}
                    aria-label="Remove round"
                  >
                    <Trash2 className="size-[16px]" />
                  </button>
                ) : null}
              </div>
            </div>
            );
          })}
        </div>
      </div>
    );
  }

  function renderEvaluationContextPromptCard() {
    const prompt = EVALUATION_CONTEXT_PROMPTS[evaluationContextStep];
    const selectedValues = evaluationContextAnswers[prompt.id] ?? [];
    const isIncluded = evaluationContextPromptInclusions[prompt.id] !== false;

    return (
      <div className="space-y-[16px] rounded-[16px] border border-[var(--fx-border)] bg-[var(--fx-bg-soft)] p-[20px]">
        <div className="flex items-start justify-between gap-[16px]">
          <div className="space-y-[4px]">
            <h3 className="text-[16px] leading-[24px] font-medium text-[var(--fx-text)]">{prompt.title}</h3>
            <p className="text-[13px] leading-[20px] text-[var(--fx-text-muted)]">
              Select the questions that apply and answer them. Evality will use these answers to generate the evaluation context.
            </p>
          </div>
          <label className="flex shrink-0 items-center gap-[8px] rounded-[999px] border border-[var(--fx-border)] bg-[var(--fx-surface)] px-[10px] py-[6px]">
            <Checkbox
              checked={isIncluded}
              onCheckedChange={(checked) =>
                setEvaluationContextPromptInclusions((current) => ({
                  ...current,
                  [prompt.id]: Boolean(checked),
                }))
              }
            />
            <span className="text-[13px] leading-[20px] font-medium text-[var(--fx-text)]">Use this question</span>
          </label>
        </div>
        <div className={`space-y-[8px] ${isIncluded ? "" : "opacity-50"}`}>
          {prompt.options.map((option) => {
            const isSelected = selectedValues.includes(option);
            const optionId = `evaluation-context-${prompt.id}-${option}`;

            return (
              <label
                key={option}
                className={`flex w-full items-start gap-[12px] rounded-[12px] border px-[14px] py-[12px] text-left transition-colors ${
                  !isIncluded
                    ? "cursor-not-allowed border-[var(--fx-border)] bg-[var(--fx-surface)]"
                    : isSelected
                      ? "border-[var(--fx-primary)] bg-[var(--fx-surface-selected)]"
                      : "border-[var(--fx-border)] bg-[var(--fx-surface)] hover:bg-[var(--fx-surface-hover)]"
                }`}
              >
                <Checkbox
                  id={optionId}
                  checked={isSelected}
                  onCheckedChange={(checked) =>
                    isIncluded &&
                    setEvaluationContextAnswers((current) => ({
                      ...current,
                      [prompt.id]: checked
                        ? [...selectedValues, option]
                        : selectedValues.filter((value) => value !== option),
                    }))
                  }
                  disabled={!isIncluded}
                  className="mt-[2px]"
                />
                <span className="text-[14px] leading-[22px] text-[var(--fx-text)]">{option}</span>
              </label>
            );
          })}
          {!isIncluded ? (
            <p className="text-[13px] leading-[20px] text-[var(--fx-text-muted)]">
              This question will be skipped from generation.
            </p>
          ) : null}
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
    { label: "Experience", value: formatExperienceSummary(jobForm.experienceFrom, jobForm.experienceTo) },
    { label: "Location", value: sheetSummaryLocation },
    { label: "Status", value: editingJob?.status ?? "Draft" },
  ];
  const [sheetSummaryTitleItem, ...sheetSummaryMetaItems] = sheetSummaryItems;

  const reviewBasicSummary = {
    title: jobForm.title || "—",
    experience: formatReviewExperienceSummary(jobForm.experienceFrom, jobForm.experienceTo),
    employmentType: jobForm.employmentType || "—",
    workplaceType: jobForm.workplaceType || "—",
    positions: `${Number(jobForm.positions) || 0} Position${Number(jobForm.positions) === 1 ? "" : "s"}`,
    location: sheetSummaryLocation,
    compensationRange: buildSalaryRangeLabel(jobForm.salaryMin, jobForm.salaryMax, jobForm.currency) || "—",
    compensationVisibility: jobForm.hideCompensationFromCandidates ? "Don't Show Salary to Candidates" : "Show Salary to Candidates",
  };
  const reviewDescriptionStatus = hasRichTextContent(jobForm.jobDescription) ? "Description Added" : "Description Missing";
  const reviewPrimarySkillCount = fromCommaList(jobForm.primarySkills).length;
  const reviewSecondarySkillCount = fromCommaList(jobForm.secondarySkills).length;
  const reviewJobDescriptionRoundsCount = jobForm.evaluationRounds?.length ?? 0;
  const reviewQuestionMode = formatQuestionFormatLabel(jobForm.questionFormat);
  const reviewQuestionCount = jobForm.questions?.length ?? 0;
  const reviewBenefitsCount = jobForm.benefitSelections?.length ?? 0;
  const reviewCompanyInfoStatus = hasRichTextContent(jobForm.companyBrief) ? "Company Information Added" : "Company Information Missing";
  const reviewEvaluationStatus = stripHtmlContent(jobForm.evaluationContext) ? "Evaluation Context Configured" : "Evaluation Context Missing";
  const reviewBasicComplete = Boolean(
    jobForm.title?.trim() &&
      jobForm.experienceFrom &&
      jobForm.employmentType &&
      jobForm.workplaceType &&
      jobForm.positions &&
      (!isCityRequired || jobForm.city?.trim()),
  );
  const reviewDescriptionComplete = reviewDescriptionStatus === "Description Added";
  const reviewQuestionnaireComplete = reviewQuestionCount > 0;
  const reviewBenefitsComplete = reviewBenefitsCount > 0;
  const reviewEvaluationComplete = !evaluationContextMissing;
  const reviewDescriptionStatusNode = (
    <span className={reviewDescriptionComplete ? "text-[var(--fx-text)]" : "text-[var(--fx-warning)]"}>
      {reviewDescriptionStatus}
    </span>
  );
  const reviewBasicSummaryLine = (
    <div className="flex flex-wrap items-center gap-x-[12px] gap-y-[6px]">
      <p className="min-w-0 flex-1 text-[14px] leading-[22px] text-[var(--fx-text)]">
        {reviewBasicSummary.experience} · {reviewBasicSummary.employmentType} · {reviewBasicSummary.workplaceType} · {reviewBasicSummary.positions} · {reviewBasicSummary.location}
      </p>
      <label className="flex shrink-0 items-center gap-[8px] whitespace-nowrap text-[14px] leading-[22px] text-[var(--fx-text)]">
        <Checkbox
          checked={Boolean(jobForm.hideCompensationFromCandidates)}
          onCheckedChange={(checked) =>
            setJobForm((current) => ({
              ...current,
              hideCompensationFromCandidates: Boolean(checked),
            }))
          }
          className="mt-[2px]"
        />
        <span>Don't Show Salary to Candidates</span>
      </label>
    </div>
  );
  const reviewJobDescriptionLine = renderReviewInlineSegments([
    reviewDescriptionStatusNode,
    `Primary Skills: ${reviewPrimarySkillCount}`,
    `Secondary Skills: ${reviewSecondarySkillCount}`,
    `Interview Rounds: ${reviewJobDescriptionRoundsCount}`,
  ]);
  const reviewQuestionnaireLine = renderReviewInlineSegments([
    `Mode: ${reviewQuestionMode}`,
    `Questions: ${reviewQuestionCount}`,
  ]);
  const shouldShowScreeningBuilder = jobForm.preScreeningMode !== "manual";
  const jobTitleValue = jobForm.title?.trim() || "";
  const jobCreationTitle = editingJob ? "Edit Job" : "Create Job";
  const navbarTitle = isSheetOpen ? jobCreationTitle : "Jobs";
  const showReturnToBackdrop = isSheetOpen && Boolean(sheetReturnTo) && sheetReturnTo.startsWith("/app/jobs/");

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

    if (!sortConfig) {
      return [...nextJobs];
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

  function getJobWorkspaceHref(jobId, tab = "all") {
    return `${ROUTES.JOB(jobId)}?tab=${tab}`;
  }

  function toggleJobsViewMode() {
    setJobsViewMode((current) => (current === "empty" ? DEFAULT_JOBS_VIEW_MODE : "empty"));
  }

  const columns = [
    {
      key: "title",
      label: (
        <button type="button" className={getSortHeaderButtonClassName("title")} onClick={() => handleSort("title")}>
          <span>Job Title</span>
          <ArrowUpDown className="size-[14px]" />
        </button>
      ),
      width: showClientInfo ? 230 : 280,
      minWidth: 200,
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
              <button type="button" className={getSortHeaderButtonClassName("client")} onClick={() => handleSort("client")}>
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
        <button type="button" className={getSortHeaderButtonClassName("updatedAt")} onClick={() => handleSort("updatedAt")}>
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
      width: 56,
      minWidth: 56,
      maxWidth: 56,
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
    const isPublishedWithoutEvaluationContext =
      job.status === "Published" && !stripHtmlContent(job.evaluationContext);
    const label = isDraft
      ? "Draft"
      : isPublishedWithoutEvaluationContext
        ? "Published\nEvaluation context missing"
        : "Published";
    const toneClassName = isDraft
      ? "bg-[var(--fx-warning)]"
      : isPublishedWithoutEvaluationContext
        ? "bg-[var(--fx-danger)]"
        : "bg-[var(--fx-success)]";

    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className={`inline-flex size-[8px] shrink-0 cursor-default rounded-full ${toneClassName}`}
            aria-label={label}
          />
        </TooltipTrigger>
        <TooltipContent side="top" sideOffset={6} className="max-w-[220px] whitespace-pre-line">
          {isPublishedWithoutEvaluationContext ? (
            <div className="space-y-[2px]">
              <div className={FX_TYPOGRAPHY.button}>Published</div>
              <div className={`${FX_TYPOGRAPHY.fieldHint} text-[var(--fx-danger)]`}>Evaluation context missing</div>
            </div>
          ) : (
            label
          )}
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
            href={getJobWorkspaceHref(job.id)}
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
    <TooltipProvider delayDuration={0}>
      <FxProtectedAppPage pageId="jobs" title={navbarTitle} contentClassName="bg-[var(--fx-surface)]">
      <section className={`${FX_LAYOUT.contentWidthWide} flex h-full min-h-0 w-full min-w-0 flex-1 flex-col overflow-hidden`}>
        {showReturnToBackdrop ? (
          <div className="pointer-events-none fixed inset-x-0 bottom-0 top-[64px] z-[20] overflow-hidden">
            <iframe
              title="Job workspace background"
              src={sheetReturnTo}
              className="h-full w-full border-0 bg-[var(--fx-surface)]"
            />
          </div>
        ) : null}
        <div className="flex min-h-0 flex-1 flex-col gap-[24px] overflow-hidden">
          <div className="grid min-w-0 flex-none grid-cols-[minmax(0,1fr)_auto] items-end gap-[16px]">
            <FxTabs
              variant="stage"
              items={[
                { value: "active", label: PAGE_COPY.jobs.activeTab, count: activeCount },
                { value: "archived", label: PAGE_COPY.jobs.archivedTab, count: archivedCount },
              ]}
              value={selectedTab}
              onValueChange={setSelectedTab}
              className="w-full"
              showBorder={false}
            />

            <div className="flex min-w-0 shrink-0 items-center gap-[12px] justify-self-end">
              <div className="w-full max-w-[200px] min-w-0">
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
                sortedColumnKey={sortConfig?.key === "updatedAt" ? "lastActivity" : sortConfig?.key ?? null}
                sortedColumnDirection={sortConfig?.direction ?? "asc"}
                emptyMessage={PAGE_COPY.jobs.tableEmpty}
                enableColumnPicker
                storageKey={STORAGE_KEYS.JOBS_TABLE_COLUMNS}
              />
            ) : null}
          </div>
        </div>
      </section>

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
        <SheetContent size="lg" widthPx={700}>
          <SheetHeader
            title={isSheetOpen ? jobCreationTitle : editingJob ? PAGE_COPY.jobs.editCta : PAGE_COPY.jobs.createCta}
            description={jobTitleValue || (editingJob ? "Edit details for this job" : "Enter job details to get started")}
            descriptionClassName="text-[var(--fx-text-muted)] font-normal"
            actions={(
              <>
                {editingJob ? (
                  <FxButton
                    type="button"
                    variant="ghost"
                    className="text-[var(--fx-danger)] hover:bg-[color-mix(in_srgb,var(--fx-danger)_8%,var(--fx-surface)_92%)] hover:text-[var(--fx-danger)]"
                    onClick={() => requestDeleteJob(editingJob, { navigateToJobsTable: true })}
                  >
                    <Trash2 className="size-[16px]" />
                    Delete
                  </FxButton>
                ) : null}
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
              {/*
              <div className={`grid gap-[24px] rounded-[8px] border border-[color:color-mix(in_srgb,var(--fx-primary)_24%,var(--fx-border)_76%)] bg-[color:color-mix(in_srgb,var(--fx-primary)_4%,var(--fx-surface)_96%)] p-[20px] md:grid-cols-[minmax(0,1.9fr)_auto]`}>
                <div className="min-w-0 space-y-[6px]">
                  <p className={`${FX_TYPOGRAPHY.metaLabel} font-normal text-[var(--fx-text-muted)]`}>{sheetSummaryTitleItem.label}</p>
                  <p className={`${FX_TYPOGRAPHY.button} min-w-0 truncate text-[var(--fx-text)]`}>{sheetSummaryTitleItem.value}</p>
                </div>
                <div className="min-w-0 md:justify-self-end">
                  <div className="grid gap-[12px] sm:grid-cols-3">
                    {sheetSummaryMetaItems.map((item) => (
                      <div key={item.label} className="min-w-0 space-y-[4px] text-left">
                        <p className={`${FX_TYPOGRAPHY.metaLabel} font-normal text-[var(--fx-text-muted)]`}>{item.label}</p>
                        <p className={`${FX_TYPOGRAPHY.button} text-[var(--fx-text)]`}>{item.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              */}

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
                      {/*
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
                      */}

                      <div className="grid gap-[24px] xl:grid-cols-12">
                        <div className="xl:col-span-12 flex flex-col gap-[8px]">
                          <FxFieldLabel required>Job Title</FxFieldLabel>
                          <FxInput
                            ref={jobTitleInputRef}
                            name="title"
                            placeholder="Senior Frontend Engineer"
                            value={jobForm.title}
                            onChange={handleJobFormChange}
                            required
                            state={fieldState("title")}
                            validationMessage={validationErrors.title}
                            className={BASIC_FORM_CONTROL_CLASS}
                            stackClassName="gap-0"
                            aria-label="Job Title"
                          />
                        </div>

                        <div className="xl:col-span-6">
                          <FxSelect
                            name="employmentType"
                            options={EMPLOYMENT_TYPE_OPTIONS}
                            value={jobForm.employmentType}
                            onChange={(event) => handleSelectFieldChange("employmentType", event.target.value)}
                            label="Employment Type"
                            placeholder="Employment type"
                            state={fieldState("employmentType")}
                            validationMessage={validationErrors.employmentType}
                            className={BASIC_FORM_CONTROL_CLASS}
                            stackClassName={BASIC_FORM_FIELD_STACK_CLASS}
                          />
                        </div>

                        <div className="xl:col-span-6">
                          <FxSelect
                            name="workplaceType"
                            options={WORKPLACE_TYPE_OPTIONS}
                            value={jobForm.workplaceType}
                            onChange={(event) => handleSelectFieldChange("workplaceType", event.target.value)}
                            label="Workplace Type"
                            placeholder="Workplace type"
                            state={fieldState("workplaceType")}
                            validationMessage={validationErrors.workplaceType}
                            className={BASIC_FORM_CONTROL_CLASS}
                            stackClassName={BASIC_FORM_FIELD_STACK_CLASS}
                          />
                        </div>
                      </div>

                      <div className="grid gap-[24px] xl:grid-cols-12">
                        <div className="xl:col-span-6">
                          <FxInput
                            name="city"
                            label="City"
                            placeholder="Bengaluru"
                            value={jobForm.city}
                            onChange={handleJobFormChange}
                            required={isCityRequired}
                            state={fieldState("city")}
                            validationMessage={validationErrors.city}
                            className={BASIC_FORM_CONTROL_CLASS}
                            stackClassName={BASIC_FORM_FIELD_STACK_CLASS}
                          />
                        </div>

                        <div className="xl:col-span-6">
                          <FxInput
                            name="locality"
                            label="Locality"
                            placeholder={isRemote ? "Optional for remote roles" : "HSR Layout"}
                            value={jobForm.locality}
                            onChange={handleJobFormChange}
                            disabled={isRemote}
                            className={BASIC_FORM_CONTROL_CLASS}
                            stackClassName={BASIC_FORM_FIELD_STACK_CLASS}
                          />
                        </div>
                      </div>

                      <div className="grid gap-[24px] xl:grid-cols-12">
                        <div className="xl:col-span-3">
                          <FxInput
                            name="experienceFrom"
                            label="Experience Min"
                            placeholder="Min"
                            type="number"
                            min="0"
                            value={jobForm.experienceFrom}
                            onChange={(event) => handleExperienceFieldChange("experienceFrom", event.target.value)}
                            required
                            state={fieldState("experienceFrom")}
                            validationMessage={validationErrors.experienceFrom}
                            className={BASIC_FORM_CONTROL_CLASS}
                            rightElement={<span className="text-[13px] leading-[20px] text-[var(--fx-text-muted)]">years</span>}
                            stackClassName={BASIC_FORM_FIELD_STACK_CLASS}
                          />
                        </div>

                        <div className="xl:col-span-3">
                          <FxInput
                            name="experienceTo"
                            label="Experience Max"
                            placeholder="Max"
                            type="number"
                            min="0"
                            value={jobForm.experienceTo}
                            onChange={(event) => handleExperienceFieldChange("experienceTo", event.target.value)}
                            state={fieldState("experienceTo")}
                            validationMessage={validationErrors.experienceTo}
                            className={BASIC_FORM_CONTROL_CLASS}
                            rightElement={<span className="text-[13px] leading-[20px] text-[var(--fx-text-muted)]">years</span>}
                            stackClassName={BASIC_FORM_FIELD_STACK_CLASS}
                          />
                        </div>

                        <div className="xl:col-span-3">
                          <FxInput
                            name="positions"
                            label="Openings"
                            min="1"
                            type="number"
                            value={jobForm.positions}
                            onChange={handleJobFormChange}
                            state={fieldState("positions")}
                            validationMessage={validationErrors.positions}
                            className={BASIC_FORM_CONTROL_CLASS}
                            stackClassName={BASIC_FORM_FIELD_STACK_CLASS}
                          />
                        </div>

                        <div className="xl:col-span-3">
                          <FxInput
                            name="questionCount"
                            label="Interview Rounds"
                            min="0"
                            type="number"
                            value={jobForm.questions?.length ?? 0}
                            onChange={handleQuestionCountChange}
                            className={BASIC_FORM_CONTROL_CLASS}
                            stackClassName={BASIC_FORM_FIELD_STACK_CLASS}
                          />
                        </div>
                      </div>

                      <div className="space-y-[16px]">
                        <div className="flex items-center justify-between gap-[16px]">
                          <h3 className="text-[16px] leading-[24px] font-normal text-[var(--fx-text-muted)]">Compensation</h3>
                        </div>
                        <div className="grid gap-[24px] md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_120px]">
                          <div className="min-w-0">
                            <FxInput
                              name="salaryMin"
                              label="Salary Min"
                              type="text"
                              inputMode="numeric"
                              placeholder="1000000"
                              value={formatCurrencyInputValue(jobForm.salaryMin, jobForm.currency)}
                              onChange={(event) => handleCurrencyAmountFieldChange("salaryMin", event.target.value)}
                              className={`text-right placeholder:text-right ${BASIC_FORM_CONTROL_CLASS}`}
                              stackClassName={BASIC_FORM_FIELD_STACK_CLASS}
                            />
                          </div>

                          <div className="min-w-0">
                            <FxInput
                              name="salaryMax"
                              label="Salary Max"
                              type="text"
                              inputMode="numeric"
                              placeholder="1500000"
                              value={formatCurrencyInputValue(jobForm.salaryMax, jobForm.currency)}
                              onChange={(event) => handleCurrencyAmountFieldChange("salaryMax", event.target.value)}
                              className={`text-right placeholder:text-right ${BASIC_FORM_CONTROL_CLASS}`}
                              stackClassName={BASIC_FORM_FIELD_STACK_CLASS}
                            />
                          </div>

                          <div className="min-w-0">
                            <FxSelect
                              name="currency"
                              options={CURRENCY_OPTIONS}
                              value={jobForm.currency}
                              onChange={(event) => handleSelectFieldChange("currency", event.target.value)}
                              label="Currency"
                              placeholder="Currency"
                              className={`w-full min-w-0 ${BASIC_FORM_CONTROL_CLASS}`}
                              stackClassName={BASIC_FORM_FIELD_STACK_CLASS}
                            />
                          </div>
                        </div>
                        <label className="flex cursor-pointer items-center gap-[10px] select-none">
                          <Checkbox
                            checked={Boolean(jobForm.hideCompensationFromCandidates)}
                            onCheckedChange={(checked) =>
                              setJobForm((current) => ({
                                ...current,
                                hideCompensationFromCandidates: Boolean(checked),
                              }))
                            }
                          />
                          <span className={FX_TYPOGRAPHY.fieldLabel}>Don't Show Salary to Candidates</span>
                        </label>
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
                      <FxAiButton onClick={autofillJobDescription}>
                        Generate JD
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
                    <div className="flex items-center justify-between gap-[12px]">
                      <h4 className={`${FX_TYPOGRAPHY.fieldLabel} text-[var(--fx-text-muted)]`}>Primary Skills</h4>
                      <div className="flex items-center gap-[12px]">
                        <button
                          type="button"
                          onClick={() => clearSkillsField("primarySkills")}
                          disabled={!primarySkillTags.length}
                          className="text-[13px] leading-[20px] font-normal text-[var(--fx-text-muted)] hover:text-[var(--fx-text)] disabled:pointer-events-none disabled:opacity-40"
                          >
                          Clear All
                        </button>
                        <FxAiButton onClick={autofillPrimarySkills}>
                          Get Primary Skills
                        </FxAiButton>
                      </div>
                    </div>
                    <FxTagInput
                      value={primarySkillTags}
                      onChange={(nextValue) => handleSelectFieldChange("primarySkills", toCommaList(nextValue))}
                      placeholder="Add primary skills"
                    />
                  </div>

                  <div className="space-y-[12px]">
                    <div className="flex items-center justify-between gap-[12px]">
                      <h4 className={`${FX_TYPOGRAPHY.fieldLabel} text-[var(--fx-text-muted)]`}>Secondary Skills</h4>
                      <div className="flex items-center gap-[12px]">
                        <button
                          type="button"
                          onClick={() => clearSkillsField("secondarySkills")}
                          disabled={!secondarySkillTags.length}
                          className="text-[13px] leading-[20px] font-normal text-[var(--fx-text-muted)] hover:text-[var(--fx-text)] disabled:pointer-events-none disabled:opacity-40"
                          >
                          Clear All
                        </button>
                        <FxAiButton onClick={autofillSecondarySkills}>
                          Get Secondary Skills
                        </FxAiButton>
                      </div>
                    </div>
                    <FxTagInput
                      value={secondarySkillTags}
                      onChange={(nextValue) => handleSelectFieldChange("secondarySkills", toCommaList(nextValue))}
                      placeholder="Add secondary skills"
                    />
                  </div>

                  {/* <div className="space-y-[12px]">
                    {renderInterviewProcessSection()}
                  </div> */}
                </section>
              ) : null}

              {activeSheetStep === "evaluation" ? (
                <section className="space-y-[16px]">
                  {renderSectionHeader(
                    "Evaluation Context",
                    "Used for Candidate Fit Score, Candidate AI Analysis, AI Screening, Candidate Recommendations, and Question Generation.",
                    <FxAiButton
                      onClick={() => {
                        setEvaluationContextStep(0);
                        setIsEvaluationContextOpen(true);
                      }}
                    >
                      Generate Context
                    </FxAiButton>,
                    "text-[var(--fx-text-muted)] font-normal",
                  )}
                  <FxInput
                    textarea
                    name="evaluationContext"
                    placeholder="What should the AI pay attention to when screening candidates? Keep it practical and concise."
                    value={jobForm.evaluationContext}
                    onChange={handleJobFormChange}
                    className="min-h-[152px]"
                    stackClassName="gap-[4px]"
                  />
                </section>
              ) : null}

              {activeSheetStep === "questionnaire" ? (
                <section className="space-y-[24px]">
                  <div className="space-y-[4px]">
                    {renderSectionHeader(
                      "Setup Screening Method",
                      null,
                      null,
                    )}
                    <p className={`${FX_TYPOGRAPHY.fieldHint} text-[var(--fx-text-muted)]`}>
                      Candidates will answer these configured pre-screening questions. Default settings can be managed in Settings. Changes made here apply only to this job.
                    </p>
                  </div>

                  <div className="space-y-[8px]">
                    <h4 className={`${FX_TYPOGRAPHY.fieldLabel} text-[var(--fx-text-muted)]`}>Screening Method</h4>
                  </div>
                  <RadioGroup
                    value={jobForm.preScreeningMode || "manual"}
                    onValueChange={(value) =>
                      setJobForm((current) => ({
                        ...current,
                        preScreeningMode: value,
                      }))
                    }
                    className="grid gap-[12px] md:grid-cols-2"
                  >
                    {SCREENING_METHOD_OPTIONS.map((option) => (
                      <label
                        key={option.value}
                        htmlFor={`screening-method-${option.value}`}
                        className={`flex items-start gap-[12px] rounded-[12px] border px-[16px] py-[16px] text-left transition-colors ${
                          option.disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"
                        } ${
                          jobForm.preScreeningMode === option.value
                            ? "border-[var(--fx-primary)] bg-[var(--fx-surface-selected)]"
                            : "border-[var(--fx-border)] bg-[var(--fx-surface)]"
                        } ${
                          !option.disabled ? "hover:bg-[var(--fx-surface-hover)]" : ""
                        }`}
                      >
                        <RadioGroupItem
                          id={`screening-method-${option.value}`}
                          value={option.value}
                          disabled={Boolean(option.disabled)}
                          className="mt-[2px] border-[color:color-mix(in_srgb,var(--fx-border)_82%,var(--fx-text)_18%)] data-[state=checked]:border-[var(--fx-primary)]"
                        />
                        <span className="min-w-0 space-y-[4px]">
                          <span className="block text-[14px] leading-[22px] font-medium text-[var(--fx-text)]">
                            {option.title}
                          </span>
                          <span className="block text-[13px] leading-[20px] text-[var(--fx-text-muted)]">
                            {option.description}
                          </span>
                        </span>
                      </label>
                    ))}
                  </RadioGroup>

                  {shouldShowScreeningBuilder ? (
                    <>
                      <div className="space-y-[8px]">
                        <h4 className={`${FX_TYPOGRAPHY.fieldLabel} text-[var(--fx-text-muted)]`}>Questionnaire</h4>
                      </div>

                      <RadioGroup
                        value={jobForm.questionFormat || "cv_and_prescreen"}
                        onValueChange={(value) =>
                          setJobForm((current) => ({
                            ...current,
                            questionFormat: value,
                          }))
                        }
                        className="mt-[16px] grid gap-[12px] md:grid-cols-2"
                      >
                        <label
                          htmlFor="question-format-cv-and-prescreen"
                          className={`flex cursor-pointer items-start gap-[12px] rounded-[12px] border px-[16px] py-[16px] text-left transition-colors ${
                            jobForm.questionFormat === "cv_and_prescreen"
                              ? "border-[var(--fx-primary)] bg-[var(--fx-surface-selected)]"
                              : "border-[var(--fx-border)] bg-[var(--fx-surface)] hover:bg-[var(--fx-surface-hover)]"
                          }`}
                        >
                          <RadioGroupItem
                            id="question-format-cv-and-prescreen"
                            value="cv_and_prescreen"
                            className="mt-[2px] border-[color:color-mix(in_srgb,var(--fx-border)_82%,var(--fx-text)_18%)] data-[state=checked]:border-[var(--fx-primary)]"
                          />
                          <span className="min-w-0 space-y-[4px]">
                            <span className="block text-[14px] leading-[22px] font-medium text-[var(--fx-text)]">
                              CV + Pre-Screening
                            </span>
                          </span>
                        </label>

                        <label
                          htmlFor="question-format-prescreen-only"
                          className={`flex cursor-pointer items-start gap-[12px] rounded-[12px] border px-[16px] py-[16px] text-left transition-colors ${
                            jobForm.questionFormat === "prescreen_only"
                              ? "border-[var(--fx-primary)] bg-[var(--fx-surface-selected)]"
                              : "border-[var(--fx-border)] bg-[var(--fx-surface)] hover:bg-[var(--fx-surface-hover)]"
                          }`}
                        >
                          <RadioGroupItem
                            id="question-format-prescreen-only"
                            value="prescreen_only"
                            className="mt-[2px] border-[color:color-mix(in_srgb,var(--fx-border)_82%,var(--fx-text)_18%)] data-[state=checked]:border-[var(--fx-primary)]"
                          />
                          <span className="min-w-0 space-y-[4px]">
                            <span className="block text-[14px] leading-[22px] font-medium text-[var(--fx-text)]">
                              Pre-Screening Questions Only
                            </span>
                          </span>
                        </label>
                      </RadioGroup>

                      <div className="space-y-[12px]">
                        <div className="flex items-center justify-between gap-[12px]">
                          <h4 className={`${FX_TYPOGRAPHY.fieldLabel} text-[var(--fx-text-muted)]`}>Pre-Screening Questions</h4>
                        </div>

                        {jobForm.questions.length ? (
                          <div className="space-y-[10px]">
                            {jobForm.questions.map((question) => renderQuestionCard(question))}
                          </div>
                        ) : (
                          <div className="rounded-[10px] border border-dashed border-[var(--fx-border)] bg-[var(--fx-surface)] px-[14px] py-[12px] text-[13px] leading-[20px] text-[var(--fx-text-muted)]">
                            No questions added yet.
                          </div>
                        )}

                        {availableDefaultQuestions.length ? (
                          <div className="flex flex-wrap gap-[8px]">
                            {availableDefaultQuestions.map((question) => (
                              <FxButton
                                key={question.id}
                                type="button"
                                variant="outline"
                                size="sm"
                                className="gap-[6px]"
                                onClick={() => addQuestion(question)}
                              >
                                <Plus className="size-[14px]" />
                                {question.label}
                              </FxButton>
                            ))}
                            <FxButton
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="gap-[6px] text-[var(--fx-primary)] hover:bg-[var(--fx-surface-selected)] hover:text-[var(--fx-primary)]"
                              onClick={() => {
                                setIsCustomQuestionComposerOpen(true);
                                requestAnimationFrame(() => customQuestionInputRef.current?.focus?.());
                              }}
                            >
                              <Plus className="size-[14px]" />
                              Add Custom
                            </FxButton>
                          </div>
                        ) : (
                          <div className="flex flex-wrap gap-[8px]">
                            <FxButton
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="gap-[6px] text-[var(--fx-primary)] hover:bg-[var(--fx-surface-selected)] hover:text-[var(--fx-primary)]"
                              onClick={() => {
                                setIsCustomQuestionComposerOpen(true);
                                requestAnimationFrame(() => customQuestionInputRef.current?.focus?.());
                              }}
                            >
                              <Plus className="size-[14px]" />
                              Add Custom
                            </FxButton>
                          </div>
                        )}

                        {isCustomQuestionComposerOpen ? (
                          <div className="space-y-[10px] rounded-[10px] border border-[var(--fx-border)] bg-[var(--fx-surface)] p-[14px]">
                            <FxInput
                              ref={customQuestionInputRef}
                              label="Question Text"
                              value={customQuestionDraft}
                              onChange={handleCustomQuestionChange}
                              placeholder="Enter a screening question"
                            />
                            {customQuestionSuggestion ? (
                              <button
                                type="button"
                                onClick={acceptCustomQuestionSuggestion}
                                className="text-[13px] leading-[20px] text-[var(--fx-primary)] hover:text-[var(--fx-primary)]"
                              >
                                Suggested: {customQuestionSuggestion}
                              </button>
                            ) : null}
                            <div className="flex items-center justify-end gap-[8px]">
                              <FxButton type="button" variant="ghost" size="sm" onClick={() => setIsCustomQuestionComposerOpen(false)}>
                                Cancel
                              </FxButton>
                              <FxButton type="button" variant="secondary" size="sm" onClick={() => commitCustomQuestion()}>
                                Add Question
                              </FxButton>
                            </div>
                          </div>
                        ) : null}
                      </div>
                    </>
                  ) : null}

                </section>
              ) : null}

              {activeSheetStep === "benefits" ? (
                <section className="space-y-[24px]">
                  <div className="space-y-[16px]">
                    <div className="space-y-[8px]">
                      <p className={`${FX_TYPOGRAPHY.body} text-[var(--fx-text-muted)]`}>
                        Check the benefits offered in the company. The AI agent will respond to candidate queries based on the details provided here.
                      </p>
                    </div>
                    {/* Company info brief intentionally hidden for now.
                    {renderBenefitsBrief()} */}
                    <div className="grid gap-[16px] md:grid-cols-2">
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

              {activeSheetStep === "review" ? (
                <section className="space-y-[16px]">
                  <div className="space-y-[4px]">
                    <p className="text-[15px] leading-[22px] font-medium text-[color:color-mix(in_srgb,var(--fx-text)_72%,var(--fx-text-muted)_28%)]">
                      Review your job before publishing.
                    </p>
                  </div>

                  <div className="space-y-[8px] rounded-[8px] border border-[var(--fx-border)] bg-[var(--fx-surface)] p-[16px]">
                    {renderReviewSummaryRow({
                      title: "Basic Details",
                      step: "basic",
                      complete: reviewBasicComplete,
                      lines: reviewBasicComplete ? [] : ["Required role details are still missing."],
                    })}

                    {renderReviewSummaryRow({
                      title: "Job Description",
                      step: "description",
                      complete: reviewDescriptionComplete,
                      lines: reviewDescriptionComplete ? [] : ["Add a job description before publishing."],
                    })}

                    {renderReviewSummaryRow({
                      title: "Screening Method",
                      step: "questionnaire",
                      complete: reviewQuestionnaireComplete,
                      lines: reviewQuestionnaireComplete ? [] : ["Set at least 1 pre-screen question."],
                    })}

                    {renderReviewSummaryRow({
                      title: "Benefits",
                      step: "benefits",
                      complete: reviewBenefitsComplete,
                      lines: reviewBenefitsComplete ? [] : ["Select the benefits you want candidates to see."],
                    })}

                    {evaluationContextMissing ? (
                      renderEvaluationMissingCard()
                    ) : (
                      renderReviewSummaryRow({
                        title: "Evaluation",
                        step: "evaluation",
                        complete: reviewEvaluationComplete,
                        lines: [],
                      })
                    )}
                  </div>
                  <FxInput
                    textarea
                    name="additionalInformation"
                    label="Additional Information"
                    placeholder="Add recruiter notes before publishing"
                    value={jobForm.additionalInformation}
                    onChange={handleJobFormChange}
                    className="min-h-[120px]"
                  />
                </section>
              ) : null}

            </SheetBody>

            <SheetFooter
              right={
                <>
                  <FxButton type="button" variant="ghost" className="gap-[8px] text-[var(--fx-text-muted)] hover:bg-[var(--fx-surface-hover)] hover:text-[var(--fx-text)]" onClick={handlePreviousSheetStep}>
                    <ArrowLeft className="size-[16px]" />
                    Back
                  </FxButton>
                  {activeSheetStep === "review" ? (
                    <FxButton type="button" onClick={handlePublishJob}>
                      Publish
                    </FxButton>
                  ) : (
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
                  )}
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
            <DialogTitle>Generate Context</DialogTitle>
            <DialogDescription>
              Select the questions that apply to this role and answer them. Evality will generate the evaluation context from your selections.
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
                    Generate Context
                  </FxButton>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      </FxProtectedAppPage>
    </TooltipProvider>
  );
}
/* - - - - - - - - - - - - - - - - */
