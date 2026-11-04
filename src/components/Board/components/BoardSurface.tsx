"use client";

import type { MouseEvent } from "react";
import { AddList } from "@/components/Board/components/AddList";
import { BoardEmpty } from "@/components/Board/components/BoardEmpty";
import { DocumentCard } from "@/components/Board/components/DocumentCard";
import { Drawing } from "@/components/Board/components/Drawing";
import { List } from "@/components/List";
import type { DocumentData, DrawingData, ListData } from "@/components/Board/types/board";

type Props = {
  boardId: string;
  lists: ListData[];
  drawings: DrawingData[];
  documents: DocumentData[];
  addListOpen: boolean;
  selectedItemKeys: Set<string>;
  selectedDrawingIds: Set<string>;
  draggingDrawings: boolean;
  onContextMenu: (event: MouseEvent) => void;
  onClick: (event: MouseEvent) => void;
  onOpenCard: (id: string) => void;
  onOpenDocument: (id: string) => void;
  onStartDocumentDrag: (id: string, x: number, y: number, shift: boolean) => void;
  onStartDrawingDrag: (id: string, x: number, y: number, shift: boolean) => void;
  onAddListClose: () => void;
};

export function BoardSurface({
  boardId,
  lists,
  drawings,
  documents,
  addListOpen,
  selectedItemKeys,
  selectedDrawingIds,
  draggingDrawings,
  onContextMenu,
  onClick,
  onOpenCard,
  onOpenDocument,
  onStartDocumentDrag,
  onStartDrawingDrag,
  onAddListClose,
}: Props) {
  const empty = lists.length === 0 && drawings.length === 0 && documents.length === 0;

  return (
    <div className="contents" onContextMenu={onContextMenu} onClick={onClick}>
      {drawings.map((drawing) => (
        <Drawing
          key={drawing.id}
          drawing={drawing}
          selected={selectedDrawingIds.has(drawing.id)}
          dragging={draggingDrawings && selectedDrawingIds.has(drawing.id)}
          onStartDrag={onStartDrawingDrag}
        />
      ))}

      {documents.map((doc) => (
        <DocumentCard
          key={doc.id}
          document={doc}
          selected={selectedItemKeys.has(`document:${doc.id}`)}
          onOpen={onOpenDocument}
          onStartDrag={onStartDocumentDrag}
        />
      ))}

      {empty ? (
        <BoardEmpty
          boardId={boardId}
          addListOpen={addListOpen}
          onAddListClose={onAddListClose}
        />
      ) : (
        <>
          {lists.map((list, index) => (
            <List
              key={list.id}
              list={list}
              boardId={boardId}
              index={index}
              onOpenCard={onOpenCard}
              selected={selectedItemKeys.has(`list:${list.id}`)}
            />
          ))}
          {addListOpen ? <AddList boardId={boardId} onClose={onAddListClose} /> : null}
        </>
      )}
    </div>
  );
}
