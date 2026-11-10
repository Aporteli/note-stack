type Option<T extends string> = { id: T; label: string };

type Props<T extends string> = {
  label: string;
  value: T;
  options: Option<T>[];
  onChange: (id: T) => void;
};

export function OptionGroup<T extends string>({ label, value, options, onChange }: Props<T>) {
  return (
    <div className="flex items-center gap-1">
      {label ? <span className="px-1 text-meta text-ink-faint">{label}</span> : null}
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          onClick={() => onChange(option.id)}
          className={`whitespace-nowrap rounded px-2 py-1 text-sm font-medium ${
            value === option.id ? "bg-surface text-ink" : "text-ink-soft hover:bg-surface hover:text-ink"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
