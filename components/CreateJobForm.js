/*
components/CreateJobForm.js | Structured Create Job flow | Sree | 2026-06-11
*/

"use client";

import { forwardRef, useEffect, useImperativeHandle, useMemo, useState } from "react";

import draftSample from "@/public/data/create-job/jobDraftSample.json";
import evaluationContextSample from "@/public/data/create-job/evaluationContextSample.json";
import jobOptions from "@/public/data/create-job/jobOptions.json";
import screeningQuestionPresets from "@/public/data/create-job/screeningQuestionPresets.json";
import { Toast, ToastClose, ToastDescription, ToastTitle } from "@/components/ui/toast";
import { DEMO_USER, STORAGE_KEYS } from "@/lib/FxConstants";
import { FX_TYPOGRAPHY } from "@/lib/FxTheme";
import { cn, readStoredJSON, writeStoredJSON } from "@/lib/FxUtils";

const STEPS = [
  { id: "basics", label: "Basics" },
  { id: "description", label: "Description" },
  { id: "skills", label: "Skills" },
  { id: "screening", label: "Screening" },
  { id: "evaluation", label: "Evaluation" },
  { id: "review", label: "Review" },
];

const INPUT_CLASS = `h-[44px] w-full rounded-[10px] border border-border bg-background px-[12px] ${FX_TYPOGRAPHY.input} text-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring`;
const INPUT_INLINE_CLASS = `h-[44px] rounded-[10px] border border-border bg-background px-[12px] ${FX_TYPOGRAPHY.input} text-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring`;
const TEXTAREA_CLASS = `w-full resize-none rounded-[12px] border border-border bg-background px-[16px] py-[16px] ${FX_TYPOGRAPHY.input} text-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring`;
const STEP_ACTION_CLASS = `inline-flex h-[36px] cursor-pointer items-center gap-[8px] rounded-[8px] border border-border bg-background px-[12px] ${FX_TYPOGRAPHY.stepLabel} text-foreground hover:bg-accent`;
const CHIP_CLASS = `cursor-pointer rounded-full border border-border bg-background px-[12px] py-[8px] ${FX_TYPOGRAPHY.small} text-foreground hover:bg-accent`;

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
        <span className={`${FX_TYPOGRAPHY.fieldLabel} text-foreground`}>{label}</span>
        {optional ? <span className={`${FX_TYPOGRAPHY.fieldHint} text-muted-foreground`}>Optional</span> : null}
      </div>
      {children}
    </label>
  );
}

function WorkflowStep({ index, label, isActive, isComplete, onClick }) {
  return (
    <button
      type="button"
      className={cn(
        `relative flex cursor-pointer items-center gap-[10px] border-b-[2px] px-[2px] pb-[12px] pt-[2px] ${FX_TYPOGRAPHY.stepLabel} transition-colors`,
        isActive
          ? "border-primary text-primary"
          : "border-transparent text-muted-foreground hover:text-foreground",
      )}
      onClick={onClick}
    >
      <span
        className={cn(
          `inline-flex h-[24px] w-[24px] items-center justify-center rounded-full border ${FX_TYPOGRAPHY.stepCounter}`,
          isActive
            ? "border-primary bg-primary text-primary-foreground"
            : isComplete
              ? "border-primary/40 bg-primary/10 text-primary"
              : "border-border bg-background text-muted-foreground",
        )}
      >
        {isComplete ? "✓" : index + 1}
      </span>
      <span>{label}</span>
      {isActive ? <span className="absolute inset-x-0 bottom-[-1px] h-[2px] rounded-full bg-primary" /> : null}
    </button>
  );
}

function QuestionCard({ question, onRemove }) {
  return (
    <div className="rounded-[12px] border border-border bg-[var(--fx-bg-soft)] p-[16px]">
      <div className="flex items-start justify-between gap-[16px]">
        <div className="space-y-[8px]">
          <span className={`inline-flex rounded-full bg-primary/10 px-[10px] py-[4px] ${FX_TYPOGRAPHY.metaLabel} text-primary`}>
            {question.label}
          </span>
          <p className={`${FX_TYPOGRAPHY.bodyLg} text-foreground`}>{question.question}</p>
          <p className={`${FX_TYPOGRAPHY.small} text-muted-foreground`}>{question.note}</p>
        </div>
        <button
          type="button"
          className={`h-[28px] cursor-pointer rounded-[8px] px-[8px] ${FX_TYPOGRAPHY.caption} text-muted-foreground hover:bg-accent hover:text-foreground`}
          onClick={onRemove}
        >
          Remove
        </button>
      </div>
    </div>
  );
}

export const CreateJobForm = forwardRef(function CreateJobForm(
  { initialDraft = null, onSaveDraft, onPublishJob, onStateChange },
  ref,
) {
  const [currentStep, setCurrentStep] = useState("basics");
  const [draft, setDraft] = useState(() =>
    initialDraft ? { ...createInitialDraft(), ...initialDraft } : createInitialDraft(),
  );
  const [toastState, setToastState] = useState({ open: false, title: "", description: "" });
  const initialDraftSnapshot = useMemo(
    () => JSON.stringify(initialDraft ? { ...createInitialDraft(), ...initialDraft } : createInitialDraft()),
    [initialDraft],
  );

  const currentStepIndex = STEPS.findIndex((step) => step.id === currentStep);

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

  const isDirty = useMemo(() => JSON.stringify(draft) !== initialDraftSnapshot, [draft, initialDraftSnapshot]);

  useEffect(() => {
    setDraft(initialDraft ? { ...createInitialDraft(), ...initialDraft } : createInitialDraft());
    setCurrentStep("basics");
  }, [initialDraft]);

  useEffect(() => {
    onStateChange?.({
      draft,
      currentStep,
      currentStepIndex,
      steps: STEPS,
      stepCompletion,
      isDirty,
    });
  }, [currentStep, currentStepIndex, draft, isDirty, onStateChange, stepCompletion]);

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

  function applyAiAction(actionId) {
    if (actionId === "upload-jd") {
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

    if (actionId === "write-ai") {
      setDraft((currentDraft) => ({
        ...currentDraft,
        jobDescription: currentDraft.jobDescription || draftSample.jobDescription,
      }));
      showToast("Description generated", "Evality drafted the job description from the current role details.");
    }

    if (actionId === "rewrite-ai") {
      setDraft((currentDraft) => ({
        ...currentDraft,
        jobDescription: currentDraft.jobDescription
          ? `${currentDraft.jobDescription} The role calls for clear communication, practical ownership, and thoughtful collaboration across teams.`
          : draftSample.jobDescription,
      }));
      showToast("Description rewritten", "Evality improved the job description without changing the role intent.");
    }

    if (actionId === "retrieve-primary-skills") {
      setDraft((currentDraft) => ({
        ...currentDraft,
        primarySkills: draftSample.primarySkills,
      }));
      showToast("Primary skills added", "Evality suggested required skills from the role context.");
    }

    if (actionId === "retrieve-secondary-skills") {
      setDraft((currentDraft) => ({
        ...currentDraft,
        secondarySkills: draftSample.secondarySkills,
      }));
      showToast("Secondary skills added", "Evality suggested supporting skills from the role context.");
    }

    if (actionId === "generate-screening") {
      setDraft((currentDraft) => ({
        ...currentDraft,
        screeningQuestions: [...currentDraft.screeningQuestions, ...availablePresets.slice(0, 3)],
      }));
      showToast("Screening questions generated", "Evality added first-pass screening questions for review.");
    }

    if (actionId === "generate-evaluation") {
      setDraft((currentDraft) => ({
        ...currentDraft,
        evaluationContext: evaluationContextSample.context,
      }));
      showToast("Evaluation context generated", "Evality generated recruiter-facing evaluation context.");
    }
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
    const existingJobs = readStoredJSON(STORAGE_KEYS.JOBS) || [];
    const existingMatch = existingJobs.find((job) => job.id === draft.id) || null;
    const nextJob = {
      id: draft.id || `job-${Date.now()}`,
      title: draft.jobTitle || "Untitled Job",
      company: draft.clientCompany || "My Company",
      positions: Number(draft.positions || existingMatch?.positions || 1),
      createdBy: draft.assignee || existingMatch?.createdBy || DEMO_USER.name,
      location: draft.location || (draft.workplaceType === "Remote" ? "Remote" : "—"),
      experience: `${draft.experienceMin || "0"} - ${draft.experienceMax || "0"} yrs`,
      unscreenedCount: existingMatch?.unscreenedCount ?? 0,
      preScreenedCount: existingMatch?.preScreenedCount ?? 0,
      shortlistedCount: existingMatch?.shortlistedCount ?? 0,
      sentToClientCount: existingMatch?.sentToClientCount ?? 0,
      status,
      createdAt: existingMatch?.createdAt || new Date().toISOString(),
      data: draft,
      updatedAt: new Date().toISOString(),
    };

    const updatedJobs = [nextJob, ...existingJobs.filter((job) => job.id !== nextJob.id)];
    writeStoredJSON(STORAGE_KEYS.JOBS, updatedJobs);
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
            <h2 className={`${FX_TYPOGRAPHY.sectionTitle} text-foreground`}>Basics</h2>
            <p className={`${FX_TYPOGRAPHY.sectionSubtitle} text-muted-foreground`}>
              Fill the essentials first. Client is optional and assignee defaults to the current user.
            </p>
          </div>

          <div className="grid gap-[16px] md:grid-cols-2">
            <Field label="Role / Title">
              <input
                value={draft.jobTitle}
                onChange={(event) => updateDraftField("jobTitle", event.target.value)}
                className={INPUT_CLASS}
              />
            </Field>

            <Field label="Client / Company" optional>
              <input
                value={draft.clientCompany}
                onChange={(event) => updateDraftField("clientCompany", event.target.value)}
                placeholder="Select client or leave empty"
                className={INPUT_CLASS}
              />
            </Field>

            <Field label="Experience Range">
              <div className="grid grid-cols-2 gap-[12px]">
                <input
                  value={draft.experienceMin}
                  onChange={(event) => updateDraftField("experienceMin", event.target.value)}
                  placeholder="Min years"
                  className={INPUT_INLINE_CLASS}
                />
                <input
                  value={draft.experienceMax}
                  onChange={(event) => updateDraftField("experienceMax", event.target.value)}
                  placeholder="Max years"
                  className={INPUT_INLINE_CLASS}
                />
              </div>
            </Field>

            <Field label="Location">
              <input
                value={draft.location}
                onChange={(event) => updateDraftField("location", event.target.value)}
                placeholder="City / locality"
                className={INPUT_CLASS}
              />
            </Field>

            <Field label="Number of Positions">
              <input
                value={draft.positions}
                onChange={(event) => updateDraftField("positions", event.target.value)}
                className={INPUT_CLASS}
              />
            </Field>

            <Field label="Job Type">
              <select
                value={draft.jobType}
                onChange={(event) => updateDraftField("jobType", event.target.value)}
                className={INPUT_CLASS}
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
                className={INPUT_CLASS}
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
                className={INPUT_CLASS}
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
                  className={INPUT_INLINE_CLASS}
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
                  className={INPUT_INLINE_CLASS}
                />
                <input
                  value={draft.salaryMax}
                  onChange={(event) => updateDraftField("salaryMax", event.target.value)}
                  placeholder="Maximum"
                  className={INPUT_INLINE_CLASS}
                />
              </div>
            </Field>

            <Field label="Required Skills" optional>
              <input
                value={draft.primarySkills.join(", ")}
                onChange={(event) => updateArrayField("primarySkills", event.target.value)}
                placeholder="React, JavaScript, Product thinking"
                className={INPUT_CLASS}
              />
            </Field>

            <Field label="Job Assignee" optional>
              <select
                value={draft.assignee}
                onChange={(event) => updateDraftField("assignee", event.target.value)}
                className={INPUT_CLASS}
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
            <span className={FX_TYPOGRAPHY.body + " text-muted-foreground"}>
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
              <h2 className={`${FX_TYPOGRAPHY.sectionTitle} text-foreground`}>Job Description</h2>
              <p className={`${FX_TYPOGRAPHY.sectionSubtitle} text-muted-foreground`}>
                Upload an existing JD, write with AI, or draft the description directly.
              </p>
            </div>
            <div className="flex flex-wrap gap-[8px]">
              <button
                type="button"
                className={STEP_ACTION_CLASS}
                onClick={() => applyAiAction("upload-jd")}
              >
                Upload JD
              </button>
              <button
                type="button"
                className={STEP_ACTION_CLASS}
                onClick={() => applyAiAction("write-ai")}
              >
                Write with AI
              </button>
              <button
                type="button"
                className={STEP_ACTION_CLASS}
                onClick={() => applyAiAction("rewrite-ai")}
              >
                Rewrite with AI
              </button>
            </div>
          </div>

          <Field label="Job Description">
            <textarea
              value={draft.jobDescription}
              onChange={(event) => updateDraftField("jobDescription", event.target.value)}
              placeholder="Describe the role, responsibilities, and what good looks like."
              className={`${TEXTAREA_CLASS} min-h-[260px]`}
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
              <h2 className={`${FX_TYPOGRAPHY.sectionTitle} text-foreground`}>Skills</h2>
              <p className={`${FX_TYPOGRAPHY.sectionSubtitle} text-muted-foreground`}>
                Keep primary skills tight. Secondary skills are optional and helpful for matching later.
              </p>
            </div>
            <div className="flex flex-wrap gap-[8px]">
              <button
                type="button"
                className={STEP_ACTION_CLASS}
                onClick={() => applyAiAction("retrieve-primary-skills")}
              >
                Retrieve Primary Skills from JD
              </button>
              <button
                type="button"
                className={STEP_ACTION_CLASS}
                onClick={() => applyAiAction("retrieve-secondary-skills")}
              >
                Retrieve Secondary Skills from JD
              </button>
            </div>
          </div>

          <div className="space-y-[16px]">
            <Field label="Primary Skills">
              <textarea
                value={draft.primarySkills.join(", ")}
                onChange={(event) => updateArrayField("primarySkills", event.target.value)}
                placeholder="React, JavaScript, TypeScript, Product sense"
                className={`${TEXTAREA_CLASS} min-h-[120px]`}
              />
            </Field>

            <Field label="Secondary Skills" optional>
              <textarea
                value={draft.secondarySkills.join(", ")}
                onChange={(event) => updateArrayField("secondarySkills", event.target.value)}
                placeholder="Next.js, Testing, Accessibility, Design collaboration"
                className={`${TEXTAREA_CLASS} min-h-[120px]`}
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
              <h2 className={`${FX_TYPOGRAPHY.sectionTitle} text-foreground`}>Screening</h2>
              <p className={`${FX_TYPOGRAPHY.sectionSubtitle} text-muted-foreground`}>
                Use AI for a first pass, then adjust the questions section by section.
              </p>
            </div>
            <button
              type="button"
              className={STEP_ACTION_CLASS}
              onClick={() => applyAiAction("generate-screening")}
            >
              Generate Screening Questions
            </button>
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
              <div className={`rounded-[12px] border border-dashed border-border bg-[var(--fx-bg-soft)] p-[16px] ${FX_TYPOGRAPHY.workspaceSubtitle} text-muted-foreground`}>
                No screening questions yet. Generate them with AI or add preset questions below.
              </div>
            )}

            <div className="space-y-[12px]">
              <p className={`${FX_TYPOGRAPHY.fieldLabel} text-foreground`}>Add preset questions</p>
              <div className="flex flex-wrap gap-[8px]">
                {availablePresets.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  className={CHIP_CLASS}
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
              <h2 className={`${FX_TYPOGRAPHY.sectionTitle} text-foreground`}>Evaluation</h2>
              <p className={`${FX_TYPOGRAPHY.sectionSubtitle} text-muted-foreground`}>
                AI can help create evaluation context, but the recruiter should still review and refine it.
              </p>
            </div>
            <button
              type="button"
              className={STEP_ACTION_CLASS}
              onClick={() => applyAiAction("generate-evaluation")}
            >
              Generate Evaluation Context
            </button>
          </div>

          <Field label="Evaluation Context">
            <textarea
              value={draft.evaluationContext}
              onChange={(event) => updateDraftField("evaluationContext", event.target.value)}
              placeholder="Describe what good looks like for the hiring team and interviewers."
              className={`${TEXTAREA_CLASS} min-h-[240px]`}
            />
          </Field>
        </div>
      );
    }

    return (
      <div className="space-y-[24px] rounded-[16px] border border-border bg-card p-[24px]">
        <div className="space-y-[4px]">
          <h2 className={`${FX_TYPOGRAPHY.sectionTitle} text-foreground`}>Review</h2>
          <p className={`${FX_TYPOGRAPHY.sectionSubtitle} text-muted-foreground`}>
            Review the essentials, then save or publish. Benefits and deeper settings stay out of the MVP flow.
          </p>
        </div>

        <div className="space-y-[16px] rounded-[12px] border border-primary/20 bg-primary/5 p-[16px]">
          <div className="flex flex-wrap items-start justify-between gap-[12px]">
            <div className="space-y-[4px]">
              <p className={`${FX_TYPOGRAPHY.metaLabel} uppercase tracking-[0.08em] text-primary`}>Job summary</p>
              <h3 className={`${FX_TYPOGRAPHY.cardTitle} text-foreground`}>
                {draft.jobTitle || "Untitled job"}
              </h3>
              <p className={`${FX_TYPOGRAPHY.cardSubtitle} text-muted-foreground`}>
                {draft.clientCompany || "My Company"} · {draft.location || "Location pending"} · {draft.positions || "0"} positions
              </p>
            </div>

            <div className={`flex flex-wrap gap-[8px] ${FX_TYPOGRAPHY.small} text-muted-foreground`}>
              <span className="rounded-full bg-background px-[12px] py-[8px]">{draft.jobType}</span>
              <span className="rounded-full bg-background px-[12px] py-[8px]">{draft.workplaceType}</span>
              <span className="rounded-full bg-background px-[12px] py-[8px]">{draft.priority}</span>
            </div>
          </div>

          <div className="grid gap-[16px] md:grid-cols-2">
            <div className="space-y-[8px]">
              <p className={`${FX_TYPOGRAPHY.cardTitle} text-foreground`}>Primary Skills</p>
              <p className={`${FX_TYPOGRAPHY.cardSubtitle} text-muted-foreground`}>
                {draft.primarySkills.length ? draft.primarySkills.join(", ") : "Not added yet"}
              </p>
            </div>
            <div className="space-y-[8px]">
              <p className={`${FX_TYPOGRAPHY.cardTitle} text-foreground`}>Screening Questions</p>
              <p className={`${FX_TYPOGRAPHY.cardSubtitle} text-muted-foreground`}>
                {draft.screeningQuestions.length ? `${draft.screeningQuestions.length} questions prepared` : "No screening questions yet"}
              </p>
            </div>
          </div>
        </div>

        <div className={`rounded-[12px] border border-border bg-[var(--fx-bg-soft)] p-[16px] ${FX_TYPOGRAPHY.cardSubtitle} text-muted-foreground`}>
          <p className={`${FX_TYPOGRAPHY.cardTitle} text-foreground`}>Minimum required before publish</p>
          <ul className="mt-[8px] list-disc space-y-[4px] pl-[20px]">
            <li>Role / title</li>
            <li>Job description</li>
            <li>Number of positions</li>
            <li>Location or remote workplace type</li>
            <li>Experience range</li>
          </ul>
        </div>

        <p className={`${FX_TYPOGRAPHY.cardSubtitle} text-muted-foreground`}>{draft.publishNotes}</p>
      </div>
    );
  }

  useImperativeHandle(
    ref,
    () => ({
      saveDraft: handleSaveDraft,
      publish: handlePublish,
      back: handleBack,
      next: handleNext,
      goToStep: (stepId) => {
        if (STEPS.some((step) => step.id === stepId)) {
          setCurrentStep(stepId);
        }
      },
      currentStep,
      currentStepIndex,
      steps: STEPS,
      stepCompletion,
      isDirty,
      draft,
      canGoBack: currentStepIndex > 0,
      canGoNext: currentStepIndex < STEPS.length - 1,
      isReviewStep: currentStep === "review",
    }),
    [currentStep, currentStepIndex, draft, handleBack, handleNext, handlePublish, handleSaveDraft, stepCompletion],
  );

  return (
    <>
      <div className="space-y-[24px]">
        <div className="space-y-[16px]">
          <div className="flex items-center justify-between gap-[16px]">
            <div className="min-w-0">
              <p className={`${FX_TYPOGRAPHY.metaLabel} uppercase tracking-[0.08em] text-primary`}>Workflow</p>
              <p className={`${FX_TYPOGRAPHY.small} text-muted-foreground`}>
                Basics → Description → Skills → Screening → Evaluation → Review
              </p>
            </div>
            <div className={`${FX_TYPOGRAPHY.fieldHint} text-muted-foreground`}>
              Step {currentStepIndex + 1} of {STEPS.length}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-[12px] gap-y-[4px] border-b border-border">
            {STEPS.map((step, index) => (
              <WorkflowStep
                key={step.id}
                index={index}
                label={step.label}
                isActive={currentStep === step.id}
                isComplete={stepCompletion[step.id]}
                onClick={() => setCurrentStep(step.id)}
              />
            ))}
          </div>
        </div>

        <div>{renderCurrentStep()}</div>
      </div>

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
});
