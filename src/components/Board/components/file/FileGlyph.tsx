import { AudioIcon } from "@/components/Board/components/file/icons/AudioIcon";
import { GenericFileIcon } from "@/components/Board/components/file/icons/GenericFileIcon";
import { ImageIcon } from "@/components/Board/components/file/icons/ImageIcon";
import { PdfIcon } from "@/components/Board/components/file/icons/PdfIcon";
import { VideoIcon } from "@/components/Board/components/file/icons/VideoIcon";
import { WordIcon } from "@/components/Board/components/file/icons/WordIcon";

export function FileGlyph({ kind }: { kind: string }) {
  if (kind === "word") return <WordIcon />;
  if (kind === "pdf") return <PdfIcon />;
  if (kind === "image") return <ImageIcon />;
  if (kind === "audio") return <AudioIcon />;
  if (kind === "video") return <VideoIcon />;
  return <GenericFileIcon />;
}
