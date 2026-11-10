import type { FileKind } from "@/components/Board/types/boardFile";

export function fileKind(name: string, mime: string): FileKind {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  if (mime.startsWith("image/") || ["png", "jpg", "jpeg", "gif", "webp", "bmp"].includes(ext)) return "image";
  if (mime.startsWith("audio/") || ["mp3", "wav", "ogg", "m4a", "aac", "flac"].includes(ext)) return "audio";
  if (mime.startsWith("video/") || ["mp4", "webm", "mov", "mkv"].includes(ext)) return "video";
  if (mime === "application/pdf" || ext === "pdf") return "pdf";
  if (
    ext === "doc" ||
    ext === "docx" ||
    mime === "application/msword" ||
    mime.includes("wordprocessingml")
  ) {
    return "word";
  }
  return "file";
}
