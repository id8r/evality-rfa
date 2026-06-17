/* app/app/settings/page.js | Lightweight settings shell | Sree | 2026-06-15 */

"use client";

import { useEffect, useRef, useState } from "react";
import {
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  Check,
  Cog,
  CreditCard,
  ListChecks,
  Mail,
  Upload,
  User,
} from "lucide-react";

import { FxButton } from "@/components/FxButton";
import { FxMultiSelectInput } from "@/components/FxMultiSelectInput";
import { FxInput } from "@/components/FxInput";
import { FxFieldLabel } from "@/components/FxFieldState";
import { FxProtectedAppPage } from "@/components/FxProtectedAppPage";
import { FxSelect } from "@/components/FxSelect";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { DEMO_USER, STORAGE_KEYS, WORKSPACE_TYPES } from "@/lib/FxConstants";
import { FX_COLORS, FX_LAYOUT, FX_TYPOGRAPHY } from "@/lib/FxTheme";
import { cn, readStoredJSON, readStoredValue, writeStoredJSON, writeStoredValue } from "@/lib/FxUtils";

const SETTINGS_SECTIONS = [
  { id: "profile", label: "Profile", description: "Personal account details", icon: User },
  { id: "organization", label: "Organization", description: "Workspace identity for internal hiring", icon: Building2 },
  { id: "career-page", label: "Career Page", description: "Public application and branding", icon: Cog },
  { id: "recruiting-status", label: "Recruiting Status", description: "Default recruiting context", icon: BriefcaseBusiness },
  { id: "screening", label: "Screening Method", description: "AI screening defaults and question flow", icon: ListChecks },
  { id: "billing", label: "Billing", description: "Plan and invoices", icon: CreditCard },
  { id: "email-settings", label: "Email", description: "Connected mailboxes and sender defaults", icon: Mail },
  { id: "calendar", label: "Calender", description: "Calendar connection preferences", icon: CalendarDays },
  // { id: "ai-context", label: "AI Context", description: "Default recruiting context and evaluation guidance", icon: FileText },
  // { id: "scheduling", label: "Scheduling", description: "Interview scheduling defaults", icon: Settings2 },
  // { id: "notifications", label: "Notifications", description: "Recruiting alerts and digests", icon: Bell },
  // { id: "team", label: "Team", description: "People and permissions", icon: Users },
  // { id: "integrations", label: "Integrations", description: "Connected tools", icon: Plug },
];

const ROLE_OPTIONS = ["Recruiter", "Founder", "TA", "Other"];
const COMPANY_SIZE_OPTIONS = ["1-10", "11-50", "51-200", "201-500", "500+"];
const INDUSTRY_SUGGESTIONS = [
  "Staffing",
  "Recruitment",
  "Software",
  "SaaS",
  "AI",
  "Healthcare",
  "Fintech",
  "E-Commerce",
  "Manufacturing",
  "Consulting",
  "Education",
  "Real Estate",
];
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
const TIMEZONE_OPTIONS = [
  "(UTC+05:30) Asia/Kolkata",
  "(UTC+00:00) UTC",
  "(UTC-05:00) America/New_York",
  "(UTC+01:00) Europe/London",
  "(UTC+08:00) Asia/Singapore",
];
const DEFAULT_WEEKLY_AVAILABILITY = [
  { day: "Mon", enabled: true, start: "09:00", end: "18:00" },
  { day: "Tue", enabled: true, start: "09:00", end: "18:00" },
  { day: "Wed", enabled: true, start: "09:00", end: "18:00" },
  { day: "Thu", enabled: true, start: "09:00", end: "18:00" },
  { day: "Fri", enabled: true, start: "09:00", end: "18:00" },
  { day: "Sat", enabled: false, start: "09:00", end: "18:00" },
  { day: "Sun", enabled: false, start: "09:00", end: "18:00" },
];

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
          <h2 className={`${FX_TYPOGRAPHY.cardTitle} text-[var(--fx-text-muted)]`}>{title}</h2>
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
  return <FxFieldLabel>{children}</FxFieldLabel>;
}

function SelectField({ label, defaultValue, options }) {
  return <FxSelect label={label} value={defaultValue} onChange={() => {}} options={options} />;
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
      <span className="truncate text-[15px] leading-[22px] font-normal text-[var(--fx-text-muted)]">{children}</span>
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
      <span className="truncate text-[15px] leading-[22px] font-normal text-[var(--fx-primary)]">{children}</span>
      <span className="shrink-0 text-[15px] leading-[22px] font-normal text-[var(--fx-primary)]">&rarr;</span>
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

function ProviderLogo({ provider }) {
  if (provider === "gmail") {
    return <img alt="" src="/images/providers/gmail.svg" className="size-[48px] shrink-0 object-contain" />;
  }

  if (provider === "outlook") {
    return <img alt="" src="/images/providers/outlook.svg" className="size-[48px] shrink-0 object-contain" />;
  }

  if (provider === "google-calendar") {
    return <img alt="" src="/images/providers/google-calendar.svg" className="size-[48px] shrink-0 object-contain" />;
  }

  if (provider === "outlook-calendar") {
    return <img alt="" src="/images/providers/outlook-calendar.svg" className="size-[48px] shrink-0 object-contain" />;
  }

  return <Mail className="size-[48px] text-[var(--fx-text-muted)]" strokeWidth={1.6} />;
}

function ProviderBadge({ children, connected = false }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-[10px] py-[4px] text-[12px] font-medium leading-[16px]",
        connected
          ? "bg-[var(--fx-surface-selected)] text-[var(--fx-primary)]"
          : "bg-[var(--fx-surface-subtle)] text-[var(--fx-text-muted)]",
      )}
    >
      {children}
    </span>
  );
}

function ConnectionProviderCard({
  title,
  subtitle,
  provider,
  connected,
  connecting,
  onConnect,
  buttonLabel,
  bodyText,
  comingSoon = false,
  statusLabel = null,
  comingSoonText = "More providers will come later. Gmail and Microsoft 365 are the primary options for V1.",
}) {
  const actionLabel = connected ? "Connected" : buttonLabel;

  return (
    <div className="rounded-[12px] border border-[var(--fx-border)] bg-[var(--fx-surface)] p-[16px]">
      <div className="flex items-start justify-between gap-[12px]">
        <div className="flex min-w-0 items-center gap-[12px]">
          <ProviderLogo provider={provider} />
          <div className="min-w-0 space-y-[2px]">
            <div className={`${FX_TYPOGRAPHY.cardTitle} truncate text-[var(--fx-text)]`}>{title}</div>
            <div className={`${FX_TYPOGRAPHY.fieldHint} text-[var(--fx-text-muted)]`}>{subtitle}</div>
          </div>
        </div>
        <ProviderBadge connected={connected}>{statusLabel ?? (connected ? "Connected" : "Not connected")}</ProviderBadge>
      </div>

      <div className="mt-[16px] flex flex-col gap-[12px] sm:flex-row sm:items-center sm:justify-between">
        <p className={`${FX_TYPOGRAPHY.fieldHint} max-w-[36ch] text-[var(--fx-text-muted)]`}>
          {comingSoon
            ? comingSoonText
            : bodyText ?? (connected
              ? "This account is ready for recruiting conversations in Evality."
              : "Connect this account to route recruiting work through Evality.")}
        </p>
        {comingSoon ? (
          <FxButton variant="secondary" size="md" disabled className="h-[40px] shrink-0">
            Coming Soon
          </FxButton>
        ) : (
          <FxButton
            variant="secondary"
            size="md"
            className="h-[40px] shrink-0"
            disabled={connected || connecting}
            onClick={onConnect}
          >
            {connecting ? "Connecting..." : actionLabel}
          </FxButton>
        )}
      </div>
    </div>
  );
}

function PreferenceRow({ label, description, checked, onCheckedChange }) {
  return (
    <label className="flex cursor-pointer items-start gap-[12px] rounded-[10px] border border-[var(--fx-border)] bg-[var(--fx-surface)] px-[14px] py-[12px]">
      <Checkbox checked={checked} onCheckedChange={onCheckedChange} />
      <span className="space-y-[2px]">
        <span className={`${FX_TYPOGRAPHY.body} block text-[var(--fx-text)]`}>{label}</span>
        <span className={`${FX_TYPOGRAPHY.fieldHint} block text-[var(--fx-text-muted)]`}>{description}</span>
      </span>
    </label>
  );
}

function ProviderConnectionSection({
  sectionTitle,
  sectionDescription,
  providerConnections,
  connectingProvider,
  onConnectProvider,
  primaryAccount,
  onPrimaryAccountChange,
  primaryAccountLabel,
  primaryAccountPlaceholder,
  primaryAccountOptions,
  secondaryTitle,
  secondaryDescription,
  secondaryPlaceholderLabel,
  secondaryActionLabel,
  secondaryActionDescription,
  secondaryPreferences,
  onSecondaryPreferenceChange,
  providerCards,
}) {
  return (
    <div className="space-y-[24px]">
      <SettingsCard
        title={sectionTitle}
        description={sectionDescription}
      >
        <div className="grid gap-[12px] lg:grid-cols-2">
          {providerCards.map((card) => (
            <div key={card.id} className={card.fullWidth ? "lg:col-span-2" : ""}>
              <ConnectionProviderCard
                title={card.title}
                subtitle={card.subtitle}
                provider={card.provider}
                connected={providerConnections[card.id]}
                connecting={connectingProvider === card.id}
                onConnect={() => onConnectProvider(card.id)}
                buttonLabel={card.buttonLabel}
                bodyText={card.bodyText}
                comingSoon={card.comingSoon}
                statusLabel={card.statusLabel}
              />
            </div>
          ))}
        </div>
      </SettingsCard>

      <SettingsCard
        title={secondaryTitle}
        description={secondaryDescription}
      >
        <div className="grid gap-[16px] md:grid-cols-2">
          <FxSelect
            label={primaryAccountLabel}
            value={primaryAccount}
            onChange={onPrimaryAccountChange}
            options={primaryAccountOptions}
            placeholder={primaryAccountPlaceholder}
            disabled={!primaryAccountOptions.length}
          />
          <FxInput
            textarea
            label={secondaryPlaceholderLabel}
            defaultValue={secondaryActionDescription}
            className="min-h-[120px]"
          />
        </div>

        <div className="space-y-[8px]">
          <FieldLabel>{secondaryActionLabel}</FieldLabel>
          <div className="grid gap-[8px]">
            {secondaryPreferences.map((preference) => (
              <PreferenceRow
                key={preference.key}
                label={preference.label}
                description={preference.description}
                checked={Boolean(preference.checked)}
                onCheckedChange={(checked) => onSecondaryPreferenceChange(preference.key, Boolean(checked))}
              />
            ))}
          </div>
        </div>
      </SettingsCard>
    </div>
  );
}

function SenderPreviewCard({ senderLabel = "John Doe <john@company.com>", replyTo = "john@company.com" }) {
  return (
    <SettingsCard
      title="Sender Preview"
      description="This is how Evality will present outbound recruiting mail."
    >
      <div className="space-y-[12px] rounded-[12px] border border-[var(--fx-border)] bg-[var(--fx-surface-subtle)] px-[16px] py-[14px]">
        <div className="flex items-start gap-[12px]">
          <span className={`${FX_TYPOGRAPHY.fieldLabel} min-w-[72px] text-[var(--fx-text-muted)]`}>From:</span>
          <span className={`${FX_TYPOGRAPHY.body} text-[var(--fx-text)]`}>{senderLabel}</span>
        </div>
        <div className="flex items-start gap-[12px]">
          <span className={`${FX_TYPOGRAPHY.fieldLabel} min-w-[72px] text-[var(--fx-text-muted)]`}>Reply-To:</span>
          <span className={`${FX_TYPOGRAPHY.body} text-[var(--fx-text)]`}>{replyTo}</span>
        </div>
      </div>
    </SettingsCard>
  );
}

function WeeklyAvailabilityRow({ day, enabled, start, end, onToggle, onChange }) {
  return (
    <div className="rounded-[10px] border border-[var(--fx-border)] bg-[var(--fx-surface)] px-[12px] py-[10px]">
      <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-[8px]">
        <Checkbox checked={enabled} onCheckedChange={(checked) => onToggle(Boolean(checked))} />
        <div className="min-w-0">
          <div className="flex items-center gap-[8px]">
            <div className={`${FX_TYPOGRAPHY.body} min-w-[40px] text-left text-[var(--fx-text)]`}>{day}</div>
            {!enabled ? (
              <span className="inline-flex rounded-full bg-[var(--fx-surface-subtle)] px-[8px] py-[3px] text-[12px] leading-[18px] text-[var(--fx-text-muted)]">
                Unavailable
              </span>
            ) : null}
          </div>
        </div>
        {enabled ? (
          <div className="flex min-w-0 items-center gap-[6px]">
            <FxInput
              label=""
              value={start}
              onChange={(event) => onChange("start", event?.target?.value ?? "")}
              stackClassName="gap-0"
              className="h-[34px] w-[64px] px-[8px] text-[13px]"
            />
            <span className="text-[13px] leading-[20px] text-[var(--fx-text-muted)]">-</span>
            <FxInput
              label=""
              value={end}
              onChange={(event) => onChange("end", event?.target?.value ?? "")}
              stackClassName="gap-0"
              className="h-[34px] w-[64px] px-[8px] text-[13px]"
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}

function CalendarSettingsSection({
  providerConnections,
  connectingProvider,
  onConnectProvider,
  calendarDefaultAccount,
  onCalendarDefaultAccountChange,
  calendarTimezone,
  onCalendarTimezoneChange,
  calendarWeeklyAvailability,
  onCalendarWeeklyAvailabilityChange,
  calendarPreferences,
  onCalendarPreferenceChange,
}) {
  const hasConnectedCalendar = Boolean(providerConnections.googleCalendar || providerConnections.outlookCalendar);

  return (
    <div className="space-y-[24px]">
      <SettingsCard
        title="Calendar Connections"
        description="Connect the calendar Evality should use for interview booking and availability."
      >
        <div className="grid gap-[12px] lg:grid-cols-2">
          <ConnectionProviderCard
            title="Google Calendar"
            subtitle="Google Workspace"
            provider="google-calendar"
            connected={providerConnections.googleCalendar}
            connecting={connectingProvider === "googleCalendar"}
            onConnect={() => onConnectProvider("googleCalendar")}
            buttonLabel="Connect"
            bodyText="Connect Google Calendar so interview booking stays aligned with recruiter availability."
          />
          <ConnectionProviderCard
            title="Microsoft Outlook"
            subtitle="Microsoft 365"
            provider="outlook-calendar"
            connected={providerConnections.outlookCalendar}
            connecting={connectingProvider === "outlookCalendar"}
            onConnect={() => onConnectProvider("outlookCalendar")}
            buttonLabel="Connect"
            bodyText="Connect Outlook Calendar for calendar-aware interview scheduling inside Evality."
          />
        </div>
        {hasConnectedCalendar ? (
          <div className="mt-[16px] grid gap-[16px] md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <FxSelect
              label="Default calendar account"
              value={calendarDefaultAccount}
              onChange={onCalendarDefaultAccountChange}
              options={[
                providerConnections.googleCalendar ? { value: "googleCalendar", label: "Google Calendar" } : null,
                providerConnections.outlookCalendar ? { value: "outlookCalendar", label: "Microsoft Outlook" } : null,
              ].filter(Boolean)}
              placeholder="Select a calendar"
            />
            <div className="rounded-[10px] border border-[var(--fx-border)] bg-[var(--fx-surface-subtle)] px-[14px] py-[12px]">
              <div className={`${FX_TYPOGRAPHY.fieldLabel} text-[var(--fx-text-muted)]`}>Connected calendar</div>
              <div className={`${FX_TYPOGRAPHY.body} mt-[4px] text-[var(--fx-text)]`}>
                {providerConnections.googleCalendar
                  ? "Google Calendar"
                  : providerConnections.outlookCalendar
                    ? "Microsoft Outlook"
                    : "Not connected"}
              </div>
            </div>
          </div>
        ) : null}
      </SettingsCard>

      <SettingsCard title="Timezone" description="Use the timezone recruiters work in most often.">
        <div className="max-w-[420px]">
          <FxSelect
            label="Workspace timezone"
            value={calendarTimezone}
            onChange={onCalendarTimezoneChange}
            options={TIMEZONE_OPTIONS}
            placeholder="Select a timezone"
          />
        </div>
      </SettingsCard>

      <SettingsCard title="Weekly Availability" description="Set the hours recruiters are generally available for scheduling.">
        <div className="grid gap-[8px] md:grid-cols-4">
          {calendarWeeklyAvailability.map((row) => (
            <WeeklyAvailabilityRow
              key={row.day}
              {...row}
              onToggle={(nextEnabled) => onCalendarWeeklyAvailabilityChange(row.day, { enabled: nextEnabled })}
              onChange={(field, value) => onCalendarWeeklyAvailabilityChange(row.day, { [field]: value })}
            />
          ))}
        </div>
      </SettingsCard>

      <SettingsCard title="Scheduling Preferences" description="Control how calendar booking behaves for recruiters and candidates.">
        <div className="grid gap-[8px]">
          {[
            {
              key: "blockBusyTime",
              label: "Block busy time automatically",
              description: "Prevents recruiters from being scheduled over existing calendar events.",
              checked: calendarPreferences.blockBusyTime,
            },
            {
              key: "preventDoubleBooking",
              label: "Prevent double booking",
              description: "Keeps interview slots from being reused by overlapping events.",
              checked: calendarPreferences.preventDoubleBooking,
            },
            {
              key: "useConnectedCalendar",
              label: "Use connected calendar for interview scheduling",
              description: "Keeps booking actions tied to the selected calendar account.",
              checked: calendarPreferences.useConnectedCalendar,
            },
            {
              key: "sendSchedulingReminders",
              label: "Send scheduling reminders",
              description: "Keeps interview reminders visible without extra manual follow-up.",
              checked: calendarPreferences.sendSchedulingReminders,
            },
          ].map((preference) => (
            <PreferenceRow
              key={preference.key}
              label={preference.label}
              description={preference.description}
              checked={Boolean(preference.checked)}
              onCheckedChange={(checked) => onCalendarPreferenceChange(preference.key, Boolean(checked))}
            />
          ))}
        </div>
      </SettingsCard>
    </div>
  );
}

function EmailSettingsSection({
  providerConnections,
  connectingProvider,
  onConnectProvider,
  primaryAccount,
  onPrimaryAccountChange,
  emailCommunicationPreferences,
  onEmailPreferenceChange,
}) {
  const connectedMailboxOptions = [
    providerConnections.gmail ? { value: "gmail", label: "Gmail" } : null,
    providerConnections.outlook ? { value: "outlook", label: "Microsoft Outlook" } : null,
  ].filter(Boolean);
  const hasConnectedMailbox = connectedMailboxOptions.length > 0;
  const senderPreview = hasConnectedMailbox
    ? primaryAccount === "outlook"
      ? { senderLabel: "John Doe <john@company.com>", replyTo: "john@company.com" }
      : { senderLabel: "John Doe <john@company.com>", replyTo: "john@company.com" }
    : { senderLabel: "Not set", replyTo: "Not set" };

  return (
    <div className="space-y-[24px]">
      <SettingsCard
        title="Connected Mailboxes"
        description="Connect the mailbox Evality should use for recruiting communication."
      >
        <div className="grid gap-[12px] lg:grid-cols-2">
          <ConnectionProviderCard
            title="Gmail"
            subtitle="Google Workspace"
            provider="gmail"
            connected={providerConnections.gmail}
            connecting={connectingProvider === "gmail"}
            onConnect={() => onConnectProvider("gmail")}
            buttonLabel="Connect"
            bodyText="Connect Gmail so Evality can send and receive recruiting communication from your mailbox."
          />
          <ConnectionProviderCard
            title="Microsoft Outlook"
            subtitle="Microsoft 365"
            provider="outlook"
            connected={providerConnections.outlook}
            connecting={connectingProvider === "outlook"}
            onConnect={() => onConnectProvider("outlook")}
            buttonLabel="Connect"
            bodyText="Connect Outlook so recruiters can keep messages inside Microsoft 365."
          />
        </div>
      </SettingsCard>

      {hasConnectedMailbox ? (
        <SettingsCard
          title="Default Sender Account"
          description="Choose which connected mailbox should send recruiting mail by default."
        >
          <div className="grid gap-[16px] md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <FxSelect
              label="Default sender account"
              value={primaryAccount}
              onChange={onPrimaryAccountChange}
              options={connectedMailboxOptions}
              placeholder="Select a mailbox"
            />
            <div className="rounded-[10px] border border-[var(--fx-border)] bg-[var(--fx-surface-subtle)] px-[14px] py-[12px]">
              <div className={`${FX_TYPOGRAPHY.fieldLabel} text-[var(--fx-text-muted)]`}>Selected mailbox</div>
              <div className={`${FX_TYPOGRAPHY.body} mt-[4px] text-[var(--fx-text)]`}>
                {primaryAccountOptions.find((option) => option.value === primaryAccount)?.label ?? "Not set"}
              </div>
            </div>
          </div>
        </SettingsCard>
      ) : null}

      <SenderPreviewCard {...senderPreview} />

      <SettingsCard
        title="Email Signature"
        description="Set the signature that Evality appends to outbound recruiting messages."
      >
        <FxInput
          textarea
          label="Signature"
          defaultValue="Best,\nJohn Doe"
          className="min-h-[120px]"
        />
      </SettingsCard>

      <SettingsCard
        title="Communication Preferences"
        description="Control how recruiting conversations flow through the connected mailbox."
      >
        <div className="grid gap-[12px]">
          {[
            {
              key: "routeReplies",
              label: "Route candidate replies to the connected mailbox",
              description: "Keeps recruiting conversations attached to the provider you connected.",
              checked: emailCommunicationPreferences.routeReplies,
            },
            {
              key: "copyRecruiters",
              label: "Copy recruiters on outbound messages",
              description: "Useful when the workspace needs visibility across the hiring team.",
              checked: emailCommunicationPreferences.copyRecruiters,
            },
            {
              key: "sendReminders",
              label: "Send follow-up reminders from Evality",
              description: "Keeps reminder cadence inside the workspace rather than outside it.",
              checked: emailCommunicationPreferences.sendReminders,
            },
          ].map((preference) => (
            <PreferenceRow
              key={preference.key}
              label={preference.label}
              description={preference.description}
              checked={Boolean(preference.checked)}
              onCheckedChange={(checked) => onEmailPreferenceChange(preference.key, Boolean(checked))}
            />
          ))}
        </div>
      </SettingsCard>
    </div>
  );
}

function ProfileCompletionBanner({
  onNavigate,
  profileComplete,
  organizationComplete,
  recruitingComplete,
  emailConnected,
  calendarConnected,
}) {
  const checklist = [
    { label: "Profile Details", completed: profileComplete, sectionId: null },
    { label: "Organization Details", completed: organizationComplete, sectionId: null },
    { label: "Career Page", completed: false, sectionId: "career-page" },
    { label: "Recruiting Status", completed: recruitingComplete, sectionId: null },
    { label: "Screening Method", completed: false, sectionId: "screening" },
    { label: "Billing", completed: false, sectionId: "billing" },
    { label: "Email", completed: emailConnected, sectionId: "email-settings" },
    { label: "Calender", completed: calendarConnected, sectionId: "calendar" },
  ];
  const completedCount = checklist.filter((item) => item.completed).length;
  const completedSegments = completedCount;

  return (
    <div className={`overflow-hidden rounded-[16px] border ${FX_COLORS.border}`}>
      <div className="border-b border-[color:color-mix(in_srgb,var(--fx-border)_56%,transparent)] bg-[var(--fx-surface-subtle)] px-[20px] py-[14px]">
        <div className="flex flex-col gap-[10px] lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-[4px]">
          <div className={`${FX_TYPOGRAPHY.cardTitle} text-[var(--fx-text-muted)]`}>Complete Your Workspace Setup</div>
            <p className={`${FX_TYPOGRAPHY.sidebarEmail} text-[var(--fx-text-muted)]`}>
              These setup items need to be completed before the workspace is fully ready.
            </p>
          </div>
          <div className="w-full max-w-[180px] space-y-[6px]">
            <div
              className="grid h-[6px] gap-[2px]"
              style={{ gridTemplateColumns: `repeat(${checklist.length}, minmax(0, 1fr))` }}
            >
              {checklist.map((item, index) => (
                <div
                  key={item.label}
                  className={cn(
                    "h-full rounded-[1.5px] transition-colors",
                    index < completedSegments ? "bg-[var(--fx-text-muted)]" : "bg-[var(--fx-disabled-bg)]",
                  )}
                />
              ))}
            </div>
            {/* <div className={`${FX_TYPOGRAPHY.caption} text-[var(--fx-text-muted)]`}>
              {completedCount}/{checklist.length} Complete
            </div> */}
          </div>
        </div>
      </div>

      <div className="bg-[var(--fx-surface)] px-[20px] py-[14px]">
        <div className="grid gap-[4px] md:grid-cols-4">
          {checklist.map((item) =>
            item.completed ? (
              <ChecklistItem key={item.label}>{item.label}</ChecklistItem>
            ) : (
              <DueChecklistItem key={item.label} onClick={() => onNavigate(item.sectionId)}>
                {item.label}
              </DueChecklistItem>
            ),
          )}
        </div>
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
  organizationIndustries,
  onOrganizationIndustriesChange,
  screeningChannel,
  onScreeningChannelChange,
  prescreenMode,
  onPrescreenModeChange,
  emailProviderConnections,
  emailSenderAccount,
  onEmailSenderAccountChange,
  connectingEmailProvider,
  onConnectEmailProvider,
  emailCommunicationPreferences,
  onEmailPreferenceChange,
  calendarProviderConnections,
  calendarDefaultAccount,
  onCalendarDefaultAccountChange,
  calendarTimezone,
  onCalendarTimezoneChange,
  calendarWeeklyAvailability,
  onCalendarWeeklyAvailabilityChange,
  connectingCalendarProvider,
  onConnectCalendarProvider,
  calendarPreferences,
  onCalendarPreferenceChange,
}) {
  if (sectionId === "organization") {
    return (
      <SettingsCard
        title="Organization"
        description="This represents the Hiring for My Company settings context."
        action={<FxButton variant="secondary" size="md">Save</FxButton>}
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
        <div className="grid gap-[16px] md:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] md:items-start">
          <SelectField label="Company Size" defaultValue={COMPANY_SIZE_OPTIONS[1]} options={COMPANY_SIZE_OPTIONS} />
          <div className="flex items-end gap-[8px]">
            <div className="min-w-0 flex-1 space-y-[8px] pt-[8px]">
              <FxFieldLabel>Company Logo</FxFieldLabel>
              <div className="flex h-[40px] min-w-0 items-center rounded-[4px] border border-[var(--fx-border)] bg-[var(--fx-surface)] px-[16px] text-[14px] leading-[22px] text-[var(--fx-text-muted)]">
                <span className="truncate">No logo selected</span>
              </div>
            </div>
            <FxButton variant="secondary" size="md" className="h-[40px] shrink-0">
              <Upload className="size-[16px]" />
              Upload Logo
            </FxButton>
          </div>
        </div>
        <FxMultiSelectInput
          label="Industry"
          value={organizationIndustries}
          onChange={onOrganizationIndustriesChange}
          options={INDUSTRY_SUGGESTIONS}
          placeholder="Search or add industries..."
          className="min-h-[56px]"
        />
      </SettingsCard>
    );
  }

  if (sectionId === "recruiting-status") {
    return (
      <SettingsCard
        title="Recruiting Status"
        description="Controls default recruiting workflows and available settings."
        action={<FxButton variant="secondary" size="md">Save</FxButton>}
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
        action={<FxButton variant="secondary" size="md">Save</FxButton>}
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
        action={<FxButton variant="secondary" size="md">Save</FxButton>}
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
      <EmailSettingsSection
        providerConnections={emailProviderConnections}
        connectingProvider={connectingEmailProvider}
        onConnectProvider={onConnectEmailProvider}
        primaryAccount={emailSenderAccount}
        onPrimaryAccountChange={onEmailSenderAccountChange}
        emailCommunicationPreferences={emailCommunicationPreferences}
        onEmailPreferenceChange={onEmailPreferenceChange}
      />
    );
  }

  if (sectionId === "calendar") {
    return (
      <CalendarSettingsSection
        providerConnections={calendarProviderConnections}
        connectingProvider={connectingCalendarProvider}
        onConnectProvider={onConnectCalendarProvider}
        calendarDefaultAccount={calendarDefaultAccount}
        onCalendarDefaultAccountChange={onCalendarDefaultAccountChange}
        calendarTimezone={calendarTimezone}
        onCalendarTimezoneChange={onCalendarTimezoneChange}
        calendarWeeklyAvailability={calendarWeeklyAvailability}
        onCalendarWeeklyAvailabilityChange={onCalendarWeeklyAvailabilityChange}
        calendarPreferences={calendarPreferences}
        onCalendarPreferenceChange={onCalendarPreferenceChange}
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
      action={<FxButton variant="secondary" size="md">Save</FxButton>}
    >
      <div className="grid gap-[16px] md:grid-cols-2">
        <FxInput label="Name" defaultValue={DEMO_USER.name} />
        <FxInput label="Email" defaultValue={DEMO_USER.email} />
      </div>
      <div className="grid gap-[16px] md:grid-cols-2">
        <FxInput label="Phone" defaultValue="+1 (415) 555-0124" />
        <SelectField label="Role" defaultValue={ROLE_OPTIONS[0]} options={ROLE_OPTIONS} />
      </div>
      <FxInput
        textarea
        label="About Me"
        defaultValue="Recruiter focused on building structured screening workflows and a calm candidate experience."
        className="min-h-[120px]"
      />
      <div className="flex flex-col gap-[8px]">
        <FieldLabel>Authenticate Yourself</FieldLabel>
        <div className="flex min-h-[40px] items-center gap-[12px]">
          <FxButton
            variant="secondary"
            size="md"
            className="h-[40px] border-[#0A66C2] bg-[#0A66C2] px-[16px] text-white hover:bg-[#0958A8] hover:text-white"
          >
            <LinkedInIcon />
            Connect LinkedIn
          </FxButton>
          {/* <span className={`${FX_TYPOGRAPHY.fieldHint} text-[var(--fx-text-muted)]`}>Authenticate to pull your public profile.</span> */}
        </div>
      </div>
    </SettingsCard>
  );
}

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState("profile");
  const [recruitingStatus, setRecruitingStatus] = useState(WORKSPACE_TYPES.MY_COMPANY);
  const [screeningChannel, setScreeningChannel] = useState("email");
  const [prescreenMode, setPrescreenMode] = useState("cv_and_prescreen");
  const [emailProviderConnections, setEmailProviderConnections] = useState({
    gmail: false,
    outlook: false,
  });
  const [emailSenderAccount, setEmailSenderAccount] = useState("");
  const [connectingEmailProvider, setConnectingEmailProvider] = useState(null);
  const [emailCommunicationPreferences, setEmailCommunicationPreferences] = useState({
    routeReplies: true,
    copyRecruiters: false,
    sendReminders: true,
  });
  const [organizationIndustries, setOrganizationIndustries] = useState(["Staffing", "SaaS", "AI"]);
  const [calendarProviderConnections, setCalendarProviderConnections] = useState({
    googleCalendar: false,
    outlookCalendar: false,
  });
  const [calendarDefaultAccount, setCalendarDefaultAccount] = useState("");
  const [calendarTimezone, setCalendarTimezone] = useState("(UTC+05:30) Asia/Kolkata");
  const [calendarWeeklyAvailability, setCalendarWeeklyAvailability] = useState(DEFAULT_WEEKLY_AVAILABILITY);
  const [connectingCalendarProvider, setConnectingCalendarProvider] = useState(null);
  const [calendarPreferences, setCalendarPreferences] = useState({
    useConnectedCalendar: true,
    blockBusyTime: true,
    preventDoubleBooking: true,
    sendSchedulingReminders: true,
  });
  const [sidebarScrollState, setSidebarScrollState] = useState({
    canScroll: false,
    isAtTop: true,
    isAtBottom: true,
  });
  const sidebarScrollRef = useRef(null);
  const emailConnectTimerRef = useRef(null);
  const calendarConnectTimerRef = useRef(null);

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

  useEffect(() => {
    const storedConnections = readStoredJSON(STORAGE_KEYS.EMAIL_PROVIDER_CONNECTIONS);

    if (storedConnections && typeof storedConnections === "object") {
      const nextConnections = {
        gmail: Boolean(storedConnections.gmail),
        outlook: Boolean(storedConnections.outlook),
      };

      setEmailProviderConnections(nextConnections);

      const storedSenderAccount = readStoredValue(STORAGE_KEYS.EMAIL_SENDER_ACCOUNT);
      if (storedSenderAccount === "gmail" || storedSenderAccount === "outlook") {
        setEmailSenderAccount(storedSenderAccount);
      } else if (nextConnections.gmail) {
        setEmailSenderAccount("gmail");
      } else if (nextConnections.outlook) {
        setEmailSenderAccount("outlook");
      }
    }

    const storedCommunicationPreferences = readStoredJSON(STORAGE_KEYS.EMAIL_COMMUNICATION_PREFERENCES);
    if (storedCommunicationPreferences && typeof storedCommunicationPreferences === "object") {
      setEmailCommunicationPreferences((current) => ({
        ...current,
        routeReplies: Boolean(storedCommunicationPreferences.routeReplies ?? current.routeReplies),
        copyRecruiters: Boolean(storedCommunicationPreferences.copyRecruiters ?? current.copyRecruiters),
        sendReminders: Boolean(storedCommunicationPreferences.sendReminders ?? current.sendReminders),
      }));
    }

    const storedCalendarConnections = readStoredJSON(STORAGE_KEYS.CALENDAR_PROVIDER_CONNECTIONS);
    if (storedCalendarConnections && typeof storedCalendarConnections === "object") {
      const nextConnections = {
        googleCalendar: Boolean(storedCalendarConnections.googleCalendar),
        outlookCalendar: Boolean(storedCalendarConnections.outlookCalendar),
      };

      setCalendarProviderConnections(nextConnections);

      const storedCalendarAccount = readStoredValue(STORAGE_KEYS.CALENDAR_DEFAULT_ACCOUNT);
      if (storedCalendarAccount === "googleCalendar" || storedCalendarAccount === "outlookCalendar") {
        setCalendarDefaultAccount(storedCalendarAccount);
      } else if (nextConnections.googleCalendar) {
        setCalendarDefaultAccount("googleCalendar");
      } else if (nextConnections.outlookCalendar) {
        setCalendarDefaultAccount("outlookCalendar");
      }
    }

    const storedCalendarPreferences = readStoredJSON(STORAGE_KEYS.CALENDAR_PREFERENCES);
    if (storedCalendarPreferences && typeof storedCalendarPreferences === "object") {
      setCalendarPreferences((current) => ({
        ...current,
        useConnectedCalendar: Boolean(storedCalendarPreferences.useConnectedCalendar ?? current.useConnectedCalendar),
        blockBusyTime: Boolean(storedCalendarPreferences.blockBusyTime ?? current.blockBusyTime),
        preventDoubleBooking: Boolean(storedCalendarPreferences.preventDoubleBooking ?? current.preventDoubleBooking),
        sendSchedulingReminders: Boolean(
          storedCalendarPreferences.sendSchedulingReminders ??
            storedCalendarPreferences.keepSchedulingInsideEvality ??
            current.sendSchedulingReminders,
        ),
      }));
    }
  }, []);

  useEffect(() => {
    return () => {
      if (emailConnectTimerRef.current) {
        window.clearTimeout(emailConnectTimerRef.current);
      }
      if (calendarConnectTimerRef.current) {
        window.clearTimeout(calendarConnectTimerRef.current);
      }
    };
  }, []);

  function handleRecruitingStatusChange(nextValue) {
    setRecruitingStatus(nextValue);
    writeStoredValue(STORAGE_KEYS.WORKSPACE_TYPE, nextValue);
  }

  function handleEmailSenderAccountChange(event) {
    const nextValue = event?.target?.value ?? "";
    setEmailSenderAccount(nextValue);
    writeStoredValue(STORAGE_KEYS.EMAIL_SENDER_ACCOUNT, nextValue);
  }

  function handleEmailPreferenceChange(key, nextValue) {
    setEmailCommunicationPreferences((current) => {
      const nextPreferences = {
        ...current,
        [key]: nextValue,
      };

      writeStoredJSON(STORAGE_KEYS.EMAIL_COMMUNICATION_PREFERENCES, nextPreferences);
      return nextPreferences;
    });
  }

  function handleConnectEmailProvider(providerId) {
    if (emailProviderConnections[providerId] || connectingEmailProvider) {
      return;
    }

    setConnectingEmailProvider(providerId);

    if (emailConnectTimerRef.current) {
      window.clearTimeout(emailConnectTimerRef.current);
    }

    emailConnectTimerRef.current = window.setTimeout(() => {
      setEmailProviderConnections((current) => {
        const nextConnections = {
          ...current,
          [providerId]: true,
        };

        writeStoredJSON(STORAGE_KEYS.EMAIL_PROVIDER_CONNECTIONS, nextConnections);
        return nextConnections;
      });

      setEmailSenderAccount((current) => {
        if (current && current !== providerId) {
          return current;
        }

        writeStoredValue(STORAGE_KEYS.EMAIL_SENDER_ACCOUNT, providerId);
        return providerId;
      });

      setConnectingEmailProvider(null);
    }, 500);
  }

  function handleCalendarDefaultAccountChange(event) {
    const nextValue = event?.target?.value ?? "";
    setCalendarDefaultAccount(nextValue);
    writeStoredValue(STORAGE_KEYS.CALENDAR_DEFAULT_ACCOUNT, nextValue);
  }

  function handleCalendarTimezoneChange(event) {
    setCalendarTimezone(event?.target?.value ?? "(UTC+05:30) Asia/Kolkata");
  }

  function handleCalendarWeeklyAvailabilityChange(day, updates) {
    setCalendarWeeklyAvailability((current) =>
      current.map((item) =>
        item.day === day
          ? {
              ...item,
              ...updates,
            }
          : item,
      ),
    );
  }

  function handleCalendarPreferenceChange(key, nextValue) {
    setCalendarPreferences((current) => {
      const nextPreferences = {
        ...current,
        [key]: nextValue,
      };

      writeStoredJSON(STORAGE_KEYS.CALENDAR_PREFERENCES, nextPreferences);
      return nextPreferences;
    });
  }

  function handleConnectCalendarProvider(providerId) {
    if (calendarProviderConnections[providerId] || connectingCalendarProvider) {
      return;
    }

    setConnectingCalendarProvider(providerId);

    if (calendarConnectTimerRef.current) {
      window.clearTimeout(calendarConnectTimerRef.current);
    }

    calendarConnectTimerRef.current = window.setTimeout(() => {
      setCalendarProviderConnections((current) => {
        const nextConnections = {
          ...current,
          [providerId]: true,
        };

        writeStoredJSON(STORAGE_KEYS.CALENDAR_PROVIDER_CONNECTIONS, nextConnections);
        return nextConnections;
      });

      setCalendarDefaultAccount((current) => {
        if (current && current !== providerId) {
          return current;
        }

        writeStoredValue(STORAGE_KEYS.CALENDAR_DEFAULT_ACCOUNT, providerId);
        return providerId;
      });

      setConnectingCalendarProvider(null);
    }, 500);
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
    emailConnected: Boolean(emailProviderConnections.gmail || emailProviderConnections.outlook),
    calendarConnected: Boolean(calendarProviderConnections.googleCalendar || calendarProviderConnections.outlookCalendar),
  };

  return (
    <FxProtectedAppPage pageId="settings">
      <section className={`${FX_LAYOUT.contentWidthWide} flex w-full min-w-0 flex-1 flex-col gap-[24px] bg-transparent`}>
        <div className="grid gap-[24px] lg:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="sticky top-0 self-start h-[calc(100vh-64px)] overflow-hidden py-[32px]">
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

          <main className="min-w-0 py-[32px]">
            <div className="flex flex-col gap-[16px]">
              <ProfileCompletionBanner onNavigate={setActiveSection} {...profileCompletion} />
              <div className={`flex flex-col rounded-[16px] border ${FX_COLORS.border} bg-[var(--fx-surface)]`}>
                <div className="px-[24px] py-[32px] md:px-[32px]">
                  <SectionContent
                    sectionId={activeSection}
                    recruitingStatus={recruitingStatus}
                    onRecruitingStatusChange={handleRecruitingStatusChange}
                    organizationIndustries={organizationIndustries}
                    onOrganizationIndustriesChange={setOrganizationIndustries}
                    screeningChannel={screeningChannel}
                    onScreeningChannelChange={setScreeningChannel}
                    prescreenMode={prescreenMode}
                    onPrescreenModeChange={setPrescreenMode}
                    emailProviderConnections={emailProviderConnections}
                    emailSenderAccount={emailSenderAccount}
                    onEmailSenderAccountChange={handleEmailSenderAccountChange}
                    connectingEmailProvider={connectingEmailProvider}
                    onConnectEmailProvider={handleConnectEmailProvider}
                    emailCommunicationPreferences={emailCommunicationPreferences}
                    onEmailPreferenceChange={handleEmailPreferenceChange}
                    calendarProviderConnections={calendarProviderConnections}
                    calendarDefaultAccount={calendarDefaultAccount}
                    onCalendarDefaultAccountChange={handleCalendarDefaultAccountChange}
                    connectingCalendarProvider={connectingCalendarProvider}
                    onConnectCalendarProvider={handleConnectCalendarProvider}
                    calendarWeeklyAvailability={calendarWeeklyAvailability}
                    onCalendarWeeklyAvailabilityChange={handleCalendarWeeklyAvailabilityChange}
                    calendarPreferences={calendarPreferences}
                    onCalendarPreferenceChange={handleCalendarPreferenceChange}
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
