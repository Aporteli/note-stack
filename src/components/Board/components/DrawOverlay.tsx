"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Button, IconButton } from "@/components/ui/Button";
import { IconCheck, IconClose, IconPencil, IconTrash } from "@/components/ui/Icons";
import type { Stroke } from "@/components/Board/types/board";
import { DrawingSvg } from "./Drawing";

type Tool = "pencil" | "eraser";

const COLORS = [
  { name: "Ink", value: "rgb(15 23 42)" },
  { name: "Coral", value: "rgb(244 114 90)" },
  { name: "Lagoon", value: "rgb(56 168 194)" },
  { name: "Mint", value: "rgb(120 200 160)" },
  { name: "Orchid", value: "rgb(178 130 220)" },
];

const WIDTHS = [2, 4, 8, 16];
const ERASER_RADIUS = 14;

type Props = {
  width: number;
  height: number;
  onSave: (
    bounds: { x: number; y: number; w: number; h: number },
    strokes: Stroke[],
  ) => void;
  onDiscard: () => void;
};

/** Drop any stroke whose any point is within the eraser radius. */
function eraseAt(strokes: Stroke[], x: number, y: number, r: number): Stroke[] {
  const r2 = r * r;
  return strokes.filter((s) => {
    for (const [px, py] of s.points) {
      const dx = px - x;
      const dy = py - y;
      if (dx * dx + dy * dy < r2) return false;
    }
    return true;
  });
}

export function DrawOverlay({ width, height, onSave, onDiscard }: Props) {
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [current, setCurrent] = useState<Stroke | null>(null);
  const [tool, setTool] = useState<Tool>("pencil");
  const [color, setColor] = useState(COLORS[0].value);
  const [thickness, setThickness] = useState(WIDTHS[1]);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onDiscard();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onDiscard]);

  function getLocalPoint(e: React.PointerEvent): [number, number] {
    const svg = svgRef.current;
    if (!svg) return [0, 0];
    const rect = svg.getBoundingClientRect();
    return [e.clientX - rect.left, e.clientY - rect.top];
  }

  function handlePointerDown(e: React.PointerEvent) {
    e.preventDefault();
    (e.currentTarget as Element).setPointerCapture?.(e.pointerId);

    const [x, y] = getLocalPoint(e);

    if (tool === "eraser") {
      setStrokes((prev) => eraseAt(prev, x, y, ERASER_RADIUS));
      setCurrent({
        color: "#000",
        width: ERASER_RADIUS * 2,
        points: [[x, y]],
      });
      return;
    }

    setCurrent({ color, width: thickness, points: [[x, y]] });
  }

  function handlePointerMove(e: React.PointerEvent) {
    if (!current) return;
    const [x, y] = getLocalPoint(e);

    if (tool === "eraser") {
      setStrokes((prev) => eraseAt(prev, x, y, ERASER_RADIUS));
    }

    setCurrent((c) => (c ? { ...c, points: [...c.points, [x, y]] } : c));
  }

  function handlePointerUp() {
    if (!current) return;
    if (tool !== "eraser") {
      setStrokes((prev) => [...prev, current]);
    }
    setCurrent(null);
  }

  function handleSave() {
    if (strokes.length === 0) {
      onDiscard();
      return;
    }

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    let maxW = 0;

    for (const s of strokes) {
      maxW = Math.max(maxW, s.width);
      for (const [x, y] of s.points) {
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      }
    }

    const pad = maxW;
    minX -= pad;
    minY -= pad;
    maxX += pad;
    maxY += pad;

    const w = Math.max(1, maxX - minX);
    const h = Math.max(1, maxY - minY);

    const normalized: Stroke[] = strokes.map((s) => ({
      ...s,
      points: s.points.map(
        ([x, y]) => [x - minX, y - minY] as [number, number],
      ),
    }));

    onSave({ x: minX, y: minY, w, h }, normalized);
  }

  const svgContent = (
    <div
      className="absolute inset-0 z-40"
      style={{ width, height }}
      onPointerDown={(e) => e.stopPropagation()}
    >
      <svg
        ref={svgRef}
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="absolute inset-0 touch-none bg-blue-500/[0.03]"
        style={{ cursor: tool === "eraser" ? "cell" : "crosshair" }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
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
        {current && tool !== "eraser" && (
          <path
            d={pointsToPath(current.points)}
            stroke={current.color}
            strokeWidth={current.width}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        )}
        {current && tool === "eraser" && current.points.length > 0 && (
          <circle
            cx={current.points[current.points.length - 1][0]}
            cy={current.points[current.points.length - 1][1]}
            r={ERASER_RADIUS}
            fill="rgb(15 23 42 / 0.08)"
            stroke="rgb(15 23 42 / 0.3)"
            strokeDasharray="3 3"
            pointerEvents="none"
          />
        )}
      </svg>
    </div>
  );

  const toolbar = (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[100] flex justify-center px-4">
      <div className="pointer-events-auto flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white/95 px-3 py-2 shadow-2xl shadow-slate-900/10 backdrop-blur-md">
        {/* Tools */}
        <div className="flex items-center gap-1">
          <ToolButton
            active={tool === "pencil"}
            label="Pencil"
            onClick={() => setTool("pencil")}
          >
            <IconPencil size={18} />
          </ToolButton>
          <ToolButton
            active={tool === "eraser"}
            label="Eraser"
            onClick={() => setTool("eraser")}
          >
            <EraserIcon />
          </ToolButton>
        </div>

        <Divider />

        {/* Colors */}
        <div className="flex items-center gap-1.5">
          {COLORS.map((c) => (
            <button
              key={c.value}
              type="button"
              aria-label={c.name}
              title={c.name}
              onClick={() => {
                setColor(c.value);
                setTool("pencil");
              }}
              className={`h-6 w-6 rounded-full ring-2 transition-transform ${
                color === c.value && tool === "pencil"
                  ? "ring-slate-900 scale-110"
                  : "ring-transparent hover:scale-105"
              }`}
              style={{ background: c.value }}
            />
          ))}
        </div>

        <Divider />

        {/* Width */}
        <div className="flex items-center gap-1.5">
          {WIDTHS.map((w) => (
            <button
              key={w}
              type="button"
              aria-label={`Width ${w}`}
              onClick={() => setThickness(w)}
              className={`grid h-8 w-8 place-items-center rounded-lg transition-colors ${
                thickness === w
                  ? "bg-slate-900 text-white"
                  : "text-slate-700 hover:bg-slate-100"
              }`}
            >
              <span
                className="rounded-full bg-current"
                style={{ width: w + 2, height: w + 2 }}
              />
            </button>
          ))}
        </div>

        <Divider />

        {/* Clear */}
        <IconButton
          label="Clear drawing"
          onClick={() => setStrokes([])}
          className="text-slate-600 hover:bg-slate-100"
        >
          <IconTrash size={18} />
        </IconButton>

        <Divider />

        {/* Discard / Save */}
        <Button variant="ghost" onClick={onDiscard}>
          <IconClose size={16} />
          Discard
        </Button>
        <Button variant="primary" onClick={handleSave}>
          <IconCheck size={16} />
          Save drawing
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {svgContent}
      {typeof document !== "undefined"
        ? createPortal(toolbar, document.body)
        : null}
    </>
  );
}

function ToolButton({
  active,
  label,
  onClick,
  children,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={`grid h-9 w-9 place-items-center rounded-lg transition-colors ${
        active
          ? "bg-slate-900 text-white"
          : "text-slate-700 hover:bg-slate-100"
      }`}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <span aria-hidden className="h-6 w-px bg-slate-200" />;
}

function EraserIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12.5 4.5l3 3-7 7H5.5l-1-1v-3l8-6z" />
      <path d="M8.5 8.5l3 3" />
    </svg>
  );
}

/* Reused inside the SVG renderer, kept here to avoid a circular import. */
function pointsToPath(points: [number, number][]): string {
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

/* Re-export so nothing that only imports DrawOverlay has to also import Drawing. */
export { DrawingSvg };