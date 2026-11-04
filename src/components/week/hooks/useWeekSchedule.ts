"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { createSlot, replaceDay, updateSlot, type WeekSlotData } from "@/app/week/actions";
import {
  DAY_MINUTES,
  DAYS,
  HOURS,
  ROW,
  SNAP,
  fitRange,
  resizeEdge,
  shiftRange,
  snapTo,
} from "@/components/week/lib/time";

export function useWeekSchedule(slots: WeekSlotData[], planId: string) {
  const [events, setEvents] = useState<WeekSlotData[]>(slots);
  const [day, setDay] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [color, setColor] = useState("surface");
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
  const colorRef = useRef(color);
  const rangeRef = useRef({ startMin, endMin, day });
  const gridRef = useRef<HTMLDivElement>(null);
  const creating = useRef(new Set<string>());
  const ignoreClick = useRef(false);
  const stopDrag = useRef<(() => void) | null>(null);
  const draggingId = useRef<string | null>(null);

  eventsRef.current = events;
  selectedRef.current = selectedId;
  draftRef.current = draft;
  colorRef.current = color;
  rangeRef.current = { startMin, endMin, day };

  const visibleStart = overnight ? 0 : 6 * 60;
  const visibleHours = overnight ? HOURS : HOURS.filter((value) => value >= 6);

  useEffect(() => {
    const date = new Date();
    const today = (date.getDay() + 6) % 7;
    const minutes = date.getHours() * 60 + date.getMinutes();
    const snapped = Math.floor(minutes / SNAP) * SNAP;
    setNow({ day: today, minutes });
    setDay(today);
    setStartMin(snapped);
    setEndMin(Math.min(DAY_MINUTES, snapped + 60));
    setCopyTo((today + 1) % 7);
    if (date.getHours() < 6) setOvernight(true);
  }, []);

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
        const saved = await createSlot(
          event.day,
          event.startMin,
          event.endMin,
          text,
          event.color,
          planId,
        );
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
              color: latest.color || saved.color,
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
          merged.day !== saved.day ||
          merged.color !== saved.color
        ) {
          await updateSlot(
            merged.id,
            merged.day,
            merged.startMin,
            merged.endMin,
            merged.task,
            merged.color,
          );
        }
      });
      return;
    }
    startTransition(async () => {
      await updateSlot(event.id, event.day, event.startMin, event.endMin, text, event.color);
    });
  }

  useEffect(() => {
    const handle = window.setTimeout(() => {
      const id = selectedRef.current;
      if (!id || draggingId.current === id) return;
      const current = eventsRef.current.find((event) => event.id === id);
      if (!current) return;
      const next = fitRange(rangeRef.current.startMin, rangeRef.current.endMin);
      const text = draftRef.current;
      if (
        text.trim() === current.task &&
        next.startMin === current.startMin &&
        next.endMin === current.endMin &&
        rangeRef.current.day === current.day &&
        colorRef.current === current.color
      ) {
        return;
      }
      const updated = {
        ...current,
        day: rangeRef.current.day,
        startMin: next.startMin,
        endMin: next.endMin,
        task: text,
        color: colorRef.current,
      };
      setEvents((list) => list.map((event) => (event.id === id ? updated : event)));
      eventsRef.current = eventsRef.current.map((event) =>
        event.id === id ? updated : event,
      );
      void flush(updated);
    }, 400);
    return () => window.clearTimeout(handle);
  }, [draft, startMin, endMin, day, selectedId, color]);

  useEffect(() => () => stopDrag.current?.(), []);

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

  function selectEvent(event: WeekSlotData) {
    selectedRef.current = event.id;
    draftRef.current = event.task;
    colorRef.current = event.color || "surface";
    setConfirmClear(false);
    setEditorOpen(true);
    setSelectedId(event.id);
    setDay(event.day);
    setDraft(event.task);
    setColor(colorRef.current);
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
      color: "surface",
      planId,
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

  function writeTimes(id: string, start: number, end: number, save: boolean) {
    const current = eventsRef.current.find((item) => item.id === id);
    if (!current) return;
    const fitted = fitRange(start, end);
    const task = selectedRef.current === id ? draftRef.current : current.task;
    const updated = { ...current, startMin: fitted.startMin, endMin: fitted.endMin, task };
    const same =
      fitted.startMin === current.startMin &&
      fitted.endMin === current.endMin &&
      task === current.task;
    if (!same) {
      const next = eventsRef.current.map((item) => (item.id === id ? updated : item));
      eventsRef.current = next;
      setEvents(next);
      if (selectedRef.current === id) {
        setStartMin(fitted.startMin);
        setEndMin(fitted.endMin);
      }
    }
    if (save) void flush(updated);
  }

  function startGesture(
    pointer: ReactPointerEvent,
    slot: WeekSlotData,
    edge: "move" | "start" | "end",
  ) {
    if (pointer.button !== 0) return;
    pointer.stopPropagation();
    stopDrag.current?.();
    const originY = pointer.clientY;
    const originStart = slot.startMin;
    const originEnd = slot.endMin;
    let dragged = false;
    let stopped = false;
    let lastDelta: number | null = null;
    let latest = { startMin: originStart, endMin: originEnd };

    function onMove(ev: PointerEvent) {
      const dy = ev.clientY - originY;
      if (!dragged && Math.abs(dy) < 4) return;
      if (!dragged) draggingId.current = slot.id;
      dragged = true;
      ev.preventDefault();
      const delta = snapTo((dy / ROW) * 60);
      if (delta === lastDelta) return;
      lastDelta = delta;
      latest =
        edge === "move"
          ? shiftRange(originStart, originEnd, delta)
          : resizeEdge(originStart, originEnd, edge, delta);
      writeTimes(slot.id, latest.startMin, latest.endMin, false);
    }

    function finish(commit: boolean) {
      if (stopped) return;
      stopped = true;
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", finishDrag);
      window.removeEventListener("pointercancel", finishDrag);
      if (stopDrag.current === finishDrag) stopDrag.current = null;
      const shouldSave = commit && dragged;
      draggingId.current = null;
      if (!shouldSave) return;
      ignoreClick.current = true;
      writeTimes(slot.id, latest.startMin, latest.endMin, true);
    }

    function finishDrag() {
      finish(true);
    }

    stopDrag.current = finishDrag;
    window.addEventListener("pointermove", onMove, { passive: false });
    window.addEventListener("pointerup", finishDrag);
    window.addEventListener("pointercancel", finishDrag);
  }

  function copyDay() {
    if (copyTo === day) return;
    const rows = eventsRef.current
      .filter((event) => event.day === day && event.task.trim())
      .map((event) => ({
        startMin: event.startMin,
        endMin: event.endMin,
        task: event.task,
        color: event.color,
      }));
    const kept = eventsRef.current.filter((event) => event.day !== copyTo);
    eventsRef.current = kept;
    setEvents(kept);
    setSelectedId(null);
    setDraft("");
    startTransition(async () => {
      const saved = await replaceDay(copyTo, rows, planId);
      const next = [...eventsRef.current.filter((event) => event.day !== copyTo), ...saved];
      eventsRef.current = next;
      setEvents(next);
    });
  }

  function deleteTask() {
    const id = selectedRef.current;
    if (!id) return;
    const current = eventsRef.current.find((event) => event.id === id);
    selectedRef.current = null;
    const next = eventsRef.current.filter((event) => event.id !== id);
    eventsRef.current = next;
    setEvents(next);
    setSelectedId(null);
    setDraft("");
    setEditorOpen(false);
    if (!current || current.id.startsWith("temp-")) return;
    startTransition(async () => {
      await updateSlot(current.id, current.day, current.startMin, current.endMin, "");
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
      await replaceDay(day, [], planId);
    });
  }

  function chooseDay(next: number) {
    setDay(next);
    setSelectedId(null);
    setDraft("");
    setConfirmClear(false);
  }

  function jumpToNow() {
    if (!now) return;
    if (now.minutes < 6 * 60) setOvernight(true);
    setDay(now.day);
    setSelectedId(null);
    setDraft("");
    applyRange(now.minutes, now.minutes + 60);
  }

  function chooseColor(id: string) {
    colorRef.current = id;
    setColor(id);
  }

  function changeDraft(value: string) {
    draftRef.current = value;
    setDraft(value);
    if (!selectedRef.current && value.trim()) begin(day, startMin, value, endMin);
  }

  function openEvent(event: WeekSlotData) {
    if (ignoreClick.current) {
      ignoreClick.current = false;
      return;
    }
    selectEvent(event);
  }

  const filled = useMemo(() => events.filter((event) => event.task.trim()).length, [events]);
  const dayLabel = DAYS[day]?.label ?? "Monday";
  const columnHeight = visibleHours.length * ROW;

  return {
    events,
    day,
    selectedId,
    draft,
    color,
    startMin,
    endMin,
    now,
    overnight,
    setOvernight,
    copyTo,
    setCopyTo,
    confirmClear,
    editorOpen,
    setEditorOpen,
    pending,
    gridRef,
    visibleStart,
    visibleHours,
    filled,
    dayLabel,
    columnHeight,
    begin,
    applyRange,
    startGesture,
    copyDay,
    deleteTask,
    clearDay,
    chooseDay,
    jumpToNow,
    chooseColor,
    changeDraft,
    openEvent,
  };
}
