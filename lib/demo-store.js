/*
lib/demo-store.js | localStorage seed and retrieval helpers | Sree | 2026-06-10
*/

/* - - - - - - - - - - - - - - - - */

import { STORAGE_KEYS } from "@/lib/FxConstants";
import { readStoredJSON, writeStoredJSON, removeStoredValue } from "@/lib/FxUtils";

const DATA_FILES = {
  recruiters: "/data/recruiters.json",
  jobs: "/data/jobs.json",
  candidates: "/data/candidates.json",
  clients: "/data/clients.json",
};

async function loadJson(path) {
  const response = await fetch(path);

  if (!response.ok) {
    throw new Error(`Failed to load seed data from ${path}`);
  }

  return response.json();
}

export async function loadDemoSeeds() {
  const [recruiters, jobs, candidates, clients] = await Promise.all([
    loadJson(DATA_FILES.recruiters),
    loadJson(DATA_FILES.jobs),
    loadJson(DATA_FILES.candidates),
    loadJson(DATA_FILES.clients),
  ]);

  return { recruiters, jobs, candidates, clients };
}

export function readStoredCollection(key) {
  return readStoredJSON(key);
}

export function writeStoredCollection(key, value) {
  writeStoredJSON(key, value);
}

export async function ensureStoredCollection(key, path) {
  const existing = readStoredCollection(key);

  if (existing) {
    return existing;
  }

  const seedData = await loadJson(path);
  writeStoredCollection(key, seedData);
  return seedData;
}

export async function ensureJobsStore() {
  return ensureStoredCollection(STORAGE_KEYS.JOBS, DATA_FILES.jobs);
}

export async function ensureDemoStore() {
  const [recruiters, jobs, candidates, clients] = await Promise.all([
    ensureStoredCollection(STORAGE_KEYS.RECRUITERS, DATA_FILES.recruiters),
    ensureStoredCollection(STORAGE_KEYS.JOBS, DATA_FILES.jobs),
    ensureStoredCollection(STORAGE_KEYS.CANDIDATES, DATA_FILES.candidates),
    ensureStoredCollection(STORAGE_KEYS.CLIENTS, DATA_FILES.clients),
  ]);

  return { recruiters, jobs, candidates, clients };
}

export function resetDemoStore() {
  Object.values(STORAGE_KEYS).forEach((key) => {
    removeStoredValue(key);
  });
}

/* - - - - - - - - - - - - - - - - */
