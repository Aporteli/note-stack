"use client";

import { useRef, useState, type Dispatch, type PointerEvent as ReactPointerEvent, type SetStateAction } from "react";
import type { DraftLink, Gesture } from "@/components/diagram/gesture";
import { bringManyToFront } from "@/components/diagram/lib/bringManyToFront";
import { emptySelection } from "@/components/diagram/lib/emptySelection";
import { moveShapes } from "@/components/diagram/lib/moveShapes";
import { nearestSide } from "@/components/diagram/lib/nearestSide";
import { newConnector } from "@/components/diagram/lib/newConnector";
import { newShape } from "@/components/diagram/lib/newShape";
import { replaceShape } from "@/components/diagram/lib/replaceShape";
import { resizedBox } from "@/components/diagram/lib/resizedBox";
import { selectConnector } from "@/components/diagram/lib/selectConnector";
import { selectShape } from "@/components/diagram/lib/selectShape";
import { shapeTarget } from "@/components/diagram/lib/shapeTarget";
import { worldPoint } from "@/components/diagram/lib/worldPoint";
import type { Corner, DiagramDocument, DiagramShape, Selection, Side, Tool, View } from "@/components/diagram/types";

type Args = {
  tool: Tool;
  view: View;
  document: DiagramDocument;
  selected: Selection;
  onDocument: (next: DiagramDocument) => void;
  onArm: () => void;
  onSettle: () => void;
  setView: Dispatch<SetStateAction<View>>;
  setSelected: Dispatch<SetStateAction<Selection>>;
  setEditing: Dispatch<SetStateAction<string | null>>;
};

export function useCanvasPointer({
  tool,
  view,
  document,
  selected,
  onDocument,
  onArm,
  onSettle,
  setView,
  setSelected,
  setEditing,
}: Args) {
  const svgRef = useRef<SVGSVGElement>(null);
  const gesture = useRef<Gesture | null>(null);
  const viewRef = useRef(view);
  const docRef = useRef(document);
  const selectedRef = useRef(selected);
  viewRef.current = view;
  docRef.current = document;
  selectedRef.current = selected;
  const [draft, setDraft] = useState<DraftLink | null>(null);

  function commit(next: DiagramDocument) {
    docRef.current = next;
    onDocument(next);
  }

  function pointOf(event: { clientX: number; clientY: number }) {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    return worldPoint(event.clientX, event.clientY, svg.getBoundingClientRect(), viewRef.current);
  }

  function capture(event: ReactPointerEvent) {
    svgRef.current?.setPointerCapture(event.pointerId);
  }

  function onShapePointerDown(event: ReactPointerEvent, id: string) {
    if (event.button !== 0 || tool !== "select") return;
    event.stopPropagation();
    event.preventDefault();
    const shape = docRef.current.shapes.find((item) => item.id === id);
    if (!shape) return;
    capture(event);
    const point = pointOf(event);
    const current = selectedRef.current;
    const already = !current.connectorId && current.shapeIds.includes(id);
    if (event.shiftKey) {
      setSelected(selectShape(id, true, current));
      setEditing(null);
      return;
    }
    const ids = already ? current.shapeIds : [id];
    if (!already) setSelected(selectShape(id, false, current));
    setEditing(null);
    onArm();
    const origins = docRef.current.shapes.filter((item) => ids.includes(item.id));
    const raised = bringManyToFront(docRef.current.shapes, ids);
    if (raised !== docRef.current.shapes) commit({ ...docRef.current, shapes: raised });
    gesture.current = { type: "move", pointerId: event.pointerId, origins, startX: point.x, startY: point.y };
  }

  function onPortPointerDown(event: ReactPointerEvent, id: string, side: Side) {
    if (event.button !== 0) return;
    event.stopPropagation();
    event.preventDefault();
    capture(event);
    const point = pointOf(event);
    onArm();
    setSelected(selectShape(id, false, selectedRef.current));
    setEditing(null);
    gesture.current = { type: "connect", pointerId: event.pointerId, fromId: id, fromSide: side };
    setDraft({ fromId: id, fromSide: side, x: point.x, y: point.y });
  }

  function onHandlePointerDown(event: ReactPointerEvent, id: string, corner: Corner) {
    if (event.button !== 0) return;
    event.stopPropagation();
    event.preventDefault();
    const shape = docRef.current.shapes.find((item) => item.id === id);
    if (!shape) return;
    capture(event);
    onArm();
    gesture.current = {
      type: "resize",
      pointerId: event.pointerId,
      id,
      corner,
      box: { x: shape.x, y: shape.y, w: shape.w, h: shape.h },
    };
  }

  function onConnectorPointerDown(event: ReactPointerEvent, id: string) {
    if (event.button !== 0 || tool !== "select") return;
    event.stopPropagation();
    event.preventDefault();
    setSelected(selectConnector(id));
    setEditing(null);
  }

  function onPointerDown(event: ReactPointerEvent<SVGSVGElement>) {
    if (event.button !== 0) return;
    const point = pointOf(event);
    capture(event);
    if (tool !== "select") {
      onArm();
      gesture.current = {
        type: "place",
        pointerId: event.pointerId,
        kind: tool,
        x: point.x,
        y: point.y,
        sx: event.clientX,
        sy: event.clientY,
        ox: viewRef.current.x,
        oy: viewRef.current.y,
        panning: false,
      };
      return;
    }
    setSelected(emptySelection());
    setEditing(null);
    gesture.current = {
      type: "pan",
      pointerId: event.pointerId,
      sx: event.clientX,
      sy: event.clientY,
      ox: viewRef.current.x,
      oy: viewRef.current.y,
    };
  }

  function onPointerMove(event: ReactPointerEvent<SVGSVGElement>) {
    const current = gesture.current;
    if (!current || current.pointerId !== event.pointerId) return;
    const point = pointOf(event);
    if (current.type === "pan") {
      setView((next) => ({
        ...next,
        x: current.ox + (event.clientX - current.sx),
        y: current.oy + (event.clientY - current.sy),
      }));
      return;
    }
    if (current.type === "place") {
      if (Math.hypot(event.clientX - current.sx, event.clientY - current.sy) > 4) current.panning = true;
      if (!current.panning) return;
      setView((next) => ({
        ...next,
        x: current.ox + (event.clientX - current.sx),
        y: current.oy + (event.clientY - current.sy),
      }));
      return;
    }
    if (current.type === "move") {
      const moved = moveShapes(docRef.current.shapes, current.origins, point.x - current.startX, point.y - current.startY);
      if (moved === docRef.current.shapes) return;
      commit({ ...docRef.current, shapes: moved });
      return;
    }
    if (current.type === "resize") {
      const box = resizedBox(current.box, current.corner, point.x, point.y);
      const shape = docRef.current.shapes.find((item) => item.id === current.id);
      if (!shape) return;
      if (shape.x === box.x && shape.y === box.y && shape.w === box.w && shape.h === box.h) return;
      const next: DiagramShape = { ...shape, ...box };
      commit({ ...docRef.current, shapes: replaceShape(docRef.current.shapes, next) });
      return;
    }
    setDraft({ fromId: current.fromId, fromSide: current.fromSide, x: point.x, y: point.y });
  }

  function finishConnect(current: Extract<Gesture, { type: "connect" }>, event: ReactPointerEvent) {
    setDraft(null);
    const hit = shapeTarget(globalThis.document.elementFromPoint(event.clientX, event.clientY));
    if (!hit || hit.id === current.fromId) return;
    const target = docRef.current.shapes.find((shape) => shape.id === hit.id);
    if (!target) return;
    const point = pointOf(event);
    const connector = newConnector(
      current.fromId,
      current.fromSide,
      hit.id,
      hit.side ?? nearestSide(target, point.x, point.y),
    );
    if (!connector) return;
    commit({ ...docRef.current, connectors: [...docRef.current.connectors, connector] });
    setSelected(selectConnector(connector.id));
  }

  function finishPlace(current: Extract<Gesture, { type: "place" }>) {
    if (current.panning) return false;
    const shape = newShape(current.kind, current.x, current.y);
    commit({ ...docRef.current, shapes: [...docRef.current.shapes, shape] });
    setSelected(selectShape(shape.id, false, emptySelection()));
    if (shape.kind === "text") {
      setEditing(shape.id);
      return true;
    }
    return false;
  }

  function onPointerUp(event: ReactPointerEvent<SVGSVGElement>) {
    const current = gesture.current;
    gesture.current = null;
    if (!current || current.pointerId !== event.pointerId) return;
    let holdHistory = false;
    if (current.type === "connect") finishConnect(current, event);
    if (current.type === "place") holdHistory = finishPlace(current);
    if (!holdHistory) onSettle();
  }

  function onPointerCancel() {
    gesture.current = null;
    setDraft(null);
    onSettle();
  }

  return {
    svgRef,
    draft,
    onShapePointerDown,
    onPortPointerDown,
    onHandlePointerDown,
    onConnectorPointerDown,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerCancel,
  };
}
