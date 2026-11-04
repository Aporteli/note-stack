"use client";

import { createPortal } from "react-dom";
import { useFreehand } from "@/components/Board/hooks/useFreehand";
import type { Stroke } from "@/components/Board/types/board";
import { FreehandCanvas } from "@/components/Board/components/draw/FreehandCanvas";
import { FreehandToolbar } from "@/components/Board/components/draw/FreehandToolbar";
import { DrawingSvg } from "./Drawing";

type Props = {
  width: number;
  height: number;
  onSave: (
    bounds: { x: number; y: number; w: number; h: number },
    strokes: Stroke[],
  ) => void;
  onDiscard: () => void;
};

export function DrawOverlay({ width, height, onSave, onDiscard }: Props) {
  const draw = useFreehand(onSave, onDiscard);

  return (
    <>
      <FreehandCanvas
        width={width}
        height={height}
        svgRef={draw.svgRef}
        tool={draw.tool}
        strokes={draw.strokes}
        current={draw.current}
        onPointerDown={draw.handlePointerDown}
        onPointerMove={draw.handlePointerMove}
        onPointerUp={draw.handlePointerUp}
      />
      {typeof document !== "undefined"
        ? createPortal(
            <FreehandToolbar
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
              onDiscard={onDiscard}
              onSave={draw.handleSave}
            />,
            document.body,
          )
        : null}
    </>
  );
}

export { DrawingSvg };
