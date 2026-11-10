import type { RefObject } from "react";
import { IconTrash } from "@/components/ui/Icons";

type Props = {
  open: boolean;
  total: number;
  triggerRef: RefObject<HTMLDivElement | null>;
  onToggle: () => void;
};

export function TrashTrigger({ open, total, triggerRef, onToggle }: Props) {
  return (
    <div className="relative" ref={triggerRef}>
      <button
        type="button"
        onClick={onToggle}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Trash"
        title="Trash"
        className={`
          relative inline-flex h-9 w-9 items-center justify-center 
          text-slate-700 ring-1 ring-slate-200 transition-colors
          hover:bg-slate-50
          ${open ? "bg-slate-100" : "bg-white"}
        `}
      >
        <IconTrash size={16} />
        {total > 0 ? (
          <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-red-600 px-1 text-[10px] font-semibold leading-none text-white">
            {total}
          </span>
        ) : null}
      </button>
    </div>
  );
}
