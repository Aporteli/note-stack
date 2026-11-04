import { DAYS } from "@/components/week/lib/time";

export function WeekToolbar({
  filled,
  pending,
  now,
  overnight,
  onNow,
  onOvernight,
}: {
  filled: number;
  pending: boolean;
  now: { day: number; minutes: number } | null;
  overnight: boolean;
  onNow: () => void;
  onOvernight: () => void;
}) {
  return (
    <div className="flex shrink-0 flex-wrap items-center gap-2">
      <p className="text-sm text-ink-soft">
        {filled} {filled === 1 ? "task" : "tasks"}
        {pending ? " · Saving" : " · Saved"}
      </p>
      <div className="ml-auto flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onNow}
          className="rounded-md border border-line bg-white px-3 py-1.5 text-sm font-medium text-ink shadow-sm hover:bg-surface"
        >
          Now
        </button>
        <button
          type="button"
          onClick={onOvernight}
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
  );
}

export function WeekMobileDays({
  day,
  now,
  onDay,
}: {
  day: number;
  now: { day: number; minutes: number } | null;
  onDay: (day: number) => void;
}) {
  return (
    <div className="flex shrink-0 gap-1 overflow-x-auto md:hidden">
      {DAYS.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => onDay(item.id)}
          className={`shrink-0 rounded-md px-3 py-1.5 text-sm font-medium ${
            item.id === day ? "bg-plum text-ink-invert" : "bg-surface text-ink-soft"
          }`}
        >
          {item.short}
          {now?.day === item.id ? " ·" : ""}
        </button>
      ))}
    </div>
  );
}
