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
  const notes = new Set<string>();
  const links = new Set<string>();
  const arrows = new Set<string>();
  const headings = new Set<string>();
  const files = new Set<string>();
  const tables = new Set<string>();
  for (const item of items) {
    if (item.type === "list") lists.add(item.id);
    else if (item.type === "card") cards.add(item.id);
    else if (item.type === "drawing") drawings.add(item.id);
    else if (item.type === "note") notes.add(item.id);
    else if (item.type === "link") links.add(item.id);
    else if (item.type === "arrow") arrows.add(item.id);
    else if (item.type === "heading") headings.add(item.id);
    else if (item.type === "file") files.add(item.id);
    else if (item.type === "table") tables.add(item.id);
    else documents.add(item.id);
  }
  return { lists, cards, drawings, documents, notes, links, arrows, headings, files, tables };
}
