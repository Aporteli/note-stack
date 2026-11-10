import { placeDocumentCopy } from "@/app/documents/placeDocumentCopy";
import { clearCutDocument, readDocumentClip } from "@/components/Board/lib/document/clipboard/DocumentClip";
import type { DocumentData } from "@/components/Board/types/board";

export async function pasteDocument(boardId: string, onCreated: (document: DocumentData) => void) {
  const clip = readDocumentClip();
  if (!clip) return;
  const created = await placeDocumentCopy(boardId, {
    title: clip.title,
    text: clip.text,
    strokes: clip.strokes,
    x: clip.x + 28,
    y: clip.y + 28,
  });
  clearCutDocument();
  onCreated(created);
}
