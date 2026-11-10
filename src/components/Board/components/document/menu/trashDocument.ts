import { trashItems } from "@/app/actions";

export function trashDocument(documentId: string, boardId: string, remove: (id: string) => void) {
  remove(documentId);
  void trashItems([{ type: "document", id: documentId }], boardId).catch((err) => {
    console.error("Trash failed", err);
  });
}
