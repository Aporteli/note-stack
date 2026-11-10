"use client";

import { useEffect, useState } from "react";
import { mergeNotes } from "@/components/Board/lib/note/mergeNotes";
import { toNoteData } from "@/components/Board/lib/note/toNoteData";
import type { NoteData, NoteRecord } from "@/components/Board/types/note";

const EMPTY_NOTES: NoteRecord[] = [];

export function useNotes(initial: NoteRecord[] | undefined) {
  const records = initial ?? EMPTY_NOTES;
  const [notes, setNotes] = useState<NoteData[]>(() => records.map(toNoteData));

  useEffect(() => {
    setNotes((current) => mergeNotes(current, records));
  }, [records]);

  return [notes, setNotes] as const;
}
