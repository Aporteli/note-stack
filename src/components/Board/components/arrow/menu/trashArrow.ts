import { trashItems } from "@/app/actions";

export function trashArrow(id: string, boardId: string, remove: (id: string) => void) {
  remove(id);
  void trashItems([{ type: "arrow", id }], boardId).catch((err) => {
    console.error("Trash failed", err);
  });
}
