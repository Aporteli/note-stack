import { HEADING_COLORS } from "@/components/Board/lib/heading/defaults";

type Props = {
  color: string;
  onColor: (color: string) => void;
};

export function HeadingColorControl({ color, onColor }: Props) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-12 text-sm text-slate-700">Color</span>
      <div className="flex gap-2">
        {HEADING_COLORS.map((swatch) => (
          <button
            key={swatch}
            type="button"
            aria-label={swatch}
            onClick={() => onColor(swatch)}
            className={`h-6 w-6 rounded-full border ${color === swatch ? "border-slate-900 ring-2 ring-slate-900/30" : "border-slate-200"}`}
            style={{ background: swatch }}
          />
        ))}
      </div>
    </div>
  );
}
