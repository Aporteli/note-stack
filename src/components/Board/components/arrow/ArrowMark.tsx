"use client";

import type { MouseEvent as ReactMouseEvent, PointerEvent as ReactPointerEvent } from "react";
import { useArrowMenu } from "@/components/Board/components/arrow/menu/useArrowMenu";
import { arrowHead } from "@/components/Board/components/arrow/arrowHead";
import type { ArrowData } from "@/components/Board/types/arrow";

type Point = { x: number; y: number };

type Props = {
  arrow: ArrowData;
  boardId: string;
  selected: boolean;
  from: Point;
  to: Point;
  onSelect: () => void;
  onDelete: (id: string) => void;
  onBegin: (event: ReactPointerEvent<SVGCircleElement>, end: "from" | "to") => void;
};

export function ArrowMark({
  arrow,
  boardId,
  selected,
  from,
  to,
  onSelect,
  onDelete,
  onBegin,
}: Props) {
  const menu = useArrowMenu({ id: arrow.id, boardId, onSelect, onDelete });
  const color = selected ? "#2563eb" : "#0f172a";

  function pick(event: ReactPointerEvent | ReactMouseEvent) {
    event.stopPropagation();
    onSelect();
  }

  return (
    <g pointerEvents="none">
      <line
        x1={from.x}
        y1={from.y}
        x2={to.x}
        y2={to.y}
        stroke="transparent"
        strokeWidth={22}
        pointerEvents="stroke"
        data-item-type="arrow"
        data-item-id={arrow.id}
        onPointerDown={pick}
        onClick={pick}
        onContextMenu={menu.onContextMenu}
      />
      {selected ? (
        <line
          x1={from.x}
          y1={from.y}
          x2={to.x}
          y2={to.y}
          stroke="#93c5fd"
          strokeWidth={8}
          strokeLinecap="round"
          pointerEvents="none"
        />
      ) : null}
      <line
        x1={from.x}
        y1={from.y}
        x2={to.x}
        y2={to.y}
        stroke={color}
        strokeWidth={selected ? 3 : 2}
        strokeLinecap="round"
        pointerEvents="stroke"
        onPointerDown={pick}
        onClick={pick}
        onContextMenu={menu.onContextMenu}
      />
      <polygon
        points={arrowHead(from.x, from.y, to.x, to.y)}
        fill={color}
        pointerEvents="fill"
        onPointerDown={pick}
        onClick={pick}
        onContextMenu={menu.onContextMenu}
      />
      <circle
        cx={from.x}
        cy={from.y}
        r={selected ? 5 : 3}
        fill="white"
        stroke={color}
        strokeWidth={1.5}
        pointerEvents="all"
        style={{ cursor: "grab" }}
        onPointerDown={(event) => onBegin(event, "from")}
        onClick={(event) => event.stopPropagation()}
      />
      <circle
        cx={to.x}
        cy={to.y}
        r={selected ? 5 : 3}
        fill="white"
        stroke={color}
        strokeWidth={1.5}
        pointerEvents="all"
        style={{ cursor: "grab" }}
        onPointerDown={(event) => onBegin(event, "to")}
        onClick={(event) => event.stopPropagation()}
      />
      {menu.menu}
    </g>
  );
}
