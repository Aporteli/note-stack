"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { ReactNode } from "react";

export type ContextMenuItem = {
  label: string;
  icon?: ReactNode;
  onClick?: () => void;
  danger?: boolean;
  disabled?: boolean;
  divider?: never;
};

export type ContextMenuDivider = {
  divider: true;
};

export type ContextMenuEntry = ContextMenuItem | ContextMenuDivider;

type Props = {
  x: number;
  y: number;
  items: ContextMenuEntry[];
  onClose: () => void;
};

const MENU_W = 220;
const MENU_PAD = 8;

export function ContextMenu({ x, y, items, onClose }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ left: x, top: y, ready: false });

  /* Position after mount so we can measure and flip near the viewport edge. */
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    let left = x;
    let top = y;
    if (left + rect.width + MENU_PAD > window.innerWidth) {
      left = window.innerWidth - rect.width - MENU_PAD;
    }
    if (top + rect.height + MENU_PAD > window.innerHeight) {
      top = window.innerHeight - rect.height - MENU_PAD;
    }
    setPos({ left, top, ready: true });
  }, [x, y]);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) onClose();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    const onScroll = () => onClose();
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    window.addEventListener("scroll", onScroll, true);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", onScroll, true);
    };
  }, [onClose]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      ref={ref}
      role="menu"
      style={{
        position: "fixed",
        left: pos.left,
        top: pos.top,
        width: MENU_W,
        visibility: pos.ready ? "visible" : "hidden",
      }}
      className="z-[150] overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-2xl shadow-slate-900/10"
    >
      {items.map((entry, i) => {
        if ("divider" in entry && entry.divider) {
          return <div key={i} className="my-1 h-px bg-slate-200" />;
        }
        const it = entry as ContextMenuItem;
        return (
          <button
            key={i}
            type="button"
            role="menuitem"
            disabled={it.disabled}
            onClick={() => {
              if (it.disabled) return;
              it.onClick?.();
              onClose();
            }}
            className={`flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm transition-colors disabled:opacity-40 ${
              it.danger
                ? "text-red-600 hover:bg-red-50"
                : "text-slate-700 hover:bg-slate-100"
            }`}
          >
            {it.icon && (
              <span className="grid h-4 w-4 place-items-center text-current">
                {it.icon}
              </span>
            )}
            <span>{it.label}</span>
          </button>
        );
      })}
    </div>,
    document.body,
  );
}