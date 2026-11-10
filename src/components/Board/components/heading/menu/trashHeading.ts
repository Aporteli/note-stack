import { trashItems } from "@/app/actions";

export function trashHeading(headingId: string, boardId: string, remove: (id: string) => void) {
  remove(headingId);
  void trashItems([{ type: "heading", id: headingId }], boardId);
}
