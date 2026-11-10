"use client";

import { useEffect, useState } from "react";
import { mergeTables } from "@/components/Board/lib/table/mergeTables";
import { toTableData } from "@/components/Board/lib/table/toTableData";
import type { TableData, TableRecord } from "@/components/Board/types/table";

const EMPTY: TableRecord[] = [];

export function useTables(initial: TableRecord[] | undefined) {
  const records = initial ?? EMPTY;
  const [tables, setTables] = useState<TableData[]>(() => records.map(toTableData));

  useEffect(() => {
    setTables((current) => mergeTables(current, records));
  }, [records]);

  return [tables, setTables] as const;
}
