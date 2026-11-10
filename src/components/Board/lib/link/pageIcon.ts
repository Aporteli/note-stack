function decode(value: string) {
  return value.replace(/&amp;/g, "&").replace(/&quot;/g, '"');
}

export function pageIcon(html: string, pageUrl: string) {
  const link = /<link[^>]+rel=["'][^"']*icon[^"']*["'][^>]*>/i.exec(html)?.[0] ?? "";
  const href = /href=["']([^"']+)["']/i.exec(link)?.[1] ?? "";
  if (!href) {
    const host = new URL(pageUrl).hostname;
    return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(host)}&sz=64`;
  }
  try {
    return new URL(decode(href), pageUrl).toString();
  } catch {
    return "";
  }
}
