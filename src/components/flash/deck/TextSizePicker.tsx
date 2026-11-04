import { TEXT_SIZES, textSizeFont, type TextSize } from "@/components/flash/lib/deck";

type Props = {
  textSize: TextSize;
  onChange: (next: TextSize) => void;
};

export function TextSizePicker({ textSize, onChange }: Props) {
  return (
    <div
      className="flex items-center rounded-lg border border-line bg-paper p-0.5"
      role="group"
      aria-label="Text size"
    >
      {TEXT_SIZES.map((size) => (
        <button
          key={size.id}
          type="button"
          aria-pressed={textSize === size.id}
          aria-label={size.label}
          title={size.label}
          onClick={() => onChange(size.id)}
          className={`grid h-8 w-8 place-items-center rounded-md font-display font-semibold leading-none text-ink-soft hover:text-ink ${
            textSize === size.id ? "bg-surface text-ink" : ""
          }`}
          style={{ fontSize: textSizeFont(size.id) }}
        >
          A
        </button>
      ))}
    </div>
  );
}
