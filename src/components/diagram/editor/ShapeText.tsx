import type { KeyboardEvent, TextareaHTMLAttributes, HTMLAttributes } from "react";
import type { DiagramShape } from "@/components/diagram/types";

type Props = {
  shape: DiagramShape;
  color: string;
  editing: boolean;
  bold: boolean;
  onText: (id: string, text: string) => void;
  onClose: () => void;
};

export function ShapeText({ shape, color, editing, bold, onText, onClose }: Props) {
  const pad = 8;
  if (!editing && !shape.text) return null;
  return (
    <foreignObject
      x={shape.x + pad}
      y={shape.y + pad}
      width={Math.max(1, shape.w - pad * 2)}
      height={Math.max(1, shape.h - pad * 2)}
      style={{ pointerEvents: editing ? "auto" : "none" }}
    >
      {editing ? (
        <textarea
          autoFocus
          value={shape.text}
          aria-label="Shape text"
          onChange={(event) => onText(shape.id, event.target.value)}
          onBlur={onClose}
          onPointerDown={(event) => event.stopPropagation()}
          onKeyDown={(event: KeyboardEvent<HTMLTextAreaElement>) => {
            event.stopPropagation();
            if (event.key === "Escape" || (event.key === "Enter" && !event.shiftKey)) {
              event.preventDefault();
              event.currentTarget.blur();
            }
          }}
          {...({ xmlns: "http://www.w3.org/1999/xhtml" } as TextareaHTMLAttributes<HTMLTextAreaElement>)}
          className={`h-full w-full resize-none bg-transparent text-center text-sm leading-tight outline-none ${bold ? "font-bold" : ""}`}
          style={{ color }}
        />
      ) : (
        <div
          {...({ xmlns: "http://www.w3.org/1999/xhtml" } as HTMLAttributes<HTMLDivElement>)}
          className={`flex h-full w-full items-center justify-center overflow-hidden text-center text-sm leading-tight break-words ${bold ? "font-bold" : ""}`}
          style={{ color }}
        >
          {shape.text}
        </div>
      )}
    </foreignObject>
  );
}
