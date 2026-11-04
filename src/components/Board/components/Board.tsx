"use client";

import { DndContext, closestCenter } from "@dnd-kit/core";
import { useCallback, useMemo, useRef, useState } from "react";
import { createDrawing } from "@/app/actions";
import { useBoardDnd } from "@/components/Board/hooks/useBoardDnd";
import { useBoardSelection } from "@/components/Board/hooks/useBoardSelection";
import { useCardModal } from "@/components/Board/hooks/useCardModal";
import { useDocumentDrag } from "@/components/Board/hooks/useDocumentDrag";
import { useDocumentEditor } from "@/components/Board/hooks/useDocumentEditor";
import { useDocuments } from "@/components/Board/hooks/useDocuments";
import { useDrawingDrag } from "@/components/Board/hooks/useDrawingDrag";
import { useDrawings } from "@/components/Board/hooks/useDrawings";
import { useLists } from "@/components/Board/hooks/useLists";
import { canvasBounds } from "@/components/Board/lib/dnd";
import type { BoardData, Stroke } from "@/components/Board/types/board";
import { BoardCanvas } from "@/components/Board/components/BoardCanvas";
import { BoardDragOverlay } from "@/components/Board/components/BoardDragOverlay";
import { BoardHeader } from "@/components/Board/components/BoardHeader";
import { BoardSurface } from "@/components/Board/components/BoardSurface";
import { ContextMenu } from "@/components/Board/components/ContextMenu";
import { DocumentModal } from "@/components/Board/components/DocumentModal";
import { DrawOverlay } from "@/components/Board/components/DrawOverlay";
import { SelectionActions } from "@/components/Board/components/SelectionActions";
import { CardDetail } from "@/components/CardDetail";

type Props = {
  board: BoardData;
};

export default function Board({ board }: Props) {
  const [lists, setLists] = useLists(board.lists);
  const [drawings, setDrawings] = useDrawings(board.drawings);
  const [documents, setDocuments] = useDocuments(board.documents);
  const [addListOpen, setAddListOpen] = useState(false);
  const [drawMode, setDrawMode] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);
  const suppressAddListClickRef = useRef(false);

  const editor = useDocumentEditor({ boardId: board.id, documents, setDocuments });
  const selection = useBoardSelection({
    boardId: board.id,
    drawMode,
    openDocumentId: editor.openDocumentId,
    setLists,
    setDrawings,
    setDocuments,
  });
  const { sensors, activeId, activeType, handleDragStart, handleDragEnd } = useBoardDnd({
    lists,
    setLists,
    documents,
    setDocuments,
    boardId: board.id,
    canvasRef,
    onNewListDropped: () => {
      suppressAddListClickRef.current = true;
    },
  });
  const { setOpenCardId, openCard, openCardListTitle } = useCardModal(lists);
  const startDocumentDrag = useDocumentDrag({
    boardId: board.id,
    documents,
    setDocuments,
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

  const bounds = useMemo(
    () =>
      canvasBounds(
        lists,
        drawings,
        documents,
        drawMode ? { minWidth: 4000, minHeight: 3000 } : undefined,
      ),
    [lists, drawings, documents, drawMode],
  );

  async function handleSaveDrawing(
    area: { x: number; y: number; w: number; h: number },
    strokes: Stroke[],
  ) {
    setDrawMode(false);
    await createDrawing(
      board.id,
      area.x,
      area.y,
      area.w,
      area.h,
      JSON.stringify(strokes),
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
          drawMode={drawMode}
          onToggleDraw={() => setDrawMode((value) => !value)}
          refreshKey={selection.refreshKey}
        />

        <BoardCanvas
          width={bounds.width}
          height={bounds.height}
          canvasRef={canvasRef}
          onBackgroundPointerDown={selection.clearAllSelections}
        >
          <BoardSurface
            boardId={board.id}
            lists={lists}
            drawings={drawings}
            documents={documents}
            addListOpen={addListOpen}
            selectedItemKeys={selection.selectedItemKeys}
            selectedDrawingIds={selection.selectedDrawingIds}
            draggingDrawings={drawingDrag.draggingDrawings}
            onContextMenu={selection.handleContextMenu}
            onClick={selection.handleCanvasClick}
            onOpenCard={setOpenCardId}
            onOpenDocument={editor.setOpenDocumentId}
            onStartDocumentDrag={startDocumentDrag}
            onStartDrawingDrag={drawingDrag.startDrag}
            onAddListClose={() => setAddListOpen(false)}
          />
          {drawMode ? (
            <DrawOverlay
              width={bounds.width}
              height={bounds.height}
              onSave={handleSaveDrawing}
              onDiscard={() => setDrawMode(false)}
            />
          ) : null}
        </BoardCanvas>

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

        {!drawMode && selection.selectedDrawingIds.size > 0 ? (
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

      <DocumentModal
        document={editor.openDocument}
        onSave={editor.saveDocument}
        onClose={() => editor.setOpenDocumentId(null)}
      />
    </div>
  );
}
