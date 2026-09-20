"use client";

import { useEffect, useState } from "react";
import type { ListData } from "@/components/Board/types/board";

export function useLists(initial: ListData[]) {
  const [lists, setLists] = useState<ListData[]>(initial);

  // keep local state in sync with server refreshes (revalidatePath)
  useEffect(() => {
    setLists(initial);
  }, [initial]);

  return [lists, setLists] as const;
}