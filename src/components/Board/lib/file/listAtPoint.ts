/** The list under the pointer, measured from the list frame so a drag preview cannot hide it. */
export function listAtPoint(clientX: number, clientY: number) {
  for (const node of document.querySelectorAll("[data-item-type='list'][data-item-id]")) {
    if (!(node instanceof HTMLElement)) continue;
    const rect = node.getBoundingClientRect();
    if (clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom) {
      return node.getAttribute("data-item-id");
    }
  }
  return null;
}
