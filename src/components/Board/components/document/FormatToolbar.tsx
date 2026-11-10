"use client";

import { useEffect, useRef, useState } from "react";
import { useBoardTools } from "@/components/Board/components/document/boardTools";
import { editRichText, rememberSelection } from "@/components/Board/lib/richText";
import { AlignControls } from "@/components/Board/components/document/format/AlignControls";
import { ColorControls } from "@/components/Board/components/document/format/ColorControls";
import { Divider } from "@/components/Board/components/document/format/controls";
import { HistoryControls } from "@/components/Board/components/document/format/HistoryControls";
import { ListControls } from "@/components/Board/components/document/format/ListControls";
import { StyleControls } from "@/components/Board/components/document/format/StyleControls";
import { TextMarkControls } from "@/components/Board/components/document/format/TextMarkControls";
import { EMPTY_MARKS, readMarks, sameMarks, type FormatRun } from "@/components/Board/components/document/format/marks";

export function FormatToolbar({ hint = "Open a document to format text" }: { hint?: string }) {
  const { editor, syncEditor, prepareRef } = useBoardTools();
  const [marks, setMarks] = useState(EMPTY_MARKS);
  const [menu, setMenu] = useState<"color" | "highlight" | null>(null);
  const rangeRef = useRef<Range | null>(null);
  const barRef = useRef<HTMLFieldSetElement>(null);

  useEffect(() => {
    const update = () => {
      const next = readMarks(editor);
      setMarks((prev) => (sameMarks(prev, next) ? prev : next));
    };
    document.addEventListener("selectionchange", update);
    update();
    return () => document.removeEventListener("selectionchange", update);
  }, [editor]);

  useEffect(() => {
    if (!menu) return;
    const close = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (barRef.current?.contains(target)) return;
      if (target instanceof Element && target.closest("[data-format-menu]")) return;
      setMenu(null);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [menu]);

  const run: FormatRun = (edit) => {
    if (!editor) return;
    prepareRef.current();
    editRichText(editor, rangeRef.current, edit);
    rangeRef.current = rememberSelection(editor);
    syncEditor();
    setMarks(readMarks(editor));
  };

  return (
    <fieldset
      ref={barRef}
      role="toolbar"
      aria-label="Text formatting"
      disabled={!editor}
      title={editor ? undefined : hint}
      onMouseDownCapture={() => {
        rangeRef.current = rememberSelection(editor);
      }}
      className="m-0 flex min-w-max flex-wrap items-center gap-1 border-0 p-0 disabled:opacity-70"
    >
      <StyleControls marks={marks} editor={editor} run={run} />
      <Divider />
      <TextMarkControls marks={marks} run={run} />
      <Divider />
      <ColorControls menu={menu} setMenu={setMenu} run={run} />
      <Divider />
      <AlignControls marks={marks} run={run} />
      <Divider />
      <ListControls run={run} />
      <Divider />
      <HistoryControls run={run} />
    </fieldset>
  );
}
