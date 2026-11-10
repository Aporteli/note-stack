/** Plain text and a small HTML subset stored in a document's `text` field. */

const DROP = new Set([
  "SCRIPT",
  "STYLE",
  "IFRAME",
  "OBJECT",
  "EMBED",
  "LINK",
  "META",
  "NOSCRIPT",
  "TEMPLATE",
]);

const ALLOWED = new Set([
  "DIV",
  "P",
  "BR",
  "SPAN",
  "B",
  "STRONG",
  "I",
  "EM",
  "U",
  "S",
  "STRIKE",
  "DEL",
  "H1",
  "H2",
  "H3",
  "UL",
  "OL",
  "LI",
  "SUB",
  "SUP",
  "FONT",
  "BLOCKQUOTE",
]);

const SAFE_COLOR = /^(#[0-9a-f]{3,8}|rgba?\([^)]{1,80}\)|[a-z]{3,20})$/i;

const NAMED: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  nbsp: " ",
  quot: '"',
  apos: "'",
};

export const TEXT_FONTS = [
  { label: "Sans", value: "Public Sans" },
  { label: "Display", value: "Bricolage Grotesque" },
  { label: "Serif", value: "Georgia" },
  { label: "Mono", value: "Courier New" },
] as const;

export const TEXT_SIZES = [12, 14, 15, 16, 18, 20, 24, 28, 32, 36, 48] as const;

export const TEXT_COLORS = [
  "#1e293b",
  "#475569",
  "#b91c1c",
  "#c2410c",
  "#a16207",
  "#15803d",
  "#0f766e",
  "#1d4ed8",
  "#7e22ce",
  "#be185d",
] as const;

export const TEXT_HIGHLIGHTS = ["#fef08a", "#bbf7d0", "#bfdbfe", "#fbcfe8", "#fed7aa"] as const;

export function escapeHtml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export function plainText(value: string): string {
  if (!value) return "";
  const withBreaks = value
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|h1|h2|h3|li|blockquote)>/gi, "\n")
    .replace(/<[^>]+>/g, "");
  const decoded = withBreaks.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (entity, body: string) => {
    if (body[0] === "#") {
      const code =
        body[1] === "x" || body[1] === "X"
          ? Number.parseInt(body.slice(2), 16)
          : Number.parseInt(body.slice(1), 10);
      if (!Number.isFinite(code)) return entity;
      try {
        return String.fromCodePoint(code);
      } catch {
        return entity;
      }
    }
    return NAMED[body.toLowerCase()] ?? entity;
  });
  return decoded.replace(/\u00a0/g, " ").trim();
}

export function toEditorHtml(value: string): string {
  if (!value) return "";
  if (typeof window === "undefined") return escapeHtml(value).replace(/\r\n|\r|\n/g, "<br>");
  if (/<\/?[a-z][\s\S]*>/i.test(value)) return sanitizeHtml(value);
  return escapeHtml(value).replace(/\r\n|\r|\n/g, "<br>");
}

function safeColor(value: string): string | null {
  const next = value.trim();
  if (next.toLowerCase() === "transparent") return "transparent";
  if (!SAFE_COLOR.test(next)) return null;
  if (/url|expression|javascript|[;{}]|\\/i.test(next)) return null;
  return next;
}

function safeFontSize(value: string): string | null {
  const match = /^(\d+(?:\.\d+)?)(px|pt|em|rem|%)$/.exec(value.trim());
  if (!match) return null;
  const size = Number(match[1]);
  if (size <= 0 || size > 200) return null;
  return `${size}${match[2]}`;
}

function safeFontFamily(value: string): string | null {
  const cleaned = value.replace(/["']/g, "").trim();
  if (!cleaned || cleaned.length > 80) return null;
  if (!/^[a-z0-9 ,\-]+$/i.test(cleaned)) return null;
  return cleaned;
}

function safePx(value: string, min: number, max: number): string | null {
  const match = /^(-?\d+(?:\.\d+)?)px$/.exec(value.trim());
  if (!match) return null;
  const size = Number(match[1]);
  if (!Number.isFinite(size) || size < min || size > max) return null;
  return `${Math.round(size)}px`;
}

function safeLineHeight(value: string): string | null {
  const next = value.trim();
  if (next === "normal") return next;
  const size = Number(next);
  if (!Number.isFinite(size) || size < 1 || size > 3) return null;
  return String(Math.round(size * 100) / 100);
}

function safeAlign(value: string): string | null {
  const next = value.trim().toLowerCase();
  if (
    next === "left" ||
    next === "center" ||
    next === "right" ||
    next === "justify" ||
    next === "start" ||
    next === "end"
  ) {
    return next;
  }
  return null;
}

function filterStyle(el: HTMLElement) {
  const style = el.getAttribute("style");
  if (!style) return;
  const kept: string[] = [];
  for (const part of style.split(";")) {
    const [rawProp, ...rest] = part.split(":");
    if (!rawProp || rest.length === 0) continue;
    const prop = rawProp.trim().toLowerCase();
    const value = rest.join(":").trim();
    let safe: string | null = null;
    if (prop === "color" || prop === "background-color") safe = safeColor(value);
    else if (prop === "font-size") safe = safeFontSize(value);
    else if (prop === "font-family") safe = safeFontFamily(value);
    else if (prop === "font-weight" && /^(normal|bold|[1-9]00)$/.test(value)) safe = value;
    else if (prop === "font-style" && (value === "normal" || value === "italic")) safe = value;
    else if (
      (prop === "text-decoration" || prop === "text-decoration-line") &&
      /^[a-z0-9 #%.,()\-]+$/i.test(value) &&
      !/url|expression/i.test(value)
    ) {
      safe = value;
    } else if (prop === "text-align") safe = safeAlign(value);
    else if (prop === "line-height") safe = safeLineHeight(value);
    else if (
      prop === "margin-left" ||
      prop === "margin-right" ||
      prop === "padding-left" ||
      prop === "padding-right"
    ) {
      safe = safePx(value, 0, 4000);
    } else if (prop === "text-indent") safe = safePx(value, -2000, 4000);
    if (safe) kept.push(`${prop}: ${safe}`);
  }
  if (kept.length) el.setAttribute("style", kept.join("; "));
  else el.removeAttribute("style");
}

function sanitizeNode(el: Element) {
  for (const child of [...el.childNodes]) {
    if (child.nodeType === Node.COMMENT_NODE) {
      child.remove();
      continue;
    }
    if (child.nodeType !== Node.ELEMENT_NODE) continue;
    const element = child as HTMLElement;
    const tag = element.tagName;
    if (DROP.has(tag)) {
      element.remove();
      continue;
    }
    sanitizeNode(element);
    if (!ALLOWED.has(tag)) {
      element.replaceWith(...element.childNodes);
      continue;
    }
    if (tag === "FONT") {
      const span = element.ownerDocument.createElement("span");
      const face = safeFontFamily(element.getAttribute("face") ?? "");
      const color = safeColor(element.getAttribute("color") ?? "");
      if (element.getAttribute("style")) span.setAttribute("style", element.getAttribute("style") ?? "");
      if (face) span.style.fontFamily = face;
      if (color) span.style.color = color;
      while (element.firstChild) span.appendChild(element.firstChild);
      element.replaceWith(span);
      filterStyle(span);
      continue;
    }
    for (const attr of [...element.attributes]) {
      if (attr.name.toLowerCase() !== "style") element.removeAttribute(attr.name);
    }
    filterStyle(element);
  }
}

export function sanitizeHtml(html: string): string {
  if (!html || typeof window === "undefined") return "";
  const parsed = new DOMParser().parseFromString(`<div id="ns-root">${html}</div>`, "text/html");
  const root = parsed.getElementById("ns-root");
  if (!root) return "";
  sanitizeNode(root);
  return root.innerHTML;
}

export function rememberSelection(editor: HTMLElement | null): Range | null {
  if (!editor) return null;
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return null;
  const range = selection.getRangeAt(0);
  if (!editor.contains(range.commonAncestorContainer)) return null;
  return range.cloneRange();
}

export function editRichText(editor: HTMLElement, range: Range | null, edit: () => void) {
  editor.focus();
  if (range) {
    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);
  }
  document.execCommand("styleWithCSS", false, "true");
  edit();
}

export function applyBlock(tag: "p" | "h1" | "h2" | "h3") {
  const wrapped = document.execCommand("formatBlock", false, `<${tag}>`);
  if (!wrapped) document.execCommand("formatBlock", false, tag);
}

function listItemFrom(node: Node | null): HTMLElement | null {
  let el: Element | null = node instanceof Element ? node : node?.parentElement ?? null;
  while (el) {
    if (el instanceof HTMLLIElement) return el;
    el = el.parentElement;
  }
  return null;
}

function listItemsInSelection(editor: HTMLElement): HTMLElement[] {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0 || !editor.contains(selection.anchorNode)) return [];
  const range = selection.getRangeAt(0);
  if (range.collapsed) {
    const item = listItemFrom(selection.anchorNode);
    return item && editor.contains(item) ? [item] : [];
  }
  return [...editor.querySelectorAll("li")].filter((node) => range.intersectsNode(node));
}

function clearNestedFontSize(item: HTMLElement) {
  item.querySelectorAll<HTMLElement>("span, font").forEach((node) => {
    node.style.fontSize = "";
    node.removeAttribute("size");
    if (!node.getAttribute("style")?.trim()) node.removeAttribute("style");
  });
}

export function applyFontSize(editor: HTMLElement, px: number) {
  const items = listItemsInSelection(editor);
  if (items.length > 0) {
    for (const item of items) {
      item.style.fontSize = `${px}px`;
      item.style.lineHeight = "1.45";
      clearNestedFontSize(item);
      const list = item.parentElement;
      if (list instanceof HTMLElement && (list.tagName === "UL" || list.tagName === "OL")) {
        list.style.paddingLeft = `${Math.max(24, Math.round(px * 1.35))}px`;
      }
    }
    return;
  }

  const before = new Set(editor.querySelectorAll("font, span"));
  document.execCommand("fontSize", false, "7");
  editor.querySelectorAll("font, span").forEach((node) => {
    if (!(node instanceof HTMLElement)) return;
    const created = !before.has(node);
    const sized = node.getAttribute("size") === "7";
    const keyword = /xx-large|xxx-large/.test(node.style.fontSize);
    if (!created && !sized && !keyword) return;
    node.removeAttribute("size");
    node.style.fontSize = `${px}px`;
  });
}
