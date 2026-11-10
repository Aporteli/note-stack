"use client";

import { useEffect } from "react";
import type { Dispatch, SetStateAction } from "react";
import { pasteDocument } from "@/components/Board/components/document/menu/pasteDocument";
import { pasteDrawing } from "@/components/Board/components/draw/menu/pasteDrawing";
import { pasteHeading } from "@/components/Board/components/heading/menu/pasteHeading";
import { pasteNote } from "@/components/Board/components/note/menu/pasteNote";
import { lastClip } from "@/components/Board/lib/clipboard/lastClip";
import { readDocumentClip } from "@/components/Board/lib/document/clipboard/DocumentClip";
import { readDrawingClip } from "@/components/Board/lib/draw/clipboard/DrawingClip";
import { readHeadingClip } from "@/components/Board/lib/heading/clipboard/HeadingClip";
import { readNoteClip } from "@/components/Board/lib/note/clipboard/NoteClip";
import type { DocumentData, DrawingData } from "@/components/Board/types/board";
import type { HeadingData } from "@/components/Board/types/heading";
import type { NoteData } from "@/components/Board/types/note";

function typing(event: KeyboardEvent) {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || target.isContentEditable;
}

export function useClipPaste(
  boardId: string,
  setNotes: Dispatch<SetStateAction<NoteData[]>>,
  setDocuments: Dispatch<SetStateAction<DocumentData[]>>,
  setDrawings: Dispatch<SetStateAction<DrawingData[]>>,
  setHeadings: Dispatch<SetStateAction<HeadingData[]>>,
) {
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.defaultPrevented || typing(event)) return;
      const command = event.ctrlKey || event.metaKey;
      if (!command || event.key.toLowerCase() !== "v") return;
      const kind = lastClip();
      if (kind === "note" && readNoteClip()) {
        event.preventDefault();
        void pasteNote(boardId, (created) => {
          setNotes((current) =>
            current.some((note) => note.id === created.id) ? current : [...current, created],
          );
        });
      } else if (kind === "document" && readDocumentClip()) {
        event.preventDefault();
        void pasteDocument(boardId, (created) => {
          setDocuments((current) =>
            current.some((doc) => doc.id === created.id) ? current : [...current, created],
          );
        });
      } else if (kind === "heading" && readHeadingClip()) {
        event.preventDefault();
        void pasteHeading(boardId, (created) => {
          setHeadings((current) =>
            current.some((heading) => heading.id === created.id) ? current : [...current, created],
          );
        });
      } else if (kind === "drawing" && readDrawingClip()) {
        event.preventDefault();
        void pasteDrawing(boardId, (created) => {
          setDrawings((current) =>
            current.some((drawing) => drawing.id === created.id) ? current : [...current, created],
          );
        });
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [boardId, setDocuments, setDrawings, setHeadings, setNotes]);
}
