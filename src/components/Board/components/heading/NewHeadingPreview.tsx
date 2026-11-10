import { HEADING_H, HEADING_W } from "@/components/Board/lib/heading/size";

export function NewHeadingPreview() {
  return (
    <div
      className="flex items-center justify-center border border-slate-800 bg-transparent"
      style={{ width: HEADING_W, height: HEADING_H }}
    >
      <span className="text-[28px] text-slate-400">Start typing...</span>
    </div>
  );
}
