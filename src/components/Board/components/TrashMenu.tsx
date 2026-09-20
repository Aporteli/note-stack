"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/Button";
import { IconTrash } from "@/components/ui/Icons";
import { getTrash, purgeItems, restoreItems } from "@/app/actions";
import type {
  ItemRef,
  TrashBundle,
  TrashItem,
} from "@/components/Board/types/board";
import { itemKey } from "@/components/Board/types/board";
import { ConfirmDialog } from "./ConfirmDialog";

type Props = {
  boardId: string;
  /** Changes whenever the board is revalidated — used to refresh trash. */
  refreshKey: number;
};

export function TrashMenu({ boardId, refreshKey }: Props) {
  const [open, setOpen] = useState(false);
  const [bundle, setBundle] = useState<TrashBundle | null>(null);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [confirm, setConfirm] = useState<null | "restore" | "purge">(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* Two refs: one for the trigger wrapper, one for the portaled panel.
     Clicks inside either must NOT close the dropdown. */
  const triggerRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const allItems: TrashItem[] = useMemo(() => {
    if (!bundle) return [];
    return [...bundle.lists, ...bundle.cards, ...bundle.drawings];
  }, [bundle]);

  const total = allItems.length;

  /* -------------------- Load trash -------------------- */

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

  /* -------------------- Outside click -------------------- */

  useEffect(() => {
    if (!open) return;
    if (confirm !== null) return;

    const onDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (triggerRef.current?.contains(target)) return;
      if (panelRef.current?.contains(target)) return;
      const el = e.target as HTMLElement;
      if (el.closest("[data-confirm-dialog]")) return;

      setOpen(false);
    };

    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open, confirm]);

  /* -------------------- Selection helpers -------------------- */

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

  /* -------------------- Actions -------------------- */

  const handleRestore = async () => {
    if (selectedItems.length === 0) return;
    setBusy(true);
    setError(null);
    try {
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
    const targets =
      selectedItems.length > 0
        ? selectedItems
        : allItems.map((i) => ({ type: i.type, id: i.id } as ItemRef));

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

  const handleConfirm = confirm === "purge" ? handlePurge : handleRestore;

  const confirmTitle =
    confirm === "purge"
      ? selectedItems.length > 0
        ? `Permanently delete ${selectedItems.length} item${
            selectedItems.length === 1 ? "" : "s"
          }?`
        : "Empty the trash?"
      : `Restore ${selectedItems.length} item${
          selectedItems.length === 1 ? "" : "s"
        }?`;

  const confirmBody =
    confirm === "purge"
      ? "This action cannot be undone. All selected items will be gone forever."
      : "Restored items will return to the board where they were before.";

  return (
    <>
      <div className="relative" ref={triggerRef}>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-haspopup="menu"
          aria-expanded={open}
          aria-label="Trash"
          title="Trash"
          className={`
            relative inline-flex h-9 w-9 items-center justify-center rounded-lg
            text-slate-700 ring-1 ring-slate-200 transition-colors
            hover:bg-slate-50
            ${open ? "bg-slate-100" : "bg-white"}
          `}
        >
          <IconTrash size={16} />
          {total > 0 && (
            <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-red-600 px-1 text-[10px] font-semibold leading-none text-white">
              {total}
            </span>
          )}
        </button>
      </div>

      {open &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={panelRef}
            role="menu"
            style={{
              position: "fixed",
              right: 16,
              top: 64,
              width: 340,
            }}
            className="z-[160] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/10"
          >
            <header className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
              <div className="flex items-center gap-2">
                <IconTrash size={16} className="text-slate-600" />
                <h3 className="text-sm font-semibold text-slate-900">Trash</h3>
                {total > 0 && (
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                    {total}
                  </span>
                )}
              </div>
              {total > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    if (selected.size === total) setSelected(new Set());
                    else setSelected(new Set(allItems.map((i) => itemKey(i))));
                  }}
                  className="text-xs font-medium text-blue-600 hover:underline"
                >
                  {selected.size === total ? "Deselect all" : "Select all"}
                </button>
              )}
            </header>

            <div className="max-h-[50vh] overflow-y-auto py-1">
              {loading && (
                <p className="px-4 py-6 text-center text-sm text-slate-500">
                  Loading…
                </p>
              )}

              {!loading && total === 0 && (
                <p className="px-4 py-8 text-center text-sm text-slate-500">
                  Trash is empty.
                </p>
              )}

              {!loading &&
                allItems.map((item) => {
                  const key = itemKey(item);
                  const checked = selected.has(key);
                  return (
                    <label
                      key={key}
                      className="flex cursor-pointer items-center gap-3 px-4 py-2 hover:bg-slate-50"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggle(item)}
                        className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm text-slate-800">
                          {item.title}
                        </p>
                        <p className="truncate text-xs text-slate-500">
                          {item.type === "card" && item.listTitle
                            ? `Card in ${item.listTitle}`
                            : item.type === "list"
                              ? "List"
                              : "Drawing"}
                          {" · "}
                          {new Date(item.trashedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </label>
                  );
                })}
            </div>

            {error && (
              <div className="border-t border-red-200 bg-red-50 px-4 py-2 text-xs text-red-700">
                {error}
              </div>
            )}

            {total > 0 && (
              <footer className="flex items-center justify-between gap-2 border-t border-slate-200 bg-slate-50 px-3 py-2">
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={selected.size === 0 || busy}
                  onClick={() => setConfirm("restore")}
                >
                  Restore {selected.size > 0 ? `(${selected.size})` : ""}
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  disabled={busy}
                  onClick={() => setConfirm("purge")}
                >
                  {selected.size > 0
                    ? `Delete (${selected.size})`
                    : "Empty trash"}
                </Button>
              </footer>
            )}
          </div>,
          document.body,
        )}

      <ConfirmDialog
        open={confirm !== null}
        title={confirmTitle}
        body={confirmBody}
        tone={confirm === "purge" ? "danger" : "default"}
        confirmLabel={confirm === "purge" ? "Delete forever" : "Restore"}
        busy={busy}
        onCancel={() => setConfirm(null)}
        onConfirm={handleConfirm}
      />
    </>
  );
}