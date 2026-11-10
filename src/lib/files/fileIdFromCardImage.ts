export function fileIdFromCardImage(image: string | null | undefined) {
  const match = /^\/api\/files\/([a-z0-9]+)$/i.exec(image ?? "");
  return match?.[1] ?? null;
}
