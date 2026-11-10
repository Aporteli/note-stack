import { placeDocumentCopy } from "@/app/documents/placeDocumentCopy";
import type { DocumentData } from "@/components/Board/types/board";

export async function duplicateDocument(
  document: DocumentData,
  boardId: string,
  onCreated: (document: DocumentData) => void,
) {
  const created = await placeDocumentCopy(boardId, {
    title: document.title,
    text: document.text,
    strokes: document.strokes,
    x: document.x + 28,
    y: document.y + 28,
  });
  onCreated(created);
}
