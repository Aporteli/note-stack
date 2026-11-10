export async function loadDocxPreview(id: string) {
  const response = await fetch(`/api/files/${id}/preview`);
  if (!response.ok) throw new Error("preview failed");
  const data = (await response.json()) as { html?: string };
  return data.html ?? "";
}
