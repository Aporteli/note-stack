"use client";

import { useEffect, useState } from "react";
import { mergeLinks, toLinkData } from "@/components/Board/lib/link/mergeLinks";
import type { LinkData, LinkRecord } from "@/components/Board/types/link";

export function useLinks(initial: LinkRecord[]) {
  const [links, setLinks] = useState<LinkData[]>(() => initial.map(toLinkData));

  useEffect(() => {
    setLinks((current) => mergeLinks(current, initial));
  }, [initial]);

  return [links, setLinks] as const;
}
