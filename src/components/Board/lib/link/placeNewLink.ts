import type { Dispatch, SetStateAction } from "react";
import { createLink } from "@/app/links/createLink";
import { noteDropPoint } from "@/components/Board/lib/note/noteDropPoint";
import { tempId } from "@/components/Board/lib/note/tempId";
import { LINK_BAR_H, LINK_W, type LinkData } from "@/components/Board/types/link";

type Args = {
  boardId: string;
  pointer: { x: number; y: number };
  grab: { x: number; y: number };
  canvas: HTMLDivElement;
  setLinks: Dispatch<SetStateAction<LinkData[]>>;
};

export async function placeNewLink({ boardId, pointer, grab, canvas, setLinks }: Args) {
  const point = noteDropPoint(pointer, grab, canvas.getBoundingClientRect());
  const placeholderId = tempId();
  const placeholder: LinkData = {
    id: placeholderId,
    key: placeholderId,
    url: "",
    title: "",
    description: "",
    image: "",
    icon: "",
    x: point.x,
    y: point.y,
    w: LINK_W,
    h: LINK_BAR_H,
    fresh: true,
  };
  setLinks((prev) => [...prev, placeholder]);

  try {
    const created = await createLink(boardId, point.x, point.y);
    setLinks((prev) =>
      prev.map((link) =>
        link.key === placeholderId ? { ...link, id: created.id, x: created.x, y: created.y } : link,
      ),
    );
  } catch (err) {
    setLinks((prev) => prev.filter((link) => link.key !== placeholderId));
    console.error("Failed to create link", err);
  }
}
