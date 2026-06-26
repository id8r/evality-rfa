/* app/career/page.js | Hidden company career portal demo route | Sree | 2026-06-26 */

"use client";

export const dynamic = "force-dynamic";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import {
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  Copy,
  ExternalLink,
  Globe,
  MapPin,
  Share2,
  Upload,
} from "lucide-react";

import { FxButton } from "@/components/FxButton";
import { FxInput } from "@/components/FxInput";
import { FxTabs } from "@/components/FxTabs";
import { showSuccess } from "@/components/FxToast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ensureDemoStore } from "@/lib/FxStore";
import { DEFAULT_COMPANY_BRIEF } from "@/lib/FxJobSchema";
import { cn } from "@/lib/FxUtils";
/* - - - - - - - - - - - - - - - - */

const COMPANY_TAGLINES = {
  ThinkJS: "Product engineering and staffing for fast-moving software teams.",
  "RHP Consulting": "Consulting talent for modern delivery teams and transformation programs.",
  KiteStack: "SaaS builders scaling product and platform teams.",
  "Northstar Labs": "Product and design hiring for teams building their next growth phase.",
  SignalDesk: "Analytics and AI teams powering faster operational decisions.",
  OrbitPay: "Fintech hiring for customer, product, and implementation excellence.",
  CloudNine: "Cloud infrastructure talent for resilient engineering organizations.",
  "Vortex Ventures": "Venture-backed teams hiring builders across product, growth, and operations.",
  "Stellar SaaS": "Platform and DevOps hiring for SaaS teams that ship at pace.",
};

const CAREER_TABS = [
  { value: "current", label: "This Role" },
  { value: "other", label: "Other Openings" },
];
/* - - - - - - - - - - - - - - - - */

function LinkedInIcon({ className = "size-[14px]" }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={className}>
      <path fill="currentColor" d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.95v5.66H9.34V8.98h3.42v1.57h.05c.48-.9 1.64-1.85 3.37-1.85 3.61 0 4.27 2.38 4.27 5.47v6.28zM5.32 7.41a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.1 20.45H3.54V8.98H7.1v11.47zM22.23 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.46c.98 0 1.77-.77 1.77-1.72V1.72C24 .77 23.21 0 22.23 0z" />
    </svg>
  );
}
/* - - - - - - - - - - - - - - - - */

function formatPublishDate(value) {
  if (!value) {
    return "Recently posted";
  }

  const timestamp = new Date(value).getTime();
  if (Number.isNaN(timestamp)) {
    return "Recently posted";
  }

  return new Date(timestamp).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}
/* - - - - - - - - - - - - - - - - */

function formatWebsiteUrl(value) {
  if (!value) {
    return "";
  }

  return value.startsWith("http") ? value : `https://${value}`;
}
/* - - - - - - - - - - - - - - - - */

function slugifyCompany(value) {
  return String(value ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
/* - - - - - - - - - - - - - - - - */

function buildRoleSummary(job) {
  const company = job?.company || "the company";
  const title = job?.title || "this role";
  const domain = job?.data?.domain || "the team";

  return (
    job?.data?.jobDescription
    || `${company} is hiring a ${title} to strengthen its ${domain.toLowerCase()} function. This role is suited for candidates who can contribute quickly, communicate clearly, and take ownership in a delivery-focused team.`
  );
}
/* - - - - - - - - - - - - - - - - */

function buildResponsibilities(job) {
  const title = String(job?.title ?? "").toLowerCase();

  if (title.includes("design")) {
    return [
      "Drive design execution from discovery through delivery with product and engineering.",
      "Translate product goals into clear UX flows, screens, and interaction decisions.",
      "Improve quality and consistency across the user experience.",
    ];
  }

  if (title.includes("recruit") || title.includes("talent")) {
    return [
      "Manage candidate outreach, follow-ups, and coordination with hiring stakeholders.",
      "Keep pipeline data accurate and maintain strong candidate communication.",
      "Support screening, scheduling, and offer-readiness across active roles.",
    ];
  }

  if (title.includes("marketing") || title.includes("growth")) {
    return [
      "Own growth initiatives across campaigns, experiments, and channel execution.",
      "Translate business goals into measurable acquisition and retention work.",
      "Collaborate with product and leadership on positioning and performance insights.",
    ];
  }

  return [
    "Own delivery for scoped product and engineering work with a high-quality bar.",
    "Collaborate closely with cross-functional teammates to move work from plan to production.",
    "Bring judgment, communication clarity, and practical problem solving to day-to-day execution.",
  ];
}
/* - - - - - - - - - - - - - - - - */

function buildCandidateProfile(job) {
  const profilePoints = [
    `${job?.experience || "Relevant"} experience in a similar role.`,
    `Comfort working in a ${job?.employmentType || "full-time"} setup.`,
    `Ability to work effectively in ${job?.location || "the specified work environment"}.`,
  ];

  if (job?.data?.evaluationContext) {
    profilePoints.push(job.data.evaluationContext);
  }

  return profilePoints;
}
/* - - - - - - - - - - - - - - - - */

function getCompanyIdentity(company, clientRecord) {
  const name = company || clientRecord?.name || "Company";
  const website = clientRecord?.website ? formatWebsiteUrl(clientRecord.website) : "";
  const linkedin = `https://www.linkedin.com/company/${slugifyCompany(name)}`;
  const tagline = COMPANY_TAGLINES[name] || `${clientRecord?.industry || "Modern business"} teams hiring with clarity and speed.`;
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return {
    name,
    website,
    linkedin,
    tagline,
    initials,
  };
}
/* - - - - - - - - - - - - - - - - */

function CompanyHeader({ companyIdentity }) {
  return (
    <div className="rounded-[20px] border border-[color:color-mix(in_srgb,var(--fx-border)_72%,transparent)] bg-[linear-gradient(135deg,color-mix(in_srgb,var(--fx-primary)_10%,white_90%)_0%,var(--fx-surface)_52%,color-mix(in_srgb,var(--fx-primary)_4%,white_96%)_100%)] px-[24px] py-[24px] shadow-[0_18px_48px_rgba(15,23,42,0.06)]">
      <div className="flex flex-col gap-[16px] md:flex-row md:items-start md:justify-between">
        <div className="flex items-start gap-[16px]">
          <div className="flex h-[56px] w-[56px] items-center justify-center rounded-[16px] bg-[var(--fx-primary)] text-[18px] font-semibold text-[var(--fx-primary-foreground)] shadow-[0_12px_24px_rgba(37,99,235,0.18)]">
            {companyIdentity.initials}
          </div>
          <div className="space-y-[6px]">
            <p className="text-[12px] leading-[16px] font-medium uppercase tracking-[0.08em] text-[var(--fx-text-muted)]">Shared via Evality</p>
            <h1 className="text-[28px] leading-[34px] font-semibold text-[var(--fx-text)]">{companyIdentity.name}</h1>
            <p className="max-w-[720px] text-[14px] leading-[22px] text-[var(--fx-text-muted)]">{companyIdentity.tagline}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-[10px]">
          {companyIdentity.website ? (
            <Link
              href={companyIdentity.website}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-[8px] rounded-[10px] border border-[color:color-mix(in_srgb,var(--fx-border)_72%,transparent)] bg-[var(--fx-surface)] px-[12px] py-[9px] text-[13px] leading-[18px] text-[var(--fx-text)] hover:bg-[var(--fx-surface-hover)]"
            >
              <Globe className="size-[14px]" />
              Website
            </Link>
          ) : null}
          <Link
            href={companyIdentity.linkedin}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-[8px] rounded-[10px] border border-[color:color-mix(in_srgb,var(--fx-border)_72%,transparent)] bg-[var(--fx-surface)] px-[12px] py-[9px] text-[13px] leading-[18px] text-[var(--fx-text)] hover:bg-[var(--fx-surface-hover)]"
          >
            <LinkedInIcon className="size-[14px]" />
            LinkedIn
          </Link>
        </div>
      </div>
    </div>
  );
}
/* - - - - - - - - - - - - - - - - */

function MetaItem({ icon: Icon, label, value }) {
  return (
    <div className="rounded-[14px] border border-[color:color-mix(in_srgb,var(--fx-border)_68%,transparent)] bg-[var(--fx-surface)] px-[14px] py-[12px]">
      <div className="flex items-center gap-[8px]">
        <Icon className="size-[14px] text-[var(--fx-primary)]" />
        <span className="text-[12px] leading-[16px] text-[var(--fx-text-muted)]">{label}</span>
      </div>
      <p className="mt-[6px] text-[14px] leading-[20px] font-medium text-[var(--fx-text)]">{value}</p>
    </div>
  );
}
/* - - - - - - - - - - - - - - - - */

function DetailSection({ title, children }) {
  return (
    <section className="rounded-[18px] border border-[color:color-mix(in_srgb,var(--fx-border)_68%,transparent)] bg-[var(--fx-surface)] p-[20px] shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
      <h3 className="text-[16px] leading-[22px] font-semibold text-[var(--fx-text)]">{title}</h3>
      <div className="mt-[14px]">{children}</div>
    </section>
  );
}
/* - - - - - - - - - - - - - - - - */

function JobSharePopover({ shareUrl }) {
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      showSuccess("Job link copied");
    } catch {
      // No-op for demo route
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <FxButton variant="outline" size="sm">
          <Share2 className="size-[14px]" />
          Share
        </FxButton>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[320px] rounded-[16px] border border-[var(--fx-border)] bg-[var(--fx-surface)] p-[14px] shadow-[0_18px_48px_rgba(15,23,42,0.12)]">
        <div className="space-y-[10px]">
          <div>
            <p className="text-[14px] leading-[20px] font-medium text-[var(--fx-text)]">Share this job</p>
            <p className="text-[12px] leading-[18px] text-[var(--fx-text-muted)]">Copy this role link and send it directly.</p>
          </div>
          <div className="flex items-center gap-[8px]">
            <div className="min-w-0 flex-1 rounded-[10px] border border-[var(--fx-border)] bg-[var(--fx-bg-soft)] px-[12px] py-[10px] text-[12px] leading-[16px] text-[var(--fx-text-muted)]">
              <span className="block truncate">{shareUrl}</span>
            </div>
            <FxButton size="sm" onClick={handleCopy}>
              <Copy className="size-[14px]" />
              Copy
            </FxButton>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
/* - - - - - - - - - - - - - - - - */

function createParsedCandidateDraft(job) {
  const normalizedCompany = String(job?.company ?? "company").toLowerCase().replace(/[^a-z0-9]+/g, ".");
  const normalizedTitle = String(job?.title ?? "role").toLowerCase();
  const isDesignRole = normalizedTitle.includes("design");
  const isRecruitingRole = normalizedTitle.includes("recruit") || normalizedTitle.includes("talent");

  return {
    resumeName: isDesignRole ? "ananya-sharma-resume.pdf" : isRecruitingRole ? "rahul-varma-profile.pdf" : "sanjana-nair-resume.pdf",
    fullName: isDesignRole ? "Ananya Sharma" : isRecruitingRole ? "Rahul Varma" : "Sanjana Nair",
    email: isDesignRole ? `ananya.sharma@${normalizedCompany}.mail` : isRecruitingRole ? `rahul.varma@${normalizedCompany}.mail` : `sanjana.nair@${normalizedCompany}.mail`,
    phone: isDesignRole ? "+91 98765 43210" : isRecruitingRole ? "+91 99880 11223" : "",
    linkedInUrl: isDesignRole ? "https://linkedin.com/in/ananya-sharma" : "",
  };
}
/* - - - - - - - - - - - - - - - - */

function ApplyDialog({ job, open, onOpenChange }) {
  const [step, setStep] = useState("upload");
  const [candidateDraft, setCandidateDraft] = useState({
    resumeName: "",
    fullName: "",
    email: "",
    phone: "",
    linkedInUrl: "",
  });

  useEffect(() => {
    if (!open) {
      setStep("upload");
      setCandidateDraft({
        resumeName: "",
        fullName: "",
        email: "",
        phone: "",
        linkedInUrl: "",
      });
      return;
    }

    setStep("upload");
    setCandidateDraft(createParsedCandidateDraft(job));
  }, [job, open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[560px] rounded-[20px] border border-[var(--fx-border)] bg-[var(--fx-surface)] p-[0] shadow-[0_24px_64px_rgba(15,23,42,0.16)]">
        <div className="p-[24px]">
          <DialogHeader className="space-y-[6px]">
            <DialogTitle className="text-[20px] leading-[28px] font-semibold text-[var(--fx-text)]">Apply for {job?.title || "this role"}</DialogTitle>
            <DialogDescription className="text-[14px] leading-[22px] text-[var(--fx-text-muted)]">
              {step === "upload"
                ? "Upload your latest resume to continue."
                : "Review the details extracted from your resume before submitting your application."}
            </DialogDescription>
          </DialogHeader>

          <div className="mt-[20px] space-y-[16px]">
            {step === "upload" ? (
              <div className="rounded-[18px] border border-dashed border-[var(--fx-border)] bg-[var(--fx-bg-soft)] px-[18px] py-[24px] text-center">
                <p className="text-[15px] leading-[22px] font-medium text-[var(--fx-text)]">Upload your resume</p>
                <p className="mt-[4px] text-[13px] leading-[20px] text-[var(--fx-text-muted)]">PDF or DOCX up to 5 MB.</p>
                <div className="mt-[16px] flex justify-center">
                  <FxButton className="h-[40px]" size="sm" onClick={() => setStep("details")}>Upload</FxButton>
                </div>
              </div>
            ) : (
              <div className="space-y-[14px]">
                <div className="rounded-[14px] border border-[color:color-mix(in_srgb,var(--fx-border)_72%,transparent)] bg-[var(--fx-bg-soft)] px-[14px] py-[12px]">
                  <p className="text-[12px] leading-[16px] text-[var(--fx-text-muted)]">Resume</p>
                  <p className="mt-[4px] text-[14px] leading-[20px] font-medium text-[var(--fx-text)]">{candidateDraft.resumeName || "Uploaded resume"}</p>
                </div>

                <div className="grid gap-[14px] sm:grid-cols-2">
                  <FxInput
                    label="Full Name"
                    placeholder="Your name"
                    required
                    value={candidateDraft.fullName}
                    onChange={(event) => setCandidateDraft((current) => ({ ...current, fullName: event.target.value }))}
                  />
                  <FxInput
                    label="Email"
                    placeholder="you@example.com"
                    required
                    value={candidateDraft.email}
                    onChange={(event) => setCandidateDraft((current) => ({ ...current, email: event.target.value }))}
                  />
                  <FxInput
                    label="Phone Number"
                    placeholder="+91 98765 43210"
                    required
                    value={candidateDraft.phone}
                    onChange={(event) => setCandidateDraft((current) => ({ ...current, phone: event.target.value }))}
                  />
                  <FxInput
                    label="LinkedIn URL"
                    placeholder="https://linkedin.com/in/your-profile"
                    value={candidateDraft.linkedInUrl}
                    onChange={(event) => setCandidateDraft((current) => ({ ...current, linkedInUrl: event.target.value }))}
                  />
                </div>
              </div>
            )}
          </div>

          {step === "details" ? (
            <div className="mt-[20px] flex items-center justify-between gap-[12px] border-t border-[color:color-mix(in_srgb,var(--fx-border)_72%,transparent)] pt-[16px]">
              <FxButton
                variant="outline"
                size="sm"
                onClick={() => {
                  setStep("upload");
                }}
              >
                Back
              </FxButton>
              <FxButton
                size="sm"
                onClick={() => {
                  showSuccess("Application submitted", `${candidateDraft.fullName || "Candidate"} has applied for ${job?.title || "this role"}.`);
                  onOpenChange(false);
                }}
              >
                Complete Application
              </FxButton>
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
/* - - - - - - - - - - - - - - - - */

function OpeningCard({ job, onView }) {
  return (
    <div className="rounded-[18px] border border-[color:color-mix(in_srgb,var(--fx-border)_68%,transparent)] bg-[var(--fx-surface)] p-[18px] shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
      <div className="flex flex-col gap-[14px] md:flex-row md:items-start md:justify-between">
        <div className="space-y-[10px]">
          <div>
            <h3 className="text-[18px] leading-[24px] font-semibold text-[var(--fx-text)]">{job.title}</h3>
            <p className="mt-[4px] text-[13px] leading-[20px] text-[var(--fx-text-muted)]">Posted {formatPublishDate(job.updatedAt || job.createdAt)}</p>
          </div>
          <div className="flex flex-wrap gap-[10px]">
            <span className="rounded-[999px] bg-[var(--fx-bg-soft)] px-[10px] py-[6px] text-[12px] leading-[16px] text-[var(--fx-text)]">{job.experience || "Experience TBD"}</span>
            <span className="rounded-[999px] bg-[var(--fx-bg-soft)] px-[10px] py-[6px] text-[12px] leading-[16px] text-[var(--fx-text)]">{job.location || "Location TBD"}</span>
            <span className="rounded-[999px] bg-[var(--fx-bg-soft)] px-[10px] py-[6px] text-[12px] leading-[16px] text-[var(--fx-text)]">{job.employmentType || "Full-time"}</span>
          </div>
        </div>
        <FxButton size="sm" onClick={() => onView(job.id)}>
          View Job
        </FxButton>
      </div>
    </div>
  );
}
/* - - - - - - - - - - - - - - - - */

function CareerPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [jobs, setJobs] = useState([]);
  const [clients, setClients] = useState([]);
  const [activeTab, setActiveTab] = useState("current");
  const [applyOpen, setApplyOpen] = useState(false);
  const requestedJobId = searchParams.get("job");

  useEffect(() => {
    const demoStore = ensureDemoStore();
    const publishedJobs = (demoStore.jobs ?? [])
      .filter((job) => job.status === "Published" && !job.isArchived)
      .sort((left, right) => new Date(right.updatedAt || right.createdAt || 0).getTime() - new Date(left.updatedAt || left.createdAt || 0).getTime());

    setJobs(publishedJobs);
    setClients(demoStore.clients ?? []);
  }, []);

  const selectedJob = useMemo(() => {
    if (!jobs.length) {
      return null;
    }

    return jobs.find((job) => job.id === requestedJobId) ?? jobs.find((job) => job.company === "ThinkJS") ?? jobs[0] ?? null;
  }, [jobs, requestedJobId]);

  const companyJobs = useMemo(() => {
    if (!selectedJob) {
      return [];
    }

    return jobs.filter((job) => job.company === selectedJob.company);
  }, [jobs, selectedJob]);

  const otherOpenings = useMemo(
    () => companyJobs.filter((job) => job.id !== selectedJob?.id),
    [companyJobs, selectedJob?.id],
  );

  const selectedClient = useMemo(
    () => clients.find((client) => client.name === selectedJob?.company) ?? null,
    [clients, selectedJob?.company],
  );

  const companyIdentity = useMemo(
    () => getCompanyIdentity(selectedJob?.company, selectedClient),
    [selectedClient, selectedJob?.company],
  );

  const shareUrl = useMemo(() => {
    if (typeof window === "undefined" || !selectedJob) {
      return "";
    }

    return `${window.location.origin}/career?job=${selectedJob.id}`;
  }, [selectedJob]);

  const aboutCompanyTitle = `About ${companyIdentity.name}`;
  const companyBrief = selectedJob?.data?.companyBrief || DEFAULT_COMPANY_BRIEF;
  const responsibilities = useMemo(() => buildResponsibilities(selectedJob), [selectedJob]);
  const candidateProfile = useMemo(() => buildCandidateProfile(selectedJob), [selectedJob]);

  const handleViewJob = (jobId) => {
    setActiveTab("current");
    router.replace(`/career?job=${jobId}`, { scroll: false });
  };

  if (!selectedJob) {
    return (
      <main className="min-h-screen bg-[var(--fx-bg-soft)] px-[20px] py-[40px] text-[var(--fx-text)]">
        <div className="mx-auto max-w-[1200px] rounded-[20px] border border-[var(--fx-border)] bg-[var(--fx-surface)] p-[24px]">
          <p className="text-[18px] leading-[26px] font-semibold">No published openings found.</p>
          <p className="mt-[6px] text-[14px] leading-[22px] text-[var(--fx-text-muted)]">Seed the demo store or publish a role to preview the career portal.</p>
        </div>
      </main>
    );
  }

  return (
    <>
      <main className="min-h-screen bg-[linear-gradient(180deg,var(--fx-bg-soft)_0%,color-mix(in_srgb,var(--fx-primary)_3%,white_97%)_100%)] px-[20px] py-[28px] text-[var(--fx-text)]">
        <div className="mx-auto max-w-[1280px] space-y-[20px]">
          <CompanyHeader companyIdentity={companyIdentity} />

          <div className="rounded-[20px] border border-[color:color-mix(in_srgb,var(--fx-border)_70%,transparent)] bg-[color:color-mix(in_srgb,var(--fx-surface)_92%,white_8%)] p-[20px] shadow-[0_16px_48px_rgba(15,23,42,0.05)]">
            <div className="border-b border-[color:color-mix(in_srgb,var(--fx-border)_72%,transparent)] pb-[16px]">
              <FxTabs tabs={CAREER_TABS} value={activeTab} onValueChange={setActiveTab} variant="compact" showBorder={false} />
            </div>

            <div className="mt-[20px] grid gap-[24px] lg:grid-cols-[minmax(0,1fr)_340px]">
              <div className="min-w-0">
                {activeTab === "current" ? (
                  <div className="space-y-[18px]">
                    <div className="rounded-[20px] border border-[color:color-mix(in_srgb,var(--fx-border)_68%,transparent)] bg-[var(--fx-surface)] p-[22px] shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
                      <div className="flex flex-col gap-[18px]">
                        <div className="flex flex-col gap-[14px] md:flex-row md:items-start md:justify-between">
                          <div className="space-y-[10px]">
                            <p className="inline-flex w-fit items-center gap-[8px] rounded-[999px] bg-[var(--fx-bg-soft)] px-[10px] py-[6px] text-[12px] leading-[16px] font-medium text-[var(--fx-text)]">
                              <CheckCircle2 className="size-[14px] text-[var(--fx-primary)]" />
                              Active opening
                            </p>
                            <div>
                              <h2 className="text-[30px] leading-[36px] font-semibold text-[var(--fx-text)]">{selectedJob.title}</h2>
                              <p className="mt-[8px] max-w-[760px] text-[15px] leading-[24px] text-[var(--fx-text-muted)]">{buildRoleSummary(selectedJob)}</p>
                            </div>
                          </div>
                          <JobSharePopover shareUrl={shareUrl} />
                        </div>

                        <div className="grid gap-[12px] sm:grid-cols-2 xl:grid-cols-4">
                          <MetaItem icon={BriefcaseBusiness} label="Experience" value={selectedJob.experience || "Not specified"} />
                          <MetaItem icon={MapPin} label="Location" value={selectedJob.location || "Not specified"} />
                          <MetaItem icon={Building2} label="Employment Type" value={selectedJob.employmentType || "Full-time"} />
                          <MetaItem icon={Globe} label="Posted" value={formatPublishDate(selectedJob.updatedAt || selectedJob.createdAt)} />
                        </div>
                      </div>
                    </div>

                    <DetailSection title="Role Overview">
                      <p className="text-[14px] leading-[24px] text-[var(--fx-text-muted)]">{buildRoleSummary(selectedJob)}</p>
                    </DetailSection>

                    <DetailSection title="What You’ll Do">
                      <ul className="space-y-[10px] text-[14px] leading-[22px] text-[var(--fx-text-muted)]">
                        {responsibilities.map((item) => (
                          <li key={item} className="flex gap-[10px]">
                            <span className="mt-[8px] h-[6px] w-[6px] shrink-0 rounded-full bg-[var(--fx-primary)]" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </DetailSection>

                    <DetailSection title="Candidate Profile">
                      <ul className="space-y-[10px] text-[14px] leading-[22px] text-[var(--fx-text-muted)]">
                        {candidateProfile.map((item) => (
                          <li key={item} className="flex gap-[10px]">
                            <span className="mt-[8px] h-[6px] w-[6px] shrink-0 rounded-full bg-[var(--fx-primary)]" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </DetailSection>
                  </div>
                ) : (
                  <div className="space-y-[14px]">
                    <div className="rounded-[18px] border border-[color:color-mix(in_srgb,var(--fx-border)_68%,transparent)] bg-[var(--fx-surface)] p-[20px] shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
                      <h2 className="text-[22px] leading-[28px] font-semibold text-[var(--fx-text)]">Other openings at {companyIdentity.name}</h2>
                      <p className="mt-[6px] text-[14px] leading-[22px] text-[var(--fx-text-muted)]">
                        Explore more roles from the same company. Selecting any role loads it here without leaving the portal.
                      </p>
                    </div>

                    {otherOpenings.length ? (
                      otherOpenings.map((job) => <OpeningCard key={job.id} job={job} onView={handleViewJob} />)
                    ) : (
                      <div className="rounded-[18px] border border-dashed border-[var(--fx-border)] bg-[var(--fx-surface)] p-[24px] text-[14px] leading-[22px] text-[var(--fx-text-muted)]">
                        No other published openings are available for this company right now.
                      </div>
                    )}
                  </div>
                )}
              </div>

              <aside className="min-w-0">
                <div className="sticky top-[24px] space-y-[16px]">
                  <div className="rounded-[18px] border border-[color:color-mix(in_srgb,var(--fx-border)_70%,transparent)] bg-[var(--fx-surface)] p-[18px] shadow-[0_8px_24px_rgba(15,23,42,0.05)]">
                    <p className="text-[12px] leading-[16px] font-medium uppercase tracking-[0.08em] text-[var(--fx-text-muted)]">Apply to this opening</p>
                    <h3 className="mt-[8px] text-[18px] leading-[24px] font-semibold text-[var(--fx-text)]">{selectedJob.title}</h3>
                    <div className="mt-[14px] space-y-[10px] text-[13px] leading-[20px] text-[var(--fx-text-muted)]">
                      <div className="flex items-center justify-between gap-[12px]">
                        <span>Experience</span>
                        <span className="font-medium text-[var(--fx-text)]">{selectedJob.experience || "TBD"}</span>
                      </div>
                      <div className="flex items-center justify-between gap-[12px]">
                        <span>Location</span>
                        <span className="font-medium text-[var(--fx-text)]">{selectedJob.location || "TBD"}</span>
                      </div>
                      <div className="flex items-center justify-between gap-[12px]">
                        <span>Type</span>
                        <span className="font-medium text-[var(--fx-text)]">{selectedJob.employmentType || "Full-time"}</span>
                      </div>
                    </div>
                    <div className="mt-[16px] flex gap-[10px]">
                      <FxButton className="flex-1" onClick={() => setApplyOpen(true)}>Apply Now</FxButton>
                      <JobSharePopover shareUrl={shareUrl} />
                    </div>
                  </div>

                  <div className="rounded-[18px] border border-[color:color-mix(in_srgb,var(--fx-border)_70%,transparent)] bg-[var(--fx-surface)] p-[18px] shadow-[0_8px_24px_rgba(15,23,42,0.05)]">
                    <h3 className="text-[18px] leading-[24px] font-semibold text-[var(--fx-text)]">{aboutCompanyTitle}</h3>
                    <p className="mt-[12px] text-[14px] leading-[24px] text-[var(--fx-text-muted)]">{companyBrief}</p>

                    <div className="mt-[16px] space-y-[10px]">
                      {companyIdentity.website ? (
                        <Link
                          href={companyIdentity.website}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center justify-between gap-[12px] rounded-[12px] bg-[var(--fx-bg-soft)] px-[12px] py-[10px] text-[13px] leading-[18px] text-[var(--fx-text)] hover:bg-[var(--fx-surface-hover)]"
                        >
                          <span className="inline-flex items-center gap-[8px]">
                            <Globe className="size-[14px] text-[var(--fx-primary)]" />
                            Company website
                          </span>
                          <ExternalLink className="size-[14px] text-[var(--fx-text-muted)]" />
                        </Link>
                      ) : null}
                      <Link
                        href={companyIdentity.linkedin}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-between gap-[12px] rounded-[12px] bg-[var(--fx-bg-soft)] px-[12px] py-[10px] text-[13px] leading-[18px] text-[var(--fx-text)] hover:bg-[var(--fx-surface-hover)]"
                      >
                        <span className="inline-flex items-center gap-[8px]">
                          <LinkedInIcon className="size-[14px] text-[var(--fx-primary)]" />
                          LinkedIn
                        </span>
                        <ExternalLink className="size-[14px] text-[var(--fx-text-muted)]" />
                      </Link>
                    </div>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </div>
      </main>

      <ApplyDialog job={selectedJob} open={applyOpen} onOpenChange={setApplyOpen} />
    </>
  );
}
/* - - - - - - - - - - - - - - - - */

export default function CareerPage() {
  return (
    <Suspense
      fallback={(
        <main className="min-h-screen bg-[linear-gradient(180deg,var(--fx-bg-soft)_0%,color-mix(in_srgb,var(--fx-primary)_3%,white_97%)_100%)] px-[20px] py-[28px] text-[var(--fx-text)]">
          <div className="mx-auto max-w-[1280px] rounded-[20px] border border-[var(--fx-border)] bg-[var(--fx-surface)] p-[24px]">
            <p className="text-[16px] leading-[24px] font-medium text-[var(--fx-text)]">Loading role…</p>
          </div>
        </main>
      )}
    >
      <CareerPageContent />
    </Suspense>
  );
}
/* - - - - - - - - - - - - - - - - */
