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

export function getCurrencyFormattingLocale(currency = "INR") {
  if (currency === "USD") {
    return "en-US";
  }

  if (currency === "EUR") {
    return "de-DE";
  }

  return "en-IN";
}
/* - - - - - - - - - - - - - - - - */

export function formatCurrencyValue(value, currency = "INR") {
  const normalizedValue = Number(value);

  if (value == null || value === "" || Number.isNaN(normalizedValue)) {
    return "";
  }

  return new Intl.NumberFormat(getCurrencyFormattingLocale(currency), {
    style: "currency",
    currency: currency || "INR",
    maximumFractionDigits: 0,
  }).format(normalizedValue);
}
/* - - - - - - - - - - - - - - - - */

export function formatCurrencyInputValue(value, currency = "INR") {
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
/* - - - - - - - - - - - - - - - - */

export function parseCurrencyInputValue(value) {
  return String(value ?? "").replace(/[^\d]/g, "");
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

function normalizeQuestionFormat(value) {
  const normalized = toStringValue(value).trim().toLowerCase();

  if (normalized === "prescreen_only") {
    return "prescreen_only";
  }

  if (
    normalized === "cv_and_prescreen" ||
    normalized === "cv + ai pre-screening" ||
    normalized === "cv + pre-screening" ||
    normalized === "cv + prescreening"
  ) {
    return "cv_and_prescreen";
  }

  return "cv_and_prescreen";
}

function normalizePreScreeningMode(value) {
  const normalized = toStringValue(value).trim().toLowerCase();

  if (normalized === "form" || normalized === "automated_email" || normalized === "email") {
    return "form";
  }

  return "manual";
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
    question: "We must fill this role immediately, How soon can you join us?",
    note: "Capture near-term readiness quickly.",
  },
  {
    id: "notice-period",
    label: "Notice Period",
    question: "What is your current notice period?",
    note: "Useful for prioritizing candidates in motion.",
  },
  {
    id: "current-salary",
    label: "Current Salary",
    question: "What is your Current Annual Salary in INR?",
    note: "Use only when compensation alignment matters.",
  },
  {
    id: "salary-expectation",
    label: "Salary Expectation",
    question: "What are your Salary Expectations?",
    note: "Keep this focused on the target range for the role.",
  },
  {
    id: "job-location",
    label: "Job Location",
    question: "The Job Role is on-site based out of the selected location. Are you comfortable commuting to the location?",
    note: "Useful when commute or work setup fit matters.",
  },
  {
    id: "current-company",
    label: "Current Company",
    question: "What is the name of the Current Company you are working with?",
    note: "Helpful when the current employer context matters.",
  },
];
/* - - - - - - - - - - - - - - - - */

export const DEFAULT_COMPANY_BRIEF =
  "ThinkJS is a technology services company specializing in JavaScript-based product development and technology staffing. We partner with startups and growing businesses to design, build, and scale web and mobile applications while providing experienced engineering talent across frontend and full-stack technologies. Our teams help clients move quickly from idea validation to product launch and continue supporting products through ongoing enhancement and maintenance.";
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

function parseExperienceBand(experience) {
  const matches = String(experience ?? "")
    .match(/\d+/g)
    ?.map(Number)
    .filter((value) => Number.isFinite(value)) ?? [];

  return {
    experienceFrom: matches[0] != null ? String(matches[0]) : "",
    experienceTo: matches[1] != null ? String(matches[1]) : "",
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
    evaluationContext: toStringValue(data.evaluationContext ?? job.evaluationContext),
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
      evaluationContext: toStringValue(data.evaluationContext ?? job.evaluationContext),
      questionFormat: normalizeQuestionFormat(data.questionFormat ?? job.questionFormat),
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
    experienceFrom: "",
    experienceTo: "",
    hideCompensationFromCandidates: true,
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
    additionalInformation: "",
    benefitsSummary: "",
    companyBrief: DEFAULT_COMPANY_BRIEF,
    benefitSelections: [],
    preScreeningMode: "manual",
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
  const experienceBand = parseExperienceBand(data.experience ?? job.experience);

  return {
    ...createEmptyJobForm(),
    title: toStringValue(job.title ?? data.jobTitle),
    experience: toStringValue(job.experience ?? data.experience),
    experienceFrom: toStringValue(data.experienceFrom ?? job.experienceFrom ?? experienceBand.experienceFrom),
    experienceTo: toStringValue(data.experienceTo ?? job.experienceTo ?? experienceBand.experienceTo),
    employmentType: toStringValue(job.employmentType ?? data.employmentType ?? "Full-time"),
    workplaceType,
    positions: String(job.positions ?? 1),
    priority: toStringValue(data.priority ?? job.priority ?? "Medium") || "Medium",
    city,
    locality,
    salaryMin: data.salaryMin != null ? String(data.salaryMin) : String(job.salaryMin ?? ""),
    salaryMax: data.salaryMax != null ? String(data.salaryMax) : String(job.salaryMax ?? ""),
    currency: toStringValue(data.currency ?? job.currency ?? "INR") || "INR",
    hideCompensationFromCandidates: Boolean(data.hideCompensationFromCandidates ?? job.hideCompensationFromCandidates ?? false),
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
    questionFormat: normalizeQuestionFormat(data.questionFormat ?? job.questionFormat),
    questions: normalizedQuestions,
    additionalInformation: toStringValue(data.additionalInformation),
    benefitsSummary: toJobList(data.benefits).join(", "),
    companyBrief: toStringValue(data.companyBrief ?? job.companyBrief ?? data.benefitsSummary),
    benefitSelections: toJobList(data.benefits),
    preScreeningMode: normalizePreScreeningMode(data.preScreeningMode ?? "manual"),
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
  const experienceFrom = toStringValue(form.experienceFrom ?? existingJob?.experienceFrom ?? existingData.experienceFrom);
  const experienceTo = toStringValue(form.experienceTo ?? existingJob?.experienceTo ?? existingData.experienceTo);
  const experience = [experienceFrom, experienceTo].filter(Boolean).join(" - ");
  const hideCompensationFromCandidates = Boolean(
    form.hideCompensationFromCandidates ??
      existingJob?.hideCompensationFromCandidates ??
      existingData.hideCompensationFromCandidates ??
      false,
  );

  const nextRecord = {
    ...existingJob,
    id: existingJob?.id ?? null,
    title,
    client,
    company: client,
    positions: Math.max(1, Number(form.positions) || Number(existingJob?.positions) || 1),
    experience: experience || toStringValue(form.experience ?? existingJob?.experience ?? existingData.experience),
    experienceFrom,
    experienceTo,
    employmentType: toStringValue(form.employmentType ?? existingJob?.employmentType ?? existingData.employmentType ?? "Full-time") || "Full-time",
    workplaceType,
    city,
    locality,
    priority,
    salaryMin,
    salaryMax,
    currency,
    hideCompensationFromCandidates,
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
      experience: experience || toStringValue(form.experience ?? existingJob?.experience ?? existingData.experience),
      experienceFrom,
      experienceTo,
      employmentType: toStringValue(form.employmentType ?? existingJob?.employmentType ?? existingData.employmentType ?? "Full-time") || "Full-time",
      workplaceType,
      city,
      locality,
      priority,
      salaryMin,
      salaryMax,
      currency,
      hideCompensationFromCandidates,
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
      questionFormat: normalizeQuestionFormat(form.questionFormat || existingData.questionFormat || existingJob?.questionFormat),
      questions: Array.isArray(form.questions) && form.questions.length ? form.questions : DEFAULT_JOB_QUESTION_SUGGESTIONS,
      additionalInformation: toStringValue(form.additionalInformation),
      benefits: toJobTextList(form.benefitSelections ?? form.benefitsSummary),
      benefitsSummary: toStringValue(form.companyBrief ?? form.benefitsSummary),
      companyBrief: toStringValue(form.companyBrief ?? form.benefitsSummary),
      preScreeningMode: normalizePreScreeningMode(form.preScreeningMode || existingData.preScreeningMode || existingJob?.preScreeningMode || "manual"),
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

  const experienceFromError = validateRequired(form.experienceFrom) || validateNumericRange(form.experienceFrom, { label: "Experience from", min: 0 });
  if (experienceFromError) {
    errors.experienceFrom = experienceFromError === "This field is required." ? "Required" : experienceFromError;
  }

  const experienceToError = validateNumericRange(form.experienceTo, { label: "Experience to", min: 0 });
  if (experienceToError) {
    errors.experienceTo = experienceToError;
  }

  if (!experienceFromError && !experienceToError && form.experienceFrom !== "" && form.experienceTo !== "") {
    const fromValue = Number(form.experienceFrom);
    const toValue = Number(form.experienceTo);

    if (!Number.isNaN(fromValue) && !Number.isNaN(toValue) && fromValue > toValue) {
      errors.experienceTo = "Check range";
    }
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
