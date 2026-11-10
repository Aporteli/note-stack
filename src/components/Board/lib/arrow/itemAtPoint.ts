const TOOLS = new Set(["list", "note", "document", "drawing", "link", "heading", "file", "table"]);

export function itemAtPoint(clientX: number, clientY: number, ignore: Element | null) {
  const stack = document.elementsFromPoint(clientX, clientY);
  for (const el of stack) {
    if (!(el instanceof Element)) continue;
    if (ignore && (el === ignore || ignore.contains(el))) continue;
    if (el.closest("[data-arrow-root]")) continue;
    const item = el.closest("[data-item-type][data-item-id]");
    if (!(item instanceof HTMLElement)) continue;
    const type = item.getAttribute("data-item-type") ?? "";
    const id = item.getAttribute("data-item-id") ?? "";
    if (type === "card") {
      const list = item.closest("[data-item-type='list'][data-item-id]");
      const listId = list?.getAttribute("data-item-id") ?? "";
      if (listId) return { type: "list", id: listId };
      continue;
    }
    if (TOOLS.has(type) && id) return { type, id };
  }
  return null;
}
