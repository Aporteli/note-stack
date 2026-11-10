import { convertListToBoard } from "@/app/lists/convertListToBoard";

export async function convertToBoard(listId: string, boardId: string) {
  const board = await convertListToBoard(listId, boardId);
  if (!board) return;
  window.location.assign(`/board/${board.id}`);
}
