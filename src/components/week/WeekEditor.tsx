import {
  DAY_MINUTES,
  DAYS,
  TASK_COLORS,
  TIME_STEP,
  clock,
  fromClock,
} from "@/components/week/lib/time";

type Props = {
  day: number;
  dayLabel: string;
  startMin: number;
  endMin: number;
  color: string;
  draft: string;
  copyTo: number;
  selectedId: string | null;
  confirmClear: boolean;
  onClose: () => void;
  onStart: (minutes: number) => void;
  onEnd: (minutes: number) => void;
  onColor: (id: string) => void;
  onDraft: (value: string) => void;
  onCopyTo: (day: number) => void;
  onCopy: () => void;
  onDelete: () => void;
  onClear: () => void;
};

export function WeekEditor({
  day,
  dayLabel,
  startMin,
  endMin,
  color,
  draft,
  copyTo,
  selectedId,
  confirmClear,
  onClose,
  onStart,
  onEnd,
  onColor,
  onDraft,
  onCopyTo,
  onCopy,
  onDelete,
  onClear,
}: Props) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 p-3 sm:items-center"
      onClick={onClose}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="week-editor-title"
        onClick={(event) => event.stopPropagation()}
        className="min-h-[70dvh] w-full max-w-lg overflow-y-auto rounded-2xl border border-line bg-white p-3 shadow-sm sm:p-4"
      >
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <h2 id="week-editor-title" className="font-display text-lg font-semibold text-ink">
            {dayLabel}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="ml-auto rounded-md px-2 py-1 text-sm font-medium text-ink-soft hover:bg-surface"
          >
            Close
          </button>
          <label className="flex items-center gap-2 text-sm text-ink-soft">
            Start
            <input
              type="time"
              step={TIME_STEP}
              value={clock(startMin)}
              onChange={(event) => {
                const next = fromClock(event.target.value);
                if (next === null) return;
                onStart(next);
              }}
              className="rounded-md border border-line bg-paper px-2 py-1 text-sm text-ink"
            />
          </label>
          <label className="flex items-center gap-2 text-sm text-ink-soft">
            End
            <input
              type="time"
              step={TIME_STEP}
              value={endMin >= DAY_MINUTES ? "00:00" : clock(endMin)}
              onChange={(event) => {
                const next = fromClock(event.target.value);
                if (next === null) return;
                onEnd(next === 0 ? DAY_MINUTES : next);
              }}
              className="rounded-md border border-line bg-paper px-2 py-1 text-sm text-ink"
            />
          </label>
          <div className="flex items-center gap-1" role="group" aria-label="Task color">
            {TASK_COLORS.map((item) => (
              <button
                key={item.id}
                type="button"
                aria-label={item.id}
                aria-pressed={color === item.id}
                onClick={() => onColor(item.id)}
                className={`size-5 rounded-full border ${item.swatch} ${
                  color === item.id ? "ring-2 ring-ink" : "border-line"
                }`}
              />
            ))}
          </div>
        </div>
        <textarea
          value={draft}
          onChange={(event) => onDraft(event.target.value)}
          rows={18}
          placeholder="What needs to happen?"
          aria-label={`${dayLabel} from ${clock(startMin)} to ${clock(Math.min(endMin, DAY_MINUTES - 1))}`}
          className="w-full resize-none rounded-xl border border-line bg-paper px-3 py-2 text-sm leading-6 text-ink outline-none placeholder:text-ink-faint"
        />
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <label className="flex items-center gap-2 text-sm text-ink-soft">
            Copy {DAYS[day]?.short} to
            <select
              value={copyTo}
              onChange={(event) => onCopyTo(Number(event.target.value))}
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
            onClick={onCopy}
            disabled={copyTo === day}
            className="rounded-md bg-plum px-3 py-1.5 text-sm font-semibold text-ink-invert shadow-sm hover:bg-plum/80 disabled:opacity-40"
          >
            Copy day
          </button>
          <button
            type="button"
            onClick={onDelete}
            disabled={!selectedId}
            className="rounded-md px-3 py-1.5 text-sm font-medium text-danger hover:bg-surface disabled:opacity-40"
          >
            Delete task
          </button>
          <button
            type="button"
            onClick={onClear}
            className="rounded-md px-3 py-1.5 text-sm font-medium text-danger hover:bg-surface"
          >
            {confirmClear ? `Erase ${dayLabel}?` : `Clear ${DAYS[day]?.short}`}
          </button>
        </div>
      </section>
    </div>
  );
}
