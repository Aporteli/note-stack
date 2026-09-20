"use client";

import { DndContext, DragOverlay, closestCenter } from "@dnd-kit/core";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useBoardDnd } from "@/components/Board/hooks/useBoardDnd";
import { useDrawings } from "@/components/Board/hooks/useDrawings";
import { useDocuments } from "@/components/Board/hooks/useDocuments";
import { useLists } from "@/components/Board/hooks/useLists";
import { useCardModal } from "@/components/Board/hooks/useCardModal";
import { canvasBounds } from "@/components/Board/lib/dnd";
import type {
  BoardData,
  DocumentData,
  DrawingData,
  ItemRef,
  ItemType,
  Stroke,
} from "@/components/Board/types/board";
import { itemKey } from "@/components/Board/types/board";

import { AddList } from "@/components/Board/components/AddList";
import { BoardCanvas } from "@/components/Board/components/BoardCanvas";
import { BoardEmpty } from "@/components/Board/components/BoardEmpty";
import { BoardHeader } from "@/components/Board/components/BoardHeader";
import { ContextMenu } from "@/components/Board/components/ContextMenu";
import {
  DocumentCard,
  DocumentDragPreview,
  NewDocumentPreview,
} from "@/components/Board/components/DocumentCard";
import { DocumentModal } from "@/components/Board/components/DocumentModal";
import { Drawing } from "@/components/Board/components/Drawing";
import { DrawOverlay } from "@/components/Board/components/DrawOverlay";
import { SelectionActions } from "@/components/Board/components/SelectionActions";
import { CardDragPreview } from "@/components/Card";
import { CardDetail } from "@/components/CardDetail";
import { List, ListDragPreview, NewListPreview } from "@/components/List";
import { IconTrash, IconCheck } from "@/components/ui/Icons";
import {
  createDrawing,
  duplicateItems,
  moveDocumentPosition,
  moveDrawings,
  trashItems,
  updateDocument,
} from "@/app/actions";

type Props = {
  board: BoardData;
};

const isTempId = (id: string) => id.startsWith("temp-");

export default function Board({ board }: Props) {
  const [lists, setLists] = useLists(board.lists);
  const [drawings, setDrawings] = useDrawings(board.drawings);
  const [documents, setDocuments] = useDocuments(board.documents);
  const [addListOpen, setAddListOpen] = useState(false);
  const [drawMode, setDrawMode] = useState(false);
  const [selectedDrawingIds, setSelectedDrawingIds] = useState<Set<string>>(
    new Set(),
  );
  const [draggingDrawings, setDraggingDrawings] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const [selectedItemKeys, setSelectedItemKeys] = useState<Set<string>>(
    new Set(),
  );
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    items: ItemRef[];
  } | null>(null);

  const [openDocumentId, setOpenDocumentId] = useState<string | null>(null);

  const canvasRef = useRef<HTMLDivElement>(null);
  const suppressAddListClickRef = useRef(false);

  const drawingsRef = useRef<DrawingData[]>(drawings);
  drawingsRef.current = drawings;
  const documentsRef = useRef<DocumentData[]>(documents);
  documentsRef.current = documents;

  const { sensors, activeId, activeType, handleDragStart, handleDragEnd } =
    useBoardDnd({
      lists,
      setLists,
      documents,
      setDocuments,
      boardId: board.id,
      canvasRef,
      onNewListDropped: () => {
        suppressAddListClickRef.current = true;
      },
    });

  const { setOpenCardId, openCard, openCardListTitle } = useCardModal(lists);

  const activeCard =
    activeType === "card"
      ? lists.flatMap((l) => l.cards).find((c) => c.id === activeId)
      : undefined;
  const activeList =
    activeType === "list" ? lists.find((l) => l.id === activeId) : undefined;
  const activeDocument =
    activeType === "document"
      ? documents.find((d) => d.id === activeId)
      : undefined;
  const openDocument = openDocumentId
    ? documents.find((d) => d.id === openDocumentId) ?? null
    : null;

  /* -------------------- Header -------------------- */

  const handleAddListClick = useCallback(() => {
    if (suppressAddListClickRef.current) {
      suppressAddListClickRef.current = false;
      return;
    }
    setAddListOpen(true);
  }, []);

  const clearAllSelections = useCallback(() => {
    setSelectedItemKeys(new Set());
    setSelectedDrawingIds(new Set());
  }, []);

  /* -------------------- Document drag -------------------- */

  const handleStartDocumentDrag = useCallback(
    (id: string, clientX: number, clientY: number, shift: boolean) => {
      /* Shift is a selection gesture, not a drag.
         The canvas click handler owns the toggle. */
      if (shift) return;

      const key = `document:${id}`;
      const wasSelected = selectedItemKeys.has(key);

      /* If the pressed doc wasn't selected yet, replace the selection with it.
         If it was already selected, keep the whole group so we drag them all. */
      const effectiveSelection = wasSelected
        ? new Set(selectedItemKeys)
        : new Set([key]);

      if (!wasSelected) setSelectedItemKeys(effectiveSelection);

      /* Snapshot start positions of every doc in the effective selection. */
      const startPositions = new Map<string, { x: number; y: number }>();
      for (const d of documentsRef.current) {
        if (effectiveSelection.has(`document:${d.id}`)) {
          startPositions.set(d.id, { x: d.x, y: d.y });
        }
      }
      if (startPositions.size === 0) return;

      const startX = clientX;
      const startY = clientY;
      let moved = false;

      const onMove = (ev: PointerEvent) => {
        const dx = ev.clientX - startX;
        const dy = ev.clientY - startY;
        if (!moved && Math.abs(dx) + Math.abs(dy) > 3) moved = true;
        if (!moved) return;

        setDocuments((prev) =>
          prev.map((d) => {
            const start = startPositions.get(d.id);
            if (!start) return d;
            return {
              ...d,
              x: Math.max(0, start.x + dx),
              y: Math.max(0, start.y + dy),
            };
          }),
        );
      };

      const onUp = () => {
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
        if (!moved) return;

        /* Persist each moved doc that has a real (non-temp) id. */
        for (const sid of startPositions.keys()) {
          if (isTempId(sid)) continue;
          const d = documentsRef.current.find((x) => x.id === sid);
          if (d) void moveDocumentPosition(sid, d.x, d.y, board.id);
        }
      };

      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
    },
    [board.id, selectedItemKeys, setDocuments],
  );

  /* -------------------- Right-click -------------------- */

  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => {
      const el = (e.target as HTMLElement).closest(
        "[data-item-type][data-item-id]",
      ) as HTMLElement | null;
      if (!el) return;

      const type = el.getAttribute("data-item-type") as ItemType | null;
      const id = el.getAttribute("data-item-id");
      if (!type || !id) return;

      e.preventDefault();
      const key = itemKey({ type, id });

      let selected = selectedItemKeys;
      if (!selected.has(key)) {
        selected = new Set([key]);
        setSelectedItemKeys(selected);
        if (type === "drawing") setSelectedDrawingIds(new Set([id]));
        else setSelectedDrawingIds(new Set());
      }

      const refs: ItemRef[] = [];
      for (const k of selected) {
        const [t, i] = k.split(":") as [ItemType, string];
        refs.push({ type: t, id: i });
      }
      setContextMenu({ x: e.clientX, y: e.clientY, items: refs });
    },
    [selectedItemKeys],
  );

  /* -------------------- Selection -------------------- */

  const handleCanvasClick = useCallback(
    (e: React.MouseEvent) => {
      const el = (e.target as HTMLElement).closest(
        "[data-item-type][data-item-id]",
      ) as HTMLElement | null;
      if (!el) {
        clearAllSelections();
        return;
      }

      const type = el.getAttribute("data-item-type") as ItemType | null;
      const id = el.getAttribute("data-item-id");
      if (!type || !id) return;
      const key = itemKey({ type, id });

      if (e.shiftKey) {
        setSelectedItemKeys((prev) => {
          const next = new Set(prev);
          if (next.has(key)) next.delete(key);
          else next.add(key);
          return next;
        });
        if (type === "drawing") {
          setSelectedDrawingIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
          });
        }
      } else {
        setSelectedItemKeys(new Set([key]));
        if (type === "drawing") setSelectedDrawingIds(new Set([id]));
        else setSelectedDrawingIds(new Set());
      }
    },
    [clearAllSelections],
  );

  /* -------------------- Context actions -------------------- */

  const handleContextTrash = useCallback(async () => {
    if (!contextMenu) return;
    const items = contextMenu.items;

    const removedListIds = new Set<string>();
    const removedCardIds = new Set<string>();
    const removedDrawingIds = new Set<string>();
    const removedDocIds = new Set<string>();
    for (const it of items) {
      if (it.type === "list") removedListIds.add(it.id);
      else if (it.type === "card") removedCardIds.add(it.id);
      else if (it.type === "drawing") removedDrawingIds.add(it.id);
      else removedDocIds.add(it.id);
    }
    setLists((prev) =>
      prev
        .filter((l) => !removedListIds.has(l.id))
        .map((l) => ({
          ...l,
          cards: l.cards.filter((c) => !removedCardIds.has(c.id)),
        })),
    );
    setDrawings((prev) => prev.filter((d) => !removedDrawingIds.has(d.id)));
    setDocuments((prev) => prev.filter((d) => !removedDocIds.has(d.id)));
    clearAllSelections();

    try {
      await trashItems(items, board.id);
      setRefreshKey((k) => k + 1);
    } catch (err) {
      console.error("Trash failed", err);
    }
  }, [
    board.id,
    contextMenu,
    clearAllSelections,
    setDrawings,
    setDocuments,
    setLists,
  ]);

  const handleContextDuplicate = useCallback(async () => {
    if (!contextMenu) return;
    await duplicateItems(contextMenu.items, board.id);
    clearAllSelections();
  }, [board.id, contextMenu, clearAllSelections]);

  /* -------------------- Keyboard -------------------- */

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (openDocumentId) return;
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      const el = e.target as HTMLElement | null;
      if (el?.isContentEditable) return;

      if (e.key === "Escape") {
        clearAllSelections();
        setContextMenu(null);
        return;
      }

      if (
        (e.key === "Delete" || e.key === "Backspace") &&
        !drawMode &&
        selectedItemKeys.size > 0
      ) {
        e.preventDefault();
        const refs: ItemRef[] = [];
        for (const k of selectedItemKeys) {
          const [t, i] = k.split(":") as [ItemType, string];
          refs.push({ type: t, id: i });
        }

        const lIds = new Set<string>();
        const cIds = new Set<string>();
        const dIds = new Set<string>();
        const docIds = new Set<string>();
        for (const r of refs) {
          if (r.type === "list") lIds.add(r.id);
          else if (r.type === "card") cIds.add(r.id);
          else if (r.type === "drawing") dIds.add(r.id);
          else docIds.add(r.id);
        }
        setLists((prev) =>
          prev
            .filter((l) => !lIds.has(l.id))
            .map((l) => ({
              ...l,
              cards: l.cards.filter((c) => !cIds.has(c.id)),
            })),
        );
        setDrawings((prev) => prev.filter((d) => !dIds.has(d.id)));
        setDocuments((prev) => prev.filter((d) => !docIds.has(d.id)));
        clearAllSelections();

        void trashItems(refs, board.id)
          .then(() => setRefreshKey((k) => k + 1))
          .catch((err) => console.error("Trash failed", err));
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [
    board.id,
    clearAllSelections,
    drawMode,
    openDocumentId,
    selectedItemKeys,
    setDocuments,
    setDrawings,
    setLists,
  ]);

  /* -------------------- Drawing drag -------------------- */

  const handleStartDrawingDrag = useCallback(
    (id: string, clientX: number, clientY: number, shift: boolean) => {
      let nextSelection: Set<string>;
      if (shift) {
        nextSelection = new Set(selectedDrawingIds);
        if (nextSelection.has(id)) nextSelection.delete(id);
        else nextSelection.add(id);
      } else if (selectedDrawingIds.has(id)) {
        nextSelection = selectedDrawingIds;
      } else {
        nextSelection = new Set([id]);
      }
      setSelectedDrawingIds(nextSelection);
      setSelectedItemKeys(
        new Set(Array.from(nextSelection).map((d) => `drawing:${d}`)),
      );

      if (!nextSelection.has(id)) return;

      const startPositions = new Map<string, { x: number; y: number }>();
      for (const d of drawingsRef.current) {
        if (nextSelection.has(d.id)) {
          startPositions.set(d.id, { x: d.x, y: d.y });
        }
      }

      const startX = clientX;
      const startY = clientY;
      let moved = false;
      setDraggingDrawings(true);

      const onMove = (ev: PointerEvent) => {
        const dx = ev.clientX - startX;
        const dy = ev.clientY - startY;
        if (!moved && Math.abs(dx) + Math.abs(dy) > 3) moved = true;
        if (!moved) return;
        setDrawings((prev) =>
          prev.map((d) => {
            const start = startPositions.get(d.id);
            if (!start) return d;
            return {
              ...d,
              x: Math.max(0, start.x + dx),
              y: Math.max(0, start.y + dy),
            };
          }),
        );
      };

      const onUp = () => {
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
        setDraggingDrawings(false);
        if (!moved) return;

        const moves = Array.from(startPositions.keys())
          .map((sid) => {
            const d = drawingsRef.current.find((x) => x.id === sid);
            return d ? { id: d.id, x: d.x, y: d.y } : null;
          })
          .filter((m): m is { id: string; x: number; y: number } => m !== null)
          .filter((m) => !isTempId(m.id));

        if (moves.length === 0) return;
        void moveDrawings(moves, board.id);
      };

      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
    },
    [board.id, selectedDrawingIds, setDrawings],
  );

  const handleDeleteSelectedDrawings = useCallback(async () => {
    const ids = Array.from(selectedDrawingIds);
    if (ids.length === 0 || deleting) return;
    setDeleting(true);
    try {
      setDrawings((prev) => prev.filter((d) => !selectedDrawingIds.has(d.id)));
      setSelectedDrawingIds(new Set());
      setSelectedItemKeys(new Set());
      await trashItems(
        ids.map((id) => ({ type: "drawing" as const, id })),
        board.id,
      );
      setRefreshKey((k) => k + 1);
    } catch (err) {
      console.error("Failed to trash drawings", err);
    } finally {
      setDeleting(false);
    }
  }, [board.id, deleting, selectedDrawingIds, setDrawings]);

  /* -------------------- Drawing creation -------------------- */

  async function handleSaveDrawing(
    bounds: { x: number; y: number; w: number; h: number },
    strokes: Stroke[],
  ) {
    setDrawMode(false);
    await createDrawing(
      board.id,
      bounds.x,
      bounds.y,
      bounds.w,
      bounds.h,
      JSON.stringify(strokes),
    );
  }

  /* -------------------- Document modal save -------------------- */

  const handleSaveDocument = useCallback(
    async (payload: { title: string; text: string; strokes: Stroke[] }) => {
      if (!openDocumentId) return;
      const id = openDocumentId;

      setDocuments((prev) =>
        prev.map((d) =>
          d.id === id
            ? {
                ...d,
                title: payload.title,
                text: payload.text,
                strokes: payload.strokes,
              }
            : d,
        ),
      );

      setOpenDocumentId(null);

      if (isTempId(id)) return;

      try {
        await updateDocument(id, board.id, {
          title: payload.title,
          content: JSON.stringify({
            text: payload.text,
            strokes: payload.strokes,
          }),
        });
      } catch (err) {
        console.error("Failed to save document", err);
      }
    },
    [board.id, openDocumentId, setDocuments],
  );

  /* -------------------- Canvas size -------------------- */

  const bounds = useMemo(
    () =>
      canvasBounds(
        lists,
        drawings,
        documents,
        drawMode ? { minWidth: 4000, minHeight: 3000 } : undefined,
      ),
    [lists, drawings, documents, drawMode],
  );

  /* -------------------- Context menu entries -------------------- */

  const contextEntries = useMemo(() => {
    if (!contextMenu) return [];
    const count = contextMenu.items.length;
    return [
      {
        label: count === 1 ? "Duplicate" : `Duplicate ${count} items`,
        icon: <IconCheck size={16} />,
        onClick: handleContextDuplicate,
      },
      { divider: true as const },
      {
        label: count === 1 ? "Move to trash" : `Move ${count} to trash`,
        icon: <IconTrash size={16} />,
        danger: true,
        onClick: handleContextTrash,
      },
    ];
  }, [contextMenu, handleContextDuplicate, handleContextTrash]);

  /* -------------------- Render -------------------- */

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#f6f5f2] text-slate-900">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <BoardHeader
          boardId={board.id}
          title={board.title}
          addListOpen={addListOpen}
          onAddList={handleAddListClick}
          drawMode={drawMode}
          onToggleDraw={() => setDrawMode((v) => !v)}
          refreshKey={refreshKey}
        />

        <BoardCanvas
          width={bounds.width}
          height={bounds.height}
          canvasRef={canvasRef}
          onBackgroundPointerDown={clearAllSelections}
        >
          <div
            className="contents"
            onContextMenu={handleContextMenu}
            onClick={handleCanvasClick}
          >
            {drawings.map((d) => (
              <Drawing
                key={d.id}
                drawing={d}
                selected={selectedDrawingIds.has(d.id)}
                dragging={draggingDrawings && selectedDrawingIds.has(d.id)}
                onStartDrag={handleStartDrawingDrag}
              />
            ))}

            {documents.map((doc) => (
              <DocumentCard
                key={doc.id}
                document={doc}
                selected={selectedItemKeys.has(`document:${doc.id}`)}
                onOpen={setOpenDocumentId}
                onStartDrag={handleStartDocumentDrag}
              />
            ))}

            {lists.length === 0 &&
            drawings.length === 0 &&
            documents.length === 0 ? (
              <BoardEmpty
                boardId={board.id}
                addListOpen={addListOpen}
                onAddListClose={() => setAddListOpen(false)}
              />
            ) : (
              <>
                {lists.map((list, index) => (
                  <List
                    key={list.id}
                    list={list}
                    boardId={board.id}
                    index={index}
                    onOpenCard={setOpenCardId}
                    selected={selectedItemKeys.has(`list:${list.id}`)}
                  />
                ))}

                {addListOpen && (
                  <AddList
                    boardId={board.id}
                    onClose={() => setAddListOpen(false)}
                  />
                )}
              </>
            )}
          </div>

          {drawMode && (
            <DrawOverlay
              width={bounds.width}
              height={bounds.height}
              onSave={handleSaveDrawing}
              onDiscard={() => setDrawMode(false)}
            />
          )}
        </BoardCanvas>

        <DragOverlay dropAnimation={null}>
          {activeCard ? <CardDragPreview title={activeCard.title} /> : null}
          {activeList ? <ListDragPreview title={activeList.title} /> : null}
          {activeDocument ? (
            <DocumentDragPreview title={activeDocument.title} />
          ) : null}
          {activeType === "new-list" ? <NewListPreview /> : null}
          {activeType === "new-document" ? <NewDocumentPreview /> : null}
        </DragOverlay>

        <CardDetail
          card={openCard ?? null}
          listTitle={openCardListTitle}
          onClose={() => setOpenCardId(null)}
        />

        {!drawMode && selectedDrawingIds.size > 0 && (
          <SelectionActions
            count={selectedDrawingIds.size}
            busy={deleting}
            onDelete={handleDeleteSelectedDrawings}
            onClear={clearAllSelections}
          />
        )}

        {contextMenu && contextEntries.length > 0 && (
          <ContextMenu
            x={contextMenu.x}
            y={contextMenu.y}
            items={contextEntries}
            onClose={() => setContextMenu(null)}
          />
        )}
      </DndContext>

      <DocumentModal
        document={openDocument}
        onSave={handleSaveDocument}
        onClose={() => setOpenDocumentId(null)}
      />
    </div>
  );
}