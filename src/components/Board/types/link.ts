export type LinkRecord = {
  id: string;
  url: string;
  title: string;
  description: string;
  image: string;
  icon: string;
  x: number;
  y: number;
  w: number;
  h: number;
};

export type LinkData = LinkRecord & {
  key: string;
  fresh: boolean;
};

export type LinkPreview = {
  url: string;
  title: string;
  description: string;
  image: string;
  icon: string;
};

export const NEW_LINK_DRAG_ID = "board-new-link-drag";
export const LINK_W = 300;
export const LINK_BAR_H = 48;
