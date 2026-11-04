"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { DOC_CANVAS_H, DOC_CANVAS_W } from "@/components/Board/types/board";
import type { DocumentData, Stroke, StrokeKind, StrokePoint } from "@/components/Board/types/board";
import {
  COLORS,
  ERASER_RADIUS,
  HISTORY_LIMIT,
  WIDTHS,
  cloneStrokes,
  constrainEnd,
  eraseAt,
  isDegenerate,
  type Tab,
  type Tool,
} from "@/components/Board/lib/sketch";

export function useDocumentSketch(doc: DocumentData | null, onClose: () => void) {
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
    historyRef.current.push(cloneStrokes(snapshot));
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

  useEffect(() => {
    let ink = DOC_CANVAS_H;
    const marks = current ? [...strokes, current] : strokes;
    for (const stroke of marks) {
      for (const [, y] of stroke.points) ink = Math.max(ink, Math.ceil(y + 48));
    }
    const fromText = Math.max(DOC_CANVAS_H, text.split("\n").length * 28 + 96);
    const next = Math.max(ink, fromText);
    setPageH((height) => (next > height ? next : height));
  }, [text, strokes, current]);

  useLayoutEffect(() => {
    if (tab !== "write") return;
    const el = textRef.current;
    if (!el) return;
    const prev = el.style.height;
    el.style.height = "0px";
    const needed = el.scrollHeight;
    el.style.height = prev;
    setPageH((height) => (needed > height ? needed : height));
  }, [text, tab]);

  useEffect(() => {
    if (!doc) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "z" && !event.shiftKey) {
        const el = event.target as HTMLElement | null;
        const tag = el?.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA" || el?.isContentEditable) return;
        event.preventDefault();
        undoRef.current();
      }
    };
    window.document.addEventListener("keydown", onKey);
    return () => window.document.removeEventListener("keydown", onKey);
  }, [doc, onClose]);

  function getLocalPoint(event: ReactPointerEvent): StrokePoint {
    const svg = svgRef.current;
    if (!svg) return [0, 0];
    const rect = svg.getBoundingClientRect();
    const vb = svg.viewBox.baseVal;
    const scaleX = rect.width === 0 ? 1 : (vb.width || DOC_CANVAS_W) / rect.width;
    const scaleY = rect.height === 0 ? 1 : (vb.height || pageH) / rect.height;
    return [(event.clientX - rect.left) * scaleX, (event.clientY - rect.top) * scaleY];
  }

  function handlePointerDown(event: ReactPointerEvent) {
    if (event.button !== 0) return;
    const active = toolRef.current;
    if (active === "type") return;
    event.preventDefault();
    (event.currentTarget as Element).setPointerCapture?.(event.pointerId);
    const point = getLocalPoint(event);

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

  function handlePointerMove(event: ReactPointerEvent) {
    const draft = draftRef.current;
    if (!draft) return;
    const point = getLocalPoint(event);
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

    const end = constrainEnd(active, draft.points[0], point, event.shiftKey);
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

  function clearSketch() {
    if (strokes.length === 0) return;
    pushHistory(strokes);
    setStrokes([]);
    draftRef.current = null;
    setCurrent(null);
  }

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

  return {
    tab,
    title,
    setTitle,
    text,
    setText,
    strokes,
    current,
    tool,
    color,
    setColor,
    thickness,
    setThickness,
    canUndo,
    pageH,
    toolsOpen,
    textRef,
    svgRef,
    drawing: tool !== "eraser",
    undo,
    clearSketch,
    chooseTool,
    showWrite,
    showSketch,
    toggleTools,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
  };
}
