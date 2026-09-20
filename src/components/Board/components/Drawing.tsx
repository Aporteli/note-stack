"use client";

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
  drawing: DrawingData;
  selected: boolean;
  dragging: boolean;
  onStartDrag: (
    id: string,
    clientX: number,
    clientY: number,
    shift: boolean,
  ) => void;
};

export function Drawing({
  drawing,
  selected,
  dragging,
  onStartDrag,
}: Props) {
  const style: React.CSSProperties = {
    position: "absolute",
    left: drawing.x,
    top: drawing.y,
    width: drawing.w,
    height: drawing.h,
    zIndex: dragging ? 60 : selected ? 40 : 30,
    cursor: dragging ? "grabbing" : "grab",
    touchAction: "none",
    userSelect: "none",
  };

  return (
    <div
      style={style}
      data-item-type="drawing"
      data-item-id={drawing.id}
      onPointerDown={(e) => {
        e.stopPropagation();
        onStartDrag(drawing.id, e.clientX, e.clientY, e.shiftKey);
      }}
      className={
        selected
          ? "rounded outline outline-2 outline-blue-500 outline-offset-4"
          : "rounded hover:outline hover:outline-1 hover:outline-slate-400/40 hover:outline-offset-4"
      }
    >
      <DrawingSvg strokes={drawing.strokes} w={drawing.w} h={drawing.h} />
    </div>
  );
}