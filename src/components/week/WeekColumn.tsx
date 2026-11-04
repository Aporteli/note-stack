import type { PointerEvent } from "react";
import type { WeekSlotData } from "@/app/week/actions";
import {
  DAY_MINUTES,
  DAYS,
  ROW,
  SLOT_H,
  SLOT_MINUTES,
  SLOTS_PER_HOUR,
  clock,
  columnEvents,
  rangeLabel,
  taskColor,
} from "@/components/week/lib/time";

type Gesture = (
  pointer: PointerEvent<HTMLElement>,
  slot: WeekSlotData,
  edge: "move" | "start" | "end",
) => void;

type Props = {
  dayId: number;
  wide: boolean;
  height: number;
  visibleHours: number[];
  visibleStart: number;
  now: { day: number; minutes: number } | null;
  events: WeekSlotData[];
  selectedId: string | null;
  onAdd: (dayId: number, start: number) => void;
  onGesture: Gesture;
  onOpen: (event: WeekSlotData) => void;
};

export function WeekColumn({
  dayId,
  wide,
  height,
  visibleHours,
  visibleStart,
  now,
  events,
  selectedId,
  onAdd,
  onGesture,
  onOpen,
}: Props) {
  return (
    <div
      className={`relative ${wide ? "border-l border-line" : ""}`}
      style={{ height }}
    >
      {visibleHours.flatMap((value, index) =>
        Array.from({ length: SLOTS_PER_HOUR }, (_, slot) => {
          const minute = slot * SLOT_MINUTES;
          const start = value * 60 + minute;
          const current =
            now?.day === dayId && now.minutes >= start && now.minutes < start + SLOT_MINUTES;
          return (
            <button
              key={start}
              type="button"
              data-hour={slot === 0 ? value : undefined}
              onClick={() => onAdd(dayId, start)}
              className={`absolute inset-x-0 border-b text-left hover:bg-surface/80 ${
                slot === SLOTS_PER_HOUR - 1 ? "border-line" : "border-dashed border-line/50"
              } ${current ? "bg-surface/70" : ""}`}
              style={{ top: index * ROW + slot * SLOT_H, height: SLOT_H }}
              aria-label={`Add on ${DAYS[dayId]?.label} at ${clock(start)}`}
            />
          );
        }),
      )}
      {now?.day === dayId && now.minutes >= visibleStart ? (
        <div
          className="pointer-events-none absolute right-0 left-0 z-10 h-px bg-coral"
          style={{ top: ((now.minutes - visibleStart) / 60) * ROW }}
        />
      ) : null}
      {columnEvents(events, dayId, visibleStart).map((event) => {
        const start = Math.max(event.startMin, visibleStart);
        const end = Math.min(event.endMin, DAY_MINUTES);
        const selected = event.id === selectedId;
        const tone = taskColor(event.color).block;
        return (
          <button
            key={event.id}
            type="button"
            onPointerDown={(pointer) => {
              if ((pointer.target as HTMLElement).closest("[data-resize]")) return;
              onGesture(pointer, event, "move");
            }}
            onClick={(click) => {
              click.stopPropagation();
              onOpen(event);
            }}
            className={`group absolute flex flex-col items-start border border-black/50 right-1 left-1 z-20 cursor-grab touch-none overflow-hidden rounded-md px-1.5 py-0.5 text-left text-xs leading-4 select-none active:cursor-grabbing ${tone} text-ink ${selected ? "ring-1 ring-orchid" : ""}`}
            style={{
              top: ((start - visibleStart) / 60) * ROW + 1,
              height: Math.max(((end - start) / 60) * ROW - 2, 0),
            }}
          >
            <span
              data-resize="start"
              className="absolute inset-x-0 top-0 z-10 h-2 cursor-ns-resize"
              onPointerDown={(pointer) => onGesture(pointer, event, "start")}
            />
            <span className="w-full min-w-0 font-medium whitespace-pre-wrap break-words">
              {event.task.trim() || "New task"}
            </span>
            <span className="block truncate text-ink-soft mt-1">
              {rangeLabel(event.startMin, event.endMin)}
            </span>
            <span
              data-resize="end"
              className="absolute inset-x-0 bottom-0 z-10 h-2 cursor-ns-resize"
              onPointerDown={(pointer) => onGesture(pointer, event, "end")}
            />
          </button>
        );
      })}
    </div>
  );
}
