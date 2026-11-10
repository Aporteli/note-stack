import type { DrawMode, Layout } from "@/components/flash/lib/deck";

const segment = "h-full rounded-md px-2.5 text-meta font-medium";

export function LayoutToggle({
  layout,
  onChange,
}: {
  layout: Layout;
  onChange: (next: Layout) => void;
}) {
  return (
    <div
      className="flex h-9 items-center rounded-lg border border-line bg-paper p-0.5"
      role="group"
      aria-label="Page layout"
    >
      <button
        type="button"
        aria-pressed={layout === "grid"}
        onClick={() => onChange("grid")}
        className={`${segment} ${
          layout === "grid" ? "bg-surface text-ink" : "text-ink-soft hover:text-ink"
        }`}
      >
        All cards
      </button>
      <button
        type="button"
        aria-pressed={layout === "random"}
        onClick={() => onChange("random")}
        className={`${segment} ${
          layout === "random" ? "bg-surface text-ink" : "text-ink-soft hover:text-ink"
        }`}
      >
        One card
      </button>
    </div>
  );
}

export function DrawModeToggle({
  drawMode,
  onChange,
}: {
  drawMode: DrawMode;
  onChange: (next: DrawMode) => void;
}) {
  return (
    <div
      className="flex h-9 items-center rounded-lg border border-line bg-paper p-0.5"
      role="group"
      aria-label="Random draw mode"
    >
      <button
        type="button"
        aria-pressed={drawMode === "repeat"}
        onClick={() => onChange("repeat")}
        className={`${segment} ${
          drawMode === "repeat" ? "bg-surface text-ink" : "text-ink-soft hover:text-ink"
        }`}
      >
        Can repeat
      </button>
      <button
        type="button"
        aria-pressed={drawMode === "once"}
        onClick={() => onChange("once")}
        className={`${segment} ${
          drawMode === "once" ? "bg-surface text-ink" : "text-ink-soft hover:text-ink"
        }`}
      >
        Each once
      </button>
    </div>
  );
}
