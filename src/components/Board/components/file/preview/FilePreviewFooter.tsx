import { FileGlyph } from "@/components/Board/components/file/FileGlyph";
import { formatBytes } from "@/lib/files/formatBytes";
import type { FileData } from "@/components/Board/types/boardFile";

export function FilePreviewFooter({ file }: { file: FileData }) {
  return (
    <div className="flex items-center gap-3 border-t border-slate-200 bg-white px-4 py-3">
      <div className="shrink-0 scale-75">
        <FileGlyph kind={file.kind} />
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm text-slate-800">{file.name}</p>
        <p className="text-sm text-slate-500">
          <a
            href={`/api/files/${file.id}?download=1`}
            download={file.name}
            className="text-sky-700 underline"
          >
            Download
          </a>
          {` - ${formatBytes(file.size)}`}
        </p>
      </div>
    </div>
  );
}
