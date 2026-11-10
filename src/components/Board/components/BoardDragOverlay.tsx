"use client";

import { DragOverlay } from "@dnd-kit/core";
import { CardDragPreview } from "@/components/Card";
import {
  DocumentDragPreview,
  NewDocumentPreview,
} from "@/components/Board/components/DocumentCard";
import { NewDrawingPreview } from "@/components/Board/components/draw/NewDrawingPreview";
import { NewArrowPreview } from "@/components/Board/components/arrow/NewArrowPreview";
import { NewHeadingPreview } from "@/components/Board/components/heading/NewHeadingPreview";
import { NewTablePreview } from "@/components/Board/components/table/NewTablePreview";
import { NewLinkPreview } from "@/components/Board/components/link/NewLinkPreview";
import { NewNotePreview } from "@/components/Board/components/note/NewNotePreview";
import { ListDragPreview, NewListPreview } from "@/components/List";
import type { DocumentData, ListData } from "@/components/Board/types/board";

type CardPreview = { title: string; image?: string | null };

type Props = {
  activeCard?: CardPreview;
  activeList?: ListData;
  activeDocument?: DocumentData;
  activeType: string | null;
};

export function BoardDragOverlay({
  activeCard,
  activeList,
  activeDocument,
  activeType,
}: Props) {
  return (
    <DragOverlay dropAnimation={null}>
      {activeCard ? <CardDragPreview title={activeCard.title} image={activeCard.image} /> : null}
      {activeList ? <ListDragPreview title={activeList.title} /> : null}
      {activeDocument ? <DocumentDragPreview title={activeDocument.title} /> : null}
      {activeType === "new-list" ? <NewListPreview /> : null}
      {activeType === "new-document" ? <NewDocumentPreview /> : null}
      {activeType === "new-note" ? <NewNotePreview /> : null}
      {activeType === "new-link" ? <NewLinkPreview /> : null}
      {activeType === "new-arrow" ? <NewArrowPreview /> : null}
      {activeType === "new-heading" ? <NewHeadingPreview /> : null}
      {activeType === "new-table" ? <NewTablePreview /> : null}
      {activeType === "new-drawing" ? <NewDrawingPreview /> : null}
    </DragOverlay>
  );
}
