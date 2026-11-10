export function listUnderFile(clientX: number, clientY: number, fileId: string) {
  const ignore = document.querySelector(`[data-item-type="file"][data-item-id="${CSS.escape(fileId)}"]`);
  for (const el of document.elementsFromPoint(clientX, clientY)) {
    if (!(el instanceof Element)) continue;
    if (ignore && (el === ignore || ignore.contains(el))) continue;
    const list = el.closest("[data-item-type='list'][data-item-id]");
    const id = list?.getAttribute("data-item-id");
    if (id) return id;
  }
  return null;
}
