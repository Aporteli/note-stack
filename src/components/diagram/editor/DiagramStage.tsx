"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { DiagramCanvas } from "@/components/diagram/editor/DiagramCanvas";
import { DiagramToolbar } from "@/components/diagram/editor/DiagramToolbar";
import { DiagramZoom } from "@/components/diagram/editor/DiagramZoom";
import { useDiagramHistory } from "@/components/diagram/editor/useDiagramHistory";
import { useDiagramKeys } from "@/components/diagram/editor/useDiagramKeys";
import { useDiagramShortcuts } from "@/components/diagram/editor/useDiagramShortcuts";
import { DIAGRAM_LIMITS } from "@/components/diagram/limits";
import { alignShapes } from "@/components/diagram/lib/alignShapes";
import { bindWheel } from "@/components/diagram/lib/bindWheel";
import { bringManyToFront } from "@/components/diagram/lib/bringManyToFront";
import { copyShapes, pastedShapes } from "@/components/diagram/lib/shapeClipboard";
import { diagramSvg } from "@/components/diagram/lib/diagramSvg";
import { downloadFile } from "@/components/diagram/lib/downloadFile";
import { duplicateShapes } from "@/components/diagram/lib/duplicateShapes";
import { emptySelection } from "@/components/diagram/lib/emptySelection";
import { fileStem } from "@/components/diagram/lib/fileStem";
import { patchConnector } from "@/components/diagram/lib/patchConnector";
import { patchShape } from "@/components/diagram/lib/patchShape";
import { patchShapes } from "@/components/diagram/lib/patchShapes";
import { primaryShape } from "@/components/diagram/lib/primaryShape";
import { removeConnector } from "@/components/diagram/lib/removeConnector";
import { removeShapes } from "@/components/diagram/lib/removeShapes";
import { selectAll } from "@/components/diagram/lib/selectAll";
import { sendToBack } from "@/components/diagram/lib/sendToBack";
import { wheelView } from "@/components/diagram/lib/wheelView";
import { zoomAround } from "@/components/diagram/lib/zoomAround";
import type { AlignMode, ArrowKind, DiagramDocument, LineWeight, Route, Selection, ShapeFill, ShapeStroke, Tool, View } from "@/components/diagram/types";

type Props = {
  title: string;
  document: DiagramDocument;
  onDocument: (next: DiagramDocument) => void;
};

export function DiagramStage({ title, document, onDocument }: Props) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [view, setView] = useState<View>({ x: 80, y: 48, zoom: 1 });
  const [tool, setTool] = useState<Tool>("select");
  const [selected, setSelected] = useState<Selection>(emptySelection());
  const [editing, setEditing] = useState<string | null>(null);
  const history = useDiagramHistory(document, onDocument);
  const shape = primaryShape(document, selected);
  const connector = document.connectors.find((item) => item.id === selected.connectorId) ?? null;

  useEffect(() => {
    const element = viewportRef.current;
    if (!element) return;
    return bindWheel(element, (event) => {
      event.preventDefault();
      const rect = element.getBoundingClientRect();
      setView((current) => wheelView(current, event, rect));
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelected(emptySelection());
    setEditing(null);
  }, []);

  const removeSelected = useCallback(() => {
    if (selected.connectorId) {
      history.commit({ ...document, connectors: removeConnector(document.connectors, selected.connectorId) });
      clearSelection();
      return true;
    }
    if (!selected.shapeIds.length) return false;
    history.commit(removeShapes(document, selected.shapeIds));
    clearSelection();
    return true;
  }, [clearSelection, document, history, selected.connectorId, selected.shapeIds]);

  const leaveTool = useCallback(() => {
    setTool("select");
    setEditing(null);
    history.settle();
  }, [history]);

  useDiagramKeys(removeSelected, leaveTool);

  const duplicate = useCallback(() => {
    if (!selected.shapeIds.length) return;
    const next = duplicateShapes(document.shapes, selected.shapeIds);
    if (!next.ids.length) return;
    history.commit({ ...document, shapes: next.shapes });
    setSelected({ shapeIds: next.ids, connectorId: null });
  }, [document, history, selected.shapeIds]);

  const copy = useCallback(() => {
    const shapes = document.shapes.filter((item) => selected.shapeIds.includes(item.id));
    if (shapes.length) copyShapes(shapes);
  }, [document.shapes, selected.shapeIds]);

  const paste = useCallback(() => {
    const copies = pastedShapes();
    if (!copies.length) return;
    history.commit({ ...document, shapes: [...document.shapes, ...copies] });
    setSelected({ shapeIds: copies.map((item) => item.id), connectorId: null });
  }, [document, history]);

  const front = useCallback(() => {
    const shapes = bringManyToFront(document.shapes, selected.shapeIds);
    if (shapes !== document.shapes) history.commit({ ...document, shapes });
  }, [document, history, selected.shapeIds]);

  const back = useCallback(() => {
    const shapes = sendToBack(document.shapes, selected.shapeIds);
    if (shapes !== document.shapes) history.commit({ ...document, shapes });
  }, [document, history, selected.shapeIds]);

  const align = useCallback(
    (mode: AlignMode) => {
      history.commit({ ...document, shapes: alignShapes(document.shapes, selected.shapeIds, mode) });
    },
    [document, history, selected.shapeIds],
  );

  const paintShapes = useCallback(
    (patch: Partial<{ fill: ShapeFill; stroke: ShapeStroke; dashed: boolean; weight: LineWeight; bold: boolean }>) => {
      if (!selected.shapeIds.length) return;
      history.commit({ ...document, shapes: patchShapes(document.shapes, selected.shapeIds, patch) });
    },
    [document, history, selected.shapeIds],
  );

  const paintConnector = useCallback(
    (patch: Partial<{ route: Route; arrow: ArrowKind; dashed: boolean; weight: LineWeight }>) => {
      if (!selected.connectorId) return;
      history.commit({
        ...document,
        connectors: patchConnector(document.connectors, selected.connectorId, patch),
      });
    },
    [document, history, selected.connectorId],
  );

  const undo = useCallback(() => {
    history.undo();
    clearSelection();
  }, [clearSelection, history]);

  const redo = useCallback(() => {
    history.redo();
    clearSelection();
  }, [clearSelection, history]);

  useDiagramShortcuts({
    onUndo: undo,
    onRedo: redo,
    onDuplicate: duplicate,
    onCopy: copy,
    onPaste: paste,
    onBold: () => {
      if (!shape) return;
      paintShapes({ bold: !shape.bold });
    },
    onSelectAll: () => setSelected(selectAll(document.shapes)),
  });

  function changeZoom(factor: number) {
    const rect = viewportRef.current?.getBoundingClientRect();
    if (!rect) return;
    setView((current) => zoomAround(current, current.zoom * factor, rect));
  }

  return (
    <>
      <DiagramToolbar
        tool={tool}
        shape={shape}
        shapeCount={selected.shapeIds.length}
        connector={connector}
        canUndo={history.canUndo}
        canRedo={history.canRedo}
        onTool={(next) => {
          setTool(next);
          setEditing(null);
          history.settle();
        }}
        onFill={(fill) => paintShapes({ fill })}
        onStroke={(stroke) => paintShapes({ stroke })}
        onDashed={(dashed) => (connector ? paintConnector({ dashed }) : paintShapes({ dashed }))}
        onWeight={(weight) => (connector ? paintConnector({ weight }) : paintShapes({ weight }))}
        onBold={() => {
          if (shape) paintShapes({ bold: !shape.bold });
        }}
        onRoute={(route) => paintConnector({ route })}
        onArrow={(arrow) => paintConnector({ arrow })}
        onAlign={align}
        onDuplicate={duplicate}
        onFront={front}
        onBack={back}
        onDelete={removeSelected}
        onUndo={undo}
        onRedo={redo}
        onExport={() => downloadFile(`${fileStem(title)}.svg`, diagramSvg(document), "image/svg+xml")}
      />
      <div ref={viewportRef} className="relative min-h-0 flex-1">
        <DiagramCanvas
          document={document}
          tool={tool}
          view={view}
          selected={selected}
          editing={editing}
          onDocument={history.commit}
          onArm={history.arm}
          onSettle={history.settle}
          setView={setView}
          setSelected={setSelected}
          setEditing={setEditing}
          onText={(id, text) => {
            history.commit({
              ...document,
              shapes: patchShape(document.shapes, id, { text: text.slice(0, DIAGRAM_LIMITS.text) }),
            });
          }}
        />
        <DiagramZoom zoom={view.zoom} onIn={() => changeZoom(1.1)} onOut={() => changeZoom(1 / 1.1)} />
      </div>
    </>
  );
}
