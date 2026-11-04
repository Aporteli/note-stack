"use client";

import { DragOverlay } from "@dnd-kit/core";
import { CardDragPreview } from "@/components/Card";
import {
  DocumentDragPreview,
  NewDocumentPreview,
} from "@/components/Board/components/DocumentCard";
import { ListDragPreview, NewListPreview } from "@/components/List";
import type { DocumentData, ListData } from "@/components/Board/types/board";

type CardPreview = { title: string };

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
      {activeCard ? <CardDragPreview title={activeCard.title} /> : null}
      {activeList ? <ListDragPreview title={activeList.title} /> : null}
      {activeDocument ? <DocumentDragPreview title={activeDocument.title} /> : null}
      {activeType === "new-list" ? <NewListPreview /> : null}
      {activeType === "new-document" ? <NewDocumentPreview /> : null}
    </DragOverlay>
  );
}
