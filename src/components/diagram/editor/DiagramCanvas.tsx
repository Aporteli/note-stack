"use client";

import type { Dispatch, SetStateAction } from "react";
import { ConnectorPath } from "@/components/diagram/editor/ConnectorPath";
import { DiagramGrid } from "@/components/diagram/editor/DiagramGrid";
import { DiagramMarkers } from "@/components/diagram/editor/DiagramMarkers";
import { DraftConnector } from "@/components/diagram/editor/DraftConnector";
import { ShapeNode } from "@/components/diagram/editor/ShapeNode";
import { useCanvasPointer } from "@/components/diagram/editor/useCanvasPointer";
import { emptySelection } from "@/components/diagram/lib/emptySelection";
import { selectShape } from "@/components/diagram/lib/selectShape";
import type { DiagramDocument, Selection, Tool, View } from "@/components/diagram/types";

type Props = {
  document: DiagramDocument;
  tool: Tool;
  view: View;
  selected: Selection;
  editing: string | null;
  onDocument: (next: DiagramDocument) => void;
  onArm: () => void;
  onSettle: () => void;
  setView: Dispatch<SetStateAction<View>>;
  setSelected: Dispatch<SetStateAction<Selection>>;
  setEditing: Dispatch<SetStateAction<string | null>>;
  onText: (id: string, text: string) => void;
};

export function DiagramCanvas({
  document,
  tool,
  view,
  selected,
  editing,
  onDocument,
  onArm,
  onSettle,
  setView,
  setSelected,
  setEditing,
  onText,
}: Props) {
  const primaryId = selected.shapeIds[selected.shapeIds.length - 1] ?? null;
  const pointer = useCanvasPointer({
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
  });

  return (
    <svg
      ref={pointer.svgRef}
      role="application"
      aria-label="Diagram canvas"
      className={`h-full w-full touch-none ${tool === "select" ? "cursor-default" : "cursor-crosshair"}`}
      onPointerDown={pointer.onPointerDown}
      onPointerMove={pointer.onPointerMove}
      onPointerUp={pointer.onPointerUp}
      onPointerCancel={pointer.onPointerCancel}
    >
      <DiagramMarkers />
      <g transform={`translate(${view.x} ${view.y}) scale(${view.zoom})`}>
        <DiagramGrid />
        {document.connectors.map((connector) => (
          <ConnectorPath
            key={connector.id}
            connector={connector}
            shapes={document.shapes}
            selected={selected.connectorId === connector.id}
            onPointerDown={pointer.onConnectorPointerDown}
          />
        ))}
        {document.shapes.map((shape) => (
          <ShapeNode
            key={shape.id}
            shape={shape}
            zoom={view.zoom}
            selected={selected.shapeIds.includes(shape.id)}
            primary={shape.id === primaryId}
            editing={editing === shape.id}
            active={tool === "select"}
            onPointerDown={pointer.onShapePointerDown}
            onPortPointerDown={pointer.onPortPointerDown}
            onHandlePointerDown={pointer.onHandlePointerDown}
            onEdit={(id) => {
              if (tool !== "select") return;
              onArm();
              setSelected(selectShape(id, false, emptySelection()));
              setEditing(id);
            }}
            onText={onText}
            onCloseEdit={() => {
              setEditing(null);
              onSettle();
            }}
          />
        ))}
        {pointer.draft ? <DraftConnector draft={pointer.draft} shapes={document.shapes} /> : null}
      </g>
    </svg>
  );
}
