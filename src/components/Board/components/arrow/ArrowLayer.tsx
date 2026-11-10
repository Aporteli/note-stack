"use client";

import { useEffect, useState, type Dispatch, type PointerEvent as ReactPointerEvent, type RefObject, type SetStateAction } from "react";
import { saveArrowEnd } from "@/app/arrows/saveArrowEnd";
import { ArrowMark } from "@/components/Board/components/arrow/ArrowMark";
import { itemAtPoint } from "@/components/Board/lib/arrow/itemAtPoint";
import { canvasPoint, measureBox } from "@/components/Board/lib/arrow/measureBox";
import { nearestSide } from "@/components/Board/lib/arrow/nearestSide";
import { resolveEnd } from "@/components/Board/lib/arrow/resolveEnd";
import { sidePoint } from "@/components/Board/lib/arrow/sidePoint";
import type { ArrowData } from "@/components/Board/types/arrow";

type Drag = { id: string; end: "from" | "to"; x: number; y: number };

type Props = {
  boardId: string;
  canvasRef: RefObject<HTMLDivElement | null>;
  arrows: ArrowData[];
  selectedItemKeys: Set<string>;
  setArrows: Dispatch<SetStateAction<ArrowData[]>>;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
};

export function ArrowLayer({
  boardId,
  canvasRef,
  arrows,
  selectedItemKeys,
  setArrows,
  onSelect,
  onDelete,
}: Props) {
  const [drag, setDrag] = useState<Drag | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let frame = 0;
    const onMove = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        setTick((n) => n + 1);
      });
    };
    window.addEventListener("pointermove", onMove);
    return () => {
      window.removeEventListener("pointermove", onMove);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  function pointFor(arrow: ArrowData, end: "from" | "to") {
    if (drag && drag.id === arrow.id && drag.end === end) return { x: drag.x, y: drag.y };
    return resolveEnd(canvasRef.current, arrow, end);
  }

  function begin(event: ReactPointerEvent<SVGCircleElement>, arrow: ArrowData, end: "from" | "to") {
    if (event.button !== 0) return;
    event.preventDefault();
    event.stopPropagation();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const handle = event.currentTarget;

    const move = (ev: PointerEvent) => {
      const point = canvasPoint(canvas, ev.clientX, ev.clientY);
      setDrag({ id: arrow.id, end, x: point.x, y: point.y });
    };
    const up = (ev: PointerEvent) => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
      const point = canvasPoint(canvas, ev.clientX, ev.clientY);
      const hit = itemAtPoint(ev.clientX, ev.clientY, handle);
      const box = hit ? measureBox(canvas, hit.type, hit.id) : null;
      const side = hit && box ? nearestSide(box, point) : "";
      const stuck = hit && box && side ? sidePoint(box, side) : point;
      const value = {
        x: stuck.x,
        y: stuck.y,
        type: hit && box ? hit.type : "",
        id: hit && box ? hit.id : "",
        side,
      };
      setArrows((prev) =>
        prev.map((item) =>
          item.id === arrow.id
            ? end === "from"
              ? { ...item, x1: value.x, y1: value.y, fromType: value.type, fromId: value.id, fromSide: value.side }
              : { ...item, x2: value.x, y2: value.y, toType: value.type, toId: value.id, toSide: value.side }
            : item,
        ),
      );
      setDrag(null);
      void saveArrowEnd(arrow.id, end, value, boardId);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
  }

  void tick;

  return (
    <svg
      data-arrow-root
      className="absolute inset-0 h-full w-full"
      pointerEvents="none"
      style={{ zIndex: 200 }}
    >
      {arrows.map((arrow) => (
        <ArrowMark
          key={arrow.id}
          arrow={arrow}
          boardId={boardId}
          selected={selectedItemKeys.has(`arrow:${arrow.id}`)}
          from={pointFor(arrow, "from")}
          to={pointFor(arrow, "to")}
          onSelect={() => onSelect(arrow.id)}
          onDelete={onDelete}
          onBegin={(event, end) => begin(event, arrow, end)}
        />
      ))}
    </svg>
  );
}
