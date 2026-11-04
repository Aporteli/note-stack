import type { ChangeEvent, FormEvent, ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { Field, Textarea } from "@/components/ui/Field";
import { Modal } from "@/components/ui/Overlay";
import type { Draft } from "@/components/flash/lib/deck";

type Props = {
  draft: Draft | null;
  front: string;
  back: string;
  error: string;
  pending: boolean;
  onFront: (value: string) => void;
  onBack: (value: string) => void;
  onClose: () => void;
  onSubmit: (event: FormEvent) => void;
};

export function FlashCardModal({
  draft,
  front,
  back,
  error,
  pending,
  onFront,
  onBack,
  onClose,
  onSubmit,
}: Props) {
  return (
    <Modal
      open={draft !== null}
      onClose={onClose}
      title={draft?.mode === "edit" ? "Edit flash card" : "New flash card"}
      description="The front is what you see first. The back shows after you click the card."
      size="lg"
      footer={<FlashCardModalFooter draft={draft} pending={pending} onClose={onClose} />}
    >
      <form id="flash-card-form" onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
        <Field label="Front">
          {({ id, describedBy }) => (
            <Textarea
              id={id}
              aria-describedby={describedBy}
              value={front}
              onChange={(event: ChangeEvent<HTMLTextAreaElement>) => onFront(event.target.value)}
              placeholder="Write the front of this card"
              rows={8}
              className="flash-field min-h-32 sm:min-h-48"
              autoFocus
            />
          )}
        </Field>
        <Field label="Back">
          {({ id, describedBy }) => (
            <Textarea
              id={id}
              aria-describedby={describedBy}
              value={back}
              onChange={(event: ChangeEvent<HTMLTextAreaElement>) => onBack(event.target.value)}
              placeholder="Write the back of this card"
              rows={8}
              className="flash-field min-h-32 sm:min-h-48"
            />
          )}
        </Field>
        {error ? <p className="text-meta text-danger sm:col-span-2">{error}</p> : null}
      </form>
    </Modal>
  );
}

function FlashCardModalFooter({
  draft,
  pending,
  onClose,
}: {
  draft: Draft | null;
  pending: boolean;
  onClose: () => void;
}): ReactNode {
  return (
    <>
      <Button type="button" variant="ghost" onClick={onClose} disabled={pending}>
        Cancel
      </Button>
      <Button type="submit" form="flash-card-form" variant="primary" loading={pending}>
        {draft?.mode === "edit" ? "Save card" : "Create card"}
      </Button>
    </>
  );
}
