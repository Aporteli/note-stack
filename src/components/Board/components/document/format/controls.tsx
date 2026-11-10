"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { createPortal } from "react-dom";

export const selectClass =
  "h-7 rounded-md bg-white px-1.5 text-xs text-slate-700 ring-1 ring-slate-200 outline-none hover:bg-slate-50 disabled:cursor-not-allowed";

export function Divider() {
  return <span className="mx-0.5 h-5 w-px shrink-0 bg-slate-200" aria-hidden />;
}

export function MarkButton({
  label,
  title,
  active,
  onClick,
  children,
}: {
  label: string;
  title?: string;
  active?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={title ?? label}
      aria-pressed={active}
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
      className={`grid h-7 min-w-7 place-items-center rounded-md px-1 text-[13px] text-slate-700 transition-colors disabled:cursor-not-allowed ${
        active ? "bg-slate-900 text-white" : "hover:bg-slate-100"
      }`}
    >
      {children}
    </button>
  );
}

export function ColorButton({
  label,
  letter,
  open,
  colors,
  onToggle,
  onPick,
  onClear,
}: {
  label: string;
  letter: string;
  open: boolean;
  colors: readonly string[];
  onToggle: () => void;
  onPick: (color: string) => void;
  onClear?: () => void;
}) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [box, setBox] = useState<{ top: number; left: number } | null>(null);

  useEffect(() => {
    if (!open || !buttonRef.current) {
      setBox(null);
      return;
    }
    const rect = buttonRef.current.getBoundingClientRect();
    setBox({ top: rect.bottom + 6, left: rect.left });
  }, [open]);

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        aria-label={label}
        title={label}
        aria-expanded={open}
        onMouseDown={(event) => event.preventDefault()}
        onClick={onToggle}
        className={`grid h-7 min-w-7 place-items-center rounded-md text-[13px] font-semibold text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed ${
          letter === "H" ? "bg-yellow-100" : ""
        }`}
      >
        <span className={letter === "A" ? "border-b-2 border-red-500 leading-none" : "leading-none"}>
          {letter}
        </span>
      </button>
      {open && box
        ? createPortal(
            <div
              data-format-menu
              style={{ top: box.top, left: box.left }}
              onMouseDown={(event) => {
                if (event.target instanceof HTMLInputElement) return;
                event.preventDefault();
              }}
              className="fixed z-[250] grid w-[148px] grid-cols-5 gap-1.5 rounded-lg border border-slate-200 bg-white p-2 shadow-lg"
            >
              {colors.map((color) => (
                <button
                  key={color}
                  type="button"
                  aria-label={color}
                  onClick={() => onPick(color)}
                  className="h-5 w-5 rounded-full ring-1 ring-slate-200"
                  style={{ background: color }}
                />
              ))}
              <label className="col-span-5 mt-1 flex items-center justify-between gap-2 text-[11px] text-slate-500">
                Custom
                <input
                  type="color"
                  aria-label={`Custom ${label}`}
                  onChange={(event) => onPick(event.target.value)}
                  className="h-6 w-8 cursor-pointer border-0 bg-transparent p-0"
                />
              </label>
              {onClear ? (
                <button
                  type="button"
                  onClick={onClear}
                  className="col-span-5 rounded-md px-1 py-1 text-left text-[11px] text-slate-600 hover:bg-slate-100"
                >
                  No highlight
                </button>
              ) : null}
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
