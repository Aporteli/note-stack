import { DocxPage } from "@/components/Board/components/file/preview/DocxPage";
import { EmptyPage } from "@/components/Board/components/file/preview/EmptyPage";
import { ImagePage } from "@/components/Board/components/file/preview/ImagePage";
import { MediaPage } from "@/components/Board/components/file/preview/MediaPage";
import { PdfPage } from "@/components/Board/components/file/preview/PdfPage";
import { isDocx } from "@/lib/files/isDocx";
import type { FileData } from "@/components/Board/types/boardFile";

export function FilePreviewBody({ file }: { file: FileData }) {
  const src = `/api/files/${file.id}`;
  if (file.kind === "image") return <ImagePage src={src} />;
  if (file.kind === "pdf") return <PdfPage src={src} />;
  if (file.kind === "audio" || file.kind === "video") return <MediaPage src={src} kind={file.kind} />;
  if (file.kind === "word" && isDocx(file.name, file.mime)) return <DocxPage id={file.id} />;
  return <EmptyPage text="This file has no preview. Use Download." />;
}
