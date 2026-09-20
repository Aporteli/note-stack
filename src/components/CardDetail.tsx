"use client";

import { Modal } from "./ui/Overlay";
import { Button } from "./ui/Button";
import { Field, Textarea } from "./ui/Field";
import { Avatar, Tag } from "./ui/Tag";
import { IconDescription, IconStack, IconTrash } from "./ui/Icons";

/**
 * The card detail sheet. Presentation only for now — every control is wired to
 * a no-op so the layout can be reviewed before the actions land.
 */
export function CardDetail({
  card,
  listTitle,
  onClose,
}: {
  card: { id: string; title: string; description?: string | null } | null;
  listTitle?: string;
  onClose: () => void;
}) {
  return (
    <Modal
      open={Boolean(card)}
      onClose={onClose}
      title={card?.title ?? ""}
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={onClose}>
            Save changes
          </Button>
        </>
      }
    >
      <div className="grid gap-6 sm:grid-cols-[1fr_180px]">
        <div className="space-y-6">
          <p className="flex items-center gap-1.5 text-meta text-ink-soft">
            <IconStack size={15} />
            In list <span className="font-semibold text-ink">{listTitle}</span>
          </p>

          <Field label="Description">
            {({ id }) => (
              <Textarea
                id={id}
                rows={5}
                defaultValue={card?.description ?? ""}
                placeholder="Add the detail someone would need to pick this up cold."
              />
            )}
          </Field>

          <section>
            <h3 className="mb-2 flex items-center gap-1.5 text-meta font-semibold text-ink-soft">
              <IconDescription size={15} />
              Activity
            </h3>
            <div className="flex gap-2.5">
              <Avatar name="Giorgi K" size={30} />
              <div className="flex-1 rounded-panel bg-surface px-3 py-2 text-body text-ink-soft">
                Comments arrive with the next release.
              </div>
            </div>
          </section>
        </div>

        <aside className="space-y-4">
          <div>
            <p className="mb-1.5 text-meta font-semibold text-ink-soft">
              Labels
            </p>
            <div className="flex flex-wrap gap-1.5">
              <Tag tone="lagoon">Design</Tag>
              <Tag tone="coral">Blocked</Tag>
            </div>
          </div>

          <div>
            <p className="mb-1.5 text-meta font-semibold text-ink-soft">
              Members
            </p>
            <div className="flex gap-1">
              <Avatar name="Giorgi K" />
              <Avatar name="Nino T" />
            </div>
          </div>

          <Button variant="danger" size="sm" block>
            <IconTrash size={16} />
            Delete card
          </Button>
        </aside>
      </div>
    </Modal>
  );
}
