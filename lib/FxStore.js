/*
lib/FxStore.js | Demo/local state foundation and seed data | Sree | 2026-06-13
*/

/* - - - - - - - - - - - - - - - - */

import { STORAGE_KEYS } from "@/lib/FxConstants";
import { readStoredJSON, removeStoredValue, writeStoredJSON } from "@/lib/FxUtils";

export const DEMO_FLAGS = {
  jobsDemoMode: false,
};

export const DEMO_RECRUITERS = [
  { id: "rec-1", name: "John Doe", email: "jdoe@evality.ai" },
  { id: "rec-2", name: "Ayush Singh", email: "ayush@evality.ai" },
];

export const DEMO_JOBS = [
  {
    id: "JOB35973",
    title: "Frontend Engineer",
    company: "ThinkJS",
    positions: 1,
    createdBy: "Ayush Singh",
    location: "HSR Layout, Bengaluru",
    experience: "3 - 5 yrs",
    unscreenedCount: 6,
    preScreenedCount: 2,
    shortlistedCount: 1,
    sentToClientCount: 0,
    status: "Draft",
    isArchived: false,
    createdAt: "2026-06-12T10:30:00Z",
    updatedAt: "2026-06-12T10:30:00Z",
    updatedBy: "Ayush Singh",
    data: { jobTitle: "Frontend Engineer" },
  },
  {
    id: "JOB66817",
    title: "Senior React Developer",
    company: "RHP Consulting",
    positions: 2,
    createdBy: "Ayush Singh",
    location: "HSR Bengaluru",
    experience: "5 - 8 yrs",
    unscreenedCount: 4,
    preScreenedCount: 3,
    shortlistedCount: 1,
    sentToClientCount: 1,
    status: "Published",
    isArchived: false,
    createdAt: "2026-06-11T09:15:00Z",
    updatedAt: "2026-06-11T09:15:00Z",
    updatedBy: "Ayush Singh",
    data: { jobTitle: "Senior React Developer" },
  },
  {
    id: "JOB74192",
    title: "Backend Engineer",
    company: "KiteStack",
    positions: 1,
    createdBy: "John Doe",
    location: "Koramangala, Bengaluru",
    experience: "4 - 7 yrs",
    unscreenedCount: 9,
    preScreenedCount: 4,
    shortlistedCount: 2,
    sentToClientCount: 1,
    status: "Published",
    isArchived: false,
    createdAt: "2026-06-10T11:05:00Z",
    updatedAt: "2026-06-13T08:20:00Z",
    updatedBy: "John Doe",
    data: { jobTitle: "Backend Engineer" },
  },
  {
    id: "JOB48261",
    title: "Product Designer",
    company: "Northstar Labs",
    positions: 1,
    createdBy: "Ayush Singh",
    location: "Remote",
    experience: "6 - 9 yrs",
    unscreenedCount: 3,
    preScreenedCount: 5,
    shortlistedCount: 2,
    sentToClientCount: 2,
    status: "Published",
    isArchived: false,
    createdAt: "2026-06-09T09:45:00Z",
    updatedAt: "2026-06-13T12:15:00Z",
    updatedBy: "Ayush Singh",
    data: { jobTitle: "Product Designer" },
  },
  {
    id: "JOB90514",
    title: "Data Analyst",
    company: "SignalDesk",
    positions: 2,
    createdBy: "John Doe",
    location: "Whitefield, Bengaluru",
    experience: "2 - 4 yrs",
    unscreenedCount: 12,
    preScreenedCount: 1,
    shortlistedCount: 0,
    sentToClientCount: 0,
    status: "Draft",
    isArchived: false,
    createdAt: "2026-06-09T13:30:00Z",
    updatedAt: "2026-06-12T14:40:00Z",
    updatedBy: "John Doe",
    data: { jobTitle: "Data Analyst" },
  },
  {
    id: "JOB11408",
    title: "Recruiting Coordinator",
    company: "ThinkJS",
    positions: 1,
    createdBy: "Ayush Singh",
    location: "HSR Layout, Bengaluru",
    experience: "1 - 3 yrs",
    unscreenedCount: 2,
    preScreenedCount: 6,
    shortlistedCount: 3,
    sentToClientCount: 2,
    status: "Published",
    isArchived: false,
    createdAt: "2026-06-08T07:20:00Z",
    updatedAt: "2026-06-13T09:10:00Z",
    updatedBy: "Ayush Singh",
    data: { jobTitle: "Recruiting Coordinator" },
  },
  {
    id: "JOB53067",
    title: "QA Automation Engineer",
    company: "RHP Consulting",
    positions: 1,
    createdBy: "John Doe",
    location: "Remote",
    experience: "3 - 6 yrs",
    unscreenedCount: 7,
    preScreenedCount: 2,
    shortlistedCount: 1,
    sentToClientCount: 0,
    status: "Published",
    isArchived: false,
    createdAt: "2026-06-07T10:00:00Z",
    updatedAt: "2026-06-11T16:25:00Z",
    updatedBy: "John Doe",
    data: { jobTitle: "QA Automation Engineer" },
  },
  {
    id: "JOB27841",
    title: "Growth Marketer",
    company: "Vortex Ventures",
    positions: 1,
    createdBy: "Ayush Singh",
    location: "Indiranagar, Bengaluru",
    experience: "4 - 8 yrs",
    unscreenedCount: 5,
    preScreenedCount: 3,
    shortlistedCount: 1,
    sentToClientCount: 1,
    status: "Published",
    isArchived: true,
    createdAt: "2026-06-06T08:45:00Z",
    updatedAt: "2026-06-10T13:05:00Z",
    updatedBy: "Ayush Singh",
    data: { jobTitle: "Growth Marketer" },
  },
  {
    id: "JOB66309",
    title: "DevOps Engineer",
    company: "Stellar SaaS",
    positions: 1,
    createdBy: "John Doe",
    location: "Remote",
    experience: "5 - 8 yrs",
    unscreenedCount: 11,
    preScreenedCount: 2,
    shortlistedCount: 1,
    sentToClientCount: 0,
    status: "Published",
    isArchived: false,
    createdAt: "2026-06-05T15:10:00Z",
    updatedAt: "2026-06-13T07:50:00Z",
    updatedBy: "John Doe",
    data: { jobTitle: "DevOps Engineer" },
  },
  {
    id: "JOB80123",
    title: "SRE Engineer",
    company: "CloudNine",
    positions: 1,
    createdBy: "Ayush Singh",
    location: "Remote",
    experience: "5 - 8 yrs",
    unscreenedCount: 4,
    preScreenedCount: 4,
    shortlistedCount: 1,
    sentToClientCount: 1,
    status: "Published",
    isArchived: false,
    createdAt: "2026-06-04T08:45:00Z",
    updatedAt: "2026-06-13T14:10:00Z",
    updatedBy: "Ayush Singh",
    data: { jobTitle: "SRE Engineer" },
  },
  {
    id: "JOB71234",
    title: "Technical Recruiter",
    company: "Northstar Labs",
    positions: 1,
    createdBy: "John Doe",
    location: "Bengaluru",
    experience: "3 - 5 yrs",
    unscreenedCount: 8,
    preScreenedCount: 2,
    shortlistedCount: 0,
    sentToClientCount: 0,
    status: "Draft",
    isArchived: false,
    createdAt: "2026-06-04T11:20:00Z",
    updatedAt: "2026-06-13T11:05:00Z",
    updatedBy: "John Doe",
    data: { jobTitle: "Technical Recruiter" },
  },
  {
    id: "JOB44028",
    title: "Customer Success Manager",
    company: "OrbitPay",
    positions: 1,
    createdBy: "Ayush Singh",
    location: "Remote",
    experience: "4 - 7 yrs",
    unscreenedCount: 6,
    preScreenedCount: 3,
    shortlistedCount: 1,
    sentToClientCount: 1,
    status: "Published",
    isArchived: false,
    createdAt: "2026-06-03T09:35:00Z",
    updatedAt: "2026-06-12T18:15:00Z",
    updatedBy: "Ayush Singh",
    data: { jobTitle: "Customer Success Manager" },
  },
  {
    id: "JOB15962",
    title: "Machine Learning Engineer",
    company: "SignalDesk",
    positions: 1,
    createdBy: "John Doe",
    location: "Whitefield, Bengaluru",
    experience: "4 - 8 yrs",
    unscreenedCount: 10,
    preScreenedCount: 4,
    shortlistedCount: 1,
    sentToClientCount: 0,
    status: "Published",
    isArchived: false,
    createdAt: "2026-06-03T14:10:00Z",
    updatedAt: "2026-06-11T09:25:00Z",
    updatedBy: "John Doe",
    data: { jobTitle: "Machine Learning Engineer" },
  },
  {
    id: "JOB55091",
    title: "Operations Manager",
    company: "Vortex Ventures",
    positions: 1,
    createdBy: "Ayush Singh",
    location: "Indiranagar, Bengaluru",
    experience: "5 - 9 yrs",
    unscreenedCount: 4,
    preScreenedCount: 2,
    shortlistedCount: 1,
    sentToClientCount: 1,
    status: "Draft",
    isArchived: false,
    createdAt: "2026-06-02T08:25:00Z",
    updatedAt: "2026-06-10T15:40:00Z",
    updatedBy: "Ayush Singh",
    data: { jobTitle: "Operations Manager" },
  },
];

export const DEMO_CANDIDATES = [
  { id: "cand-1", jobId: "JOB35973", name: "Aarav Mehta", status: "unscreened" },
  { id: "cand-2", jobId: "JOB66817", name: "Priya Nair", status: "shortlisted" },
];

export const DEMO_CLIENTS = [
  { id: "client-1", name: "ThinkJS" },
  { id: "client-2", name: "RHP Consulting" },
];

export function readStoredCollection(key) {
  return readStoredJSON(key);
}

export function writeStoredCollection(key, value) {
  writeStoredJSON(key, value);
}

export function ensureStoredCollection(key, fallbackValue) {
  const existing = readStoredCollection(key);

  if (existing) {
    return existing;
  }

  writeStoredCollection(key, fallbackValue);
  return fallbackValue;
}

export function ensureDemoStore() {
  return {
    recruiters: ensureStoredCollection(STORAGE_KEYS.RECRUITERS, DEMO_RECRUITERS),
    jobs: ensureStoredCollection(STORAGE_KEYS.JOBS, DEMO_JOBS),
    candidates: ensureStoredCollection(STORAGE_KEYS.CANDIDATES, DEMO_CANDIDATES),
    clients: ensureStoredCollection(STORAGE_KEYS.CLIENTS, DEMO_CLIENTS),
  };
}

const DEMO_DATA_KEYS = [
  STORAGE_KEYS.RECRUITERS,
  STORAGE_KEYS.JOBS,
  STORAGE_KEYS.CANDIDATES,
  STORAGE_KEYS.CLIENTS,
  STORAGE_KEYS.JOBS_VIEW_MODE,
  STORAGE_KEYS.JOBS_PAGE_STATE,
];

export function ensureJobsStore() {
  return ensureStoredCollection(STORAGE_KEYS.JOBS, DEMO_JOBS);
}

export function readStoredJobs() {
  return readStoredCollection(STORAGE_KEYS.JOBS);
}

export function writeStoredJobs(jobs) {
  writeStoredCollection(STORAGE_KEYS.JOBS, jobs);
}

export function createJobId() {
  return `JOB${Math.floor(10000 + Math.random() * 90000)}`;
}

export function findStoredJob(jobId) {
  return ensureJobsStore().find((job) => job.id === jobId) ?? null;
}

export function upsertStoredJob(jobInput) {
  const jobs = ensureJobsStore();
  const existingJob = jobs.find((job) => job.id === jobInput.id);
  const now = new Date().toISOString();
  const nextJob = {
    ...existingJob,
    ...jobInput,
    id: jobInput.id ?? existingJob?.id ?? createJobId(),
    createdAt: existingJob?.createdAt ?? jobInput.createdAt ?? now,
    updatedAt: now,
  };

  const nextJobs = existingJob
    ? jobs.map((job) => (job.id === nextJob.id ? nextJob : job))
    : [nextJob, ...jobs];

  writeStoredJobs(nextJobs);
  return nextJob;
}

export function readStoredJobsPageState() {
  if (typeof window === "undefined") {
    return null;
  }

  return readStoredJSON(STORAGE_KEYS.JOBS_PAGE_STATE);
}

export function writeStoredJobsPageState(pageState) {
  if (typeof window === "undefined") {
    return;
  }

  writeStoredJSON(STORAGE_KEYS.JOBS_PAGE_STATE, pageState);
}

export function readStoredCandidates() {
  return readStoredCollection(STORAGE_KEYS.CANDIDATES) ?? [];
}

export function findStoredCandidatesByJob(jobId) {
  return readStoredCandidates().filter((candidate) => candidate.jobId === jobId);
}

export function readStoredJobsViewMode() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem(STORAGE_KEYS.JOBS_VIEW_MODE);
}

export function writeStoredJobsViewMode(viewMode) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEYS.JOBS_VIEW_MODE, viewMode);
}

export function resetDemoStore() {
  DEMO_DATA_KEYS.forEach((key) => {
    removeStoredValue(key);
  });

  ensureDemoStore();
}

export function readStoredPersona() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem(STORAGE_KEYS.PERSONA);
}

export function writeStoredPersona(persona) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEYS.PERSONA, persona);
}

export function hasStoredPersona() {
  return Boolean(readStoredPersona());
}

export function readStoredOnboardingContext() {
  if (typeof window === "undefined") {
    return null;
  }

  return readStoredJSON(STORAGE_KEYS.ONBOARDING_CONTEXT);
}

export function writeStoredOnboardingContext(context) {
  if (typeof window === "undefined") {
    return;
  }

  writeStoredJSON(STORAGE_KEYS.ONBOARDING_CONTEXT, context);
}

export function readStoredWorkspaceType() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem(STORAGE_KEYS.WORKSPACE_TYPE);
}

export function writeStoredWorkspaceType(workspaceType) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEYS.WORKSPACE_TYPE, workspaceType);
}

export function markOnboardingComplete() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETE, "true");
}

export function clearAuthAndOnboardingState() {
  if (typeof window === "undefined") {
    return;
  }

  [
    STORAGE_KEYS.AUTH_COMPLETE,
    STORAGE_KEYS.PERSONA,
    STORAGE_KEYS.ONBOARDING_CONTEXT,
    STORAGE_KEYS.ONBOARDING_COMPLETE,
    STORAGE_KEYS.JOBS_VIEW_MODE,
    STORAGE_KEYS.JOBS_PAGE_STATE,
  ].forEach(
    (key) => {
      window.localStorage.removeItem(key);
    },
  );

  window.localStorage.removeItem(STORAGE_KEYS.WORKSPACE_TYPE);
}

/* - - - - - - - - - - - - - - - - */
