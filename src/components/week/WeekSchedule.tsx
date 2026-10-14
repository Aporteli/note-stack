"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { replaceDay, saveSlot, type WeekSlotData } from "@/app/week/actions";

const DAYS = [
  { id: 0, short: "Mon", label: "Monday" },
  { id: 1, short: "Tue", label: "Tuesday" },
  { id: 2, short: "Wed", label: "Wednesday" },
  { id: 3, short: "Thu", label: "Thursday" },
  { id: 4, short: "Fri", label: "Friday" },
  { id: 5, short: "Sat", label: "Saturday" },
  { id: 6, short: "Sun", label: "Sunday" },
] as const;

const HOURS = Array.from({ length: 24 }, (_, hour) => hour);

function slotKey(day: number, hour: number) {
  return `${day}-${hour}`;
}

function hourLabel(hour: number) {
  const h = hour % 12 || 12;
  return `${h} ${hour < 12 ? "am" : "pm"}`;
}

function toMap(slots: WeekSlotData[]) {
  const map: Record<string, string> = {};
  for (const slot of slots) map[slotKey(slot.day, slot.hour)] = slot.task;
  return map;
}

export function WeekSchedule({ slots }: { slots: WeekSlotData[] }) {
  const [tasks, setTasks] = useState(() => toMap(slots));
  const [day, setDay] = useState(0);
  const [hour, setHour] = useState(8);
  const [draft, setDraft] = useState(() => toMap(slots)[slotKey(0, 8)] ?? "");
  const [now, setNow] = useState<{ day: number; hour: number } | null>(null);
  const [overnight, setOvernight] = useState(false);
  const [copyTo, setCopyTo] = useState(1);
  const [confirmClear, setConfirmClear] = useState(false);
  const [pending, startTransition] = useTransition();
  const tasksRef = useRef(tasks);
  const placeRef = useRef({ day, hour });
  const draftRef = useRef(draft);
  const gridRef = useRef<HTMLDivElement>(null);

  tasksRef.current = tasks;
  placeRef.current = { day, hour };
  draftRef.current = draft;

  const visibleHours = overnight ? HOURS : HOURS.filter((value) => value >= 6);

  useEffect(() => {
    const date = new Date();
    const today = (date.getDay() + 6) % 7;
    const current = date.getHours();
    setNow({ day: today, hour: current });
    setDay(today);
    setHour(current);
    setDraft(tasksRef.current[slotKey(today, current)] ?? "");
    setCopyTo((today + 1) % 7);
    if (current < 6) setOvernight(true);
  }, []);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      const place = placeRef.current;
      const text = draftRef.current;
      const existing = tasksRef.current[slotKey(place.day, place.hour)] ?? "";
      if (text.trim() === existing) return;
      persist(place.day, place.hour, text);
    }, 400);
    return () => window.clearTimeout(handle);
  }, [draft, day, hour]);

  useEffect(() => {
    const root = gridRef.current;
    if (!root) return;
    const nodes = root.querySelectorAll<HTMLElement>(`[data-hour="${hour}"]`);
    const visible = [...nodes].find((node) => node.offsetParent !== null);
    visible?.scrollIntoView({ block: "nearest" });
  }, [hour, day, overnight]);

  function persist(targetDay: number, targetHour: number, task: string) {
    const key = slotKey(targetDay, targetHour);
    const text = task.trim();
    const existing = tasksRef.current[key] ?? "";
    if (text === existing) return;
    setTasks((current) => {
      const next = { ...current };
      if (text) next[key] = text;
      else delete next[key];
      tasksRef.current = next;
      return next;
    });
    startTransition(async () => {
      await saveSlot(targetDay, targetHour, text);
    });
  }

  function openCell(nextDay: number, nextHour: number) {
    const place = placeRef.current;
    persist(place.day, place.hour, draftRef.current);
    setConfirmClear(false);
    setDay(nextDay);
    setHour(nextHour);
    setDraft(tasksRef.current[slotKey(nextDay, nextHour)] ?? "");
  }

  function shiftHour(step: number) {
    const index = visibleHours.indexOf(hour);
    const next = visibleHours[index + step];
    if (next === undefined) return;
    openCell(day, next);
  }

  function copyDay() {
    if (copyTo === day) return;
    const next = { ...tasksRef.current };
    const rows: { hour: number; task: string }[] = [];
    for (const value of HOURS) {
      const task = next[slotKey(day, value)] ?? "";
      const key = slotKey(copyTo, value);
      if (task) next[key] = task;
      else delete next[key];
      rows.push({ hour: value, task });
    }
    tasksRef.current = next;
    setTasks(next);
    startTransition(async () => {
      await replaceDay(copyTo, rows);
    });
  }

  function clearDay() {
    if (!confirmClear) {
      setConfirmClear(true);
      return;
    }
    const next = { ...tasksRef.current };
    for (const value of HOURS) delete next[slotKey(day, value)];
    tasksRef.current = next;
    setTasks(next);
    setDraft("");
    setConfirmClear(false);
    startTransition(async () => {
      await replaceDay(day, []);
    });
  }

  const filled = useMemo(() => Object.keys(tasks).length, [tasks]);
  const dayLabel = DAYS[day]?.label ?? "Monday";
  const selectedTask = tasks[slotKey(day, hour)] ?? "";

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <div className="flex shrink-0 flex-wrap items-center gap-2">
        <p className="text-sm text-ink-soft">
          {filled} {filled === 1 ? "hour planned" : "hours planned"}
          {pending ? " · Saving" : " · Saved"}
        </p>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              if (!now) return;
              if (now.hour < 6) setOvernight(true);
              openCell(now.day, now.hour);
            }}
            className="rounded-md border border-line bg-white px-3 py-1.5 text-sm font-medium text-ink shadow-sm hover:bg-surface"
          >
            Now
          </button>
          <button
            type="button"
            onClick={() => {
              if (overnight && hour < 6) openCell(day, 6);
              setOvernight((value) => !value);
            }}
            className={`rounded-md border px-3 py-1.5 text-sm font-medium shadow-sm ${
              overnight
                ? "border-plum bg-plum text-ink-invert"
                : "border-line bg-white text-ink hover:bg-surface"
            }`}
          >
            {overnight ? "All 24 hours" : "Show overnight"}
          </button>
        </div>
      </div>

      <div className="flex shrink-0 gap-1 overflow-x-auto md:hidden">
        {DAYS.map((item) => {
          const active = item.id === day;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => openCell(item.id, hour)}
              className={`shrink-0 rounded-md px-3 py-1.5 text-sm font-medium ${
                active ? "bg-plum text-ink-invert" : "bg-surface text-ink-soft"
              }`}
            >
              {item.short}
              {now?.day === item.id ? " ·" : ""}
            </button>
          );
        })}
      </div>

      <div
        ref={gridRef}
        className="min-h-0 flex-1 overflow-auto rounded-2xl border border-line bg-white shadow-sm"
      >
        <ol className="divide-y divide-line md:hidden">
          {visibleHours.map((value) => {
            const task = tasks[slotKey(day, value)] ?? "";
            const selected = value === hour;
            const current = now?.day === day && now.hour === value;
            return (
              <li key={value} data-hour={value}>
                <button
                  type="button"
                  onClick={() => openCell(day, value)}
                  className={`flex w-full items-center gap-3 px-3 py-2 text-left ${
                    selected ? "bg-orchid-100" : current ? "bg-surface" : "bg-white"
                  }`}
                >
                  <span className="w-14 shrink-0 text-sm font-medium text-ink-soft">
                    {hourLabel(value)}
                  </span>
                  <span
                    className={`min-w-0 flex-1 truncate text-sm ${
                      task ? "text-ink" : "text-ink-faint"
                    }`}
                  >
                    {task || "Empty"}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>

        <table className="hidden w-full border-collapse text-left md:table">
          <thead className="sticky top-0 z-20 bg-paper">
            <tr>
              <th className="sticky left-0 z-30 w-16 border-b border-line bg-paper px-2 py-2 text-xs font-medium text-ink-faint">
                Time
              </th>
              {DAYS.map((item) => (
                <th
                  key={item.id}
                  className="border-b border-line px-1 py-2 text-center text-xs font-semibold"
                >
                  <button
                    type="button"
                    onClick={() => openCell(item.id, hour)}
                    className={`rounded-md px-2 py-1 ${
                      item.id === day
                        ? "bg-plum text-ink-invert"
                        : now?.day === item.id
                          ? "text-plum"
                          : "text-ink-soft hover:bg-surface"
                    }`}
                  >
                    {item.short}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visibleHours.map((value) => (
              <tr
                key={value}
                data-hour={value}
                className={now?.hour === value ? "bg-surface/70" : undefined}
              >
                <th className="sticky left-0 z-10 border-b border-line bg-paper px-2 py-1 text-xs font-medium text-ink-soft">
                  {hourLabel(value)}
                </th>
                {DAYS.map((item) => {
                  const task = tasks[slotKey(item.id, value)] ?? "";
                  const selected = item.id === day && value === hour;
                  return (
                    <td key={item.id} className="border-b border-l border-line p-1">
                      <button
                        type="button"
                        onClick={() => openCell(item.id, value)}
                        className={`flex h-12 w-full items-start overflow-hidden rounded-md px-2 py-1 text-left text-xs leading-4 ${
                          selected
                            ? "bg-orchid-100 text-ink ring-1 ring-orchid"
                            : task
                              ? "bg-surface text-ink hover:bg-surface-sunk"
                              : "text-transparent hover:bg-surface hover:text-ink-faint"
                        }`}
                      >
                        <span className="line-clamp-2">{task || "Add"}</span>
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <section className="shrink-0 rounded-2xl border border-line bg-white p-3 shadow-sm sm:p-4">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <h2 className="font-display text-lg font-semibold text-ink">
            {dayLabel}
            <span className="ml-2 text-sm font-medium text-ink-soft">
              {hourLabel(hour)}
            </span>
          </h2>
          <div className="ml-auto flex items-center gap-1">
            <button
              type="button"
              onClick={() => shiftHour(-1)}
              className="rounded-md px-2 py-1 text-sm font-medium text-ink-soft hover:bg-surface"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={() => shiftHour(1)}
              className="rounded-md px-2 py-1 text-sm font-medium text-ink-soft hover:bg-surface"
            >
              Next
            </button>
          </div>
        </div>
        <textarea
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          rows={3}
          placeholder={selectedTask ? undefined : "What needs to happen this hour?"}
          aria-label={`${dayLabel} at ${hourLabel(hour)}`}
          className="w-full resize-none rounded-xl border border-line bg-paper px-3 py-2 text-sm leading-6 text-ink outline-none placeholder:text-ink-faint"
        />
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <label className="flex items-center gap-2 text-sm text-ink-soft">
            Copy {DAYS[day]?.short} to
            <select
              value={copyTo}
              onChange={(event) => setCopyTo(Number(event.target.value))}
              className="rounded-md border border-line bg-white px-2 py-1 text-sm text-ink"
            >
              {DAYS.map((item) => (
                <option key={item.id} value={item.id} disabled={item.id === day}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            onClick={copyDay}
            disabled={copyTo === day}
            className="rounded-md bg-plum px-3 py-1.5 text-sm font-semibold text-ink-invert shadow-sm hover:bg-plum/80 disabled:opacity-40"
          >
            Copy day
          </button>
          <button
            type="button"
            onClick={clearDay}
            className="rounded-md px-3 py-1.5 text-sm font-medium text-danger hover:bg-surface"
          >
            {confirmClear ? `Erase ${dayLabel}?` : `Clear ${DAYS[day]?.short}`}
          </button>
        </div>
      </section>
    </div>
  );
}
