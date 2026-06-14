/* lib/FxCopy.js | UI copy and placeholder text | Sree | 2026-06-13 */

export const LANDING_COPY = {
  navLinks: [
    { id: "workflow", label: "How It Works" },
    { id: "product", label: "Product" },
    { id: "audience", label: "Who It's For" },
    { id: "pricing", label: "Pricing" },
  ],
  hero: {
    eyebrow: "Recruiter workspace",
    headline: "Hiring is hard.\nManaging hiring shouldn't be.",
    tagline: "Create jobs, track candidates, screen talent, and keep recruiting moving from one workspace.",
    trust: "Built for independent recruiters, agencies, and internal talent teams.",
    cta: "Get Started",
    login: "Log in",
  },
  problem: {
    eyebrow: "The challenge",
    title: "Recruiting happens everywhere.",
    body: "The work is everywhere. The workflow is not.",
    chips: ["LinkedIn", "Email", "Calls", "Spreadsheets", "ATS Tools"],
  },
  workflow: {
    eyebrow: "The North Star Architecture",
    title: "The Evality product model",
    body: "A single workspace built around the sequence recruiters already use.",
    steps: [
      { id: "need", label: "Need" },
      { id: "create-job", label: "Create Job" },
      { id: "candidates", label: "Add Candidates" },
      { id: "screen", label: "Screen" },
      { id: "shortlist", label: "Shortlist" },
      { id: "share", label: "Share" },
      { id: "hire", label: "Hire", featured: true },
    ],
  },
  product: {
    eyebrow: "Interactive Engine",
    title: "See inside the workspace",
    tabs: {
      jobs: "Jobs",
      candidates: "Candidates",
      workspace: "Workspace",
      actionCenter: "Action Center",
    },
    breadcrumbPrefix: "workspace /",
    jobs: {
      title: "Active recruiting funnels",
      cta: "Create Job Spec →",
      rows: [
        {
          title: "Senior Frontend Engineer",
          count: "42 total",
          detail: "(12 new)",
          status: "Technical Screen",
          share: "4 profiles sent",
        },
        {
          title: "Product Manager",
          count: "18 total",
          detail: "(2 new)",
          status: "Shortlisted",
          share: "2 client approved",
        },
        {
          title: "Director of Growth",
          count: "29 total",
          detail: "(0 new)",
          status: "Final Interview",
          share: "0 pending",
        },
      ],
      sidebarTitle: "Action Center",
      sidebarBadge: "Live",
      sidebarItems: [
        {
          label: "Client feedback",
          meta: "48h delay",
          body: "Acme Labs has 3 profiles waiting on review.",
          accent: "amber",
        },
        {
          label: "Candidate update",
          meta: "Just now",
          body: "Sarah Jenkins submitted updated availability.",
          accent: "blue",
        },
      ],
      footer: "All activity syncs back to the workspace in real time.",
    },
    candidates: {
      title: "Candidate Hub Workspace",
      rows: [
        { name: "Sarah Jenkins", meta: "6 yrs experience · Ex-Stripe", action: "Review matching profile" },
        { name: "David Vance", meta: "4 yrs experience · Ex-Linear", action: "Screen scheduled" },
      ],
    },
    workspace: {
      title: "Active client allocation pools",
      cards: [
        { name: "Acme Labs Inc.", body: "3 roles open · 12 candidates" },
        { name: "Stellar SaaS", body: "1 role open · 5 candidates" },
        { name: "Vortex Ventures", body: "2 roles open · 8 candidates" },
      ],
    },
    actionCenter: {
      title: "Attention stack",
      items: [
        { body: "3 client feedback questionnaires are still unreviewed.", action: "Resolve", tone: "amber" },
        { body: "Sarah Jenkins updated her interview availability.", action: "View", tone: "blue" },
      ],
    },
  },
  ai: {
    eyebrow: "AI Where It Helps",
    title: "No hype. Just practical utility.",
    cards: [
      {
        title: "Generate jobs from prompts",
        body: "Turn a short hiring request into a structured role starter when the input is incomplete.",
      },
      {
        title: "Extract skills automatically",
        body: "Normalize experience signals from uploaded JDs and incoming candidate data.",
      },
      {
        title: "Generate screening questions",
        body: "Populate focused vetting questions matched to the role without manual setup.",
      },
      {
        title: "Recommend candidates",
        body: "Highlight pipeline fits already inside your database using the job context.",
      },
    ],
  },
  audience: {
    eyebrow: "Target Focus",
    title: "Built around real recruiting work",
    cards: [
      {
        title: "Independent Recruiters",
        body: "Run multiple client pipelines without losing track of active roles.",
      },
      {
        title: "Recruiting Agencies",
        body: "Coordinate jobs, candidate flow, and delivery without spreadsheet drift.",
      },
      {
        title: "Internal Talent Teams",
        body: "Manage end-to-end hiring inside one shared workspace.",
      },
    ],
  },
  outcomes: {
    eyebrow: "Outcomes",
    title: "Less setup. More recruiting.",
    items: [
      {
        title: "Create jobs in minutes",
        body: "Move from request to publish without formatting friction.",
      },
      {
        title: "Reduce manual screening",
        body: "Spend time on candidate conversations instead of cleaning worksheets.",
      },
      {
        title: "Manage candidates in one workspace",
        body: "Keep notes, touchpoints, and evaluations in the same place.",
      },
      {
        title: "Use AI only where it helps",
        body: "A practical system built around recruiter utility, not buzzwords.",
      },
    ],
  },
  pricing: {
    eyebrow: "Pricing Plan",
    title: "Extremely simple, self-serve framework",
    plans: [
      {
        name: "Free",
        badge: "Self-Serve",
        description: "For individual recruiters establishing a workspace.",
        price: "$0",
        footnote: "Free forever",
        cta: "Start Free Workspace",
      },
      {
        name: "Pro",
        badge: "Growth",
        description: "Advanced coordination workflows and automated metrics.",
        price: "$49",
        footnote: "Upgrade when needed",
        cta: "Upgrade Workspace",
      },
    ],
  },
  footer: {
    copyright: "© 2026 Evality Technologies Inc. All parameters aligned to workspace guidelines.",
    links: ["Privacy", "Terms", "Contact", "LinkedIn"],
  },
};

export const AUTH_COPY = {
  title: "Log in or sign up",
  description: "Create jobs, collect candidates, and start hiring faster.",
  continueWithGoogle: "Continue with Google",
  continueWithLinkedIn: "Continue with LinkedIn",
  continueWithEmail: "Continue with Email",
  email: "Email",
  continue: "Continue",
};

export const ONBOARDING_COPY = {
  title: "Welcome to Evality",
  subtitle: "Tell us a little about how you recruit.",
  roleOptions: [
    { value: "", label: "Select your role" },
    { value: "recruiter", label: "Recruiter" },
    { value: "recruitment-lead", label: "Recruitment Lead" },
    { value: "hiring-manager", label: "Hiring Manager" },
    { value: "founder", label: "Founder" },
    { value: "hr-team", label: "HR Team" },
  ],
  roleLabel: "What best describes you?",
  purposeLabel: "I primarily recruit for:",
  purposeOptions: [
    {
      value: "internal",
      title: "My Company",
      description: "Hiring for my organization",
    },
    {
      value: "agency",
      title: "Clients",
      description: "Hiring for external clients",
    },
    {
      value: "both",
      title: "Both",
      description: "Internal and client recruiting",
    },
  ],
  helperText:
    "We'll personalize your workspace, onboarding, and recommendations based on your recruiting workflow.",
  continue: "Continue",
  back: "Back",
};

export const PAGE_COPY = {
  actionCenter: {
    title: "Action Center",
    description: "Your daily recruiting priorities will live here.",
  },
  jobs: {
    title: "Jobs",
    description: "A compact workspace for reviewing and managing roles.",
    empty: "No jobs yet.",
    emptyBody: "Create your first role to start managing candidates in one workspace.",
    createCta: "Create Job",
    editCta: "Edit Job",
    searchPlaceholder: "Search or jump to...",
    activeTab: "Active",
    archivedTab: "Archived",
    archivedEmptyTitle: "No jobs archived yet",
    archivedEmptyBody: "Archive completed or inactive roles to keep your active workspace clean.",
    tableEmpty: "No jobs match the current search.",
    sheetCreateDescription: "Create a job directly into local storage so the Jobs table and Job Workspace stay in sync.",
    sheetEditDescription: "Update the core job details. Draft jobs stay editable here, while published jobs open into the workspace.",
  },
  candidates: {
    title: "Candidates",
    description: "Candidate records and follow-ups will live here.",
  },
  clients: {
    title: "Clients",
    description: "Client records and client-side hiring work will live here.",
  },
  jobWorkspace: {
    title: "Job Workspace",
    description: "Selected job summary and candidate pipeline.",
    notFoundTitle: "Job not found",
    notFoundBody: "This route only resolves jobs that exist in local storage. Return to Jobs and recreate the role from the table.",
    summaryTitle: "Workspace Summary",
    roleTitle: "Role Details",
    candidatesTitle: "Candidates",
    activityTitle: "Activity",
    pipelineTitle: "Pipeline Overview",
    jobSummaryTitle: "Job Summary",
  },
  designSystem: {
    title: "Design System",
    description: "Living implementation contract for Evality UI tokens and components.",
  },
};
