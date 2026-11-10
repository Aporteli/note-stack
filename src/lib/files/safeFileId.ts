export function safeFileId(id: string) {
  return /^[a-z0-9]+$/i.test(id);
}
