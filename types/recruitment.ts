/*
types/recruitment.ts | Shared recruitment domain types | Sree | 2026-06-09
*/

/* - - - - - - - - - - - - - - - - */

export type Job = {
  id: string;
  title: string;
  client: string;
  location: string;
  mode: "Hybrid" | "Remote" | "On-site";
  applicants: number;
  stage: string;
  summary: string;
};

export type Candidate = {
  id: string;
  name: string;
  experience: string;
  skills: string[];
  matchScore: number;
  status: string;
  currentCompany: string;
};

export type Client = {
  id: string;
  name: string;
  industry: string;
  activeJobs: number;
  openCandidates: number;
};

export type ScreeningStage = {
  id: string;
  title: string;
  description: string;
};

/* - - - - - - - - - - - - - - - - */
