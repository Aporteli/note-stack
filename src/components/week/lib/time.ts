import type { WeekSlotData } from "@/app/week/actions";

export const DAYS = [
  { id: 0, short: "ორშ", label: "ორშაბათი" },
  { id: 1, short: "სამ", label: "სამშაბათი" },
  { id: 2, short: "ოთხ", label: "ოთხშაბათი" },
  { id: 3, short: "ხუთ", label: "ხუთშაბათი" },
  { id: 4, short: "პარ", label: "პარასკევი" },
  { id: 5, short: "შაბ", label: "შაბათი" },
  { id: 6, short: "კვი", label: "კვირა" },
] as const;

export const HOURS = Array.from({ length: 24 }, (_, hour) => hour);
export const SLOT_MINUTES = 5;
export const SLOTS_PER_HOUR = 60 / SLOT_MINUTES;
export const SLOT_H = 40;
export const ROW = SLOT_H * SLOTS_PER_HOUR;
export const DAY_MINUTES = 24 * 60;
export const SNAP = SLOT_MINUTES;
export const MIN_DURATION = SLOT_MINUTES;
/** `<input type="time">` counts step in seconds, so 60 is one minute. */
export const TIME_STEP = 60;

export const TASK_COLORS = [
  { id: "surface", swatch: "bg-surface", block: "bg-surface" },
  { id: "orchid", swatch: "bg-orchid", block: "bg-orchid-100" },
  { id: "coral", swatch: "bg-coral", block: "bg-coral/30" },
  { id: "lagoon", swatch: "bg-lagoon", block: "bg-lagoon/30" },
  { id: "mint", swatch: "bg-mint", block: "bg-mint/50" },
  { id: "plum", swatch: "bg-plum", block: "bg-plum/25" },
  { id: "dusk", swatch: "bg-dusk", block: "bg-dusk/30" },
  { id: "indigo", swatch: "bg-indigo", block: "bg-indigo/30" },
  { id: "amber", swatch: "bg-amber", block: "bg-amber/40" },
  { id: "slate", swatch: "bg-slate", block: "bg-slate/25" },
] as const;

export function taskColor(id: string) {
  return TASK_COLORS.find((item) => item.id === id) ?? TASK_COLORS[0];
}

export function hourLabel(hour: number) {
  const h = hour % 12 || 12;
  return `${h} ${hour < 12 ? "am" : "pm"}`;
}

export function clock(minutes: number) {
  const clamped = Math.max(0, Math.min(DAY_MINUTES - 1, minutes));
  const hour = Math.floor(clamped / 60);
  const minute = clamped % 60;
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

export function fromClock(value: string) {
  const [hour, minute] = value.split(":").map(Number);
  if (!Number.isInteger(hour) || !Number.isInteger(minute)) return null;
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) return null;
  return hour * 60 + minute;
}

export function rangeLabel(startMin: number, endMin: number) {
  return `${clock(startMin)}–${clock(Math.min(endMin, DAY_MINUTES - 1))}`;
}

export function fitRange(startMin: number, endMin: number) {
  const start = Math.max(0, Math.min(DAY_MINUTES - 2, startMin));
  let end = Math.max(0, Math.min(DAY_MINUTES, endMin));
  if (end <= start) end = Math.min(DAY_MINUTES, start + 30);
  return { startMin: start, endMin: end };
}

export function snapTo(minutes: number, step = SNAP) {
  return Math.round(minutes / step) * step;
}

export function shiftRange(startMin: number, endMin: number, delta: number) {
  const duration = Math.max(1, endMin - startMin);
  const start = Math.max(0, Math.min(DAY_MINUTES - duration, startMin + delta));
  return { startMin: start, endMin: start + duration };
}

export function resizeEdge(
  startMin: number,
  endMin: number,
  edge: "start" | "end",
  delta: number,
) {
  if (edge === "start") {
    const start = Math.max(0, Math.min(endMin - MIN_DURATION, startMin + delta));
    return { startMin: start, endMin };
  }
  const end = Math.min(DAY_MINUTES, Math.max(startMin + MIN_DURATION, endMin + delta));
  return { startMin, endMin: end };
}

export function columnEvents(events: WeekSlotData[], dayId: number, visibleStart: number) {
  return events
    .filter((event) => event.day === dayId && event.endMin > visibleStart)
    .sort((a, b) => a.startMin - b.startMin);
}
