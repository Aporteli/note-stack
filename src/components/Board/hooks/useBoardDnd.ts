"use client";

import {
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { useRef, useState } from "react";
import {
  createDocumentAt,
  createListAt,
  moveCard,
  moveListPosition,
} from "@/app/actions";
import {
  findCardPosition,
  findDropTarget,
  moveCardInLists,
} from "@/components/Board/lib/dnd";
import type {
  DocumentData,
  DragType,
  ListData,
  ListDragData,
} from "@/components/Board/types/board";

const LIST_W = 296;
const LIST_DROP_OFFSET_Y = 20;

type Options = {
  lists: ListData[];
  setLists: React.Dispatch<React.SetStateAction<ListData[]>>;
  documents: DocumentData[];
  setDocuments: React.Dispatch<React.SetStateAction<DocumentData[]>>;
  boardId: string;
  canvasRef?: React.RefObject<HTMLDivElement | null>;
  onNewListDropped?: () => void;
};

function tempId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `temp-${crypto.randomUUID()}`;
  }
  return `temp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

const isTempId = (id: string) => id.startsWith("temp-");

export function useBoardDnd({
  lists,
  setLists,
  documents,
  setDocuments,
  boardId,
  canvasRef,
  onNewListDropped,
}: Options) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeType, setActiveType] = useState<DragType | null>(null);

  const initialPointerRef = useRef<{ x: number; y: number } | null>(null);
  const pointerRef = useRef<{ x: number; y: number } | null>(null);
  const grabRef = useRef<{ x: number; y: number } | null>(null);
  const stopPointerTrackingRef = useRef<(() => void) | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  function handleDragStart(event: DragStartEvent) {
    stopPointerTrackingRef.current?.();
    const act = event.activatorEvent;
    if (
      typeof window !== "undefined" &&
      (act instanceof PointerEvent || act instanceof MouseEvent)
    ) {
      const point = { x: act.clientX, y: act.clientY };
      initialPointerRef.current = point;
      pointerRef.current = point;
      const source = act.target instanceof Element ? act.target.closest("button") : null;
      const sourceRect = source?.getBoundingClientRect();
      grabRef.current = sourceRect
        ? { x: act.clientX - sourceRect.left, y: act.clientY - sourceRect.top }
        : { x: 0, y: 0 };

      const track = (ev: PointerEvent) => {
        pointerRef.current = { x: ev.clientX, y: ev.clientY };
      };
      const stop = () => {
        window.removeEventListener("pointermove", track);
        window.removeEventListener("pointerup", end);
        window.removeEventListener("pointercancel", end);
        stopPointerTrackingRef.current = null;
      };
      const end = (ev: PointerEvent) => {
        track(ev);
        stop();
      };
      window.addEventListener("pointermove", track);
      window.addEventListener("pointerup", end);
      window.addEventListener("pointercancel", end);
      stopPointerTrackingRef.current = stop;
    } else {
      initialPointerRef.current = null;
      pointerRef.current = null;
      grabRef.current = null;
    }

    setActiveId(event.active.id as string);
    setActiveType(
      (event.active.data.current?.type as DragType | undefined) ?? "card",
    );
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over, delta } = event;
    setActiveId(null);
    setActiveType(null);

    const kind =
      (active.data.current?.type as DragType | undefined) ?? "card";

    /* ---------- NEW-LIST ---------- */
    if (kind === "new-list") {
      const init = initialPointerRef.current;
      const canvasEl = canvasRef?.current;
      initialPointerRef.current = null;
      if (!init || !canvasEl) return;

      const endClientX = init.x + delta.x;
      const endClientY = init.y + delta.y;
      const rect = canvasEl.getBoundingClientRect();
      const x = Math.max(0, endClientX - rect.left - LIST_W / 2);
      const y = Math.max(0, endClientY - rect.top - LIST_DROP_OFFSET_Y);

      const placeholderId = tempId();
      const placeholder: ListData = {
        id: placeholderId,
        title: "New list",
        x,
        y,
        cards: [],
      };
      setLists((prev) => [...prev, placeholder]);

      try {
        const created = await createListAt(boardId, "New list", x, y);
        setLists((prev) =>
          prev.map((l) =>
            l.id === placeholderId
              ? {
                  id: created.id,
                  title: created.title,
                  x: created.x,
                  y: created.y,
                  cards: [],
                }
              : l,
          ),
        );
        onNewListDropped?.();
      } catch (err) {
        setLists((prev) => prev.filter((l) => l.id !== placeholderId));
        console.error("Failed to create list", err);
      }
      return;
    }

    /* ---------- NEW-DOCUMENT ---------- */
    if (kind === "new-document") {
      const pointer = pointerRef.current;
      const grab = grabRef.current;
      const canvasEl = canvasRef?.current;
      initialPointerRef.current = null;
      pointerRef.current = null;
      grabRef.current = null;
      if (!pointer || !grab || !canvasEl) return;

      const rect = canvasEl.getBoundingClientRect();
      const x = Math.max(0, pointer.x - grab.x - rect.left);
      const y = Math.max(0, pointer.y - grab.y - rect.top);

      const placeholderId = tempId();
      const placeholder: DocumentData = {
        id: placeholderId,
        title: "Untitled",
        text: "",
        strokes: [],
        x,
        y,
      };
      setDocuments((prev) => [...prev, placeholder]);

      try {
        const created = await createDocumentAt(boardId, x, y);
        setDocuments((prev) =>
          prev.map((d) =>
            d.id === placeholderId
              ? {
                  id: created.id,
                  title: created.title,
                  text: "",
                  strokes: [],
                  x: created.x,
                  y: created.y,
                }
              : d,
          ),
        );
      } catch (err) {
        setDocuments((prev) => prev.filter((d) => d.id !== placeholderId));
        console.error("Failed to create document", err);
      }
      return;
    }

    /* ---------- EXISTING LIST DRAG ---------- */
    if (kind === "list") {
      const start = active.data.current as ListDragData | undefined;
      if (!start) return;

      const newX = Math.max(0, start.x + delta.x);
      const newY = Math.max(0, start.y + delta.y);

      // Local move always applies so the UI stays consistent.
      setLists((prev) =>
        prev.map((l) =>
          l.id === active.id ? { ...l, x: newX, y: newY } : l,
        ),
      );

      // Skip persisting if this is still an optimistic placeholder, or if the
      // row was removed between drag start and drag end. The server action
      // no-ops on missing rows anyway, but skipping here avoids the round-trip.
      const id = active.id as string;
      if (isTempId(id)) return;

      await moveListPosition(id, newX, newY, boardId);
      return;
    }

    /* ---------- CARD DRAG ---------- */
    if (!over) return;

    const cardId = active.id as string;
    if (isTempId(cardId)) return;

    const source = findCardPosition(lists, cardId);
    if (!source) return;

    const target = findDropTarget(lists, over.id as string);
    if (!target) return;

    const result = moveCardInLists(lists, source, target, cardId);
    if (!result) return;

    setLists(result.lists);
    await moveCard(cardId, result.targetListId, result.targetIndex, boardId);
  }

  return { sensors, activeId, activeType, handleDragStart, handleDragEnd };
}