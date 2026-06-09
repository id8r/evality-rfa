/*
data/mock-data.ts | Static recruiter-focused prototype data | Sree | 2026-06-09
*/

/* - - - - - - - - - - - - - - - - */

import type { Candidate, Client, Job, ScreeningStage } from "@/types/recruitment";

export const jobs: Job[] = [
  {
    id: "job-react",
    title: "Senior React Developer",
    client: "ThinkJS",
    location: "Bengaluru",
    mode: "Hybrid",
    applicants: 128,
    stage: "Intelligence Ready",
    summary: "Own a modern front-end platform, mentor engineers, and accelerate design-to-code delivery.",
  },
  {
    id: "job-design",
    title: "Product Designer",
    client: "Aramco",
    location: "Remote",
    mode: "Remote",
    applicants: 64,
    stage: "Screening Setup",
    summary: "Shape end-to-end product experiences across internal planning and external customer workflows.",
  },
  {
    id: "job-qa",
    title: "QA Engineer",
    client: "Nvidia",
    location: "Hyderabad",
    mode: "On-site",
    applicants: 87,
    stage: "Hiring Manager Review",
    summary: "Drive automation quality, regression stability, and release confidence for high-velocity teams.",
  },
];

export const candidates: Candidate[] = [
  {
    id: "cand-aisha",
    name: "Aisha Menon",
    experience: "8 years",
    skills: ["React", "TypeScript", "Next.js", "Design Systems"],
    matchScore: 94,
    status: "Interview recommended",
    currentCompany: "Loom",
  },
  {
    id: "cand-daniel",
    name: "Daniel Park",
    experience: "6 years",
    skills: ["Figma", "Product Thinking", "Prototyping", "Research"],
    matchScore: 91,
    status: "Portfolio shortlisted",
    currentCompany: "Notion",
  },
  {
    id: "cand-priya",
    name: "Priya Raman",
    experience: "7 years",
    skills: ["Playwright", "Cypress", "API Testing", "CI/CD"],
    matchScore: 89,
    status: "Screening pending",
    currentCompany: "Stripe",
  },
  {
    id: "cand-omar",
    name: "Omar Haddad",
    experience: "9 years",
    skills: ["React", "GraphQL", "Accessibility", "Team Leadership"],
    matchScore: 86,
    status: "Strong alternative",
    currentCompany: "Vercel",
  },
];

export const clients: Client[] = [
  {
    id: "client-thinkjs",
    name: "ThinkJS",
    industry: "Developer Tools",
    activeJobs: 3,
    openCandidates: 17,
  },
  {
    id: "client-aramco",
    name: "Aramco",
    industry: "Enterprise Operations",
    activeJobs: 5,
    openCandidates: 24,
  },
  {
    id: "client-nvidia",
    name: "Nvidia",
    industry: "AI Infrastructure",
    activeJobs: 4,
    openCandidates: 19,
  },
];

export const screeningStages: ScreeningStage[] = [
  {
    id: "screen-resume",
    title: "AI Resume Review",
    description: "Auto-highlight relevant experience, tool familiarity, and likely strengths before recruiter review.",
  },
  {
    id: "screen-questions",
    title: "Structured Screening Questions",
    description: "Collect the same high-signal answers from every candidate without manual chasing.",
  },
  {
    id: "screen-manager",
    title: "Hiring Manager Handoff",
    description: "Package a concise shortlist with reasoning, risks, and recommended next actions.",
  },
];

export const dashboardMetrics = [
  { label: "Open jobs", value: "12", detail: "+3 this week" },
  { label: "Qualified candidates", value: "48", detail: "16 above 90%" },
  { label: "Client response time", value: "4.2h", detail: "Down from 6.1h" },
  { label: "Team seats", value: "6", detail: "2 invites pending" },
];

export const recruiterJourney = [
  { title: "Create workspace", href: "/workspace" },
  { title: "Add first job", href: "/first-job" },
  { title: "Review job analysis", href: "/job-analysis" },
  { title: "Explore candidate intelligence", href: "/candidate-intelligence" },
  { title: "Configure screening", href: "/screening-setup" },
  { title: "Invite team", href: "/team" },
  { title: "Arrive in dashboard", href: "/dashboard" },
];

/* - - - - - - - - - - - - - - - - */
