import type { Dispatch, SetStateAction } from "react";
import { createArrow } from "@/app/arrows/createArrow";
import { saveArrowEnd } from "@/app/arrows/saveArrowEnd";
import { noteDropPoint } from "@/components/Board/lib/note/noteDropPoint";
import { tempId } from "@/components/Board/lib/note/tempId";
import { ARROW_LENGTH, type ArrowData } from "@/components/Board/types/arrow";

type Args = {
  boardId: string;
  pointer: { x: number; y: number };
  grab: { x: number; y: number };
  canvas: HTMLDivElement;
  setArrows: Dispatch<SetStateAction<ArrowData[]>>;
};

export async function placeNewArrow({ boardId, pointer, grab, canvas, setArrows }: Args) {
  const point = noteDropPoint(pointer, grab, canvas.getBoundingClientRect());
  const placeholderId = tempId();
  const placeholder: ArrowData = {
    id: placeholderId,
    x1: point.x,
    y1: point.y,
    x2: point.x + ARROW_LENGTH,
    y2: point.y,
    fromType: "",
    fromId: "",
    fromSide: "",
    toType: "",
    toId: "",
    toSide: "",
  };
  setArrows((prev) => [...prev, placeholder]);

  try {
    const created = await createArrow(boardId, {
      x1: placeholder.x1,
      y1: placeholder.y1,
      x2: placeholder.x2,
      y2: placeholder.y2,
    });
    let current = created;
    setArrows((prev) =>
      prev.map((arrow) => {
        if (arrow.id !== placeholderId) return arrow;
        current = { ...arrow, id: created.id };
        return current;
      }),
    );
    if (moved(current, placeholder)) {
      await saveArrowEnd(created.id, "from", endOf(current, "from"), boardId);
      await saveArrowEnd(created.id, "to", endOf(current, "to"), boardId);
    }
  } catch (err) {
    setArrows((prev) => prev.filter((arrow) => arrow.id !== placeholderId));
    console.error("Failed to create arrow", err);
  }
}

function moved(arrow: ArrowData, origin: ArrowData) {
  return (
    arrow.x1 !== origin.x1 ||
    arrow.y1 !== origin.y1 ||
    arrow.x2 !== origin.x2 ||
    arrow.y2 !== origin.y2 ||
    arrow.fromId !== "" ||
    arrow.toId !== ""
  );
}

function endOf(arrow: ArrowData, end: "from" | "to") {
  if (end === "from") {
    return { x: arrow.x1, y: arrow.y1, type: arrow.fromType, id: arrow.fromId, side: arrow.fromSide };
  }
  return { x: arrow.x2, y: arrow.y2, type: arrow.toType, id: arrow.toId, side: arrow.toSide };
}
