import { metaContent } from "@/components/Board/lib/link/metaContent";
import { blockedHost, normalizeUrl } from "@/components/Board/lib/link/normalizeUrl";
import { pageIcon } from "@/components/Board/lib/link/pageIcon";
import type { LinkPreview } from "@/components/Board/types/link";

function absolute(value: string, pageUrl: string) {
  if (!value) return "";
  try {
    const url = new URL(value, pageUrl);
    if (url.protocol !== "http:" && url.protocol !== "https:") return "";
    if (blockedHost(url.hostname)) return "";
    return url.toString();
  } catch {
    return "";
  }
}

function fallback(url: string): LinkPreview {
  const host = new URL(url).hostname.replace(/^www\./, "");
  return {
    url,
    title: host,
    description: "",
    image: "",
    icon: `https://www.google.com/s2/favicons?domain=${encodeURIComponent(host)}&sz=64`,
  };
}

export async function readLinkPreview(raw: string): Promise<LinkPreview | null> {
  const url = normalizeUrl(raw);
  if (!url) return null;
  try {
    const response = await fetch(url, {
      redirect: "follow",
      signal: AbortSignal.timeout(8000),
      headers: {
        Accept: "text/html,application/xhtml+xml",
        "Accept-Language": "en-US,en;q=0.9",
        "User-Agent": "Mozilla/5.0 (compatible; NoteStack/1.0)",
      },
    });
    const finalUrl = response.url || url;
    if (blockedHost(new URL(finalUrl).hostname)) return fallback(url);
    const type = response.headers.get("content-type") ?? "";
    if (!type.includes("html")) return fallback(finalUrl);
    const html = (await response.text()).slice(0, 500_000);
    const title =
      metaContent(html, "og:title") ||
      metaContent(html, "twitter:title") ||
      (/<title[^>]*>([^<]*)<\/title>/i.exec(html)?.[1] ?? "").trim();
    const description =
      metaContent(html, "og:description") ||
      metaContent(html, "twitter:description") ||
      metaContent(html, "description");
    const image = absolute(
      metaContent(html, "og:image") || metaContent(html, "twitter:image"),
      finalUrl,
    );
    return {
      url: finalUrl,
      title: title || new URL(finalUrl).hostname.replace(/^www\./, ""),
      description,
      image,
      icon: pageIcon(html, finalUrl),
    };
  } catch {
    return fallback(url);
  }
}
