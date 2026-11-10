import { createPictureCard } from "@/app/actions";
import { createTextCard } from "@/app/lists/createTextCard";
import { placeListCopy } from "@/app/lists/placeListCopy";
import { clearCutClip, readListClip } from "@/components/Board/lib/list/clipboard/ListClip";
import { imageDataUrl } from "@/components/Board/lib/list/pastedImage";
import type { ListData } from "@/components/Board/types/board";

type Card = { id: string; title: string; image?: string | null };

type Args = {
  boardId: string;
  list: { id: string; x: number; y: number };
  onPicture: (listId: string, card: Card) => void;
  onCreated: (list: ListData) => void;
};

async function systemPaste(): Promise<{ image: string | null; text: string }> {
  try {
    const items = await navigator.clipboard.read();
    for (const item of items) {
      const type = item.types.find((entry) => entry.startsWith("image/"));
      if (!type) continue;
      const file = new File([await item.getType(type)], "paste", { type });
      const image = await imageDataUrl(file);
      if (image) return { image, text: "" };
    }
  } catch {
    /* The browser can refuse clipboard.read; fall through to text. */
  }
  try {
    return { image: null, text: await navigator.clipboard.readText() };
  } catch {
    return { image: null, text: "" };
  }
}

export async function pasteIntoList({ boardId, list, onPicture, onCreated }: Args) {
  const clip = readListClip();
  if (clip) {
    const created = await placeListCopy(boardId, {
      title: clip.title,
      x: list.x + 32,
      y: list.y + 32,
      w: clip.w,
      h: clip.h,
      cards: clip.cards,
    });
    clearCutClip();
    if (created) onCreated(created);
    return;
  }
  const pasted = await systemPaste();
  if (pasted.image) {
    const card = await createPictureCard(list.id, pasted.image, boardId);
    if (card) onPicture(list.id, card);
    return;
  }
  const title = pasted.text.trim();
  if (!title) return;
  const card = await createTextCard(list.id, title, boardId);
  if (card) onPicture(list.id, card);
}
