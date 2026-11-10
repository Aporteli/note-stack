"use client";

import { Modal } from "./ui/Overlay";
import { IconStack } from "./ui/Icons";

export function CardDetail({
  card,
  listTitle,
  onClose,
}: {
  card: { id: string; title: string } | null;
  listTitle?: string;
  onClose: () => void;
}) {
  return (
    <Modal open={Boolean(card)} onClose={onClose} title={card?.title ?? ""} size="sm">
      {listTitle ? (
        <p className="flex items-center gap-1.5 text-meta text-ink-soft">
          <IconStack size={15} />
          In list <span className="font-semibold text-ink">{listTitle}</span>
        </p>
      ) : null}
    </Modal>
  );
}
