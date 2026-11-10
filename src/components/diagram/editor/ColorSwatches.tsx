import { SWATCH_COLOR } from "@/components/diagram/colors";

type Swatch<T extends string> = { id: T; label: string };

type Props<T extends string> = {
  label: string;
  swatches: Swatch<T>[];
  active: T;
  onPick: (id: T) => void;
};

export function ColorSwatches<T extends string>({ label, swatches, active, onPick }: Props<T>) {
  return (
    <div className="flex items-center gap-1.5">
      {label ? <span className="px-1 text-meta text-ink-faint">{label}</span> : null}
      {swatches.map((swatch) => (
        <button
          key={swatch.id}
          type="button"
          aria-label={swatch.label}
          title={swatch.label}
          onClick={() => onPick(swatch.id)}
          className={`h-5 w-5 rounded-full border border-line ring-2 ${
            active === swatch.id ? "ring-ink" : "ring-transparent"
          }`}
          style={{ background: SWATCH_COLOR[swatch.id as keyof typeof SWATCH_COLOR] }}
        />
      ))}
    </div>
  );
}
