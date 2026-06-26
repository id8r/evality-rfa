/* src/components/fx/FxCandidateCard.js | Clean candidate summary card | Sree | 2026-06-26 */

"use client";

import { Check, ChevronDown, PencilLine, X } from "lucide-react";
import { useLayoutEffect, useMemo, useRef, useState } from "react";

import { formatCurrencyValue } from "@/lib/FxJobSchema";
import { FX_TYPOGRAPHY } from "@/lib/FxTheme";
import { cn } from "@/lib/FxUtils";

const SUPPORTED_EDITABLE_FIELDS = new Set(["name", "email", "phone"]);

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

function formatExperienceValue(value) {
  if (value == null || value === "") {
    return "N/A";
  }

  const text = String(value).trim();
  if (!text) {
    return "N/A";
  }

  return /\byears?\b/i.test(text) ? text : `${text} years`;
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
    return title ? { key, title, status: "", dateLabel: "" } : null;
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

  const appliedAt = item.appliedAt ?? item.appliedDate ?? item.createdAt ?? item.updatedAt ?? null;
  const status = formatText(item.status ?? item.screeningOutcome ?? item.clientStatus);
  const dateLabel = appliedAt ? formatDateValue(appliedAt) : "N/A";

  return {
    key,
    title,
    status,
    dateLabel,
    timestamp: appliedAt,
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

function normalizeEditableFields(editableFields) {
  if (Array.isArray(editableFields)) {
    return new Set(editableFields.filter((field) => SUPPORTED_EDITABLE_FIELDS.has(field)));
  }

  if (editableFields && typeof editableFields === "object") {
    return new Set(
      Object.entries(editableFields)
        .filter(([field, enabled]) => SUPPORTED_EDITABLE_FIELDS.has(field) && enabled !== false)
        .map(([field]) => field),
    );
  }

  return new Set();
}

function LabelValue({ label, value, valueClassName, align = "left" }) {
  return (
    <div className={cn("space-y-[2px]", align === "right" ? "text-right" : "text-left")}>
      <p className={`${FX_TYPOGRAPHY.fieldHint} text-[var(--fx-text-muted)]`}>{label}</p>
      <p className={cn("text-[13px] leading-[20px] text-[var(--fx-text)]", valueClassName)}>{value}</p>
    </div>
  );
}

function ScoreBlock({ score, label = "Fit Score" }) {
  return (
    <div className="shrink-0 text-right">
      <p
        className={cn(
          "text-[18px] leading-[22px] font-semibold tabular-nums",
          score === "N/A" ? "text-[var(--fx-text-muted)]" : "text-[var(--fx-text)]",
        )}
      >
        {score}
      </p>
      <p className="text-[11px] leading-[16px] text-[var(--fx-text-muted)]">{label}</p>
    </div>
  );
}

function EditableInlineValue({
  fieldName,
  label,
  value,
  candidate,
  valueClassName,
  canEdit = false,
  editingField,
  draftValue,
  onStartEdit,
  onChangeDraft,
  onSaveEdit,
  onCancelEdit,
  align = "left",
}) {
  const inputRef = useRef(null);
  const isEditing = editingField === fieldName;
  const isEmpty = value == null || String(value).trim() === "" || String(value) === "N/A";

  useLayoutEffect(() => {
    if (!isEditing) {
      return;
    }

    window.requestAnimationFrame(() => {
      inputRef.current?.focus?.();
      inputRef.current?.select?.();
    });
  }, [isEditing]);

  const justifyClassName = align === "right" ? "justify-end text-right" : "justify-start text-left";
  const displayValueClassName = cn("min-w-0 break-words", align === "right" ? "text-right" : "text-left");
  const iconButtonClassName = "inline-flex size-[18px] shrink-0 items-center justify-center rounded-[4px] text-[var(--fx-text-muted)] transition-colors hover:bg-[var(--fx-surface-hover)] hover:text-[var(--fx-primary)]";

  return (
    <div className={cn("space-y-[2px]", align === "right" ? "text-right" : "text-left")}>
      {label ? <p className={`${FX_TYPOGRAPHY.fieldHint} text-[var(--fx-text-muted)]`}>{label}</p> : null}

      {isEditing ? (
        <div className={cn("flex items-center gap-[6px]", justifyClassName)}>
          <input
            ref={inputRef}
            value={draftValue}
            onChange={(event) => onChangeDraft(event.target.value)}
            placeholder="N/A"
            className={cn(
              "min-h-[28px] min-w-0 rounded-[6px] border border-[var(--fx-border)] bg-[var(--fx-surface)] px-[8px] text-[13px] leading-[20px] text-[var(--fx-text)] outline-none placeholder:text-[var(--fx-text-disabled)] focus:border-[var(--fx-primary)]",
              valueClassName,
              align === "right" ? "text-right" : "text-left",
            )}
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                event.preventDefault();
                event.stopPropagation();
                onCancelEdit();
              }

              if (event.key === "Enter") {
                event.preventDefault();
                event.stopPropagation();
                onSaveEdit(fieldName, candidate, draftValue);
              }
            }}
          />
          <button
            type="button"
            onClick={() => onSaveEdit(fieldName, candidate, draftValue)}
            aria-label={`Save ${label}`}
            className={iconButtonClassName}
          >
            <Check className="size-[11px]" />
          </button>
          <button
            type="button"
            onClick={onCancelEdit}
            aria-label={`Cancel ${label} edit`}
            className={iconButtonClassName}
          >
            <X className="size-[11px]" />
          </button>
        </div>
      ) : (
        <div className={cn("flex items-center gap-[6px]", justifyClassName)}>
          <span className={cn("text-[13px] leading-[20px] text-[var(--fx-text)]", displayValueClassName)}>{isEmpty ? "N/A" : value}</span>
          {canEdit ? (
            <button
              type="button"
              onClick={() => onStartEdit(fieldName, value)}
              aria-label={`Edit ${label}`}
              className={iconButtonClassName}
            >
              <PencilLine className="size-[11px]" />
            </button>
          ) : null}
        </div>
      )}
    </div>
  );
}

export function FxCandidateCard({
  candidate,
  data,
  variant = "default",
  layout: _layout = "vertical",
  currency = "INR",
  editableFields = [],
  onEditField,
  onUpdateField,
  className,
}) {
  const resolvedCandidate = candidate ?? data ?? {};
  const editableFieldSet = useMemo(() => normalizeEditableFields(editableFields), [editableFields]);
  const [editingField, setEditingField] = useState(null);
  const [draftValue, setDraftValue] = useState("");
  const [expandedHistory, setExpandedHistory] = useState(false);

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
  const cvAddedDate = formatDateValue(
    resolvedCandidate.cvAddedDate ??
      resolvedCandidate.resumeAddedAt ??
      resolvedCandidate.addedAt ??
      resolvedCandidate.createdAt ??
      resolvedCandidate.updatedAt,
  );
  const historicJobsApplied = getHistoricJobsApplied(resolvedCandidate);
  const canEditField = (fieldName) =>
    SUPPORTED_EDITABLE_FIELDS.has(fieldName) &&
    editableFieldSet.has(fieldName) &&
    (typeof onEditField === "function" || typeof onUpdateField === "function");

  function startEdit(fieldName, value) {
    if (!canEditField(fieldName)) {
      return;
    }

    setDraftValue(String(value ?? ""));
    setEditingField(fieldName);
  }

  function cancelEdit() {
    setDraftValue("");
    setEditingField(null);
  }

  function saveEdit(fieldName, candidateRecord, nextValue) {
    const trimmedValue = String(nextValue ?? "").trim();

    if (typeof onEditField === "function") {
      onEditField(fieldName, candidateRecord, trimmedValue);
    } else if (typeof onUpdateField === "function" && candidateRecord?.id) {
      onUpdateField(candidateRecord.id, fieldName, trimmedValue);
    }

    cancelEdit();
  }

  return (
    <div className={cn("rounded-[8px] border border-[color:color-mix(in_srgb,var(--fx-border)_72%,transparent)] bg-[var(--fx-surface)] p-[14px]", className)}>
      <div className="space-y-[10px]">
        <div className="flex items-start justify-between gap-[12px]">
          <div className="min-w-0 flex-1 space-y-[3px]">
            <EditableInlineValue
              fieldName="name"
              label=""
              value={displayName}
              candidate={resolvedCandidate}
              canEdit={canEditField("name")}
              editingField={editingField}
              draftValue={draftValue}
              onStartEdit={startEdit}
              onChangeDraft={setDraftValue}
            onSaveEdit={saveEdit}
            onCancelEdit={cancelEdit}
            valueClassName="text-[15px] leading-[22px] font-medium"
          />
            <p className="text-[12px] leading-[18px] text-[var(--fx-text-muted)]">{experience}</p>
          </div>
          <ScoreBlock score={fitScore} />
        </div>

        <div className="grid gap-[8px] sm:grid-cols-[minmax(0,1fr)_170px]">
          <EditableInlineValue
            fieldName="email"
            label="Email"
            value={displayEmail}
            candidate={resolvedCandidate}
            canEdit={canEditField("email")}
            editingField={editingField}
            draftValue={draftValue}
            onStartEdit={startEdit}
            onChangeDraft={setDraftValue}
            onSaveEdit={saveEdit}
            onCancelEdit={cancelEdit}
            valueClassName="whitespace-nowrap break-normal"
          />
          <EditableInlineValue
            fieldName="phone"
            label="Phone"
            value={displayPhone}
            candidate={resolvedCandidate}
            canEdit={canEditField("phone")}
            editingField={editingField}
            draftValue={draftValue}
            onStartEdit={startEdit}
            onChangeDraft={setDraftValue}
            onSaveEdit={saveEdit}
            onCancelEdit={cancelEdit}
            align="right"
            valueClassName="whitespace-nowrap break-normal"
          />
        </div>

        {variant !== "compact" ? (
          <div className="space-y-[8px]">
            <div className="grid gap-[8px] sm:grid-cols-2">
              <LabelValue label="Current CTC" value={currentCTC} />
              <LabelValue label="Expected CTC" value={expectedCTC} align="right" />
              <LabelValue label="Notice Period" value={noticePeriod} />
              <LabelValue label="CV Added Date" value={cvAddedDate} align="right" />
            </div>
          </div>
        ) : null}

        {variant === "expanded" && historicJobsApplied.length ? (
          <details className="group rounded-[6px] border border-[color:color-mix(in_srgb,var(--fx-border)_68%,transparent)] bg-[var(--fx-bg-soft)]">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-[10px] px-[12px] py-[10px] outline-none [&::-webkit-details-marker]:hidden">
              <span className="text-[13px] leading-[20px] font-medium text-[var(--fx-text)]">
                Historic Jobs Applied
                <span className="ml-[6px] text-[var(--fx-text-muted)]">({historicJobsApplied.length})</span>
              </span>
              <ChevronDown className="size-[14px] shrink-0 text-[var(--fx-text-muted)] transition-transform duration-200 group-open:rotate-180" />
            </summary>
            <div className="border-t border-[color:color-mix(in_srgb,var(--fx-border)_56%,transparent)] px-[12px] py-[12px]">
              <div className="space-y-[8px]">
                {historicJobsApplied.map((item) => (
                  <div
                    key={item.key}
                    className="rounded-[6px] border border-[color:color-mix(in_srgb,var(--fx-border)_68%,transparent)] bg-[var(--fx-surface)] px-[10px] py-[8px]"
                  >
                    <div className="flex items-start justify-between gap-[12px]">
                      <div className="min-w-0 space-y-[2px]">
                        <p className="truncate text-[13px] leading-[20px] font-medium text-[var(--fx-text)]">{item.title}</p>
                        <p className="text-[11px] leading-[16px] text-[var(--fx-text-muted)]">{item.dateLabel}</p>
                      </div>
                      <p className="shrink-0 text-[12px] leading-[18px] text-[var(--fx-text-muted)]">{item.status || "N/A"}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </details>
        ) : null}
      </div>
    </div>
  );
}
/* - - - - - - - - - - - - - - - - */
