/* lib/FxConstants.js | Shared app constants and layout tokens | Sree | 2026-06-10 */

export const APP_NAME = "Evality AI";
export const APP_TAGLINE =
  "Create a job, start collecting candidates, and move faster without ATS overhead.";
export const APP_TITLE = APP_NAME;
export const APP_DESCRIPTION =
  "Evality AI is a recruiter-first prototype focused on fast entry and fast job creation.";
export const APP_DOMAIN = "evality.ai";
export const APP_SHORT_NAME = "Evality";

export const ROUTES = {
  LANDING: "/",
  LOGIN: "/login",
  SIGNUP: "/signup",

  APP: "/app",
  CREATE_JOB: "/app/create-job",
  JOBS: "/app/jobs",
  CANDIDATES: "/app/candidates",
  CLIENTS: "/app/clients",
  ACTION_CENTER: "/app/action-center",
};

/* Previous Create Job nav used ROUTES.CREATE_JOB. Keeping /app/create-job as direct compatibility route. */
export const NAV_ITEMS = [
  { id: "action-center", label: "Action Center", href: ROUTES.ACTION_CENTER, icon: "inbox" },

  { id: "create-job", label: "Create Job", href: ROUTES.CREATE_JOB, icon: "briefcase" },
  { id: "jobs", label: "Jobs", href: ROUTES.JOBS, icon: "fileText" },
  { id: "candidates", label: "Candidates", href: ROUTES.CANDIDATES, icon: "users" },
  { id: "clients", label: "Clients", href: ROUTES.CLIENTS, icon: "folderOpen" },
];


export const DEMO_USER = {
  name: "John Doe",
  email: "jdoe@evality.ai",
};

export const LABELS = {
  GET_STARTED: "Get Started",
  LOGIN: "Log in",
  CONTINUE: "Continue",
  CONTINUE_WITH_GOOGLE: "Continue with Google",
  CONTINUE_WITH_LINKEDIN: "Continue with LinkedIn",
  CONTINUE_WITH_EMAIL: "Continue with Email",
  EMAIL: "Email",
  CLOSE: "Close",
};

export const AUTH_COPY = {
  TITLE: "Log in or sign up",
  DESCRIPTION: "Create jobs, collect candidates, and start hiring faster—without the ATS overhead.",
};

export const WELCOME_COPY = {
  TITLE: "Welcome to Evality",
  DESCRIPTION: "What best describes your hiring?",
  OPTION_1: "I'm Hiring for My Company",
  OPTION_2: "I'm Hiring for Clients",
};

export const AUTH_OPTIONS = [
  { id: "google", label: LABELS.CONTINUE_WITH_GOOGLE },
  { id: "linkedin", label: LABELS.CONTINUE_WITH_LINKEDIN },
];

export const LANDING_HEADLINE = "From hiring need to hiring action.";

export const MAX_CONTENT_WIDTH = 1440;
export const CONTENT_WIDTH_NARROW = 800;
export const CONTENT_WIDTH_MEDIUM = 1200;
export const CONTENT_WIDTH_WIDE = 1440;
export const LANDING_CONTENT_WIDTH = 640;
export const AUTH_DIALOG_WIDTH = 416;

export const PAGE_PADDING_X = 32;
export const PAGE_PADDING_Y = 24;

export const SIDEBAR_EXPANDED_WIDTH = 260;
export const SIDEBAR_COLLAPSED_WIDTH = 72;
export const ACCOUNT_MENU_WIDTH = 240;
export const NAVBAR_HEIGHT = 64;

export const MAX_CONTENT_WIDTH_CLASS = "max-w-[1440px]";
export const CONTENT_WIDTH_NARROW_CLASS = "max-w-[800px]";
export const CONTENT_WIDTH_MEDIUM_CLASS = "max-w-[1200px]";
export const CONTENT_WIDTH_WIDE_CLASS = "max-w-[1440px]";
export const LANDING_CONTENT_WIDTH_CLASS = "max-w-[640px]";
export const AUTH_DIALOG_WIDTH_CLASS = "max-w-[416px]";

export const PAGE_PADDING_X_CLASS = "px-[32px]";
export const PAGE_PADDING_Y_CLASS = "py-[24px]";

export const SIDEBAR_EXPANDED_WIDTH_CLASS = "w-[260px]";
export const SIDEBAR_COLLAPSED_WIDTH_CLASS = "w-[72px]";
export const ACCOUNT_MENU_WIDTH_CLASS = "w-[240px]";
export const SIDEBAR_EXPANDED_OFFSET_CLASS = "pl-[260px]";
export const SIDEBAR_COLLAPSED_OFFSET_CLASS = "pl-[72px]";
export const NAVBAR_HEIGHT_CLASS = "h-[64px]";

export const LAYOUT = {
  SITE_CONTAINER: `mx-auto w-full ${MAX_CONTENT_WIDTH_CLASS} ${PAGE_PADDING_X_CLASS}`,
  PAGE_FRAME: `mx-auto flex min-h-screen w-full ${MAX_CONTENT_WIDTH_CLASS} flex-col ${PAGE_PADDING_X_CLASS}`,
  HEADER_ROW: `flex items-center justify-between ${NAVBAR_HEIGHT_CLASS}`,
  HEADER_SHELL: "fixed top-0 left-0 z-40 w-full",
  LANDING_MAIN: "flex min-h-screen items-center pt-[96px]",
  AUTH_PAGE_MAIN: "flex min-h-screen items-center justify-center pt-[64px]",
  APP_CONTENT: `w-full ${PAGE_PADDING_X_CLASS} ${PAGE_PADDING_Y_CLASS}`,
};

export const STORAGE_KEYS = {
  AUTH_COMPLETE: "evality-auth-complete",
  SIDEBAR_COLLAPSED: "evality-sidebar-collapsed",
  THEME: "evality-theme",
  RECRUITERS: "evality-recruiters",
  JOBS: "evality-jobs",
  CANDIDATES: "evality-candidates",
  CLIENTS: "evality-clients",
  HIRING_PREFERENCE: "evality-hiring-preference",
};

export const THEMES = {
  LIGHT: "light",
  DARK: "dark",
};

/* - - - - - - - - - - - - - - - - */
