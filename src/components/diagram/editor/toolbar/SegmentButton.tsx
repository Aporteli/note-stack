import type { ReactNode } from "react";

type Props = {
  label: string;
  title?: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children?: ReactNode;
};

export function SegmentButton({ label, title, active = false, disabled = false, onClick, children }: Props) {
  return (
    <button
      type="button"
      title={title ?? label}
      aria-pressed={active}
      disabled={disabled}
      onClick={onClick}
      className={`whitespace-nowrap rounded px-2 py-1 text-sm font-medium disabled:opacity-40 ${
        active ? "bg-surface text-ink" : "text-ink-soft hover:bg-surface hover:text-ink"
      }`}
    >
      {children ?? label}
    </button>
  );
}
