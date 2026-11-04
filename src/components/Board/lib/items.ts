import type { ItemRef, ItemType } from "@/components/Board/types/board";

export const isTempId = (id: string) => id.startsWith("temp-");

export function keysToRefs(keys: Iterable<string>): ItemRef[] {
  const refs: ItemRef[] = [];
  for (const key of keys) {
    const [type, id] = key.split(":") as [ItemType, string];
    refs.push({ type, id });
  }
  return refs;
}

export function groupItemIds(items: ItemRef[]) {
  const lists = new Set<string>();
  const cards = new Set<string>();
  const drawings = new Set<string>();
  const documents = new Set<string>();
  for (const item of items) {
    if (item.type === "list") lists.add(item.id);
    else if (item.type === "card") cards.add(item.id);
    else if (item.type === "drawing") drawings.add(item.id);
    else documents.add(item.id);
  }
  return { lists, cards, drawings, documents };
}
