import { convertToHtml } from "mammoth";

export async function docxToHtml(bytes: Buffer) {
  const result = await convertToHtml({ buffer: bytes });
  return result.value;
}
