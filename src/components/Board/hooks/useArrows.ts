"use client";

import { useCallback, useEffect, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import { mergeArrows } from "@/components/Board/lib/arrow/mergeArrows";
import { noteRemoved, withoutPending } from "@/components/Board/lib/keepRemoved";
import type { ArrowData, ArrowRecord } from "@/components/Board/types/arrow";

export function useArrows(initial: ArrowRecord[]) {
  const [arrows, setArrowsState] = useState<ArrowData[]>(initial);

  const setArrows: Dispatch<SetStateAction<ArrowData[]>> = useCallback((action) => {
    setArrowsState((current) => {
      const next = typeof action === "function" ? action(current) : action;
      noteRemoved(current, next);
      return next;
    });
  }, []);

  useEffect(() => {
    setArrowsState((current) => withoutPending(mergeArrows(current, initial)));
  }, [initial]);

  return [arrows, setArrows] as const;
}
