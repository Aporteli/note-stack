"use client";

import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { IconButton } from "./Button";
import { IconClose } from "./Icons";

/* --------------------------------- Modal --------------------------------- */

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  /** Hidden visually but read out, when the title alone isn't enough. */
  description?: string;
  size?: "sm" | "md" | "lg";
  footer?: ReactNode;
  children: ReactNode;
};

const modalWidth = { sm: "max-w-md", md: "max-w-xl", lg: "max-w-3xl" };

export function Modal({
  open,
  onClose,
  title,
  description,
  size = "md",
  footer,
  children,
}: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  // Escape closes, focus lands inside, background stops scrolling.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-start sm:p-6 sm:pt-[10vh]">
      <div className="ns-scrim" onClick={onClose} aria-hidden="true" />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        aria-description={description}
        tabIndex={-1}
        className={`ns-dialog relative flex max-h-[86vh] w-full flex-col ${modalWidth[size]} rounded-b-none sm:rounded-b-panel`}
      >
        <header className="flex items-start gap-3 border-b border-line px-5 py-4">
          <h2 className="font-display text-title flex-1 text-ink">{title}</h2>
          <IconButton label="Close" onClick={onClose}>
            <IconClose />
          </IconButton>
        </header>

        <div className="ns-scroll flex-1 overflow-y-auto px-5 py-4">
          {children}
        </div>

        {footer && (
          <footer className="flex justify-end gap-2 border-t border-line bg-surface/60 px-5 py-3">
            {footer}
          </footer>
        )}
      </div>
    </div>
  );
}

/* ---------------------------------- Menu --------------------------------- */

export function Menu({
  open,
  onClose,
  align = "right",
  children,
}: {
  open: boolean;
  onClose: () => void;
  align?: "left" | "right";
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) onClose();
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={ref}
      role="menu"
      className={`ns-menu absolute z-40 mt-1 ${
        align === "right" ? "right-0" : "left-0"
      }`}
    >
      {children}
    </div>
  );
}

export function MenuItem({
  icon,
  tone = "default",
  onClick,
  children,
}: {
  icon?: ReactNode;
  tone?: "default" | "danger";
  onClick?: () => void;
  children: ReactNode;
}) {
  return (
    <button
      role="menuitem"
      onClick={onClick}
      className={`ns-menu-item ${tone === "danger" ? "text-danger" : ""}`}
    >
      {icon}
      {children}
    </button>
  );
}

export function MenuDivider() {
  return <div className="my-1 h-px bg-line" role="separator" />;
}

/* -------------------------------- Tooltip -------------------------------- */

export function Tooltip({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <span className="group relative inline-flex">
      {children}
      <span
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-1.5 -translate-x-1/2 whitespace-nowrap rounded-md bg-plum-900 px-2 py-1 text-micro font-medium text-ink-invert opacity-0 shadow-lift-2 transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100"
      >
        {label}
      </span>
    </span>
  );
}
