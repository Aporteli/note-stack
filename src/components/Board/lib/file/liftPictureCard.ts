import type { Dispatch, SetStateAction } from "react";
import { placePictureOnBoard } from "@/app/cards/placePictureOnBoard";
import { findCardPosition } from "@/components/Board/lib/dnd";
import { dropPoint } from "@/components/Board/lib/file/dropPoint";
import { listAtPoint } from "@/components/Board/lib/file/listAtPoint";
import { holdFile, releaseFile } from "@/components/Board/lib/file/mergeFiles";
import { noteRemoved, showRemoved } from "@/components/Board/lib/keepRemoved";
import { FILE_W } from "@/components/Board/types/boardFile";
import { fileIdFromCardImage } from "@/lib/files/fileIdFromCardImage";
import type { ListData } from "@/components/Board/types/board";
import type { FileData } from "@/components/Board/types/boardFile";

type Args = {
  lists: ListData[];
  setLists: Dispatch<SetStateAction<ListData[]>>;
  setFiles: Dispatch<SetStateAction<FileData[]>>;
  boardId: string;
  cardId: string;
  pointer: { x: number; y: number } | null;
  canvas: HTMLElement | null;
};

/** Dropping a picture card outside every list puts that picture back on the board. */
export async function liftPictureCard({
  lists,
  setLists,
  setFiles,
  boardId,
  cardId,
  pointer,
  canvas,
}: Args) {
  if (!pointer || !canvas) return false;
  const source = findCardPosition(lists, cardId);
  if (!source) return false;
  const card = lists[source.listIndex].cards[source.cardIndex];
  const fileId = fileIdFromCardImage(card?.image);
  if (!card || !fileId || listAtPoint(pointer.x, pointer.y)) return false;

  const view = (canvas.parentElement ?? canvas).getBoundingClientRect();
  const onBoard =
    pointer.x >= view.left &&
    pointer.x <= view.right &&
    pointer.y >= view.top &&
    pointer.y <= view.bottom;
  if (!onBoard) return false;

  const raw = dropPoint(canvas, pointer.x, pointer.y);
  const point = { x: Math.max(0, raw.x - FILE_W / 2), y: Math.max(0, raw.y - 36) };
  const listId = lists[source.listIndex].id;
  noteRemoved([card], []);
  holdFile(fileId);
  setLists((prev) =>
    prev.map((list) =>
      list.id === listId ? { ...list, cards: list.cards.filter((item) => item.id !== card.id) } : list,
    ),
  );
  setFiles((prev) => {
    const next = {
      id: fileId,
      key: fileId,
      name: card.title || "Image",
      mime: "image/*",
      size: 0,
      kind: "image",
      x: point.x,
      y: point.y,
    };
    return prev.some((file) => file.id === fileId)
      ? prev.map((file) => (file.id === fileId ? { ...file, x: point.x, y: point.y } : file))
      : [...prev, next];
  });

  const placed = await placePictureOnBoard(card.id, point.x, point.y, boardId);
  if (!placed) {
    showRemoved([card.id]);
    releaseFile(fileId);
    setLists((prev) =>
      prev.map((list) =>
        list.id === listId && !list.cards.some((item) => item.id === card.id)
          ? { ...list, cards: [...list.cards, card] }
          : list,
      ),
    );
    setFiles((prev) => prev.filter((file) => file.id !== fileId));
    return true;
  }
  setFiles((prev) =>
    prev.map((file) => (file.id === placed.id ? { ...placed, key: placed.id } : file)),
  );
  return true;
}
