import type { ItemRef, TrashItem } from "@/components/Board/types/board";

export function trashItemDetail(item: TrashItem): string {
  const kind =
    item.type === "card" && item.listTitle
      ? `Card in ${item.listTitle}`
      : item.type === "list"
        ? "List"
        : item.type === "note"
          ? "Note"
          : item.type === "document"
            ? "Document"
            : "Drawing";
  return `${kind} · ${new Date(item.trashedAt).toLocaleDateString()}`;
}

export function trashConfirmTitle(
  confirm: "restore" | "purge",
  selectedCount: number,
): string {
  if (confirm === "purge") {
    return selectedCount > 0
      ? `Permanently delete ${selectedCount} item${selectedCount === 1 ? "" : "s"}?`
      : "Empty the trash?";
  }
  return `Restore ${selectedCount} item${selectedCount === 1 ? "" : "s"}?`;
}

export function trashConfirmBody(confirm: "restore" | "purge"): string {
  return confirm === "purge"
    ? "This action cannot be undone. All selected items will be gone forever."
    : "Restored items will return to the board where they were before.";
}

export function toItemRefs(items: TrashItem[]): ItemRef[] {
  return items.map((item) => ({ type: item.type, id: item.id }));
}
