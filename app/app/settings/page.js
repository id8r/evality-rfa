/* app/app/settings/page.js | Lightweight settings shell | Sree | 2026-06-15 */

"use client";

import { useEffect, useRef, useState } from "react";
import {
  Bell,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  Check,
  Cog,
  CreditCard,
  FileText,
  ListChecks,
  Mail,
  Plug,
  Settings2,
  Upload,
  User,
  Users,
} from "lucide-react";

import { FxButton } from "@/components/FxButton";
import { FxInput } from "@/components/FxInput";
import { FxProtectedAppPage } from "@/components/FxProtectedAppPage";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { DEMO_USER, STORAGE_KEYS, WORKSPACE_TYPES } from "@/lib/FxConstants";
import { FX_COLORS, FX_CONTROL_HEIGHT, FX_LAYOUT, FX_RADIUS, FX_TYPOGRAPHY } from "@/lib/FxTheme";
import { cn, readStoredValue, writeStoredValue } from "@/lib/FxUtils";

const SETTINGS_SECTIONS = [
  { id: "profile", label: "Profile", description: "Personal account details", icon: User },
  { id: "organization", label: "Organization", description: "Workspace identity for internal hiring", icon: Building2 },
  { id: "career-page", label: "Career Page", description: "Public application and branding", icon: Cog },
  { id: "recruiting-status", label: "Recruiting Status", description: "Default recruiting context", icon: BriefcaseBusiness },
  { id: "screening", label: "Screening Method", description: "AI screening defaults and question flow", icon: ListChecks },
  { id: "billing", label: "Billing", description: "Plan and invoices", icon: CreditCard },
  { id: "email-settings", label: "Email", description: "Outbound email defaults", icon: Mail },
  { id: "calendar", label: "Calender", description: "Calendar connection preferences", icon: CalendarDays },
  // { id: "ai-context", label: "AI Context", description: "Default recruiting context and evaluation guidance", icon: FileText },
  // { id: "scheduling", label: "Scheduling", description: "Interview scheduling defaults", icon: Settings2 },
  // { id: "notifications", label: "Notifications", description: "Recruiting alerts and digests", icon: Bell },
  // { id: "team", label: "Team", description: "People and permissions", icon: Users },
  // { id: "integrations", label: "Integrations", description: "Connected tools", icon: Plug },
];

const ROLE_OPTIONS = ["Recruiter", "Founder", "TA", "Other"];
const COMPANY_SIZE_OPTIONS = ["1-10", "11-50", "51-200", "201-500", "500+"];
const INDUSTRY_OPTIONS = ["Software", "Staffing", "Healthcare", "Fintech", "E-commerce"];
const RECRUITING_STATUS_OPTIONS = [
  { value: WORKSPACE_TYPES.MY_COMPANY, title: "Hiring for My Company", description: "Use Evality primarily for internal recruiting." },
  { value: WORKSPACE_TYPES.CLIENTS, title: "Hiring for Clients", description: "Default workflows for agency or client-facing recruiting." },
  { value: WORKSPACE_TYPES.BOTH, title: "Hiring for Both", description: "Support both internal and client hiring from the same workspace." },
];
const SCREENING_CHANNEL_OPTIONS = [
  { value: "email", title: "Email Screening", description: "Collect candidate responses through email." },
  { value: "manual", title: "Manual Screening", description: "Review and qualify candidates manually." },
  { value: "whatsapp", title: "WhatsApp Screening", description: "Run lightweight screening on WhatsApp." },
  { value: "sms", title: "SMS Screening", description: "Use short text-based screening when needed." },
  { value: "phone", title: "Phone Screening", description: "Use recruiter-led phone conversations as the default path." },
];
const PRESCREEN_OPTIONS = [
  {
    value: "cv_and_prescreen",
    title: "CV + pre-screening",
    description: "Use CV context first, then ask focused qualification questions.",
  },
  {
    value: "prescreen_only",
    title: "Pre-screening only",
    description: "Keep the flow shorter when the goal is quick qualification.",
  },
];

const SETTINGS_SAVE_BUTTON_CLASSNAME = "bg-[var(--fx-bg-soft)] hover:bg-[var(--fx-surface-hover)]";

function getScrollMetrics(element) {
  if (!element) {
    return {
      canScroll: false,
      isAtTop: true,
      isAtBottom: true,
    };
  }

  const scrollTop = element.scrollTop;
  const scrollHeight = element.scrollHeight;
  const clientHeight = element.clientHeight;
  const maxScrollTop = Math.max(0, scrollHeight - clientHeight);
  const isScrollable = maxScrollTop > 1;

  return {
    canScroll: isScrollable,
    isAtTop: scrollTop <= 1,
    isAtBottom: scrollTop >= maxScrollTop - 1,
  };
}

function SectionButton({ section, active, onClick }) {
  const Icon = section.icon;

  return (
    <button
      type="button"
      onClick={() => onClick(section.id)}
      className={cn(
        "relative grid min-h-[56px] w-full grid-cols-[20px_minmax(0,1fr)] items-center gap-[12px] rounded-[4px] px-[12px] py-[10px] text-left transition-colors",
        active
          ? "bg-[var(--fx-surface-selected)]"
          : "hover:bg-[var(--fx-surface-hover)]",
      )}
    >
      {active ? (
        <span className="absolute inset-y-0 left-0 w-[3px] bg-[var(--fx-primary)]" aria-hidden="true" />
      ) : null}
      <span className={cn(
        "inline-flex size-[20px] shrink-0 items-center justify-center",
        active ? "text-[var(--fx-primary)]" : "text-[var(--fx-text-muted)]",
      )}>
        <Icon className="size-[18px]" strokeWidth={1.8} />
      </span>
      <span className="grid min-w-0 gap-[2px] self-center">
        <span className={cn(
          "block text-[14px] font-medium leading-[20px]",
          active ? "text-[var(--fx-primary)]" : "text-[var(--fx-text)]",
        )}>{section.label}</span>
        <span className="block text-[13px] font-normal leading-[20px] text-[var(--fx-text-muted)]">{section.description}</span>
      </span>
    </button>
  );
}

function SettingsCard({ title, description, children, action = null }) {
  return (
    <section className="space-y-[20px]">
      <div className="grid gap-[16px] md:grid-cols-[minmax(0,1fr)_auto] md:items-start">
        <div className="space-y-[4px]">
          <h2 className={FX_TYPOGRAPHY.cardTitle}>{title}</h2>
          {description ? <p className={`${FX_TYPOGRAPHY.body} text-[var(--fx-text-muted)]`}>{description}</p> : null}
        </div>
        {action ? <div className="md:justify-self-end">{action}</div> : null}
      </div>
      <div className="border-t border-[color:color-mix(in_srgb,var(--fx-border)_56%,transparent)]" />
      {children}
    </section>
  );
}

function FieldLabel({ children }) {
  return <span className={`${FX_TYPOGRAPHY.fieldLabel} text-[var(--fx-text)]`}>{children}</span>;
}

function SelectField({ label, defaultValue, options }) {
  return (
    <label className="flex w-full flex-col gap-[8px]">
      <FieldLabel>{label}</FieldLabel>
      <select
        className={`${FX_CONTROL_HEIGHT.md} w-full border ${FX_COLORS.border} ${FX_RADIUS.xs} bg-[var(--fx-bg)] px-[16px] py-0 ${FX_TYPOGRAPHY.input} text-[var(--fx-text)] outline-none focus:border-[var(--fx-primary)] focus:ring-2 focus:ring-[var(--fx-primary)]/20`}
        defaultValue={defaultValue}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function OptionGrid({ options, selectedValue, onSelect, columns = "md:grid-cols-2" }) {
  return (
    <RadioGroup value={selectedValue} onValueChange={onSelect} className={cn("grid gap-[12px]", columns)}>
      {options.map((option) => {
        const active = selectedValue === option.value;
        const optionId = `option-${option.value}`;

        return (
          <label
            key={option.value}
            htmlFor={optionId}
            className={cn(
              "flex cursor-pointer items-start gap-[12px] rounded-[10px] border px-[14px] py-[14px] text-left transition-colors",
              active
                ? "border-[var(--fx-primary)] bg-[var(--fx-surface-selected)]"
                : "border-[color:color-mix(in_srgb,var(--fx-border)_72%,transparent)] bg-transparent hover:bg-[var(--fx-surface-hover)]/60",
            )}
          >
            <RadioGroupItem
              id={optionId}
              value={option.value}
              className="mt-[1px] border-[color:color-mix(in_srgb,var(--fx-border)_82%,var(--fx-text)_18%)] data-[state=checked]:border-[var(--fx-primary)]"
            />
            <span className="space-y-[2px]">
              <span className="block text-[14px] font-medium leading-[20px] text-[var(--fx-text)]">{option.title}</span>
              <span className="block text-[13px] leading-[20px] text-[var(--fx-text-muted)]">{option.description}</span>
            </span>
          </label>
        );
      })}
    </RadioGroup>
  );
}

function RecruitingStatusGroup({ options, selectedValue, onSelect }) {
  return (
    <RadioGroup
      value={selectedValue}
      onValueChange={onSelect}
      className="w-full max-w-[560px] gap-[10px]"
    >
      {options.map((option) => {
        const active = selectedValue === option.value;
        const optionId = `recruiting-status-${option.value}`;

        return (
          <label
            key={option.value}
            htmlFor={optionId}
            className={cn(
              "flex cursor-pointer items-start gap-[12px] rounded-[10px] border px-[14px] py-[11px] text-left transition-colors",
              active
                ? "border-[var(--fx-primary)] bg-[var(--fx-surface-selected)]"
                : "border-[color:color-mix(in_srgb,var(--fx-border)_72%,transparent)] bg-[var(--fx-surface)] hover:bg-[var(--fx-surface-hover)]/60",
            )}
          >
            <RadioGroupItem
              id={optionId}
              value={option.value}
              className="mt-[1px] border-[color:color-mix(in_srgb,var(--fx-border)_82%,var(--fx-text)_18%)] data-[state=checked]:border-[var(--fx-primary)]"
            />
            <span className="space-y-[2px]">
              <span className="block text-[14px] font-medium leading-[20px] text-[var(--fx-text)]">{option.title}</span>
              <span className="block text-[13px] leading-[20px] text-[var(--fx-text-muted)]">{option.description}</span>
            </span>
          </label>
        );
      })}
    </RadioGroup>
  );
}

function ChecklistItem({ children }) {
  return (
    <div className="flex items-center gap-[8px] px-[4px] py-[4px]">
      <Check className="size-[14px] shrink-0 text-[var(--fx-success)]" strokeWidth={2.5} />
      <span className={cn(FX_TYPOGRAPHY.body, "truncate text-[var(--fx-text-muted)]")}>{children}</span>
    </div>
  );
}

function DueChecklistItem({ children, onClick }) {
  if (!onClick) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-[8px] rounded-[8px] px-[4px] py-[4px] text-left transition-colors hover:bg-[var(--fx-surface-hover)]/40"
    >
      <span className="inline-flex size-[14px] shrink-0" aria-hidden="true" />
      <span className={cn(FX_TYPOGRAPHY.body, "truncate text-[var(--fx-primary)]")}>{children}</span>
      <span className={`${FX_TYPOGRAPHY.body} shrink-0 text-[var(--fx-primary)]`}>&rarr;</span>
    </button>
  );
}

function PlaceholderSection({ title, description, items = [] }) {
  return (
    <SettingsCard title={title} description={description}>
      <div className="space-y-[12px]">
        <p className={`${FX_TYPOGRAPHY.body} text-[var(--fx-text)]`}>This section is reserved for the next release.</p>
        <p className={`${FX_TYPOGRAPHY.fieldHint} text-[var(--fx-text-muted)]`}>
          The current sheet keeps the IA in place without overbuilding dynamic behavior yet.
        </p>
        {items.length ? (
          <div className="grid gap-[8px] md:grid-cols-2">
            {items.map((item) => (
              <div key={item} className="rounded-[10px] border border-[var(--fx-border)] bg-[var(--fx-surface)] px-[14px] py-[12px]">
                <div className={`${FX_TYPOGRAPHY.body} text-[var(--fx-text)]`}>{item}</div>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </SettingsCard>
  );
}

function ProfileCompletionBanner({
  onNavigate,
  profileComplete,
  organizationComplete,
  recruitingComplete,
  linkedInConnected,
  emailConnected,
  calendarConnected,
}) {
  const checklist = [
    { label: "Profile details completed", completed: profileComplete, sectionId: null },
    { label: "Organization details completed", completed: organizationComplete, sectionId: null },
    { label: "Career Page", completed: false, sectionId: "career-page" },
    { label: "Recruiting status selected", completed: recruitingComplete, sectionId: null },
    { label: "Screening Method", completed: false, sectionId: "screening" },
    { label: "Billing", completed: false, sectionId: "billing" },
    { label: "Email", completed: emailConnected, sectionId: "email-settings" },
    { label: "Calender", completed: calendarConnected, sectionId: "calendar" },
  ];
  const completedCount = checklist.filter((item) => item.completed).length;
  const percentage = Math.round((completedCount / checklist.length) * 100);

  return (
    <div className={`rounded-[16px] border ${FX_COLORS.border} bg-[var(--fx-surface-subtle)] px-[20px] py-[16px]`}>
      <div className="flex flex-col gap-[10px] lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-[6px]">
          <div className={FX_TYPOGRAPHY.cardTitle}>Complete Your Workspace Setup</div>
          <p className={`${FX_TYPOGRAPHY.body} text-[var(--fx-text-muted)]`}>
            These setup items need to be completed before the workspace is fully ready.
          </p>
        </div>
        <div className="w-full max-w-[180px] space-y-[6px]">
          <div className="h-[6px] rounded-full bg-[var(--fx-surface-hover)]">
            <div className="h-full rounded-full bg-[var(--fx-primary)]" style={{ width: `${percentage}%` }} />
          </div>
          <div className={`${FX_TYPOGRAPHY.caption} text-[var(--fx-text-muted)]`}>{completedCount}/{checklist.length} Complete</div>
        </div>
      </div>

      <div className="mt-[12px] grid gap-[4px] md:grid-cols-2">
        {checklist.map((item) => (
          item.completed ? (
            <ChecklistItem key={item.label}>{item.label}</ChecklistItem>
          ) : (
            <DueChecklistItem key={item.label} onClick={() => onNavigate(item.sectionId)}>
              {item.label}
            </DueChecklistItem>
          )
        ))}
      </div>
    </div>
  );
}

function LinkedInIcon() {
  return (
    <svg aria-hidden="true" className="size-[16px]" viewBox="0 0 24 24">
      <path
        fill="currentColor"
        d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.95v5.66H9.34V8.98h3.42v1.57h.05c.48-.9 1.64-1.85 3.37-1.85 3.61 0 4.27 2.38 4.27 5.47v6.28zM5.32 7.41a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.1 20.45H3.54V8.98H7.1v11.47zM22.23 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.46c.98 0 1.77-.77 1.77-1.72V1.72C24 .77 23.21 0 22.23 0z"
      />
    </svg>
  );
}

function SectionContent({
  sectionId,
  recruitingStatus,
  onRecruitingStatusChange,
  screeningChannel,
  onScreeningChannelChange,
  prescreenMode,
  onPrescreenModeChange,
}) {
  if (sectionId === "organization") {
    return (
      <SettingsCard
        title="Organization"
        description="This represents the Hiring for My Company settings context."
        action={<FxButton variant="secondary" size="md" className={SETTINGS_SAVE_BUTTON_CLASSNAME}>Save</FxButton>}
      >
        <div className="grid gap-[16px] md:grid-cols-2">
          <FxInput label="Company Name" defaultValue="Evality" />
          <FxInput label="Company Website" defaultValue="https://evality.ai" />
        </div>
        <div className="grid gap-[16px] md:grid-cols-2">
          <FxInput label="Company LinkedIn Page" defaultValue="https://linkedin.com/company/evality" />
          <FxInput label="Career Page" defaultValue="https://evality.ai/careers" />
        </div>
        <FxInput
          textarea
          label="About Company"
          defaultValue="Evality is building a recruiter-first workspace to make screening, candidate flow, and hiring operations easier to run."
          className="min-h-[120px]"
        />
        <div className="grid gap-[16px] md:grid-cols-2">
          <SelectField label="Company Size" defaultValue={COMPANY_SIZE_OPTIONS[1]} options={COMPANY_SIZE_OPTIONS} />
          <SelectField label="Industry" defaultValue={INDUSTRY_OPTIONS[0]} options={INDUSTRY_OPTIONS} />
        </div>
        <div className="grid gap-[16px] md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
          <FxInput label="Upload Logo" defaultValue="evality-logo.svg" />
          <FxButton variant="secondary" size="sm">
            <Upload className="size-[16px]" />
            Upload Logo
          </FxButton>
        </div>
      </SettingsCard>
    );
  }

  if (sectionId === "recruiting-status") {
    return (
      <SettingsCard
        title="Recruiting Status"
        description="Controls default recruiting workflows and available settings."
        action={<FxButton variant="secondary" size="md" className={SETTINGS_SAVE_BUTTON_CLASSNAME}>Save</FxButton>}
      >
        <RecruitingStatusGroup
          options={RECRUITING_STATUS_OPTIONS}
          selectedValue={recruitingStatus}
          onSelect={onRecruitingStatusChange}
        />
      </SettingsCard>
    );
  }

  if (sectionId === "screening") {
    return (
      <SettingsCard
        title="Screening Method"
        description="Set the default screening flow used when new roles are created."
        action={<FxButton variant="secondary" size="md" className={SETTINGS_SAVE_BUTTON_CLASSNAME}>Save</FxButton>}
      >
        <div className="space-y-[8px]">
          <h3 className={FX_TYPOGRAPHY.button}>Default Screening Channel</h3>
          <p className={`${FX_TYPOGRAPHY.fieldHint} text-[var(--fx-text-muted)]`}>
            Choose the channel that should guide new screening workflows by default.
          </p>
        </div>
        <OptionGrid
          options={SCREENING_CHANNEL_OPTIONS}
          selectedValue={screeningChannel}
          onSelect={onScreeningChannelChange}
        />

        <div className="space-y-[8px]">
          <h3 className={FX_TYPOGRAPHY.button}>Default pre-screen flow</h3>
          <p className={`${FX_TYPOGRAPHY.fieldHint} text-[var(--fx-text-muted)]`}>
            Decide whether new roles should use CV context along with pre-screening questions.
          </p>
        </div>
        <OptionGrid
          options={PRESCREEN_OPTIONS}
          selectedValue={prescreenMode}
          onSelect={onPrescreenModeChange}
        />

        <FxInput
          textarea
          label="Evaluation Context"
          defaultValue="Evaluate candidates on role-aligned skills, communication clarity, recruiter readiness, and likely interview fit."
          className="min-h-[120px]"
        />
        <p className={`${FX_TYPOGRAPHY.fieldHint} -mt-[8px] text-[var(--fx-text-muted)]`}>
          This default context guides AI-assisted screening for newly created roles.
        </p>

        <div className="space-y-[12px]">
          <div className="space-y-[4px]">
            <h3 className={FX_TYPOGRAPHY.button}>Default Candidate Pre-Screening Questions</h3>
            <p className={`${FX_TYPOGRAPHY.fieldHint} text-[var(--fx-text-muted)]`}>
              Keep these broad and recruiter-facing. New jobs can start from this default set.
            </p>
          </div>
          {[
            "What relevant experience do you have for this role?",
            "Are you comfortable with the expected notice period and work setup?",
            "What are your salary expectations for a role like this?",
          ].map((question, index) => (
            <div key={question} className={cn(
              "flex items-start gap-[12px] py-[10px]",
              index > 0 ? "border-t border-[color:color-mix(in_srgb,var(--fx-border)_38%,transparent)]" : "",
            )}>
              <span className="inline-flex shrink-0 items-center justify-center text-[13px] font-medium leading-[20px] text-[var(--fx-text-muted)]">
                {index + 1}
              </span>
              <p className={`${FX_TYPOGRAPHY.body} text-[var(--fx-text)]`}>{question}</p>
            </div>
          ))}
        </div>
      </SettingsCard>
    );
  }

  if (sectionId === "ai-context") {
    return (
      <SettingsCard
        title="AI Context"
        description="Keep the default recruiting context and evaluation guidance aligned to the role."
        action={<FxButton variant="secondary" size="md" className={SETTINGS_SAVE_BUTTON_CLASSNAME}>Save</FxButton>}
      >
        <div className="grid gap-[12px] md:grid-cols-2">
          {[
            "Default recruiting context",
            "Evaluation guidance",
            "AI screening instructions",
            "Role evaluation defaults",
          ].map((item) => (
            <div key={item} className="rounded-[10px] border border-[var(--fx-border)] bg-[var(--fx-surface)] px-[14px] py-[12px]">
              <div className={`${FX_TYPOGRAPHY.body} text-[var(--fx-text)]`}>{item}</div>
            </div>
          ))}
        </div>
      </SettingsCard>
    );
  }

  if (sectionId === "team") {
    return (
      <PlaceholderSection
        title="Team"
        description="Manage team members, permissions, and workspace access."
        items={["Members", "Roles", "Permissions", "Invitations"]}
      />
    );
  }

  if (sectionId === "email-settings") {
    return (
      <PlaceholderSection
        title="Email Settings"
        description="Set outbound email defaults, signatures, and sending rules."
        items={["Sender defaults", "Signature", "Email connection placeholder"]}
      />
    );
  }

  if (sectionId === "calendar") {
    return (
      <PlaceholderSection
        title="Calendar"
        description="Choose the calendar account and availability defaults used by recruiters."
        items={["Calendar connection placeholder", "Availability defaults"]}
      />
    );
  }

  if (sectionId === "scheduling") {
    return (
      <PlaceholderSection
        title="Scheduling"
        description="Configure interview scheduling policies and routing defaults."
        items={["Interview scheduling defaults", "Booking preferences", "Time buffers"]}
      />
    );
  }

  if (sectionId === "notifications") {
    return (
      <PlaceholderSection
        title="Notifications"
        description="Control candidate alerts, reminders, and digest frequency."
        items={["Candidate alerts", "Screening alerts", "Follow-up reminders", "Digest preferences"]}
      />
    );
  }

  if (sectionId === "billing") {
    return (
      <PlaceholderSection
        title="Billing"
        description="Review plan, invoices, and subscription changes."
        items={["Plan", "Subscription", "Invoices", "Usage"]}
      />
    );
  }

  if (sectionId === "integrations") {
    return (
      <PlaceholderSection
        title="Integrations"
        description="Connect email, calendar, messaging, and ATS tools."
        items={["Google", "Outlook", "LinkedIn", "WhatsApp", "Future integrations"]}
      />
    );
  }

  if (sectionId === "career-page") {
    return (
      <PlaceholderSection
        title="Career Page"
        description="Configure the public job application experience, branding, and career site defaults."
        items={["Career page URL", "Branding", "Public application experience"]}
      />
    );
  }

  return (
    <SettingsCard
      title="Profile"
      description="Personal details used across recruiting workflows."
      action={<FxButton variant="secondary" size="md" className={SETTINGS_SAVE_BUTTON_CLASSNAME}>Save</FxButton>}
    >
      <div className="grid gap-[16px] md:grid-cols-2">
        <FxInput label="Name" defaultValue={DEMO_USER.name} />
        <FxInput label="Email" defaultValue={DEMO_USER.email} />
      </div>
      <div className="grid gap-[16px] md:grid-cols-2">
        <FxInput label="Phone" defaultValue="+1 (415) 555-0124" />
        <div className="flex flex-col gap-[8px]">
          <FieldLabel>LinkedIn</FieldLabel>
          <div className="flex min-h-[40px] items-center gap-[12px]">
            <FxButton
              variant="secondary"
              size="md"
              className="border-[#0A66C2] bg-[#0A66C2] text-white hover:bg-[#0958A8] hover:text-white"
            >
              <LinkedInIcon />
              Connect LinkedIn
            </FxButton>
            <span className={`${FX_TYPOGRAPHY.fieldHint} text-[var(--fx-text-muted)]`}>Authenticate to pull your public profile.</span>
          </div>
        </div>
      </div>
      <SelectField label="Role" defaultValue={ROLE_OPTIONS[0]} options={ROLE_OPTIONS} />
      <FxInput
        textarea
        label="About Me"
        defaultValue="Recruiter focused on building structured screening workflows and a calm candidate experience."
        className="min-h-[120px]"
      />
    </SettingsCard>
  );
}

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState("profile");
  const [recruitingStatus, setRecruitingStatus] = useState(WORKSPACE_TYPES.MY_COMPANY);
  const [screeningChannel, setScreeningChannel] = useState("email");
  const [prescreenMode, setPrescreenMode] = useState("cv_and_prescreen");
  const [sidebarScrollState, setSidebarScrollState] = useState({
    canScroll: false,
    isAtTop: true,
    isAtBottom: true,
  });
  const sidebarScrollRef = useRef(null);

  useEffect(() => {
    const storedWorkspaceType = readStoredValue(STORAGE_KEYS.WORKSPACE_TYPE);

    if (
      storedWorkspaceType === WORKSPACE_TYPES.MY_COMPANY ||
      storedWorkspaceType === WORKSPACE_TYPES.CLIENTS ||
      storedWorkspaceType === WORKSPACE_TYPES.BOTH
    ) {
      setRecruitingStatus(storedWorkspaceType);
    }
  }, []);

  function handleRecruitingStatusChange(nextValue) {
    setRecruitingStatus(nextValue);
    writeStoredValue(STORAGE_KEYS.WORKSPACE_TYPE, nextValue);
  }

  function updateSidebarScrollState() {
    setSidebarScrollState(getScrollMetrics(sidebarScrollRef.current));
  }

  useEffect(() => {
    updateSidebarScrollState();
  }, []);

  useEffect(() => {
    function handleResize() {
      updateSidebarScrollState();
    }

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const profileCompletion = {
    profileComplete: true,
    organizationComplete: true,
    recruitingComplete: Boolean(recruitingStatus),
    linkedInConnected: false,
    emailConnected: true,
    calendarConnected: false,
  };

  return (
    <FxProtectedAppPage pageId="settings">
      <section className={`${FX_LAYOUT.contentWidthWide} flex h-full min-h-0 w-full min-w-0 flex-1 flex-col gap-[24px] overflow-hidden bg-transparent`}>
        <div className="grid h-full min-h-0 flex-1 gap-[24px] overflow-hidden lg:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="relative h-full min-h-0 overflow-hidden py-[32px]">
            <div className="fx-scrollbar-hidden h-full min-h-0 overflow-y-auto px-[4px]" ref={sidebarScrollRef} onScroll={updateSidebarScrollState}>
              <div className="space-y-[8px] pr-[4px]">
                {SETTINGS_SECTIONS.map((section) => (
                  <SectionButton
                    key={section.id}
                    section={section}
                    active={activeSection === section.id}
                    onClick={setActiveSection}
                  />
                ))}
              </div>
            </div>
            <div
              aria-hidden="true"
              className={cn(
                "pointer-events-none absolute inset-x-0 top-0 h-[24px] bg-gradient-to-b from-[var(--fx-bg)] to-transparent transition-opacity duration-150",
                sidebarScrollState.isAtTop ? "opacity-0" : "opacity-100",
              )}
            />
            <div
              aria-hidden="true"
              className={cn(
                "pointer-events-none absolute inset-x-0 bottom-0 h-[32px] bg-gradient-to-t from-[var(--fx-bg)] to-transparent transition-opacity duration-150",
                sidebarScrollState.canScroll && !sidebarScrollState.isAtBottom ? "opacity-100" : "opacity-0",
              )}
            />
          </aside>

          <main className="h-full min-h-0 min-w-0 overflow-hidden py-[32px]">
            <div className="flex h-full min-h-0 flex-col gap-[16px] overflow-hidden">
              <ProfileCompletionBanner onNavigate={setActiveSection} {...profileCompletion} />
              <div className={`flex min-h-0 flex-1 flex-col overflow-hidden rounded-[16px] border ${FX_COLORS.border} bg-[var(--fx-surface)]`}>
                <div className="fx-scrollbar-hidden min-h-0 flex-1 overflow-y-auto px-[24px] py-[32px] md:px-[32px]">
                  <SectionContent
                    sectionId={activeSection}
                    recruitingStatus={recruitingStatus}
                    onRecruitingStatusChange={handleRecruitingStatusChange}
                    screeningChannel={screeningChannel}
                    onScreeningChannelChange={setScreeningChannel}
                    prescreenMode={prescreenMode}
                    onPrescreenModeChange={setPrescreenMode}
                  />
                </div>
              </div>
            </div>
          </main>
        </div>
      </section>
    </FxProtectedAppPage>
  );
}
/* - - - - - - - - - - - - - - - - */
