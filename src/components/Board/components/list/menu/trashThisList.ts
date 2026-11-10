import { trashItems } from "@/app/actions";

export function trashThisList(listId: string, boardId: string, remove: (id: string) => void) {
  remove(listId);
  void trashItems([{ type: "list", id: listId }], boardId);
}
