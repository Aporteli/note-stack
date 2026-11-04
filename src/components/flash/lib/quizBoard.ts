import type { QuizFolderData, QuizListItem } from "@/app/flash-cards/actions";

export const MIN_OPTIONS = 2;
export const MAX_OPTIONS = 6;

export type QuizSort = "name" | "created" | "count";

export function quizzesHere(
  quizzes: QuizListItem[],
  folderId: string | null,
  sort: QuizSort,
) {
  return quizzes
    .filter((quiz) => (quiz.folderId ?? null) === folderId)
    .sort((a, b) => {
      if (sort === "name") return a.title.localeCompare(b.title, "ka");
      if (sort === "count") {
        return b.questions.length - a.questions.length || a.title.localeCompare(b.title, "ka");
      }
      return b.createdAt.localeCompare(a.createdAt);
    });
}

export function quizCrumbs(folders: QuizFolderData[], folderId: string | null) {
  const crumbs: { id: string | null; name: string }[] = [{ id: null, name: "All quizzes" }];
  const chain: QuizFolderData[] = [];
  let cursor = folderId;
  const seen = new Set<string>();
  while (cursor && !seen.has(cursor)) {
    seen.add(cursor);
    const folder = folders.find((item) => item.id === cursor);
    if (!folder) break;
    chain.unshift(folder);
    cursor = folder.parentId;
  }
  crumbs.push(...chain.map((folder) => ({ id: folder.id, name: folder.name })));
  return crumbs;
}
