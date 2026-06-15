/* lib/FxJobSchema.js | Canonical job schema helpers | Sree | 2026-06-15 */

import {
  dedupeList,
  toListValue,
  toStringValue,
  validateNumericRange,
  validateRequired,
} from "@/lib/FxValidation";
/* - - - - - - - - - - - - - - - - */

export const JOB_FIELD_ALIASES = {
  client: ["client", "company"],
  screenedCount: ["screenedCount", "preScreenedCount"],
  sharedCount: ["sharedCount", "sentToClientCount"],
};
/* - - - - - - - - - - - - - - - - */

function parseJobLocation(location) {
  const normalizedLocation = toStringValue(location);

  if (!normalizedLocation || normalizedLocation.toLowerCase() === "remote") {
    return {
      workplaceType: "Remote",
      city: "",
      locality: "",
    };
  }

  const parts = normalizedLocation
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length >= 2) {
    return {
      workplaceType: "On-site",
      locality: parts[0],
      city: parts.slice(1).join(", "),
    };
  }

  return {
    workplaceType: "On-site",
    city: normalizedLocation,
    locality: "",
  };
}
/* - - - - - - - - - - - - - - - - */

function buildJobLocationLabel({ workplaceType, city, locality }) {
  if (String(workplaceType).toLowerCase() === "remote") {
    return "Remote";
  }

  const normalizedLocality = toStringValue(locality);
  const normalizedCity = toStringValue(city);

  if (normalizedLocality && normalizedCity) {
    return `${normalizedLocality}, ${normalizedCity}`;
  }

  return normalizedLocality || normalizedCity || "";
}
/* - - - - - - - - - - - - - - - - */

function formatCurrencyValue(value, currency = "INR") {
  const normalizedValue = Number(value);

  if (value == null || value === "" || Number.isNaN(normalizedValue)) {
    return "";
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: currency || "INR",
    maximumFractionDigits: 0,
  }).format(normalizedValue);
}
/* - - - - - - - - - - - - - - - - */

function buildSalaryRangeLabel(salaryMin, salaryMax, currency = "INR") {
  const minLabel = formatCurrencyValue(salaryMin, currency);
  const maxLabel = formatCurrencyValue(salaryMax, currency);

  if (minLabel && maxLabel) {
    return `${minLabel} - ${maxLabel}`;
  }

  return minLabel || maxLabel || "";
}
/* - - - - - - - - - - - - - - - - */

export const DEFAULT_JOB_SHEET_ROUNDS = [
  {
    id: "round-1",
    title: "Round 1",
    details: "Screening",
    note: "Short AI-assisted review of baseline fit.",
  },
  {
    id: "round-2",
    title: "Round 2",
    details: "Hiring manager",
    note: "Check role depth, communication, and ownership.",
  },
  {
    id: "round-3",
    title: "Round 3",
    details: "Final decision",
    note: "Confirm readiness for next step.",
  },
];
/* - - - - - - - - - - - - - - - - */

export const DEFAULT_JOB_QUESTION_SUGGESTIONS = [
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
/* - - - - - - - - - - - - - - - - */

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
    id: question.id ?? fallbackId,
    label: question.label ?? "Question",
    question: question.question ?? "",
    note: question.note ?? "",
  };
}
/* - - - - - - - - - - - - - - - - */

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
    id: round.id ?? fallbackId,
    title: round.title ?? "Round",
    details: round.details ?? "",
    note: round.note ?? "",
  };
}
/* - - - - - - - - - - - - - - - - */

export function toJobList(value) {
  return toListValue(value);
}
/* - - - - - - - - - - - - - - - - */

export function toJobTextList(value) {
  return dedupeList(toListValue(value));
}
/* - - - - - - - - - - - - - - - - */

export function normalizeJobRecord(job) {
  if (!job) {
    return null;
  }

  const data = job.data ?? {};
  const client = toStringValue(job.client ?? job.company ?? data.client);
  const screenedCount = Number(job.screenedCount ?? job.preScreenedCount) || 0;
  const sharedCount = Number(job.sharedCount ?? job.sentToClientCount) || 0;
  const parsedLocation = parseJobLocation(data.location ?? job.location);
  const workplaceType = toStringValue(data.workplaceType ?? job.workplaceType ?? parsedLocation.workplaceType) || "On-site";
  const city = toStringValue(data.city ?? job.city ?? parsedLocation.city);
  const locality = toStringValue(data.locality ?? job.locality ?? parsedLocation.locality);
  const salaryMin = data.salaryMin ?? job.salaryMin ?? "";
  const salaryMax = data.salaryMax ?? job.salaryMax ?? "";
  const currency = toStringValue(data.currency ?? job.currency ?? "INR") || "INR";
  const salaryRange = toStringValue(job.salaryRange ?? data.salaryRange) || buildSalaryRangeLabel(salaryMin, salaryMax, currency) || "—";
  const location = buildJobLocationLabel({ workplaceType, city, locality }) || toStringValue(job.location);
  const assignee = toStringValue(data.assignee ?? job.assignee ?? job.createdBy ?? "John Doe");

  return {
    ...job,
    title: toStringValue(job.title ?? data.jobTitle),
    client,
    company: client,
    positions: Number(job.positions) || 1,
    experience: toStringValue(job.experience ?? data.experience),
    employmentType: toStringValue(job.employmentType ?? data.employmentType ?? "Full-time"),
    workplaceType,
    city,
    locality,
    salaryMin,
    salaryMax,
    currency,
    assignee,
    salaryRange,
    location,
    unscreenedCount: Number(job.unscreenedCount) || 0,
    screenedCount,
    preScreenedCount: screenedCount,
    shortlistedCount: Number(job.shortlistedCount) || 0,
    sharedCount,
    sentToClientCount: sharedCount,
    status: job.status === "Published" ? "Published" : "Draft",
    createdBy: job.createdBy ?? "John Doe",
    updatedBy: job.updatedBy ?? "John Doe",
    data: {
      ...data,
      jobTitle: toStringValue(data.jobTitle ?? job.title),
      client,
      experience: toStringValue(data.experience ?? job.experience),
      employmentType: toStringValue(data.employmentType ?? job.employmentType ?? "Full-time"),
      workplaceType,
      city,
      locality,
      salaryMin,
      salaryMax,
      currency,
      assignee,
      location,
      domain: data.domain ?? job.domain ?? "Engineering",
      department: data.department ?? job.department ?? "Engineering",
      salaryRange: data.salaryRange ?? job.salaryRange ?? salaryRange,
      priority: data.priority ?? job.priority ?? "Medium",
      questionFormat: data.questionFormat ?? job.questionFormat ?? "CV + AI pre-screening",
      publishDate: data.publishDate ?? job.publishDate ?? null,
    },
  };
}
/* - - - - - - - - - - - - - - - - */

export const normalizeJob = normalizeJobRecord;
/* - - - - - - - - - - - - - - - - */

export function createEmptyJobForm() {
  return {
    title: "",
    experience: "",
    employmentType: "Full-time",
    workplaceType: "On-site",
    positions: "1",
    priority: "Medium",
    city: "",
    locality: "",
    salaryMin: "",
    salaryMax: "",
    currency: "INR",
    client: "",
    assignee: "John Doe",
    status: "Draft",
    aiPrompt: "",
    jobDescription: "",
    primarySkills: "",
    secondarySkills: "",
    responsibilities: "",
    evaluationContext: "",
    evaluationRounds: DEFAULT_JOB_SHEET_ROUNDS.map((round) => createRoundSeed(round, round.id)),
    questionFormat: "cv_and_prescreen",
    questions: DEFAULT_JOB_QUESTION_SUGGESTIONS.map((question) => createQuestionSeed(question, question.id)),
    benefitsSummary: "",
    preScreeningMode: "call_with_email_backup",
    callingBackup: "email",
    backupNotes: "",
  };
}
/* - - - - - - - - - - - - - - - - */

export function createJobFormFromJob(job) {
  if (!job) {
    return createEmptyJobForm();
  }

  const data = job.data ?? {};
  const normalizedRounds =
    Array.isArray(data.evaluationRounds) && data.evaluationRounds.length
      ? data.evaluationRounds.map((round, index) => createRoundSeed(round, round.id ?? `round-${index + 1}`))
      : DEFAULT_JOB_SHEET_ROUNDS.map((round) => createRoundSeed(round, round.id));
  const normalizedQuestions =
    Array.isArray(data.questions) && data.questions.length
      ? data.questions.map((question, index) => createQuestionSeed(question, question.id ?? `question-${index + 1}`))
      : DEFAULT_JOB_QUESTION_SUGGESTIONS.map((question) => createQuestionSeed(question, question.id));
  const client = toStringValue(job.client ?? job.company ?? data.client);
  const normalizedLocation = parseJobLocation(data.location ?? job.location);
  const workplaceType = toStringValue(data.workplaceType ?? job.workplaceType ?? normalizedLocation.workplaceType) || "On-site";
  const city = toStringValue(data.city ?? job.city ?? normalizedLocation.city);
  const locality = toStringValue(data.locality ?? job.locality ?? normalizedLocation.locality);

  return {
    ...createEmptyJobForm(),
    title: toStringValue(job.title ?? data.jobTitle),
    experience: toStringValue(job.experience ?? data.experience),
    employmentType: toStringValue(job.employmentType ?? data.employmentType ?? "Full-time"),
    workplaceType,
    positions: String(job.positions ?? 1),
    priority: toStringValue(data.priority ?? job.priority ?? "Medium") || "Medium",
    city,
    locality,
    salaryMin: data.salaryMin != null ? String(data.salaryMin) : String(job.salaryMin ?? ""),
    salaryMax: data.salaryMax != null ? String(data.salaryMax) : String(job.salaryMax ?? ""),
    currency: toStringValue(data.currency ?? job.currency ?? "INR") || "INR",
    client,
    assignee: toStringValue(data.assignee ?? job.assignee ?? job.createdBy ?? "John Doe"),
    status: job.status === "Published" ? "Published" : "Draft",
    aiPrompt: toStringValue(data.aiPrompt),
    jobDescription: toStringValue(data.jobDescription),
    primarySkills: toJobList(data.primarySkills).join(", "),
    secondarySkills: toJobList(data.secondarySkills).join(", "),
    responsibilities: toStringValue(data.responsibilities),
    evaluationContext: toStringValue(data.evaluationContext),
    evaluationRounds: normalizedRounds,
    questionFormat: data.questionFormat ?? "cv_and_prescreen",
    questions: normalizedQuestions,
    benefitsSummary: toJobList(data.benefits).join(", "),
    preScreeningMode: data.preScreeningMode ?? "call_with_email_backup",
    callingBackup: data.callingBackup ?? "email",
    backupNotes: toStringValue(data.backupNotes),
  };
}
/* - - - - - - - - - - - - - - - - */

export function serializeJobFormToRecord({ form, existingJob = null, includeClientInfo = true, updatedBy = "John Doe" }) {
  const existingData = existingJob?.data ?? {};
  const title = toStringValue(form.title);
  const workplaceType = toStringValue(form.workplaceType || existingJob?.workplaceType || existingData.workplaceType) || "On-site";
  const city = toStringValue(form.city ?? existingJob?.city ?? existingData.city);
  const locality = toStringValue(form.locality ?? existingJob?.locality ?? existingData.locality);
  const location = buildJobLocationLabel({ workplaceType, city, locality }) || toStringValue(existingJob?.location) || "";
  const salaryMin = form.salaryMin ?? existingJob?.salaryMin ?? existingData.salaryMin ?? "";
  const salaryMax = form.salaryMax ?? existingJob?.salaryMax ?? existingData.salaryMax ?? "";
  const currency = toStringValue(form.currency ?? existingJob?.currency ?? existingData.currency ?? "INR") || "INR";
  const salaryRange = buildSalaryRangeLabel(salaryMin, salaryMax, currency) || toStringValue(existingJob?.salaryRange) || "—";
  const client = includeClientInfo ? toStringValue(form.client ?? form.company) : toStringValue(existingJob?.client ?? existingJob?.company ?? existingData.client);
  const priority = toStringValue(form.priority ?? existingJob?.priority ?? existingData.priority ?? "Medium") || "Medium";

  const nextRecord = {
    ...existingJob,
    id: existingJob?.id ?? null,
    title,
    client,
    company: client,
    positions: Math.max(1, Number(form.positions) || Number(existingJob?.positions) || 1),
    experience: toStringValue(form.experience ?? existingJob?.experience ?? existingData.experience),
    employmentType: toStringValue(form.employmentType ?? existingJob?.employmentType ?? existingData.employmentType ?? "Full-time") || "Full-time",
    workplaceType,
    city,
    locality,
    priority,
    salaryMin,
    salaryMax,
    currency,
    assignee: toStringValue(form.assignee ?? existingJob?.assignee ?? existingData.assignee ?? updatedBy),
    location,
    salaryRange,
    status: form.status === "Published" ? "Published" : "Draft",
    isArchived: existingJob?.isArchived ?? false,
    unscreenedCount: Number(existingJob?.unscreenedCount ?? 0) || 0,
    screenedCount: Number(existingJob?.screenedCount ?? existingJob?.preScreenedCount ?? 0) || 0,
    preScreenedCount: Number(existingJob?.screenedCount ?? existingJob?.preScreenedCount ?? 0) || 0,
    shortlistedCount: Number(existingJob?.shortlistedCount ?? 0) || 0,
    sharedCount: Number(existingJob?.sharedCount ?? existingJob?.sentToClientCount ?? 0) || 0,
    sentToClientCount: Number(existingJob?.sharedCount ?? existingJob?.sentToClientCount ?? 0) || 0,
    createdBy: existingJob?.createdBy ?? updatedBy,
    updatedBy,
    data: {
      ...existingData,
      jobTitle: title,
      client,
      experience: toStringValue(form.experience ?? existingJob?.experience ?? existingData.experience),
      employmentType: toStringValue(form.employmentType ?? existingJob?.employmentType ?? existingData.employmentType ?? "Full-time") || "Full-time",
      workplaceType,
      city,
      locality,
      priority,
      salaryMin,
      salaryMax,
      currency,
      assignee: toStringValue(form.assignee ?? existingJob?.assignee ?? existingData.assignee ?? updatedBy),
      location,
      salaryRange,
      aiPrompt: toStringValue(form.aiPrompt),
      jobDescription: toStringValue(form.jobDescription),
      primarySkills: toJobTextList(form.primarySkills),
      secondarySkills: toJobTextList(form.secondarySkills),
      responsibilities: toStringValue(form.responsibilities),
      evaluationContext: toStringValue(form.evaluationContext),
      evaluationRounds: Array.isArray(form.evaluationRounds) && form.evaluationRounds.length ? form.evaluationRounds : DEFAULT_JOB_SHEET_ROUNDS,
      questionFormat: form.questionFormat || "cv_and_prescreen",
      questions: Array.isArray(form.questions) && form.questions.length ? form.questions : DEFAULT_JOB_QUESTION_SUGGESTIONS,
      benefits: toJobTextList(form.benefitsSummary),
      preScreeningMode: form.preScreeningMode || "call_with_email_backup",
      callingBackup: form.callingBackup || "email",
      backupNotes: toStringValue(form.backupNotes),
    },
  };

  return normalizeJobRecord(nextRecord);
}
/* - - - - - - - - - - - - - - - - */

export function validateJobForm(form, { includeClientInfo = true } = {}) {
  const errors = {};

  const titleError = validateRequired(form.title, "Job title");
  if (titleError) {
    errors.title = titleError;
  }

  const experienceError = validateRequired(form.experience, "Experience");
  if (experienceError) {
    errors.experience = experienceError;
  }

  const employmentTypeError = validateRequired(form.employmentType, "Employment type");
  if (employmentTypeError) {
    errors.employmentType = employmentTypeError;
  }

  const workplaceTypeError = validateRequired(form.workplaceType, "Workplace type");
  if (workplaceTypeError) {
    errors.workplaceType = workplaceTypeError;
  }

  if (includeClientInfo) {
    const clientError = validateRequired(form.client ?? form.company, "Client");
    if (clientError) {
      errors.client = clientError;
    }
  }

  const positionError = validateNumericRange(form.positions, { label: "Positions", min: 1 });
  if (positionError) {
    errors.positions = positionError;
  }

  if (String(form.workplaceType).toLowerCase() !== "remote") {
    const cityError = validateRequired(form.city, "City");
    if (cityError) {
      errors.city = cityError;
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}
/* - - - - - - - - - - - - - - - - */

export { buildJobLocationLabel, buildSalaryRangeLabel };
