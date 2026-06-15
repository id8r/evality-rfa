/* lib/FxValidation.js | Shared validation helpers | Sree | 2026-06-15 */

export const VALIDATION_STATES = {
  DEFAULT: "default",
  ERROR: "error",
  WARNING: "warning",
  SUCCESS: "success",
};
/* - - - - - - - - - - - - - - - - */

export function isBlank(value) {
  return value == null || String(value).trim() === "";
}
/* - - - - - - - - - - - - - - - - */

export function toStringValue(value) {
  if (value == null) {
    return "";
  }

  return String(value).trim();
}
/* - - - - - - - - - - - - - - - - */

export function toListValue(value) {
  if (Array.isArray(value)) {
    return value.map((item) => toStringValue(item)).filter(Boolean);
  }

  return toStringValue(value)
    .split(/[\n,;]+/g)
    .map((item) => item.trim())
    .filter(Boolean);
}
/* - - - - - - - - - - - - - - - - */

export function dedupeList(values = []) {
  const seen = new Set();
  const nextValues = [];

  values.forEach((value) => {
    const normalized = toStringValue(value);
    const key = normalized.toLowerCase();

    if (!normalized || seen.has(key)) {
      return;
    }

    seen.add(key);
    nextValues.push(normalized);
  });

  return nextValues;
}
/* - - - - - - - - - - - - - - - - */

export function validateRequired(value, label = "This field") {
  return isBlank(value) ? `${label} is required.` : "";
}
/* - - - - - - - - - - - - - - - - */

export function validateRequiredList(value, label = "This field") {
  return toListValue(value).length ? "" : `${label} is required.`;
}
/* - - - - - - - - - - - - - - - - */

export function validateMinLength(value, minLength, label = "This field") {
  const normalizedValue = toStringValue(value);

  if (!normalizedValue) {
    return "";
  }

  return normalizedValue.length < minLength ? `${label} must be at least ${minLength} characters.` : "";
}
/* - - - - - - - - - - - - - - - - */

export function validateMaxLength(value, maxLength, label = "This field") {
  const normalizedValue = toStringValue(value);

  if (!normalizedValue) {
    return "";
  }

  return normalizedValue.length > maxLength ? `${label} must be ${maxLength} characters or fewer.` : "";
}
/* - - - - - - - - - - - - - - - - */

export function validateNumericRange(value, { label = "Value", min = null, max = null } = {}) {
  if (value == null || value === "") {
    return "";
  }

  const numberValue = Number(value);
  if (Number.isNaN(numberValue)) {
    return `${label} must be a number.`;
  }

  if (min != null && numberValue < min) {
    return `${label} must be at least ${min}.`;
  }

  if (max != null && numberValue > max) {
    return `${label} must be at most ${max}.`;
  }

  return "";
}
/* - - - - - - - - - - - - - - - - */

export function combineValidationMessages(messages = []) {
  return messages.filter(Boolean);
}
/* - - - - - - - - - - - - - - - - */

export function hasValidationErrors(messages = []) {
  return combineValidationMessages(messages).length > 0;
}
/* - - - - - - - - - - - - - - - - */