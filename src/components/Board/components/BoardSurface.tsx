"use client";

import type { Dispatch, MouseEvent, RefObject, SetStateAction } from "react";
import { AddList } from "@/components/Board/components/AddList";
import { BoardEmpty } from "@/components/Board/components/BoardEmpty";
import { DocumentCard } from "@/components/Board/components/DocumentCard";
import { Drawing } from "@/components/Board/components/Drawing";
import { ArrowLayer } from "@/components/Board/components/arrow/ArrowLayer";
import { FilesLayer } from "@/components/Board/components/file/FilesLayer";
import { TablesLayer } from "@/components/Board/components/table/TablesLayer";
import { HeadingsLayer } from "@/components/Board/components/heading/HeadingsLayer";
import { LinksLayer } from "@/components/Board/components/link/LinksLayer";
import { NotesLayer } from "@/components/Board/components/note/NotesLayer";
import { List } from "@/components/List";
import type { ArrowData } from "@/components/Board/types/arrow";
import type { FileData } from "@/components/Board/types/boardFile";
import type { TableCells, TableData } from "@/components/Board/types/table";
import type { HeadingAlign, HeadingData } from "@/components/Board/types/heading";
import type { DocumentData, DrawingData, ListData } from "@/components/Board/types/board";
import type { LinkData, LinkPreview } from "@/components/Board/types/link";
import type { NoteData } from "@/components/Board/types/note";

type Props = {
  boardId: string;
  lists: ListData[];
  drawings: DrawingData[];
  documents: DocumentData[];
  notes: NoteData[];
  links: LinkData[];
  arrows: ArrowData[];
  headings: HeadingData[];
  files: FileData[];
  fileDrag: { dx: number; dy: number; id: string } | null;
  onStartFileDrag: (id: string, clientX: number, clientY: number) => void;
  tables: TableData[];
  tableDrag: { dx: number; dy: number; id: string } | null;
  onStartTableDrag: (id: string, clientX: number, clientY: number) => void;
  onTableResize: (id: string, cols: number, rows: number) => void;
  onTableCells: (id: string, cells: TableCells) => void;
  headingDrag: { dx: number; dy: number; ids: ReadonlySet<string> } | null;
  onHeadingText: (id: string, text: string) => void;
  onHeadingResize: (id: string, w: number, h: number) => void;
  onStartHeadingDrag: (id: string, clientX: number, clientY: number, shift: boolean) => void;
  onHeadingDelete: (id: string) => void;
  onHeadingCreated: (heading: HeadingData) => void;
  onHeadingLock: (id: string, locked: boolean) => void;
  onHeadingFront: (id: string) => void;
  onHeadingBack: (id: string) => void;
  onHeadingSelect: (id: string) => void;
  onHeadingStyle: (
    id: string,
    look: { fontSize: number; color: string; bold: boolean; align: HeadingAlign },
  ) => void;
  canvasRef: RefObject<HTMLDivElement | null>;
  setArrows: Dispatch<SetStateAction<ArrowData[]>>;
  onArrowSelect: (id: string) => void;
  onArrowDelete: (id: string) => void;
  addListOpen: boolean;
  selectedItemKeys: Set<string>;
  selectedDrawingIds: Set<string>;
  draggingDrawings: boolean;
  documentDrag: { dx: number; dy: number; ids: ReadonlySet<string> } | null;
  noteDrag: { dx: number; dy: number; ids: ReadonlySet<string> } | null;
  linkDrag: { dx: number; dy: number; ids: ReadonlySet<string> } | null;
  onStartLinkDrag: (id: string, x: number, y: number, shift: boolean) => void;
  onLinkPreview: (id: string, preview: LinkPreview) => void;
  onNoteText: (id: string, text: string) => void;
  onNoteResize: (id: string, w: number, h: number) => void;
  onStartNoteDrag: (id: string, x: number, y: number, shift: boolean) => void;
  onNoteDelete: (id: string) => void;
  onNoteCreated: (note: NoteData) => void;
  onNoteLock: (id: string, locked: boolean) => void;
  onNoteFront: (id: string) => void;
  onNoteBack: (id: string) => void;
  onNoteSelect: (id: string) => void;
  onContextMenu: (event: MouseEvent) => void;
  onClick: (event: MouseEvent) => void;
  onOpenCard: (id: string) => void;
  onListResize: (id: string, w: number, h: number) => void;
  onListRename: (id: string, title: string) => void;
  onListDelete: (id: string) => void;
  onListPicture: (listId: string, card: { id: string; title: string; image?: string | null }) => void;
  onListCreated: (list: ListData) => void;
  onListLock: (id: string, locked: boolean) => void;
  onListFront: (id: string) => void;
  onListBack: (id: string) => void;
  onListSelect: (id: string) => void;
  onOpenDocument: (id: string) => void;
  onStartDocumentDrag: (id: string, x: number, y: number, shift: boolean) => void;
  onDocumentDelete: (id: string) => void;
  onDocumentCreated: (document: DocumentData) => void;
  onDocumentLock: (id: string, locked: boolean) => void;
  onDocumentFront: (id: string) => void;
  onDocumentBack: (id: string) => void;
  onDocumentSelect: (id: string) => void;
  onOpenDrawing: (id: string) => void;
  onStartDrawingDrag: (id: string, x: number, y: number, shift: boolean) => void;
  onDrawingDelete: (id: string) => void;
  onDrawingCreated: (drawing: DrawingData) => void;
  onDrawingLock: (id: string, locked: boolean) => void;
  onDrawingFront: (id: string) => void;
  onDrawingBack: (id: string) => void;
  onDrawingSelect: (id: string) => void;
  onAddListClose: () => void;
};

export function BoardSurface({
  boardId,
  lists,
  drawings,
  documents,
  notes,
  links,
  arrows,
  headings,
  files,
  fileDrag,
  onStartFileDrag,
  tables,
  tableDrag,
  onStartTableDrag,
  onTableResize,
  onTableCells,
  headingDrag,
  onHeadingText,
  onHeadingResize,
  onStartHeadingDrag,
  onHeadingDelete,
  onHeadingCreated,
  onHeadingLock,
  onHeadingFront,
  onHeadingBack,
  onHeadingSelect,
  onHeadingStyle,
  canvasRef,
  setArrows,
  onArrowSelect,
  onArrowDelete,
  addListOpen,
  selectedItemKeys,
  selectedDrawingIds,
  draggingDrawings,
  documentDrag,
  noteDrag,
  linkDrag,
  onStartLinkDrag,
  onLinkPreview,
  onNoteText,
  onNoteResize,
  onStartNoteDrag,
  onNoteDelete,
  onNoteCreated,
  onNoteLock,
  onNoteFront,
  onNoteBack,
  onNoteSelect,
  onContextMenu,
  onClick,
  onOpenCard,
  onListResize,
  onListRename,
  onListDelete,
  onListPicture,
  onListCreated,
  onListLock,
  onListFront,
  onListBack,
  onListSelect,
  onOpenDocument,
  onStartDocumentDrag,
  onDocumentDelete,
  onDocumentCreated,
  onDocumentLock,
  onDocumentFront,
  onDocumentBack,
  onDocumentSelect,
  onOpenDrawing,
  onStartDrawingDrag,
  onDrawingDelete,
  onDrawingCreated,
  onDrawingLock,
  onDrawingFront,
  onDrawingBack,
  onDrawingSelect,
  onAddListClose,
}: Props) {
  const empty =
    lists.length === 0 &&
    drawings.length === 0 &&
    documents.length === 0 &&
    notes.length === 0 &&
    links.length === 0 &&
    arrows.length === 0 &&
    headings.length === 0 &&
    files.length === 0 &&
    tables.length === 0;

  return (
    <div className="contents" onContextMenu={onContextMenu} onClick={onClick}>
      {drawings.map((drawing) => (
        <Drawing
          key={drawing.id}
          boardId={boardId}
          drawing={drawing}
          selected={selectedDrawingIds.has(drawing.id)}
          dragging={draggingDrawings && selectedDrawingIds.has(drawing.id)}
          onOpen={onOpenDrawing}
          onStartDrag={onStartDrawingDrag}
          onDelete={onDrawingDelete}
          onCreated={onDrawingCreated}
          onLock={onDrawingLock}
          onFront={() => onDrawingFront(drawing.id)}
          onBack={() => onDrawingBack(drawing.id)}
          onSelect={() => onDrawingSelect(drawing.id)}
        />
      ))}

      <ArrowLayer
        boardId={boardId}
        canvasRef={canvasRef}
        arrows={arrows}
        selectedItemKeys={selectedItemKeys}
        setArrows={setArrows}
        onSelect={onArrowSelect}
        onDelete={onArrowDelete}
      />

      <TablesLayer
        boardId={boardId}
        tables={tables}
        selectedItemKeys={selectedItemKeys}
        tableDrag={tableDrag}
        onStartDrag={onStartTableDrag}
        onResize={onTableResize}
        onCells={onTableCells}
      />

      <FilesLayer
        files={files}
        selectedItemKeys={selectedItemKeys}
        fileDrag={fileDrag}
        onStartDrag={onStartFileDrag}
      />

      <HeadingsLayer
        boardId={boardId}
        headings={headings}
        selectedItemKeys={selectedItemKeys}
        headingDrag={headingDrag}
        onText={onHeadingText}
        onResize={onHeadingResize}
        onStartDrag={onStartHeadingDrag}
        onDelete={onHeadingDelete}
        onCreated={onHeadingCreated}
        onLock={onHeadingLock}
        onFront={onHeadingFront}
        onBack={onHeadingBack}
        onSelect={onHeadingSelect}
        onStyle={onHeadingStyle}
      />

      <LinksLayer
        boardId={boardId}
        links={links}
        selectedItemKeys={selectedItemKeys}
        linkDrag={linkDrag}
        onStartDrag={onStartLinkDrag}
        onPreview={onLinkPreview}
      />

      <NotesLayer
        boardId={boardId}
        notes={notes}
        selectedItemKeys={selectedItemKeys}
        noteDrag={noteDrag}
        onText={onNoteText}
        onResize={onNoteResize}
        onStartDrag={onStartNoteDrag}
        onDelete={onNoteDelete}
        onCreated={onNoteCreated}
        onLock={onNoteLock}
        onFront={onNoteFront}
        onBack={onNoteBack}
        onSelect={onNoteSelect}
      />

      {documents.map((doc) => (
        <DocumentCard
          key={doc.id}
          boardId={boardId}
          document={doc}
          selected={selectedItemKeys.has(`document:${doc.id}`)}
          dragOffset={
            documentDrag?.ids.has(doc.id)
              ? { dx: documentDrag.dx, dy: documentDrag.dy }
              : null
          }
          onOpen={onOpenDocument}
          onStartDrag={onStartDocumentDrag}
          onDelete={onDocumentDelete}
          onCreated={onDocumentCreated}
          onLock={onDocumentLock}
          onFront={() => onDocumentFront(doc.id)}
          onBack={() => onDocumentBack(doc.id)}
          onSelect={() => onDocumentSelect(doc.id)}
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
              onResize={onListResize}
              onRename={onListRename}
              onDelete={onListDelete}
              onPicture={onListPicture}
              onCreated={onListCreated}
              onLock={onListLock}
              onFront={() => onListFront(list.id)}
              onBack={() => onListBack(list.id)}
              onSelect={() => onListSelect(list.id)}
              selected={selectedItemKeys.has(`list:${list.id}`)}
            />
          ))}
          {addListOpen ? <AddList boardId={boardId} onClose={onAddListClose} /> : null}
        </>
      )}
    </div>
  );
}
