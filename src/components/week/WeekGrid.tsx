import type { RefObject } from "react";
import type { WeekSlotData } from "@/app/week/actions";
import { DAYS, ROW, hourLabel } from "@/components/week/lib/time";
import { WeekColumn } from "@/components/week/WeekColumn";
import type { ComponentProps } from "react";

type Column = Omit<ComponentProps<typeof WeekColumn>, "dayId" | "wide" | "height">;

type Props = Column & {
  day: number;
  height: number;
  visibleHours: number[];
  gridRef: RefObject<HTMLDivElement | null>;
  onDay: (day: number) => void;
  now: { day: number; minutes: number } | null;
};

export function WeekGrid({
  day,
  height,
  visibleHours,
  gridRef,
  onDay,
  now,
  ...column
}: Props) {
  return (
    <div
      ref={gridRef}
      className="min-h-0 flex-1 overflow-auto rounded-2xl border border-line bg-white shadow-sm"
    >
      <div className="md:hidden">
        <div className="grid grid-cols-[4rem_minmax(0,1fr)]">
          <HourRail hours={visibleHours} marked={false} />
          <WeekColumn {...column} dayId={day} wide={false} height={height} visibleHours={visibleHours} now={now} />
        </div>
      </div>

      <div className="hidden min-w-[760px] md:block">
        <div className="sticky top-0 z-30 grid grid-cols-[4rem_repeat(7,minmax(0,1fr))] bg-paper">
          <div className="border-b border-line" />
          {DAYS.map((item) => (
            <div key={item.id} className="border-b border-line px-1 py-2 text-center">
              <button
                type="button"
                onClick={() => onDay(item.id)}
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
          <HourRail hours={visibleHours} marked />
          {DAYS.map((item) => (
            <div key={item.id}>
              <WeekColumn
                {...column}
                dayId={item.id}
                wide
                height={height}
                visibleHours={visibleHours}
                now={now}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function HourRail({ hours, marked }: { hours: number[]; marked: boolean }) {
  return (
    <div>
      {hours.map((value) => (
        <div
          key={value}
          data-hour={marked ? value : undefined}
          className={`flex items-start border-b border-line px-2 pt-1 text-xs font-medium text-ink-soft ${
            marked ? "bg-paper" : ""
          }`}
          style={{ height: ROW }}
        >
          {hourLabel(value)}
        </div>
      ))}
    </div>
  );
}
