"use client";

import { useSyncExternalStore } from "react";

export type AppState = { toothId: string | null; reason: string | null };

const KEY = "halden.app.v1";
const EMPTY: AppState = { toothId: null, reason: null };

let state: AppState = EMPTY;
let hydrated = false;
const listeners = new Set<() => void>();

const emit = () => {
  for (const l of listeners) l();
};

const load = () => {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<AppState>;
      state = { toothId: parsed.toothId ?? null, reason: parsed.reason ?? null };
    }
  } catch {
    state = EMPTY;
  }
};

const persist = () => {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    return;
  }
};

export const appStore = {
  subscribe(l: () => void) {
    load();
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  },
  get(): AppState {
    load();
    return state;
  },
  getServer(): AppState {
    return EMPTY;
  },
  setTooth(toothId: string | null) {
    state = { ...state, toothId };
    persist();
    emit();
  },
  setReason(reason: string | null) {
    state = { ...state, reason };
    persist();
    emit();
  }
};

export const useAppState = (): AppState =>
  useSyncExternalStore(appStore.subscribe, appStore.get, appStore.getServer);
