/*
lib/demo-store.js | localStorage seed and retrieval helpers | Sree | 2026-06-10
*/

/* - - - - - - - - - - - - - - - - */

import { STORAGE_KEYS } from "@/lib/FxConstants";

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
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(key);

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function writeStoredCollection(key, value) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(value));
}

export async function ensureDemoStore() {
  const existing = {
    recruiters: readStoredCollection(STORAGE_KEYS.RECRUITERS),
    jobs: readStoredCollection(STORAGE_KEYS.JOBS),
    candidates: readStoredCollection(STORAGE_KEYS.CANDIDATES),
    clients: readStoredCollection(STORAGE_KEYS.CLIENTS),
  };

  if (existing.recruiters && existing.candidates && existing.clients) {
    return existing;
  }

  const seeds = await loadDemoSeeds();

  writeStoredCollection(STORAGE_KEYS.RECRUITERS, seeds.recruiters);
  writeStoredCollection(STORAGE_KEYS.CANDIDATES, seeds.candidates);
  writeStoredCollection(STORAGE_KEYS.CLIENTS, seeds.clients);

  return {
    recruiters: seeds.recruiters,
    jobs: existing.jobs || [],
    candidates: seeds.candidates,
    clients: seeds.clients,
  };
}

export function resetDemoStore() {
  if (typeof window === "undefined") {
    return;
  }

  Object.values(STORAGE_KEYS).forEach((key) => {
    window.localStorage.removeItem(key);
  });
}

/* - - - - - - - - - - - - - - - - */
