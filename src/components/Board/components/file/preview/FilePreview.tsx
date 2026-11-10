"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { FilePreviewBody } from "@/components/Board/components/file/preview/FilePreviewBody";
import { FilePreviewFooter } from "@/components/Board/components/file/preview/FilePreviewFooter";
import type { FileData } from "@/components/Board/types/boardFile";

type Props = {
  file: FileData;
  onClose: () => void;
};

export function FilePreview({ file, onClose }: Props) {
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[400] flex items-center justify-center p-6"
      onPointerDown={(event) => event.stopPropagation()}
    >
      <button type="button" aria-label="Close preview" className="absolute inset-0 bg-slate-900/30" onClick={onClose} />
      <div role="dialog" aria-label={file.name} className="relative flex max-h-[90vh] w-full max-w-3xl flex-col bg-white shadow-2xl">
        <div className="min-h-0 flex-1 overflow-auto">
          <FilePreviewBody file={file} />
        </div>
        <FilePreviewFooter file={file} />
      </div>
    </div>,
    document.body,
  );
}
