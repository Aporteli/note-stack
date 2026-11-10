import { trashItems } from "@/app/actions";
import { markClip } from "@/components/Board/lib/clipboard/lastClip";
import { writeDocumentClip } from "@/components/Board/lib/document/clipboard/DocumentClip";
import type { DocumentData } from "@/components/Board/types/board";

export function cutDocument(document: DocumentData, boardId: string, remove: (id: string) => void) {
  markClip("document");
  writeDocumentClip({
    cut: true,
    title: document.title,
    text: document.text,
    strokes: document.strokes,
    x: document.x,
    y: document.y,
  });
  void navigator.clipboard.writeText(document.text).catch(() => undefined);
  remove(document.id);
  void trashItems([{ type: "document", id: document.id }], boardId);
}
