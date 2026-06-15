/* app/app/settings/page.js | Lightweight settings shell | Sree | 2026-06-14 */

"use client";

import { useState } from "react";
import { Building2, CircleDot, CreditCard, ListChecks, Plug, User, Users } from "lucide-react";

import { FxButton } from "@/components/FxButton";
import { FxInput } from "@/components/FxInput";
import { FxProtectedAppPage } from "@/components/FxProtectedAppPage";
import { FX_COLORS, FX_LAYOUT, FX_RADIUS, FX_TYPOGRAPHY } from "@/lib/FxTheme";
import { cn } from "@/lib/FxUtils";

const SETTINGS_SECTIONS = [
  { id: "profile", label: "Profile", description: "Personal account details", icon: User },
  { id: "organization", label: "Organization", description: "Workspace identity and hiring mode", icon: Building2 },
  { id: "team", label: "Team", description: "People and roles", icon: Users },
  { id: "screening", label: "Screening Method", description: "AI screening defaults and question flow", icon: ListChecks },
  { id: "integrations", label: "Integrations", description: "Connected tools", icon: Plug },
  { id: "billing", label: "Billing", description: "Plan and invoices", icon: CreditCard },
];

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

function SectionContent({ sectionId }) {
  if (sectionId === "organization") {
    return (
      <SettingsCard
        title="Organization"
        description="Core workspace identity, hiring mode, and public-facing brand defaults."
        action={<FxButton variant="secondary" size="sm">Save</FxButton>}
      >
        <div className="grid gap-[16px] md:grid-cols-2">
          <FxInput label="Organization Name" defaultValue="Evality" />
          <FxInput label="Workspace Slug" defaultValue="evality" />
        </div>
        <label className="flex w-full flex-col gap-[8px]">
          <span className={`${FX_TYPOGRAPHY.fieldLabel} text-[var(--fx-text)]`}>Hiring Mode</span>
          <select
            className={`min-h-[40px] w-full border ${FX_COLORS.border} ${FX_RADIUS.xs} bg-[var(--fx-bg)] px-[16px] py-[8px] ${FX_TYPOGRAPHY.input} text-[var(--fx-text)] outline-none focus:border-[var(--fx-primary)] focus:ring-2 focus:ring-[var(--fx-primary)]/20`}
            defaultValue="both"
          >
            <option value="my_company">My Company</option>
            <option value="clients">Clients</option>
            <option value="both">Both</option>
          </select>
        </label>
        <div className="grid gap-[16px] md:grid-cols-2">
          <FxInput label="Career Page URL" defaultValue="evality.ai/careers" />
          <FxInput label="Primary Color" defaultValue="#2563eb" />
        </div>
      </SettingsCard>
    );
  }

  if (sectionId === "team") {
    return (
      <SettingsCard
        title="Team"
        description="Manage the small set of people who keep the workspace moving."
        action={<FxButton variant="secondary" size="sm">Invite</FxButton>}
      >
        <div className="space-y-[12px]">
          {[
            ["John Doe", "Owner"],
            ["Ayush", "Recruiter"],
            ["Priya", "Hiring Manager"],
          ].map(([name, role]) => (
            <div key={name} className="flex items-center justify-between rounded-[12px] border border-[var(--fx-border)] px-[16px] py-[12px]">
              <div>
                <p className={FX_TYPOGRAPHY.button}>{name}</p>
                <p className={`${FX_TYPOGRAPHY.fieldHint} text-[var(--fx-text-muted)]`}>{role}</p>
              </div>
              <span className="rounded-full bg-[var(--fx-surface-selected)] px-[10px] py-[4px] text-[12px] font-medium text-[var(--fx-primary)]">
                Active
              </span>
            </div>
          ))}
        </div>
      </SettingsCard>
    );
  }

  if (sectionId === "screening") {
    return (
      <SettingsCard
        title="Screening Method"
        description="Set the default screening flow used when new roles are created."
        action={<FxButton variant="secondary" size="sm">Save</FxButton>}
      >
        <div className="grid gap-[12px] md:grid-cols-2">
          {[
            {
              title: "CV + pre-screening",
              description: "Use CV context first, then ask focused qualification questions.",
            },
            {
              title: "Pre-screening only",
              description: "Keep the flow shorter when the goal is quick qualification.",
            },
          ].map((option, index) => (
            <button
              key={option.title}
              type="button"
              className={cn(
                "flex items-start gap-[12px] rounded-[10px] border px-[14px] py-[14px] text-left transition-colors",
                index === 0
                  ? "border-[var(--fx-primary)] bg-[var(--fx-surface-selected)]"
                  : "border-[color:color-mix(in_srgb,var(--fx-border)_72%,transparent)] bg-transparent hover:bg-[var(--fx-surface-hover)]/60",
              )}
            >
              <span className={cn(
                "mt-[2px] inline-flex size-[20px] shrink-0 items-center justify-center rounded-full",
                index === 0 ? "text-[var(--fx-primary)]" : "text-[var(--fx-text-muted)]",
              )}>
                <CircleDot className="size-[18px]" strokeWidth={1.8} />
              </span>
              <span className="space-y-[2px]">
                <span className="block text-[14px] font-medium leading-[20px] text-[var(--fx-text)]">{option.title}</span>
                <span className="block text-[13px] leading-[20px] text-[var(--fx-text-muted)]">{option.description}</span>
              </span>
            </button>
          ))}
        </div>

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

  if (sectionId === "billing") {
    return (
      <SettingsCard title="Billing" description="Current billing surface for the workspace.">
        <div className="grid gap-[16px] md:grid-cols-2">
          <div className="rounded-[12px] border border-[var(--fx-border)] bg-[var(--fx-bg)] p-[16px]">
            <p className={FX_TYPOGRAPHY.button}>Starter</p>
            <p className={`${FX_TYPOGRAPHY.body} text-[var(--fx-text-muted)]`}>Enough to configure jobs, candidates, and AI-assisted screening.</p>
          </div>
          <div className="rounded-[12px] border border-[var(--fx-border)] bg-[var(--fx-bg)] p-[16px]">
            <p className={FX_TYPOGRAPHY.button}>Next renewal</p>
            <p className={`${FX_TYPOGRAPHY.body} text-[var(--fx-text-muted)]`}>June 30, 2026</p>
          </div>
        </div>
      </SettingsCard>
    );
  }

  if (sectionId === "integrations") {
    return (
      <SettingsCard title="Integrations" description="Keep this lean for v1.">
        <div className="space-y-[12px]">
          {[
            ["Email", "Connected"],
            ["Calendar", "Not connected"],
            ["WhatsApp", "Connected"],
          ].map(([name, status]) => (
            <div key={name} className="flex items-center justify-between rounded-[12px] border border-[var(--fx-border)] px-[16px] py-[12px]">
              <div>
                <p className={FX_TYPOGRAPHY.button}>{name}</p>
                <p className={`${FX_TYPOGRAPHY.fieldHint} text-[var(--fx-text-muted)]`}>{status}</p>
              </div>
              <FxButton variant="secondary" size="sm">{status === "Connected" ? "Manage" : "Connect"}</FxButton>
            </div>
          ))}
        </div>
      </SettingsCard>
    );
  }

  return (
    <SettingsCard
      title="Profile"
      description="Account details shown to the rest of the workspace."
      action={<FxButton variant="secondary" size="sm">Save</FxButton>}
    >
      <div className="grid gap-[16px] md:grid-cols-2">
        <FxInput label="Name" defaultValue="John Doe" />
        <FxInput label="Email" defaultValue="jdoe@evality.ai" />
      </div>
      <FxInput label="Role" defaultValue="Recruiter" />
    </SettingsCard>
  );
}

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState("profile");

  return (
    <FxProtectedAppPage pageId="settings">
      <section className={`${FX_LAYOUT.contentWidthWide} flex h-full min-h-0 w-full min-w-0 flex-1 flex-col gap-[24px]`}>
        <div className="grid min-h-0 gap-[24px] lg:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="px-[4px]">
            <div className="space-y-[8px]">
              {SETTINGS_SECTIONS.map((section) => (
                <SectionButton
                  key={section.id}
                  section={section}
                  active={activeSection === section.id}
                  onClick={setActiveSection}
                />
              ))}
            </div>
          </aside>

          <main className="min-w-0 py-[4px]">
            <div className={`rounded-[16px] border ${FX_COLORS.border} bg-[var(--fx-surface)] px-[24px] py-[24px] shadow-sm md:px-[32px] md:py-[28px]`}>
              <SectionContent sectionId={activeSection} />
            </div>
          </main>
        </div>
      </section>
    </FxProtectedAppPage>
  );
}
