"use client";

import { DndContext, closestCenter } from "@dnd-kit/core";
import { useCallback, useMemo, useRef, useState } from "react";
import { useArrows } from "@/components/Board/hooks/useArrows";
import { useFileDrag } from "@/components/Board/hooks/useFileDrag";
import { useSaveTableCells } from "@/components/Board/hooks/useSaveTableCells";
import { useTableDrag } from "@/components/Board/hooks/useTableDrag";
import { useTables } from "@/components/Board/hooks/useTables";
import { useFiles } from "@/components/Board/hooks/useFiles";
import { useHeadingDrag } from "@/components/Board/hooks/useHeadingDrag";
import { useHeadings } from "@/components/Board/hooks/useHeadings";
import { useBoardDnd } from "@/components/Board/hooks/useBoardDnd";
import { useClipPaste } from "@/components/Board/hooks/useClipPaste";
import { useBoardSelection } from "@/components/Board/hooks/useBoardSelection";
import { useCardModal } from "@/components/Board/hooks/useCardModal";
import { useDocumentDrag } from "@/components/Board/hooks/useDocumentDrag";
import { useDocumentEditor } from "@/components/Board/hooks/useDocumentEditor";
import { useDocuments } from "@/components/Board/hooks/useDocuments";
import { useDrawingDrag } from "@/components/Board/hooks/useDrawingDrag";
import { useDrawings } from "@/components/Board/hooks/useDrawings";
import { useLinkDrag } from "@/components/Board/hooks/useLinkDrag";
import { useLinks } from "@/components/Board/hooks/useLinks";
import { useLists } from "@/components/Board/hooks/useLists";
import { useNoteDrag } from "@/components/Board/hooks/useNoteDrag";
import { useNotes } from "@/components/Board/hooks/useNotes";
import { backZ } from "@/components/Board/components/list/menu/backZ";
import { frontZ } from "@/components/Board/components/list/menu/frontZ";
import { canvasBounds } from "@/components/Board/lib/dnd";
import { dropPoint } from "@/components/Board/lib/file/dropPoint";
import { placeUploads } from "@/components/Board/lib/file/placeUploads";
import { liveHeadings } from "@/components/Board/lib/heading/liveHeadings";
import { tableHeight, tableWidth } from "@/components/Board/lib/table/metrics";
import { liveNotes } from "@/components/Board/lib/note/liveNotes";
import { setDrawingZ } from "@/app/drawings/setDrawingZ";
import { setDocumentZ } from "@/app/documents/setDocumentZ";
import { setListZ } from "@/app/lists/setListZ";
import { setHeadingZ } from "@/app/headings/setHeadingZ";
import { setNoteZ } from "@/app/notes/setNoteZ";
import type { BoardData, Stroke } from "@/components/Board/types/board";
import { BoardToolsProvider } from "@/components/Board/components/document/boardTools";
import { BoardCanvas } from "@/components/Board/components/BoardCanvas";
import { BoardDragOverlay } from "@/components/Board/components/BoardDragOverlay";
import { BoardHeader } from "@/components/Board/components/BoardHeader";
import { BoardSurface } from "@/components/Board/components/BoardSurface";
import { ContextMenu } from "@/components/Board/components/ContextMenu";
import { DocumentModal } from "@/components/Board/components/DocumentModal";
import { DrawingModal } from "@/components/Board/components/draw/DrawingModal";
import { SelectionActions } from "@/components/Board/components/SelectionActions";
import { CardDetail } from "@/components/CardDetail";

type Props = {
  board: BoardData;
};

export default function Board({ board }: Props) {
  const [lists, setLists] = useLists(board.lists);
  const [drawings, setDrawings] = useDrawings(board.drawings);
  const [documents, setDocuments] = useDocuments(board.documents);
  const [notes, setNotes] = useNotes(board.notes);
  const [links, setLinks] = useLinks(board.links);
  const [arrows, setArrows] = useArrows(board.arrows);
  const [headings, setHeadings] = useHeadings(board.headings);
  const [files, setFiles] = useFiles(board.files);
  const [tables, setTables] = useTables(board.tables);
  const saveTableCells = useSaveTableCells(board.id);
  useClipPaste(board.id, setNotes, setDocuments, setDrawings, setHeadings);
  const [addListOpen, setAddListOpen] = useState(false);
  const [openDrawingId, setOpenDrawingId] = useState<string | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const suppressAddListClickRef = useRef(false);

  const editor = useDocumentEditor({ boardId: board.id, documents, setDocuments });
  const selection = useBoardSelection({
    boardId: board.id,
    openDocumentId: editor.openDocumentId,
    openDrawingId,
    setLists,
    setDrawings,
    setDocuments,
    setNotes,
    setLinks,
    setArrows,
    setHeadings,
    setFiles,
    setTables,
  });
  const { sensors, activeId, activeType, handleDragStart, handleDragEnd } = useBoardDnd({
    lists,
    setLists,
    documents,
    setDocuments,
    setNotes,
    setDrawings,
    setLinks,
    setArrows,
    setHeadings,
    setTables,
    setFiles,
    boardId: board.id,
    canvasRef,
    onNewListDropped: () => {
      suppressAddListClickRef.current = true;
    },
  });
  const { setOpenCardId, openCard, openCardListTitle } = useCardModal(lists);
  const documentDrag = useDocumentDrag({
    boardId: board.id,
    documents,
    setDocuments,
    selectedItemKeys: selection.selectedItemKeys,
    setSelectedItemKeys: selection.setSelectedItemKeys,
  });
  const noteDrag = useNoteDrag({
    boardId: board.id,
    notes,
    setNotes,
    selectedItemKeys: selection.selectedItemKeys,
    setSelectedItemKeys: selection.setSelectedItemKeys,
  });
  const fileDrag = useFileDrag({
    boardId: board.id,
    files,
    setFiles,
    setSelectedItemKeys: selection.setSelectedItemKeys,
    onPicture: (listId, card) => {
      setLists((current) =>
        current.map((list) =>
          list.id === listId && !list.cards.some((item) => item.id === card.id)
            ? { ...list, cards: [...list.cards, card] }
            : list,
        ),
      );
    },
  });
  const tableDrag = useTableDrag({
    boardId: board.id,
    tables,
    setTables,
    setSelectedItemKeys: selection.setSelectedItemKeys,
  });
  const headingDrag = useHeadingDrag({
    boardId: board.id,
    headings,
    setHeadings,
    selectedItemKeys: selection.selectedItemKeys,
    setSelectedItemKeys: selection.setSelectedItemKeys,
  });
  const linkDrag = useLinkDrag({
    boardId: board.id,
    links,
    setLinks,
    selectedItemKeys: selection.selectedItemKeys,
    setSelectedItemKeys: selection.setSelectedItemKeys,
  });
  const drawingDrag = useDrawingDrag({
    boardId: board.id,
    drawings,
    setDrawings,
    selectedDrawingIds: selection.selectedDrawingIds,
    setSelectedDrawingIds: selection.setSelectedDrawingIds,
    setSelectedItemKeys: selection.setSelectedItemKeys,
  });

  const handleAddListClick = useCallback(() => {
    if (suppressAddListClickRef.current) {
      suppressAddListClickRef.current = false;
      return;
    }
    setAddListOpen(true);
  }, []);

  const bounds = useMemo(() => {
    const drag = documentDrag.drag;
    const liveDocuments = drag
      ? documents.map((doc) =>
          drag.ids.has(doc.id)
            ? {
                ...doc,
                x: Math.max(0, doc.x + drag.dx),
                y: Math.max(0, doc.y + drag.dy),
              }
            : doc,
        )
      : documents;
    return canvasBounds(
      lists,
      drawings,
      liveDocuments,
      undefined,
      liveNotes(notes, noteDrag.drag),
      links,
      arrows,
      liveHeadings(headings, headingDrag.drag),
      files,
      tables.map((table) => ({
        x: table.x + (tableDrag.drag?.id === table.id ? tableDrag.drag.dx : 0),
        y: table.y + (tableDrag.drag?.id === table.id ? tableDrag.drag.dy : 0),
        w: tableWidth(table.cols),
        h: tableHeight(table.rows),
      })),
    );
  }, [lists, drawings, documents, documentDrag.drag, notes, noteDrag.drag, links, arrows, headings, headingDrag.drag, files, tables, tableDrag.drag]);

  function saveDrawingStrokes(
    id: string,
    strokes: Stroke[],
    box: { x: number; y: number; w: number; h: number },
  ) {
    setDrawings((current) =>
      current.map((drawing) => (drawing.id === id ? { ...drawing, strokes, ...box } : drawing)),
    );
  }

  const activeCard =
    activeType === "card"
      ? lists.flatMap((list) => list.cards).find((card) => card.id === activeId)
      : undefined;
  const activeList =
    activeType === "list" ? lists.find((list) => list.id === activeId) : undefined;
  const activeDocument =
    activeType === "document"
      ? documents.find((doc) => doc.id === activeId)
      : undefined;

  return (
    <BoardToolsProvider>
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-[#f6f5f2] text-slate-900">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <BoardHeader
          boardId={board.id}
          title={board.title}
          addListOpen={addListOpen}
          onAddList={handleAddListClick}
          refreshKey={selection.refreshKey}
          documentOpen={editor.openDocument !== null}
          drawingOpen={openDrawingId !== null}
          onUpload={(list) => {
            const canvas = canvasRef.current;
            const point = canvas
              ? dropPoint(canvas, canvas.getBoundingClientRect().left + 80, canvas.getBoundingClientRect().top + 80)
              : { x: 80, y: 80 };
            void placeUploads({ boardId: board.id, files: Array.from(list), x: point.x, y: point.y, setFiles });
          }}
        />

        <div className="relative z-0 flex min-h-0 flex-1 flex-col overflow-hidden">
        <BoardCanvas
          width={bounds.width}
          height={bounds.height}
          canvasRef={canvasRef}
          onBackgroundPointerDown={selection.clearAllSelections}
          onFileDrop={(dropped, clientX, clientY) => {
            const canvas = canvasRef.current;
            if (!canvas) return;
            const point = dropPoint(canvas, clientX, clientY);
            void placeUploads({ boardId: board.id, files: dropped, x: point.x, y: point.y, setFiles });
          }}
        >
          <BoardSurface
            boardId={board.id}
            lists={lists}
            drawings={drawings}
            documents={documents}
            notes={notes}
            links={links}
            arrows={arrows}
            canvasRef={canvasRef}
            setArrows={setArrows}
            onArrowSelect={(id) => {
              selection.setSelectedItemKeys(new Set([`arrow:${id}`]));
              selection.setSelectedDrawingIds(new Set());
            }}
            onArrowDelete={(id) => {
              setArrows((current) => current.filter((arrow) => arrow.id !== id));
              selection.setSelectedItemKeys((prev) => {
                const next = new Set(prev);
                next.delete(`arrow:${id}`);
                return next;
              });
            }}
            linkDrag={linkDrag.drag}
            onStartLinkDrag={linkDrag.startDrag}
            onLinkPreview={(id, preview) => {
              setLinks((current) =>
                current.map((link) =>
                  link.id === id
                    ? { ...link, ...preview, h: preview.image ? 360 : 140, fresh: false }
                    : link,
                ),
              );
            }}
            addListOpen={addListOpen}
            selectedItemKeys={selection.selectedItemKeys}
            selectedDrawingIds={selection.selectedDrawingIds}
            draggingDrawings={drawingDrag.draggingDrawings}
            documentDrag={documentDrag.drag}
            headings={headings}
            files={files}
            fileDrag={fileDrag.drag}
            onStartFileDrag={fileDrag.startDrag}
            tables={tables}
            tableDrag={tableDrag.drag}
            onStartTableDrag={tableDrag.startDrag}
            onTableResize={(id, cols, rows) => {
              setTables((current) => current.map((table) => (table.id === id ? { ...table, cols, rows } : table)));
            }}
            onTableCells={(id, cells) => {
              setTables((current) => current.map((table) => (table.id === id ? { ...table, cells } : table)));
              saveTableCells(id, cells);
            }}
            headingDrag={headingDrag.drag}
            onHeadingText={(id, text) => {
              setHeadings((current) =>
                current.map((heading) => (heading.id === id ? { ...heading, text } : heading)),
              );
            }}
            onHeadingResize={(id, w, h) => {
              setHeadings((current) =>
                current.map((heading) => (heading.id === id ? { ...heading, w, h } : heading)),
              );
            }}
            onStartHeadingDrag={headingDrag.startDrag}
            onHeadingDelete={(id) => {
              setHeadings((current) => current.filter((heading) => heading.id !== id));
            }}
            onHeadingCreated={(created) => {
              setHeadings((current) =>
                current.some((heading) => heading.id === created.id) ? current : [...current, created],
              );
            }}
            onHeadingLock={(id, locked) => {
              setHeadings((current) =>
                current.map((heading) => (heading.id === id ? { ...heading, locked } : heading)),
              );
            }}
            onHeadingFront={(id) => {
              const z = frontZ(headings);
              setHeadings((current) =>
                current.map((heading) => (heading.id === id ? { ...heading, z } : heading)),
              );
              void setHeadingZ(id, z, board.id);
            }}
            onHeadingBack={(id) => {
              const z = backZ(headings);
              setHeadings((current) =>
                current.map((heading) => (heading.id === id ? { ...heading, z } : heading)),
              );
              void setHeadingZ(id, z, board.id);
            }}
            onHeadingSelect={(id) => {
              selection.setSelectedItemKeys(new Set([`heading:${id}`]));
              selection.setSelectedDrawingIds(new Set());
            }}
            onHeadingStyle={(id, look) => {
              setHeadings((current) =>
                current.map((heading) => (heading.id === id ? { ...heading, ...look } : heading)),
              );
            }}
            noteDrag={noteDrag.drag}
            onNoteText={(id, text) => {
              setNotes((current) =>
                current.map((note) => (note.id === id ? { ...note, text } : note)),
              );
            }}
            onNoteResize={(id, w, h) => {
              setNotes((current) =>
                current.map((note) => (note.id === id ? { ...note, w, h } : note)),
              );
            }}
            onStartNoteDrag={noteDrag.startDrag}
            onNoteDelete={(id) => {
              setNotes((current) => current.filter((note) => note.id !== id));
            }}
            onNoteCreated={(created) => {
              setNotes((current) =>
                current.some((note) => note.id === created.id) ? current : [...current, created],
              );
            }}
            onNoteLock={(id, locked) => {
              setNotes((current) =>
                current.map((note) => (note.id === id ? { ...note, locked } : note)),
              );
            }}
            onNoteFront={(id) => {
              const z = frontZ(notes);
              setNotes((current) => current.map((note) => (note.id === id ? { ...note, z } : note)));
              void setNoteZ(id, z, board.id);
            }}
            onNoteBack={(id) => {
              const z = backZ(notes);
              setNotes((current) => current.map((note) => (note.id === id ? { ...note, z } : note)));
              void setNoteZ(id, z, board.id);
            }}
            onNoteSelect={(id) => {
              selection.setSelectedItemKeys(new Set([`note:${id}`]));
              selection.setSelectedDrawingIds(new Set());
            }}
            onContextMenu={selection.handleContextMenu}
            onClick={selection.handleCanvasClick}
            onOpenCard={setOpenCardId}
            onListResize={(id, w, h) => {
              setLists((current) =>
                current.map((list) => (list.id === id ? { ...list, w, h } : list)),
              );
            }}
            onListRename={(id, title) => {
              setLists((current) =>
                current.map((list) => (list.id === id ? { ...list, title } : list)),
              );
            }}
            onListDelete={(id) => {
              setLists((current) => current.filter((list) => list.id !== id));
            }}
            onListPicture={(listId, card) => {
              setLists((current) =>
                current.map((list) =>
                  list.id === listId && !list.cards.some((item) => item.id === card.id)
                    ? { ...list, cards: [...list.cards, card] }
                    : list,
                ),
              );
            }}
            onListCreated={(created) => {
              setLists((current) =>
                current.some((list) => list.id === created.id) ? current : [...current, created],
              );
            }}
            onListLock={(id, locked) => {
              setLists((current) =>
                current.map((list) => (list.id === id ? { ...list, locked } : list)),
              );
            }}
            onListFront={(id) => {
              const z = frontZ(lists);
              setLists((current) => current.map((list) => (list.id === id ? { ...list, z } : list)));
              void setListZ(id, z, board.id);
            }}
            onListBack={(id) => {
              const z = backZ(lists);
              setLists((current) => current.map((list) => (list.id === id ? { ...list, z } : list)));
              void setListZ(id, z, board.id);
            }}
            onListSelect={(id) => {
              selection.setSelectedItemKeys(new Set([`list:${id}`]));
              selection.setSelectedDrawingIds(new Set());
            }}
            onOpenDocument={editor.setOpenDocumentId}
            onStartDocumentDrag={documentDrag.startDrag}
            onDocumentDelete={(id) => {
              setDocuments((current) => current.filter((doc) => doc.id !== id));
            }}
            onDocumentCreated={(created) => {
              setDocuments((current) =>
                current.some((doc) => doc.id === created.id) ? current : [...current, created],
              );
            }}
            onDocumentLock={(id, locked) => {
              setDocuments((current) =>
                current.map((doc) => (doc.id === id ? { ...doc, locked } : doc)),
              );
            }}
            onDocumentFront={(id) => {
              const z = frontZ(documents);
              setDocuments((current) =>
                current.map((doc) => (doc.id === id ? { ...doc, z } : doc)),
              );
              void setDocumentZ(id, z, board.id);
            }}
            onDocumentBack={(id) => {
              const z = backZ(documents);
              setDocuments((current) =>
                current.map((doc) => (doc.id === id ? { ...doc, z } : doc)),
              );
              void setDocumentZ(id, z, board.id);
            }}
            onDocumentSelect={(id) => {
              selection.setSelectedItemKeys(new Set([`document:${id}`]));
              selection.setSelectedDrawingIds(new Set());
            }}
            onOpenDrawing={setOpenDrawingId}
            onStartDrawingDrag={drawingDrag.startDrag}
            onDrawingDelete={(id) => {
              setDrawings((current) => current.filter((drawing) => drawing.id !== id));
            }}
            onDrawingCreated={(created) => {
              setDrawings((current) =>
                current.some((drawing) => drawing.id === created.id) ? current : [...current, created],
              );
            }}
            onDrawingLock={(id, locked) => {
              setDrawings((current) =>
                current.map((drawing) => (drawing.id === id ? { ...drawing, locked } : drawing)),
              );
            }}
            onDrawingFront={(id) => {
              const z = frontZ(drawings);
              setDrawings((current) =>
                current.map((drawing) => (drawing.id === id ? { ...drawing, z } : drawing)),
              );
              void setDrawingZ(id, z, board.id);
            }}
            onDrawingBack={(id) => {
              const z = backZ(drawings);
              setDrawings((current) =>
                current.map((drawing) => (drawing.id === id ? { ...drawing, z } : drawing)),
              );
              void setDrawingZ(id, z, board.id);
            }}
            onDrawingSelect={(id) => {
              selection.setSelectedDrawingIds(new Set([id]));
              selection.setSelectedItemKeys(new Set([`drawing:${id}`]));
            }}
            onAddListClose={() => setAddListOpen(false)}
          />
        </BoardCanvas>

        <DrawingModal
          drawing={drawings.find((drawing) => drawing.id === openDrawingId) ?? null}
          boardId={board.id}
          onSave={saveDrawingStrokes}
          onClose={() => setOpenDrawingId(null)}
        />

        <DocumentModal
          document={editor.openDocument}
          onSave={editor.saveDocument}
          onClose={() => editor.setOpenDocumentId(null)}
        />
        </div>

        <BoardDragOverlay
          activeCard={activeCard}
          activeList={activeList}
          activeDocument={activeDocument}
          activeType={activeType}
        />

        <CardDetail
          card={openCard ?? null}
          listTitle={openCardListTitle}
          onClose={() => setOpenCardId(null)}
        />

        {openDrawingId === null && selection.selectedDrawingIds.size > 0 ? (
          <SelectionActions
            count={selection.selectedDrawingIds.size}
            busy={selection.deleting}
            onDelete={selection.deleteSelectedDrawings}
            onClear={selection.clearAllSelections}
          />
        ) : null}

        {selection.contextMenu && selection.contextEntries.length > 0 ? (
          <ContextMenu
            x={selection.contextMenu.x}
            y={selection.contextMenu.y}
            items={selection.contextEntries}
            onClose={() => selection.setContextMenu(null)}
          />
        ) : null}
      </DndContext>
    </div>
    </BoardToolsProvider>
  );
}
