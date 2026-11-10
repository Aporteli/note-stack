import { setHeadingLocked } from "@/app/headings/setHeadingLocked";

export function lockHeading(
  headingId: string,
  locked: boolean,
  boardId: string,
  apply: (id: string, locked: boolean) => void,
) {
  apply(headingId, locked);
  void setHeadingLocked(headingId, locked, boardId);
}
