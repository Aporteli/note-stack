export function rangedBody(bytes: Buffer, mime: string, rangeHeader: string | null) {
  const size = bytes.length;
  const shared = {
    "Content-Type": mime || "application/octet-stream",
    "Accept-Ranges": "bytes",
  };
  if (!rangeHeader) {
    return new Response(new Uint8Array(bytes), {
      headers: { ...shared, "Content-Length": String(size) },
    });
  }
  const match = /bytes=(\d+)-(\d*)/.exec(rangeHeader);
  if (!match) return new Response(null, { status: 416, headers: shared });
  const start = Number(match[1]);
  const end = match[2] ? Number(match[2]) : Math.min(start + 1024 * 1024 - 1, size - 1);
  if (start >= size || end < start) {
    return new Response(null, { status: 416, headers: { ...shared, "Content-Range": `bytes */${size}` } });
  }
  const last = Math.min(end, size - 1);
  const chunk = bytes.subarray(start, last + 1);
  return new Response(new Uint8Array(chunk), {
    status: 206,
    headers: {
      ...shared,
      "Content-Length": String(chunk.length),
      "Content-Range": `bytes ${start}-${last}/${size}`,
    },
  });
}
