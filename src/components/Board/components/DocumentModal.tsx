"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Button, IconButton } from "@/components/ui/Button";
import {
  IconCheck,
  IconClose,
  IconDescription,
  IconPencil,
  IconTrash,
} from "@/components/ui/Icons";
import type {
  DocumentData,
  Stroke,
} from "@/components/Board/types/board";
import { DOC_CANVAS_W, DOC_CANVAS_H } from "@/components/Board/types/board";

type Tab = "write" | "sketch";
type Tool = "pencil" | "eraser";

const COLORS = [
  "rgb(15 23 42)",
  "rgb(244 114 90)",
  "rgb(56 168 194)",
  "rgb(120 200 160)",
  "rgb(178 130 220)",
];
const WIDTHS = [2, 4, 8, 16];
const ERASER_RADIUS = 14;

type Props = {
  document: DocumentData | null;
  onSave: (payload: { title: string; text: string; strokes: Stroke[] }) => void;
  onClose: () => void;
};

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

/** Renamed `document` → `doc` in destructuring so the global `document`
 *  (used for keydown listeners and portal target) stays accessible. */
export function DocumentModal({ document: doc, onSave, onClose }: Props) {
  const [tab, setTab] = useState<Tab>("write");
  const [title, setTitle] = useState(doc?.title ?? "");
  const [text, setText] = useState(doc?.text ?? "");
  const [strokes, setStrokes] = useState<Stroke[]>(doc?.strokes ?? []);
  const [current, setCurrent] = useState<Stroke | null>(null);
  const [tool, setTool] = useState<Tool>("pencil");
  const [color, setColor] = useState(COLORS[0]);
  const [thickness, setThickness] = useState(WIDTHS[1]);
  const svgRef = useRef<SVGSVGElement>(null);

  /* Sync internal state when the doc prop changes (opening a different doc). */
  useEffect(() => {
    setTitle(doc?.title ?? "");
    setText(doc?.text ?? "");
    setStrokes(doc?.strokes ?? []);
    setTab("write");
  }, [doc?.id]);

  useEffect(() => {
    if (!doc) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    // `document` here is the real DOM object, because we renamed the prop.
    window.document.addEventListener("keydown", onKey);
    return () => window.document.removeEventListener("keydown", onKey);
  }, [doc, onClose]);

  if (!doc || typeof window === "undefined") return null;

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
      setCurrent({ color: "#000", width: ERASER_RADIUS * 2, points: [[x, y]] });
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
    if (tool !== "eraser") setStrokes((prev) => [...prev, current]);
    setCurrent(null);
  }

  function handleSave() {
    onSave({ title: title.trim() || "Untitled", text, strokes });
  }

  return createPortal(
    <div className="fixed inset-0 z-[180] flex items-center justify-center p-2 sm:p-4">
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title || "Document"}
        className="relative flex h-[92vh] w-[96vw] max-w-[1400px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
      >
        {/* Header */}
        <header className="flex items-center gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3">
          <IconDescription size={18} className="shrink-0 text-slate-500" />
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Untitled"
            className="min-w-0 flex-1 rounded-md border-0 bg-transparent px-1 text-lg font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500/40 focus:outline-none"
          />

          {/* Tabs */}
          <div className="flex items-center gap-1 rounded-lg bg-white p-1 ring-1 ring-slate-200">
            <TabButton active={tab === "write"} onClick={() => setTab("write")}>
              <IconDescription size={14} /> Write
            </TabButton>
            <TabButton
              active={tab === "sketch"}
              onClick={() => setTab("sketch")}
            >
              <IconPencil size={14} /> Sketch
            </TabButton>
          </div>

          <IconButton label="Close" onClick={onClose}>
            <IconClose />
          </IconButton>
        </header>

        {/* Body */}
        <div className="relative flex min-h-0 flex-1 flex-col">
          {tab === "write" ? (
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Start writing…"
              className="ns-scroll h-full w-full flex-1 resize-none border-0 bg-white p-6 text-[15px] leading-7 text-slate-800 focus:outline-none"
            />
          ) : (
            <div className="ns-scroll relative flex-1 overflow-auto bg-slate-50/60">
              {/* Toolbar */}
              <div className="sticky top-3 z-10 mx-auto mb-3 flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white/95 px-2 py-1.5 shadow-lg backdrop-blur">
                <ToolToggle
                  active={tool === "pencil"}
                  label="Pencil"
                  onClick={() => setTool("pencil")}
                >
                  <IconPencil size={16} />
                </ToolToggle>
                <ToolToggle
                  active={tool === "eraser"}
                  label="Eraser"
                  onClick={() => setTool("eraser")}
                >
                  <EraserIcon />
                </ToolToggle>

                <span className="h-5 w-px bg-slate-200" />

                {COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    aria-label="Color"
                    onClick={() => {
                      setColor(c);
                      setTool("pencil");
                    }}
                    className={`h-5 w-5 rounded-full ring-2 transition-transform ${
                      color === c && tool === "pencil"
                        ? "ring-slate-900 scale-110"
                        : "ring-transparent hover:scale-105"
                    }`}
                    style={{ background: c }}
                  />
                ))}

                <span className="h-5 w-px bg-slate-200" />

                {WIDTHS.map((w) => (
                  <button
                    key={w}
                    type="button"
                    aria-label={`Width ${w}`}
                    onClick={() => setThickness(w)}
                    className={`grid h-7 w-7 place-items-center rounded-md transition-colors ${
                      thickness === w
                        ? "bg-slate-900 text-white"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <span
                      className="rounded-full bg-current"
                      style={{ width: w + 2, height: w + 2 }}
                    />
                  </button>
                ))}

                <span className="h-5 w-px bg-slate-200" />

                <button
                  type="button"
                  aria-label="Clear sketch"
                  onClick={() => setStrokes([])}
                  className="grid h-7 w-7 place-items-center rounded-md text-slate-600 hover:bg-slate-100"
                >
                  <IconTrash size={16} />
                </button>
              </div>

              {/* Drawing surface */}
              <div className="px-4 pb-6">
                <svg
                  ref={svgRef}
                  width={DOC_CANVAS_W}
                  height={DOC_CANVAS_H}
                  viewBox={`0 0 ${DOC_CANVAS_W} ${DOC_CANVAS_H}`}
                  className="touch-none rounded-xl border border-slate-200 bg-white shadow-inner"
                  style={{
                    cursor: tool === "eraser" ? "cell" : "crosshair",
                  }}
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
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="flex justify-end gap-2 border-t border-slate-200 bg-slate-50 px-5 py-3">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave}>
            <IconCheck size={16} />
            Save document
          </Button>
        </footer>
      </div>
    </div>,
    document.body,
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
        active
          ? "bg-slate-900 text-white"
          : "text-slate-600 hover:bg-slate-100"
      }`}
    >
      {children}
    </button>
  );
}

function ToolToggle({
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
      className={`grid h-7 w-7 place-items-center rounded-md transition-colors ${
        active
          ? "bg-slate-900 text-white"
          : "text-slate-600 hover:bg-slate-100"
      }`}
    >
      {children}
    </button>
  );
}

function EraserIcon() {
  return (
    <svg
      width="16"
      height="16"
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