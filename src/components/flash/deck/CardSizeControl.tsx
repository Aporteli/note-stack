import { CARD_HEIGHT, CARD_WIDTH } from "@/components/flash/lib/deck";

type Props = {
  width: number;
  height: number;
  onWidth: (next: number) => void;
  onHeight: (next: number) => void;
};

export function CardSizeControl({ width, height, onWidth, onHeight }: Props) {
  return (
    <div
      className="flex w-full min-w-0 flex-col gap-2 rounded-lg border border-line bg-paper px-3 py-2 sm:h-9 sm:w-auto sm:flex-row sm:items-center sm:gap-3 sm:py-0"
      role="group"
      aria-label="Card size"
    >
      <SizeSlider
        label="Width"
        value={width}
        min={CARD_WIDTH.min}
        max={CARD_WIDTH.max}
        onChange={onWidth}
      />
      <SizeSlider
        label="Height"
        value={height}
        min={CARD_HEIGHT.min}
        max={CARD_HEIGHT.max}
        onChange={onHeight}
      />
    </div>
  );
}

function SizeSlider({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (next: number) => void;
}) {
  return (
    <label className="flex min-w-0 flex-1 items-center gap-2 text-meta font-medium text-ink-soft">
      <span className="w-11 shrink-0">{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={10}
        value={value}
        aria-valuetext={`${value} pixels`}
        aria-label={`Card ${label.toLowerCase()}`}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-1 w-full min-w-0 flex-1 cursor-pointer accent-orchid sm:w-24"
      />
      <span className="w-8 tabular-nums text-ink">{value}</span>
    </label>
  );
}
