"use client";

import { useCallback, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import { updateDocument } from "@/app/actions";
import { isTempId } from "@/components/Board/lib/items";
import type { DocumentData, Stroke } from "@/components/Board/types/board";

type Args = {
  boardId: string;
  documents: DocumentData[];
  setDocuments: Dispatch<SetStateAction<DocumentData[]>>;
};

export function useDocumentEditor({ boardId, documents, setDocuments }: Args) {
  const [openDocumentId, setOpenDocumentId] = useState<string | null>(null);
  const openDocument = openDocumentId
    ? documents.find((doc) => doc.id === openDocumentId) ?? null
    : null;

  const saveDocument = useCallback(
    async (payload: { title: string; text: string; strokes: Stroke[] }) => {
      if (!openDocumentId) return;
      const id = openDocumentId;

      setDocuments((prev) =>
        prev.map((doc) =>
          doc.id === id
            ? {
                ...doc,
                title: payload.title,
                text: payload.text,
                strokes: payload.strokes,
              }
            : doc,
        ),
      );

      setOpenDocumentId(null);
      if (isTempId(id)) return;

      try {
        await updateDocument(id, boardId, {
          title: payload.title,
          content: JSON.stringify({
            text: payload.text,
            strokes: payload.strokes,
          }),
        });
      } catch (err) {
        console.error("Failed to save document", err);
      }
    },
    [boardId, openDocumentId, setDocuments],
  );

  return { openDocumentId, setOpenDocumentId, openDocument, saveDocument };
}
