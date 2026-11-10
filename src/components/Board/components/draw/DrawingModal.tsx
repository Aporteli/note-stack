"use client";

import { useState } from "react";
import { updateDrawing } from "@/app/drawings/updateDrawing";
import { DrawingSheet } from "@/components/Board/components/draw/DrawingSheet";
import { FreehandToolbar } from "@/components/Board/components/draw/FreehandToolbar";
import { useFreehand } from "@/components/Board/hooks/useFreehand";
import { usePaneSize } from "@/components/Board/hooks/usePaneSize";
import { encloseStrokes } from "@/components/Board/lib/draw/encloseStrokes";
import { fullWidthBox } from "@/components/Board/lib/draw/fullWidthBox";
import { isTempId } from "@/components/Board/lib/items";
import type { DrawingData, Stroke } from "@/components/Board/types/board";
import { IconClose } from "@/components/ui/Icons";

type Props = {
  drawing: DrawingData | null;
  boardId: string;
  onSave: (id: string, strokes: Stroke[], box: { x: number; y: number; w: number; h: number }) => void;
  onClose: () => void;
};

export function DrawingModal({ drawing, boardId, onSave, onClose }: Props) {
  if (!drawing) return null;
  return (
    <DrawingEditor drawing={drawing} boardId={boardId} onSave={onSave} onClose={onClose} />
  );
}

function DrawingEditor({
  drawing,
  boardId,
  onSave,
  onClose,
}: {
  drawing: DrawingData;
  boardId: string;
  onSave: (id: string, strokes: Stroke[], box: { x: number; y: number; w: number; h: number }) => void;
  onClose: () => void;
}) {
  const draw = useFreehand(() => {}, onClose, drawing.strokes);
  const pane = usePaneSize();
  const view = fullWidthBox(drawing.w, drawing.h, pane.size.w, pane.size.h);
  const [saving, setSaving] = useState(false);

  async function save() {
    if (saving) return;
    const fitted = encloseStrokes(drawing, draw.strokes);
    onSave(drawing.id, fitted.strokes, fitted);
    setSaving(true);
    try {
      if (!isTempId(drawing.id)) {
        await updateDrawing(boardId, drawing.id, JSON.stringify(fitted.strokes), fitted);
      }
      onClose();
    } catch (err) {
      setSaving(false);
      console.error("Failed to save drawing", err);
    }
  }

  return (
    <div className="absolute inset-0 z-[80] flex flex-col bg-[#f6f5f2]">
      <header className="flex h-12 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4">
        <p className="text-sm font-semibold text-slate-900">Drawing</p>
        <button
          type="button"
          aria-label="Close drawing"
          onClick={onClose}
          className="grid h-8 w-8 place-items-center text-slate-600 hover:bg-slate-100"
        >
          <IconClose size={16} />
        </button>
      </header>
      <div ref={pane.ref} className="relative min-h-0 flex-1 bg-white" onPointerDown={(event) => event.stopPropagation()}>
        <DrawingSheet
          x={view.x}
          y={view.y}
          w={view.w}
          h={view.h}
          svgRef={draw.svgRef}
          tool={draw.tool}
          strokes={draw.strokes}
          current={draw.current}
          onPointerDown={draw.handlePointerDown}
          onPointerMove={draw.handlePointerMove}
          onPointerUp={draw.handlePointerUp}
        />
      </div>
      <FreehandToolbar
        pinned
        tool={draw.tool}
        color={draw.color}
        thickness={draw.thickness}
        onTool={draw.setTool}
        onColor={(value) => {
          draw.setColor(value);
          draw.setTool("pencil");
        }}
        onThickness={draw.setThickness}
        onClear={() => draw.setStrokes([])}
        onDiscard={onClose}
        onSave={() => void save()}
      />
    </div>
  );
}
