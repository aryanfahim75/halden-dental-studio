import { clinic } from "@/content/clinic";

export const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday"
];

export const DATE = (d: Date): string =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export const horizon = (today: Date, from: number, to: number): Date[] => {
  const out: Date[] = [];
  for (let i = from; i < from + to; i++) {
    const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() + i);
    out.push(d);
  }
  return out;
};

export const hoursRow = (dow: number) => clinic.hours.find((h) => h.day === dow);

export const isOpenDay = (dow: number): boolean =>
  Boolean(hoursRow(Math.abs(dow))?.open);

export const openDates = (): Date[] => {
  const today = new Date();
  return horizon(today, 0, 14).filter((d) => isOpenDay(d.getDay()));
};

export const timeSlots = (dow: number): string[] => {
  const row = hoursRow(dow);
  if (!row?.open || !row.close) return [];
  const [oh, om] = row.open.split(":").map(Number);
  const [ch, cm] = row.close.split(":").map(Number);
  const start = oh * 60 + om;
  const end = ch * 60 + cm;
  const slots: string[] = [];
  for (let t = start; t <= end - 30; t += 30) {
    slots.push(`${String(Math.floor(t / 60)).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`);
  }
  return slots;
};

export const parseDateAt = (date: string, time: string): Date => {
  const [y, m, d] = date.split("-").map(Number);
  const [hh, mm] = time.split(":").map(Number);
  return new Date(y, m - 1, d, hh, mm, 0, 0);
};

export const isUpcoming = (date: string): boolean => {
  const now = new Date();
  const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(`${date}T00:00:00`);
  return target >= midnight && target <= new Date(midnight.getFullYear(), midnight.getMonth(), midnight.getDate() + 13);
};

export const isFutureDateTime = (date: string, time: string): boolean =>
  parseDateAt(date, time).getTime() > Date.now();

export const formatDayLabel = (d: Date): string =>
  d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });

export const formatLongDay = (dow: number, open?: string, close?: string): string =>
  `${DAY_NAMES[dow]}${open && close ? ` ${open}–${close}` : closedWord()}`;

const closedWord = (): string => "Closed";

export const hoursSummary = (): string => {
  const open = clinic.hours.filter((h) => h.open);
  return open.map((h) => `${DAY_NAMES[h.day]} ${h.open}–${h.close}`).join("; ");
};
