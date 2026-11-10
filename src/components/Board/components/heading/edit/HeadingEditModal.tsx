"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { saveHeadingStyle } from "@/app/headings/saveHeadingStyle";
import { HeadingAlignControl } from "@/components/Board/components/heading/edit/HeadingAlignControl";
import { HeadingBoldControl } from "@/components/Board/components/heading/edit/HeadingBoldControl";
import { HeadingColorControl } from "@/components/Board/components/heading/edit/HeadingColorControl";
import { HeadingSizeControl } from "@/components/Board/components/heading/edit/HeadingSizeControl";
import { HEADING_ALIGN, HEADING_COLOR, HEADING_FONT } from "@/components/Board/lib/heading/defaults";
import type { HeadingAlign, HeadingData } from "@/components/Board/types/heading";

type Look = { fontSize: number; color: string; bold: boolean; align: HeadingAlign };

type Props = {
  heading: HeadingData;
  boardId: string;
  onStyle: (id: string, look: Look) => void;
  onClose: () => void;
};

function alignOf(value: string | undefined): HeadingAlign {
  if (value === "left" || value === "right" || value === "center") return value;
  return HEADING_ALIGN;
}

export function HeadingEditModal({ heading, boardId, onStyle, onClose }: Props) {
  const look: Look = {
    fontSize: heading.fontSize || HEADING_FONT,
    color: heading.color || HEADING_COLOR,
    bold: Boolean(heading.bold),
    align: alignOf(heading.align),
  };

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  function apply(next: Look) {
    onStyle(heading.id, next);
    void saveHeadingStyle(heading.id, boardId, next);
  }

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[400] flex items-center justify-center p-4"
      onPointerDown={(event) => event.stopPropagation()}
    >
      <button type="button" aria-label="Close heading editor" className="absolute inset-0 bg-slate-900/20" onClick={onClose} />
      <div role="dialog" aria-label="Edit heading" className="relative w-80 bg-white p-4 shadow-2xl ring-1 ring-slate-200">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900">Edit heading</h2>
          <button type="button" onClick={onClose} className="text-sm text-slate-500">
            Close
          </button>
        </div>
        <div className="flex flex-col gap-3">
          <HeadingSizeControl size={look.fontSize} onSize={(fontSize) => apply({ ...look, fontSize })} />
          <HeadingColorControl color={look.color} onColor={(color) => apply({ ...look, color })} />
          <div className="flex items-center gap-3">
            <span className="w-12 text-sm text-slate-700">Style</span>
            <HeadingBoldControl bold={look.bold} onBold={(bold) => apply({ ...look, bold })} />
            <HeadingAlignControl align={look.align} onAlign={(align) => apply({ ...look, align })} />
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
