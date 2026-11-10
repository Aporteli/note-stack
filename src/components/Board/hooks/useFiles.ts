"use client";

import { useEffect, useState } from "react";
import { mergeFiles, toFileData } from "@/components/Board/lib/file/mergeFiles";
import type { FileData, FileRecord } from "@/components/Board/types/boardFile";

const EMPTY: FileRecord[] = [];

export function useFiles(initial: FileRecord[] | undefined) {
  const records = initial ?? EMPTY;
  const [files, setFiles] = useState<FileData[]>(() => records.map(toFileData));

  useEffect(() => {
    setFiles((current) => mergeFiles(current, records));
  }, [records]);

  return [files, setFiles] as const;
}
