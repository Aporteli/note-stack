import type { Dispatch, SetStateAction } from "react";
import { uploadBoardFile } from "@/components/Board/lib/file/uploadBoardFile";
import { tempId } from "@/components/Board/lib/note/tempId";
import { fileKind } from "@/lib/files/fileKind";
import type { FileData } from "@/components/Board/types/boardFile";

type Args = {
  boardId: string;
  files: File[];
  x: number;
  y: number;
  setFiles: Dispatch<SetStateAction<FileData[]>>;
};

export async function placeUploads({ boardId, files, x, y, setFiles }: Args) {
  for (const [index, file] of files.entries()) {
    const point = { x: x + index * 24, y: y + index * 24 };
    const placeholderId = tempId();
    const placeholder: FileData = {
      id: placeholderId,
      key: placeholderId,
      name: file.name,
      mime: file.type,
      size: file.size,
      kind: fileKind(file.name, file.type),
      x: point.x,
      y: point.y,
    };
    setFiles((prev) => [...prev, placeholder]);
    try {
      const created = await uploadBoardFile(boardId, file, point.x, point.y);
      setFiles((prev) =>
        prev.map((item) => (item.key === placeholderId ? { ...item, ...created, key: item.key } : item)),
      );
    } catch (err) {
      setFiles((prev) => prev.filter((item) => item.key !== placeholderId));
      console.error("Failed to upload file", err);
    }
  }
}
