"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
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
  StrokeKind,
  StrokePoint,
} from "@/components/Board/types/board";
import { DOC_CANVAS_W, DOC_CANVAS_H } from "@/components/Board/types/board";

type Tab = "write" | "sketch";
type Tool = "type" | "pen" | "line" | "rect" | "ellipse" | "eraser";

const COLORS = [
  { name: "Ink", value: "rgb(15 23 42)" },
  { name: "Coral", value: "rgb(244 114 90)" },
  { name: "Lagoon", value: "rgb(56 168 194)" },
  { name: "Mint", value: "rgb(120 200 160)" },
  { name: "Orchid", value: "rgb(178 130 220)" },
];
const WIDTHS = [2, 4, 8, 16];
const ERASER_RADIUS = 14;
const HISTORY_LIMIT = 40;

type Props = {
  document: DocumentData | null;
  onSave: (payload: { title: string; text: string; strokes: Stroke[] }) => void;
  onClose: () => void;
};

function pointsToPath(points: StrokePoint[]): string {
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

function distToSegment(
  px: number,
  py: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
): number {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len2 = dx * dx + dy * dy;
  if (len2 === 0) return Math.hypot(px - x1, py - y1);
  const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / len2));
  return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
}

function hitsStroke(stroke: Stroke, x: number, y: number, radius: number): boolean {
  const pad = radius + stroke.width / 2;
  const kind = stroke.kind ?? "pen";
  const points = stroke.points;
  if (points.length === 0) return false;

  if (kind === "pen" || points.length < 2) {
    if (points.length === 1) {
      return Math.hypot(points[0][0] - x, points[0][1] - y) <= pad;
    }
    for (let i = 1; i < points.length; i++) {
      const [x1, y1] = points[i - 1];
      const [x2, y2] = points[i];
      if (distToSegment(x, y, x1, y1, x2, y2) <= pad) return true;
    }
    return false;
  }

  const [x1, y1] = points[0];
  const [x2, y2] = points[points.length - 1];

  if (kind === "line") return distToSegment(x, y, x1, y1, x2, y2) <= pad;

  if (kind === "rect") {
    const left = Math.min(x1, x2);
    const right = Math.max(x1, x2);
    const top = Math.min(y1, y2);
    const bottom = Math.max(y1, y2);
    const dx = Math.max(left - x, 0, x - right);
    const dy = Math.max(top - y, 0, y - bottom);
    const outside = Math.hypot(dx, dy);
    if (outside > 0) return outside <= pad;
    const inside = Math.min(x - left, right - x, y - top, bottom - y);
    return inside <= pad;
  }

  const cx = (x1 + x2) / 2;
  const cy = (y1 + y2) / 2;
  const rx = Math.max(Math.abs(x2 - x1) / 2, 0.001);
  const ry = Math.max(Math.abs(y2 - y1) / 2, 0.001);
  const nx = (x - cx) / rx;
  const ny = (y - cy) / ry;
  const len = Math.hypot(nx, ny);
  if (len === 0) return Math.min(rx, ry) <= pad;
  const ex = cx + (nx / len) * rx;
  const ey = cy + (ny / len) * ry;
  return Math.hypot(x - ex, y - ey) <= pad;
}

function eraseAt(strokes: Stroke[], x: number, y: number, radius: number): Stroke[] {
  return strokes.filter((stroke) => !hitsStroke(stroke, x, y, radius));
}

function constrainEnd(
  tool: Tool,
  start: StrokePoint,
  point: StrokePoint,
  shift: boolean,
): StrokePoint {
  if (!shift || tool === "pen" || tool === "eraser") return point;
  const [x0, y0] = start;
  const [x, y] = point;
  if (tool === "line") {
    return Math.abs(x - x0) >= Math.abs(y - y0) ? [x, y0] : [x0, y];
  }
  const size = Math.max(Math.abs(x - x0), Math.abs(y - y0));
  const sx = x === x0 ? 1 : Math.sign(x - x0);
  const sy = y === y0 ? 1 : Math.sign(y - y0);
  return [x0 + sx * size, y0 + sy * size];
}

function isDegenerate(stroke: Stroke): boolean {
  if ((stroke.kind ?? "pen") === "pen") return stroke.points.length === 0;
  if (stroke.points.length < 2) return true;
  const [x1, y1] = stroke.points[0];
  const [x2, y2] = stroke.points[stroke.points.length - 1];
  return x1 === x2 && y1 === y2;
}

function StrokeMark({ stroke }: { stroke: Stroke }) {
  const kind = stroke.kind ?? "pen";
  const common = {
    stroke: stroke.color,
    strokeWidth: stroke.width,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    fill: "none" as const,
  };

  if (kind !== "pen" && stroke.points.length >= 2) {
    const [x1, y1] = stroke.points[0];
    const [x2, y2] = stroke.points[stroke.points.length - 1];
    if (kind === "line") {
      return <line x1={x1} y1={y1} x2={x2} y2={y2} {...common} />;
    }
    if (kind === "rect") {
      return (
        <rect
          x={Math.min(x1, x2)}
          y={Math.min(y1, y2)}
          width={Math.abs(x2 - x1)}
          height={Math.abs(y2 - y1)}
          {...common}
        />
      );
    }
    return (
      <ellipse
        cx={(x1 + x2) / 2}
        cy={(y1 + y2) / 2}
        rx={Math.max(Math.abs(x2 - x1) / 2, 0.5)}
        ry={Math.max(Math.abs(y2 - y1) / 2, 0.5)}
        {...common}
      />
    );
  }

  return <path d={pointsToPath(stroke.points)} {...common} />;
}

/** Renamed `document` → `doc` in destructuring so the global `document`
 *  (used for keydown listeners and portal target) stays accessible. */
export function DocumentModal({ document: doc, onSave, onClose }: Props) {
  const [tab, setTab] = useState<Tab>("write");
  const [title, setTitle] = useState(doc?.title ?? "");
  const [text, setText] = useState(doc?.text ?? "");
  const [strokes, setStrokes] = useState<Stroke[]>(doc?.strokes ?? []);
  const [current, setCurrent] = useState<Stroke | null>(null);
  const [tool, setTool] = useState<Tool>("type");
  const [color, setColor] = useState(COLORS[0].value);
  const [thickness, setThickness] = useState(WIDTHS[1]);
  const [canUndo, setCanUndo] = useState(false);
  const [pageH, setPageH] = useState(DOC_CANVAS_H);
  const [toolsOpen, setToolsOpen] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);
  const textRef = useRef<HTMLTextAreaElement>(null);
  const draftRef = useRef<Stroke | null>(null);
  const toolRef = useRef<Tool>(tool);
  const strokesRef = useRef(strokes);
  const historyRef = useRef<Stroke[][]>([]);
  const eraseSnapshot = useRef<Stroke[] | null>(null);
  const didErase = useRef(false);
  const undoRef = useRef<() => void>(() => {});

  toolRef.current = tool;
  strokesRef.current = strokes;

  /* Sync internal state when the doc prop changes (opening a different doc). */
  useEffect(() => {
    setTitle(doc?.title ?? "");
    setText(doc?.text ?? "");
    setStrokes(doc?.strokes ?? []);
    setCurrent(null);
    draftRef.current = null;
    historyRef.current = [];
    setCanUndo(false);
    setTool("type");
    setPageH(DOC_CANVAS_H);
    setToolsOpen(false);
    setTab("write");
  }, [doc?.id]);

  function pushHistory(snapshot: Stroke[]) {
    historyRef.current.push(
      snapshot.map((stroke) => ({
        ...stroke,
        points: stroke.points.map((p) => [...p] as StrokePoint),
      })),
    );
    if (historyRef.current.length > HISTORY_LIMIT) historyRef.current.shift();
    setCanUndo(true);
  }

  function undo() {
    const prev = historyRef.current.pop();
    setCanUndo(historyRef.current.length > 0);
    if (prev) setStrokes(prev);
    draftRef.current = null;
    setCurrent(null);
  }

  undoRef.current = undo;

  /* Keep one sheet for writing and ink so a stroke stays put on the text. */
  useEffect(() => {
    let ink = DOC_CANVAS_H;
    const marks = current ? [...strokes, current] : strokes;
    for (const stroke of marks) {
      for (const [, y] of stroke.points) ink = Math.max(ink, Math.ceil(y + 48));
    }
    const fromText = Math.max(DOC_CANVAS_H, text.split("\n").length * 28 + 96);
    const next = Math.max(ink, fromText);
    setPageH((h) => (next > h ? next : h));
  }, [text, strokes, current]);

  useLayoutEffect(() => {
    if (tab !== "write") return;
    const el = textRef.current;
    if (!el) return;
    const prev = el.style.height;
    el.style.height = "0px";
    const needed = el.scrollHeight;
    el.style.height = prev;
    setPageH((h) => (needed > h ? needed : h));
  }, [text, tab]);

  useEffect(() => {
    if (!doc) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z" && !e.shiftKey) {
        const el = e.target as HTMLElement | null;
        const tag = el?.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA" || el?.isContentEditable) return;
        e.preventDefault();
        undoRef.current();
      }
    };
    window.document.addEventListener("keydown", onKey);
    return () => window.document.removeEventListener("keydown", onKey);
  }, [doc, onClose]);

  if (!doc || typeof window === "undefined") return null;

  function getLocalPoint(e: React.PointerEvent): StrokePoint {
    const svg = svgRef.current;
    if (!svg) return [0, 0];
    const rect = svg.getBoundingClientRect();
    const vb = svg.viewBox.baseVal;
    const scaleX = rect.width === 0 ? 1 : (vb.width || DOC_CANVAS_W) / rect.width;
    const scaleY = rect.height === 0 ? 1 : (vb.height || pageH) / rect.height;
    return [(e.clientX - rect.left) * scaleX, (e.clientY - rect.top) * scaleY];
  }

  function handlePointerDown(e: React.PointerEvent) {
    if (e.button !== 0) return;
    const active = toolRef.current;
    if (active === "type") return;
    e.preventDefault();
    (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
    const point = getLocalPoint(e);

    if (active === "eraser") {
      eraseSnapshot.current = strokesRef.current;
      didErase.current = false;
      setStrokes((prev) => {
        const next = eraseAt(prev, point[0], point[1], ERASER_RADIUS);
        if (next.length !== prev.length) didErase.current = true;
        return next;
      });
      const cursor: Stroke = {
        color: "#000",
        width: ERASER_RADIUS * 2,
        points: [point],
        kind: "pen",
      };
      draftRef.current = cursor;
      setCurrent(cursor);
      return;
    }

    const kind: StrokeKind = active;
    const draft: Stroke = {
      color,
      width: thickness,
      kind,
      points: kind === "pen" ? [point] : [point, point],
    };
    draftRef.current = draft;
    setCurrent(draft);
  }

  function handlePointerMove(e: React.PointerEvent) {
    const draft = draftRef.current;
    if (!draft) return;
    const point = getLocalPoint(e);
    const active = toolRef.current;

    if (active === "eraser") {
      setStrokes((prev) => {
        const next = eraseAt(prev, point[0], point[1], ERASER_RADIUS);
        if (next.length !== prev.length) didErase.current = true;
        return next;
      });
      const next: Stroke = { ...draft, points: [...draft.points, point] };
      draftRef.current = next;
      setCurrent(next);
      return;
    }

    if (active === "pen") {
      const next: Stroke = { ...draft, points: [...draft.points, point] };
      draftRef.current = next;
      setCurrent(next);
      return;
    }

    const end = constrainEnd(active, draft.points[0], point, e.shiftKey);
    const next: Stroke = { ...draft, points: [draft.points[0], end] };
    draftRef.current = next;
    setCurrent(next);
  }

  function handlePointerUp() {
    const draft = draftRef.current;
    draftRef.current = null;
    setCurrent(null);
    if (!draft) return;

    if (toolRef.current === "eraser") {
      if (didErase.current && eraseSnapshot.current) {
        pushHistory(eraseSnapshot.current);
      }
      eraseSnapshot.current = null;
      didErase.current = false;
      return;
    }

    if (isDegenerate(draft)) return;
    pushHistory(strokesRef.current);
    setStrokes((prev) => [...prev, draft]);
  }

  function handleSave() {
    onSave({ title: title.trim() || "Untitled", text, strokes });
  }

  function clearSketch() {
    if (strokes.length === 0) return;
    pushHistory(strokes);
    setStrokes([]);
    draftRef.current = null;
    setCurrent(null);
  }

  const drawing = tool !== "eraser";

  function chooseTool(next: Tool) {
    setTool(next);
    if (next !== "type") textRef.current?.blur();
  }

  function showWrite() {
    draftRef.current = null;
    setCurrent(null);
    setTab("write");
  }

  function showSketch() {
    draftRef.current = null;
    setCurrent(null);
    if (tool === "type") setTool("pen");
    setToolsOpen(true);
    setTab("sketch");
  }

  function toggleTools() {
    if (toolsOpen) {
      draftRef.current = null;
      setCurrent(null);
      if (tab === "write") setTool("type");
      setToolsOpen(false);
      return;
    }
    setToolsOpen(true);
  }

  const toolbar = (
    <DrawToolbar
      tool={tool}
      showType={tab === "write"}
      color={color}
      thickness={thickness}
      canUndo={canUndo}
      canClear={strokes.length > 0}
      drawing={drawing}
      onTool={chooseTool}
      onColor={(value) => {
        setColor(value);
        if (tool === "eraser") chooseTool("pen");
      }}
      onThickness={setThickness}
      onUndo={undo}
      onClear={clearSketch}
    />
  );

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
        <header className="flex items-center gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3">
          <IconDescription size={18} className="shrink-0 text-slate-500" />
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Untitled"
            className="min-w-0 flex-1 rounded-md border-0 bg-transparent px-1 text-lg font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500/40 focus:outline-none"
          />

          <div className="flex items-center gap-1 rounded-lg bg-white p-1 ring-1 ring-slate-200">
            <TabButton active={tab === "write"} onClick={showWrite}>
              <IconDescription size={14} /> Write
            </TabButton>
            <TabButton active={tab === "sketch"} onClick={showSketch}>
              <IconPencil size={14} /> Sketch
            </TabButton>
          </div>

          <IconButton label="Close" onClick={onClose}>
            <IconClose />
          </IconButton>
        </header>

        <div className="relative flex min-h-0 flex-1 flex-col">
          <div className="shrink-0 border-b border-slate-100 bg-white px-3 py-2">
            <div className="flex flex-col items-center gap-1.5">
              <button
                type="button"
                aria-expanded={toolsOpen}
                aria-label={toolsOpen ? "Hide drawing tools" : "Show drawing tools"}
                onClick={toggleTools}
                className="inline-flex h-7 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium text-slate-600 ring-1 ring-slate-200 transition-colors hover:bg-slate-50"
              >
                <IconPencil size={14} />
                Tools
                <ChevronIcon up={toolsOpen} />
              </button>
              {toolsOpen ? toolbar : null}
            </div>
            {toolsOpen ? (
              <p className="mt-1.5 text-center text-[11px] text-slate-400">
                {tab === "write"
                  ? "Draw on the text with the pen, line, or shapes. Choose Type to edit. Hold Shift to snap."
                  : "Hold Shift to snap a line, or to draw a square or circle."}
              </p>
            ) : null}
          </div>

          {tab === "write" ? (
            <div className="ns-scroll min-h-0 flex-1 overflow-auto bg-white">
              <div
                className="relative"
                style={{ width: DOC_CANVAS_W, height: pageH }}
              >
                <textarea
                  ref={textRef}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Start writing…"
                  readOnly={tool !== "type"}
                  className="absolute inset-0 h-full w-full resize-none border-0 bg-transparent p-6 text-[15px] leading-7 text-slate-800 focus:outline-none"
                  style={{ pointerEvents: tool === "type" ? "auto" : "none" }}
                />
                <InkSurface
                  svgRef={svgRef}
                  width={DOC_CANVAS_W}
                  height={pageH}
                  strokes={strokes}
                  current={current}
                  tool={tool}
                  className="absolute inset-0"
                  onPointerDown={handlePointerDown}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                />
              </div>
            </div>
          ) : (
            <div className="ns-scroll min-h-0 flex-1 overflow-auto bg-slate-50/60">
              <div className="px-4 py-4">
                <InkSurface
                  svgRef={svgRef}
                  width={DOC_CANVAS_W}
                  height={pageH}
                  strokes={strokes}
                  current={current}
                  tool={tool}
                  className="rounded-xl border border-slate-200 bg-white shadow-inner"
                  onPointerDown={handlePointerDown}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                />
              </div>
            </div>
          )}
        </div>

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

function InkSurface({
  svgRef,
  width,
  height,
  strokes,
  current,
  tool,
  className,
  onPointerDown,
  onPointerMove,
  onPointerUp,
}: {
  svgRef: React.RefObject<SVGSVGElement | null>;
  width: number;
  height: number;
  strokes: Stroke[];
  current: Stroke | null;
  tool: Tool;
  className?: string;
  onPointerDown: (e: React.PointerEvent) => void;
  onPointerMove: (e: React.PointerEvent) => void;
  onPointerUp: () => void;
}) {
  const drawing = tool !== "type";
  return (
    <svg
      ref={svgRef}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={`touch-none ${className ?? ""}`}
      style={{
        pointerEvents: drawing ? "auto" : "none",
        cursor: tool === "eraser" ? "cell" : drawing ? "crosshair" : "auto",
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      {strokes.map((stroke, i) => (
        <StrokeMark key={i} stroke={stroke} />
      ))}
      {current && tool !== "eraser" && <StrokeMark stroke={current} />}
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
  );
}

function DrawToolbar({
  tool,
  showType,
  color,
  thickness,
  canUndo,
  canClear,
  drawing,
  onTool,
  onColor,
  onThickness,
  onUndo,
  onClear,
}: {
  tool: Tool;
  showType: boolean;
  color: string;
  thickness: number;
  canUndo: boolean;
  canClear: boolean;
  drawing: boolean;
  onTool: (tool: Tool) => void;
  onColor: (value: string) => void;
  onThickness: (width: number) => void;
  onUndo: () => void;
  onClear: () => void;
}) {
  return (
    <div className="mx-auto flex w-fit max-w-full flex-wrap items-center justify-center gap-1.5">
      {showType && (
        <ToolToggle
          active={tool === "type"}
          label="Type"
          hint="Edit the text"
          onClick={() => onTool("type")}
        >
          <TypeIcon />
        </ToolToggle>
      )}
      <ToolToggle
        active={tool === "pen"}
        label="Pen"
        hint="Freehand pen"
        onClick={() => onTool("pen")}
      >
        <IconPencil size={16} />
      </ToolToggle>
      <ToolToggle
        active={tool === "line"}
        label="Straight line"
        hint="Straight line. Hold Shift to lock horizontal or vertical."
        onClick={() => onTool("line")}
      >
        <LineIcon />
      </ToolToggle>
      <ToolToggle
        active={tool === "rect"}
        label="Rectangle"
        hint="Rectangle. Hold Shift for a square."
        onClick={() => onTool("rect")}
      >
        <RectIcon />
      </ToolToggle>
      <ToolToggle
        active={tool === "ellipse"}
        label="Ellipse"
        hint="Ellipse. Hold Shift for a circle."
        onClick={() => onTool("ellipse")}
      >
        <EllipseIcon />
      </ToolToggle>
      <ToolToggle
        active={tool === "eraser"}
        label="Eraser"
        hint="Erase a stroke"
        onClick={() => onTool("eraser")}
      >
        <EraserIcon />
      </ToolToggle>

      <span className="mx-0.5 h-5 w-px bg-slate-200" />

      {COLORS.map((c) => (
        <button
          key={c.value}
          type="button"
          aria-label={c.name}
          title={c.name}
          onClick={() => onColor(c.value)}
          className={`h-5 w-5 rounded-full ring-2 transition-transform ${
            color === c.value && drawing
              ? "scale-110 ring-slate-900"
              : "ring-transparent hover:scale-105"
          }`}
          style={{ background: c.value }}
        />
      ))}

      <span className="mx-0.5 h-5 w-px bg-slate-200" />

      {WIDTHS.map((w) => (
        <button
          key={w}
          type="button"
          aria-label={`Width ${w}`}
          title={`Width ${w}`}
          onClick={() => onThickness(w)}
          className={`grid h-7 w-7 place-items-center rounded-md transition-colors ${
            thickness === w
              ? "bg-slate-900 text-white"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <span
            className="rounded-full bg-current"
            style={{ width: Math.min(w + 2, 14), height: Math.min(w + 2, 14) }}
          />
        </button>
      ))}

      <span className="mx-0.5 h-5 w-px bg-slate-200" />

      <ToolToggle
        active={false}
        label="Undo"
        hint="Undo (Ctrl+Z)"
        disabled={!canUndo}
        onClick={onUndo}
      >
        <UndoIcon />
      </ToolToggle>
      <button
        type="button"
        aria-label="Clear sketch"
        title="Clear sketch"
        onClick={onClear}
        disabled={!canClear}
        className="grid h-7 w-7 place-items-center rounded-md text-slate-600 hover:bg-slate-100 disabled:opacity-40"
      >
        <IconTrash size={16} />
      </button>
    </div>
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
        active ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
      }`}
    >
      {children}
    </button>
  );
}

function ToolToggle({
  active,
  label,
  hint,
  onClick,
  disabled,
  children,
}: {
  active: boolean;
  label: string;
  hint?: string;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={active}
      title={hint ?? label}
      onClick={onClick}
      disabled={disabled}
      className={`grid h-7 w-7 place-items-center rounded-md transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
        active ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
      }`}
    >
      {children}
    </button>
  );
}

function ToolGlyph({ children }: { children: React.ReactNode }) {
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
      aria-hidden
    >
      {children}
    </svg>
  );
}

function ChevronIcon({ up }: { up: boolean }) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d={up ? "M5 12.5L10 7.5l5 5" : "M5 7.5L10 12.5l5-5"} />
    </svg>
  );
}

function TypeIcon() {
  return (
    <ToolGlyph>
      <path d="M5.5 5h9" />
      <path d="M10 5v10" />
      <path d="M8 15h4" />
    </ToolGlyph>
  );
}

function LineIcon() {
  return (
    <ToolGlyph>
      <path d="M4.5 15.5L15.5 4.5" />
    </ToolGlyph>
  );
}

function RectIcon() {
  return (
    <ToolGlyph>
      <rect x="4.25" y="4.75" width="11.5" height="10.5" rx="1" />
    </ToolGlyph>
  );
}

function EllipseIcon() {
  return (
    <ToolGlyph>
      <ellipse cx="10" cy="10" rx="6" ry="4.25" />
    </ToolGlyph>
  );
}

function EraserIcon() {
  return (
    <ToolGlyph>
      <path d="M12.5 4.5l3 3-7 7H5.5l-1-1v-3l8-6z" />
      <path d="M8.5 8.5l3 3" />
    </ToolGlyph>
  );
}

function UndoIcon() {
  return (
    <ToolGlyph>
      <path d="M7.5 7.5L4.5 10l3 2.5" />
      <path d="M5 10h6.25a3.75 3.75 0 1 1 0 7.5H9" />
    </ToolGlyph>
  );
}
