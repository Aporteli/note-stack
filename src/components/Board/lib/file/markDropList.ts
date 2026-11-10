export function markDropList(listId: string | null) {
  for (const node of document.querySelectorAll("[data-file-drop]")) {
    node.removeAttribute("data-file-drop");
  }
  if (!listId) return;
  document
    .querySelector(`[data-item-type="list"][data-item-id="${CSS.escape(listId)}"]`)
    ?.setAttribute("data-file-drop", "true");
}
