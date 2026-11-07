"use client";

export type AnalyticsEvent =
  | "booking_step_view"
  | "booking_submit"
  | "booking_success"
  | "phone_tap"
  | "directions_tap"
  | "assistant_open"
  | "assistant_handoff"
  | "tooth_selected";

declare global {
  interface Window {
    haldenEvents?: Array<{ event: string; data?: Record<string, unknown>; at: number }>;
  }
}

export const track = (event: AnalyticsEvent, data?: Record<string, unknown>): void => {
  if (typeof window === "undefined") return;
  window.haldenEvents = window.haldenEvents ?? [];
  window.haldenEvents.push({ event, data, at: Date.now() });
};
