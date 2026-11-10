type Props = {
  value: string;
  header: boolean;
  onChange: (value: string) => void;
};

export function TableCell({ value, header, onChange }: Props) {
  return (
    <input
      data-table-edit
      value={value}
      onChange={(event) => onChange(event.target.value)}
      onPointerDown={(event) => event.stopPropagation()}
      className={`h-full w-full border-b border-l border-slate-300 px-2 text-sm text-slate-800 outline-none ${
        header ? "bg-[#d5dbe3]" : "bg-white"
      }`}
    />
  );
}
