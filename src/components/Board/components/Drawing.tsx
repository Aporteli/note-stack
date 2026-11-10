"use client";

import { useRef } from "react";
import { useDrawingMenu } from "@/components/Board/components/draw/menu/useDrawingMenu";
import { bandZ } from "@/components/Board/components/itemMenu/bandZ";
import type { DrawingData, Stroke } from "@/components/Board/types/board";

export function pointsToPath(points: [number, number][]): string {
  if (points.length === 0) return "";
  if (points.length === 1) {
    const [x, y] = points[0];
    return `M ${x} ${y} L ${x + 0.01} ${y}`;
  }
  let d = `M ${points[0][0]} ${points[0][1]}`;
  for (let i = 1; i < points.length; i++) {
    d += ` L ${points[i][0]} ${points[i][1]}`;
  }
  return d;
}

export function DrawingSvg({
  strokes,
  w,
  h,
}: {
  strokes: Stroke[];
  w: number;
  h: number;
}) {
  return (
    <svg
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      className="block h-full w-full overflow-visible"
    >
      {strokes.map((s, i) => (
        <path
          key={i}
          d={pointsToPath(s.points)}
          stroke={s.color}
          strokeWidth={s.width}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      ))}
    </svg>
  );
}

type Props = {
  boardId: string;
  drawing: DrawingData;
  selected: boolean;
  dragging: boolean;
  onOpen: (id: string) => void;
  onStartDrag: (
    id: string,
    clientX: number,
    clientY: number,
    shift: boolean,
  ) => void;
  onDelete: (id: string) => void;
  onCreated: (drawing: DrawingData) => void;
  onLock: (id: string, locked: boolean) => void;
  onFront: () => void;
  onBack: () => void;
  onSelect: () => void;
};

export function Drawing({
  boardId,
  drawing,
  selected,
  dragging,
  onOpen,
  onStartDrag,
  onDelete,
  onCreated,
  onLock,
  onFront,
  onBack,
  onSelect,
}: Props) {
  const startRef = useRef<{ x: number; y: number } | null>(null);
  const menu = useDrawingMenu({
    drawing,
    boardId,
    selected,
    onSelect,
    onDelete,
    onCreated,
    onLock,
    onFront,
    onBack,
  });
  const style: React.CSSProperties = {
    position: "absolute",
    left: drawing.x,
    top: drawing.y,
    width: drawing.w,
    height: drawing.h,
    zIndex: bandZ(30, 40, 60, drawing.z, selected, dragging),
    cursor: drawing.locked ? "default" : dragging ? "grabbing" : "grab",
    touchAction: "none",
    userSelect: "none",
  };

  return (
    <div
      style={style}
      data-item-type="drawing"
      data-item-id={drawing.id}
      onContextMenu={menu.onContextMenu}
      onPointerDown={(e) => {
        e.stopPropagation();
        if (e.button !== 0 || drawing.locked) return;
        startRef.current = { x: e.clientX, y: e.clientY };
        onStartDrag(drawing.id, e.clientX, e.clientY, e.shiftKey);
      }}
      onDoubleClick={(e) => {
        if (e.shiftKey) return;
        const start = startRef.current;
        const movedX = start ? e.clientX - start.x : 0;
        const movedY = start ? e.clientY - start.y : 0;
        if (Math.abs(movedX) + Math.abs(movedY) < 5) {
          e.stopPropagation();
          onOpen(drawing.id);
        }
      }}
      className={`overflow-hidden border-2 bg-white ${
        selected ? "border-black" : "border-slate-200"
      }`}
    >
      {drawing.strokes.length === 0 ? (
        <p className="pointer-events-none absolute inset-0 grid place-items-center text-sm text-slate-400">
          Double-click to draw
        </p>
      ) : null}
      <DrawingSvg strokes={drawing.strokes} w={drawing.w} h={drawing.h} />
      {menu.menu}
    </div>
  );
}