import { SegmentButton } from "@/components/diagram/editor/toolbar/SegmentButton";
import { SHAPE_TOOLS } from "@/components/diagram/editor/toolbar/shapeCatalog";
import type { Tool } from "@/components/diagram/types";

export function ShapeTools({ tool, onTool }: { tool: Tool; onTool: (tool: Tool) => void }) {
  return (
    <>
      {SHAPE_TOOLS.map((item) => (
        <SegmentButton
          key={item.id}
          label={item.label}
          title={item.title}
          active={tool === item.id}
          onClick={() => onTool(item.id)}
        />
      ))}
    </>
  );
}
