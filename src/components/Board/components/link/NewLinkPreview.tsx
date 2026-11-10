import { LinkIcon } from "@/components/Board/components/link/LinkIcon";
import { LINK_W } from "@/components/Board/types/link";

export function NewLinkPreview() {
  return (
    <div
      className="flex items-center gap-2 border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-400 shadow-lift-3"
      style={{ width: LINK_W }}
    >
      <LinkIcon />
      <span>Enter a link URL</span>
    </div>
  );
}
