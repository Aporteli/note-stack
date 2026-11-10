import { setDocumentLocked } from "@/app/documents/setDocumentLocked";

export function lockDocument(
  documentId: string,
  locked: boolean,
  boardId: string,
  apply: (id: string, locked: boolean) => void,
) {
  apply(documentId, locked);
  void setDocumentLocked(documentId, locked, boardId);
}
