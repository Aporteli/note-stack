import { markClip } from "@/components/Board/lib/clipboard/lastClip";
import { writeDocumentClip } from "@/components/Board/lib/document/clipboard/DocumentClip";
import type { DocumentData } from "@/components/Board/types/board";

export function copyDocument(document: DocumentData) {
  markClip("document");
  writeDocumentClip({
    cut: false,
    title: document.title,
    text: document.text,
    strokes: document.strokes,
    x: document.x,
    y: document.y,
  });
  void navigator.clipboard.writeText(document.text).catch(() => undefined);
}
