"use client";

import { useEffect, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import type { Stroke } from "@/components/Board/types/board";
import {
  FREEHAND_COLORS,
  FREEHAND_ERASER_RADIUS,
  FREEHAND_WIDTHS,
  eraseFreehand,
  fitFreehand,
  type FreehandTool,
} from "@/components/Board/lib/freehand";

type Save = (
  bounds: { x: number; y: number; w: number; h: number },
  strokes: Stroke[],
) => void;

export function useFreehand(
  onSave: Save,
  onDiscard: () => void,
  initial: Stroke[] = [],
) {
  const [strokes, setStrokes] = useState<Stroke[]>(initial);
  const [current, setCurrent] = useState<Stroke | null>(null);
  const [tool, setTool] = useState<FreehandTool>("pencil");
  const [color, setColor] = useState(FREEHAND_COLORS[0].value);
  const [thickness, setThickness] = useState(FREEHAND_WIDTHS[1]);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onDiscard();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onDiscard]);

  function getLocalPoint(event: ReactPointerEvent): [number, number] {
    const svg = svgRef.current;
    if (!svg) return [0, 0];
    const matrix = svg.getScreenCTM();
    if (!matrix) {
      const rect = svg.getBoundingClientRect();
      return [event.clientX - rect.left, event.clientY - rect.top];
    }
    const point = new DOMPoint(event.clientX, event.clientY).matrixTransform(matrix.inverse());
    return [point.x, point.y];
  }

  function handlePointerDown(event: ReactPointerEvent) {
    event.preventDefault();
    (event.currentTarget as Element).setPointerCapture?.(event.pointerId);

    const [x, y] = getLocalPoint(event);

    if (tool === "eraser") {
      setStrokes((prev) => eraseFreehand(prev, x, y, FREEHAND_ERASER_RADIUS));
      setCurrent({
        color: "#000",
        width: FREEHAND_ERASER_RADIUS * 2,
        points: [[x, y]],
      });
      return;
    }

    setCurrent({ color, width: thickness, points: [[x, y]] });
  }

  function handlePointerMove(event: ReactPointerEvent) {
    if (!current) return;
    const [x, y] = getLocalPoint(event);

    if (tool === "eraser") {
      setStrokes((prev) => eraseFreehand(prev, x, y, FREEHAND_ERASER_RADIUS));
    }

    setCurrent((stroke) => (stroke ? { ...stroke, points: [...stroke.points, [x, y]] } : stroke));
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
    const fitted = fitFreehand(strokes);
    onSave(fitted.bounds, fitted.strokes);
  }

  return {
    strokes,
    setStrokes,
    current,
    tool,
    setTool,
    color,
    setColor,
    thickness,
    setThickness,
    svgRef,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handleSave,
  };
}
