"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import {
  createSlot,
  replaceDay,
  updateSlot,
  type WeekSlotData,
} from "@/app/week/actions";

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
const ROW = 48;
const DAY_MINUTES = 24 * 60;

function hourLabel(hour: number) {
  const h = hour % 12 || 12;
  return `${h} ${hour < 12 ? "am" : "pm"}`;
}

function clock(minutes: number) {
  const clamped = Math.max(0, Math.min(DAY_MINUTES - 1, minutes));
  const hour = Math.floor(clamped / 60);
  const minute = clamped % 60;
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

function fromClock(value: string) {
  const [hour, minute] = value.split(":").map(Number);
  if (!Number.isInteger(hour) || !Number.isInteger(minute)) return null;
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) return null;
  return hour * 60 + minute;
}

function rangeLabel(startMin: number, endMin: number) {
  return `${clock(startMin)}–${clock(Math.min(endMin, DAY_MINUTES - 1))}`;
}

function fitRange(startMin: number, endMin: number) {
  const start = Math.max(0, Math.min(DAY_MINUTES - 2, startMin));
  let end = Math.max(0, Math.min(DAY_MINUTES, endMin));
  if (end <= start) end = Math.min(DAY_MINUTES, start + 30);
  return { startMin: start, endMin: end };
}

export function WeekSchedule({ slots }: { slots: WeekSlotData[] }) {
  const [events, setEvents] = useState<WeekSlotData[]>(slots);
  const [day, setDay] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [startMin, setStartMin] = useState(8 * 60);
  const [endMin, setEndMin] = useState(9 * 60);
  const [now, setNow] = useState<{ day: number; minutes: number } | null>(null);
  const [overnight, setOvernight] = useState(false);
  const [copyTo, setCopyTo] = useState(1);
  const [confirmClear, setConfirmClear] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const eventsRef = useRef(events);
  const selectedRef = useRef(selectedId);
  const draftRef = useRef(draft);
  const rangeRef = useRef({ startMin, endMin, day });
  const gridRef = useRef<HTMLDivElement>(null);
  const creating = useRef(new Set<string>());

  eventsRef.current = events;
  selectedRef.current = selectedId;
  draftRef.current = draft;
  rangeRef.current = { startMin, endMin, day };

  const visibleStart = overnight ? 0 : 6 * 60;
  const visibleHours = overnight ? HOURS : HOURS.filter((value) => value >= 6);

  useEffect(() => {
    const date = new Date();
    const today = (date.getDay() + 6) % 7;
    const minutes = date.getHours() * 60 + date.getMinutes();
    setNow({ day: today, minutes });
    setDay(today);
    setStartMin(date.getHours() * 60);
    setEndMin(Math.min(DAY_MINUTES, date.getHours() * 60 + 60));
    setCopyTo((today + 1) % 7);
    if (date.getHours() < 6) setOvernight(true);
  }, []);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      const id = selectedRef.current;
      if (!id) return;
      const current = eventsRef.current.find((event) => event.id === id);
      if (!current) return;
      const next = fitRange(rangeRef.current.startMin, rangeRef.current.endMin);
      const text = draftRef.current;
      if (
        text.trim() === current.task &&
        next.startMin === current.startMin &&
        next.endMin === current.endMin &&
        rangeRef.current.day === current.day
      ) {
        return;
      }
      const updated = {
        ...current,
        day: rangeRef.current.day,
        startMin: next.startMin,
        endMin: next.endMin,
        task: text,
      };
      setEvents((list) => list.map((event) => (event.id === id ? updated : event)));
      eventsRef.current = eventsRef.current.map((event) =>
        event.id === id ? updated : event,
      );
      void flush(updated);
    }, 400);
    return () => window.clearTimeout(handle);
  }, [draft, startMin, endMin, day, selectedId]);

  useEffect(() => {
    if (!editorOpen) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setEditorOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [editorOpen]);

  useEffect(() => {
    const root = gridRef.current;
    if (!root) return;
    const hour = Math.floor(startMin / 60);
    const nodes = root.querySelectorAll<HTMLElement>(`[data-hour="${hour}"]`);
    const visible = [...nodes].find((node) => node.offsetParent !== null);
    visible?.scrollIntoView({ block: "nearest" });
  }, [startMin, day, overnight]);

  async function flush(event: WeekSlotData) {
    const text = event.task.trim();
    if (!text) {
      if (!event.id.startsWith("temp-")) {
        startTransition(async () => {
          await updateSlot(event.id, event.day, event.startMin, event.endMin, "");
        });
        setEvents((list) => list.filter((item) => item.id !== event.id));
        if (selectedRef.current === event.id) setSelectedId(null);
      }
      return;
    }
    if (event.id.startsWith("temp-")) {
      if (creating.current.has(event.id)) return;
      creating.current.add(event.id);
      startTransition(async () => {
        const saved = await createSlot(event.day, event.startMin, event.endMin, text);
        creating.current.delete(event.id);
        if (!saved) return;
        const latest = eventsRef.current.find((item) => item.id === event.id);
        const merged = latest
          ? {
              ...saved,
              day: latest.day,
              startMin: latest.startMin,
              endMin: latest.endMin,
              task: latest.task.trim() || saved.task,
            }
          : saved;
        setEvents((list) => list.map((item) => (item.id === event.id ? merged : item)));
        eventsRef.current = eventsRef.current.map((item) =>
          item.id === event.id ? merged : item,
        );
        if (selectedRef.current === event.id) {
          selectedRef.current = merged.id;
          setSelectedId(merged.id);
        }
        if (
          merged.startMin !== saved.startMin ||
          merged.endMin !== saved.endMin ||
          merged.task !== saved.task ||
          merged.day !== saved.day
        ) {
          await updateSlot(merged.id, merged.day, merged.startMin, merged.endMin, merged.task);
        }
      });
      return;
    }
    startTransition(async () => {
      await updateSlot(event.id, event.day, event.startMin, event.endMin, text);
    });
  }

  function selectEvent(event: WeekSlotData) {
    selectedRef.current = event.id;
    draftRef.current = event.task;
    setConfirmClear(false);
    setEditorOpen(true);
    setSelectedId(event.id);
    setDay(event.day);
    setDraft(event.task);
    setStartMin(event.startMin);
    setEndMin(event.endMin);
  }

  function begin(nextDay: number, start: number, task = "", end = start + 60) {
    const fitted = fitRange(start, end);
    const existing = eventsRef.current.find(
      (event) => event.day === nextDay && event.startMin === fitted.startMin && event.task.trim(),
    );
    if (existing && !task) {
      selectEvent(existing);
      return;
    }
    const pruned = eventsRef.current.filter(
      (event) => !(event.id.startsWith("temp-") && !event.task.trim()),
    );
    const created: WeekSlotData = {
      id: `temp-${crypto.randomUUID()}`,
      day: nextDay,
      startMin: fitted.startMin,
      endMin: fitted.endMin,
      task,
    };
    const next = [...pruned, created];
    eventsRef.current = next;
    setEvents(next);
    selectEvent(created);
  }

  function applyRange(nextStart: number, nextEnd: number) {
    const fitted = fitRange(nextStart, nextEnd);
    setStartMin(fitted.startMin);
    setEndMin(fitted.endMin);
  }

  function copyDay() {
    if (copyTo === day) return;
    const rows = eventsRef.current
      .filter((event) => event.day === day && event.task.trim())
      .map((event) => ({
        startMin: event.startMin,
        endMin: event.endMin,
        task: event.task,
      }));
    const kept = eventsRef.current.filter((event) => event.day !== copyTo);
    eventsRef.current = kept;
    setEvents(kept);
    setSelectedId(null);
    setDraft("");
    startTransition(async () => {
      const saved = await replaceDay(copyTo, rows);
      const next = [...eventsRef.current.filter((event) => event.day !== copyTo), ...saved];
      eventsRef.current = next;
      setEvents(next);
    });
  }

  function clearDay() {
    if (!confirmClear) {
      setConfirmClear(true);
      return;
    }
    eventsRef.current = eventsRef.current.filter((event) => event.day !== day);
    setEvents(eventsRef.current);
    setSelectedId(null);
    setDraft("");
    setConfirmClear(false);
    startTransition(async () => {
      await replaceDay(day, []);
    });
  }

  const filled = useMemo(
    () => events.filter((event) => event.task.trim()).length,
    [events],
  );
  const dayLabel = DAYS[day]?.label ?? "Monday";
  const columnHeight = visibleHours.length * ROW;

  function columnEvents(dayId: number) {
    return events
      .filter((event) => event.day === dayId && event.endMin > visibleStart)
      .sort((a, b) => a.startMin - b.startMin);
  }

  function renderColumn(dayId: number, wide: boolean) {
    return (
      <div
        className={`relative ${wide ? "border-l border-line" : ""}`}
        style={{ height: columnHeight }}
      >
        {visibleHours.map((value, index) => (
          <button
            key={value}
            type="button"
            data-hour={value}
            onClick={() => begin(dayId, value * 60)}
            className={`absolute inset-x-0 border-b border-line text-left hover:bg-surface/80 ${
              now?.day === dayId && Math.floor(now.minutes / 60) === value
                ? "bg-surface/70"
                : ""
            }`}
            style={{ top: index * ROW, height: ROW }}
            aria-label={`Add on ${DAYS[dayId]?.label} at ${hourLabel(value)}`}
          />
        ))}
        {now?.day === dayId && now.minutes >= visibleStart ? (
          <div
            className="pointer-events-none absolute right-0 left-0 z-10 h-px bg-coral"
            style={{ top: ((now.minutes - visibleStart) / 60) * ROW }}
          />
        ) : null}
        {columnEvents(dayId).map((event) => {
          const start = Math.max(event.startMin, visibleStart);
          const end = Math.min(event.endMin, DAY_MINUTES);
          const selected = event.id === selectedId;
          return (
            <button
              key={event.id}
              type="button"
              onClick={(click) => {
                click.stopPropagation();
                selectEvent(event);
              }}
              className={`absolute right-1 left-1 z-20 overflow-hidden rounded-md px-1.5 py-0.5 text-left text-xs leading-4 ${
                selected
                  ? "bg-orchid-100 text-ink ring-1 ring-orchid"
                  : "bg-surface text-ink hover:bg-surface-sunk"
              }`}
              style={{
                top: ((start - visibleStart) / 60) * ROW + 2,
                height: Math.max(((end - start) / 60) * ROW - 4, 22),
              }}
            >
              <span className="block truncate font-medium">
                {event.task.trim() || "New task"}
              </span>
              <span className="block truncate text-ink-soft">
                {rangeLabel(event.startMin, event.endMin)}
              </span>
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <div className="flex shrink-0 flex-wrap items-center gap-2">
        <p className="text-sm text-ink-soft">
          {filled} {filled === 1 ? "task" : "tasks"}
          {pending ? " · Saving" : " · Saved"}
        </p>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              if (!now) return;
              if (now.minutes < 6 * 60) setOvernight(true);
              setDay(now.day);
              setSelectedId(null);
              setDraft("");
              applyRange(Math.floor(now.minutes / 15) * 15, Math.floor(now.minutes / 15) * 15 + 60);
            }}
            className="rounded-md border border-line bg-white px-3 py-1.5 text-sm font-medium text-ink shadow-sm hover:bg-surface"
          >
            Now
          </button>
          <button
            type="button"
            onClick={() => setOvernight((value) => !value)}
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
        {DAYS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => {
              setDay(item.id);
              setSelectedId(null);
              setDraft("");
              setConfirmClear(false);
            }}
            className={`shrink-0 rounded-md px-3 py-1.5 text-sm font-medium ${
              item.id === day ? "bg-plum text-ink-invert" : "bg-surface text-ink-soft"
            }`}
          >
            {item.short}
            {now?.day === item.id ? " ·" : ""}
          </button>
        ))}
      </div>

      <div
        ref={gridRef}
        className="min-h-0 flex-1 overflow-auto rounded-2xl border border-line bg-white shadow-sm"
      >
        <div className="md:hidden">
          <div className="grid grid-cols-[4rem_minmax(0,1fr)]">
            <div>
              {visibleHours.map((value) => (
                <div
                  key={value}
                  className="flex h-12 items-start border-b border-line px-2 pt-1 text-xs font-medium text-ink-soft"
                >
                  {hourLabel(value)}
                </div>
              ))}
            </div>
            {renderColumn(day, false)}
          </div>
        </div>

        <div className="hidden min-w-[760px] md:block">
          <div className="sticky top-0 z-30 grid grid-cols-[4rem_repeat(7,minmax(0,1fr))] bg-paper">
            <div className="border-b border-line" />
            {DAYS.map((item) => (
              <div key={item.id} className="border-b border-line px-1 py-2 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setDay(item.id);
                    setSelectedId(null);
                    setDraft("");
                    setConfirmClear(false);
                  }}
                  className={`rounded-md px-2 py-1 text-xs font-semibold ${
                    item.id === day
                      ? "bg-plum text-ink-invert"
                      : now?.day === item.id
                        ? "text-plum"
                        : "text-ink-soft hover:bg-surface"
                  }`}
                >
                  {item.short}
                </button>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-[4rem_repeat(7,minmax(0,1fr))]">
            <div>
              {visibleHours.map((value) => (
                <div
                  key={value}
                  data-hour={value}
                  className="flex h-12 items-start border-b border-line bg-paper px-2 pt-1 text-xs font-medium text-ink-soft"
                >
                  {hourLabel(value)}
                </div>
              ))}
            </div>
            {DAYS.map((item) => (
              <div key={item.id}>{renderColumn(item.id, true)}</div>
            ))}
          </div>
        </div>
      </div>

      {editorOpen ? (
      <div
        className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 p-3 sm:items-center"
        onClick={() => setEditorOpen(false)}
      >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="week-editor-title"
        onClick={(event) => event.stopPropagation()}
        className="max-h-[90dvh] w-full max-w-lg overflow-y-auto rounded-2xl border border-line bg-white p-3 shadow-sm sm:p-4"
      >
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <h2 id="week-editor-title" className="font-display text-lg font-semibold text-ink">{dayLabel}</h2>
          <button
            type="button"
            onClick={() => setEditorOpen(false)}
            className="ml-auto rounded-md px-2 py-1 text-sm font-medium text-ink-soft hover:bg-surface"
          >
            Close
          </button>
          <label className="flex items-center gap-2 text-sm text-ink-soft">
            Start
            <input
              type="time"
              step={60}
              value={clock(startMin)}
              onChange={(event) => {
                const next = fromClock(event.target.value);
                if (next === null) return;
                applyRange(next, endMin);
              }}
              className="rounded-md border border-line bg-paper px-2 py-1 text-sm text-ink"
            />
          </label>
          <label className="flex items-center gap-2 text-sm text-ink-soft">
            End
            <input
              type="time"
              step={60}
              value={endMin >= DAY_MINUTES ? "00:00" : clock(endMin)}
              onChange={(event) => {
                const next = fromClock(event.target.value);
                if (next === null) return;
                applyRange(startMin, next === 0 ? DAY_MINUTES : next);
              }}
              className="rounded-md border border-line bg-paper px-2 py-1 text-sm text-ink"
            />
          </label>
        </div>
        <textarea
          value={draft}
          onChange={(event) => {
            const value = event.target.value;
            draftRef.current = value;
            setDraft(value);
            if (!selectedRef.current && value.trim()) begin(day, startMin, value, endMin);
          }}
          rows={3}
          placeholder="What needs to happen?"
          aria-label={`${dayLabel} from ${clock(startMin)} to ${clock(Math.min(endMin, DAY_MINUTES - 1))}`}
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
      ) : null}
    </div>
  );
}
