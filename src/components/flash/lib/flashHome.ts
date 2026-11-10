export function flashListHref(folderId?: string | null) {
  if (!folderId) return "/flash-cards";
  return `/flash-cards?folder=${encodeURIComponent(folderId)}`;
}

export function flashTopicHref(topicId: string, folderId?: string | null) {
  const list = flashListHref(folderId);
  const query = list.includes("?") ? list.slice(list.indexOf("?")) : "";
  return `/flash-cards/${topicId}${query}`;
}
