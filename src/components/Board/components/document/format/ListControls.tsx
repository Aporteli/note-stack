"use client";

import { MarkButton } from "@/components/Board/components/document/format/controls";
import { IndentIcon, ListIcon } from "@/components/Board/components/document/format/icons";
import type { FormatRun } from "@/components/Board/components/document/format/marks";

export function ListControls({ run }: { run: FormatRun }) {
  return (
    <>
      <MarkButton label="Bulleted list" onClick={() => run(() => document.execCommand("insertUnorderedList"))}>
        <ListIcon ordered={false} />
      </MarkButton>
      <MarkButton label="Numbered list" onClick={() => run(() => document.execCommand("insertOrderedList"))}>
        <ListIcon ordered />
      </MarkButton>
      <MarkButton label="Decrease indent" onClick={() => run(() => document.execCommand("outdent"))}>
        <IndentIcon out />
      </MarkButton>
      <MarkButton label="Increase indent" onClick={() => run(() => document.execCommand("indent"))}>
        <IndentIcon />
      </MarkButton>
    </>
  );
}
