/*
components/CreateJobForm.js | Structured Create Job flow | Sree | 2026-06-11
*/

"use client";

import { useEffect, useMemo, useState } from "react";
import { FileUp, Sparkles, Upload, Wand2 } from "lucide-react";

import aiActions from "@/public/data/create-job/jobAiActions.json";
import draftSample from "@/public/data/create-job/jobDraftSample.json";
import evaluationContextSample from "@/public/data/create-job/evaluationContextSample.json";
import jobOptions from "@/public/data/create-job/jobOptions.json";
import screeningQuestionPresets from "@/public/data/create-job/screeningQuestionPresets.json";
import { fxButtonClassName } from "@/components/FxButton";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Toast, ToastClose, ToastDescription, ToastTitle } from "@/components/ui/toast";
import { CONTENT_WIDTH_NARROW_CLASS, DEMO_USER, STORAGE_KEYS } from "@/lib/FxConstants";
import { readStoredCollection, writeStoredCollection } from "@/lib/demo-store";
import { cn } from "@/lib/FxUtils";

const STEPS = [
  { id: "basics", label: "Basics" },
  { id: "description", label: "Job Description" },
  { id: "skills", label: "Skills" },
  { id: "screening", label: "Screening" },
  { id: "evaluation", label: "Evaluation" },
  { id: "review", label: "Review & Publish" },
];

const ACTION_META = {
  "upload-jd": {
    title: "Upload JD",
    description: "Upload an existing job description and let Evality extract the useful structure.",
    cta: "Populate from JD",
  },
  "write-ai": {
    title: "Write with AI",
    description: "Use the available role details to draft a recruiter-ready job description.",
    cta: "Generate with AI",
  },
  "rewrite-ai": {
    title: "Rewrite with AI",
    description: "Improve clarity and tone without changing the role intent.",
    cta: "Rewrite description",
  },
  "retrieve-primary-skills": {
    title: "Retrieve Primary Skills from JD",
    description: "Suggest the strongest required skills from the role and JD context.",
    cta: "Apply primary skills",
  },
  "retrieve-secondary-skills": {
    title: "Retrieve Secondary Skills from JD",
    description: "Suggest supporting or nice-to-have skills from the role and JD context.",
    cta: "Apply secondary skills",
  },
  "generate-screening": {
    title: "Generate Screening Questions",
    description: "Create first-pass pre-screening questions the recruiter can edit before publish.",
    cta: "Generate questions",
  },
  "generate-evaluation": {
    title: "Generate Evaluation Context",
    description: "Generate role context and decision prompts for recruiter review.",
    cta: "Generate context",
  },
};

function createInitialDraft() {
  return {
    id: null,
    jobTitle: "",
    positions: "1",
    jobType: jobOptions.jobTypes[0],
    workplaceType: jobOptions.workplaceTypes[0],
    priority: jobOptions.priorities[1],
    experienceMin: "",
    experienceMax: "",
    location: "",
    department: jobOptions.departments[0],
    salaryMin: "",
    salaryMax: "",
    salaryCurrency: jobOptions.currencies[0],
    hideSalary: false,
    clientCompany: "",
    assignee: DEMO_USER.name,
    jobDescription: "",
    primarySkills: [],
    secondarySkills: [],
    screeningQuestions: [],
    evaluationContext: "",
    publishNotes: "Client is optional. Assignee defaults to the current user. Publish only after the essentials feel recruiter-ready.",
  };
}

function Field({ label, optional, children }) {
  return (
    <label className="space-y-[8px]">
      <div className="flex items-center gap-[8px]">
        <span className="text-[14px] font-medium leading-[22px] text-foreground">{label}</span>
        {optional ? <span className="text-[12px] leading-[18px] text-muted-foreground">Optional</span> : null}
      </div>
      {children}
    </label>
  );
}

function StepButton({ isActive, isComplete, label, onClick }) {
  return (
    <button
      type="button"
      className={cn(
        "flex h-[40px] cursor-pointer items-center gap-[8px] rounded-[10px] border px-[12px] text-[13px] font-medium transition-colors",
        isActive
          ? "border-primary bg-primary/10 text-primary"
          : isComplete
            ? "border-border bg-[var(--fx-bg-soft)] text-foreground"
            : "border-border bg-background text-muted-foreground hover:bg-accent hover:text-foreground",
      )}
      onClick={onClick}
    >
      <span
        className={cn(
          "inline-flex h-[18px] w-[18px] items-center justify-center rounded-full text-[11px]",
          isActive ? "bg-primary text-primary-foreground" : "bg-[var(--fx-bg-soft)] text-muted-foreground",
        )}
      >
        {isComplete ? "✓" : ""}
      </span>
      {label}
    </button>
  );
}

function QuestionCard({ question, onRemove }) {
  return (
    <div className="rounded-[12px] border border-border bg-[var(--fx-bg-soft)] p-[16px]">
      <div className="flex items-start justify-between gap-[16px]">
        <div className="space-y-[8px]">
          <span className="inline-flex rounded-full bg-primary/10 px-[10px] py-[4px] text-[12px] font-medium text-primary">
            {question.label}
          </span>
          <p className="text-[16px] leading-[24px] text-foreground">{question.question}</p>
          <p className="text-[13px] leading-[20px] text-muted-foreground">{question.note}</p>
        </div>
        <button
          type="button"
          className="h-[28px] cursor-pointer rounded-[8px] px-[8px] text-[12px] text-muted-foreground hover:bg-accent hover:text-foreground"
          onClick={onRemove}
        >
          Remove
        </button>
      </div>
    </div>
  );
}

function AiActionButtons({ ids, onOpen }) {
  const actions = aiActions.filter((action) => ids.includes(action.id));

  return (
    <div className="flex flex-wrap gap-[8px]">
      {actions.map((action) => {
        const Icon =
          action.id === "upload-jd"
            ? Upload
            : action.id === "rewrite-ai"
              ? Wand2
              : Sparkles;

        return (
          <button
            key={action.id}
            type="button"
            className="inline-flex h-[36px] cursor-pointer items-center gap-[8px] rounded-[8px] border border-border bg-background px-[12px] text-[13px] font-medium text-foreground hover:bg-accent"
            onClick={() => onOpen(action.id)}
          >
            <Icon className="size-[14px]" />
            {action.label}
          </button>
        );
      })}
    </div>
  );
}

export function CreateJobForm({ embedded = false, initialDraft = null, onSaveDraft, onPublishJob }) {
  const [currentStep, setCurrentStep] = useState("basics");
  const [draft, setDraft] = useState(() =>
    initialDraft ? { ...createInitialDraft(), ...initialDraft } : createInitialDraft(),
  );
  const [activeSheet, setActiveSheet] = useState(null);
  const [toastState, setToastState] = useState({ open: false, title: "", description: "" });

  const currentStepIndex = STEPS.findIndex((step) => step.id === currentStep);
  const sheetMeta = activeSheet ? ACTION_META[activeSheet] : null;

  const availablePresets = useMemo(
    () =>
      screeningQuestionPresets.filter(
        (preset) => !draft.screeningQuestions.some((question) => question.id === preset.id),
      ),
    [draft.screeningQuestions],
  );

  const stepCompletion = useMemo(
    () => ({
      basics: Boolean(
        draft.jobTitle.trim() &&
          draft.positions.trim() &&
          draft.workplaceType.trim() &&
          (draft.location.trim() || draft.workplaceType === "Remote") &&
          draft.experienceMin.trim() &&
          draft.experienceMax.trim(),
      ),
      description: Boolean(draft.jobDescription.trim()),
      skills: draft.primarySkills.length > 0,
      screening: draft.screeningQuestions.length > 0,
      evaluation: Boolean(draft.evaluationContext.trim()),
      review: false,
    }),
    [draft],
  );

  useEffect(() => {
    setDraft(initialDraft ? { ...createInitialDraft(), ...initialDraft } : createInitialDraft());
    setCurrentStep("basics");
  }, [initialDraft]);

  function showToast(title, description) {
    setToastState({ open: true, title, description });
  }

  function updateDraftField(field, value) {
    setDraft((currentDraft) => ({ ...currentDraft, [field]: value }));
  }

  function updateArrayField(field, value) {
    updateDraftField(
      field,
      value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    );
  }

  function handleNext() {
    const nextStep = STEPS[currentStepIndex + 1];

    if (nextStep) {
      setCurrentStep(nextStep.id);
    }
  }

  function handleBack() {
    const previousStep = STEPS[currentStepIndex - 1];

    if (previousStep) {
      setCurrentStep(previousStep.id);
    }
  }

  function handleOpenSheet(actionId) {
    setActiveSheet(actionId);
  }

  function handleApplySheetAction() {
    if (!activeSheet) {
      return;
    }

    if (activeSheet === "upload-jd") {
      setDraft((currentDraft) => ({
        ...currentDraft,
        jobTitle: currentDraft.jobTitle || draftSample.jobTitle,
        positions: currentDraft.positions || draftSample.positions,
        jobType: draftSample.jobType,
        workplaceType: draftSample.workplaceType,
        priority: draftSample.priority,
        experienceMin: draftSample.experienceMin,
        experienceMax: draftSample.experienceMax,
        location: currentDraft.location || draftSample.location,
        department: draftSample.department,
        salaryMin: draftSample.salaryMin,
        salaryMax: draftSample.salaryMax,
        salaryCurrency: draftSample.salaryCurrency,
        jobDescription: draftSample.jobDescription,
      }));
      showToast("JD extracted", "Evality populated the basics and description from the uploaded JD.");
    }

    if (activeSheet === "write-ai") {
      setDraft((currentDraft) => ({
        ...currentDraft,
        jobDescription: currentDraft.jobDescription || draftSample.jobDescription,
      }));
      showToast("Description generated", "Evality drafted the job description from the current role details.");
    }

    if (activeSheet === "rewrite-ai") {
      setDraft((currentDraft) => ({
        ...currentDraft,
        jobDescription: currentDraft.jobDescription
          ? `${currentDraft.jobDescription} The role calls for clear communication, practical ownership, and thoughtful collaboration across teams.`
          : draftSample.jobDescription,
      }));
      showToast("Description rewritten", "Evality improved the job description without changing the role intent.");
    }

    if (activeSheet === "retrieve-primary-skills") {
      setDraft((currentDraft) => ({
        ...currentDraft,
        primarySkills: draftSample.primarySkills,
      }));
      showToast("Primary skills added", "Evality suggested required skills from the role context.");
    }

    if (activeSheet === "retrieve-secondary-skills") {
      setDraft((currentDraft) => ({
        ...currentDraft,
        secondarySkills: draftSample.secondarySkills,
      }));
      showToast("Secondary skills added", "Evality suggested supporting skills from the role context.");
    }

    if (activeSheet === "generate-screening") {
      setDraft((currentDraft) => ({
        ...currentDraft,
        screeningQuestions: [...currentDraft.screeningQuestions, ...availablePresets.slice(0, 3)],
      }));
      showToast("Screening questions generated", "Evality added first-pass screening questions for review.");
    }

    if (activeSheet === "generate-evaluation") {
      setDraft((currentDraft) => ({
        ...currentDraft,
        evaluationContext: evaluationContextSample.context,
      }));
      showToast("Evaluation context generated", "Evality generated recruiter-facing evaluation context.");
    }

    setActiveSheet(null);
  }

  function validateDraftForPublish() {
    if (!draft.jobTitle.trim()) {
      return "Job title is required before publish.";
    }

    if (!draft.jobDescription.trim()) {
      return "Job description is required before publish.";
    }

    if (!draft.positions.trim()) {
      return "Number of positions is required before publish.";
    }

    if (!draft.location.trim() && draft.workplaceType !== "Remote") {
      return "Add a location or mark the role as remote before publish.";
    }

    if (!draft.experienceMin.trim() || !draft.experienceMax.trim()) {
      return "Experience range is required before publish.";
    }

    return null;
  }

  async function persistJob(status) {
    const existingJobs = readStoredCollection(STORAGE_KEYS.JOBS) || [];
    const nextJob = {
      id: draft.id || `job-${Date.now()}`,
      title: draft.jobTitle || "Untitled Job",
      company: draft.clientCompany || "My Company",
      status,
      data: draft,
      updatedAt: new Date().toISOString(),
    };

    const updatedJobs = [nextJob, ...existingJobs.filter((job) => job.id !== nextJob.id)];
    writeStoredCollection(STORAGE_KEYS.JOBS, updatedJobs);
    setDraft((currentDraft) => ({ ...currentDraft, id: nextJob.id }));
  }

  async function handleSaveDraft() {
    if (onSaveDraft) {
      await onSaveDraft(draft);
      return;
    }

    await persistJob("Draft");
    showToast("Draft saved", "The job draft was saved to the local demo store.");
  }

  async function handlePublish() {
    const validationError = validateDraftForPublish();

    if (validationError) {
      showToast("Publish blocked", validationError);
      return;
    }

    if (onPublishJob) {
      await onPublishJob(draft);
      return;
    }

    await persistJob("Published");
    showToast("Job published", "The job is published in the prototype and available in Jobs.");
  }

  function renderCurrentStep() {
    if (currentStep === "basics") {
      return (
        <div className="space-y-[24px] rounded-[16px] border border-border bg-card p-[24px]">
          <div className="space-y-[4px]">
            <h2 className="text-[20px] leading-[28px] font-medium text-foreground">Basics</h2>
            <p className="text-[14px] leading-[22px] text-muted-foreground">
              Fill the essentials first. Client is optional and assignee defaults to the current user.
            </p>
          </div>

          <div className="grid gap-[16px] md:grid-cols-2">
            <Field label="Role / Title">
              <input
                value={draft.jobTitle}
                onChange={(event) => updateDraftField("jobTitle", event.target.value)}
                className="h-[44px] w-full rounded-[10px] border border-border bg-background px-[12px] text-[14px] text-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring"
              />
            </Field>

            <Field label="Client / Company" optional>
              <input
                value={draft.clientCompany}
                onChange={(event) => updateDraftField("clientCompany", event.target.value)}
                placeholder="Select client or leave empty"
                className="h-[44px] w-full rounded-[10px] border border-border bg-background px-[12px] text-[14px] text-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring"
              />
            </Field>

            <Field label="Experience Range">
              <div className="grid grid-cols-2 gap-[12px]">
                <input
                  value={draft.experienceMin}
                  onChange={(event) => updateDraftField("experienceMin", event.target.value)}
                  placeholder="Min years"
                  className="h-[44px] rounded-[10px] border border-border bg-background px-[12px] text-[14px] text-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring"
                />
                <input
                  value={draft.experienceMax}
                  onChange={(event) => updateDraftField("experienceMax", event.target.value)}
                  placeholder="Max years"
                  className="h-[44px] rounded-[10px] border border-border bg-background px-[12px] text-[14px] text-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring"
                />
              </div>
            </Field>

            <Field label="Location">
              <input
                value={draft.location}
                onChange={(event) => updateDraftField("location", event.target.value)}
                placeholder="City / locality"
                className="h-[44px] w-full rounded-[10px] border border-border bg-background px-[12px] text-[14px] text-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring"
              />
            </Field>

            <Field label="Number of Positions">
              <input
                value={draft.positions}
                onChange={(event) => updateDraftField("positions", event.target.value)}
                className="h-[44px] w-full rounded-[10px] border border-border bg-background px-[12px] text-[14px] text-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring"
              />
            </Field>

            <Field label="Job Type">
              <select
                value={draft.jobType}
                onChange={(event) => updateDraftField("jobType", event.target.value)}
                className="h-[44px] w-full rounded-[10px] border border-border bg-background px-[12px] text-[14px] text-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring"
              >
                {jobOptions.jobTypes.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Workplace Type">
              <select
                value={draft.workplaceType}
                onChange={(event) => updateDraftField("workplaceType", event.target.value)}
                className="h-[44px] w-full rounded-[10px] border border-border bg-background px-[12px] text-[14px] text-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring"
              >
                {jobOptions.workplaceTypes.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Priority">
              <select
                value={draft.priority}
                onChange={(event) => updateDraftField("priority", event.target.value)}
                className="h-[44px] w-full rounded-[10px] border border-border bg-background px-[12px] text-[14px] text-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring"
              >
                {jobOptions.priorities.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Salary" optional>
              <div className="grid grid-cols-[100px_1fr_1fr] gap-[12px]">
                <select
                  value={draft.salaryCurrency}
                  onChange={(event) => updateDraftField("salaryCurrency", event.target.value)}
                  className="h-[44px] rounded-[10px] border border-border bg-background px-[12px] text-[14px] text-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring"
                >
                  {jobOptions.currencies.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <input
                  value={draft.salaryMin}
                  onChange={(event) => updateDraftField("salaryMin", event.target.value)}
                  placeholder="Minimum"
                  className="h-[44px] rounded-[10px] border border-border bg-background px-[12px] text-[14px] text-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring"
                />
                <input
                  value={draft.salaryMax}
                  onChange={(event) => updateDraftField("salaryMax", event.target.value)}
                  placeholder="Maximum"
                  className="h-[44px] rounded-[10px] border border-border bg-background px-[12px] text-[14px] text-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring"
                />
              </div>
            </Field>

            <Field label="Required Skills" optional>
              <input
                value={draft.primarySkills.join(", ")}
                onChange={(event) => updateArrayField("primarySkills", event.target.value)}
                placeholder="React, TypeScript, Product thinking"
                className="h-[44px] w-full rounded-[10px] border border-border bg-background px-[12px] text-[14px] text-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring"
              />
            </Field>

            <Field label="Job Assignee" optional>
              <select
                value={draft.assignee}
                onChange={(event) => updateDraftField("assignee", event.target.value)}
                className="h-[44px] w-full rounded-[10px] border border-border bg-background px-[12px] text-[14px] text-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring"
              >
                {[DEMO_USER.name, ...jobOptions.assignees.filter((name) => name !== DEMO_USER.name)].map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <label className="flex items-center gap-[12px]">
            <input
              type="checkbox"
              checked={draft.hideSalary}
              onChange={(event) => updateDraftField("hideSalary", event.target.checked)}
              className="h-[16px] w-[16px] rounded border-border"
            />
            <span className="text-[14px] leading-[22px] text-muted-foreground">
              Do not disclose salary to candidates
            </span>
          </label>
        </div>
      );
    }

    if (currentStep === "description") {
      return (
        <div className="space-y-[24px] rounded-[16px] border border-border bg-card p-[24px]">
          <div className="flex flex-col gap-[16px] md:flex-row md:items-start md:justify-between">
            <div className="space-y-[4px]">
              <h2 className="text-[20px] leading-[28px] font-medium text-foreground">Job Description</h2>
              <p className="text-[14px] leading-[22px] text-muted-foreground">
                Upload an existing JD, write with AI, or draft the description directly.
              </p>
            </div>
            <AiActionButtons ids={["upload-jd", "write-ai", "rewrite-ai"]} onOpen={handleOpenSheet} />
          </div>

          <Field label="Job Description">
            <textarea
              value={draft.jobDescription}
              onChange={(event) => updateDraftField("jobDescription", event.target.value)}
              placeholder="Describe the role, responsibilities, and what good looks like."
              className="min-h-[260px] w-full resize-none rounded-[12px] border border-border bg-background px-[16px] py-[16px] text-[14px] leading-[22px] text-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring"
            />
          </Field>
        </div>
      );
    }

    if (currentStep === "skills") {
      return (
        <div className="space-y-[24px] rounded-[16px] border border-border bg-card p-[24px]">
          <div className="flex flex-col gap-[16px] md:flex-row md:items-start md:justify-between">
            <div className="space-y-[4px]">
              <h2 className="text-[20px] leading-[28px] font-medium text-foreground">Skills</h2>
              <p className="text-[14px] leading-[22px] text-muted-foreground">
                Keep primary skills tight. Secondary skills are optional and helpful for matching later.
              </p>
            </div>
            <AiActionButtons
              ids={["retrieve-primary-skills", "retrieve-secondary-skills"]}
              onOpen={handleOpenSheet}
            />
          </div>

          <div className="space-y-[16px]">
            <Field label="Primary Skills">
              <textarea
                value={draft.primarySkills.join(", ")}
                onChange={(event) => updateArrayField("primarySkills", event.target.value)}
                placeholder="React, JavaScript, TypeScript, Product sense"
                className="min-h-[120px] w-full resize-none rounded-[12px] border border-border bg-background px-[16px] py-[16px] text-[14px] leading-[22px] text-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring"
              />
            </Field>

            <Field label="Secondary Skills" optional>
              <textarea
                value={draft.secondarySkills.join(", ")}
                onChange={(event) => updateArrayField("secondarySkills", event.target.value)}
                placeholder="Next.js, Testing, Accessibility, Design collaboration"
                className="min-h-[120px] w-full resize-none rounded-[12px] border border-border bg-background px-[16px] py-[16px] text-[14px] leading-[22px] text-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring"
              />
            </Field>
          </div>
        </div>
      );
    }

    if (currentStep === "screening") {
      return (
        <div className="space-y-[24px] rounded-[16px] border border-border bg-card p-[24px]">
          <div className="flex flex-col gap-[16px] md:flex-row md:items-start md:justify-between">
            <div className="space-y-[4px]">
              <h2 className="text-[20px] leading-[28px] font-medium text-foreground">Screening</h2>
              <p className="text-[14px] leading-[22px] text-muted-foreground">
                Use AI for a first pass, then adjust the questions section by section.
              </p>
            </div>
            <AiActionButtons ids={["generate-screening"]} onOpen={handleOpenSheet} />
          </div>

          <div className="space-y-[16px]">
            {draft.screeningQuestions.length ? (
              draft.screeningQuestions.map((question) => (
                <QuestionCard
                  key={question.id}
                  question={question}
                  onRemove={() =>
                    updateDraftField(
                      "screeningQuestions",
                      draft.screeningQuestions.filter((currentQuestion) => currentQuestion.id !== question.id),
                    )
                  }
                />
              ))
            ) : (
              <div className="rounded-[12px] border border-dashed border-border bg-[var(--fx-bg-soft)] p-[16px] text-[14px] leading-[22px] text-muted-foreground">
                No screening questions yet. Generate them with AI or add preset questions below.
              </div>
            )}

            <div className="space-y-[12px]">
              <p className="text-[14px] font-medium leading-[22px] text-foreground">Add preset questions</p>
              <div className="flex flex-wrap gap-[8px]">
                {availablePresets.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    className="cursor-pointer rounded-full border border-border bg-background px-[12px] py-[8px] text-[13px] leading-[20px] text-foreground hover:bg-accent"
                    onClick={() =>
                      updateDraftField("screeningQuestions", [...draft.screeningQuestions, preset])
                    }
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (currentStep === "evaluation") {
      return (
        <div className="space-y-[24px] rounded-[16px] border border-border bg-card p-[24px]">
          <div className="flex flex-col gap-[16px] md:flex-row md:items-start md:justify-between">
            <div className="space-y-[4px]">
              <h2 className="text-[20px] leading-[28px] font-medium text-foreground">Evaluation</h2>
              <p className="text-[14px] leading-[22px] text-muted-foreground">
                AI can help create evaluation context, but the recruiter should still review and refine it.
              </p>
            </div>
            <AiActionButtons ids={["generate-evaluation"]} onOpen={handleOpenSheet} />
          </div>

          <Field label="Evaluation Context">
            <textarea
              value={draft.evaluationContext}
              onChange={(event) => updateDraftField("evaluationContext", event.target.value)}
              placeholder="Describe what good looks like for the hiring team and interviewers."
              className="min-h-[240px] w-full resize-none rounded-[12px] border border-border bg-background px-[16px] py-[16px] text-[14px] leading-[22px] text-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring"
            />
          </Field>
        </div>
      );
    }

    return (
      <div className="space-y-[24px] rounded-[16px] border border-border bg-card p-[24px]">
        <div className="space-y-[4px]">
          <h2 className="text-[20px] leading-[28px] font-medium text-foreground">Review & Publish</h2>
          <p className="text-[14px] leading-[22px] text-muted-foreground">
            Review the essentials, then save or publish. Benefits and deeper settings stay out of the MVP flow.
          </p>
        </div>

        <div className="space-y-[16px] rounded-[12px] border border-primary/20 bg-primary/5 p-[16px]">
          <div className="flex flex-wrap items-start justify-between gap-[12px]">
            <div className="space-y-[4px]">
              <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-primary">Job summary</p>
              <h3 className="text-[24px] leading-[32px] font-medium text-foreground">
                {draft.jobTitle || "Untitled job"}
              </h3>
              <p className="text-[14px] leading-[22px] text-muted-foreground">
                {draft.clientCompany || "My Company"} · {draft.location || "Location pending"} · {draft.positions || "0"} positions
              </p>
            </div>

            <div className="flex flex-wrap gap-[8px] text-[13px] text-muted-foreground">
              <span className="rounded-full bg-background px-[12px] py-[8px]">{draft.jobType}</span>
              <span className="rounded-full bg-background px-[12px] py-[8px]">{draft.workplaceType}</span>
              <span className="rounded-full bg-background px-[12px] py-[8px]">{draft.priority}</span>
            </div>
          </div>

          <div className="grid gap-[16px] md:grid-cols-2">
            <div className="space-y-[8px]">
              <p className="text-[13px] font-medium text-foreground">Primary Skills</p>
              <p className="text-[14px] leading-[22px] text-muted-foreground">
                {draft.primarySkills.length ? draft.primarySkills.join(", ") : "Not added yet"}
              </p>
            </div>
            <div className="space-y-[8px]">
              <p className="text-[13px] font-medium text-foreground">Screening Questions</p>
              <p className="text-[14px] leading-[22px] text-muted-foreground">
                {draft.screeningQuestions.length ? `${draft.screeningQuestions.length} questions prepared` : "No screening questions yet"}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-[12px] border border-border bg-[var(--fx-bg-soft)] p-[16px] text-[14px] leading-[22px] text-muted-foreground">
          <p className="font-medium text-foreground">Minimum required before publish</p>
          <ul className="mt-[8px] list-disc space-y-[4px] pl-[20px]">
            <li>Role / title</li>
            <li>Job description</li>
            <li>Number of positions</li>
            <li>Location or remote workplace type</li>
            <li>Experience range</li>
          </ul>
        </div>

        <p className="text-[14px] leading-[22px] text-muted-foreground">{draft.publishNotes}</p>
      </div>
    );
  }

  return (
    <>
      <div className={`${embedded ? "mt-0 w-full max-w-none" : `mx-auto mt-[32px] w-full ${CONTENT_WIDTH_NARROW_CLASS}`} space-y-[24px]`}>
        <div
          className={cn(
            "flex flex-col gap-[16px] rounded-[16px] border border-border bg-card p-[24px] md:flex-row md:items-start",
            embedded ? "md:justify-end" : "md:justify-between",
          )}
        >
          {!embedded ? (
            <div className="space-y-[4px]">
              <h1 className="text-[30px] leading-[36px] font-medium text-foreground">Create Job</h1>
              <p className="text-[14px] leading-[22px] text-muted-foreground">
                Fill the essentials, use AI helpers where helpful, then review and publish.
              </p>
            </div>
          ) : null}

          <div className="flex items-center gap-[12px]">
            <button
              type="button"
              className={fxButtonClassName({ variant: "outline", size: "md", className: "rounded-[8px]" })}
              onClick={handleSaveDraft}
            >
              Save Draft
            </button>
            <button
              type="button"
              className={fxButtonClassName({ size: "md", className: "rounded-[8px]" })}
              onClick={handlePublish}
            >
              Publish Job
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-[8px]">
          {STEPS.map((step) => (
            <StepButton
              key={step.id}
              label={step.label}
              isActive={currentStep === step.id}
              isComplete={stepCompletion[step.id]}
              onClick={() => setCurrentStep(step.id)}
            />
          ))}
        </div>

        {renderCurrentStep()}

        <div className="flex items-center justify-between gap-[16px] rounded-[16px] border border-border bg-card p-[24px]">
          <button
            type="button"
            className={fxButtonClassName({
              variant: "outline",
              size: "md",
              className: "rounded-[8px]",
            })}
            onClick={handleBack}
            disabled={currentStepIndex === 0}
          >
            Back
          </button>

          <button
            type="button"
            className={fxButtonClassName({ size: "md", className: "rounded-[8px]" })}
            onClick={handleNext}
            disabled={currentStepIndex === STEPS.length - 1}
          >
            {currentStep === "evaluation" ? "Review" : "Next"}
          </button>
        </div>
      </div>

      <Sheet open={Boolean(activeSheet)} onOpenChange={(open) => !open && setActiveSheet(null)}>
        <SheetContent side="right">
          <SheetHeader>
            <SheetTitle>{sheetMeta?.title}</SheetTitle>
            <SheetDescription>{sheetMeta?.description}</SheetDescription>
          </SheetHeader>

          <div className="space-y-[16px]">
            {activeSheet === "upload-jd" ? (
              <div className="rounded-[16px] border border-dashed border-border bg-[var(--fx-bg-soft)] p-[24px] text-center">
                <FileUp className="mx-auto size-[28px] text-primary" />
                <p className="mt-[16px] text-[16px] leading-[24px] text-foreground">Drop a JD here to extract the role</p>
                <p className="mt-[8px] text-[14px] leading-[22px] text-muted-foreground">
                  In this prototype, applying this action will populate the basics and job description from sample data.
                </p>
              </div>
            ) : null}

            {activeSheet === "write-ai" ? (
              <div className="rounded-[16px] border border-border bg-[var(--fx-bg-soft)] p-[16px] text-[14px] leading-[22px] text-muted-foreground">
                AI will use the structured fields already entered to suggest a description. Without enough context, it should assist rather than invent.
              </div>
            ) : null}

            {activeSheet === "rewrite-ai" ? (
              <div className="rounded-[16px] border border-border bg-[var(--fx-bg-soft)] p-[16px] text-[14px] leading-[22px] text-muted-foreground">
                Rewrite keeps the role intent intact while improving clarity and recruiter readability.
              </div>
            ) : null}

            {activeSheet === "retrieve-primary-skills" || activeSheet === "retrieve-secondary-skills" ? (
              <div className="rounded-[16px] border border-border bg-[var(--fx-bg-soft)] p-[16px] text-[14px] leading-[22px] text-muted-foreground">
                Evality can suggest skills from the JD and current role details. Review them before moving to the next step.
              </div>
            ) : null}

            {activeSheet === "generate-screening" ? (
              <div className="space-y-[8px]">
                {availablePresets.slice(0, 3).map((preset) => (
                  <div key={preset.id} className="rounded-[12px] border border-border bg-[var(--fx-bg-soft)] p-[12px]">
                    <p className="text-[13px] font-medium leading-[20px] text-foreground">{preset.label}</p>
                    <p className="text-[13px] leading-[20px] text-muted-foreground">{preset.question}</p>
                  </div>
                ))}
              </div>
            ) : null}

            {activeSheet === "generate-evaluation" ? (
              <div className="space-y-[8px]">
                {evaluationContextSample.questions.map((question) => (
                  <div
                    key={question}
                    className="rounded-[12px] border border-border bg-[var(--fx-bg-soft)] p-[12px] text-[13px] leading-[20px] text-foreground"
                  >
                    {question}
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          <SheetFooter>
            <button
              type="button"
              className={fxButtonClassName({ variant: "outline", size: "md", className: "rounded-[8px]" })}
              onClick={() => setActiveSheet(null)}
            >
              Cancel
            </button>
            <button
              type="button"
              className={fxButtonClassName({ size: "md", className: "rounded-[8px]" })}
              onClick={handleApplySheetAction}
            >
              {sheetMeta?.cta || "Apply"}
            </button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <Toast
        open={toastState.open}
        onOpenChange={(open) => setToastState((currentToast) => ({ ...currentToast, open }))}
      >
        <div className="space-y-[4px]">
          <ToastTitle>{toastState.title}</ToastTitle>
          <ToastDescription>{toastState.description}</ToastDescription>
        </div>
        <ToastClose />
      </Toast>
    </>
  );
}
