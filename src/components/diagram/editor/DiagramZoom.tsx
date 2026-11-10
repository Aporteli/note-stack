import { IconButton } from "@/components/ui/Button";

type Props = {
  zoom: number;
  onIn: () => void;
  onOut: () => void;
};

export function DiagramZoom({ zoom, onIn, onOut }: Props) {
  return (
    <div className="absolute bottom-3 right-3 flex items-center gap-1 rounded-md border border-line bg-paper px-1 py-1">
      <IconButton label="Zoom out" onClick={onOut}>
        −
      </IconButton>
      <span className="w-12 text-center text-meta text-ink-soft">{Math.round(zoom * 100)}%</span>
      <IconButton label="Zoom in" onClick={onIn}>
        +
      </IconButton>
    </div>
  );
}
