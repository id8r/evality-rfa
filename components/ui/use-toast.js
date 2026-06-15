/*
components/ui/use-toast.js | shadcn-style toast store and hook | Sree | 2026-06-15
*/

"use client";

import { useSyncExternalStore } from "react";

const TOAST_LIMIT = 3;
const TOAST_REMOVE_DELAY = 1000;

let toastId = 0;
let state = {
  toasts: [],
};

const listeners = new Set();
const removeTimeouts = new Map();

function emitChange() {
  for (const listener of listeners) {
    listener();
  }
}

function createToastId() {
  toastId += 1;
  return `toast-${toastId}`;
}

function scheduleRemoval(id) {
  if (removeTimeouts.has(id)) {
    return;
  }

  const timeoutId = setTimeout(() => {
    removeTimeouts.delete(id);
    state = {
      toasts: state.toasts.filter((toast) => toast.id !== id),
    };
    emitChange();
  }, TOAST_REMOVE_DELAY);

  removeTimeouts.set(id, timeoutId);
}

function updateToastState(updater) {
  state = updater(state);
  emitChange();
}

export function toast(options = {}) {
  const id = options.id ?? createToastId();
  const nextToast = {
    id,
    title: options.title ?? "",
    description: options.description ?? "",
    action: options.action ?? null,
    duration: options.duration ?? 5000,
    variant: options.variant ?? "default",
    open: true,
  };

  updateToastState((currentState) => ({
    toasts: [nextToast, ...currentState.toasts].slice(0, TOAST_LIMIT),
  }));

  return {
    id,
    dismiss: () => dismissToast(id),
    update: (patch) => updateToast(id, patch),
  };
}

export function updateToast(id, patch = {}) {
  updateToastState((currentState) => ({
    toasts: currentState.toasts.map((toastItem) =>
      toastItem.id === id ? { ...toastItem, ...patch } : toastItem,
    ),
  }));
}

export function dismissToast(id) {
  clearTimeout(removeTimeouts.get(id));
  removeTimeouts.delete(id);

  updateToastState((currentState) => ({
    toasts: currentState.toasts.map((toastItem) =>
      toastItem.id === id ? { ...toastItem, open: false } : toastItem,
    ),
  }));

  scheduleRemoval(id);
}

export function clearToasts() {
  for (const timeoutId of removeTimeouts.values()) {
    clearTimeout(timeoutId);
  }

  removeTimeouts.clear();
  updateToastState(() => ({
    toasts: [],
  }));
}

function subscribe(listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot() {
  return state;
}

export function useToast() {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  return {
    ...snapshot,
    toast,
    dismissToast,
    clearToasts,
  };
}

