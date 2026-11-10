"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Dispatch, MouseEvent, SetStateAction } from "react";
import { duplicateItems, trashItems } from "@/app/actions";
import { IconCheck, IconTrash } from "@/components/ui/Icons";
import type { ContextMenuEntry } from "@/components/Board/components/ContextMenu";
import { groupItemIds, keysToRefs } from "@/components/Board/lib/items";
import type {
  DocumentData,
  DrawingData,
  ItemRef,
  ItemType,
  ListData,
} from "@/components/Board/types/board";
import type { ArrowData } from "@/components/Board/types/arrow";
import type { FileData } from "@/components/Board/types/boardFile";
import type { TableData } from "@/components/Board/types/table";
import type { HeadingData } from "@/components/Board/types/heading";
import type { LinkData } from "@/components/Board/types/link";
import type { NoteData } from "@/components/Board/types/note";
import { itemKey } from "@/components/Board/types/board";

type MenuState = { x: number; y: number; items: ItemRef[] };

type Args = {
  boardId: string;
  openDocumentId: string | null;
  openDrawingId: string | null;
  setLists: Dispatch<SetStateAction<ListData[]>>;
  setDrawings: Dispatch<SetStateAction<DrawingData[]>>;
  setDocuments: Dispatch<SetStateAction<DocumentData[]>>;
  setNotes: Dispatch<SetStateAction<NoteData[]>>;
  setLinks: Dispatch<SetStateAction<LinkData[]>>;
  setArrows: Dispatch<SetStateAction<ArrowData[]>>;
  setHeadings: Dispatch<SetStateAction<HeadingData[]>>;
  setFiles: Dispatch<SetStateAction<FileData[]>>;
  setTables: Dispatch<SetStateAction<TableData[]>>;
};

export function useBoardSelection({
  boardId,
  openDocumentId,
  openDrawingId,
  setLists,
  setDrawings,
  setDocuments,
  setNotes,
  setLinks,
  setArrows,
  setHeadings,
  setFiles,
  setTables,
}: Args) {
  const [selectedItemKeys, setSelectedItemKeys] = useState<Set<string>>(new Set());
  const [selectedDrawingIds, setSelectedDrawingIds] = useState<Set<string>>(new Set());
  const [contextMenu, setContextMenu] = useState<MenuState | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [deleting, setDeleting] = useState(false);

  const clearAllSelections = useCallback(() => {
    setSelectedItemKeys(new Set());
    setSelectedDrawingIds(new Set());
  }, []);

  const dropItems = useCallback(
    (items: ItemRef[]) => {
      const ids = groupItemIds(items);
      setLists((prev) =>
        prev
          .filter((list) => !ids.lists.has(list.id))
          .map((list) => ({
            ...list,
            cards: list.cards.filter((card) => !ids.cards.has(card.id)),
          })),
      );
      setDrawings((prev) => prev.filter((drawing) => !ids.drawings.has(drawing.id)));
      setDocuments((prev) => prev.filter((doc) => !ids.documents.has(doc.id)));
      setNotes((prev) => prev.filter((note) => !ids.notes.has(note.id)));
      setLinks((prev) => prev.filter((link) => !ids.links.has(link.id)));
      setArrows((prev) => prev.filter((arrow) => !ids.arrows.has(arrow.id)));
      setHeadings((prev) => prev.filter((heading) => !ids.headings.has(heading.id)));
      setFiles((prev) => prev.filter((file) => !ids.files.has(file.id)));
      setTables((prev) => prev.filter((table) => !ids.tables.has(table.id)));
    },
    [setArrows, setDocuments, setDrawings, setFiles, setHeadings, setLinks, setLists, setNotes, setTables],
  );

  const handleContextMenu = useCallback(
    (event: MouseEvent) => {
      const el = (event.target as HTMLElement).closest(
        "[data-item-type][data-item-id]",
      ) as HTMLElement | null;
      if (!el) return;

      const type = el.getAttribute("data-item-type") as ItemType | null;
      const id = el.getAttribute("data-item-id");
      if (!type || !id) return;

      event.preventDefault();
      const key = itemKey({ type, id });
      let selected = selectedItemKeys;
      if (!selected.has(key)) {
        selected = new Set([key]);
        setSelectedItemKeys(selected);
        setSelectedDrawingIds(type === "drawing" ? new Set([id]) : new Set());
      }

      setContextMenu({ x: event.clientX, y: event.clientY, items: keysToRefs(selected) });
    },
    [selectedItemKeys],
  );

  const handleCanvasClick = useCallback(
    (event: MouseEvent) => {
      const el = (event.target as HTMLElement).closest(
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

      if (event.shiftKey) {
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
        return;
      }

      setSelectedItemKeys(new Set([key]));
      setSelectedDrawingIds(type === "drawing" ? new Set([id]) : new Set());
    },
    [clearAllSelections],
  );

  const trashContextItems = useCallback(async () => {
    if (!contextMenu) return;
    const items = contextMenu.items;
    dropItems(items);
    clearAllSelections();
    try {
      await trashItems(items, boardId);
      setRefreshKey((key) => key + 1);
    } catch (err) {
      console.error("Trash failed", err);
    }
  }, [boardId, clearAllSelections, contextMenu, dropItems]);

  const duplicateContextItems = useCallback(async () => {
    if (!contextMenu) return;
    await duplicateItems(contextMenu.items, boardId);
    clearAllSelections();
  }, [boardId, clearAllSelections, contextMenu]);

  const deleteSelectedDrawings = useCallback(async () => {
    const ids = Array.from(selectedDrawingIds);
    if (ids.length === 0 || deleting) return;
    setDeleting(true);
    try {
      setDrawings((prev) => prev.filter((drawing) => !selectedDrawingIds.has(drawing.id)));
      setSelectedDrawingIds(new Set());
      setSelectedItemKeys(new Set());
      await trashItems(
        ids.map((id) => ({ type: "drawing" as const, id })),
        boardId,
      );
      setRefreshKey((key) => key + 1);
    } catch (err) {
      console.error("Failed to trash drawings", err);
    } finally {
      setDeleting(false);
    }
  }, [boardId, deleting, selectedDrawingIds, setDrawings]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (openDocumentId || openDrawingId) return;
      const tag = (event.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if ((event.target as HTMLElement | null)?.isContentEditable) return;

      if (event.key === "Escape") {
        clearAllSelections();
        setContextMenu(null);
        return;
      }

      if (
        (event.key === "Delete" || event.key === "Backspace") &&
        selectedItemKeys.size > 0
      ) {
        event.preventDefault();
        const refs = keysToRefs(selectedItemKeys);
        dropItems(refs);
        clearAllSelections();
        void trashItems(refs, boardId)
          .then(() => setRefreshKey((key) => key + 1))
          .catch((err) => console.error("Trash failed", err));
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [
    boardId,
    clearAllSelections,
    dropItems,
    openDocumentId,
    openDrawingId,
    selectedItemKeys,
  ]);

  const contextEntries = useMemo<ContextMenuEntry[]>(() => {
    if (!contextMenu) return [];
    const count = contextMenu.items.length;
    return [
      {
        label: count === 1 ? "Duplicate" : `Duplicate ${count} items`,
        icon: <IconCheck size={16} />,
        onClick: duplicateContextItems,
      },
      { divider: true as const },
      {
        label: count === 1 ? "Move to trash" : `Move ${count} to trash`,
        icon: <IconTrash size={16} />,
        danger: true,
        onClick: trashContextItems,
      },
    ];
  }, [contextMenu, duplicateContextItems, trashContextItems]);

  return {
    selectedItemKeys,
    setSelectedItemKeys,
    selectedDrawingIds,
    setSelectedDrawingIds,
    contextMenu,
    setContextMenu,
    contextEntries,
    refreshKey,
    deleting,
    clearAllSelections,
    handleContextMenu,
    handleCanvasClick,
    deleteSelectedDrawings,
  };
}
