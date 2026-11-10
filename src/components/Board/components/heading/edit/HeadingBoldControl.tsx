type Props = {
  bold: boolean;
  onBold: (bold: boolean) => void;
};

export function HeadingBoldControl({ bold, onBold }: Props) {
  return (
    <button
      type="button"
      aria-pressed={bold}
      onClick={() => onBold(!bold)}
      className={`h-8 w-8 text-sm font-bold ${bold ? "bg-slate-900 text-white" : "bg-white text-slate-700 ring-1 ring-slate-200"}`}
    >
      B
    </button>
  );
}
