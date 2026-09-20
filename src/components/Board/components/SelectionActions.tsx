"use client";

import { Button } from "@/components/ui/Button";
import { IconTrash } from "@/components/ui/Icons";

type Props = {
  count: number;
  onDelete: () => void;
  onClear: () => void;
  busy?: boolean;
};

/** Floating action bar for the current canvas selection. */
export function SelectionActions({ count, onDelete, onClear, busy }: Props) {
  if (count === 0) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[90] flex justify-center px-4">
      <div className="pointer-events-auto flex items-center gap-3 rounded-2xl border border-slate-200 bg-white/95 px-3 py-2 shadow-2xl shadow-slate-900/10 backdrop-blur-md">
        <span className="pl-1 text-sm text-slate-600">
          <strong className="font-semibold text-slate-900">{count}</strong>{" "}
          {count === 1 ? "drawing" : "drawings"} selected
        </span>

        <span aria-hidden className="h-6 w-px bg-slate-200" />

        <Button variant="ghost" size="sm" onClick={onClear} disabled={busy}>
          Clear
        </Button>

        <Button
          variant="danger"
          size="sm"
          onClick={onDelete}
          loading={busy}
          leading={!busy ? <IconTrash size={16} /> : undefined}
        >
          Delete
        </Button>
      </div>
    </div>
  );
}