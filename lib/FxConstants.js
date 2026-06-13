/* lib/FxConstants.js | App constants and navigation tokens | Sree | 2026-06-13 */

export const APP_NAME = "Evality AI";
export const APP_TITLE = APP_NAME;
export const APP_DESCRIPTION = "Evality AI is a recruiter-first workspace prototype.";
export const APP_DOMAIN = "evality.ai";
export const APP_SHORT_NAME = "Evality";

export const ROUTES = {
  LANDING: "/",
  LOGIN: "/login",
  SIGNUP: "/signup",
  WELCOME: "/welcome",

  APP: "/app",
  JOBS: "/app/jobs",
  JOB: (jobId) => `/app/jobs/${jobId}`,
  JOB_PATTERN: "/app/jobs/[jobId]",
  CANDIDATES: "/app/candidates",
  CLIENTS: "/app/clients",
  ACTION_CENTER: "/app/action-center",
};

export const NAV_ITEMS = [
  { id: "action-center", label: "Action Center", href: ROUTES.ACTION_CENTER, icon: "inbox" },
  { id: "jobs", label: "Jobs", href: ROUTES.JOBS, icon: "fileText" },
  { id: "candidates", label: "Candidates", href: ROUTES.CANDIDATES, icon: "users" },
  { id: "clients", label: "Clients", href: ROUTES.CLIENTS, icon: "folderOpen" },
];

export const DEMO_USER = {
  name: "John Doe",
  email: "jdoe@evality.ai",
};

export const STORAGE_KEYS = {
  AUTH_COMPLETE: "evality-auth-complete",
  PERSONA: "evality-persona",
  ONBOARDING_CONTEXT: "evality-onboarding-context",
  SIDEBAR_COLLAPSED: "evality-sidebar-collapsed",
  THEME: "evality-theme",
  RECRUITERS: "evality-recruiters",
  JOBS: "evality_jobs",
  CANDIDATES: "evality-candidates",
  CLIENTS: "evality-clients",
};

export const THEMES = {
  LIGHT: "light",
  DARK: "dark",
};

export const PERSONAS = {
  INDEPENDENT_RECRUITER: "independent-recruiter",
  RECRUITING_AGENCY: "recruiting-agency",
  INTERNAL_TALENT_TEAM: "internal-talent-team",
};
/* - - - - - - - - - - - - - - - - */
