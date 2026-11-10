import { HEADING_FONT_MAX, HEADING_FONT_MIN } from "@/components/Board/lib/heading/defaults";

type Props = {
  size: number;
  onSize: (size: number) => void;
};

export function HeadingSizeControl({ size, onSize }: Props) {
  return (
    <label className="flex items-center gap-3 text-sm text-slate-700">
      <span className="w-12">Size</span>
      <input
        type="range"
        min={HEADING_FONT_MIN}
        max={HEADING_FONT_MAX}
        value={size}
        aria-label="Title size"
        onChange={(event) => onSize(Number(event.target.value))}
        className="flex-1"
      />
      <span className="w-8 text-right text-slate-500">{size}</span>
    </label>
  );
}
