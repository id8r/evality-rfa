/* lib/FxConstants.js | App constants and navigation tokens | Sree | 2026-06-13 */

import { CircleHelp, FileText, FolderOpen, Inbox, Settings2, Users } from "lucide-react";

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
  CANDIDATE: (candidateId) => `/app/candidates/${candidateId}`,
  CANDIDATE_PATTERN: "/app/candidates/[candidateId]",
  CLIENTS: "/app/clients",
  ACTION_CENTER: "/app/action-center",
  SETTINGS: "/app/settings",
  DESIGN_SYSTEM: "/app/ds",
};

export const PAGE_MANIFEST = {
  actionCenter: {
    id: "actionCenter",
    route: ROUTES.ACTION_CENTER,
    navLabel: "Action Center",
    pageTitle: "Action Center",
    description: "Your daily recruiting priorities will live here.",
    icon: Inbox,
    permissions: [],
    showInSidebar: true,
    sortOrder: 1,
  },
  jobs: {
    id: "jobs",
    route: ROUTES.JOBS,
    navLabel: "Jobs",
    pageTitle: "Jobs",
    description: "A compact workspace for reviewing and managing roles.",
    icon: FileText,
    permissions: [],
    showInSidebar: true,
    sortOrder: 2,
  },
  jobWorkspace: {
    id: "jobWorkspace",
    route: ROUTES.JOB_PATTERN,
    navLabel: "Job Workspace",
    pageTitle: "Job Workspace",
    description: "Selected job summary and candidate pipeline.",
    icon: FileText,
    permissions: [],
    showInSidebar: false,
    sortOrder: 99,
  },
  candidates: {
    id: "candidates",
    route: ROUTES.CANDIDATES,
    navLabel: "Candidates",
    pageTitle: "Candidates",
    description: "Candidate records and follow-ups will live here.",
    icon: Users,
    permissions: [],
    showInSidebar: true,
    sortOrder: 3,
  },
  clients: {
    id: "clients",
    route: ROUTES.CLIENTS,
    navLabel: "Clients",
    pageTitle: "Clients",
    description: "Client records and client-side hiring work will live here.",
    icon: FolderOpen,
    permissions: [],
    showInSidebar: true,
    sortOrder: 4,
  },
  settings: {
    id: "settings",
    route: ROUTES.SETTINGS,
    navLabel: "Settings",
    pageTitle: "Settings",
    description: "Workspace preferences and account-level defaults will live here.",
    icon: Settings2,
    permissions: [],
    showInSidebar: false,
    sortOrder: 97,
  },
  designSystem: {
    id: "designSystem",
    route: ROUTES.DESIGN_SYSTEM,
    navLabel: "Design System",
    pageTitle: "Design System",
    description: "Living implementation contract for Evality UI tokens and components.",
    icon: CircleHelp,
    permissions: ["internal"],
    showInSidebar: false,
    sortOrder: 98,
  },
};

export function getPageMeta(pageId) {
  return PAGE_MANIFEST[pageId] ?? null;
}

export function getPageMetaByRoute(route) {
  return Object.values(PAGE_MANIFEST).find((page) => page.route === route) ?? null;
}

export function getSidebarNavItems() {
  return Object.values(PAGE_MANIFEST)
    .filter((page) => page.showInSidebar)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((page) => ({
      id: page.id,
      label: page.navLabel,
      href: page.route,
      icon: page.icon,
    }));
}

export const DEMO_USER = {
  name: "John Doe",
  email: "jdoe@evality.ai",
};

export const STORAGE_KEYS = {
  AUTH_COMPLETE: "evality-auth-complete",
  PERSONA: "evality-persona",
  ONBOARDING_COMPLETE: "evality-onboarding-complete",
  ONBOARDING_CONTEXT: "evality-onboarding-context",
  DEMO_EXPERIENCE: "evality-demo-experience",
  WORKSPACE_TYPE: "evality-workspace-type",
  JOBS_VIEW_MODE: "evality-jobs-view-mode",
  JOBS_PAGE_STATE: "evality-jobs-page-state",
  JOBS_TABLE_COLUMNS: "evality-jobs-table-columns",
  JOB_WORKSPACE_COLUMNS: "evality-job-workspace-columns",
  SIDEBAR_COLLAPSED: "evality-sidebar-collapsed",
  THEME: "evality-theme",
  EMAIL_PROVIDER_CONNECTIONS: "evality-email-provider-connections",
  EMAIL_SENDER_ACCOUNT: "evality-email-sender-account",
  EMAIL_COMMUNICATION_PREFERENCES: "evality-email-communication-preferences",
  CALENDAR_PROVIDER_CONNECTIONS: "evality-calendar-provider-connections",
  CALENDAR_DEFAULT_ACCOUNT: "evality-calendar-default-account",
  CALENDAR_PREFERENCES: "evality-calendar-preferences",
  RECRUITERS: "evality-recruiters",
  JOBS: "evality_jobs",
  CANDIDATES: "evality-candidates",
  CLIENTS: "evality-clients",
};

export const DEMO_EXPERIENCE_MODES = {
  GET_STARTED: "get-started",
  LOGIN: "login",
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

export const WORKSPACE_TYPES = {
  MY_COMPANY: "my_company",
  CLIENTS: "clients",
  BOTH: "both",
};

export const SCREENING_METHOD_OPTIONS = [
  { value: "manual", title: "Manual", description: "Review candidates yourself." },
  { value: "form", title: "Form Based", description: "Candidates answer a questionnaire." },
  { value: "web_call", title: "Web Call (AI)", description: "Our AI screens candidates via web call." },
  { value: "phone", title: "AI Phone Call", description: "Run AI-led phone screening." },
];

export const SIDEBAR_DIMENSIONS = {
  EXPANDED: 200,
  COLLAPSED: 72,
};
/* - - - - - - - - - - - - - - - - */
