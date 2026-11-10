import { FileCard } from "@/components/Board/components/file/FileCard";
import type { FileData } from "@/components/Board/types/boardFile";

type Drag = { dx: number; dy: number; id: string };

type Props = {
  files: FileData[];
  selectedItemKeys: Set<string>;
  fileDrag: Drag | null;
  onStartDrag: (id: string, clientX: number, clientY: number) => void;
};

export function FilesLayer({ files, selectedItemKeys, fileDrag, onStartDrag }: Props) {
  return files.map((file) => (
    <FileCard
      key={file.key}
      file={file}
      selected={selectedItemKeys.has(`file:${file.id}`)}
      dragOffset={fileDrag?.id === file.id ? { dx: fileDrag.dx, dy: fileDrag.dy } : null}
      onStartDrag={onStartDrag}
    />
  ));
}
