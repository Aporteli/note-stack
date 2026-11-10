"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { getTrash, purgeItems, restoreItems } from "@/app/actions";
import { showRemoved } from "@/components/Board/lib/keepRemoved";
import { toItemRefs } from "@/components/Board/lib/trash";
import type { ItemRef, TrashBundle, TrashItem } from "@/components/Board/types/board";
import { itemKey } from "@/components/Board/types/board";

export function useTrashMenu(boardId: string, refreshKey: number) {
  const [open, setOpen] = useState(false);
  const [bundle, setBundle] = useState<TrashBundle | null>(null);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [confirm, setConfirm] = useState<null | "restore" | "purge">(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const allItems: TrashItem[] = useMemo(() => {
    if (!bundle) return [];
    return [
      ...bundle.lists,
      ...bundle.cards,
      ...bundle.drawings,
      ...bundle.documents,
      ...bundle.notes,
      ...bundle.links,
      ...bundle.arrows,
      ...bundle.headings,
      ...bundle.files,
      ...bundle.tables,
    ];
  }, [bundle]);

  const total = allItems.length;

  const load = async () => {
    setLoading(true);
    try {
      const data = await getTrash(boardId);
      setBundle(data);
    } catch (err) {
      console.error("Failed to load trash", err);
      setError(err instanceof Error ? err.message : "Could not load trash.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, refreshKey]);

  useEffect(() => {
    if (!open) return;
    if (confirm !== null) return;

    const onDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (triggerRef.current?.contains(target)) return;
      if (panelRef.current?.contains(target)) return;
      const el = event.target as HTMLElement;
      if (el.closest("[data-confirm-dialog]")) return;

      setOpen(false);
    };

    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open, confirm]);

  const toggle = (item: TrashItem) => {
    const key = itemKey(item);
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const selectedItems: ItemRef[] = useMemo(() => {
    const refs: ItemRef[] = [];
    for (const item of allItems) {
      if (selected.has(itemKey(item))) {
        refs.push({ type: item.type, id: item.id });
      }
    }
    return refs;
  }, [allItems, selected]);

  const handleRestore = async () => {
    if (selectedItems.length === 0) return;
    setBusy(true);
    setError(null);
    try {
      showRemoved(selectedItems.map((item) => item.id));
      await restoreItems(selectedItems, boardId);
      setSelected(new Set());
      await load();
    } catch (err) {
      console.error("Restore failed", err);
      setError(err instanceof Error ? err.message : "Could not restore items.");
    } finally {
      setBusy(false);
      setConfirm(null);
    }
  };

  const handlePurge = async () => {
    const targets = selectedItems.length > 0 ? selectedItems : toItemRefs(allItems);

    if (targets.length === 0) {
      setConfirm(null);
      return;
    }

    setBusy(true);
    setError(null);
    try {
      await purgeItems(targets, boardId);
      setSelected(new Set());
      await load();
    } catch (err) {
      console.error("Purge failed", err);
      setError(err instanceof Error ? err.message : "Could not delete items.");
    } finally {
      setBusy(false);
      setConfirm(null);
    }
  };

  function toggleAll() {
    if (selected.size === total) setSelected(new Set());
    else setSelected(new Set(allItems.map((item) => itemKey(item))));
  }

  return {
    open,
    setOpen,
    loading,
    selected,
    confirm,
    setConfirm,
    busy,
    error,
    triggerRef,
    panelRef,
    allItems,
    total,
    selectedItems,
    toggle,
    toggleAll,
    handleRestore,
    handlePurge,
  };
}
