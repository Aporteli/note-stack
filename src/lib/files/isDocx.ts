export function isDocx(name: string, mime: string) {
  return name.toLowerCase().endsWith(".docx") || mime.includes("wordprocessingml");
}
