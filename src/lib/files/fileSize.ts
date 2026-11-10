export function fileSize(value: bigint | number) {
  return typeof value === "bigint" ? Number(value) : value;
}
