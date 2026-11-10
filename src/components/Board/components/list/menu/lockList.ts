import { setListLocked } from "@/app/lists/setListLocked";

export function lockList(
  listId: string,
  locked: boolean,
  boardId: string,
  apply: (id: string, locked: boolean) => void,
) {
  apply(listId, locked);
  void setListLocked(listId, locked, boardId);
}
