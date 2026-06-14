/* app/app/settings/page.js | Lightweight settings shell | Sree | 2026-06-14 */

"use client";

import { useState } from "react";
import { Building2, CreditCard, Plug, User, Users } from "lucide-react";

import { FxButton } from "@/components/FxButton";
import { FxInput } from "@/components/FxInput";
import { FxProtectedAppPage } from "@/components/FxProtectedAppPage";
import { getPageMeta } from "@/lib/FxConstants";
import { FX_COLORS, FX_LAYOUT, FX_RADIUS, FX_TYPOGRAPHY } from "@/lib/FxTheme";
import { cn } from "@/lib/FxUtils";

const SETTINGS_SECTIONS = [
  { id: "profile", label: "Profile", description: "Personal account details", icon: User },
  { id: "organization", label: "Organization", description: "Workspace identity and hiring mode", icon: Building2 },
  { id: "team", label: "Team", description: "People and roles", icon: Users },
  { id: "billing", label: "Billing", description: "Plan and invoices", icon: CreditCard },
  { id: "integrations", label: "Integrations", description: "Connected tools", icon: Plug },
];

function SectionButton({ section, active, onClick }) {
  const Icon = section.icon;

  return (
    <button
      type="button"
      onClick={() => onClick(section.id)}
      className={cn(
        "flex w-full items-start gap-[12px] rounded-[8px] border px-[12px] py-[8px] text-left transition-colors",
        active
          ? "border-[var(--fx-primary)] bg-[var(--fx-surface-selected)]"
          : `${FX_COLORS.border} bg-[var(--fx-surface)] hover:bg-[var(--fx-surface-hover)]`,
      )}
    >
      <span className="mt-[2px] inline-flex size-[32px] shrink-0 items-center justify-center rounded-[10px] bg-[var(--fx-bg-soft)] text-[var(--fx-primary)]">
        <Icon className="size-[16px]" />
      </span>
      <span className="min-w-0">
        <span className={`${FX_TYPOGRAPHY.button} block text-[var(--fx-text)]`}>{section.label}</span>
        <span className={`${FX_TYPOGRAPHY.fieldHint} block text-[var(--fx-text-muted)]`}>{section.description}</span>
      </span>
    </button>
  );
}

function SettingsCard({ title, description, children, action = null }) {
  return (
    <section className={`space-y-[16px] rounded-[16px] border ${FX_COLORS.border} bg-[var(--fx-surface)] p-[24px]`}>
      <div className="flex items-start justify-between gap-[16px]">
        <div className="space-y-[4px]">
          <h2 className={FX_TYPOGRAPHY.cardTitle}>{title}</h2>
          {description ? <p className={`${FX_TYPOGRAPHY.body} text-[var(--fx-text-muted)]`}>{description}</p> : null}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function SectionContent({ sectionId }) {
  if (sectionId === "organization") {
    return (
      <div className="space-y-[16px]">
        <SettingsCard
          title="Organization Details"
          description="Core workspace identity used across hiring surfaces."
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
        </SettingsCard>

        <SettingsCard title="Career Page" description="Keep the public brand surface simple.">
          <div className="grid gap-[16px] md:grid-cols-2">
            <FxInput label="Career Page URL" defaultValue="evality.ai/careers" />
            <FxInput label="Primary Color" defaultValue="#2563eb" />
          </div>
        </SettingsCard>
      </div>
    );
  }

  if (sectionId === "team") {
    return (
      <div className="space-y-[16px]">
        <SettingsCard
          title="Team Members"
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
      </div>
    );
  }

  if (sectionId === "billing") {
    return (
      <div className="space-y-[16px]">
        <SettingsCard title="Plan" description="Current billing surface for the workspace.">
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
      </div>
    );
  }

  if (sectionId === "integrations") {
    return (
      <div className="space-y-[16px]">
        <SettingsCard title="Connected Tools" description="Keep this lean for v1.">
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
      </div>
    );
  }

  return (
    <div className="space-y-[16px]">
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
    </div>
  );
}

export default function SettingsPage() {
  const pageMeta = getPageMeta("settings");
  const [activeSection, setActiveSection] = useState("profile");

  return (
    <FxProtectedAppPage pageId="settings">
      <section className={`${FX_LAYOUT.contentWidthWide} flex h-full min-h-0 w-full min-w-0 flex-1 flex-col gap-[24px]`}>
        <div className="space-y-[6px]">
          <p className={`${FX_TYPOGRAPHY.fieldHint} text-[var(--fx-text-muted)]`}>Settings</p>
          <h1 className={FX_TYPOGRAPHY.pageTitle}>{pageMeta?.pageTitle ?? "Settings"}</h1>
          <p className={`${FX_TYPOGRAPHY.body} text-[var(--fx-text-muted)]`}>
            Lightweight account, organization, and integration controls.
          </p>
        </div>

        <div className="grid min-h-0 gap-[24px] lg:grid-cols-[280px_minmax(0,1fr)]">
          <aside className={`rounded-[16px] border ${FX_COLORS.border} bg-[var(--fx-bg-soft)] p-[8px]`}>
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

          <main className="min-w-0">
            <SectionContent sectionId={activeSection} />
          </main>
        </div>
      </section>
    </FxProtectedAppPage>
  );
}
