import { setListZ } from "@/app/lists/setListZ";

export function stackList(listId: string, z: number, boardId: string, apply: (id: string, z: number) => void) {
  apply(listId, z);
  void setListZ(listId, z, boardId);
}
