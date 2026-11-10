"use client";

import { useRef, useState } from "react";
import { applyLinkUrl } from "@/app/links/applyLinkUrl";
import { LinkIcon } from "@/components/Board/components/link/LinkIcon";
import type { LinkPreview } from "@/components/Board/types/link";

type Props = {
  linkId: string;
  boardId: string;
  fresh: boolean;
  onPreview: (preview: LinkPreview) => void;
};

export function LinkComposer({ linkId, boardId, fresh, onPreview }: Props) {
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  const done = useRef(false);

  async function commit() {
    const text = value.trim();
    if (!text || busy || done.current || linkId.startsWith("temp-")) return;
    setBusy(true);
    setError(false);
    const preview = await applyLinkUrl(linkId, text, boardId);
    setBusy(false);
    if (!preview) {
      setError(true);
      return;
    }
    done.current = true;
    onPreview(preview);
  }

  return (
    <label className="flex items-center gap-2 px-3 py-2.5 text-sm text-slate-400">
      <LinkIcon />
      <input
        autoFocus={fresh}
        value={value}
        placeholder="Enter a link URL"
        aria-label="Link URL"
        disabled={busy}
        onChange={(event) => setValue(event.target.value)}
        onPointerDown={(event) => event.stopPropagation()}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            event.currentTarget.blur();
          }
        }}
        onBlur={() => {
          void commit();
        }}
        className="min-w-0 flex-1 bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
      />
      {busy ? <span className="text-xs text-slate-400">Loading</span> : null}
      {error ? <span className="text-xs text-red-500">Not a link</span> : null}
    </label>
  );
}
