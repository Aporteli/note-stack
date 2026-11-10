"use client";

import { useEffect, useState } from "react";
import { EmptyPage } from "@/components/Board/components/file/preview/EmptyPage";
import { loadDocxPreview } from "@/components/Board/components/file/preview/loadDocxPreview";

const pageClass =
  "px-12 py-10 text-[15px] leading-7 text-slate-900 [&_h1]:mb-3 [&_h1]:text-xl [&_h1]:font-bold [&_h2]:mt-5 [&_h2]:mb-2 [&_h2]:text-lg [&_h2]:font-semibold [&_h3]:mt-4 [&_h3]:mb-2 [&_h3]:font-semibold [&_p]:my-2 [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:my-0.5 [&_table]:my-3 [&_td]:border [&_td]:border-slate-200 [&_td]:px-2 [&_td]:py-1";

export function DocxPage({ id }: { id: string }) {
  const [html, setHtml] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancel = false;
    loadDocxPreview(id)
      .then((next) => {
        if (!cancel) setHtml(next);
      })
      .catch(() => {
        if (!cancel) setFailed(true);
      });
    return () => {
      cancel = true;
    };
  }, [id]);

  if (failed) return <EmptyPage text="This Word file has no preview. Use Download." />;
  if (html === null) return <p className="px-10 py-16 text-sm text-slate-400">Loading preview…</p>;
  if (!html.trim()) return <EmptyPage text="This file is empty." />;
  return <div className={pageClass} dangerouslySetInnerHTML={{ __html: html }} />;
}
