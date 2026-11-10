import type { HeadingAlign } from "@/components/Board/types/heading";

const OPTIONS: HeadingAlign[] = ["left", "center", "right"];

type Props = {
  align: HeadingAlign;
  onAlign: (align: HeadingAlign) => void;
};

export function HeadingAlignControl({ align, onAlign }: Props) {
  return (
    <div className="flex gap-1">
      {OPTIONS.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onAlign(option)}
          className={`h-8 px-2 text-xs capitalize ${
            align === option ? "bg-slate-900 text-white" : "bg-white text-slate-700 ring-1 ring-slate-200"
          }`}
        >
          {option}
        </button>
      ))}
    </div>
  );
}
