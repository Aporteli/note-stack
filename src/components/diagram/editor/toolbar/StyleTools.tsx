import { FILL_SWATCHES, STROKE_SWATCHES } from "@/components/diagram/colors";
import { ColorSwatches } from "@/components/diagram/editor/ColorSwatches";
import { OptionGroup } from "@/components/diagram/editor/OptionGroup";
import { SegmentButton } from "@/components/diagram/editor/toolbar/SegmentButton";
import { ToolbarDivider } from "@/components/diagram/editor/toolbar/ToolbarDivider";
import { LINE_WEIGHTS, type DiagramShape, type LineWeight, type ShapeFill, type ShapeStroke } from "@/components/diagram/types";

const WEIGHTS = LINE_WEIGHTS.map((id) => ({
  id,
  label: id === "thin" ? "Thin" : id === "thick" ? "Thick" : "Medium",
}));

type Props = {
  shape: DiagramShape;
  onFill: (fill: ShapeFill) => void;
  onStroke: (stroke: ShapeStroke) => void;
  onDashed: (dashed: boolean) => void;
  onWeight: (weight: LineWeight) => void;
  onBold: () => void;
};

export function StyleTools({ shape, onFill, onStroke, onDashed, onWeight, onBold }: Props) {
  return (
    <>
      {shape.kind === "text" ? null : (
        <ColorSwatches label="Fill" swatches={FILL_SWATCHES} active={shape.fill} onPick={onFill} />
      )}
      {shape.kind === "text" ? null : <ToolbarDivider />}
      <ColorSwatches label="Stroke" swatches={STROKE_SWATCHES} active={shape.stroke} onPick={onStroke} />
      <ToolbarDivider />
      <OptionGroup
        label=""
        value={shape.dashed ? "dashed" : "solid"}
        options={[
          { id: "solid", label: "Solid" },
          { id: "dashed", label: "Dashed" },
        ]}
        onChange={(id) => onDashed(id === "dashed")}
      />
      <ToolbarDivider />
      <OptionGroup label="" value={shape.weight} options={WEIGHTS} onChange={onWeight} />
      <ToolbarDivider />
      <SegmentButton label="B" title="Bold (Ctrl+B)" active={shape.bold} onClick={onBold}>
        <span className="font-bold">B</span>
      </SegmentButton>
    </>
  );
}
