/*
lib/FxStore.js | Demo/local state foundation and seed data | Sree | 2026-06-13
*/

/* - - - - - - - - - - - - - - - - */

import { STORAGE_KEYS } from "@/lib/FxConstants";
import { normalizeJobRecord } from "@/lib/FxJobSchema";
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
    unscreenedCount: 3,
    preScreenedCount: 0,
    shortlistedCount: 0,
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
    unscreenedCount: 1,
    preScreenedCount: 1,
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
    unscreenedCount: 1,
    preScreenedCount: 0,
    shortlistedCount: 1,
    sentToClientCount: 0,
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
    unscreenedCount: 0,
    preScreenedCount: 0,
    shortlistedCount: 0,
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
    unscreenedCount: 2,
    preScreenedCount: 0,
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
    unscreenedCount: 0,
    preScreenedCount: 2,
    shortlistedCount: 0,
    sentToClientCount: 0,
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
    unscreenedCount: 0,
    preScreenedCount: 0,
    shortlistedCount: 2,
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
    unscreenedCount: 0,
    preScreenedCount: 0,
    shortlistedCount: 0,
    sentToClientCount: 0,
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
    unscreenedCount: 1,
    preScreenedCount: 1,
    shortlistedCount: 0,
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
    unscreenedCount: 1,
    preScreenedCount: 1,
    shortlistedCount: 0,
    sentToClientCount: 0,
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
    unscreenedCount: 1,
    preScreenedCount: 0,
    shortlistedCount: 1,
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
    unscreenedCount: 0,
    preScreenedCount: 0,
    shortlistedCount: 1,
    sentToClientCount: 0,
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
    unscreenedCount: 0,
    preScreenedCount: 0,
    shortlistedCount: 0,
    sentToClientCount: 1,
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
    unscreenedCount: 1,
    preScreenedCount: 0,
    shortlistedCount: 0,
    sentToClientCount: 0,
    status: "Draft",
    isArchived: false,
    createdAt: "2026-06-02T08:25:00Z",
    updatedAt: "2026-06-10T15:40:00Z",
    updatedBy: "Ayush Singh",
    data: { jobTitle: "Operations Manager" },
  },
  {
    id: "JOB60182",
    title: "Implementation Consultant",
    company: "OrbitPay",
    positions: 1,
    createdBy: "John Doe",
    location: "Remote",
    experience: "4 - 7 yrs",
    unscreenedCount: 0,
    preScreenedCount: 1,
    shortlistedCount: 0,
    sentToClientCount: 0,
    status: "Published",
    isArchived: false,
    createdAt: "2026-06-01T09:25:00Z",
    updatedAt: "2026-06-13T13:45:00Z",
    updatedBy: "John Doe",
    data: { jobTitle: "Implementation Consultant" },
  },
  {
    id: "JOB44719",
    title: "Customer Support Lead",
    company: "CloudNine",
    positions: 1,
    createdBy: "Ayush Singh",
    location: "Bengaluru",
    experience: "3 - 6 yrs",
    unscreenedCount: 0,
    preScreenedCount: 0,
    shortlistedCount: 1,
    sentToClientCount: 0,
    status: "Published",
    isArchived: false,
    createdAt: "2026-05-31T10:10:00Z",
    updatedAt: "2026-06-12T10:15:00Z",
    updatedBy: "Ayush Singh",
    data: { jobTitle: "Customer Support Lead" },
  },
  {
    id: "JOB88104",
    title: "Sales Engineer",
    company: "KiteStack",
    positions: 1,
    createdBy: "John Doe",
    location: "Koramangala, Bengaluru",
    experience: "4 - 8 yrs",
    unscreenedCount: 0,
    preScreenedCount: 0,
    shortlistedCount: 0,
    sentToClientCount: 1,
    status: "Published",
    isArchived: false,
    createdAt: "2026-05-30T12:35:00Z",
    updatedAt: "2026-06-11T12:20:00Z",
    updatedBy: "John Doe",
    data: { jobTitle: "Sales Engineer" },
  },
  {
    id: "JOB33755",
    title: "Solutions Architect",
    company: "Northstar Labs",
    positions: 1,
    createdBy: "Ayush Singh",
    location: "Remote",
    experience: "6 - 10 yrs",
    unscreenedCount: 1,
    preScreenedCount: 0,
    shortlistedCount: 0,
    sentToClientCount: 0,
    status: "Published",
    isArchived: false,
    createdAt: "2026-05-29T08:15:00Z",
    updatedAt: "2026-06-12T16:30:00Z",
    updatedBy: "Ayush Singh",
    data: { jobTitle: "Solutions Architect" },
  },
  {
    id: "JOB29816",
    title: "Content Strategist",
    company: "SignalDesk",
    positions: 1,
    createdBy: "John Doe",
    location: "Whitefield, Bengaluru",
    experience: "4 - 7 yrs",
    unscreenedCount: 0,
    preScreenedCount: 0,
    shortlistedCount: 0,
    sentToClientCount: 0,
    status: "Published",
    isArchived: false,
    createdAt: "2026-05-28T09:50:00Z",
    updatedAt: "2026-06-10T17:05:00Z",
    updatedBy: "John Doe",
    data: { jobTitle: "Content Strategist" },
  },
  {
    id: "JOB67250",
    title: "Platform Engineer",
    company: "Vortex Ventures",
    positions: 1,
    createdBy: "Ayush Singh",
    location: "Indiranagar, Bengaluru",
    experience: "5 - 9 yrs",
    unscreenedCount: 0,
    preScreenedCount: 0,
    shortlistedCount: 0,
    sentToClientCount: 0,
    status: "Published",
    isArchived: false,
    createdAt: "2026-05-27T11:40:00Z",
    updatedAt: "2026-06-09T09:55:00Z",
    updatedBy: "Ayush Singh",
    data: { jobTitle: "Platform Engineer" },
  },
  {
    id: "JOB19407",
    title: "Growth Marketer",
    company: "Vortex Ventures",
    positions: 1,
    createdBy: "Ayush Singh",
    location: "Indiranagar, Bengaluru",
    experience: "4 - 8 yrs",
    unscreenedCount: 0,
    preScreenedCount: 0,
    shortlistedCount: 0,
    sentToClientCount: 0,
    status: "Published",
    isArchived: true,
    createdAt: "2026-06-06T08:45:00Z",
    updatedAt: "2026-06-10T13:05:00Z",
    updatedBy: "Ayush Singh",
    data: { jobTitle: "Growth Marketer" },
  },
  {
    id: "JOB90214",
    title: "Talent Sourcer",
    company: "ThinkJS",
    positions: 1,
    createdBy: "John Doe",
    location: "Bengaluru",
    experience: "2 - 4 yrs",
    unscreenedCount: 0,
    preScreenedCount: 0,
    shortlistedCount: 0,
    sentToClientCount: 0,
    status: "Published",
    isArchived: false,
    createdAt: "2026-06-11T08:40:00Z",
    updatedAt: "2026-06-13T10:10:00Z",
    updatedBy: "John Doe",
    data: { jobTitle: "Talent Sourcer" },
  },
  {
    id: "JOB63840",
    title: "UI Engineer",
    company: "Northstar Labs",
    positions: 1,
    createdBy: "Ayush Singh",
    location: "Remote",
    experience: "4 - 6 yrs",
    unscreenedCount: 0,
    preScreenedCount: 0,
    shortlistedCount: 0,
    sentToClientCount: 0,
    status: "Published",
    isArchived: false,
    createdAt: "2026-06-10T12:15:00Z",
    updatedAt: "2026-06-13T06:30:00Z",
    updatedBy: "Ayush Singh",
    data: { jobTitle: "UI Engineer" },
  },
  {
    id: "JOB71456",
    title: "Product Marketing Manager",
    company: "SignalDesk",
    positions: 1,
    createdBy: "John Doe",
    location: "Whitefield, Bengaluru",
    experience: "6 - 9 yrs",
    unscreenedCount: 0,
    preScreenedCount: 0,
    shortlistedCount: 0,
    sentToClientCount: 0,
    status: "Published",
    isArchived: false,
    createdAt: "2026-06-10T07:25:00Z",
    updatedAt: "2026-06-12T13:40:00Z",
    updatedBy: "John Doe",
    data: { jobTitle: "Product Marketing Manager" },
  },
  {
    id: "JOB42819",
    title: "Solutions Consultant",
    company: "OrbitPay",
    positions: 1,
    createdBy: "Ayush Singh",
    location: "Remote",
    experience: "5 - 8 yrs",
    unscreenedCount: 0,
    preScreenedCount: 0,
    shortlistedCount: 0,
    sentToClientCount: 0,
    status: "Published",
    isArchived: false,
    createdAt: "2026-06-09T11:15:00Z",
    updatedAt: "2026-06-12T09:00:00Z",
    updatedBy: "Ayush Singh",
    data: { jobTitle: "Solutions Consultant" },
  },
  {
    id: "JOB51984",
    title: "Security Engineer",
    company: "KiteStack",
    positions: 1,
    createdBy: "John Doe",
    location: "Koramangala, Bengaluru",
    experience: "5 - 8 yrs",
    unscreenedCount: 0,
    preScreenedCount: 0,
    shortlistedCount: 0,
    sentToClientCount: 0,
    status: "Published",
    isArchived: false,
    createdAt: "2026-06-09T13:10:00Z",
    updatedAt: "2026-06-11T18:05:00Z",
    updatedBy: "John Doe",
    data: { jobTitle: "Security Engineer" },
  },
  {
    id: "JOB78351",
    title: "Customer Success Associate",
    company: "OrbitPay",
    positions: 1,
    createdBy: "Ayush Singh",
    location: "Remote",
    experience: "2 - 5 yrs",
    unscreenedCount: 0,
    preScreenedCount: 0,
    shortlistedCount: 0,
    sentToClientCount: 0,
    status: "Published",
    isArchived: false,
    createdAt: "2026-06-08T10:50:00Z",
    updatedAt: "2026-06-10T16:20:00Z",
    updatedBy: "Ayush Singh",
    data: { jobTitle: "Customer Success Associate" },
  },
  {
    id: "JOB22670",
    title: "Analytics Engineer",
    company: "CloudNine",
    positions: 1,
    createdBy: "John Doe",
    location: "Bengaluru",
    experience: "4 - 7 yrs",
    unscreenedCount: 0,
    preScreenedCount: 0,
    shortlistedCount: 0,
    sentToClientCount: 0,
    status: "Published",
    isArchived: false,
    createdAt: "2026-06-07T15:30:00Z",
    updatedAt: "2026-06-10T12:50:00Z",
    updatedBy: "John Doe",
    data: { jobTitle: "Analytics Engineer" },
  },
  {
    id: "JOB94620",
    title: "Implementation Manager",
    company: "RHP Consulting",
    positions: 1,
    createdBy: "Ayush Singh",
    location: "Remote",
    experience: "6 - 9 yrs",
    unscreenedCount: 0,
    preScreenedCount: 0,
    shortlistedCount: 0,
    sentToClientCount: 0,
    status: "Published",
    isArchived: false,
    createdAt: "2026-06-06T09:10:00Z",
    updatedAt: "2026-06-09T14:35:00Z",
    updatedBy: "Ayush Singh",
    data: { jobTitle: "Implementation Manager" },
  },
];

export const DEMO_CANDIDATES = [
  {
    id: "cand-1",
    jobId: "JOB80123",
    name: "Aarav Mehta",
    status: "unscreened",
    matchScore: 64,
    uploadedBy: "Renny @ ThinkJS",
    interested: "Yes",
    availabilityDays: 1,
    currentSalary: 1000000,
    expectedSalary: 1200000,
    updatedAt: "2026-06-13T10:15:00Z",
  },
  {
    id: "cand-2",
    jobId: "JOB80123",
    name: "Neha Kapoor",
    status: "screened",
    matchScore: 71,
    uploadedBy: "Renny @ ThinkJS",
    interested: "Yes",
    availabilityDays: 7,
    currentSalary: 1100000,
    expectedSalary: 1300000,
    updatedAt: "2026-06-13T11:40:00Z",
  },
  {
    id: "cand-3",
    jobId: "JOB80123",
    name: "Kabir Shah",
    status: "shortlisted",
    matchScore: 83,
    uploadedBy: "Ayush Singh",
    interested: "Yes",
    availabilityDays: 14,
    currentSalary: 1400000,
    expectedSalary: 1600000,
    updatedAt: "2026-06-13T13:05:00Z",
  },
  {
    id: "cand-4",
    jobId: "JOB80123",
    name: "Mira Iyer",
    status: "shared",
    matchScore: 78,
    uploadedBy: "Ayush Singh",
    interested: "Yes",
    availabilityDays: 3,
    currentSalary: 1250000,
    expectedSalary: 1500000,
    updatedAt: "2026-06-13T14:20:00Z",
  },
  {
    id: "cand-5",
    jobId: "JOB80123",
    name: "Rahul Menon",
    status: "rejected",
    matchScore: 41,
    uploadedBy: "Renny @ ThinkJS",
    interested: "No",
    availabilityDays: 30,
    currentSalary: 900000,
    expectedSalary: 1100000,
    updatedAt: "2026-06-13T15:00:00Z",
  },
  {
    id: "cand-6",
    jobId: "JOB66817",
    name: "Priya Nair",
    status: "shortlisted",
    matchScore: 87,
    uploadedBy: "John Doe",
    interested: "Yes",
    availabilityDays: 2,
    currentSalary: 1500000,
    expectedSalary: 1700000,
    updatedAt: "2026-06-13T12:00:00Z",
  },
  {
    id: "cand-7",
    jobId: "JOB66817",
    name: "Sanjay Rao",
    status: "shared",
    matchScore: 79,
    uploadedBy: "Ayush Singh",
    interested: "Yes",
    availabilityDays: 5,
    currentSalary: 1450000,
    expectedSalary: 1650000,
    updatedAt: "2026-06-13T13:15:00Z",
  },
  {
    id: "cand-8",
    jobId: "JOB66817",
    name: "Ananya Bose",
    status: "screened",
    matchScore: 68,
    uploadedBy: "John Doe",
    interested: "Maybe",
    availabilityDays: 10,
    currentSalary: 1350000,
    expectedSalary: 1550000,
    updatedAt: "2026-06-13T14:10:00Z",
  },
  {
    id: "cand-9",
    jobId: "JOB66817",
    name: "Vikram Das",
    status: "unscreened",
    matchScore: 58,
    uploadedBy: "Ayush Singh",
    interested: "Yes",
    availabilityDays: 21,
    currentSalary: 1200000,
    expectedSalary: 1400000,
    screeningOutcome: "Failed",
    updatedAt: "2026-06-13T15:20:00Z",
  },
  {
    id: "cand-10",
    jobId: "JOB74192",
    name: "Shreya Kulkarni",
    status: "unscreened",
    matchScore: 62,
    uploadedBy: "John Doe",
    interested: "Yes",
    availabilityDays: 7,
    currentSalary: 1600000,
    expectedSalary: 1800000,
    updatedAt: "2026-06-13T09:30:00Z",
  },
  {
    id: "cand-11",
    jobId: "JOB74192",
    name: "Aditya Verma",
    status: "screened",
    matchScore: 74,
    uploadedBy: "Ayush Singh",
    interested: "Yes",
    availabilityDays: 14,
    currentSalary: 1700000,
    expectedSalary: 1900000,
    updatedAt: "2026-06-13T10:45:00Z",
  },
  {
    id: "cand-12",
    jobId: "JOB74192",
    name: "Fatima Khan",
    status: "rejected",
    matchScore: 39,
    uploadedBy: "John Doe",
    interested: "No",
    availabilityDays: 28,
    currentSalary: 1300000,
    expectedSalary: 1500000,
    updatedAt: "2026-06-13T11:25:00Z",
  },
  {
    id: "cand-13",
    jobId: "JOB48261",
    name: "Kavya Menon",
    status: "screened",
    matchScore: 76,
    uploadedBy: "Ayush Singh",
    interested: "Yes",
    availabilityDays: 5,
    currentSalary: 1500000,
    expectedSalary: 1750000,
    updatedAt: "2026-06-13T12:35:00Z",
  },
  {
    id: "cand-14",
    jobId: "JOB11408",
    name: "Arjun Patel",
    status: "shortlisted",
    matchScore: 82,
    uploadedBy: "John Doe",
    interested: "Yes",
    availabilityDays: 3,
    currentSalary: 900000,
    expectedSalary: 1050000,
    updatedAt: "2026-06-13T12:55:00Z",
  },
  {
    id: "cand-15",
    jobId: "JOB66309",
    name: "Sneha Rao",
    status: "unscreened",
    matchScore: 61,
    uploadedBy: "Renny @ ThinkJS",
    interested: "Maybe",
    availabilityDays: 14,
    currentSalary: 1800000,
    expectedSalary: 2050000,
    updatedAt: "2026-06-13T13:25:00Z",
  },
  {
    id: "cand-16",
    jobId: "JOB53067",
    name: "Ritesh Gupta",
    status: "shared",
    matchScore: 79,
    uploadedBy: "Ayush Singh",
    interested: "Yes",
    availabilityDays: 2,
    currentSalary: 1450000,
    expectedSalary: 1650000,
    updatedAt: "2026-06-13T13:55:00Z",
  },
];

export const DEMO_CLIENTS = [
  {
    id: "client-1",
    name: "ThinkJS",
    industry: "Technology Staffing",
    owner: "Ayush Singh",
    website: "thinkjs.ai",
    status: "Active",
    createdAt: "2026-06-08T10:00:00Z",
    updatedAt: "2026-06-13T10:00:00Z",
  },
  {
    id: "client-2",
    name: "RHP Consulting",
    industry: "Consulting",
    owner: "John Doe",
    website: "rhpconsulting.com",
    status: "Active",
    createdAt: "2026-06-07T10:00:00Z",
    updatedAt: "2026-06-12T12:00:00Z",
  },
  {
    id: "client-3",
    name: "KiteStack",
    industry: "SaaS",
    owner: "Priya Nair",
    website: "kitestack.io",
    status: "Active",
    createdAt: "2026-06-06T10:00:00Z",
    updatedAt: "2026-06-11T13:00:00Z",
  },
  {
    id: "client-4",
    name: "Northstar Labs",
    industry: "Product Services",
    owner: "John Doe",
    website: "northstarlabs.co",
    status: "Active",
    createdAt: "2026-06-05T10:00:00Z",
    updatedAt: "2026-06-11T15:00:00Z",
  },
  {
    id: "client-5",
    name: "SignalDesk",
    industry: "Analytics",
    owner: "Ayush Singh",
    website: "signaldesk.ai",
    status: "Active",
    createdAt: "2026-06-04T10:00:00Z",
    updatedAt: "2026-06-12T09:00:00Z",
  },
  {
    id: "client-6",
    name: "OrbitPay",
    industry: "Fintech",
    owner: "Sanjay Rao",
    website: "orbitpay.co",
    status: "Active",
    createdAt: "2026-06-03T10:00:00Z",
    updatedAt: "2026-06-10T11:30:00Z",
  },
  {
    id: "client-7",
    name: "CloudNine",
    industry: "Cloud Infrastructure",
    owner: "Renny @ ThinkJS",
    website: "cloudnine.dev",
    status: "Archived",
    createdAt: "2026-06-02T10:00:00Z",
    updatedAt: "2026-06-09T10:00:00Z",
  },
  {
    id: "client-8",
    name: "Vortex Ventures",
    industry: "Venture Studio",
    owner: "Priya Nair",
    website: "vortexventures.co",
    status: "Archived",
    createdAt: "2026-06-01T10:00:00Z",
    updatedAt: "2026-06-08T10:00:00Z",
  },
];

const DEMO_CANDIDATE_FIRST_NAMES = [
  "Aarav",
  "Ananya",
  "Kabir",
  "Mira",
  "Rohan",
  "Priya",
  "Sanjay",
  "Fatima",
  "Vikram",
  "Nisha",
  "Aditya",
  "Meera",
  "Kunal",
  "Isha",
  "Rahul",
  "Neha",
];

const DEMO_CANDIDATE_LAST_NAMES = [
  "Mehta",
  "Shah",
  "Kapoor",
  "Iyer",
  "Rao",
  "Nair",
  "Das",
  "Khan",
  "Verma",
  "Bose",
  "Menon",
  "Gupta",
];

const DEMO_UPLOADER_POOL = ["John Doe", "Ayush Singh", "Renny @ ThinkJS", "Priya Nair", "Sanjay Rao"];

const DEMO_AVAILABILITY_POOL = [1, 2, 3, 5, 7, 10, 14, 21, 30];

function hashSeed(value) {
  return String(value)
    .split("")
    .reduce((hash, char) => ((hash * 31 + char.charCodeAt(0)) >>> 0), 0);
}

function slugifyName(value) {
  return String(value ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ".")
    .replace(/^\.+|\.+$/g, "");
}

function formatIndianCurrencyFromLakhs(minLakhs, maxLakhs) {
  return `₹${minLakhs}L - ₹${maxLakhs}L`;
}

function parseExperienceBand(experience) {
  const matches = String(experience ?? "").match(/\d+/g)?.map(Number) ?? [];

  if (matches.length >= 2) {
    return matches;
  }

  if (matches.length === 1) {
    return [matches[0], matches[0] + 2];
  }

  return [3, 5];
}

function inferJobDomain(title) {
  const normalized = String(title ?? "").toLowerCase();

  if (normalized.includes("design")) {
    return "Product Design";
  }

  if (normalized.includes("recruit") || normalized.includes("talent") || normalized.includes("hiring")) {
    return "Talent Acquisition";
  }

  if (normalized.includes("marketing") || normalized.includes("growth")) {
    return "Growth";
  }

  if (normalized.includes("analyst") || normalized.includes("analytics")) {
    return "Analytics";
  }

  if (normalized.includes("success") || normalized.includes("consultant") || normalized.includes("coordinator")) {
    return "Operations";
  }

  return "Engineering";
}

function inferJobDepartment(title) {
  const normalized = String(title ?? "").toLowerCase();

  if (normalized.includes("design")) {
    return "Design";
  }

  if (normalized.includes("marketing") || normalized.includes("growth")) {
    return "Growth";
  }

  if (normalized.includes("analyst") || normalized.includes("analytics")) {
    return "Data";
  }

  if (normalized.includes("recruit") || normalized.includes("talent") || normalized.includes("hiring")) {
    return "Recruiting";
  }

  if (normalized.includes("success") || normalized.includes("consultant") || normalized.includes("coordinator")) {
    return "Operations";
  }

  return "Engineering";
}

function inferPriority(job, index) {
  const seed = hashSeed(`${job.id}:${job.title}:${index}`);

  if (job.status === "Draft" && Number(job.unscreenedCount) >= 8) {
    return "High";
  }

  if (seed % 7 === 0) {
    return "High";
  }

  if (seed % 5 === 0) {
    return "Low";
  }

  return "Medium";
}

function inferSalaryRange(experience) {
  const [minYears, maxYears] = parseExperienceBand(experience);
  const minLakhs = Math.max(8, Math.round(minYears * 2.2));
  const maxLakhs = Math.max(minLakhs + 4, Math.round(maxYears * 3.2));
  return formatIndianCurrencyFromLakhs(minLakhs, maxLakhs);
}

function inferQuestionFormat(job) {
  if (String(job.title ?? "").toLowerCase().includes("recruit")) {
    return "CV + Pre-screening";
  }

  return "CV + AI pre-screening";
}

const DEMO_JOB_EVALUATION_CONTEXTS = {
  JOB66817:
    "Evaluate React architecture, component quality, state management, and the ability to explain trade-offs clearly.",
  JOB74192:
    "Evaluate backend design, API clarity, debugging depth, and ownership of reliability in production systems.",
  JOB11408:
    "Evaluate coordination discipline, follow-up consistency, recruiter communication, and attention to process detail.",
  JOB66309:
    "Evaluate deployment discipline, infrastructure automation, observability practices, and incident-response ownership.",
  JOB80123:
    "Evaluate SRE fundamentals, alerting judgment, production debugging, and practical reliability thinking.",
  JOB44028:
    "Evaluate customer empathy, escalation handling, process follow-through, and the ability to manage expectations calmly.",
  JOB15962:
    "Evaluate SQL fluency, data interpretation, analytical rigor, and the ability to communicate findings clearly.",
  JOB60182:
    "Evaluate implementation planning, client communication, schedule discipline, and practical delivery ownership.",
  JOB44719:
    "Evaluate support quality, de-escalation skills, process adherence, and customer-first communication.",
  JOB88104:
    "Evaluate technical discovery, solution design, stakeholder communication, and practical problem solving.",
  JOB33755:
    "Evaluate architecture judgment, trade-off thinking, stakeholder management, and delivery pragmatism.",
  JOB29816:
    "Evaluate content strategy thinking, research quality, and cross-functional alignment with marketing goals.",
  JOB67250:
    "Evaluate platform reliability, tooling ownership, systems thinking, and the ability to keep teams unblocked.",
  JOB90214:
    "Evaluate sourcing discipline, outreach quality, pipeline management, and recruiter-candidate communication.",
  JOB63840:
    "Evaluate frontend craftsmanship, UX detail, performance awareness, and clean component implementation.",
  JOB71456:
    "Evaluate product marketing judgment, positioning clarity, and the ability to work across product and sales.",
  JOB42819:
    "Evaluate consulting skills, requirement translation, client delivery discipline, and communication clarity.",
  JOB51984:
    "Evaluate security fundamentals, incident readiness, practical hardening, and risk-aware decision making.",
  JOB78351:
    "Evaluate customer success ownership, renewal awareness, escalation handling, and consistent follow-through.",
  JOB94620:
    "Evaluate implementation coordination, schedule discipline, client communication, and delivery reliability.",
};

function formatPublishDate(value) {
  if (!value) {
    return null;
  }

  const timestamp = new Date(value).getTime();

  if (Number.isNaN(timestamp)) {
    return null;
  }

  return new Date(timestamp).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

function decorateDemoJob(job, index = 0) {
  const domain = job.domain ?? inferJobDomain(job.title);
  const department = job.department ?? inferJobDepartment(job.title);
  const employmentType = job.employmentType ?? "Full-time";
  const salaryRange = job.salaryRange ?? inferSalaryRange(job.experience);
  const priority = job.priority ?? inferPriority(job, index);
  const questionFormat = job.questionFormat ?? inferQuestionFormat(job);
  const publishDate = job.publishDate ?? formatPublishDate(job.updatedAt ?? job.createdAt);
  const client = job.client ?? job.company ?? "";
  const evaluationContext = job.evaluationContext ?? DEMO_JOB_EVALUATION_CONTEXTS[job.id] ?? "";

  return {
    ...job,
    client,
    domain,
    department,
    employmentType,
    salaryRange,
    priority,
    questionFormat,
    publishDate,
    evaluationContext,
    data: {
      ...(job.data ?? {}),
      jobTitle: job.data?.jobTitle ?? job.title ?? "",
      client,
      domain,
      department,
      employmentType,
      salaryRange,
      priority,
      questionFormat,
      publishDate,
      evaluationContext,
    },
  };
}

function normalizeJobsCollection(jobs) {
  return (jobs ?? []).map((job, index) => normalizeJobRecord(decorateDemoJob(job, index)) ?? null).filter(Boolean);
}

function createCandidateEmail(name, job, index) {
  const localPart = slugifyName(name) || `candidate-${index + 1}`;
  const jobPart = slugifyName(job?.title ?? job?.id ?? "job");
  return `${localPart}.${jobPart}@evality.ai`;
}

function createCandidatePhone(seed) {
  const digits = String(9000000000 + (seed % 1000000000));
  return `+91 ${digits.slice(0, 5)} ${digits.slice(5, 10)}`;
}

function inferTrustScore(candidate, job) {
  if (candidate.trustScore) {
    return candidate.trustScore;
  }

  if (candidate.status === "shared" || candidate.status === "shortlisted") {
    return "High";
  }

  if (candidate.status === "screened") {
    return "Medium";
  }

  if (candidate.status === "rejected") {
    return "Low";
  }

  return job?.status === "Published" ? "Medium" : "Low";
}

function normalizeStoredCandidate(candidate, job) {
  if (!candidate) {
    return null;
  }

  const seed = hashSeed(`${candidate.id ?? candidate.name ?? "candidate"}:${candidate.jobId ?? job?.id ?? "job"}`);
  const name = candidate.name ?? "Candidate";
  const jobContexts =
    candidate.jobContexts && typeof candidate.jobContexts === "object" && !Array.isArray(candidate.jobContexts) ? candidate.jobContexts : {};

  return {
    ...candidate,
    jobId: candidate.jobId ?? job?.id ?? null,
    jobTitle: candidate.jobTitle ?? job?.title ?? "",
    client: candidate.client ?? job?.client ?? job?.company ?? "",
    email: candidate.email ?? createCandidateEmail(name, job, seed),
    phone: candidate.phone ?? createCandidatePhone(seed),
    status: candidate.status ?? "unscreened",
    trustScore: inferTrustScore(candidate, job),
    matchScore: candidate.matchScore != null ? Number(candidate.matchScore) : null,
    availabilityDays: candidate.availabilityDays != null ? Number(candidate.availabilityDays) : null,
    currentSalary: candidate.currentSalary != null ? Number(candidate.currentSalary) : null,
    expectedSalary: candidate.expectedSalary != null ? Number(candidate.expectedSalary) : null,
    jobContexts,
  };
}

function getJobCandidateTargets(job) {
  const visibleTotal =
    (Number(job.unscreenedCount) || 0) +
    (Number(job.preScreenedCount ?? job.screenedCount) || 0) +
    (Number(job.shortlistedCount) || 0) +
    (Number(job.sentToClientCount ?? job.sharedCount) || 0);

  return {
    unscreened: Number(job.unscreenedCount) || 0,
    screened: Number(job.preScreenedCount ?? job.screenedCount) || 0,
    shortlisted: Number(job.shortlistedCount) || 0,
    shared: Number(job.sentToClientCount ?? job.sharedCount) || 0,
    rejected: Math.max(0, Math.floor(visibleTotal / 12)),
  };
}

function createSyntheticCandidate(job, status, index, usedNames = new Set()) {
  const seed = hashSeed(`${job.id}:${status}:${index}`);
  const baseTimestamp = new Date(job.updatedAt ?? job.createdAt ?? Date.now()).getTime();
  const hoursBack = 3 + index * 2 + (status === "rejected" ? 8 : status === "shared" ? 6 : status === "shortlisted" ? 4 : status === "screened" ? 2 : 0);
  const currentSalary = 900000 + (seed % 11) * 50000;
  const firstPoolSize = DEMO_CANDIDATE_FIRST_NAMES.length;
  const lastPoolSize = DEMO_CANDIDATE_LAST_NAMES.length;
  let name = "";

  for (let attempt = 0; attempt < firstPoolSize * lastPoolSize; attempt += 1) {
    const shiftedSeed = seed + (attempt * 17);
    const firstName = DEMO_CANDIDATE_FIRST_NAMES[shiftedSeed % firstPoolSize];
    const lastName = DEMO_CANDIDATE_LAST_NAMES[Math.floor(shiftedSeed / firstPoolSize) % lastPoolSize];
    const candidateName = `${firstName} ${lastName}`;

    if (!usedNames.has(candidateName)) {
      name = candidateName;
      usedNames.add(candidateName);
      break;
    }
  }

  if (!name) {
    const firstName = DEMO_CANDIDATE_FIRST_NAMES[seed % firstPoolSize];
    const lastName = DEMO_CANDIDATE_LAST_NAMES[Math.floor(seed / firstPoolSize) % lastPoolSize];
    name = `${firstName} ${lastName}`;
    usedNames.add(name);
  }

  return {
    id: `cand-${job.id.toLowerCase()}-${status}-${index + 1}`,
    jobId: job.id,
    jobTitle: job.title,
    client: job.client ?? job.company ?? "",
    name,
    email: createCandidateEmail(name, job, index),
    phone: createCandidatePhone(seed),
    status,
    trustScore: status === "shared" || status === "shortlisted" ? "High" : status === "screened" ? "Medium" : status === "rejected" ? "Low" : "Medium",
    matchScore:
      status === "unscreened"
        ? 50 + (seed % 18)
        : status === "screened"
          ? 62 + (seed % 16)
          : status === "shortlisted"
            ? 78 + (seed % 12)
            : status === "shared"
              ? 70 + (seed % 15)
              : 32 + (seed % 18),
    uploadedBy: DEMO_UPLOADER_POOL[seed % DEMO_UPLOADER_POOL.length],
    interested: status === "rejected" ? "No" : seed % 5 === 0 ? "Maybe" : "Yes",
    availabilityDays: DEMO_AVAILABILITY_POOL[seed % DEMO_AVAILABILITY_POOL.length],
    currentSalary,
    expectedSalary: currentSalary + 200000 + (seed % 6) * 25000,
    screeningOutcome: status === "screened" && seed % 5 === 0 ? "Failed" : status === "rejected" ? "Failed" : "Passed",
    jobContexts: {
      [job.id]: {
        viewedAt: new Date(baseTimestamp - (hoursBack + 12) * 60 * 60 * 1000).toISOString(),
        screeningModeOverride: "ai",
      },
    },
    updatedAt: new Date(baseTimestamp - hoursBack * 60 * 60 * 1000).toISOString(),
  };
}

function syncCandidatesWithJobs(jobs, candidates) {
  const jobById = new Map(jobs.map((job) => [job.id, job]));
  const nextCandidates = [];
  const usedCandidateNames = new Set();

  candidates.forEach((candidate) => {
    const job = jobById.get(candidate.jobId);
    const normalizedCandidate = normalizeStoredCandidate(candidate, job);

    if (normalizedCandidate) {
      nextCandidates.push(normalizedCandidate);
      if (normalizedCandidate.name) {
        usedCandidateNames.add(normalizedCandidate.name);
      }
    }
  });

  jobs.forEach((job) => {
    const targets = getJobCandidateTargets(job);
    const jobCandidates = nextCandidates.filter((candidate) => candidate.jobId === job.id);

    Object.entries(targets).forEach(([status, targetCount]) => {
      const matchingCandidates = jobCandidates.filter((candidate) => candidate.status === status);
      const keepCandidates = matchingCandidates.slice(0, targetCount);

      matchingCandidates.forEach((candidate) => {
        const candidateIndex = nextCandidates.findIndex((item) => item.id === candidate.id);

        if (candidateIndex >= 0) {
          nextCandidates.splice(candidateIndex, 1);
        }

        if (candidate.name) {
          usedCandidateNames.delete(candidate.name);
        }
      });

      keepCandidates.forEach((candidate) => {
        nextCandidates.push(candidate);
        if (candidate.name) {
          usedCandidateNames.add(candidate.name);
        }
      });

      const missingCount = Math.max(0, targetCount - keepCandidates.length);

      for (let index = 0; index < missingCount; index += 1) {
        nextCandidates.push(createSyntheticCandidate(job, status, keepCandidates.length + index, usedCandidateNames));
      }
    });
  });

  return nextCandidates;
}

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
  const recruiters = ensureStoredCollection(STORAGE_KEYS.RECRUITERS, DEMO_RECRUITERS);
  const storedJobs = readStoredCollection(STORAGE_KEYS.JOBS);
  const jobs = storedJobs ? normalizeJobsCollection(storedJobs) : [];
  const storedCandidates = readStoredCollection(STORAGE_KEYS.CANDIDATES);
  const candidates = storedCandidates ? syncCandidatesWithJobs(jobs, storedCandidates) : syncCandidatesWithJobs(jobs, jobs.length ? DEMO_CANDIDATES : []);

  if (storedJobs && JSON.stringify(jobs) !== JSON.stringify(storedJobs)) {
    writeStoredCollection(STORAGE_KEYS.JOBS, jobs);
  }

  if (!storedCandidates || JSON.stringify(candidates) !== JSON.stringify(storedCandidates)) {
    writeStoredCollection(STORAGE_KEYS.CANDIDATES, candidates);
  }

  const clients = ensureStoredCollection(STORAGE_KEYS.CLIENTS, DEMO_CLIENTS);

  return {
    recruiters,
    jobs,
    candidates,
    clients,
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
  const jobs = readStoredCollection(STORAGE_KEYS.JOBS);

  if (!jobs) {
    writeStoredJobs([]);
    return [];
  }

  const normalizedJobs = normalizeJobsCollection(jobs);

  if (JSON.stringify(jobs) !== JSON.stringify(normalizedJobs)) {
    writeStoredJobs(normalizedJobs);
  }

  return normalizedJobs;
}

export function readStoredJobs() {
  return normalizeJobsCollection(readStoredCollection(STORAGE_KEYS.JOBS) ?? []);
}

export function writeStoredJobs(jobs) {
  writeStoredCollection(STORAGE_KEYS.JOBS, normalizeJobsCollection(jobs));
}

export function createJobId() {
  return `JOB${Math.floor(10000 + Math.random() * 90000)}`;
}

export function findStoredJob(jobId) {
  return ensureJobsStore().find((job) => job.id === jobId) ?? null;
}

export function upsertStoredJob(jobInput) {
  const jobs = ensureJobsStore();
  const normalizedInput = normalizeJobRecord(jobInput) ?? jobInput;
  const existingJob = jobs.find((job) => job.id === normalizedInput.id);
  const now = new Date().toISOString();
  const nextJob = {
    ...existingJob,
    ...normalizedInput,
    id: normalizedInput.id ?? existingJob?.id ?? createJobId(),
    createdAt: existingJob?.createdAt ?? normalizedInput.createdAt ?? now,
    updatedAt: now,
  };

  const nextJobs = existingJob
    ? jobs.map((job) => (job.id === nextJob.id ? nextJob : job))
    : [nextJob, ...jobs];

  writeStoredJobs(nextJobs);
  return normalizeJobRecord(nextJob) ?? nextJob;
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

export function findStoredCandidate(candidateId) {
  return readStoredCandidates().find((candidate) => candidate.id === candidateId) ?? null;
}

export function findStoredCandidatesByJob(jobId) {
  return readStoredCandidates().filter((candidate) => candidate.jobId === jobId);
}

export function writeStoredCandidates(candidates) {
  writeStoredCollection(STORAGE_KEYS.CANDIDATES, candidates);
}

export function updateStoredCandidate(candidateId, updater) {
  const candidates = readStoredCandidates();
  const nextCandidates = candidates.map((candidate) => {
    if (candidate.id !== candidateId) {
      return candidate;
    }

    const nextCandidate = typeof updater === "function" ? updater(candidate) : { ...candidate, ...(updater ?? {}) };
    return nextCandidate ?? candidate;
  });

  writeStoredCandidates(nextCandidates);
  return nextCandidates.find((candidate) => candidate.id === candidateId) ?? null;
}

function normalizeClientRecord(client, index = 0) {
  if (!client) {
    return null;
  }

  const name = String(client.name ?? client.company ?? `Client ${index + 1}`).trim();
  const status = client.status === "Archived" || client.archived ? "Archived" : "Active";
  const createdAt = client.createdAt ?? client.created_at ?? client.updatedAt ?? new Date().toISOString();
  const updatedAt = client.updatedAt ?? client.updated_at ?? createdAt;

  return {
    ...client,
    id: client.id ?? `client-${index + 1}`,
    name,
    industry: String(client.industry ?? "General"),
    owner: String(client.owner ?? client.contactPerson ?? "Unassigned"),
    website: String(client.website ?? client.companyWebsite ?? ""),
    email: String(client.email ?? ""),
    notes: String(client.notes ?? ""),
    status,
    archived: status === "Archived",
    createdAt,
    updatedAt,
  };
}

function normalizeClientsCollection(clients) {
  return (clients ?? []).map((client, index) => normalizeClientRecord(client, index)).filter(Boolean);
}

export function readStoredClients() {
  return normalizeClientsCollection(readStoredCollection(STORAGE_KEYS.CLIENTS) ?? []);
}

export function writeStoredClients(clients) {
  writeStoredCollection(STORAGE_KEYS.CLIENTS, normalizeClientsCollection(clients));
}

export function findStoredClient(clientId) {
  return readStoredClients().find((client) => client.id === clientId) ?? null;
}

export function upsertStoredClient(clientInput) {
  const clients = readStoredClients();
  const normalizedInput = normalizeClientRecord(clientInput, clients.length);
  const existingClient = clients.find((client) => client.id === normalizedInput.id);
  const now = new Date().toISOString();
  const nextClient = {
    ...existingClient,
    ...normalizedInput,
    id: normalizedInput.id ?? existingClient?.id ?? `client-${clients.length + 1}`,
    createdAt: existingClient?.createdAt ?? normalizedInput.createdAt ?? now,
    updatedAt: now,
  };

  const nextClients = existingClient
    ? clients.map((client) => (client.id === nextClient.id ? nextClient : client))
    : [nextClient, ...clients];

  writeStoredClients(nextClients);
  return normalizeClientRecord(nextClient) ?? nextClient;
}

export function archiveStoredClient(clientId) {
  const clients = readStoredClients();
  const now = new Date().toISOString();
  const nextClients = clients.map((client) =>
    client.id === clientId ? { ...client, status: "Archived", archived: true, updatedAt: now } : client,
  );

  writeStoredClients(nextClients);
  return nextClients.find((client) => client.id === clientId) ?? null;
}

export function restoreStoredClient(clientId) {
  const clients = readStoredClients();
  const now = new Date().toISOString();
  const nextClients = clients.map((client) =>
    client.id === clientId ? { ...client, status: "Active", archived: false, updatedAt: now } : client,
  );

  writeStoredClients(nextClients);
  return nextClients.find((client) => client.id === clientId) ?? null;
}

export function deleteStoredClient(clientId) {
  const nextClients = readStoredClients().filter((client) => client.id !== clientId);
  writeStoredClients(nextClients);
  return nextClients;
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

export function readStoredDemoExperience() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem(STORAGE_KEYS.DEMO_EXPERIENCE);
}

export function writeStoredDemoExperience(experience) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEYS.DEMO_EXPERIENCE, experience);
}

export function resetDemoStore() {
  DEMO_DATA_KEYS.forEach((key) => {
    removeStoredValue(key);
  });

  seedDemoJobsStore();
}

export function seedDemoJobsStore() {
  const seededJobs = normalizeJobsCollection(DEMO_JOBS);
  writeStoredJobs(seededJobs);
  writeStoredCollection(STORAGE_KEYS.CANDIDATES, syncCandidatesWithJobs(seededJobs, DEMO_CANDIDATES));
  ensureStoredCollection(STORAGE_KEYS.RECRUITERS, DEMO_RECRUITERS);
  ensureStoredCollection(STORAGE_KEYS.CLIENTS, DEMO_CLIENTS);
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
    STORAGE_KEYS.DEMO_EXPERIENCE,
    STORAGE_KEYS.JOBS_VIEW_MODE,
    STORAGE_KEYS.JOBS_PAGE_STATE,
  ].forEach(
    (key) => {
      window.localStorage.removeItem(key);
    },
  );

  window.localStorage.removeItem(STORAGE_KEYS.WORKSPACE_TYPE);
}

export function clearAllStoredState() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.clear();
}

/* - - - - - - - - - - - - - - - - */
