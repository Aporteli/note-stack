import { useLayoutEffect, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent, ReactNode, UIEvent } from "react";

/** Text inset of a new document. Gray ruler bands mark this margin. */
export const DOC_PAGE_MARGIN = 24;

const RULER = 28;
const MIN_TEXT = 80;
/** CSS pixels are 96 per inch. */
const PX_PER_CM = 96 / 2.54;
const MARGIN_FILL = "#e8eaed";
const PAPER_FILL = "#ffffff";
const TICK = "#64748b";
const LABEL = "#475569";
const EDGE = "#cbd5e1";
const MARKER = "#1e293b";

export type RulerDrag = "margin-left" | "margin-right" | "first" | "hanging" | "both" | "right";

export type RulerValues = {
  marginLeft: number;
  marginRight: number;
  left: number;
  first: number;
  right: number;
};

type Kind = "major" | "half" | "minor";
type Mark = { cm: number; pos: number; kind: Kind };
type Phase = "start" | "move" | "end";

function clamp(value: number, min: number, max: number) {
  if (max < min) return min;
  return Math.min(max, Math.max(min, value));
}

export function applyRulerDelta(
  origin: RulerValues,
  kind: RulerDrag,
  dx: number,
  width: number,
): RulerValues {
  const next = { ...origin };
  if (kind === "margin-left") {
    next.marginLeft = clamp(origin.marginLeft + dx, 0, width - origin.marginRight - MIN_TEXT);
  } else if (kind === "margin-right") {
    next.marginRight = clamp(origin.marginRight - dx, 0, width - origin.marginLeft - MIN_TEXT);
  } else if (kind === "both" || kind === "hanging") {
    const room = width - origin.marginLeft - origin.marginRight - origin.right - MIN_TEXT;
    next.left = clamp(origin.left + dx, 0, Math.max(0, room));
    if (kind === "hanging") next.first = origin.first - (next.left - origin.left);
  } else if (kind === "first") {
    const max = width - origin.marginLeft - origin.marginRight - origin.left - origin.right - 24;
    next.first = clamp(origin.first + dx, -origin.left, Math.max(-origin.left, max));
  } else {
    const room = width - origin.marginLeft - origin.marginRight - origin.left - MIN_TEXT;
    next.right = clamp(origin.right - dx, 0, Math.max(0, room));
  }
  return {
    marginLeft: Math.round(next.marginLeft),
    marginRight: Math.round(next.marginRight),
    left: Math.round(next.left),
    first: Math.round(next.first),
    right: Math.round(next.right),
  };
}

function marksAlong(length: number): Mark[] {
  const steps = Math.floor((length / PX_PER_CM) * 4 + 1e-4);
  const marks: Mark[] = [];
  for (let step = 0; step <= steps; step += 1) {
    const cm = step / 4;
    const pos = Math.round(cm * PX_PER_CM);
    if (pos > length) break;
    marks.push({
      cm,
      pos,
      kind: step % 4 === 0 ? "major" : step % 2 === 0 ? "half" : "minor",
    });
  }
  return marks;
}

function tickLength(kind: Kind) {
  if (kind === "major") return 9;
  if (kind === "half") return 6;
  return 3;
}

function cmLabel(px: number) {
  return `${(px / PX_PER_CM).toFixed(1)} cm`;
}

function HorizontalTrack({
  width,
  marginLeft,
  marginRight,
}: {
  width: number;
  marginLeft: number;
  marginRight: number;
}) {
  const content = Math.max(0, width - marginLeft - marginRight);
  const leftMarks = marksAlong(marginLeft);
  const bodyMarks = marksAlong(content + marginRight);
  const rightEdge = width - marginRight;

  return (
    <svg width={width} height={RULER} className="block" aria-hidden>
      <rect x={0} y={0} width={marginLeft} height={RULER} fill={MARGIN_FILL} />
      <rect x={marginLeft} y={0} width={content} height={RULER} fill={PAPER_FILL} />
      <rect x={rightEdge} y={0} width={marginRight} height={RULER} fill={MARGIN_FILL} />
      <g stroke={TICK} strokeWidth={1} shapeRendering="crispEdges">
        {leftMarks.map((mark) => {
          if (mark.pos === 0) return null;
          const x = marginLeft - mark.pos;
          const length = tickLength(mark.kind);
          return <line key={`l${mark.pos}`} x1={x} y1={RULER} x2={x} y2={RULER - length} />;
        })}
        {bodyMarks.map((mark) => {
          const x = marginLeft + mark.pos;
          if (x > width) return null;
          const length = tickLength(mark.kind);
          return <line key={`b${mark.pos}`} x1={x} y1={RULER} x2={x} y2={RULER - length} />;
        })}
      </g>
      <g
        fill={LABEL}
        fontSize={10}
        textAnchor="middle"
        style={{ fontVariantNumeric: "tabular-nums" }}
      >
        {bodyMarks.map((mark) => {
          if (mark.kind !== "major" || mark.cm === 0) return null;
          const x = marginLeft + mark.pos;
          if (x < marginLeft + 14 || x > rightEdge - 14) return null;
          return (
            <text key={`n${mark.cm}`} x={x} y={12}>
              {mark.cm}
            </text>
          );
        })}
      </g>
      <line x1={marginLeft} y1={0} x2={marginLeft} y2={RULER} stroke={EDGE} />
      <line x1={rightEdge} y1={0} x2={rightEdge} y2={RULER} stroke={EDGE} />
    </svg>
  );
}

function VerticalRuler({ height, margin }: { height: number; margin: number }) {
  const content = Math.max(0, height - margin * 2);
  const topMarks = marksAlong(margin);
  const bodyMarks = marksAlong(content + margin);
  const bottomEdge = height - margin;

  return (
    <svg width={RULER} height={height} className="block" aria-hidden>
      <rect x={0} y={0} width={RULER} height={margin} fill={MARGIN_FILL} />
      <rect x={0} y={margin} width={RULER} height={content} fill={PAPER_FILL} />
      <rect x={0} y={bottomEdge} width={RULER} height={margin} fill={MARGIN_FILL} />
      <g stroke={TICK} strokeWidth={1} shapeRendering="crispEdges">
        {topMarks.map((mark) => {
          if (mark.pos === 0) return null;
          const y = margin - mark.pos;
          const length = tickLength(mark.kind);
          return <line key={`t${mark.pos}`} x1={RULER} y1={y} x2={RULER - length} y2={y} />;
        })}
        {bodyMarks.map((mark) => {
          const y = margin + mark.pos;
          if (y > height) return null;
          const length = tickLength(mark.kind);
          return <line key={`b${mark.pos}`} x1={RULER} y1={y} x2={RULER - length} y2={y} />;
        })}
      </g>
      <g
        fill={LABEL}
        fontSize={10}
        textAnchor="end"
        dominantBaseline="middle"
        style={{ fontVariantNumeric: "tabular-nums" }}
      >
        {bodyMarks.map((mark) => {
          if (mark.kind !== "major" || mark.cm === 0) return null;
          const y = margin + mark.pos;
          if (y < margin + 12 || y > bottomEdge - 12) return null;
          return (
            <text key={`n${mark.cm}`} x={RULER - 11} y={y}>
              {mark.cm}
            </text>
          );
        })}
      </g>
      <line x1={0} y1={margin} x2={RULER} y2={margin} stroke={EDGE} />
      <line x1={0} y1={bottomEdge} x2={RULER} y2={bottomEdge} stroke={EDGE} />
    </svg>
  );
}

function Marker({
  x,
  top,
  label,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  children,
}: {
  x: number;
  top: number;
  label: string;
  onPointerDown: (event: ReactPointerEvent<HTMLButtonElement>) => void;
  onPointerMove: (event: ReactPointerEvent<HTMLButtonElement>) => void;
  onPointerUp: (event: ReactPointerEvent<HTMLButtonElement>) => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      className="absolute z-30 flex cursor-col-resize touch-none items-center justify-center p-0"
      style={{ left: x, top, transform: "translateX(-50%)" }}
    >
      {children}
    </button>
  );
}

export function DocumentRuler({
  height,
  values,
  onDrag,
  children,
}: {
  height: number;
  values: RulerValues;
  onDrag: (kind: RulerDrag, dx: number, width: number, phase: Phase) => void;
  children: (width: number) => ReactNode;
}) {
  const pageRef = useRef<HTMLDivElement>(null);
  const verticalRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ kind: RulerDrag; x: number; dx: number } | null>(null);
  const [width, setWidth] = useState(0);
  const [dragKind, setDragKind] = useState<RulerDrag | null>(null);

  useLayoutEffect(() => {
    const el = pageRef.current;
    if (!el) return;
    const measure = () => setWidth(el.clientWidth);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  function onScroll(event: UIEvent<HTMLDivElement>) {
    if (verticalRef.current) {
      verticalRef.current.style.transform = `translateY(${-event.currentTarget.scrollTop}px)`;
    }
  }

  function pointerDown(kind: RulerDrag, event: ReactPointerEvent<HTMLElement>) {
    if (width <= 0) return;
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = { kind, x: event.clientX, dx: 0 };
    setDragKind(kind);
    onDrag(kind, 0, width, "start");
  }

  function pointerMove(event: ReactPointerEvent<HTMLElement>) {
    const drag = dragRef.current;
    if (!drag || width <= 0) return;
    drag.dx = event.clientX - drag.x;
    onDrag(drag.kind, drag.dx, width, "move");
  }

  function pointerUp() {
    const drag = dragRef.current;
    if (!drag) return;
    dragRef.current = null;
    setDragKind(null);
    onDrag(drag.kind, drag.dx, width, "end");
  }

  const leftX = values.marginLeft + values.left;
  const firstX = leftX + values.first;
  const rightX = Math.max(leftX + MIN_TEXT, width - values.marginRight - values.right);
  const tipX =
    dragKind === "margin-right" || dragKind === "right"
      ? rightX
      : dragKind === "first"
        ? firstX
        : dragKind === "margin-left"
          ? values.marginLeft
          : leftX;
  const tip =
    dragKind === "margin-left"
      ? cmLabel(values.marginLeft)
      : dragKind === "margin-right"
        ? cmLabel(values.marginRight)
        : dragKind === "right"
          ? cmLabel(Math.max(0, width - values.marginLeft - values.marginRight - values.right))
          : dragKind === "first"
            ? cmLabel(values.left + values.first)
            : dragKind
              ? cmLabel(values.left)
              : null;

  const bind = (kind: RulerDrag) => ({
    onPointerDown: (event: ReactPointerEvent<HTMLButtonElement>) => pointerDown(kind, event),
    onPointerMove: pointerMove,
    onPointerUp: pointerUp,
  });

  return (
    <div className="flex min-h-0 flex-1 select-none">
      <div className="flex shrink-0 flex-col border-r border-slate-200 bg-white" style={{ width: RULER }}>
        <div
          title="Centimeters"
          aria-hidden
          className="grid shrink-0 place-items-center border-b border-slate-200 bg-[#e8eaed] text-[9px] font-semibold tracking-wide text-slate-500"
          style={{ height: RULER }}
        >
          cm
        </div>
        <div className="relative min-h-0 flex-1 overflow-hidden">
          <div ref={verticalRef} style={{ height }}>
            <VerticalRuler height={height} margin={DOC_PAGE_MARGIN} />
          </div>
        </div>
      </div>

      <div
        ref={pageRef}
        className="ns-scroll min-h-0 min-w-0 flex-1 overflow-auto"
        onScroll={onScroll}
      >
        <div className="sticky top-0 z-20 w-full border-b border-slate-200 bg-white" style={{ height: RULER }}>
          {width > 0 ? (
            <HorizontalTrack
              width={width}
              marginLeft={values.marginLeft}
              marginRight={values.marginRight}
            />
          ) : null}
          {width > 0 ? (
            <>
              <div
                title="Left margin — drag to set the text width"
                aria-label="Left margin"
                onPointerDown={(event) => pointerDown("margin-left", event)}
                onPointerMove={pointerMove}
                onPointerUp={pointerUp}
                onPointerCancel={pointerUp}
                className="absolute inset-y-0 z-20 cursor-col-resize touch-none"
                style={{ left: 0, width: Math.max(values.marginLeft, 12) }}
              />
              <div
                title="Right margin — drag to set the text width"
                aria-label="Right margin"
                onPointerDown={(event) => pointerDown("margin-right", event)}
                onPointerMove={pointerMove}
                onPointerUp={pointerUp}
                onPointerCancel={pointerUp}
                className="absolute inset-y-0 z-20 cursor-col-resize touch-none"
                style={{
                  left: width - Math.max(values.marginRight, 12),
                  width: Math.max(values.marginRight, 12),
                }}
              />
              <Marker x={firstX} top={0} label="First line indent" {...bind("first")}>
                <svg width="12" height="9" viewBox="0 0 12 9" aria-hidden>
                  <polygon points="0,0 12,0 6,9" fill={MARKER} />
                </svg>
              </Marker>
              <Marker x={leftX} top={10} label="Hanging indent" {...bind("hanging")}>
                <svg width="12" height="8" viewBox="0 0 12 8" aria-hidden>
                  <polygon points="0,8 12,8 6,0" fill={MARKER} />
                </svg>
              </Marker>
              <Marker x={leftX} top={19} label="Left indent" {...bind("both")}>
                <span className="block h-2 w-2.5 bg-slate-800" />
              </Marker>
              <Marker x={rightX} top={16} label="Right indent" {...bind("right")}>
                <svg width="12" height="8" viewBox="0 0 12 8" aria-hidden>
                  <polygon points="0,8 12,8 6,0" fill={MARKER} />
                </svg>
              </Marker>
              {tip ? (
                <div
                  className="pointer-events-none absolute top-0.5 z-40 -translate-x-1/2 bg-slate-900 px-1 py-px text-[10px] font-medium text-white"
                  style={{ left: tipX }}
                >
                  {tip}
                </div>
              ) : null}
            </>
          ) : null}
        </div>
        <div className="relative w-full" style={{ height }}>
          {width > 0 ? children(width) : null}
        </div>
      </div>
    </div>
  );
}
