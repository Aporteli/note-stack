import { SegmentButton } from "@/components/diagram/editor/toolbar/SegmentButton";
import { ToolbarDivider } from "@/components/diagram/editor/toolbar/ToolbarDivider";
import { ALIGNS, type AlignMode } from "@/components/diagram/types";

const ALIGN_LABEL: Record<AlignMode, string> = {
  left: "Left",
  center: "Center",
  right: "Right",
  top: "Top",
  middle: "Middle",
  bottom: "Bottom",
};

type Props = {
  shapeCount: number;
  onFront: () => void;
  onBack: () => void;
  onAlign: (mode: AlignMode) => void;
};

export function ArrangeTools({ shapeCount, onFront, onBack, onAlign }: Props) {
  return (
    <>
      <SegmentButton label="Front" title="Bring to front" onClick={onFront} />
      <SegmentButton label="Back" title="Send to back" onClick={onBack} />
      {shapeCount > 1 ? (
        <>
          <ToolbarDivider />
          {ALIGNS.map((mode) => (
            <SegmentButton key={mode} label={ALIGN_LABEL[mode]} title={`Align ${ALIGN_LABEL[mode].toLowerCase()}`} onClick={() => onAlign(mode)} />
          ))}
        </>
      ) : null}
    </>
  );
}
