import { useCallback, useEffect, useRef, useState } from "react";
import type { PointerEvent, RefObject } from "react";
import { useBoardTools } from "@/components/Board/components/document/boardTools";
import {
  DOC_PAGE_MARGIN,
  DocumentRuler,
  applyRulerDelta,
  type RulerDrag,
  type RulerValues,
} from "@/components/Board/components/document/DocumentRuler";
import { InkSurface } from "@/components/Board/components/document/InkSurface";
import { plainText, sanitizeHtml, toEditorHtml } from "@/components/Board/lib/richText";
import { DOC_CANVAS_W } from "@/components/Board/types/board";
import type { Stroke } from "@/components/Board/types/board";
import type { Tool } from "@/components/Board/lib/sketch";

type Shared = {
  pageH: number;
  textRef: RefObject<HTMLDivElement | null>;
  svgRef: RefObject<SVGSVGElement | null>;
  text: string;
  strokes: Stroke[];
  current: Stroke | null;
  tool: Tool;
  onText: (value: string) => void;
  onPointerDown: (event: PointerEvent) => void;
  onPointerMove: (event: PointerEvent) => void;
  onPointerUp: () => void;
};

export function DocumentWritePage({
  docId,
  pageH,
  textRef,
  svgRef,
  text,
  strokes,
  current,
  tool,
  onText,
  onPointerDown,
  onPointerMove,
  onPointerUp,
}: Shared & { docId: string }) {
  const { bindEditor } = useBoardTools();
  const [margins, setMargins] = useState(() => {
    const page = readPagePadding(toEditorHtml(text));
    return { left: page.left, right: page.right };
  });
  const [session, setSession] = useState(() => {
    const page = readPagePadding(toEditorHtml(text));
    return { docId, echo: text, markup: { __html: page.body } };
  });
  const [indents, setIndents] = useState({ left: 0, first: 0, right: 0 });
  const publishRef = useRef<() => void>(() => {});
  const marginRef = useRef(margins);
  const draggingRef = useRef(false);
  const originRef = useRef<RulerValues | null>(null);
  const blocksRef = useRef<HTMLElement[]>([]);
  marginRef.current = margins;

  const editorFocused =
    session.docId === docId &&
    typeof document !== "undefined" &&
    document.activeElement === textRef.current;
  if (!editorFocused && (session.docId !== docId || session.echo !== text)) {
    const page = readPagePadding(toEditorHtml(text));
    if (session.docId !== docId || page.body !== session.markup.__html) {
      setSession({ docId, echo: text, markup: { __html: page.body } });
      setMargins({ left: page.left, right: page.right });
      if (session.docId !== docId) setIndents({ left: 0, first: 0, right: 0 });
    } else if (session.echo !== text) {
      setSession((current) => ({ ...current, echo: text }));
    }
  }

  useEffect(() => {
    const el = textRef.current;
    if (!el) return;
    const active = document.activeElement;
    if (active instanceof HTMLInputElement || active instanceof HTMLTextAreaElement || active === el) return;
    el.focus({ preventScroll: true });
  }, [docId, textRef]);

  useEffect(() => {
    publishRef.current = () => {
      const body = sanitizeHtml(textRef.current?.innerHTML ?? "");
      const stored = withPagePadding(body, marginRef.current.left, marginRef.current.right);
      setSession((current) => (current.echo === stored ? current : { ...current, echo: stored }));
      onText(stored);
    };
  }, [onText, textRef]);

  const attachEditor = useCallback(
    (node: HTMLDivElement | null) => {
      (textRef as { current: HTMLDivElement | null }).current = node;
      bindEditor(node, () => publishRef.current());
    },
    [bindEditor, textRef],
  );

  useEffect(() => {
    const update = () => {
      if (draggingRef.current) return;
      const editor = textRef.current;
      if (!editor) return;
      const selected = blocksInSelection(editor);
      const next = readIndents(selected.length ? selected : firstBlocks(editor));
      setIndents((current) =>
        current.left === next.left && current.first === next.first && current.right === next.right
          ? current
          : next,
      );
    };
    document.addEventListener("selectionchange", update);
    update();
    return () => document.removeEventListener("selectionchange", update);
  }, [textRef, docId, session.markup]);

  function onRuler(kind: RulerDrag, dx: number, width: number, phase: "start" | "move" | "end") {
    if (phase === "start") {
      const editor = textRef.current;
      const paragraph = kind === "margin-left" || kind === "margin-right" || !editor
        ? []
        : ensureBlocks(editor);
      blocksRef.current = paragraph;
      const current = readIndents(paragraph.length ? paragraph : firstBlocks(editor));
      originRef.current = {
        marginLeft: marginRef.current.left,
        marginRight: marginRef.current.right,
        ...current,
      };
      if (paragraph.length) setIndents(current);
      draggingRef.current = true;
    }
    const origin = originRef.current;
    if (!origin) return;
    const next = applyRulerDelta(origin, kind, dx, width);
    if (kind === "margin-left" || kind === "margin-right") {
      marginRef.current = { left: next.marginLeft, right: next.marginRight };
      setMargins(marginRef.current);
    } else {
      for (const block of blocksRef.current) writeIndents(block, next);
      setIndents({ left: next.left, first: next.first, right: next.right });
    }
    if (phase === "end") {
      draggingRef.current = false;
      originRef.current = null;
      publishRef.current();
    }
  }

  const rulerValues: RulerValues = {
    marginLeft: margins.left,
    marginRight: margins.right,
    left: indents.left,
    first: indents.first,
    right: indents.right,
  };

  return (
    <DocumentRuler height={pageH} values={rulerValues} onDrag={onRuler}>
      {(width) => (
      <div className="relative h-full w-full">
        {plainText(text) === "" ? (
          <span
            className="pointer-events-none absolute text-[15px] leading-7 text-slate-400"
            style={{ top: DOC_PAGE_MARGIN, left: margins.left }}
          >
            Start writing…
          </span>
        ) : null}
        <div
          ref={attachEditor}
          role="textbox"
          aria-multiline="true"
          aria-label="Document text"
          contentEditable
          suppressContentEditableWarning
          spellCheck
          dir="auto"
          dangerouslySetInnerHTML={session.markup}
          onInput={() => publishRef.current()}
          onPaste={(event) => {
            event.preventDefault();
            const html = event.clipboardData.getData("text/html");
            const pasted = event.clipboardData.getData("text/plain");
            const clean = html
              ? sanitizeHtml(html)
              : pasted
                  .replace(/&/g, "&amp;")
                  .replace(/</g, "&lt;")
                  .replace(/>/g, "&gt;")
                  .replace(/\n/g, "<br>");
            document.execCommand("insertHTML", false, clean);
            publishRef.current();
          }}
          style={{
            paddingTop: DOC_PAGE_MARGIN,
            paddingBottom: DOC_PAGE_MARGIN,
            paddingLeft: margins.left,
            paddingRight: margins.right,
          }}
          className="absolute inset-0 h-full w-full cursor-text overflow-hidden border-0 bg-transparent text-[15px] leading-7 break-words whitespace-pre-wrap text-slate-800 focus:outline-none [&_h1]:font-display [&_h1]:text-[2rem] [&_h1]:leading-tight [&_h1]:font-semibold [&_h2]:font-display [&_h2]:text-[1.5rem] [&_h2]:leading-snug [&_h2]:font-semibold [&_h3]:text-[1.25rem] [&_h3]:font-semibold [&_ol]:my-1 [&_ol]:list-decimal [&_ol]:pl-6 [&_ul]:my-1 [&_ul]:list-disc [&_ul]:pl-6"
        />
        <InkSurface
          svgRef={svgRef}
          width={width}
          height={pageH}
          strokes={strokes}
          current={current}
          tool={tool}
          className="absolute inset-0"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
        />
      </div>
      )}
    </DocumentRuler>
  );
}

const BLOCK = /^(P|DIV|H1|H2|H3|LI|BLOCKQUOTE)$/;

function readPagePadding(html: string) {
  const fallback = { left: DOC_PAGE_MARGIN, right: DOC_PAGE_MARGIN, body: html };
  if (!html || typeof window === "undefined") return fallback;
  const parsed = new DOMParser().parseFromString(`<div id="ns-root">${html}</div>`, "text/html");
  const root = parsed.getElementById("ns-root");
  const only = root?.childElementCount === 1 ? root.firstElementChild : null;
  if (!(only instanceof HTMLElement) || only.tagName !== "DIV") return fallback;
  const props = (only.getAttribute("style") ?? "")
    .split(";")
    .map((part) => part.split(":")[0]?.trim().toLowerCase())
    .filter((part): part is string => Boolean(part));
  if (
    props.length === 0 ||
    !props.includes("padding-left") ||
    !props.includes("padding-right") ||
    props.some((prop) => prop !== "padding-left" && prop !== "padding-right")
  ) {
    return fallback;
  }
  return {
    left: pxOf(only.style.paddingLeft, DOC_PAGE_MARGIN),
    right: pxOf(only.style.paddingRight, DOC_PAGE_MARGIN),
    body: only.innerHTML,
  };
}

function withPagePadding(body: string, left: number, right: number) {
  return `<div style="padding-left: ${Math.round(left)}px; padding-right: ${Math.round(right)}px">${body}</div>`;
}

function pxOf(value: string, fallback: number) {
  const n = Number.parseFloat(value);
  return Number.isFinite(n) ? n : fallback;
}

function blockFromNode(editor: HTMLElement, node: Node | null) {
  let el = node instanceof Element ? node : node?.parentElement ?? null;
  let found: HTMLElement | null = null;
  while (el && el !== editor) {
    if (el instanceof HTMLElement && BLOCK.test(el.tagName)) found = el;
    el = el.parentElement;
  }
  return found;
}

function blocksInSelection(editor: HTMLElement) {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0 || !editor.contains(selection.anchorNode)) return [];
  const range = selection.getRangeAt(0);
  if (range.collapsed) {
    const block = blockFromNode(editor, selection.anchorNode);
    return block ? [block] : [];
  }
  const hits = [...editor.querySelectorAll("p, div, h1, h2, h3, li, blockquote")].filter(
    (node): node is HTMLElement => node instanceof HTMLElement && range.intersectsNode(node),
  );
  return hits.filter((node) => !hits.some((other) => other !== node && node.contains(other)));
}

function firstBlocks(editor: HTMLElement | null) {
  if (!editor) return [];
  const hits = [...editor.querySelectorAll("p, div, h1, h2, h3, li, blockquote")].filter(
    (node): node is HTMLElement => node instanceof HTMLElement,
  );
  const innermost = hits.filter((node) => !hits.some((other) => other !== node && node.contains(other)));
  return innermost.length ? [innermost[0]] : [];
}

function readIndents(blocks: HTMLElement[]) {
  const block = blocks[0];
  if (!block) return { left: 0, first: 0, right: 0 };
  return {
    left: pxOf(block.style.marginLeft, 0),
    first: pxOf(block.style.textIndent, 0),
    right: pxOf(block.style.marginRight, 0),
  };
}

function writeIndents(block: HTMLElement, indent: { left: number; first: number; right: number }) {
  setPx(block, "marginLeft", indent.left);
  setPx(block, "textIndent", indent.first);
  setPx(block, "marginRight", indent.right);
}

function setPx(el: HTMLElement, prop: "marginLeft" | "marginRight" | "textIndent", value: number) {
  if (Math.abs(value) < 1) el.style[prop] = "";
  else el.style[prop] = `${Math.round(value)}px`;
}

function ensureBlocks(editor: HTMLElement) {
  const selected = blocksInSelection(editor);
  if (selected.length) return selected;
  const existing = firstBlocks(editor);
  if (existing.length) return existing;
  if (editor.childNodes.length === 0) {
    const div = document.createElement("div");
    div.appendChild(document.createElement("br"));
    editor.appendChild(div);
    return [div];
  }
  const wrapper = document.createElement("div");
  while (editor.firstChild) wrapper.appendChild(editor.firstChild);
  editor.appendChild(wrapper);
  return [wrapper];
}

export function DocumentSketchPage({
  pageH,
  svgRef,
  strokes,
  current,
  tool,
  onPointerDown,
  onPointerMove,
  onPointerUp,
}: Shared) {
  return (
    <div className="ns-scroll min-h-0 flex-1 overflow-auto bg-slate-50/60">
      <div className="px-4 py-4">
        <InkSurface
          svgRef={svgRef}
          width={DOC_CANVAS_W}
          height={pageH}
          strokes={strokes}
          current={current}
          tool={tool}
          className="rounded-xl border border-slate-200 bg-white shadow-inner"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
        />
      </div>
    </div>
  );
}
