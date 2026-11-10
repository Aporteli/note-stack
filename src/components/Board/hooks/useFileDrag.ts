"use client";

import { useCallback, useRef, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import { placePictureInList } from "@/app/cards/placePictureInList";
import { moveFile } from "@/app/files/moveFile";
import { listUnderFile } from "@/components/Board/lib/file/listUnderFile";
import { markDropList } from "@/components/Board/lib/file/markDropList";
import { isTempId } from "@/components/Board/lib/items";
import type { FileData } from "@/components/Board/types/boardFile";

type PlacedCard = { id: string; title: string; image?: string | null };

type Args = {
  boardId: string;
  files: FileData[];
  setFiles: Dispatch<SetStateAction<FileData[]>>;
  setSelectedItemKeys: Dispatch<SetStateAction<Set<string>>>;
  onPicture: (listId: string, card: PlacedCard) => void;
};

export type FileDragState = { dx: number; dy: number; id: string };

export function useFileDrag({ boardId, files, setFiles, setSelectedItemKeys, onPicture }: Args) {
  const activeRef = useRef(false);
  const [drag, setDrag] = useState<FileDragState | null>(null);

  const startDrag = useCallback(
    (id: string, clientX: number, clientY: number) => {
      if (activeRef.current) return;
      const origin = files.find((file) => file.id === id);
      if (!origin) return;
      setSelectedItemKeys(new Set([`file:${id}`]));
      activeRef.current = true;
      let moved = false;
      let finished = false;
      let lastDx = 0;
      let lastDy = 0;

      const onMove = (ev: PointerEvent) => {
        const dx = ev.clientX - clientX;
        const dy = ev.clientY - clientY;
        if (!moved && Math.abs(dx) + Math.abs(dy) > 3) moved = true;
        if (!moved) return;
        lastDx = dx;
        lastDy = dy;
        setDrag({ dx, dy, id });
        markDropList(origin.kind === "image" ? listUnderFile(ev.clientX, ev.clientY, id) : null);
      };
      const onUp = (ev: PointerEvent) => {
        if (finished) return;
        finished = true;
        window.removeEventListener("pointermove", onMove, true);
        window.removeEventListener("pointerup", onUp, true);
        window.removeEventListener("pointercancel", onUp, true);
        activeRef.current = false;
        setDrag(null);
        markDropList(null);
        if (!moved) return;
        const listId = origin.kind === "image" ? listUnderFile(ev.clientX, ev.clientY, id) : null;
        if (listId && !isTempId(id)) {
          setFiles((prev) => prev.filter((file) => file.id !== id));
          void placePictureInList(listId, id, origin.name, boardId).then((card) => {
            if (card) onPicture(listId, card);
            else setFiles((prev) => (prev.some((file) => file.id === id) ? prev : [...prev, origin]));
          });
          return;
        }
        const x = Math.max(0, origin.x + lastDx);
        const y = Math.max(0, origin.y + lastDy);
        setFiles((prev) => prev.map((file) => (file.id === id ? { ...file, x, y } : file)));
        if (!isTempId(id)) void moveFile(id, x, y, boardId);
      };

      window.addEventListener("pointermove", onMove, true);
      window.addEventListener("pointerup", onUp, true);
      window.addEventListener("pointercancel", onUp, true);
    },
    [boardId, files, onPicture, setFiles, setSelectedItemKeys],
  );

  return { startDrag, drag };
}
