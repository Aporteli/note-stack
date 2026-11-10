"use client";

import { useState } from "react";
import { FileGlyph } from "@/components/Board/components/file/FileGlyph";
import { FileLabel } from "@/components/Board/components/file/FileLabel";
import { MediaControls } from "@/components/Board/components/file/MediaControls";
import { FilePreview } from "@/components/Board/components/file/preview/FilePreview";
import { isTempId } from "@/components/Board/lib/items";
import { FILE_VIDEO_W, FILE_W, type FileData } from "@/components/Board/types/boardFile";

type Props = {
  file: FileData;
  selected: boolean;
  dragOffset: { dx: number; dy: number } | null;
  onStartDrag: (id: string, clientX: number, clientY: number) => void;
};

export function FileCard({ file, selected, dragOffset, onStartDrag }: Props) {
  const dragging = dragOffset !== null;
  const dx = dragOffset ? Math.max(-file.x, dragOffset.dx) : 0;
  const dy = dragOffset ? Math.max(-file.y, dragOffset.dy) : 0;
  const media = file.kind === "audio" || file.kind === "video";
  const src = `/api/files/${file.id}`;
  const [preview, setPreview] = useState(false);

  return (
    <div
      data-item-type="file"
      data-item-id={file.id}
      onPointerDown={(event) => {
        if (event.button !== 0) return;
        const target = event.target;
        if (target instanceof Element && target.closest("[data-file-control]")) return;
        event.stopPropagation();
        onStartDrag(file.id, event.clientX, event.clientY);
      }}
      onDoubleClick={(event) => {
        const target = event.target;
        if (target instanceof Element && target.closest("[data-file-control]")) return;
        event.stopPropagation();
        if (isTempId(file.id)) return;
        setPreview(true);
      }}
      className={`absolute flex flex-col items-center bg-transparent px-1 py-1 ${
        selected ? "outline outline-2 outline-slate-900" : ""
      }`}
      style={{
        left: file.x,
        top: file.y,
        width: file.kind === "video" ? FILE_VIDEO_W : FILE_W,
        zIndex: dragging ? 80 : selected ? 40 : 28,
        touchAction: "none",
        cursor: dragging ? "grabbing" : "grab",
        ...(dragging ? { transform: `translate3d(${dx}px, ${dy}px, 0)` } : null),
      }}
    >
      {file.kind === "image" ? (
        <img src={src} alt="" className="max-h-24 w-full object-contain" draggable={false} />
      ) : file.kind === "video" ? null : (
        <FileGlyph kind={file.kind} />
      )}
      <FileLabel name={file.name} size={file.size} />
      {media ? <MediaControls src={src} kind={file.kind as "audio" | "video"} /> : null}
      {preview ? <FilePreview file={file} onClose={() => setPreview(false)} /> : null}
    </div>
  );
}
