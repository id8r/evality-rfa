/* src/components/fx/FxCandidateCard.js | Reusable candidate summary card | Sree | 2026-06-24 */

"use client";

import { Check, ChevronDown, PencilLine, X } from "lucide-react";
import { useState } from "react";

import { formatCurrencyValue } from "@/lib/FxJobSchema";
import { FX_TYPOGRAPHY } from "@/lib/FxTheme";
import { cn } from "@/lib/FxUtils";

function formatText(value) {
  const text = String(value ?? "").trim();
  return text || "N/A";
}

function formatDateValue(value) {
  if (!value) {
    return "N/A";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "N/A";
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatSalaryValue(value, currency = "INR") {
  const formatted = formatCurrencyValue(value, currency);
  return formatted || "N/A";
}

function formatFitScoreValue(value) {
  if (value == null || value === "") {
    return "N/A";
  }

  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) {
    return formatText(value);
  }

  return `${numericValue}%`;
}

function formatExperienceValue(value) {
  if (value == null || value === "") {
    return "N/A";
  }

  const text = String(value).trim();
  if (!text) {
    return "N/A";
  }

  if (/\byears?\b/i.test(text)) {
    return text;
  }

  return `${text} years`;
}

function getCandidateFieldValue(candidate, keys, fallback = "N/A") {
  for (const key of keys) {
    const value = candidate?.[key];
    if (value != null && String(value).trim() !== "") {
      return value;
    }
  }

  return fallback;
}

function normalizeHistoricJob(item, key) {
  if (!item) {
    return null;
  }

  if (typeof item === "string") {
    const title = item.trim();
    return title ? { key, title, meta: [] } : null;
  }

  const title = formatText(
    item.jobTitle ??
      item.title ??
      item.name ??
      item.role ??
      item.jobName ??
      item.label ??
      item.jobId,
  );

  if (title === "N/A") {
    return null;
  }

  const meta = [
    item.appliedAt ?? item.appliedDate ?? item.createdAt ?? item.updatedAt,
    item.status ?? item.screeningOutcome ?? item.clientStatus,
  ]
    .map((value) => {
      if (!value) {
        return "";
      }

      if (value instanceof Date) {
        return formatDateValue(value);
      }

      return String(value).trim();
    })
    .filter(Boolean);

  return {
    key,
    title,
    meta,
    timestamp: item.appliedAt ?? item.appliedDate ?? item.createdAt ?? item.updatedAt ?? null,
  };
}

function getHistoricJobsApplied(candidate) {
  const explicitHistory =
    candidate?.historicJobsApplied ??
    candidate?.previousJobsApplied ??
    candidate?.jobsAppliedHistory ??
    candidate?.jobApplicationHistory ??
    candidate?.jobApplications ??
    candidate?.jobHistory;

  let items = [];

  if (Array.isArray(explicitHistory)) {
    items = explicitHistory
      .map((item, index) => normalizeHistoricJob(item, `historic-${index}`))
      .filter(Boolean);
  } else if (explicitHistory && typeof explicitHistory === "object") {
    items = Object.entries(explicitHistory)
      .map(([key, item]) => normalizeHistoricJob(item, key))
      .filter(Boolean);
  }

  const jobContexts = candidate?.jobContexts;
  if ((!items.length || !Array.isArray(explicitHistory)) && jobContexts && typeof jobContexts === "object" && !Array.isArray(jobContexts)) {
    const currentJobId = candidate?.jobId ?? candidate?.currentJobId ?? null;
    const derivedItems = Object.entries(jobContexts)
      .filter(([jobId]) => jobId !== currentJobId)
      .map(([jobId, context]) =>
        normalizeHistoricJob(
          {
            jobId,
            jobTitle: context?.jobTitle ?? context?.title ?? context?.role ?? context?.appliedFor ?? jobId,
            appliedAt: context?.appliedAt ?? context?.createdAt ?? context?.updatedAt,
            status: context?.status ?? context?.screeningOutcome ?? context?.clientStatus,
          },
          jobId,
        ),
      )
      .filter(Boolean);

    items = items.length ? items : derivedItems;
  }

  return items.sort((left, right) => {
    const leftTime = new Date(left?.timestamp ?? 0).getTime();
    const rightTime = new Date(right?.timestamp ?? 0).getTime();

    if (Number.isNaN(leftTime) && Number.isNaN(rightTime)) {
      return 0;
    }

    if (Number.isNaN(leftTime)) {
      return 1;
    }

    if (Number.isNaN(rightTime)) {
      return -1;
    }

    return rightTime - leftTime;
  });
}

function FieldRow({ label, value, valueClassName }) {
  return (
    <div className="space-y-[2px]">
      <p className={`${FX_TYPOGRAPHY.fieldHint} text-[var(--fx-text-muted)]`}>{label}</p>
      <p className={cn("text-[13px] leading-[20px] text-[var(--fx-text)]", valueClassName)}>{value}</p>
    </div>
  );
}

function FitScoreValue({ label = "Fit Score", score }) {
  const isMissing = score === "N/A";

  return (
    <div className="space-y-[1px] text-right">
      <p
        className={cn(
          "text-[16px] leading-[20px] font-medium tabular-nums",
          isMissing ? "text-[var(--fx-text-muted)]" : "text-[var(--fx-text)]",
        )}
      >
        {score}
      </p>
      <p className="text-[11px] leading-[16px] font-medium text-[var(--fx-text-muted)]">{label}</p>
    </div>
  );
}

function EditableFieldRow({
  label,
  value,
  editValue = value,
  canEdit = false,
  onSave,
  inputType = "text",
  inputMode,
  placeholder = "N/A",
  align = "left",
  valueClassName,
  inputClassName,
  isLink = false,
  href,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [draftValue, setDraftValue] = useState(String(editValue ?? ""));

  function handleStartEdit() {
    if (!canEdit) {
      return;
    }

    setDraftValue(String(editValue ?? ""));
    setIsEditing(true);
  }

  function handleCancel() {
    setDraftValue(String(editValue ?? ""));
    setIsEditing(false);
  }

  function handleSave() {
    onSave?.(String(draftValue ?? "").trim());
    setIsEditing(false);
  }

  const isEmpty = value == null || String(value).trim() === "" || String(value) === "N/A";
  const justifyClassName = align === "right" ? "items-end text-right" : "items-start text-left";
  const displayValueClassName = cn(
    "min-w-0 break-words text-[13px] leading-[20px] text-[var(--fx-text)]",
    align === "right" ? "text-right" : "text-left",
    valueClassName,
  );

  const isEditable = canEdit && Boolean(onSave);
  const showEditor = isEditing && isEditable;

  return (
    <div className="space-y-[2px]">
      <div className="flex items-center justify-between gap-[8px]">
        <p className={`${FX_TYPOGRAPHY.fieldHint} text-[var(--fx-text-muted)]`}>{label}</p>
        {isEditable ? (
          <button
            type="button"
            onClick={isEditing ? handleCancel : handleStartEdit}
            aria-label={isEditing ? `Cancel ${label} edit` : `Edit ${label}`}
            className="inline-flex size-[20px] items-center justify-center rounded-[5px] text-[var(--fx-text-muted)] transition-colors hover:bg-[var(--fx-surface-hover)] hover:text-[var(--fx-primary)]"
          >
            {isEditing ? <X className="size-[12px]" /> : <PencilLine className="size-[12px]" />}
          </button>
        ) : null}
      </div>

      {showEditor ? (
        <div className={cn("flex items-center gap-[6px]", justifyClassName)}>
          <input
            type={inputType}
            inputMode={inputMode}
            value={draftValue}
            onChange={(event) => setDraftValue(event.target.value)}
            placeholder={placeholder}
            className={cn(
              "min-h-[28px] min-w-0 rounded-[6px] border border-[var(--fx-border)] bg-[var(--fx-surface)] px-[8px] text-[13px] leading-[20px] text-[var(--fx-text)] outline-none placeholder:text-[var(--fx-text-disabled)] focus:border-[var(--fx-primary)]",
              align === "right" ? "text-right" : "text-left",
              inputClassName,
            )}
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                event.preventDefault();
                event.stopPropagation();
                handleCancel();
              }

              if (event.key === "Enter") {
                event.preventDefault();
                event.stopPropagation();
                handleSave();
              }
            }}
          />
          <button
            type="button"
            onClick={handleSave}
            aria-label={`Save ${label}`}
            className="inline-flex size-[24px] items-center justify-center rounded-[5px] text-[var(--fx-text-muted)] transition-colors hover:bg-[var(--fx-surface-hover)] hover:text-[var(--fx-primary)]"
          >
            <Check className="size-[12px]" />
          </button>
        </div>
      ) : (
        <div className={cn("flex items-center gap-[6px]", justifyClassName)}>
          {isLink && !isEmpty && href ? (
            <a href={href} className={displayValueClassName}>
              {value}
            </a>
          ) : (
            <span className={displayValueClassName}>{value}</span>
          )}
        </div>
      )}
    </div>
  );
}

function EditableContactRow({
  label,
  value,
  editValue = value,
  canEdit = false,
  onSave,
  inputType = "text",
  inputMode,
  placeholder = "N/A",
  align = "left",
  isLink = false,
  href,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [draftValue, setDraftValue] = useState(String(editValue ?? ""));

  function handleStartEdit() {
    if (!canEdit) {
      return;
    }

    setDraftValue(String(editValue ?? ""));
    setIsEditing(true);
  }

  function handleCancel() {
    setDraftValue(String(editValue ?? ""));
    setIsEditing(false);
  }

  function handleSave() {
    onSave?.(String(draftValue ?? "").trim());
    setIsEditing(false);
  }

  const isEmpty = value == null || String(value).trim() === "" || String(value) === "N/A";
  const isEditable = canEdit && Boolean(onSave);
  const showEditor = isEditing && isEditable;
  const rowJustifyClassName = align === "right" ? "justify-end text-right" : "justify-start text-left";
  const displayValueClassName = cn(
    "min-w-0 break-words text-[13px] leading-[20px] text-[var(--fx-text)]",
    align === "right" ? "text-right" : "text-left",
  );
  const buttonClassName = "inline-flex size-[20px] shrink-0 items-center justify-center rounded-[5px] text-[var(--fx-text-muted)] transition-colors hover:bg-[var(--fx-surface-hover)] hover:text-[var(--fx-primary)]";

  return (
    <div className={cn("flex min-h-[28px] items-center gap-[6px]", rowJustifyClassName)}>
      {isEditable && !isEditing ? (
        <button
          type="button"
          onClick={handleStartEdit}
          aria-label={label ? `Edit ${label}` : "Edit"}
          className={buttonClassName}
        >
          <PencilLine className="size-[12px]" />
        </button>
      ) : null}

      {showEditor ? (
        <>
          <input
            type={inputType}
            inputMode={inputMode}
            value={draftValue}
            onChange={(event) => setDraftValue(event.target.value)}
            placeholder={placeholder}
            className={cn(
              "min-h-[28px] min-w-0 flex-1 rounded-[6px] border border-[var(--fx-border)] bg-[var(--fx-surface)] px-[8px] text-[13px] leading-[20px] text-[var(--fx-text)] outline-none placeholder:text-[var(--fx-text-disabled)] focus:border-[var(--fx-primary)]",
              align === "right" ? "text-right" : "text-left",
            )}
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                event.preventDefault();
                event.stopPropagation();
                handleCancel();
              }

              if (event.key === "Enter") {
                event.preventDefault();
                event.stopPropagation();
                handleSave();
              }
            }}
          />
          <button
            type="button"
            onClick={handleSave}
            aria-label={label ? `Save ${label}` : "Save"}
            className={buttonClassName}
          >
            <Check className="size-[12px]" />
          </button>
          <button
            type="button"
            onClick={handleCancel}
            aria-label={label ? `Cancel ${label} edit` : "Cancel edit"}
            className={buttonClassName}
          >
            <X className="size-[12px]" />
          </button>
        </>
      ) : (
        <>
          {isLink && !isEmpty && href ? (
            <a href={href} className={displayValueClassName}>
              {value}
            </a>
          ) : (
            <span className={displayValueClassName}>{value}</span>
          )}
        </>
      )}
    </div>
  );
}

export function FxCandidateCard({
  candidate,
  data,
  variant = "default",
  layout = "vertical",
  currency = "INR",
  onUpdateField,
  editableFields = {},
  className,
}) {
  const resolvedCandidate = candidate ?? data ?? {};
  const displayName = formatText(resolvedCandidate.name);
  const displayEmail = formatText(getCandidateFieldValue(resolvedCandidate, ["email"]));
  const displayPhone = formatText(getCandidateFieldValue(resolvedCandidate, ["phone"]));
  const fitScore = formatFitScoreValue(
    resolvedCandidate.matchScore ??
      resolvedCandidate.fitScore ??
      resolvedCandidate.jdMatchScore ??
      resolvedCandidate.cvMatchScore,
  );
  const experience = formatExperienceValue(resolvedCandidate.experience);
  const currentJobAppliedFor = formatText(
    getCandidateFieldValue(resolvedCandidate, [
      "currentJobAppliedFor",
      "jobTitle",
      "appliedJobTitle",
      "role",
      "position",
    ]),
  );
  const cvAddedDate = formatDateValue(
    resolvedCandidate.cvAddedDate ??
      resolvedCandidate.resumeAddedAt ??
      resolvedCandidate.addedAt ??
      resolvedCandidate.createdAt ??
      resolvedCandidate.updatedAt,
  );
  const currentCTC = formatSalaryValue(
    resolvedCandidate.currentSalary ?? resolvedCandidate.currentCTC ?? resolvedCandidate.currentCtc,
    currency,
  );
  const expectedCTC = formatSalaryValue(
    resolvedCandidate.expectedSalary ?? resolvedCandidate.expectedCTC ?? resolvedCandidate.expectedCtc,
    currency,
  );
  const noticePeriod = formatText(
    resolvedCandidate.noticePeriod ??
      resolvedCandidate.jobContext?.noticePeriod ??
      resolvedCandidate.jobContexts?.[resolvedCandidate.jobId]?.noticePeriod,
  );
  const historicJobsApplied = getHistoricJobsApplied(resolvedCandidate);
  const canEditEmail = Boolean(onUpdateField) && editableFields.email !== false;
  const canEditPhone = Boolean(onUpdateField) && editableFields.phone !== false;
  const canEditCurrentCTC = Boolean(onUpdateField) && editableFields.currentCTC !== false;
  const canEditExpectedCTC = Boolean(onUpdateField) && editableFields.expectedCTC !== false;
  const showHistoricJobs = variant === "detailed" && historicJobsApplied.length > 0;
  const showDefaultFields = variant !== "compact";
  const showDetailedFields = variant === "detailed";
  const summaryGridClassName = "grid gap-[8px] sm:grid-cols-2";

  return (
    <div className={cn("rounded-[12px] border border-[var(--fx-border)] bg-[var(--fx-surface)] p-[16px]", className)}>
      <div
        className={cn(
          "gap-[16px]",
          layout === "horizontal" && (showDefaultFields || showHistoricJobs)
            ? "grid lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]"
            : "space-y-[16px]",
        )}
      >
        <section className="space-y-[12px]">
          <div className="flex items-start justify-between gap-[12px]">
            <div className="min-w-0 space-y-[2px]">
              <p className="truncate text-[16px] leading-[24px] font-semibold text-[var(--fx-text)]">{displayName}</p>
              <p className="text-[11px] leading-[16px] text-[var(--fx-text-muted)]">{experience}</p>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-[2px]">
              <FitScoreValue label="Fit Score" score={fitScore} />
            </div>
          </div>

          <div className={summaryGridClassName}>
            <EditableContactRow
              label="Email"
              value={displayEmail}
              editValue={resolvedCandidate.email ?? ""}
              canEdit={canEditEmail}
              onSave={(nextValue) => onUpdateField?.("email", nextValue)}
              isLink={!canEditEmail}
              href={`mailto:${resolvedCandidate.email}`}
            />
            <EditableContactRow
              label="Phone"
              value={displayPhone}
              editValue={resolvedCandidate.phone ?? ""}
              canEdit={canEditPhone}
              onSave={(nextValue) => onUpdateField?.("phone", nextValue)}
              isLink={!canEditPhone}
              href={`tel:${resolvedCandidate.phone}`}
              align="right"
            />
          </div>
        </section>

        {showDefaultFields ? (
          <section className="space-y-[8px]">
            <div className="grid gap-[8px] sm:grid-cols-2">
              <FieldRow label="Current Job Applied For" value={currentJobAppliedFor} />
              {showDetailedFields ? (
                <>
                  <FieldRow label="CV Added Date" value={cvAddedDate} />
                  <EditableFieldRow
                    label="Current CTC"
                    value={currentCTC}
                    editValue={resolvedCandidate.currentSalary ?? resolvedCandidate.currentCTC ?? resolvedCandidate.currentCtc ?? ""}
                    canEdit={canEditCurrentCTC}
                    onSave={(nextValue) => onUpdateField?.("currentSalary", nextValue)}
                    inputType="text"
                    inputMode="numeric"
                    align="right"
                  />
                  <EditableFieldRow
                    label="Expected CTC"
                    value={expectedCTC}
                    editValue={resolvedCandidate.expectedSalary ?? resolvedCandidate.expectedCTC ?? resolvedCandidate.expectedCtc ?? ""}
                    canEdit={canEditExpectedCTC}
                    onSave={(nextValue) => onUpdateField?.("expectedSalary", nextValue)}
                    inputType="text"
                    inputMode="numeric"
                    align="right"
                  />
                  <FieldRow label="Notice Period" value={noticePeriod} />
                </>
              ) : null}
            </div>
          </section>
        ) : null}
      </div>

      {showHistoricJobs ? (
        <details className="group mt-[16px] rounded-[10px] border border-[color:color-mix(in_srgb,var(--fx-border)_72%,transparent)] bg-[var(--fx-bg-soft)]">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-[12px] px-[12px] py-[10px] outline-none [&::-webkit-details-marker]:hidden">
            <span className="text-[13px] leading-[20px] font-medium text-[var(--fx-text)]">
              Historic Jobs Applied
              <span className="ml-[6px] text-[var(--fx-text-muted)]">({historicJobsApplied.length})</span>
            </span>
            <ChevronDown className="size-[14px] shrink-0 text-[var(--fx-text-muted)] transition-transform duration-200 group-open:rotate-180" />
          </summary>
          <div className="border-t border-[color:color-mix(in_srgb,var(--fx-border)_56%,transparent)] px-[12px] py-[12px]">
            <div className="space-y-[8px]">
              {historicJobsApplied.map((item) => (
                <div key={item.key} className="rounded-[8px] border border-[color:color-mix(in_srgb,var(--fx-border)_72%,transparent)] bg-[var(--fx-surface)] px-[10px] py-[8px]">
                  <p className="text-[13px] leading-[20px] font-medium text-[var(--fx-text)]">{item.title}</p>
                  {item.meta.length ? (
                    <p className="mt-[2px] text-[12px] leading-[18px] text-[var(--fx-text-muted)]">{item.meta.join(" • ")}</p>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        </details>
      ) : null}
    </div>
  );
}

export default FxCandidateCard;
/* - - - - - - - - - - - - - - - - */
