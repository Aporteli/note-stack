export type FileKind = "word" | "pdf" | "image" | "audio" | "video" | "file";

export type FileRecord = {
  id: string;
  name: string;
  mime: string;
  size: number;
  kind: string;
  x: number;
  y: number;
};

export type FileData = FileRecord & {
  key: string;
};

export const FILE_W = 148;
export const FILE_VIDEO_W = 280;
