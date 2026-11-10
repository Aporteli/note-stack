"use client";

import { useEffect, useState } from "react";
import { mergeHeadings } from "@/components/Board/lib/heading/mergeHeadings";
import { toHeadingData } from "@/components/Board/lib/heading/toHeadingData";
import type { HeadingData, HeadingRecord } from "@/components/Board/types/heading";

const EMPTY: HeadingRecord[] = [];

export function useHeadings(initial: HeadingRecord[] | undefined) {
  const records = initial ?? EMPTY;
  const [headings, setHeadings] = useState<HeadingData[]>(() => records.map(toHeadingData));

  useEffect(() => {
    setHeadings((current) => mergeHeadings(current, records));
  }, [records]);

  return [headings, setHeadings] as const;
}
