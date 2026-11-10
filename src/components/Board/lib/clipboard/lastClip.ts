export type ClipKind = "note" | "document" | "drawing" | "heading";

let kind: ClipKind | null = null;

export function markClip(next: ClipKind) {
  kind = next;
}

export function lastClip() {
  return kind;
}
