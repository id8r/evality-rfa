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

export function resetDemoStore() {
  Object.values(STORAGE_KEYS).forEach((key) => {
    removeStoredValue(key);
  });
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

/* - - - - - - - - - - - - - - - - */
