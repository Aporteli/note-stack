export function bindWheel(element: HTMLElement, onWheel: (event: WheelEvent) => void): () => void {
  const listener = (event: WheelEvent) => onWheel(event);
  element.addEventListener("wheel", listener, { passive: false });
  return () => element.removeEventListener("wheel", listener);
}
