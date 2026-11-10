export function fileStem(title: string): string {
  const clean = title.replace(/[^\w\- ]+/g, "").trim();
  return clean || "diagram";
}
