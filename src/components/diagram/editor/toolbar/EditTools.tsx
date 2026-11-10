import { SegmentButton } from "@/components/diagram/editor/toolbar/SegmentButton";
import { ToolbarDivider } from "@/components/diagram/editor/toolbar/ToolbarDivider";

type Props = {
  canUndo: boolean;
  canRedo: boolean;
  canDuplicate: boolean;
  canDelete: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onExport: () => void;
};

export function EditTools({
  canUndo,
  canRedo,
  canDuplicate,
  canDelete,
  onUndo,
  onRedo,
  onDuplicate,
  onDelete,
  onExport,
}: Props) {
  return (
    <>
      <SegmentButton label="Undo" title="Undo (Ctrl+Z)" disabled={!canUndo} onClick={onUndo} />
      <SegmentButton label="Redo" title="Redo (Ctrl+Y)" disabled={!canRedo} onClick={onRedo} />
      <ToolbarDivider />
      <SegmentButton label="Duplicate" title="Duplicate (Ctrl+D)" disabled={!canDuplicate} onClick={onDuplicate} />
      <SegmentButton label="Delete" title="Delete" disabled={!canDelete} onClick={onDelete} />
      <ToolbarDivider />
      <SegmentButton label="Export" title="Export SVG" onClick={onExport} />
    </>
  );
}
