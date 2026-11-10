import { useState, type PointerEvent as ReactPointerEvent } from "react";
import { FILL_COLOR, STROKE_COLOR } from "@/components/diagram/colors";
import { ShapeHandles } from "@/components/diagram/editor/ShapeHandles";
import { ShapeOutline } from "@/components/diagram/editor/ShapeOutline";
import { ShapePorts } from "@/components/diagram/editor/ShapePorts";
import { ShapeText } from "@/components/diagram/editor/ShapeText";
import type { Corner, DiagramShape, Side } from "@/components/diagram/types";

type Props = {
  shape: DiagramShape;
  zoom: number;
  selected: boolean;
  primary: boolean;
  editing: boolean;
  active: boolean;
  onPointerDown: (event: ReactPointerEvent, id: string) => void;
  onPortPointerDown: (event: ReactPointerEvent<SVGCircleElement>, id: string, side: Side) => void;
  onHandlePointerDown: (event: ReactPointerEvent<SVGRectElement>, id: string, corner: Corner) => void;
  onEdit: (id: string) => void;
  onText: (id: string, text: string) => void;
  onCloseEdit: () => void;
};

export function ShapeNode({
  shape,
  zoom,
  selected,
  primary,
  editing,
  active,
  onPointerDown,
  onPortPointerDown,
  onHandlePointerDown,
  onEdit,
  onText,
  onCloseEdit,
}: Props) {
  const [hover, setHover] = useState(false);
  const stroke = STROKE_COLOR[shape.stroke];
  const showPorts = active && (primary || hover) && !editing;
  return (
    <g
      data-shape-id={shape.id}
      onPointerEnter={() => setHover(true)}
      onPointerLeave={() => setHover(false)}
      onDoubleClick={(event) => {
        event.stopPropagation();
        onEdit(shape.id);
      }}
    >
      <g onPointerDown={(event) => onPointerDown(event, shape.id)}>
        <ShapeOutline
          shape={shape}
          fill={shape.kind === "text" ? "transparent" : FILL_COLOR[shape.fill]}
          stroke={selected ? "var(--color-orchid-700)" : stroke}
          selected={selected}
        />
      </g>
      <ShapeText
        shape={shape}
        color={stroke}
        editing={editing}
        bold={shape.bold}
        onText={onText}
        onClose={onCloseEdit}
      />
      {showPorts ? (
        <ShapePorts shape={shape} zoom={zoom} onPointerDown={(event, side) => onPortPointerDown(event, shape.id, side)} />
      ) : null}
      {active && primary && !editing ? (
        <ShapeHandles
          shape={shape}
          zoom={zoom}
          onPointerDown={(event, corner) => onHandlePointerDown(event, shape.id, corner)}
        />
      ) : null}
    </g>
  );
}
